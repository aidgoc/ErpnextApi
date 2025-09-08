import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'

function App() {
  const [connections, setConnections] = useState([])
  const [selectedConnection, setSelectedConnection] = useState('')
  const [endpoint, setEndpoint] = useState('/api/method/ping')
  const [method, setMethod] = useState('GET')
  const [requestBody, setRequestBody] = useState('{"field": "value"}')
  const [response, setResponse] = useState({
    status: 'Ready to test API calls',
    message: 'Select a connection and send a request'
  })
  const [loading, setLoading] = useState(false)
  const [documentName, setDocumentName] = useState('')
  
  // Endpoint management
  const [showCustomEndpoint, setShowCustomEndpoint] = useState(false)
  const [customEndpoint, setCustomEndpoint] = useState('')
  const [customEndpoints, setCustomEndpoints] = useState([])
  
  // Common ERPNext endpoints
  const commonEndpoints = [
    // GET endpoints
    { value: '/api/method/ping', label: 'Ping (Health Check)', method: 'GET' },
    { value: '/api/resource/DocType', label: 'DocType List', method: 'GET' },
    { value: '/api/resource/User', label: 'User List', method: 'GET' },
    { value: '/api/resource/Customer', label: 'Customer List', method: 'GET' },
    { value: '/api/resource/Item', label: 'Item List', method: 'GET' },
    { value: '/api/resource/Sales Invoice', label: 'Sales Invoice List', method: 'GET' },
    { value: '/api/resource/Purchase Invoice', label: 'Purchase Invoice List', method: 'GET' },
    { value: '/api/resource/Quotation', label: 'Quotation List', method: 'GET' },
    { value: '/api/resource/Sales Order', label: 'Sales Order List', method: 'GET' },
    { value: '/api/resource/Purchase Order', label: 'Purchase Order List', method: 'GET' },
    { value: '/api/resource/Lead', label: 'Lead List', method: 'GET' },
    { value: '/api/resource/Opportunity', label: 'Opportunity List', method: 'GET' },
    { value: '/api/resource/Contact', label: 'Contact List', method: 'GET' },
    { value: '/api/resource/Address', label: 'Address List', method: 'GET' },
    { value: '/api/resource/Company', label: 'Company List', method: 'GET' },
    { value: '/api/resource/Warehouse', label: 'Warehouse List', method: 'GET' },
    { value: '/api/resource/Stock Entry', label: 'Stock Entry List', method: 'GET' },
    { value: '/api/resource/Delivery Note', label: 'Delivery Note List', method: 'GET' },
    { value: '/api/resource/Purchase Receipt', label: 'Purchase Receipt List', method: 'GET' },
    { value: '/api/resource/Journal Entry', label: 'Journal Entry List', method: 'GET' },
    { value: '/api/resource/Account', label: 'Account List', method: 'GET' },
    { value: '/api/resource/Cost Center', label: 'Cost Center List', method: 'GET' },
    { value: '/api/resource/Project', label: 'Project List', method: 'GET' },
    { value: '/api/resource/Task', label: 'Task List', method: 'GET' },
    { value: '/api/resource/ToDo', label: 'ToDo List', method: 'GET' },
    { value: '/api/resource/Event', label: 'Event List', method: 'GET' },
    { value: '/api/resource/Communication', label: 'Communication List', method: 'GET' },
    { value: '/api/resource/File', label: 'File List', method: 'GET' },
    { value: '/api/resource/Version', label: 'Version List', method: 'GET' },
    { value: '/api/resource/Error Log', label: 'Error Log List', method: 'GET' },
    { value: '/api/method/frappe.auth.get_logged_user', label: 'Get Logged User', method: 'GET' },
    
    // POST endpoints
    { value: '/api/resource/DocType', label: 'Create DocType', method: 'POST' },
    { value: '/api/resource/User', label: 'Create User', method: 'POST' },
    { value: '/api/resource/Customer', label: 'Create Customer', method: 'POST' },
    { value: '/api/resource/Item', label: 'Create Item', method: 'POST' },
    { value: '/api/resource/Sales Invoice', label: 'Create Sales Invoice', method: 'POST' },
    { value: '/api/resource/Purchase Invoice', label: 'Create Purchase Invoice', method: 'POST' },
    { value: '/api/resource/Quotation', label: 'Create Quotation', method: 'POST' },
    { value: '/api/resource/Sales Order', label: 'Create Sales Order', method: 'POST' },
    { value: '/api/resource/Purchase Order', label: 'Create Purchase Order', method: 'POST' },
    { value: '/api/resource/Lead', label: 'Create Lead', method: 'POST' },
    { value: '/api/resource/Opportunity', label: 'Create Opportunity', method: 'POST' },
    { value: '/api/resource/Contact', label: 'Create Contact', method: 'POST' },
    { value: '/api/resource/Address', label: 'Create Address', method: 'POST' },
    { value: '/api/resource/Company', label: 'Create Company', method: 'POST' },
    { value: '/api/resource/Warehouse', label: 'Create Warehouse', method: 'POST' },
    { value: '/api/resource/Stock Entry', label: 'Create Stock Entry', method: 'POST' },
    { value: '/api/resource/Delivery Note', label: 'Create Delivery Note', method: 'POST' },
    { value: '/api/resource/Purchase Receipt', label: 'Create Purchase Receipt', method: 'POST' },
    { value: '/api/resource/Journal Entry', label: 'Create Journal Entry', method: 'POST' },
    { value: '/api/resource/Account', label: 'Create Account', method: 'POST' },
    { value: '/api/resource/Cost Center', label: 'Create Cost Center', method: 'POST' },
    { value: '/api/resource/Project', label: 'Create Project', method: 'POST' },
    { value: '/api/resource/Task', label: 'Create Task', method: 'POST' },
    { value: '/api/resource/ToDo', label: 'Create ToDo', method: 'POST' },
    { value: '/api/resource/Event', label: 'Create Event', method: 'POST' },
    { value: '/api/resource/Communication', label: 'Create Communication', method: 'POST' },
    { value: '/api/resource/File', label: 'Create File', method: 'POST' },
    { value: '/api/method/frappe.client.get_value', label: 'Get Value', method: 'POST' },
    { value: '/api/method/frappe.client.set_value', label: 'Set Value', method: 'POST' },
    { value: '/api/method/frappe.client.insert', label: 'Insert Document', method: 'POST' },
    { value: '/api/method/frappe.client.update', label: 'Update Document', method: 'POST' },
    { value: '/api/method/frappe.client.delete', label: 'Delete Document', method: 'POST' },
    
    // PUT endpoints
    { value: '/api/resource/DocType/{name}', label: 'Update DocType', method: 'PUT' },
    { value: '/api/resource/User/{name}', label: 'Update User', method: 'PUT' },
    { value: '/api/resource/Customer/{name}', label: 'Update Customer', method: 'PUT' },
    { value: '/api/resource/Item/{name}', label: 'Update Item', method: 'PUT' },
    { value: '/api/resource/Sales Invoice/{name}', label: 'Update Sales Invoice', method: 'PUT' },
    { value: '/api/resource/Purchase Invoice/{name}', label: 'Update Purchase Invoice', method: 'PUT' },
    { value: '/api/resource/Quotation/{name}', label: 'Update Quotation', method: 'PUT' },
    { value: '/api/resource/Sales Order/{name}', label: 'Update Sales Order', method: 'PUT' },
    { value: '/api/resource/Purchase Order/{name}', label: 'Update Purchase Order', method: 'PUT' },
    { value: '/api/resource/Lead/{name}', label: 'Update Lead', method: 'PUT' },
    { value: '/api/resource/Opportunity/{name}', label: 'Update Opportunity', method: 'PUT' },
    { value: '/api/resource/Contact/{name}', label: 'Update Contact', method: 'PUT' },
    { value: '/api/resource/Address/{name}', label: 'Update Address', method: 'PUT' },
    { value: '/api/resource/Company/{name}', label: 'Update Company', method: 'PUT' },
    { value: '/api/resource/Warehouse/{name}', label: 'Update Warehouse', method: 'PUT' },
    { value: '/api/resource/Stock Entry/{name}', label: 'Update Stock Entry', method: 'PUT' },
    { value: '/api/resource/Delivery Note/{name}', label: 'Update Delivery Note', method: 'PUT' },
    { value: '/api/resource/Purchase Receipt/{name}', label: 'Update Purchase Receipt', method: 'PUT' },
    { value: '/api/resource/Journal Entry/{name}', label: 'Update Journal Entry', method: 'PUT' },
    { value: '/api/resource/Account/{name}', label: 'Update Account', method: 'PUT' },
    { value: '/api/resource/Cost Center/{name}', label: 'Update Cost Center', method: 'PUT' },
    { value: '/api/resource/Project/{name}', label: 'Update Project', method: 'PUT' },
    { value: '/api/resource/Task/{name}', label: 'Update Task', method: 'PUT' },
    { value: '/api/resource/ToDo/{name}', label: 'Update ToDo', method: 'PUT' },
    { value: '/api/resource/Event/{name}', label: 'Update Event', method: 'PUT' },
    { value: '/api/resource/Communication/{name}', label: 'Update Communication', method: 'PUT' },
    { value: '/api/resource/File/{name}', label: 'Update File', method: 'PUT' },

    // DELETE endpoints
    { value: '/api/resource/DocType/{name}', label: 'Delete DocType', method: 'DELETE' },
    { value: '/api/resource/User/{name}', label: 'Delete User', method: 'DELETE' },
    { value: '/api/resource/Customer/{name}', label: 'Delete Customer', method: 'DELETE' },
    { value: '/api/resource/Item/{name}', label: 'Delete Item', method: 'DELETE' },
    { value: '/api/resource/Sales Invoice/{name}', label: 'Delete Sales Invoice', method: 'DELETE' },
    { value: '/api/resource/Purchase Invoice/{name}', label: 'Delete Purchase Invoice', method: 'DELETE' },
    { value: '/api/resource/Quotation/{name}', label: 'Delete Quotation', method: 'DELETE' },
    { value: '/api/resource/Sales Order/{name}', label: 'Delete Sales Order', method: 'DELETE' },
    { value: '/api/resource/Purchase Order/{name}', label: 'Delete Purchase Order', method: 'DELETE' },
    { value: '/api/resource/Lead/{name}', label: 'Delete Lead', method: 'DELETE' },
    { value: '/api/resource/Opportunity/{name}', label: 'Delete Opportunity', method: 'DELETE' },
    { value: '/api/resource/Contact/{name}', label: 'Delete Contact', method: 'DELETE' },
    { value: '/api/resource/Address/{name}', label: 'Delete Address', method: 'DELETE' },
    { value: '/api/resource/Company/{name}', label: 'Delete Company', method: 'DELETE' },
    { value: '/api/resource/Warehouse/{name}', label: 'Delete Warehouse', method: 'DELETE' },
    { value: '/api/resource/Stock Entry/{name}', label: 'Delete Stock Entry', method: 'DELETE' },
    { value: '/api/resource/Delivery Note/{name}', label: 'Delete Delivery Note', method: 'DELETE' },
    { value: '/api/resource/Purchase Receipt/{name}', label: 'Delete Purchase Receipt', method: 'DELETE' },
    { value: '/api/resource/Journal Entry/{name}', label: 'Delete Journal Entry', method: 'DELETE' },
    { value: '/api/resource/Account/{name}', label: 'Delete Account', method: 'DELETE' },
    { value: '/api/resource/Cost Center/{name}', label: 'Delete Cost Center', method: 'DELETE' },
    { value: '/api/resource/Project/{name}', label: 'Delete Project', method: 'DELETE' },
    { value: '/api/resource/Task/{name}', label: 'Delete Task', method: 'DELETE' },
    { value: '/api/resource/ToDo/{name}', label: 'Delete ToDo', method: 'DELETE' },
    { value: '/api/resource/Event/{name}', label: 'Delete Event', method: 'DELETE' },
    { value: '/api/resource/Communication/{name}', label: 'Delete Communication', method: 'DELETE' },
    { value: '/api/resource/File/{name}', label: 'Delete File', method: 'DELETE' }
  ]
  
  // New connection form
  const [showNewConnection, setShowNewConnection] = useState(false)
  const [newConnection, setNewConnection] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    apiSecret: ''
  })
  const [creatingConnection, setCreatingConnection] = useState(false)

  // Load connections and custom endpoints on component mount
  useEffect(() => {
    loadConnections()
    loadCustomEndpoints()
  }, [])

  const loadCustomEndpoints = () => {
    const saved = localStorage.getItem('erpnext-custom-endpoints')
    if (saved) {
      try {
        setCustomEndpoints(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load custom endpoints:', error)
      }
    }
  }

  const saveCustomEndpoints = (endpoints) => {
    localStorage.setItem('erpnext-custom-endpoints', JSON.stringify(endpoints))
  }

  const loadConnections = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/connections')
      if (res.data.ok) {
        setConnections(res.data.data)
        if (res.data.data.length > 0 && !selectedConnection) {
          setSelectedConnection(res.data.data[0]._id)
        }
      }
    } catch (error) {
      toast.error('Failed to load connections')
    }
  }

  const createConnection = async () => {
    if (!newConnection.name || !newConnection.baseUrl || !newConnection.apiKey || !newConnection.apiSecret) {
      toast.error('Please fill in all fields')
      return
    }

    setCreatingConnection(true)
    try {
      const res = await axios.post('http://localhost:4000/api/connections', newConnection)
      if (res.data.ok) {
        toast.success('Connection created successfully')
        setNewConnection({ name: '', baseUrl: '', apiKey: '', apiSecret: '' })
        setShowNewConnection(false)
        await loadConnections()
        setSelectedConnection(res.data.data._id)
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      toast.error('Failed to create connection')
    } finally {
      setCreatingConnection(false)
    }
  }

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
      // Don't change the method - keep the user's selected method
      // setMethod(endpointData.method) // Removed this line
      
      // Set appropriate default request body based on current method and endpoint
      if (method === 'POST' || method === 'PUT') {
        setRequestBody(getDefaultRequestBody(finalEndpoint, method))
      } else {
        setRequestBody('{"field": "value"}')
      }
    }
  }

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod)
    // Clear endpoint when method changes to force user to select new endpoint
    setEndpoint('')
    
    // If switching to PUT, show a helpful message about document names
    if (newMethod === 'PUT') {
      toast.info('For PUT requests: Use the actual document name (e.g., CUST-00001) in the URL and request body')
    }
  }

  const handleDocumentNameChange = async (newDocumentName) => {
    setDocumentName(newDocumentName)
    
    // If we have an endpoint with {name} placeholder, update it
    if (endpoint.includes('{name}')) {
      const updatedEndpoint = endpoint.replace('{name}', newDocumentName)
      setEndpoint(updatedEndpoint)
    }
    
    // For PUT requests, try to get the exact document name first
    if (method === 'PUT' && newDocumentName && selectedConnection) {
      try {
        // Get the connection details
        const connection = connections.find(conn => conn._id === selectedConnection)
        if (connection) {
          // Try to fetch the existing document to get its exact name
          const docType = endpoint.split('/api/resource/')[1]?.split('/')[0]
          if (docType) {
            const searchUrl = `/api/resource/${docType}?filters=[["name","=","${newDocumentName}"]]&fields=["name"]&limit_page_length=1`
            
            const response = await fetch(`${connection.baseUrl}${searchUrl}`, {
              method: 'GET',
              headers: {
                'Authorization': `token ${connection.apiKey}:${connection.apiSecret}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data.data && data.data.length > 0) {
                const exactName = data.data[0].name
                console.log(`Found exact document name: ${exactName}`)
                
                // Update endpoint with exact name
                const exactEndpoint = endpoint.replace('{name}', exactName)
                setEndpoint(exactEndpoint)
                
                // Update request body with exact name
                try {
                  const currentBody = JSON.parse(requestBody)
                  currentBody.name = exactName
                  setRequestBody(JSON.stringify(currentBody, null, 2))
                } catch (e) {
                  setRequestBody(JSON.stringify({ name: exactName }, null, 2))
                }
                
                toast.success(`Found existing document: ${exactName}`)
                return
              }
            }
          }
        }
      } catch (error) {
        console.log('Could not fetch exact document name, using provided name')
      }
    }
    
    // Update request body if it's a PUT request
    if (method === 'PUT' && newDocumentName) {
      try {
        const currentBody = JSON.parse(requestBody)
        currentBody.name = newDocumentName
        setRequestBody(JSON.stringify(currentBody, null, 2))
      } catch (e) {
        // If JSON is invalid, just set a basic structure
        setRequestBody(JSON.stringify({ name: newDocumentName }, null, 2))
      }
    }
  }

  // New function to handle request body changes and update endpoint dynamically
  const handleRequestBodyChange = (newRequestBody) => {
    setRequestBody(newRequestBody)
    
    // If it's a PUT request and we have a {name} placeholder in the endpoint
    if (method === 'PUT' && endpoint.includes('{name}')) {
      try {
        const bodyData = JSON.parse(newRequestBody)
        
        // Check if the body has a 'name' field
        if (bodyData.name) {
          const documentName = bodyData.name
          
          // URL encode the document name for the endpoint
          const encodedName = encodeURIComponent(documentName)
          const updatedEndpoint = endpoint.replace('{name}', encodedName)
          setEndpoint(updatedEndpoint)
          
          // Also update the document name state
          setDocumentName(documentName)
          
          console.log(`Updated endpoint to: ${updatedEndpoint}`)
        }
      } catch (e) {
        // If JSON is invalid, don't update the endpoint
        console.log('Invalid JSON in request body')
      }
    }
  }

  const getDefaultRequestBody = (endpoint, method) => {
    // Generate appropriate default request body based on endpoint and method
    if (endpoint.includes('/api/resource/')) {
      const docType = endpoint.split('/api/resource/')[1].split('/')[0]
      
      // For ERPNext, send data directly as document fields, not wrapped in doctype/data
      if (method === 'POST') {
        // POST: Create new document - send document fields directly
        return getDocTypeFields(docType, 'POST')
      } else if (method === 'PUT') {
        // PUT: Update existing document - include name field
        return getDocTypeFields(docType, 'PUT')
      } else {
        // GET/DELETE: Usually no body needed, but provide empty object
        return JSON.stringify({}, null, 2)
      }
    } else if (endpoint.includes('/api/method/')) {
      return JSON.stringify({
        "args": [],
        "kwargs": {}
      }, null, 2)
    }
    return '{"field": "value"}'
  }

  const getDocTypeFields = (docType, method) => {
    // Generate appropriate fields based on DocType
    // For PUT requests: 
    //   1. URL should be: /api/resource/Customer/CUST-00001 (with actual document name)
    //   2. Request body 'name' field must match the document name in URL
    // For POST requests: 'name' field is not needed (ERPNext auto-generates it)
    
    const commonFields = {
      'Customer': {
        POST: {
          "customer_name": "Sample Customer",
          "customer_type": "Individual",
          "territory": "All Territories",
          "customer_group": "All Customer Groups"
        },
        PUT: {
          "name": "CUST-00001", // Replace with actual customer name/ID
          "customer_name": "Updated Customer Name",
          "customer_type": "Individual", // Individual or Company
          "customer_group": "All Customer Groups",
          "territory": "All Territories"
        }
      },
      'User': {
        POST: {
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com",
          "user_type": "System User",
          "send_welcome_email": 0
        },
        PUT: {
          "name": "john.doe@example.com",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com"
        }
      },
      'Item': {
        POST: {
          "item_code": "ITEM-001",
          "item_name": "Sample Item",
          "item_group": "All Item Groups",
          "is_stock_item": 1,
          "is_sales_item": 1
        },
        PUT: {
          "name": "ITEM-001",
          "item_code": "ITEM-001",
          "item_name": "Updated Item",
          "item_group": "All Item Groups"
        }
      },
      'Sales Invoice': {
        POST: {
          "customer": "CUST-001",
          "posting_date": new Date().toISOString().split('T')[0],
          "due_date": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "items": [{
            "item_code": "ITEM-001",
            "qty": 1,
            "rate": 100
          }]
        },
        PUT: {
          "name": "SINV-001",
          "customer": "CUST-001",
          "posting_date": new Date().toISOString().split('T')[0]
        }
      },
      'Purchase Invoice': {
        POST: {
          "supplier": "SUP-001",
          "posting_date": new Date().toISOString().split('T')[0],
          "due_date": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "items": [{
            "item_code": "ITEM-001",
            "qty": 1,
            "rate": 100
          }]
        },
        PUT: {
          "name": "PINV-001",
          "supplier": "SUP-001",
          "posting_date": new Date().toISOString().split('T')[0]
        }
      },
      'Lead': {
        POST: {
          "lead_name": "Sample Lead",
          "email_id": "lead@example.com",
          "mobile_no": "1234567890",
          "source": "Website"
        },
        PUT: {
          "name": "LEAD-001",
          "lead_name": "Updated Lead",
          "email_id": "lead@example.com"
        }
      },
      'Contact': {
        POST: {
          "first_name": "Jane",
          "last_name": "Smith",
          "email_id": "jane.smith@example.com",
          "mobile_no": "1234567890"
        },
        PUT: {
          "name": "CON-001",
          "first_name": "Jane",
          "last_name": "Smith",
          "email_id": "jane.smith@example.com"
        }
      },
      'Address': {
        POST: {
          "address_title": "Home Address",
          "address_type": "Billing",
          "address_line1": "123 Main Street",
          "city": "New York",
          "state": "NY",
          "pincode": "10001",
          "country": "United States"
        },
        PUT: {
          "name": "ADD-001",
          "address_title": "Updated Address",
          "address_type": "Billing"
        }
      }
    }

    // Return specific fields for known DocTypes, or generic fields for unknown ones
    if (commonFields[docType]) {
      return JSON.stringify(commonFields[docType][method], null, 2)
    } else {
      // Generic fields for unknown DocTypes
      if (method === 'POST') {
        return JSON.stringify({
          "name": `Sample ${docType}`,
          "title": `Sample ${docType} Title`
        }, null, 2)
      } else {
        return JSON.stringify({
          "name": `${docType.toUpperCase()}-001`,
          "title": `Updated ${docType} Title`
        }, null, 2)
      }
    }
  }

  const addCustomEndpoint = () => {
    if (customEndpoint.trim()) {
      const newCustomEndpoint = {
        value: customEndpoint.trim(),
        label: `Custom: ${customEndpoint.trim()}`,
        method: method // Use the currently selected method
      }
      
      // Check if endpoint already exists
      const exists = [...commonEndpoints, ...customEndpoints].some(ep => ep.value === newCustomEndpoint.value)
      if (exists) {
        toast.error('This endpoint already exists')
        return
      }
      
      // Add to custom endpoints
      const updatedCustomEndpoints = [...customEndpoints, newCustomEndpoint]
      setCustomEndpoints(updatedCustomEndpoints)
      saveCustomEndpoints(updatedCustomEndpoints)
      
      // Set as current endpoint
      setEndpoint(newCustomEndpoint.value)
      setShowCustomEndpoint(false)
      setCustomEndpoint('')
      toast.success('Custom endpoint added and selected')
    } else {
      toast.error('Please enter a valid endpoint')
    }
  }

  // Filter endpoints based on selected method
  const getFilteredEndpoints = () => {
    const allEndpoints = [...commonEndpoints, ...customEndpoints]
    return allEndpoints.filter(ep => ep.method === method)
  }

  const removeCustomEndpoint = (endpointToRemove) => {
    const updatedCustomEndpoints = customEndpoints.filter(ep => ep.value !== endpointToRemove)
    setCustomEndpoints(updatedCustomEndpoints)
    saveCustomEndpoints(updatedCustomEndpoints)
    toast.success('Custom endpoint removed')
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

      const res = await axios.post('http://localhost:4000/api/erp/send', requestData)
      
      if (res.data.ok) {
        setResponse({
          status: res.data.data.status,
          headers: res.data.data.headers,
          data: res.data.data.data,
          duration: res.data.data.durationMs,
          connectionName: res.data.data.connectionName
        })
        toast.success('Request sent successfully')
      } else {
        setResponse({
          status: 'Error',
          message: res.data.message,
          error: res.data.error
        })
        toast.error(res.data.message)
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
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                ERPNext API Tester
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${selectedConnection ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${selectedConnection ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
                  {selectedConnection ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Connection Panel */}
            <div className="card p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                ERPNext Connection
              </h2>
              
              {!showNewConnection ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Connection
                    </label>
                    <select 
                      className="input"
                      value={selectedConnection}
                      onChange={(e) => setSelectedConnection(e.target.value)}
                    >
                      <option value="">Select a connection...</option>
                      {connections.map(conn => (
                        <option key={conn._id} value={conn._id}>
                          {conn.name} - {conn.baseUrl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="btn btn-secondary flex-1"
                      onClick={loadConnections}
                    >
                      Refresh
                    </button>
                    <button 
                      className="btn btn-primary flex-1"
                      onClick={() => setShowNewConnection(true)}
                    >
                      New Connection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Connection Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={newConnection.name}
                      onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
                      placeholder="My ERPNext Connection"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ERPNext URL
                    </label>
                    <input
                      type="url"
                      className="input"
                      value={newConnection.baseUrl}
                      onChange={(e) => setNewConnection({...newConnection, baseUrl: e.target.value})}
                      placeholder="https://your-erpnext-instance.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={newConnection.apiKey}
                      onChange={(e) => setNewConnection({...newConnection, apiKey: e.target.value})}
                      placeholder="Your API Key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Secret
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={newConnection.apiSecret}
                      onChange={(e) => setNewConnection({...newConnection, apiSecret: e.target.value})}
                      placeholder="Your API Secret"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="btn btn-secondary flex-1"
                      onClick={() => setShowNewConnection(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary flex-1"
                      onClick={createConnection}
                      disabled={creatingConnection}
                    >
                      {creatingConnection ? 'Creating...' : 'Create & Connect'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* API Testing Panel */}
            <div className="card p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                API Testing
              </h2>
              <div className="space-y-4">
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
                    value={endpoint}
                    onChange={(e) => handleEndpointSelect(e.target.value)}
                  >
                    <option value="">Choose an endpoint...</option>
                    
                    {/* Filtered Endpoints based on selected method */}
                    {getFilteredEndpoints().map((ep, index) => (
                      <option key={index} value={ep.value}>
                        {ep.label}
                      </option>
                    ))}
                  </select>
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
                      Document Name (Optional)
                      <span className="text-green-600 text-xs ml-2">
                        ✨ Or just enter the name in the request body below - URL updates automatically!
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input flex-1"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        placeholder="e.g., Manoj Yadav, CUST-00001, john.doe@example.com"
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
                    <p className="text-xs text-gray-500 mt-1">
                      This will search for the exact document name. Or simply type the name in the request body below.
                    </p>
                  </div>
                )}

                {(method === 'POST' || method === 'PUT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request Body (JSON)
                      {method === 'PUT' && (
                        <span className="text-blue-600 text-xs ml-2">
                          💡 For PUT: Enter document name in 'name' field - URL will update automatically
                        </span>
                      )}
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
              </div>
            </div>
          </div>

          {/* Response Panel */}
          <div className="mt-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Response
              </h2>
              <div className="bg-gray-50 rounded-md p-4 min-h-[200px]">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
