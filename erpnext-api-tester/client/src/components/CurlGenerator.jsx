import React, { useState } from 'react'
import { generateCurlCommand } from '../utils/curlGenerator'
import toast from 'react-hot-toast'

const CurlGenerator = ({ 
  method, 
  endpoint, 
  requestBody, 
  selectedConnection, 
  connections 
}) => {
  const [showCurl, setShowCurl] = useState(false)

  const handleCopyCurl = () => {
    const curlCommand = generateCurlCommand(method, endpoint, requestBody, selectedConnection, connections)
    if (curlCommand && !curlCommand.includes('Please select')) {
      navigator.clipboard.writeText(curlCommand)
      toast.success('cURL command copied to clipboard!')
    } else {
      toast.error('Cannot copy cURL command. Please select a connection and endpoint.')
    }
  }

  const handleDownloadCurl = () => {
    const curlCommand = generateCurlCommand(method, endpoint, requestBody, selectedConnection, connections)
    if (curlCommand && !curlCommand.includes('Please select')) {
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
