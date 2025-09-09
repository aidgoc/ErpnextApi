import React, { useState } from 'react'
import { commonEndpoints } from '../constants/endpoints'
import { validateRequired, isEmpty } from '../utils/common'
import toast from 'react-hot-toast'

const CustomEndpointManager = ({ 
  method, 
  customEndpoints, 
  setCustomEndpoints, 
  onCreateCustomEndpoint,
  onEndpointSelect 
}) => {
  const [showCustomEndpoint, setShowCustomEndpoint] = useState(false)
  const [customEndpoint, setCustomEndpoint] = useState('')

  const addCustomEndpoint = async () => {
    const validation = validateRequired({ customEndpoint }, ['customEndpoint'])
    if (!validation.valid) {
      toast.error('Please enter a custom endpoint')
      return
    }

    const trimmedEndpoint = customEndpoint.trim()
    const newCustomEndpoint = {
      value: trimmedEndpoint,
      label: `Custom: ${trimmedEndpoint}`,
      method: method
    }
    
    // Check if endpoint already exists
    const exists = [...commonEndpoints, ...customEndpoints].some(ep => ep.value === newCustomEndpoint.value)
    if (exists) {
      toast.error('This endpoint already exists')
      return
    }
    
    const result = await onCreateCustomEndpoint({
      label: newCustomEndpoint.label,
      method: newCustomEndpoint.method,
      path: newCustomEndpoint.value
    })

    if (result.success) {
      // Add to local state
      const updatedCustomEndpoints = [...customEndpoints, newCustomEndpoint]
      setCustomEndpoints(updatedCustomEndpoints)
      
      // Set as current endpoint
      onEndpointSelect(newCustomEndpoint.value)
      setShowCustomEndpoint(false)
      setCustomEndpoint('')
      toast.success('Custom endpoint added and selected')
    }
  }

  return (
    <div>
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
    </div>
  )
}

export default CustomEndpointManager
