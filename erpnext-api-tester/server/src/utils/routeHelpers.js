/**
 * Common route helper utilities
 * Provides reusable functions for common route patterns
 */

import { Connection } from '../models/index.js';
import { notFoundResponse, validationErrorResponse } from './response.js';

/**
 * Validate that a connection exists
 * @param {string} connectionId - The connection ID to validate
 * @returns {Promise<Object>} - { valid: boolean, connection?: Object, response?: Object }
 */
export const validateConnection = async (connectionId) => {
  if (!connectionId) {
    return {
      valid: false,
      response: validationErrorResponse('connectionId is required')
    };
  }

  const connection = await Connection.findById(connectionId);
  if (!connection) {
    return {
      valid: false,
      response: notFoundResponse('Connection')
    };
  }

  return {
    valid: true,
    connection
  };
};

/**
 * Build MongoDB query from request parameters
 * @param {Object} params - Request parameters
 * @param {Object} fieldMappings - Field mappings for query building
 * @returns {Object} - MongoDB query object
 */
export const buildQuery = (params, fieldMappings = {}) => {
  const query = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const fieldName = fieldMappings[key] || key;
      
      if (fieldName.includes('.')) {
        // Handle nested field queries
        query[fieldName] = value;
      } else if (key === 'search' && value) {
        // Handle search functionality
        const searchFields = fieldMappings.searchFields || [];
        if (searchFields.length > 0) {
          query.$or = searchFields.map(field => ({
            [field]: { $regex: value, $options: 'i' }
          }));
        }
      } else if (key === 'startDate' || key === 'endDate') {
        // Handle date range queries
        if (!query.createdAt) query.createdAt = {};
        if (key === 'startDate') query.createdAt.$gte = new Date(value);
        if (key === 'endDate') query.createdAt.$lte = new Date(value);
      } else {
        query[fieldName] = value;
      }
    }
  });
  
  return query;
};

/**
 * Calculate pagination parameters
 * @param {Object} queryParams - Query parameters
 * @param {number} defaultPage - Default page number
 * @param {number} defaultLimit - Default page size
 * @returns {Object} - { skip, limit, page, pageSize }
 */
export const calculatePagination = (queryParams, defaultPage = 1, defaultLimit = 20) => {
  const page = parseInt(queryParams.page) || defaultPage;
  const pageSize = parseInt(queryParams.limit) || defaultLimit;
  const skip = (page - 1) * pageSize;
  
  return { skip, limit: pageSize, page, pageSize };
};

/**
 * Create pagination response object
 * @param {number} page - Current page
 * @param {number} pageSize - Page size
 * @param {number} total - Total count
 * @returns {Object} - Pagination object
 */
export const createPaginationResponse = (page, pageSize, total) => ({
  page,
  pageSize,
  total,
  pages: Math.ceil(total / pageSize)
});

/**
 * Common field mappings for different entity types
 */
export const FIELD_MAPPINGS = {
  history: {
    method: 'request.method',
    docType: 'request.docType',
    status: 'response.status',
    searchFields: ['request.path', 'request.method', 'request.docType']
  },
  customEndpoints: {
    method: 'method',
    searchFields: ['label', 'path', 'notes']
  }
};

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  required: (fields, data) => {
    const missing = fields.filter(field => !data[field]);
    return {
      valid: missing.length === 0,
      missing
    };
  },
  
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};
