import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Calendar, X, CheckCircle, Circle,
  Zap, Heart, Wind, Crosshair, Briefcase,
  CheckSquare, Star, BarChart2, Target,
  Award, ChevronRight, Flame, Lock, Check,
  Sun, BookOpen, Dumbbell, Clock, BookMarked,
  Droplets, Brain, Music, Bike, Pencil
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ICON_MAP = {
  sun: Sun, book: BookOpen, dumbbell: Dumbbell, droplets: Droplets,
  target: Target, clock: Clock, flame: Flame, brain: Brain,
  music: Music, bike: Bike, pencil: Pencil, bookmark: BookMarked,
  star: Star, zap: Zap, heart: Heart, award: Award, check: CheckCircle
}

const ASSESS_META = {
  intizom:   { Icon: Zap,       color: 'text-yellow-400', bar: 'bg-yellow-400', label: 'Intizom' },
  hurmat:    { Icon: Heart,     color: 'text-pink-400',   bar: 'bg-pink-400',   label: 'Hurmat' },
  sabr:      { Icon: Wind,      color: 'text-blue-400',   bar: 'bg-blue-400',   label: 'Sabr' },
  diqqat:    { Icon: Crosshair, color: 'text-green-400',  bar: 'bg-green-400',  label: 'Diqqat' },
  masuliyat: { Icon: Briefcase, color: 'text-purple-400', bar: 'bg-purple-400', label: "Mas'uliyat" },
}

const GOAL_TYPES = {
  '7kun':   { label: '7 Kunlik',  color: 'text-blue-300',   bg: 'bg-blue-500/20 border-blue-500/30' },
  '30kun':  { label: '30 Kunlik', color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/30' },
  'yillik': { label: 'Yillik',    color: 'text-orange-300', bg: 'bg-orange-500/20 border-orange-500/30' },
}

const TABS = [
  { key: 'overview',   label: 'Umumiy',   Icon: BarChart2   },
  { key: 'habits',     label: 'Odatlar',  Icon: CheckSquare },
  { key: 'assessment', label: 'Baholash', Icon: Star        },
  { key: 'goals',      label: 'Maqsadlar',Icon: Target      },
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function getMonthLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })
}

function getIcon(key) {
  return ICON_MAP[key] || Target
}

export default function DailyHistory() {
  const { token } = useAuth()
  const [dates, setDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [dayData, setDayData] = useState(null)
  const [dayLoading, setDayLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetch(`${API}/api/daily-history/dates`, { headers })
      .then(r => r.json())
      .then(d => setDates(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openDay = async (dateStr) => {
    setSelected(dateStr)
    setActiveTab('overview')
    setDayData(null)
    setDayLoading(true)
    try {
      const res = await fetch(`${API}/api/daily-history/${dateStr}`, { headers })
      const data = await res.json()
      setDayData(data)
    } catch (e) { console.error(e) }
    finally { setDayLoading(false) }
  }

  const grouped = dates.reduce((acc, item) => {
    const dateStr = typeof item === 'string' ? item : item.date
    const month = getMonthLabel(dateStr)
    if (!acc[month]) acc[month] = []
    acc[month].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h2 className="text-xl font-bold">Kunlik tarix</h2>
        <p className="text-xs text-white/40 mt-0.5">Har kunlik faoliyatingiz arxivi</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : dates.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-white/30 gap-3">
          <Calendar size={40} />
          <p className="text-sm">Hali tarix yo'q</p>
          <p className="text-xs text-center">Odatlarni bajaring yoki baholash qiling</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthDates]) => (
            <div key={month}>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">{month}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {monthDates.map(item => {
                  const dateStr = typeof item === 'string' ? item : item.date
                  const stats = typeof item === 'object' ? item : null
                  const d = new Date(dateStr)
                  const isToday = dateStr === today
                  const habitPct = stats?.habitPercent ?? null
                  const assessAvg = stats?.assessAvg ?? null

                  return (
                    <button key={dateStr} onClick={() => openDay(dateStr)}
                      className={`card flex flex-col items-center gap-1 py-3 px-2 hover:bg-white/10 transition-all group text-center ${
                        isToday ? 'border-primary/50 bg-primary/10' : ''
                      }`}>
                      <span className="text-xs text-white/40">
                        {d.toLocaleDateString('uz-UZ', { weekday: 'short' })}
                      </span>
                      <span className={`text-2xl font-bold leading-none ${isToday ? 'text-primary-light' : 'text-white'}`}>
                        {d.getDate()}
                      </span>
                      {isToday && <span className="text-[10px] text-primary-light font-medium">Bugun</span>}

                      {/* Mini statistika */}
                      <div className="w-full mt-1 space-y-1">
                        {/* Odatlar progress */}
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              habitPct === null ? 'bg-white/10' :
                              habitPct >= 80 ? 'bg-green-400' :
                              habitPct >= 50 ? 'bg-yellow-400' : 'bg-orange-400'
                            }`}
                            style={{ width: `${habitPct ?? 0}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px]">
                          <span className={`${
                            habitPct === null ? 'text-white/20' :
                            habitPct >= 80 ? 'text-green-400' :
                            habitPct >= 50 ? 'text-yellow-400' : 'text-orange-400'
                          }`}>
                            {habitPct !== null ? `${habitPct}%` : '—'}
                          </span>
                          {assessAvg !== null && (
                            <span className="text-primary-light">{assessAvg}%</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Day detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#120a2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Calendar size={16} className="text-primary-light" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{formatDate(selected)}</p>
                  {selected === today && <p className="text-xs text-primary-light">Bugun</p>}
                </div>
              </div>
              <button onClick={() => { setSelected(null); setDayData(null) }}
                className="text-white/40 hover:text-white p-1 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-3 flex-shrink-0 overflow-x-auto">
              {TABS.map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === key ? 'bg-primary text-white' : 'text-white/50 hover:text-white hover:bg-white/10'
                  }`}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {dayLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : dayData ? (
                <>
                  {/* OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="card text-center">
                          <p className="text-2xl font-bold text-white">{dayData.habits?.completed ?? 0}/{dayData.habits?.total ?? 0}</p>
                          <p className="text-xs text-white/40 mt-1">Odatlar</p>
                        </div>
                        <div className="card text-center">
                          <p className="text-2xl font-bold text-yellow-400">{dayData.assessment?.avg ?? '—'}%</p>
                          <p className="text-xs text-white/40 mt-1">Baholash</p>
                        </div>
                        <div className="card text-center">
                          <p className="text-2xl font-bold text-blue-400">
                            {dayData.goals?.filter(g => g.done).length ?? 0}/{dayData.goals?.length ?? 0}
                          </p>
                          <p className="text-xs text-white/40 mt-1">Maqsadlar</p>
                        </div>
                      </div>

                      {/* Habits progress */}
                      <div className="card">
                        <div className="flex justify-between text-xs text-white/40 mb-2">
                          <span>Odatlar progressi</span>
                          <span>{dayData.habits?.percent ?? 0}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            style={{ width: `${dayData.habits?.percent ?? 0}%` }} />
                        </div>
                      </div>

                      {/* Quick habits */}
                      {dayData.habits?.list?.length > 0 && (
                        <div className="card">
                          <p className="text-xs text-white/40 mb-3">Odatlar holati</p>
                          <div className="grid grid-cols-2 gap-2">
                            {dayData.habits.list.map(h => {
                              const Icon = getIcon(h.icon)
                              return (
                                <div key={h._id} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${
                                  h.done ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5'
                                }`}>
                                  <Icon size={13} className={h.done ? 'text-primary-light' : 'text-white/20'} />
                                  <span className={`flex-1 truncate ${h.done ? 'text-white/70' : 'text-white/30'}`}>{h.name}</span>
                                  {h.done
                                    ? <CheckCircle size={11} className="text-primary flex-shrink-0" />
                                    : <Circle size={11} className="text-white/20 flex-shrink-0" />
                                  }
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* HABITS */}
                  {activeTab === 'habits' && (
                    <div className="space-y-2">
                      {!dayData.habits?.list?.length ? (
                        <p className="text-center text-white/30 py-8 text-sm">Bu kunda odat yo'q</p>
                      ) : dayData.habits.list.map(h => {
                        const Icon = getIcon(h.icon)
                        return (
                          <div key={h._id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                            h.done ? 'border-primary/30 bg-primary/10' : 'border-white/8 bg-white/5'
                          }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${h.done ? 'bg-primary/20' : 'bg-white/10'}`}>
                              <Icon size={15} className={h.done ? 'text-primary-light' : 'text-white/40'} />
                            </div>
                            <span className={`flex-1 text-sm ${h.done ? 'text-white/80' : 'text-white/30 line-through'}`}>{h.name}</span>
                            {h.todayRating != null && h.todayRating > 0 && (
                              <span className="text-xs text-white/40">{h.todayRating}%</span>
                            )}
                            {h.done
                              ? <CheckCircle size={16} className="text-primary" />
                              : <Circle size={16} className="text-white/20" />
                            }
                          </div>
                        )
                      })}
                      <div className="card flex justify-between items-center mt-2">
                        <span className="text-sm text-white/50">Jami</span>
                        <span className="font-bold text-primary-light">
                          {dayData.habits?.completed}/{dayData.habits?.total} ({dayData.habits?.percent}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ASSESSMENT */}
                  {activeTab === 'assessment' && (
                    <div className="space-y-3">
                      {!dayData.assessment ? (
                        <div className="flex flex-col items-center justify-center py-12 text-white/30 gap-2">
                          <Star size={32} />
                          <p className="text-sm">Bu kunda baholash yo'q</p>
                        </div>
                      ) : (
                        <>
                          <div className="card text-center">
                            <p className="text-4xl font-bold text-primary-light">{dayData.assessment.avg}%</p>
                            <p className="text-xs text-white/40 mt-1">O'rtacha ball</p>
                          </div>
                          {Object.entries(dayData.assessment.scores || {}).map(([key, val]) => {
                            const meta = ASSESS_META[key]
                            if (!meta) return null
                            const { Icon, color, bar, label } = meta
                            const normalized = val <= 10 ? val * 10 : val
                            return (
                              <div key={key} className="card">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon size={14} className={color} />
                                    <span className="text-sm">{label}</span>
                                  </div>
                                  <span className="font-bold text-white text-sm">{normalized}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className={`h-full ${bar} rounded-full`} style={{ width: `${normalized}%` }} />
                                </div>
                              </div>
                            )
                          })}
                        </>
                      )}
                    </div>
                  )}

                  {/* GOALS */}
                  {activeTab === 'goals' && (
                    <div className="space-y-2">
                      {!dayData.goals?.length ? (
                        <div className="flex flex-col items-center justify-center py-12 text-white/30 gap-2">
                          <Target size={32} />
                          <p className="text-sm">Bu kunda maqsad yo'q</p>
                        </div>
                      ) : (
                        <>
                          {['7kun', '30kun', 'yillik'].map(type => {
                            const list = dayData.goals.filter(g => g.type === type)
                            if (!list.length) return null
                            const meta = GOAL_TYPES[type]
                            return (
                              <div key={type}>
                                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs border font-medium mb-2 ${meta.bg} ${meta.color}`}>
                                  {meta.label}
                                </span>
                                {list.map(g => {
                                  const Icon = getIcon(g.icon)
                                  return (
                                    <div key={g._id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-1.5 ${
                                      g.done ? 'border-green-500/20 bg-green-500/5' : 'border-white/8 bg-white/5'
                                    }`}>
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${g.done ? 'bg-green-500/20' : 'bg-white/10'}`}>
                                        <Icon size={13} className={g.done ? 'text-green-400' : 'text-white/40'} />
                                      </div>
                                      <span className={`flex-1 text-sm ${g.done ? 'text-white/70' : 'text-white/40 line-through'}`}>{g.text}</span>
                                      {g.done
                                        ? <Check size={15} className="text-green-400" />
                                        : <Lock size={13} className="text-white/20" />
                                      }
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
