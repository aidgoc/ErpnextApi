import mongoose from 'mongoose';
import { encryptSecret } from '../utils/crypto.js';
import { ENCRYPTION_KEY_BASE64 } from '../utils/env.js';

const connectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  baseUrl: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        try {
          new URL(v);
          return true;
        } catch (error) {
          return false;
        }
      },
      message: 'baseUrl must be a valid URL'
    }
  },
  apiKeyEnc: {
    type: String,
    required: true
  },
  apiSecretEnc: {
    type: String,
    required: true
  },
  apiKeyIvBase64: {
    type: String,
    required: true
  },
  apiKeyTagBase64: {
    type: String,
    required: true
  },
  apiSecretIvBase64: {
    type: String,
    required: true
  },
  apiSecretTagBase64: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual getter for hasSecrets
connectionSchema.virtual('hasSecrets').get(function() {
  return !!(this.apiKeyEnc && this.apiSecretEnc && this.apiKeyIvBase64 && this.apiKeyTagBase64 && this.apiSecretIvBase64 && this.apiSecretTagBase64);
});

// Static method to store secrets with encryption
connectionSchema.statics.createWithSecrets = async function(connectionData) {
  const { name, baseUrl, apiKey, apiSecret } = connectionData;
  
  if (!apiKey || !apiSecret) {
    throw new Error('API key and secret are required');
  }
  
  // Encrypt both API key and secret
  const encryptedKey = encryptSecret(apiKey, ENCRYPTION_KEY_BASE64);
  const encryptedSecret = encryptSecret(apiSecret, ENCRYPTION_KEY_BASE64);
  
  // Create connection with encrypted data
  const connection = new this({
    name,
    baseUrl,
    apiKeyEnc: encryptedKey.cipherTextBase64,
    apiSecretEnc: encryptedSecret.cipherTextBase64,
    apiKeyIvBase64: encryptedKey.ivBase64,
    apiKeyTagBase64: encryptedKey.tagBase64,
    apiSecretIvBase64: encryptedSecret.ivBase64,
    apiSecretTagBase64: encryptedSecret.tagBase64
  });
  
  return await connection.save();
};

// Instance method to get decrypted API key
connectionSchema.methods.getDecryptedApiKey = async function() {
  const { decryptSecret } = await import('../utils/crypto.js');
  return decryptSecret({
    ivBase64: this.apiKeyIvBase64,
    cipherTextBase64: this.apiKeyEnc,
    tagBase64: this.apiKeyTagBase64
  }, ENCRYPTION_KEY_BASE64);
};

// Instance method to get decrypted API secret
connectionSchema.methods.getDecryptedApiSecret = async function() {
  const { decryptSecret } = await import('../utils/crypto.js');
  return decryptSecret({
    ivBase64: this.apiSecretIvBase64,
    cipherTextBase64: this.apiSecretEnc,
    tagBase64: this.apiSecretTagBase64
  }, ENCRYPTION_KEY_BASE64);
};

// Index for better query performance
connectionSchema.index({ name: 1 });
connectionSchema.index({ baseUrl: 1 });
connectionSchema.index({ createdAt: -1 });

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;
