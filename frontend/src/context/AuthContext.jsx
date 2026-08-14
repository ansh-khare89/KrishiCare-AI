import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, fetchCurrentUser } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial auth state from localStorage
    const savedToken = localStorage.getItem('krishi_access_token')
    const savedUser = localStorage.getItem('krishi_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (err) {
        console.error('Failed to parse saved user data:', err)
        localStorage.removeItem('krishi_access_token')
        localStorage.removeItem('krishi_refresh_token')
        localStorage.removeItem('krishi_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await loginUser(email, password)
    const userInfo = { email: data.email, name: data.name }
    
    setToken(data.accessToken)
    setUser(userInfo)

    localStorage.setItem('krishi_access_token', data.accessToken)
    if (data.refreshToken) {
      localStorage.setItem('krishi_refresh_token', data.refreshToken)
    }
    localStorage.setItem('krishi_user', JSON.stringify(userInfo))

    return data
  }

  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password)
    const userInfo = { email: data.email, name: data.name }

    setToken(data.accessToken)
    setUser(userInfo)

    localStorage.setItem('krishi_access_token', data.accessToken)
    if (data.refreshToken) {
      localStorage.setItem('krishi_refresh_token', data.refreshToken)
    }
    localStorage.setItem('krishi_user', JSON.stringify(userInfo))

    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('krishi_access_token')
    localStorage.removeItem('krishi_refresh_token')
    localStorage.removeItem('krishi_user')
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
