import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import {
  Smile, Meh, Frown, Battery, Zap, CheckCircle, Star,
  Flame, Target, Award, ArrowRight, Calendar, Clock,
  Activity, Play, Pause, RotateCcw, Square
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const moods = [
  { id: 'happy',     icon: Smile,   label: 'Xursand',      color: 'text-green-400',  active: 'border-green-400/50 bg-green-400/10' },
  { id: 'calm',      icon: Battery, label: 'Xotirjam',     color: 'text-blue-400',   active: 'border-blue-400/50 bg-blue-400/10' },
  { id: 'neutral',   icon: Meh,     label: 'Oddiy',        color: 'text-yellow-400', active: 'border-yellow-400/50 bg-yellow-400/10' },
  { id: 'tired',     icon: Frown,   label: 'Charchagan',   color: 'text-orange-400', active: 'border-orange-400/50 bg-orange-400/10' },
  { id: 'motivated', icon: Zap,     label: 'Motivatsiyali',color: 'text-purple-400', active: 'border-purple-400/50 bg-purple-400/10' },
]

const moodMessages = {
  happy:     'Bugun kayfiyatim juda yaxshi! Shu energiyani qanday unumli ishlatishim mumkin?',
  calm:      'Bugun xotirjam his qilyapman. Shu holatda qanday maqsadlarga erishishim mumkin?',
  neutral:   'Bugun kayfiyatim oddiy, na yaxshi na yomon. Motivatsiyamni qanday oshiraman?',
  tired:     'Bugun juda charchagan his qilyapman. Nima qilishim kerak?',
  motivated: 'Bugun juda motivatsiyaliman! Qaysi muhim ishni birinchi qilishim kerak?',
}

const greetings = (name, hour) => {
  if (hour < 6)  return `Tungi mehnat, ${name}!`
  if (hour < 12) return `Xayrli tong, ${name}!`
  if (hour < 17) return `Xayrli kun, ${name}!`
  if (hour < 21) return `Xayrli kech, ${name}!`
  return `Kechqurun ham ishlayapsiz, ${name}!`
}

function formatDuration(ms) {
  if (ms <= 0) return '0s'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}s ${m}d`
  if (m > 0) return `${m}d ${sec}s`
  return `${sec}s`
}

export default function Home({ aiChatRef }) {
  const { habits, completedCount, quote, mood, setMood } = useApp()
  const { user, token } = useAuth()
  const [session, setSession] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  const hour = new Date().getHours()
  const firstName = user?.fullName?.split(' ')[0] || "Do'st"
  const today = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })
  const progress = session && habits.length ? (completedCount / habits.length) * 100 : 0
  const allDone = session && habits.length > 0 && completedCount === habits.length

  // Elapsed hisoblash
  const calcElapsed = (s) => {
    if (!s) return 0
    const now = Date.now()
    const started = new Date(s.startedAt).getTime()
    const paused = s.totalPaused || 0
    const pausedNow = s.paused && s.pausedAt ? now - new Date(s.pausedAt).getTime() : 0
    return now - started - paused - pausedNow
  }

  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/day-session/today`, { headers })
      .then(r => r.json())
      .then(d => { if (d?._id) setSession(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (session && !session.paused) {
      timerRef.current = setInterval(() => setElapsed(calcElapsed(session)), 1000)
    } else if (session) {
      setElapsed(calcElapsed(session))
    }
    return () => clearInterval(timerRef.current)
  }, [session])

  const startDay = async () => {
    const res = await fetch(`${API}/api/day-session/start`, { method: 'POST', headers })
    const data = await res.json()
    setSession(data)
  }

  const pauseDay = async () => {
    const res = await fetch(`${API}/api/day-session/pause`, { method: 'POST', headers })
    const data = await res.json()
    setSession(data)
  }

  const resumeDay = async () => {
    const res = await fetch(`${API}/api/day-session/resume`, { method: 'POST', headers })
    const data = await res.json()
    setSession(data)
  }

  const resetDay = async () => {
    await fetch(`${API}/api/day-session/reset`, { method: 'POST', headers })
    setSession(null)
    setElapsed(0)
  }

  const handleMood = (id) => {
    setMood(id)
    setTimeout(() => aiChatRef?.current?.openWithMessage(moodMessages[id]), 300)
  }

  return (
    <div className="space-y-5 pb-8">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1040] via-[#160d35] to-[#0f0a1e] p-6 animate-fade-up">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-secondary/10 blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2 text-xs text-white/40">
              <Calendar size={12} /><span>{today}</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">{greetings(firstName, hour)}</h1>
            <p className="text-white/40 text-sm italic">"{quote}"</p>

            {/* Timer + controls */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {!session ? (
                <button onClick={startDay}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark px-4 py-2 rounded-xl text-sm font-medium transition-all animate-glow">
                  <Play size={14} /> Kunni boshlash
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl text-sm">
                    <Clock size={13} className={session.paused ? 'text-white/30' : 'text-primary-light animate-bounce-soft'} />
                    <span className={session.paused ? 'text-white/40' : 'text-white font-mono font-medium'}>
                      {formatDuration(elapsed)}
                    </span>
                    {session.paused && <span className="text-xs text-orange-400 ml-1">to'xtatildi</span>}
                  </div>

                  {session.paused ? (
                    <button onClick={resumeDay}
                      className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-xl text-xs font-medium transition-all">
                      <Play size={12} /> Davom etish
                    </button>
                  ) : (
                    <button onClick={pauseDay}
                      className="flex items-center gap-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-xl text-xs font-medium transition-all">
                      <Pause size={12} /> To'xtatish
                    </button>
                  )}

                  <button onClick={resetDay}
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-400 px-3 py-1.5 rounded-xl text-xs transition-all">
                    <RotateCcw size={12} /> 0 dan boshlash
                  </button>
                </>
              )}
            </div>

            {allDone && (
              <div className="mt-3 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-3 py-1.5 rounded-full animate-pop">
                <Star size={12} className="animate-heartbeat" /> Barcha odatlar bajarildi!
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 md:min-w-[180px]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-yellow-400">
                <Star size={12} /> Level {user?.level || 1}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                style={{ width: `${Math.min((user?.xp || 0) % 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3 stagger">
        {[
          { icon: CheckCircle, label: 'Bugungi odatlar', value: session ? `${completedCount}/${habits.length}` : '—', sub: session ? `${Math.round(progress)}% bajarildi` : 'Kun boshlanmagan', color: 'text-white' },
          { icon: Clock,       label: 'Kun davomiyligi', value: session ? formatDuration(elapsed) : '—',              sub: session ? (session.paused ? "to'xtatildi" : "davom etmoqda") : 'Kun boshlanmagan', color: 'text-primary-light' },
          { icon: Flame,       label: 'Streak',          value: session ? `${user?.streak || 0}` : '—',              sub: 'ketma-ket kun', color: 'text-orange-400' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className={`card card-lift animate-fade-up flex flex-col gap-1 ${!session ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{label}</span>
              <Icon size={14} className="text-white/20" />
            </div>
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
            <span className="text-xs text-white/30">{sub}</span>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Progress */}
          <div className={`card animate-fade-up ${!session ? 'opacity-60' : ''}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Kunlik progress</h3>
              <span className="text-xs text-white/30">{session ? `${completedCount}/${habits.length}` : '—'}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/25">
              <span>0%</span>
              <span className={`font-medium ${progress >= 100 ? 'text-green-400' : 'text-primary-light'}`}>{Math.round(progress)}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Habits */}
          <div className="card animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Bugungi odatlar</h3>
              <NavLink to="/dashboard/habits" className="flex items-center gap-1 text-xs text-primary-light hover:text-white transition-colors">
                Barchasi <ArrowRight size={12} />
              </NavLink>
            </div>
            <div className="space-y-2 stagger">
              {habits.length === 0 ? (
                <p className="py-6 text-center text-sm text-white/30">Hali odat qo'shilmagan</p>
              ) : habits.slice(0, 5).map(h => (
                <div key={h.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                  h.done ? 'bg-primary/10 border border-primary/20' : 'bg-white/5 border border-transparent'
                } ${!session ? 'opacity-50' : ''}`}>
                  <CheckCircle size={17} className={h.done ? 'text-primary flex-shrink-0' : 'text-white/20 flex-shrink-0'} />
                  <span className={`flex-1 text-sm ${h.done ? 'line-through text-white/30' : 'text-white/80'}`}>{h.name}</span>
                  {h.done && session && <span className="text-xs font-medium text-primary-light">+10 XP</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="card animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Bugungi kayfiyat</h3>
              {mood && <span className="text-xs text-white/30">AI suhbat boshladi</span>}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {moods.map(({ id, icon: Icon, label, color, active }) => (
                <button key={id} onClick={() => handleMood(id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border py-3 px-1 transition-all ${
                    mood === id ? `${active} scale-105 shadow-lg` : 'border-white/10 hover:border-white/20 hover:bg-white/5 hover:scale-105'
                  }`}>
                  <Icon size={20} className={mood === id ? color : 'text-white/40'} />
                  <span className={`text-[11px] leading-tight text-center ${mood === id ? 'text-white' : 'text-white/40'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-3 stagger">
          {[
            { to: '/dashboard/goals',   icon: Target,    label: 'Maqsadlar',  sub: 'Rejalashtirish', color: 'bg-blue-500/20',   ic: 'text-blue-400' },
            { to: '/dashboard/rewards', icon: Award,     label: 'Mukofotlar', sub: 'Yutuqlar',       color: 'bg-yellow-500/20', ic: 'text-yellow-400' },
            { to: '/dashboard/focus',   icon: Clock,     label: 'Fokus',      sub: 'Pomodoro',       color: 'bg-green-500/20',  ic: 'text-green-400' },
            { to: '/dashboard/stats',   icon: Activity,  label: 'Statistika', sub: 'Tahlil',         color: 'bg-purple-500/20', ic: 'text-purple-400' },
          ].map(({ to, icon: Icon, label, sub, color, ic }) => (
            <NavLink key={to} to={to}
              className="card card-lift flex items-center gap-3 hover:bg-white/10 transition-all group animate-fade-up">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} className={ic} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-white/30">{sub}</p>
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
