// API service for making requests to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const apiService = {
  // Connection management
  async getConnections() {
    const response = await fetch(`${API_BASE_URL}/api/connections`)
    return response.json()
  },

  async createConnection(connectionData) {
    const response = await fetch(`${API_BASE_URL}/api/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(connectionData)
    })
    return response.json()
  },

  async deleteConnection(connectionId) {
    const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}`, {
      method: 'DELETE'
    })
    return response.json()
  },

  // Custom endpoints management
  async getCustomEndpoints(connectionId) {
    const response = await fetch(`${API_BASE_URL}/api/custom?connectionId=${connectionId}`)
    return response.json()
  },

  async createCustomEndpoint(endpointData) {
    const response = await fetch(`${API_BASE_URL}/api/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(endpointData)
    })
    return response.json()
  },

  async deleteCustomEndpoint(endpointId) {
    const response = await fetch(`${API_BASE_URL}/api/custom/${endpointId}`, {
      method: 'DELETE'
    })
    return response.json()
  },

  // ERPNext API requests
  async sendRequest(requestData) {
    const response = await fetch(`${API_BASE_URL}/api/erp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
    return response.json()
  },

  // History management
  async getHistory() {
    const response = await fetch(`${API_BASE_URL}/api/history`)
    return response.json()
  },

  async saveToHistory(historyData) {
    const response = await fetch(`${API_BASE_URL}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historyData)
    })
    return response.json()
  },

  // cURL generation with actual credentials
  async generateCurlWithCredentials(requestData) {
    const response = await fetch(`${API_BASE_URL}/api/erp/generate-curl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
    return response.json()
  }
}
