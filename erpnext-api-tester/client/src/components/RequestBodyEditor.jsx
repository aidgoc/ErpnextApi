import React from 'react'
import { generateCustomDocType } from '../utils/docTypeFields'

const RequestBodyEditor = ({ 
  method, 
  endpoint, 
  requestBody, 
  customDocTypeName,
  setCustomDocTypeName,
  documentName,
  setDocumentName,
  onRequestBodyChange,
  onDocumentNameChange
}) => {
  return (
    <div className="space-y-4">
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
              onClick={() => onDocumentNameChange(documentName)}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              disabled={!documentName}
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
                onRequestBodyChange(JSON.stringify(newBody, null, 2))
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
            onChange={(e) => onRequestBodyChange(e.target.value)}
            placeholder='{"field": "value"}'
          />
        </div>
      )}
    </div>
  )
}

export default RequestBodyEditor
