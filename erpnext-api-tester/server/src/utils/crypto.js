import crypto from 'crypto';

/**
 * Encrypt a secret string using AES-256-GCM
 * @param {string} plain - The plain text to encrypt
 * @param {string} keyBase64 - Base64 encoded encryption key (32 bytes)
 * @returns {Object} Object containing ivBase64, cipherTextBase64, and tagBase64
 */
export function encryptSecret(plain, keyBase64) {
  try {
    // Decode the base64 key
    const key = Buffer.from(keyBase64, 'base64');
    
    // Generate a random initialization vector (12 bytes for GCM)
    const iv = crypto.randomBytes(12);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from('erpnext-api-tester', 'utf8')); // Additional authenticated data
    
    // Encrypt the plain text
    let cipherText = cipher.update(plain, 'utf8', 'base64');
    cipherText += cipher.final('base64');
    
    // Get the authentication tag
    const tag = cipher.getAuthTag();
    
    return {
      ivBase64: iv.toString('base64'),
      cipherTextBase64: cipherText,
      tagBase64: tag.toString('base64')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt a secret string using AES-256-GCM
 * @param {Object} payload - Object containing ivBase64, cipherTextBase64, and tagBase64
 * @param {string} keyBase64 - Base64 encoded encryption key (32 bytes)
 * @returns {string} The decrypted plain text
 */
export function decryptSecret(payload, keyBase64) {
  try {
    const { ivBase64, cipherTextBase64, tagBase64 } = payload;
    
    // Decode the base64 key
    const key = Buffer.from(keyBase64, 'base64');
    
    // Decode the base64 components
    const iv = Buffer.from(ivBase64, 'base64');
    const cipherText = Buffer.from(cipherTextBase64, 'base64');
    const tag = Buffer.from(tagBase64, 'base64');
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(Buffer.from('erpnext-api-tester', 'utf8')); // Additional authenticated data
    decipher.setAuthTag(tag);
    
    // Decrypt the cipher text
    let plainText = decipher.update(cipherText, null, 'utf8');
    plainText += decipher.final('utf8');
    
    return plainText;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Generate a random 32-byte key and return it as base64
 * @returns {string} Base64 encoded random key
 */
export function generateEncryptionKey() {
  const key = crypto.randomBytes(32);
  return key.toString('base64');
}

/**
 * Validate that a base64 string represents a 32-byte key
 * @param {string} keyBase64 - Base64 encoded key to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateEncryptionKey(keyBase64) {
  try {
    const key = Buffer.from(keyBase64, 'base64');
    return key.length === 32;
  } catch (error) {
    return false;
  }
}
