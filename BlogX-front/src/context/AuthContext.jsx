import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

// Set axios base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
axios.defaults.baseURL = API_BASE_URL

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Verify token and get user info
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/users/profile')
      setUser(response.data)
    } catch {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/users/login', { email, password })
      const { token, ...userData } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Login failed'
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/users/register', { username, email, password })
      const { token, ...userData } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed'
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
