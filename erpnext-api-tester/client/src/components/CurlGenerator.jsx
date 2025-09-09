import React, { useState, useEffect } from 'react'
import { generateCurlCommand } from '../utils/curlGenerator'
import { apiService } from '../services/apiService'
import { isEmpty, safeJsonParse } from '../utils/common'
import toast from 'react-hot-toast'

const CurlGenerator = ({ 
  method, 
  endpoint, 
  requestBody, 
  selectedConnection, 
  connections 
}) => {
  const [showCurl, setShowCurl] = useState(false)
  const [useCredentials, setUseCredentials] = useState(false)
  const [curlCommand, setCurlCommand] = useState('')
  const [loading, setLoading] = useState(false)

  const getCurlCommand = async () => {
    if (useCredentials) {
      if (!selectedConnection || !endpoint) {
        return 'Please select a connection and endpoint to generate cURL command'
      }
      
      setLoading(true)
      try {
        const requestData = {
          connectionId: selectedConnection,
          method: method,
          path: endpoint,
          query: method === 'GET' ? {} : undefined,
          body: ['POST', 'PUT', 'PATCH'].includes(method) ? safeJsonParse(requestBody, {}) : undefined
        }
        
        const response = await apiService.generateCurlWithCredentials(requestData)
        if (response.ok) {
          setCurlCommand(response.data.curlCommand)
          return response.data.curlCommand
        } else {
          toast.error('Failed to generate cURL with credentials')
          return 'Failed to generate cURL command'
        }
      } catch (error) {
        toast.error('Error generating cURL command')
        return 'Error generating cURL command'
      } finally {
        setLoading(false)
      }
    } else {
      const command = generateCurlCommand(method, endpoint, requestBody, selectedConnection, connections)
      setCurlCommand(command)
      return command
    }
  }

  // Generate cURL command when dependencies change
  useEffect(() => {
    if (showCurl) {
      getCurlCommand()
    }
  }, [method, endpoint, requestBody, selectedConnection, useCredentials, showCurl])

  const isValidCurlCommand = (command) => {
    return command && !command.includes('Please select') && !command.includes('Connection not found') && !command.includes('Failed to generate')
  }

  const handleCopyCurl = () => {
    if (isValidCurlCommand(curlCommand)) {
      navigator.clipboard.writeText(curlCommand)
      toast.success('cURL command copied to clipboard!')
    } else {
      toast.error('Cannot copy cURL command. Please select a connection and endpoint.')
    }
  }

  const handleDownloadCurl = () => {
    if (isValidCurlCommand(curlCommand)) {
      const blob = new Blob([curlCommand], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'curl-command.txt'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('cURL command downloaded!')
    } else {
      toast.error('Cannot download cURL command. Please select a connection and endpoint.')
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          cURL Command
        </label>
        <div className="flex items-center space-x-2">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={useCredentials}
              onChange={(e) => setUseCredentials(e.target.checked)}
              className="mr-1"
            />
            Use actual credentials
          </label>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setShowCurl(!showCurl)}
          >
            {showCurl ? 'Hide' : 'Show'} cURL
          </button>
        </div>
      </div>
      
      {showCurl && (
        <div className="bg-gray-100 p-3 rounded-md">
          {useCredentials && (
            <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-800">
              ⚠️ <strong>Security Warning:</strong> This cURL command contains your actual API credentials. 
              Only use this in secure environments and never share it publicly.
            </div>
          )}
          <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
            {loading ? 'Generating cURL command...' : (curlCommand || 'Select a connection and endpoint to generate cURL command')}
          </pre>
          <div className="mt-2 flex space-x-2">
            <button
              type="button"
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              onClick={handleCopyCurl}
            >
              Copy cURL
            </button>
            <button
              type="button"
              className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
              onClick={handleDownloadCurl}
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CurlGenerator
