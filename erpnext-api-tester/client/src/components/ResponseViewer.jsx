import React, { useState } from 'react'

const ResponseViewer = ({ response }) => {
  const [showHeaders, setShowHeaders] = useState(false)
  const formatResponse = (data) => {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2)
    }
    return data
  }

  const getStatusColor = (status) => {
    if (typeof status === 'number') {
      if (status >= 200 && status < 300) return 'text-green-600'
      if (status >= 400 && status < 500) return 'text-yellow-600'
      if (status >= 500) return 'text-red-600'
    }
    if (typeof status === 'string') {
      if (status.toLowerCase() === 'error') return 'text-red-600'
      if (status.toLowerCase() === 'success') return 'text-green-600'
    }
    return 'text-gray-600'
  }

  return (
    <div className="mt-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Response</h2>
          {response.headers && (
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setShowHeaders(!showHeaders)}
            >
              {showHeaders ? 'Hide' : 'Show'} Headers
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {response.status && (
            <div>
              <span className="text-sm font-medium text-gray-700">Status: </span>
              <span className={`font-mono text-sm ${getStatusColor(response.status)}`}>
                {response.status}
              </span>
            </div>
          )}

          {response.duration && (
            <div>
              <span className="text-sm font-medium text-gray-700">Duration: </span>
              <span className="font-mono text-sm text-gray-600">
                {response.duration}ms
              </span>
            </div>
          )}

          {response.connectionName && (
            <div>
              <span className="text-sm font-medium text-gray-700">Connection: </span>
              <span className="font-mono text-sm text-gray-600">
                {response.connectionName}
              </span>
            </div>
          )}

          {response.headers && showHeaders && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Headers:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {formatResponse(response.headers)}
              </pre>
            </div>
          )}

          {(response.data || response.message) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {showHeaders ? 'Data:' : 'Response:'}
              </h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-96">
                {formatResponse(response.data || response.message)}
              </pre>
            </div>
          )}

          {response.error && (
            <div>
              <h3 className="text-sm font-medium text-red-700 mb-2">Error:</h3>
              <pre className="bg-red-50 p-3 rounded text-xs overflow-x-auto max-h-96 text-red-800">
                {formatResponse(response.error)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResponseViewer
