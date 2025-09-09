/**
 * Common form helper utilities
 * Provides reusable functions for form handling patterns
 */

import { useCallback, useState } from 'react';
import { validateRequired } from './common';

/**
 * Custom hook for form state management
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler
 * @param {Array} requiredFields - Required field names
 * @returns {Object} - Form state and handlers
 */
export const useForm = (initialValues, onSubmit, requiredFields = []) => {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    // Validate required fields
    const validation = validateRequired(values, requiredFields);
    if (!validation.valid) {
      const newErrors = {};
      validation.missing.forEach(field => {
        newErrors[field] = `${field} is required`;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  }, [values, requiredFields, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setLoading(false);
  }, [initialValues]);

  return {
    values,
    setValues,
    loading,
    errors,
    handleChange,
    handleSubmit,
    reset
  };
};

/**
 * Common form field configurations
 */
export const FORM_FIELDS = {
  connection: [
    { field: 'name', label: 'Connection Name', type: 'text', placeholder: 'e.g., Production, Development' },
    { field: 'baseUrl', label: 'Base URL', type: 'url', placeholder: 'https://your-erpnext-instance.com' },
    { field: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Your ERPNext API Key' },
    { field: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Your ERPNext API Secret' }
  ],
  
  customEndpoint: [
    { field: 'label', label: 'Endpoint Label', type: 'text', placeholder: 'e.g., Get Customer Details' },
    { field: 'path', label: 'API Path', type: 'text', placeholder: '/api/resource/Customer' },
    { field: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional description' }
  ]
};

/**
 * Render form fields from configuration
 * @param {Array} fields - Field configurations
 * @param {Object} values - Current form values
 * @param {Function} onChange - Change handler
 * @param {Object} errors - Error state
 * @returns {Array} - JSX elements
 */
export const renderFormFields = (fields, values, onChange, errors = {}) => {
  return fields.map(({ field, label, type, placeholder, required = false }) => (
    <div key={field}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          className={`input min-h-[80px] resize-none ${errors[field] ? 'border-red-500' : ''}`}
          value={values[field] || ''}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className={`input ${errors[field] ? 'border-red-500' : ''}`}
          value={values[field] || ''}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
        />
      )}
      {errors[field] && (
        <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
      )}
    </div>
  ));
};

/**
 * Common button configurations
 */
export const BUTTON_CONFIGS = {
  primary: {
    className: 'btn btn-primary',
    loadingText: 'Processing...'
  },
  secondary: {
    className: 'btn btn-secondary',
    loadingText: 'Processing...'
  },
  danger: {
    className: 'btn btn-danger',
    loadingText: 'Deleting...'
  }
};

/**
 * Render action buttons
 * @param {Array} buttons - Button configurations
 * @param {boolean} loading - Loading state
 * @returns {Array} - JSX elements
 */
export const renderActionButtons = (buttons, loading = false) => {
  return buttons.map(({ type, onClick, disabled, children, ...props }, index) => {
    const config = BUTTON_CONFIGS[type] || BUTTON_CONFIGS.primary;
    const isDisabled = disabled || loading;
    const buttonText = loading ? config.loadingText : children;
    
    return (
      <button
        key={index}
        type="button"
        className={config.className}
        onClick={onClick}
        disabled={isDisabled}
        {...props}
      >
        {buttonText}
      </button>
    );
  });
};
