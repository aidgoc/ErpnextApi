import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import ConnectionManager from './components/ConnectionManager'
import ApiTester from './components/ApiTester'
import ResponseViewer from './components/ResponseViewer'
import { useConnections } from './hooks/useConnections'

function App() {
  const { connections, selectedConnection } = useConnections()
  const [response, setResponse] = useState({
    status: 'Ready to test API calls',
    message: 'Select a connection and send a request'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ERPNext API Tester</h1>
          <div className="mt-2 flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Connected</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Connection Management */}
          <div>
            <ConnectionManager />
          </div>

          {/* Right Column - API Testing */}
          <div>
            <ApiTester 
              selectedConnection={selectedConnection}
              connections={connections}
              onResponse={setResponse}
            />
          </div>
        </div>

        {/* Response Panel - Full Width */}
        <ResponseViewer response={response} />
      </div>
    </div>
  )
}

export default App