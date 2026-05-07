import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const register = async (data) => {
    setLoading(true); setError('')
    try {
      const res = await axios.post(`${API}/auth/register`, data)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setToken(res.data.token)
      setUser(res.data.user)
      return true
    } catch (e) {
      const msg = e.response?.data?.error || 'Xatolik yuz berdi'
      setError(msg)
      return msg
    } finally { setLoading(false) }
  }

  const login = async (data) => {
    setLoading(true); setError('')
    try {
      const res = await axios.post(`${API}/auth/login`, data)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setToken(res.data.token)
      setUser(res.data.user)
      return true
    } catch (e) {
      const msg = e.response?.data?.error || 'Xatolik yuz berdi'
      setError(msg)
      return msg
    } finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, error, loading, register, login, logout, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
