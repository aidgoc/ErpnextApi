import { useState } from 'react'
import { getDocTypeFields, generateCustomDocType } from '../utils/docTypeFields'
import { apiService } from '../services/apiService'
import { commonEndpoints } from '../constants/endpoints'
import { safeJsonParse, safeJsonStringify, validateRequired, handleError } from '../utils/common'
import toast from 'react-hot-toast'

export const useApiTesting = (selectedConnection, connections, customEndpoints = []) => {
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
      const bodyData = safeJsonParse(value, {})
      
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
              const bodyData = safeJsonParse(prev, {})
              bodyData.name = exactName
              return safeJsonStringify(bodyData, prev)
            })
          }
        }
      } catch (error) {
        console.error('Error finding document:', error)
      }
    }
  }

  const sendRequest = async () => {
    const validation = validateRequired({ selectedConnection, endpoint }, ['selectedConnection', 'endpoint'])
    if (!validation.valid) {
      toast.error(`Please ${validation.missing.includes('selectedConnection') ? 'select a connection' : 'select an endpoint'}`)
      return
    }

    setLoading(true)
    try {
      const requestData = {
        connectionId: selectedConnection,
        method: method,
        path: endpoint,
        query: method === 'GET' ? {} : undefined,
        body: method !== 'GET' ? safeJsonParse(requestBody, {}) : undefined
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
      const errorResult = handleError(error, 'Request failed')
      setResponse({
        status: 'Error',
        message: errorResult.error,
        error: errorResult.error
      })
      toast.error('Request failed')
    } finally {
      setLoading(false)
    }
  }

  return {
    method,
    setMethod,
    endpoint,
    setEndpoint,
    requestBody,
    setRequestBody,
    response,
    setResponse,
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
  }
}
