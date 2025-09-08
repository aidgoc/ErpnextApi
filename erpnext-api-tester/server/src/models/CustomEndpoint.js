import mongoose from 'mongoose';

const customEndpointSchema = new mongoose.Schema({
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
    required: true
  },
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    uppercase: true
  },
  path: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    required: false,
    trim: true,
    maxlength: 1000,
    default: null
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
customEndpointSchema.virtual('fullUrl').get(function() {
  // This would need to be populated with the connection's baseUrl
  return this.path; // For now, just return the path
});

// Virtual to check if endpoint has notes
customEndpointSchema.virtual('hasNotes').get(function() {
  return !!(this.notes && this.notes.trim().length > 0);
});

// Virtual to get a display name for the endpoint
customEndpointSchema.virtual('displayName').get(function() {
  return `${this.method} ${this.path}`;
});

// Static method to create a custom endpoint
customEndpointSchema.statics.createEndpoint = async function(endpointData) {
  const { connectionId, label, method, path, notes } = endpointData;
  
  // Validate connection exists
  const Connection = mongoose.model('Connection');
  const connection = await Connection.findById(connectionId);
  if (!connection) {
    throw new Error('Connection not found');
  }
  
  // Check for duplicate endpoint (same connection, method, and path)
  const existingEndpoint = await this.findOne({
    connectionId,
    method: method.toUpperCase(),
    path
  });
  
  if (existingEndpoint) {
    throw new Error('Endpoint with this method and path already exists for this connection');
  }
  
  const customEndpoint = new this({
    connectionId,
    label,
    method: method.toUpperCase(),
    path,
    notes: notes || null
  });
  
  return await customEndpoint.save();
};

// Static method to get endpoints for a connection
customEndpointSchema.statics.getByConnection = async function(connectionId) {
  return await this.find({ connectionId })
    .sort({ method: 1, path: 1 })
    .populate('connectionId', 'name baseUrl');
};

// Static method to search endpoints
customEndpointSchema.statics.search = async function(connectionId, searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return await this.find({
    connectionId,
    $or: [
      { label: regex },
      { path: regex },
      { notes: regex }
    ]
  })
  .sort({ method: 1, path: 1 })
  .populate('connectionId', 'name baseUrl');
};

// Instance method to execute the endpoint (placeholder)
customEndpointSchema.methods.execute = async function() {
  // This would integrate with the actual API execution logic
  return {
    method: this.method,
    path: this.path,
    label: this.label,
    notes: this.notes
  };
};

// Instance method to get usage statistics
customEndpointSchema.methods.getUsageStats = async function(days = 30) {
  const History = mongoose.model('History');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await History.aggregate([
    {
      $match: {
        connectionId: this.connectionId,
        'request.method': this.method,
        'request.path': this.path,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        successfulCalls: {
          $sum: {
            $cond: [
              { $and: [{ $gte: ['$response.status', 200] }, { $lt: ['$response.status', 300] }] },
              1,
              0
            ]
          }
        },
        avgDuration: { $avg: '$durationMs' }
      }
    }
  ]);
  
  return stats[0] || {
    totalCalls: 0,
    successfulCalls: 0,
    avgDuration: 0
  };
};

// Indexes for better query performance
customEndpointSchema.index({ connectionId: 1 });
customEndpointSchema.index({ connectionId: 1, method: 1, path: 1 }, { unique: true });
customEndpointSchema.index({ label: 1 });
customEndpointSchema.index({ method: 1 });
customEndpointSchema.index({ createdAt: -1 });

const CustomEndpoint = mongoose.model('CustomEndpoint', customEndpointSchema);

export default CustomEndpoint;

