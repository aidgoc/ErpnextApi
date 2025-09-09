import React from 'react'
import { useCustomEndpoints } from '../hooks/useCustomEndpoints'
import { useApiTesting } from '../hooks/useApiTesting'
import EndpointSelector from './EndpointSelector'
import CustomEndpointManager from './CustomEndpointManager'
import RequestBodyEditor from './RequestBodyEditor'
import CurlGenerator from './CurlGenerator'

const ApiTester = ({ selectedConnection, connections, onResponse }) => {
  const { 
    customEndpoints, 
    setCustomEndpoints, 
    createCustomEndpoint 
  } = useCustomEndpoints(selectedConnection)

  const {
    method,
    setMethod,
    endpoint,
    setEndpoint,
    requestBody,
    response,
    loading,
    documentName,
    setDocumentName,
    customDocTypeName,
    setCustomDocTypeName,
    handleEndpointSelect,
    handleMethodChange,
    handleRequestBodyChange,
    handleDocumentNameChange,
    sendRequest
  } = useApiTesting(selectedConnection, connections)

  // Update parent component when response changes
  React.useEffect(() => {
    onResponse(response)
  }, [response, onResponse])

  return (
    <div className="card p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">API Testing</h2>
      
      <div className="space-y-4">
        <EndpointSelector
          method={method}
          endpoint={endpoint}
          customEndpoints={customEndpoints}
          onMethodChange={handleMethodChange}
          onEndpointSelect={handleEndpointSelect}
        />

        <CustomEndpointManager
          method={method}
          customEndpoints={customEndpoints}
          setCustomEndpoints={setCustomEndpoints}
          onCreateCustomEndpoint={createCustomEndpoint}
          onEndpointSelect={handleEndpointSelect}
        />

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

        <RequestBodyEditor
          method={method}
          endpoint={endpoint}
          requestBody={requestBody}
          customDocTypeName={customDocTypeName}
          setCustomDocTypeName={setCustomDocTypeName}
          onRequestBodyChange={handleRequestBodyChange}
        />

        <button 
          className="btn btn-primary w-full"
          onClick={sendRequest}
          disabled={loading || !selectedConnection || !endpoint}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>

        <CurlGenerator
          method={method}
          endpoint={endpoint}
          requestBody={requestBody}
          selectedConnection={selectedConnection}
          connections={connections}
        />
      </div>
    </div>
  )
}

export default ApiTester