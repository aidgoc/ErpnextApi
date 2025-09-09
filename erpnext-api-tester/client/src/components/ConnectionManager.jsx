import React, { useState, useCallback } from 'react'
import { useConnections } from '../hooks/useConnections'
import { validateRequired, formatConnectionName } from '../utils/common'

const INITIAL_CONNECTION_STATE = {
  name: '',
  baseUrl: '',
  apiKey: '',
  apiSecret: ''
}

const ConnectionManager = () => {
  const { 
    connections, 
    selectedConnection, 
    setSelectedConnection, 
    loading, 
    createConnection
  } = useConnections()
  
  const [showNewConnection, setShowNewConnection] = useState(false)
  const [newConnection, setNewConnection] = useState(INITIAL_CONNECTION_STATE)

  const handleCreateConnection = useCallback(async () => {
    const validation = validateRequired(newConnection, ['name', 'baseUrl', 'apiKey', 'apiSecret'])
    if (!validation.valid) return

    const result = await createConnection(newConnection)
    if (result.success) {
      setNewConnection(INITIAL_CONNECTION_STATE)
      setShowNewConnection(false)
    }
  }, [newConnection, createConnection])

  const handleInputChange = useCallback((field, value) => {
    setNewConnection(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setNewConnection(INITIAL_CONNECTION_STATE)
    setShowNewConnection(false)
  }, [])

  return (
    <div className="card p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">ERPNext Connection</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Connection
          </label>
          <select 
            className="input"
            value={selectedConnection}
            onChange={(e) => setSelectedConnection(e.target.value)}
          >
            <option value="">Select a connection...</option>
            {connections.map(conn => (
              <option key={conn._id} value={conn._id}>
                {formatConnectionName(conn)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <button 
            className="btn btn-secondary flex-1"
            onClick={() => setShowNewConnection(true)}
          >
            New Connection
          </button>
        </div>

        {showNewConnection && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-900">Create New Connection</h3>
            
            {[
              { field: 'name', label: 'Connection Name', type: 'text', placeholder: 'e.g., Production, Development' },
              { field: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://your-erpnext-instance.com' },
              { field: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Your ERPNext API Key' },
              { field: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Your ERPNext API Secret' }
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  className="input"
                  value={newConnection[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}

            <div className="flex space-x-2">
              <button 
                className="btn btn-primary flex-1"
                onClick={handleCreateConnection}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Connection'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectionManager
