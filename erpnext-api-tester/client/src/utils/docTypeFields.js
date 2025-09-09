// DocType field generators for different ERPNext document types

export const generateCustomDocType = (docTypeName) => {
  // Generate a flexible Custom DocType structure
  const cleanName = docTypeName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
  
  return {
    "name": cleanName,
    "title": cleanName,
    "module": "Custom",
    "is_custom": 1,
    "fields": [
      {
        "fieldname": "title",
        "fieldtype": "Data",
        "label": "Title",
        "reqd": 1
      },
      {
        "fieldname": "description",
        "fieldtype": "Text",
        "label": "Description"
      },
      {
        "fieldname": "status",
        "fieldtype": "Select",
        "label": "Status",
        "options": "Draft\nSubmitted\nCancelled"
      },
      {
        "fieldname": "amount",
        "fieldtype": "Currency",
        "label": "Amount"
      },
      {
        "fieldname": "date",
        "fieldtype": "Date",
        "label": "Date"
      },
      {
        "fieldname": "notes",
        "fieldtype": "Text",
        "label": "Notes"
      }
    ]
  }
}

export const getDocTypeFields = (docType, method, customDocTypeName = '') => {
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
        "customer": "CUST-00001",
        "due_date": "2024-12-31",
        "items": [
          {
            "item_code": "ITEM-001",
            "qty": 1,
            "rate": 100
          }
        ]
      },
      PUT: {
        "name": "SINV-00001",
        "customer": "CUST-00001",
        "due_date": "2024-12-31"
      }
    },
    'Lead': {
      POST: {
        "lead_name": "John Doe",
        "email_id": "john.doe@example.com",
        "mobile_no": "1234567890",
        "status": "Open"
      },
      PUT: {
        "name": "LEAD-00001",
        "lead_name": "John Doe",
        "email_id": "john.doe@example.com",
        "status": "Qualified"
      }
    },
    'Address': {
      POST: {
        "address_title": "Billing Address",
        "address_type": "Billing",
        "address_line1": "123 Main St",
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
    },
    'Custom DocType': {
      POST: generateCustomDocType(customDocTypeName || "My Custom DocType"),
      PUT: {
        "name": customDocTypeName || "My Custom DocType",
        "title": "Updated Custom DocType",
        "module": "Custom",
        "is_custom": 1
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
    } else if (method === 'PUT') {
      return JSON.stringify({
        "name": `${docType.toUpperCase()}-00001`,
        "title": `Updated ${docType} Title`
      }, null, 2)
    }
  }
  return '{"field": "value"}'
}
