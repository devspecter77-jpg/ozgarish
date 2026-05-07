import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid
} from 'recharts'
import {
  TrendingUp, CheckCircle, Star, Flame,
  BarChart2, Target, Award, Activity
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TOOLTIP_STYLE = {
  background: '#1a0f3a',
  border: '1px solid rgba(124,58,237,0.3)',
  borderRadius: 10,
  color: '#fff',
  fontSize: 12
}

export default function Stats() {
  const { token } = useAuth()
  const [habits, setHabits] = useState([])
  const [assessHistory, setAssessHistory] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/habits`, { headers }).then(r => r.json()),
      fetch(`${API}/api/assessment/history`, { headers }).then(r => r.json()),
      fetch(`${API}/api/goals`, { headers }).then(r => r.json()),
    ]).then(([hab, hist, gls]) => {
      setHabits(Array.isArray(hab) ? hab : [])
      setAssessHistory(Array.isArray(hist) ? hist : [])
      setGoals(Array.isArray(gls) ? gls : [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // --- Hisob-kitoblar ---
  const today = new Date().toISOString().split('T')[0]
  const completedHabits = habits.filter(h => h.done).length
  const habitPercent = habits.length ? Math.round(completedHabits / habits.length * 100) : 0

  const todayAssess = assessHistory.find(h => h.date === today)
  const todayAvg = todayAssess?.scores
    ? Math.round(Object.values(todayAssess.scores).reduce((a, b) => a + b, 0) / 5)
    : 0

  const completedGoals = goals.filter(g => g.done).length
  const goalPercent = goals.length ? Math.round(completedGoals / goals.length * 100) : 0

  // Streak
  const streak = (() => {
    let count = 0
    const sorted = [...assessHistory].sort((a, b) => b.date.localeCompare(a.date))
    for (let i = 0; i < sorted.length; i++) {
      const exp = new Date()
      exp.setDate(exp.getDate() - i)
      if (sorted[i]?.date === exp.toISOString().split('T')[0]) count++
      else break
    }
    return count
  })()

  // Radar — bugungi baholash
  const radarData = todayAssess?.scores ? [
    { subject: 'Intizom',    A: todayAssess.scores.intizom   || 0 },
    { subject: 'Hurmat',     A: todayAssess.scores.hurmat    || 0 },
    { subject: 'Sabr',       A: todayAssess.scores.sabr      || 0 },
    { subject: 'Diqqat',     A: todayAssess.scores.diqqat    || 0 },
    { subject: "Mas'uliyat", A: todayAssess.scores.masuliyat || 0 },
  ] : []

  // Kunlik ball line chart (oxirgi 14 kun)
  const lineData = [...assessHistory].reverse().slice(-14).map(h => {
    const vals = h.scores ? Object.values(h.scores) : []
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
    return {
      kun: new Date(h.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
      ball: avg
    }
  })

  // Haftalik odatlar bar chart (oxirgi 7 kun)
  const habitBarData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const completed = habits.filter(h => h.completedDates?.includes(dateStr)).length
    return {
      kun: d.toLocaleDateString('uz-UZ', { weekday: 'short' }),
      bajarildi: completed,
      jami: habits.length
    }
  })

  // Maqsadlar bo'yicha
  const goalsByType = {
    '7kun':   goals.filter(g => g.type === '7kun'),
    '30kun':  goals.filter(g => g.type === '30kun'),
    'yillik': goals.filter(g => g.type === 'yillik'),
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5 pb-8">

      <div>
        <h2 className="text-xl font-bold">Statistika</h2>
        <p className="text-xs text-white/40 mt-0.5">Barcha sahifalar bo'yicha umumiy tahlil</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Bugungi odatlar', value: `${completedHabits}/${habits.length}`, sub: `${habitPercent}%`, icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-400/10' },
          { label: 'Baholash',        value: `${todayAvg}%`,                        sub: 'bugungi o\'rtacha', icon: Star,         color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Maqsadlar',       value: `${completedGoals}/${goals.length}`,   sub: `${goalPercent}%`,  icon: Target,       color: 'text-blue-400',   bg: 'bg-blue-400/10' },
          { label: 'Streak',          value: `${streak} kun`,                       sub: 'ketma-ket',        icon: Flame,        color: 'text-orange-400', bg: 'bg-orange-400/10' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="card flex flex-col gap-1.5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <div>
              <p className="text-xs text-white/40">{label}</p>
              <p className="text-xs text-white/25">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Radar */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-1">Shaxsiy sifatlar</h3>
          <p className="text-xs text-white/30 mb-3">Bugungi baholash natijalari</p>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#ffffff15" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 11 }} />
                <Radar dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[220px] text-white/20 gap-2">
              <Activity size={28} />
              <p className="text-xs">Bugun baholash qilinmagan</p>
            </div>
          )}
        </div>

        {/* Kunlik ball */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-1">Kunlik baholash</h3>
          <p className="text-xs text-white/30 mb-3">So'nggi 14 kun o'rtacha foizi</p>
          {lineData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid stroke="#ffffff08" />
                <XAxis dataKey="kun" stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 10 }}
                  tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Ball']} />
                <Line type="monotone" dataKey="ball" stroke="#7C3AED" strokeWidth={2}
                  dot={{ fill: '#7C3AED', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[220px] text-white/20 gap-2">
              <TrendingUp size={28} />
              <p className="text-xs">Kamida 2 kun kerak</p>
            </div>
          )}
        </div>
      </div>

      {/* Haftalik odatlar */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-1">Haftalik odatlar</h3>
        <p className="text-xs text-white/30 mb-4">Oxirgi 7 kunda bajarilgan odatlar soni</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={habitBarData}>
            <XAxis dataKey="kun" stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 11 }} />
            <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v, 'Bajarildi']} />
            <Bar dataKey="bajarildi" fill="#7C3AED" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Maqsadlar holati */}
      {goals.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-white/40" />
            <h3 className="text-sm font-semibold">Maqsadlar holati</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: '7kun',   label: '7 Kunlik',  color: 'bg-blue-400',   bg: 'bg-blue-400/10',   text: 'text-blue-400' },
              { key: '30kun',  label: '30 Kunlik', color: 'bg-purple-400', bg: 'bg-purple-400/10', text: 'text-purple-400' },
              { key: 'yillik', label: 'Yillik',    color: 'bg-orange-400', bg: 'bg-orange-400/10', text: 'text-orange-400' },
            ].map(({ key, label, color, bg, text }) => {
              const list = goalsByType[key]
              if (!list.length) return null
              const done = list.filter(g => g.done).length
              const pct = Math.round(done / list.length * 100)
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-medium ${text}`}>{label}</span>
                    <span className="text-xs text-white/40">{done}/{list.length} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Baholash tarixi jadvali */}
      {assessHistory.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-white/40" />
            <h3 className="text-sm font-semibold">Baholash tarixi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-xs border-b border-white/10">
                  <th className="text-left pb-2 font-medium">Sana</th>
                  <th className="text-center pb-2 font-medium">Intizom</th>
                  <th className="text-center pb-2 font-medium">Hurmat</th>
                  <th className="text-center pb-2 font-medium">Sabr</th>
                  <th className="text-center pb-2 font-medium">Diqqat</th>
                  <th className="text-center pb-2 font-medium">Mas'uliyat</th>
                  <th className="text-center pb-2 font-medium">O'rtacha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assessHistory.map((h, i) => {
                  const vals = h.scores ? Object.values(h.scores) : []
                  const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
                  const isToday = h.date === today
                  return (
                    <tr key={i} className={isToday ? 'bg-primary/10' : 'hover:bg-white/5'}>
                      <td className="py-2.5 text-xs text-white/60">
                        {isToday
                          ? <span className="text-primary-light font-medium">Bugun</span>
                          : new Date(h.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })
                        }
                      </td>
                      {['intizom','hurmat','sabr','diqqat','masuliyat'].map(k => (
                        <td key={k} className="py-2.5 text-center text-xs text-white/60">
                          {h.scores?.[k] != null ? `${h.scores[k]}%` : '—'}
                        </td>
                      ))}
                      <td className="py-2.5 text-center text-xs font-semibold text-primary-light">{avg}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
