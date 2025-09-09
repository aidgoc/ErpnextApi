import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

export const useConnections = () => {
  const [connections, setConnections] = useState([])
  const [selectedConnection, setSelectedConnection] = useState('')
  const [loading, setLoading] = useState(false)

  const loadConnections = async () => {
    try {
      const res = await apiService.getConnections()
      if (res.ok) {
        setConnections(res.data)
        if (res.data.length > 0 && !selectedConnection) {
          setSelectedConnection(res.data[0]._id)
        }
      }
    } catch (error) {
      toast.error('Failed to load connections')
    }
  }

  const createConnection = async (connectionData) => {
    setLoading(true)
    try {
      const res = await apiService.createConnection(connectionData)
      if (res.ok) {
        toast.success('Connection created successfully')
        await loadConnections()
        setSelectedConnection(res.data._id)
        return { success: true, data: res.data }
      } else {
        toast.error(res.message)
        return { success: false, error: res.message }
      }
    } catch (error) {
      toast.error('Failed to create connection')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteConnection = async (connectionId) => {
    try {
      const res = await apiService.deleteConnection(connectionId)
      if (res.ok) {
        toast.success('Connection deleted successfully')
        await loadConnections()
        if (selectedConnection === connectionId) {
          setSelectedConnection('')
        }
        return { success: true }
      } else {
        toast.error(res.message)
        return { success: false, error: res.message }
      }
    } catch (error) {
      toast.error('Failed to delete connection')
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    loadConnections()
  }, [])

  return {
    connections,
    selectedConnection,
    setSelectedConnection,
    loading,
    loadConnections,
    createConnection,
    deleteConnection
  }
}
