import React, { useState } from 'react'
import { useConnections } from '../hooks/useConnections'

const ConnectionManager = () => {
  const { 
    connections, 
    selectedConnection, 
    setSelectedConnection, 
    loading, 
    createConnection, 
    deleteConnection 
  } = useConnections()
  
  const [showNewConnection, setShowNewConnection] = useState(false)
  const [newConnection, setNewConnection] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    apiSecret: ''
  })

  const handleCreateConnection = async () => {
    if (!newConnection.name || !newConnection.baseUrl || !newConnection.apiKey || !newConnection.apiSecret) {
      return
    }

    const result = await createConnection(newConnection)
    if (result.success) {
      setNewConnection({ name: '', baseUrl: '', apiKey: '', apiSecret: '' })
      setShowNewConnection(false)
    }
  }

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
                {conn.name} - {conn.baseUrl}
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connection Name
              </label>
              <input
                type="text"
                className="input"
                value={newConnection.name}
                onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
                placeholder="e.g., Production, Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base URL
              </label>
              <input
                type="url"
                className="input"
                value={newConnection.baseUrl}
                onChange={(e) => setNewConnection({...newConnection, baseUrl: e.target.value})}
                placeholder="https://your-erpnext-instance.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="text"
                className="input"
                value={newConnection.apiKey}
                onChange={(e) => setNewConnection({...newConnection, apiKey: e.target.value})}
                placeholder="Your ERPNext API Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Secret
              </label>
              <input
                type="password"
                className="input"
                value={newConnection.apiSecret}
                onChange={(e) => setNewConnection({...newConnection, apiSecret: e.target.value})}
                placeholder="Your ERPNext API Secret"
              />
            </div>

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
                onClick={() => setShowNewConnection(false)}
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
