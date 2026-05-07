import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Phone, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ phone: '+998', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const formatPhone = (val) => {
    let digits = val.replace(/\D/g, '')
    if (!digits.startsWith('998')) digits = '998' + digits.replace(/^998/, '')
    const local = digits.slice(3)
    let formatted = '+998'
    if (local.length > 0) formatted += ' ' + local.slice(0, 2)
    if (local.length > 2) formatted += ' ' + local.slice(2, 5)
    if (local.length > 5) formatted += ' ' + local.slice(5, 7)
    if (local.length > 7) formatted += ' ' + local.slice(7, 9)
    return formatted
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Xatolik')
      localStorage.setItem('adminToken', data.token)
      navigate('/admin')
    } catch {
      setError('Server bilan bog\'lanib bo\'lmadi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0618] flex items-center justify-center px-4">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft size={22} />
        <span>Orqaga</span>
        <span className="back-circle"></span>
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-primary-light" />
          </div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">Faqat adminlar uchun</p>
        </div>

        <div className="card border-primary/20">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Telefon</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                  placeholder="+998 91 405 84 81"
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Parol</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Admin paroli"
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-primary"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark rounded-xl text-sm font-medium transition-all disabled:opacity-50">
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
