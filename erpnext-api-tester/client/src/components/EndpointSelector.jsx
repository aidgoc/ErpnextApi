import React from 'react'
import { commonEndpoints } from '../constants/endpoints'

const EndpointSelector = ({ 
  method, 
  endpoint, 
  customEndpoints, 
  onMethodChange, 
  onEndpointSelect 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Method
        </label>
        <select 
          className="input"
          value={method}
          onChange={(e) => onMethodChange(e.target.value)}
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
          onChange={(e) => onEndpointSelect(e.target.value)}
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
  )
}

export default EndpointSelector
