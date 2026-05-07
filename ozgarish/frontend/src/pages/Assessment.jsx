import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Zap, Heart, Wind, Crosshair, Briefcase, TrendingUp } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const CRITERIA = [
  { key: 'intizom',   label: 'Intizom',    Icon: Zap,       desc: 'Qoidalarga rioya qilish',  color: 'text-yellow-400', bg: 'bg-yellow-400/10', bar: 'from-yellow-500 to-yellow-400' },
  { key: 'hurmat',    label: 'Hurmat',     Icon: Heart,     desc: 'Boshqalarga munosabat',     color: 'text-pink-400',   bg: 'bg-pink-400/10',   bar: 'from-pink-500 to-pink-400' },
  { key: 'sabr',      label: 'Sabr',       Icon: Wind,      desc: 'Qiyinchiliklarga chidash',  color: 'text-blue-400',   bg: 'bg-blue-400/10',   bar: 'from-blue-500 to-blue-400' },
  { key: 'diqqat',    label: 'Diqqat',     Icon: Crosshair, desc: "Vazifaga e'tibor",          color: 'text-green-400',  bg: 'bg-green-400/10',  bar: 'from-green-500 to-green-400' },
  { key: 'masuliyat', label: "Mas'uliyat", Icon: Briefcase, desc: 'Majburiyatlarni bajarish',  color: 'text-purple-400', bg: 'bg-purple-400/10', bar: 'from-purple-500 to-purple-400' },
]

const DEFAULT_SCORES = { intizom: 0, hurmat: 0, sabr: 0, diqqat: 0, masuliyat: 0 }

function getLabel(pct) {
  if (pct <= 30) return { text: 'Past',   color: 'text-red-400' }
  if (pct <= 60) return { text: "O'rta",  color: 'text-yellow-400' }
  if (pct <= 80) return { text: 'Yaxshi', color: 'text-blue-400' }
  return { text: "A'lo", color: 'text-green-400' }
}

export default function Assessment() {
  const { token } = useAuth()
  // scores 0-100 foiz sifatida saqlanadi
  const [scores, setScores] = useState(DEFAULT_SCORES)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  useEffect(() => { fetchToday(); fetchHistory() }, [])

  const fetchToday = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/assessment/today`, { headers })
      const data = await res.json()
      if (data?.scores) {
        // Eski 0-10 formatdan 0-100 ga convert
        const converted = {}
        Object.entries(data.scores).forEach(([k, v]) => {
          converted[k] = v <= 10 ? v * 10 : v
        })
        setScores(converted)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/api/assessment/history`, { headers })
      const data = await res.json()
      setHistory(Array.isArray(data) ? data.slice(0, 7) : [])
    } catch (e) { console.error(e) }
  }

  const setScore = (key, val) => {
    const clamped = Math.min(100, Math.max(0, val))
    setScores(s => {
      const updated = { ...s, [key]: clamped }
      // Avtomatik saqlash
      autoSave(updated)
      return updated
    })
  }

  const autoSave = async (updatedScores) => {
    try {
      await fetch(`${API}/api/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ scores: updatedScores })
      })
    } catch (e) { console.error(e) }
  }

  const avg = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5)
  const avgLabel = getLabel(avg)

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Kundalik Baholash</h2>
        <p className="text-xs text-white/40 mt-0.5">O'zingizni bugun qanday baholaysiz?</p>
      </div>

      {/* Average card */}
      <div className="card bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 mb-1">Bugungi o'rtacha</p>
            <div className="flex items-end gap-1">
              <span className="text-5xl font-bold text-white">{avg}</span>
              <span className="text-white/30 text-lg mb-1">%</span>
            </div>
            <span className={`text-sm font-medium ${avgLabel.color}`}>{avgLabel.text}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 items-end h-16">
            {CRITERIA.map(({ key, bar }) => (
              <div key={key} className="w-6 bg-white/10 rounded-md overflow-hidden h-full flex items-end">
                <div className={`w-full rounded-md bg-gradient-to-t ${bar} transition-all duration-500`}
                  style={{ height: `${scores[key]}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Criteria */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {CRITERIA.map(({ key, label, Icon, desc, color, bg, bar }) => {
            const lbl = getLabel(scores[key])
            return (
              <div key={key} className="card hover:bg-white/8 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                  <span className={`text-xs font-medium ${lbl.color} mr-1`}>{lbl.text}</span>
                </div>

                {/* Progress bar + input */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-300`}
                      style={{ width: `${scores[key]}%` }} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number" min="0" max="100"
                      value={scores[key] || ''}
                      placeholder="0"
                      onWheel={e => e.target.blur()}
                      onChange={e => setScore(key, +e.target.value || 0)}
                      className="w-14 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-primary"
                    />
                    <span className="text-xs text-white/40">%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-white/40" />
            <h3 className="text-sm font-semibold">So'nggi 7 kun</h3>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => {
              const vals = h.scores ? Object.values(h.scores) : []
              const hAvg = vals.length
                ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
                : 0
              // Eski 0-10 formatni aniqlash
              const normalized = hAvg <= 10 ? hAvg * 10 : hAvg
              const hLbl = getLabel(normalized)
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-white/30 w-24 flex-shrink-0">
                    {new Date(h.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                  </span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                      style={{ width: `${normalized}%` }} />
                  </div>
                  <span className={`text-xs font-medium w-12 text-right ${hLbl.color}`}>{normalized}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
