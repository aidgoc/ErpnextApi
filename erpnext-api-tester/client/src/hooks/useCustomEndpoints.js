import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

export const useCustomEndpoints = (selectedConnection) => {
  const [customEndpoints, setCustomEndpoints] = useState([])
  const [loading, setLoading] = useState(false)

  const loadCustomEndpoints = async () => {
    if (!selectedConnection) {
      setCustomEndpoints([])
      return
    }
    
    try {
      const res = await apiService.getCustomEndpoints(selectedConnection)
      if (res.ok) {
        const serverEndpoints = res.data.map(ep => ({
          value: ep.path,
          label: ep.label,
          method: ep.method
        }))
        setCustomEndpoints(serverEndpoints)
      }
    } catch (error) {
      console.error('Error loading custom endpoints:', error)
    }
  }

  const createCustomEndpoint = async (endpointData) => {
    if (!selectedConnection) {
      toast.error('Please select a connection first')
      return { success: false, error: 'No connection selected' }
    }

    setLoading(true)
    try {
      const response = await apiService.createCustomEndpoint({
        ...endpointData,
        connectionId: selectedConnection
      })

      if (response.ok) {
        toast.success('Custom endpoint saved to database')
        await loadCustomEndpoints()
        return { success: true, data: response.data }
      } else {
        toast.error('Failed to save custom endpoint')
        return { success: false, error: response.message }
      }
    } catch (error) {
      console.error('Error saving custom endpoint:', error)
      toast.error('Failed to save custom endpoint to database')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteCustomEndpoint = async (endpointId) => {
    try {
      const res = await apiService.deleteCustomEndpoint(endpointId)
      if (res.ok) {
        toast.success('Custom endpoint removed')
        await loadCustomEndpoints()
        return { success: true }
      } else {
        toast.error(res.message)
        return { success: false, error: res.message }
      }
    } catch (error) {
      toast.error('Failed to delete custom endpoint')
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    loadCustomEndpoints()
  }, [selectedConnection])

  return {
    customEndpoints,
    setCustomEndpoints,
    loading,
    loadCustomEndpoints,
    createCustomEndpoint,
    deleteCustomEndpoint
  }
}
