import React, { useState, useEffect } from 'react'
import { commonEndpoints } from '../constants/endpoints'
import { getDocTypeFields, generateCustomDocType } from '../utils/docTypeFields'
import { generateCurlCommand } from '../utils/curlGenerator'
import { useCustomEndpoints } from '../hooks/useCustomEndpoints'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

const ApiTester = ({ selectedConnection, connections }) => {
  const [method, setMethod] = useState('GET')
  const [endpoint, setEndpoint] = useState('/api/method/ping')
  const [requestBody, setRequestBody] = useState('{"field": "value"}')
  const [response, setResponse] = useState({
    status: 'Ready to test API calls',
    message: 'Select a connection and send a request'
  })
  const [loading, setLoading] = useState(false)
  const [documentName, setDocumentName] = useState('')
  const [customDocTypeName, setCustomDocTypeName] = useState('')
  const [showCurl, setShowCurl] = useState(false)
  const [showCustomEndpoint, setShowCustomEndpoint] = useState(false)
  const [customEndpoint, setCustomEndpoint] = useState('')

  const { 
    customEndpoints, 
    setCustomEndpoints, 
    createCustomEndpoint 
  } = useCustomEndpoints(selectedConnection)

  const handleEndpointSelect = (selectedEndpoint) => {
    // Look in both common and custom endpoints
    const allEndpoints = [...commonEndpoints, ...customEndpoints]
    const endpointData = allEndpoints.find(ep => ep.value === selectedEndpoint)
    if (endpointData) {
      let finalEndpoint = endpointData.value
      
      // Smart endpoint replacement for PUT requests
      if (method === 'PUT' && endpointData.value.includes('{name}')) {
        // If user has entered a document name, use it; otherwise keep placeholder
        if (documentName) {
          finalEndpoint = endpointData.value.replace('{name}', documentName)
        } else {
          finalEndpoint = endpointData.value
        }
      }
      
      setEndpoint(finalEndpoint)
      
      // Set appropriate default request body based on current method and endpoint
      if (method === 'POST' || method === 'PUT') {
        setRequestBody(getDocTypeFields(endpointData.value.split('/').pop(), method, customDocTypeName))
      } else {
        setRequestBody('{"field": "value"}')
      }
    }
  }

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod)
    
    // Update request body based on new method
    if (newMethod === 'POST' || newMethod === 'PUT') {
      const docType = endpoint.split('/').pop()
      setRequestBody(getDocTypeFields(docType, newMethod, customDocTypeName))
    } else {
      setRequestBody('{"field": "value"}')
    }
  }

  const handleRequestBodyChange = (value) => {
    setRequestBody(value)
    
    // Dynamic endpoint update based on request body content
    if (method === 'PUT' && value) {
      try {
        const bodyData = JSON.parse(value)
        
        // Check for common identifier fields
        const identifierFields = ['name', 'email', 'item_code', 'customer_name', 'lead_name']
        const identifierField = identifierFields.find(field => bodyData[field])
        
        if (identifierField && bodyData[identifierField]) {
          const identifier = bodyData[identifierField]
          const encodedIdentifier = encodeURIComponent(identifier)
          
          // Update endpoint if it contains {name} placeholder
          if (endpoint.includes('{name}')) {
            setEndpoint(endpoint.replace('{name}', encodedIdentifier))
          } else {
            // Construct endpoint from scratch if no placeholder
            const basePath = endpoint.split('/').slice(0, -1).join('/')
            setEndpoint(`${basePath}/${encodedIdentifier}`)
          }
        }
      } catch (error) {
        // Invalid JSON, ignore
      }
    }
  }

  const handleDocumentNameChange = async (name) => {
    if (!name || !selectedConnection) return
    
    setDocumentName(name)
    
    // For PUT requests, try to find the exact document name
    if (method === 'PUT') {
      try {
        const connection = connections.find(conn => conn._id === selectedConnection)
        if (connection) {
          // Try to find the document by searching
          const searchResponse = await apiService.sendRequest({
            connectionId: selectedConnection,
            method: 'GET',
            path: endpoint.replace('{name}', name).split('/').slice(0, -1).join('/'),
            query: { filters: [['name', 'like', `%${name}%`]] }
          })
          
          if (searchResponse.ok && searchResponse.data.data && searchResponse.data.data.length > 0) {
            const exactName = searchResponse.data.data[0].name
            const encodedName = encodeURIComponent(exactName)
            setEndpoint(endpoint.replace('{name}', encodedName))
            setRequestBody(prev => {
              try {
                const bodyData = JSON.parse(prev)
                bodyData.name = exactName
                return JSON.stringify(bodyData, null, 2)
              } catch {
                return prev
              }
            })
          }
        }
      } catch (error) {
        console.error('Error finding document:', error)
      }
    }
  }

  const addCustomEndpoint = async () => {
    if (customEndpoint.trim()) {
      const newCustomEndpoint = {
        value: customEndpoint.trim(),
        label: `Custom: ${customEndpoint.trim()}`,
        method: method
      }
      
      // Check if endpoint already exists
      const exists = [...commonEndpoints, ...customEndpoints].some(ep => ep.value === newCustomEndpoint.value)
      if (exists) {
        toast.error('This endpoint already exists')
        return
      }
      
      const result = await createCustomEndpoint({
        label: newCustomEndpoint.label,
        method: newCustomEndpoint.method,
        path: newCustomEndpoint.value
      })

      if (result.success) {
        // Add to local state
        const updatedCustomEndpoints = [...customEndpoints, newCustomEndpoint]
        setCustomEndpoints(updatedCustomEndpoints)
        
        // Set as current endpoint
        setEndpoint(newCustomEndpoint.value)
        setShowCustomEndpoint(false)
        setCustomEndpoint('')
        toast.success('Custom endpoint added and selected')
      }
    } else {
      toast.error('Please enter a custom endpoint')
    }
  }

  const sendRequest = async () => {
    if (!selectedConnection) {
      toast.error('Please select a connection')
      return
    }

    if (!endpoint) {
      toast.error('Please select an endpoint')
      return
    }

    setLoading(true)
    try {
      const requestData = {
        connectionId: selectedConnection,
        method: method,
        path: endpoint,
        query: method === 'GET' ? {} : undefined,
        body: method !== 'GET' ? JSON.parse(requestBody) : undefined
      }

      const res = await apiService.sendRequest(requestData)
      
      if (res.ok) {
        setResponse({
          status: res.data.status,
          headers: res.data.headers,
          data: res.data.data,
          duration: res.data.durationMs,
          connectionName: res.data.connectionName
        })
        toast.success('Request sent successfully')
      } else {
        setResponse({
          status: 'Error',
          message: res.message,
          error: res.error
        })
        toast.error(res.message)
      }
    } catch (error) {
      const errorResponse = {
        status: 'Error',
        message: error.response?.data?.message || error.message,
        error: error.response?.data || error.message
      }
      setResponse(errorResponse)
      toast.error('Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">API Testing</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Method
            </label>
            <select 
              className="input"
              value={method}
              onChange={(e) => handleMethodChange(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Endpoint
            </label>
            <select 
              className="input"
              onChange={(e) => handleEndpointSelect(e.target.value)}
            >
              <option value="">Select an endpoint...</option>
              {[...commonEndpoints, ...customEndpoints]
                .filter(ep => ep.method === method)
                .map(ep => (
                  <option key={ep.value} value={ep.value}>
                    {ep.label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {!showCustomEndpoint ? (
          <div className="flex space-x-2">
            <button 
              className="btn btn-secondary flex-1"
              onClick={() => setShowCustomEndpoint(true)}
            >
              Add Custom Endpoint
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Endpoint
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="input flex-1"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="/api/resource/YourCustomDocType"
              />
              <button 
                className="btn btn-primary"
                onClick={addCustomEndpoint}
              >
                Add
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCustomEndpoint(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Endpoint
          </label>
          <input
            type="text"
            className="input"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="/api/method/ping"
          />
        </div>

        {method === 'PUT' && endpoint.includes('{name}') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Identifier (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Manoj Yadav, john.doe@example.com, ITEM-001, LEAD-001"
              />
              <button
                type="button"
                onClick={() => handleDocumentNameChange(documentName)}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                disabled={!documentName || !selectedConnection}
              >
                Find & Update
              </button>
            </div>
          </div>
        )}

        {method === 'POST' && endpoint === '/api/resource/Custom DocType' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom DocType Name
            </label>
            <input
              type="text"
              className="input"
              value={customDocTypeName}
              onChange={(e) => {
                setCustomDocTypeName(e.target.value)
                // Regenerate request body with new name
                if (e.target.value) {
                  const newBody = generateCustomDocType(e.target.value)
                  setRequestBody(JSON.stringify(newBody, null, 2))
                }
              }}
              placeholder="e.g., Crane Details, Project Tasks, Equipment"
            />
          </div>
        )}

        {(method === 'POST' || method === 'PUT') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Body (JSON)
            </label>
            <textarea
              className="input min-h-[120px] resize-none"
              value={requestBody}
              onChange={(e) => handleRequestBodyChange(e.target.value)}
              placeholder='{"field": "value"}'
            />
          </div>
        )}

        <button 
          className="btn btn-primary w-full"
          onClick={sendRequest}
          disabled={loading || !selectedConnection || !endpoint}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>

        {/* cURL Code Generator */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              cURL Command
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setShowCurl(!showCurl)}
            >
              {showCurl ? 'Hide' : 'Show'} cURL
            </button>
          </div>
          
          {showCurl && (
            <div className="bg-gray-100 p-3 rounded-md">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                {generateCurlCommand(method, endpoint, requestBody, selectedConnection, connections) || 'Select a connection and endpoint to generate cURL command'}
              </pre>
              <div className="mt-2 flex space-x-2">
                <button
                  type="button"
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  onClick={() => {
                    const curlCommand = generateCurlCommand(method, endpoint, requestBody, selectedConnection, connections)
                    if (curlCommand) {
                      navigator.clipboard.writeText(curlCommand)
                      toast.success('cURL command copied to clipboard!')
                    }
                  }}
                >
                  Copy cURL
                </button>
                <button
                  type="button"
                  className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                  onClick={() => {
                    const curlCommand = generateCurlCommand(method, endpoint, requestBody, selectedConnection, connections)
                    if (curlCommand) {
                      const blob = new Blob([curlCommand], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'curl-command.txt'
                      a.click()
                      URL.revokeObjectURL(url)
                      toast.success('cURL command downloaded!')
                    }
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApiTester
