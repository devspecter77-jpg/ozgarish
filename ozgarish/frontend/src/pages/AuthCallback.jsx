import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setToken, setUser } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
        navigate('/dashboard')
      } catch (e) {
        navigate('/login?error=callback')
      }
    } else {
      navigate('/login?error=missing')
    }
  }, [searchParams, navigate, setToken, setUser])

  return (
    <div className="min-h-screen bg-[#0F0A1E] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white/60">Kirilmoqda...</p>
      </div>
    </div>
  )
}
