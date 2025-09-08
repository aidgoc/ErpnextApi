import mongoose from 'mongoose';

const savedRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    uppercase: true
  },
  docType: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
    default: null
  },
  path: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  query: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  body: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

// Virtual to get the full URL (baseUrl + path)
savedRequestSchema.virtual('fullUrl').get(function() {
  // This would need to be populated with the connection's baseUrl
  return this.path; // For now, just return the path
});

// Virtual to check if request has a body
savedRequestSchema.virtual('hasBody').get(function() {
  return Object.keys(this.body || {}).length > 0;
});

// Virtual to check if request has query parameters
savedRequestSchema.virtual('hasQuery').get(function() {
  return Object.keys(this.query || {}).length > 0;
});

// Static method to create a saved request
savedRequestSchema.statics.createRequest = async function(requestData) {
  const { name, connectionId, method, docType, path, query, body } = requestData;
  
  // Validate connection exists
  const Connection = mongoose.model('Connection');
  const connection = await Connection.findById(connectionId);
  if (!connection) {
    throw new Error('Connection not found');
  }
  
  const savedRequest = new this({
    name,
    connectionId,
    method: method.toUpperCase(),
    docType: docType || null,
    path,
    query: query || {},
    body: body || {}
  });
  
  return await savedRequest.save();
};

// Instance method to execute the request (placeholder)
savedRequestSchema.methods.execute = async function() {
  // This would integrate with the actual API execution logic
  return {
    method: this.method,
    path: this.path,
    query: this.query,
    body: this.body,
    docType: this.docType
  };
};

// Indexes for better query performance
savedRequestSchema.index({ connectionId: 1 });
savedRequestSchema.index({ name: 1 });
savedRequestSchema.index({ method: 1 });
savedRequestSchema.index({ docType: 1 });
savedRequestSchema.index({ createdAt: -1 });
savedRequestSchema.index({ connectionId: 1, name: 1 }, { unique: true });

const SavedRequest = mongoose.model('SavedRequest', savedRequestSchema);

export default SavedRequest;

