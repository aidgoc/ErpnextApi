import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Connection',
    required: true
  },
  request: {
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
    query: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    docType: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50
    }
  },
  response: {
    status: {
      type: Number,
      required: true,
      min: 100,
      max: 599
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    body: {
      type: String,
      required: true,
      maxlength: 1048576 // 1MB limit
    }
  },
  durationMs: {
    type: Number,
    required: true,
    min: 0
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

// Virtual to check if response was successful
historySchema.virtual('isSuccess').get(function() {
  return this.response.status >= 200 && this.response.status < 300;
});

// Virtual to check if response was an error
historySchema.virtual('isError').get(function() {
  return this.response.status >= 400;
});

// Virtual to get response size in KB
historySchema.virtual('responseSizeKB').get(function() {
  return Math.round((this.response.body.length / 1024) * 100) / 100;
});

// Virtual to get truncated response body for display
historySchema.virtual('responseBodyPreview').get(function() {
  const maxLength = 200;
  if (this.response.body.length <= maxLength) {
    return this.response.body;
  }
  return this.response.body.substring(0, maxLength) + '...';
});

// Static method to create a history entry
historySchema.statics.createEntry = async function(historyData) {
  const { connectionId, request, response, durationMs } = historyData;
  
  // Validate connection exists
  const Connection = mongoose.model('Connection');
  const connection = await Connection.findById(connectionId);
  if (!connection) {
    throw new Error('Connection not found');
  }
  
  // Truncate response body to 1MB if needed
  let responseBody = response.body;
  if (typeof responseBody === 'object') {
    responseBody = JSON.stringify(responseBody);
  }
  if (responseBody.length > 1048576) {
    responseBody = responseBody.substring(0, 1048576) + '... [TRUNCATED]';
  }
  
  const historyEntry = new this({
    connectionId,
    request: {
      method: request.method.toUpperCase(),
      path: request.path,
      query: request.query || {},
      body: request.body || {},
      docType: request.docType || null
    },
    response: {
      status: response.status,
      headers: response.headers || {},
      body: responseBody
    },
    durationMs
  });
  
  return await historyEntry.save();
};

// Static method to get recent history for a connection
historySchema.statics.getRecentHistory = async function(connectionId, limit = 50) {
  return await this.find({ connectionId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('connectionId', 'name baseUrl');
};

// Static method to get history statistics
historySchema.statics.getStats = async function(connectionId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    {
      $match: {
        connectionId: new mongoose.Types.ObjectId(connectionId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        successfulRequests: {
          $sum: {
            $cond: [
              { $and: [{ $gte: ['$response.status', 200] }, { $lt: ['$response.status', 300] }] },
              1,
              0
            ]
          }
        },
        errorRequests: {
          $sum: {
            $cond: [{ $gte: ['$response.status', 400] }, 1, 0]
          }
        },
        avgDuration: { $avg: '$durationMs' },
        minDuration: { $min: '$durationMs' },
        maxDuration: { $max: '$durationMs' }
      }
    }
  ]);
  
  return stats[0] || {
    totalRequests: 0,
    successfulRequests: 0,
    errorRequests: 0,
    avgDuration: 0,
    minDuration: 0,
    maxDuration: 0
  };
};

// Indexes for better query performance
historySchema.index({ connectionId: 1, createdAt: -1 });
historySchema.index({ createdAt: -1 });
historySchema.index({ 'response.status': 1 });
historySchema.index({ 'request.method': 1 });
historySchema.index({ 'request.path': 1 });

const History = mongoose.model('History', historySchema);

export default History;

