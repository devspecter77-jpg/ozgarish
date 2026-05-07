import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Phone, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Shield } from 'lucide-react'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', phone: '+998', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const isAdmin = !!localStorage.getItem('adminToken')

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setServerError('')
  }

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

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Ism familyani kiriting'
    else if (form.fullName.trim().length < 3) errs.fullName = 'Kamida 3 ta harf bo\'lishi kerak'

    const digits = form.phone.replace(/\D/g, '')
    if (digits.length !== 12) errs.phone = "To'liq telefon raqam kiriting (+998 XX XXX XX XX)"

    if (!form.password) errs.password = 'Parolni kiriting'
    else if (form.password.length < 6) errs.password = 'Parol kamida 6 ta belgi bo\'lishi kerak'

    if (!form.confirm) errs.confirm = 'Parolni tasdiqlang'
    else if (form.password !== form.confirm) errs.confirm = 'Parollar mos kelmadi'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const { confirm, ...data } = form
    const result = await register(data)
    if (result === true) {
      navigate('/dashboard')
    } else {
      setServerError(result || "Ro'yxatdan o'tish amalga oshmadi")
    }
  }

  // Parol kuchi
  const passStrength = () => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return { label: 'Juda qisqa', color: 'bg-red-500', w: '25%' }
    if (p.length < 8) return { label: 'Zaif', color: 'bg-orange-500', w: '50%' }
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "O'rtacha", color: 'bg-yellow-500', w: '75%' }
    return { label: 'Kuchli', color: 'bg-green-500', w: '100%' }
  }
  const strength = passStrength()

  return (
    <div className="min-h-screen bg-[#0F0A1E] flex items-center justify-center px-4 py-8">
      <button onClick={() => navigate('/')} className="back-button">
        <ArrowLeft size={22} />
        <span>Orqaga</span>
        <span className="back-circle"></span>
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="O'zgarish" className="w-16 h-16 mx-auto mb-2 rounded-2xl" />
            <h1 className="text-2xl font-bold text-primary-light">O'zgarish</h1>
            <p className="text-white/40 text-sm">= Mukammallik</p>
          </Link>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-6">Ro'yxatdan o'tish</h2>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {serverError}
            </div>
          )}

          {/* Telegram bot */}
          <div className="bg-[#229ED9]/10 border border-[#229ED9]/30 rounded-xl p-4 mb-4">
            <p className="text-sm text-white/80 mb-2 font-medium">
              📱 Ro'yxatdan o'tishdan oldin botga <b>/start</b> bering
            </p>
            <p className="text-xs text-white/40 mb-3">
              Har kuni motivatsiya va eslatmalar olish uchun
            </p>
            <a
              href="https://t.me/ozgarish_mukammallik_bot?start=register"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1a8bc4] text-white text-sm font-medium transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.152.678-.554.843-1.122.524l-3.1-2.285-1.496 1.44c-.165.165-.304.304-.624.304l.223-3.164 5.754-5.197c.25-.223-.054-.347-.388-.124L7.08 14.073l-3.064-.957c-.666-.208-.68-.666.14-.986l11.97-4.614c.554-.2 1.04.135.836.732z"/>
              </svg>
              Telegram botga o'tish
            </a>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {/* Full name */}
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Ism Familya</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Ism Familyangiz"
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  className={`w-full bg-white/10 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 outline-none transition-colors ${
                    errors.fullName ? 'border-red-500/60' : 'border-white/20 focus:border-primary'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Telefon raqam</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="tel"
                  placeholder="+998 91 405 84 81"
                  value={form.phone}
                  onChange={e => set('phone', formatPhone(e.target.value))}
                  className={`w-full bg-white/10 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 outline-none transition-colors ${
                    errors.phone ? 'border-red-500/60' : 'border-white/20 focus:border-primary'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Parol</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Kamida 6 ta belgi"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className={`w-full bg-white/10 border rounded-xl pl-10 pr-11 py-3 text-white placeholder-white/30 outline-none transition-colors ${
                    errors.password ? 'border-red-500/60' : 'border-white/20 focus:border-primary'
                  }`}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {strength && (
                <div className="mt-1.5">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} rounded-full transition-all`} style={{ width: strength.w }} />
                  </div>
                  <p className="text-xs text-white/30 mt-0.5">{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Parolni tasdiqlang</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Parolni qayta kiriting"
                  value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  className={`w-full bg-white/10 border rounded-xl pl-10 pr-11 py-3 text-white placeholder-white/30 outline-none transition-colors ${
                    errors.confirm ? 'border-red-500/60' : form.confirm && form.confirm === form.password ? 'border-green-500/50' : 'border-white/20 focus:border-primary'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {form.confirm && form.confirm === form.password
                    ? <CheckCircle size={18} className="text-green-400" />
                    : showConfirm ? <EyeOff size={18} /> : <Eye size={18} />
                  }
                </button>
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} className="animated-button mt-2">
              <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
              </svg>
              <span className="text">{loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}</span>
              <span className="circle"></span>
              <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
              </svg>
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-5">
            Hisobingiz bormi?{' '}
            <Link to="/login" className="text-primary-light hover:underline">Kirish</Link>
          </p>

          {isAdmin && (
            <Link to="/admin"
              className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-xl border border-primary/30 text-primary-light text-sm hover:bg-primary/10 transition-all">
              <Shield size={15} /> Admin panelga qaytish
            </Link>
          )}

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">yoki</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <a href="#" onClick={e => { e.preventDefault(); window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google/register` }}
            className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all text-sm font-medium">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google bilan ro'yxatdan o'tish
          </a>
        </div>
      </div>
    </div>
  )
}
