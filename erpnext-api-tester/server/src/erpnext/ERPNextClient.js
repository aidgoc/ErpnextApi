import axios from 'axios';

/**
 * ERPNext API Client
 * Handles authentication and API communication with ERPNext instances
 */
class ERPNextClient {
  /**
   * Constructor for ERPNextClient
   * @param {Object} config - Configuration object
   * @param {string} config.baseUrl - Base URL of the ERPNext instance
   * @param {string} config.apiKey - API Key for authentication
   * @param {string} config.apiSecret - API Secret for authentication
   */
  constructor({ baseUrl, apiKey, apiSecret }) {
    if (!baseUrl || !apiKey || !apiSecret) {
      throw new Error('baseUrl, apiKey, and apiSecret are required');
    }

    // Ensure baseUrl doesn't have trailing slash
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `token ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000, // 30 second timeout
      validateStatus: function (status) {
        // Accept all status codes to handle them manually
        return status >= 200 && status < 600;
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 ERPNext API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ ERPNext API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ ERPNext API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ ERPNext API Response Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Ping the ERPNext instance to check connectivity
   * Tries /api/method/ping first, falls back to /api/resource/DocType if 404
   * @returns {Promise<boolean>} True if connection is successful
   */
  async ping() {
    try {
      // First try the ping endpoint
      const pingResponse = await this.client.get('/api/method/ping');
      
      if (pingResponse.status === 200) {
        console.log('✅ ERPNext ping successful via /api/method/ping');
        return true;
      }
    } catch (error) {
      // If ping fails with 404, try the fallback
      if (error.response?.status === 404) {
        console.log('⚠️ /api/method/ping not available, trying fallback...');
        
        try {
          const fallbackResponse = await this.client.get('/api/resource/DocType?limit=1');
          
          if (fallbackResponse.status === 200) {
            console.log('✅ ERPNext ping successful via /api/resource/DocType fallback');
            return true;
          }
        } catch (fallbackError) {
          console.error('❌ ERPNext ping failed on both endpoints:', fallbackError.message);
          return false;
        }
      } else {
        console.error('❌ ERPNext ping failed:', error.message);
        return false;
      }
    }

    return false;
  }

  /**
   * List all available DocTypes in the ERPNext instance
   * @param {number} limit - Maximum number of DocTypes to retrieve (default: 2000)
   * @returns {Promise<string[]>} Array of DocType names
   */
  async listDocTypes(limit = 2000) {
    try {
      const response = await this.client.get(
        `/api/resource/DocType?fields=["name"]&limit_page_length=${limit}`
      );

      if (response.status === 200 && response.data && response.data.data) {
        const docTypes = response.data.data.map(item => item.name);
        console.log(`✅ Retrieved ${docTypes.length} DocTypes`);
        return docTypes;
      } else {
        console.error('❌ Failed to retrieve DocTypes:', response.status, response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error listing DocTypes:', error.message);
      return [];
    }
  }

  /**
   * Send a raw request to the ERPNext API
   * @param {Object} requestConfig - Request configuration
   * @param {string} requestConfig.method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} requestConfig.path - API path (must start with /api/)
   * @param {Object} [requestConfig.query] - Query parameters
   * @param {Object} [requestConfig.body] - Request body
   * @returns {Promise<Object>} Response object with status, headers, data, and durationMs
   */
  async sendRaw({ method, path, query, body }) {
    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!validMethods.includes(method.toUpperCase())) {
      throw new Error(`Invalid method: ${method}. Must be one of: ${validMethods.join(', ')}`);
    }

    // Validate path starts with /api/
    if (!path.startsWith('/api/')) {
      throw new Error('Path must start with /api/');
    }

    const startTime = Date.now();
    
    try {
      const config = {
        method: method.toUpperCase(),
        url: path,
        params: query || {},
        data: body || undefined
      };

      const response = await this.client(config);
      const durationMs = Date.now() - startTime;

      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
        durationMs
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        return {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
          durationMs,
          error: error.message
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          status: 0,
          headers: {},
          data: null,
          durationMs,
          error: 'No response received from server'
        };
      } else {
        // Something else happened
        return {
          status: 0,
          headers: {},
          data: null,
          durationMs,
          error: error.message
        };
      }
    }
  }

  /**
   * Get information about the ERPNext instance
   * @returns {Promise<Object>} Instance information
   */
  async getInstanceInfo() {
    try {
      const response = await this.sendRaw({
        method: 'GET',
        path: '/api/method/frappe.utils.change_log.get_versions'
      });

      if (response.status === 200) {
        return {
          baseUrl: this.baseUrl,
          connected: true,
          version: response.data?.message || 'Unknown',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          baseUrl: this.baseUrl,
          connected: false,
          error: response.error || 'Failed to get instance info',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        baseUrl: this.baseUrl,
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test the connection and return detailed status
   * @returns {Promise<Object>} Connection test results
   */
  async testConnection() {
    const startTime = Date.now();
    
    try {
      const pingResult = await this.ping();
      const docTypes = await this.listDocTypes(10); // Get just a few for testing
      const instanceInfo = await this.getInstanceInfo();
      
      const durationMs = Date.now() - startTime;
      
      return {
        success: pingResult,
        ping: pingResult,
        docTypesCount: docTypes.length,
        sampleDocTypes: docTypes.slice(0, 5),
        instanceInfo,
        durationMs,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default ERPNextClient;

