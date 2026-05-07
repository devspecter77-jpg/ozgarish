import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Flame, Dumbbell, BookOpen, Target, Star, Trophy,
  Check, Lock, Award, Zap, Heart, CheckCircle, TrendingUp
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const LEVELS = [
  { level: 1, name: "Boshlang'ich", minXP: 0,    color: 'text-gray-400',   bg: 'bg-gray-400/10' },
  { level: 2, name: 'Rivojlanuvchi', minXP: 100,  color: 'text-green-400',  bg: 'bg-green-400/10' },
  { level: 3, name: 'Intizomli',     minXP: 300,  color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  { level: 4, name: 'Ustoz',         minXP: 600,  color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { level: 5, name: 'Mukammal',      minXP: 1000, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
]

// Badge shartlari — real datadan hisoblanadi
function calcBadges({ habits, goals, assessHistory, streak }) {
  const completedHabits = habits.filter(h => h.done).length
  const totalHabitDays = habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0)
  const completedGoals = goals.filter(g => g.done).length
  const todayAvg = (() => {
    const today = new Date().toISOString().split('T')[0]
    const a = assessHistory.find(h => h.date === today)
    if (!a?.scores) return 0
    return Math.round(Object.values(a.scores).reduce((a, b) => a + b, 0) / 5)
  })()
  const allHabitsDoneToday = habits.length > 0 && completedHabits === habits.length

  return [
    {
      id: 1, Icon: Flame, name: '7 Kunlik Streak',
      desc: '7 kun ketma-ket baholash',
      color: 'text-orange-400', bg: 'bg-orange-400/10',
      earned: streak >= 7,
      progress: Math.min(streak, 7), total: 7,
      hint: `${streak}/7 kun`
    },
    {
      id: 2, Icon: CheckCircle, name: 'Odat Ustasi',
      desc: '50 marta odat bajaring',
      color: 'text-green-400', bg: 'bg-green-400/10',
      earned: totalHabitDays >= 50,
      progress: Math.min(totalHabitDays, 50), total: 50,
      hint: `${totalHabitDays}/50 marta`
    },
    {
      id: 3, Icon: Target, name: 'Maqsadga Erishdi',
      desc: '3 ta maqsadni bajaring',
      color: 'text-blue-400', bg: 'bg-blue-400/10',
      earned: completedGoals >= 3,
      progress: Math.min(completedGoals, 3), total: 3,
      hint: `${completedGoals}/3 maqsad`
    },
    {
      id: 4, Icon: Star, name: 'Mukammal Kun',
      desc: 'Barcha odatlarni bir kunda bajaring',
      color: 'text-yellow-400', bg: 'bg-yellow-400/10',
      earned: allHabitsDoneToday,
      progress: allHabitsDoneToday ? 1 : 0, total: 1,
      hint: allHabitsDoneToday ? 'Bajarildi!' : 'Bugun barcha odatlarni bajaring'
    },
    {
      id: 5, Icon: Zap, name: 'Yuqori Baholash',
      desc: 'Baholashda 80% dan yuqori',
      color: 'text-purple-400', bg: 'bg-purple-400/10',
      earned: todayAvg >= 80,
      progress: Math.min(todayAvg, 80), total: 80,
      hint: `${todayAvg}/80%`
    },
    {
      id: 6, Icon: Trophy, name: '30 Kunlik Chempion',
      desc: '30 kun ketma-ket baholash',
      color: 'text-pink-400', bg: 'bg-pink-400/10',
      earned: streak >= 30,
      progress: Math.min(streak, 30), total: 30,
      hint: `${streak}/30 kun`
    },
    {
      id: 7, Icon: BookOpen, name: 'Maqsad Yig\'uvchi',
      desc: '10 ta maqsad qo\'shing',
      color: 'text-cyan-400', bg: 'bg-cyan-400/10',
      earned: goals.length >= 10,
      progress: Math.min(goals.length, 10), total: 10,
      hint: `${goals.length}/10 maqsad`
    },
    {
      id: 8, Icon: Heart, name: 'Doimiy Foydalanuvchi',
      desc: '7 kun baholash tarixi',
      color: 'text-red-400', bg: 'bg-red-400/10',
      earned: assessHistory.length >= 7,
      progress: Math.min(assessHistory.length, 7), total: 7,
      hint: `${assessHistory.length}/7 kun`
    },
  ]
}

export default function Rewards() {
  const { token } = useAuth()
  const [habits, setHabits] = useState([])
  const [goals, setGoals] = useState([])
  const [assessHistory, setAssessHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/habits`, { headers }).then(r => r.json()),
      fetch(`${API}/api/goals`, { headers }).then(r => r.json()),
      fetch(`${API}/api/assessment/history`, { headers }).then(r => r.json()),
    ]).then(([hab, gls, hist]) => {
      setHabits(Array.isArray(hab) ? hab : [])
      setGoals(Array.isArray(gls) ? gls : [])
      setAssessHistory(Array.isArray(hist) ? hist : [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // XP hisoblash
  const totalHabitDays = habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0)
  const completedGoals = goals.filter(g => g.done).length
  const totalXP = totalHabitDays * 10 + completedGoals * 50 + assessHistory.length * 5

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

  const currentLevel = [...LEVELS].reverse().find(l => totalXP >= l.minXP) || LEVELS[0]
  const nextLevel = LEVELS.find(l => l.minXP > totalXP) || LEVELS[LEVELS.length - 1]
  const xpToNext = nextLevel.minXP - totalXP
  const levelProgress = nextLevel.minXP > currentLevel.minXP
    ? Math.round((totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP) * 100)
    : 100

  const badges = calcBadges({ habits, goals, assessHistory, streak })
  const earnedCount = badges.filter(b => b.earned).length

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5 pb-8">

      <div>
        <h2 className="text-xl font-bold">Mukofotlar</h2>
        <p className="text-xs text-white/40 mt-0.5">{earnedCount}/{badges.length} badge qo'lga kiritildi</p>
      </div>

      {/* Level card */}
      <div className="card bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent border-primary/20">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl ${currentLevel.bg} border border-white/10 flex items-center justify-center`}>
            <span className={`text-2xl font-bold ${currentLevel.color}`}>{currentLevel.level}</span>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${currentLevel.color}`}>{currentLevel.name}</h3>
            <p className="text-white/50 text-sm">{totalXP} XP</p>
            {nextLevel.minXP > totalXP && (
              <p className="text-xs text-white/30">Keyingi daraja uchun {xpToNext} XP kerak</p>
            )}
          </div>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
            style={{ width: `${levelProgress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-1.5">
          <span>{currentLevel.minXP} XP</span>
          <span className={`font-medium ${currentLevel.color}`}>{levelProgress}%</span>
          <span>{nextLevel.minXP} XP</span>
        </div>
      </div>

      {/* XP breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Odatlardan', value: `${totalHabitDays * 10}`, sub: `${totalHabitDays} × 10 XP`, color: 'text-green-400' },
          { label: 'Maqsadlardan', value: `${completedGoals * 50}`, sub: `${completedGoals} × 50 XP`, color: 'text-blue-400' },
          { label: 'Baholashdan', value: `${assessHistory.length * 5}`, sub: `${assessHistory.length} × 5 XP`, color: 'text-yellow-400' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-white/50 mt-0.5">{label}</p>
            <p className="text-[10px] text-white/25 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Darajalar */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-white/40" />
          <h3 className="text-sm font-semibold">Darajalar</h3>
        </div>
        <div className="space-y-2">
          {LEVELS.map(l => {
            const reached = totalXP >= l.minXP
            return (
              <div key={l.level} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                reached ? 'bg-white/5' : 'opacity-40'
              } ${currentLevel.level === l.level ? 'border border-primary/30 bg-primary/10' : ''}`}>
                <div className={`w-8 h-8 rounded-lg ${l.bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-sm font-bold ${l.color}`}>{l.level}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${l.color}`}>{l.name}</p>
                  <p className="text-xs text-white/30">{l.minXP} XP dan</p>
                </div>
                {currentLevel.level === l.level
                  ? <span className="text-xs text-primary-light font-medium">Hozir</span>
                  : reached
                    ? <Check size={16} className="text-green-400" />
                    : <Lock size={14} className="text-white/20" />
                }
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-white/40" />
          <h3 className="text-sm font-semibold">Badge'lar</h3>
          <span className="text-xs text-white/30 ml-auto">{earnedCount}/{badges.length}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map(({ id, Icon, name, desc, earned, color, bg, progress, total, hint }) => (
            <div key={id} className={`card flex flex-col items-center text-center transition-all ${
              earned ? 'border-white/15' : 'opacity-50'
            }`}>
              <div className={`w-12 h-12 rounded-2xl ${earned ? bg : 'bg-white/5'} flex items-center justify-center mb-3`}>
                <Icon size={22} className={earned ? color : 'text-white/20'} />
              </div>
              <p className="font-medium text-xs leading-tight mb-1">{name}</p>
              <p className="text-[10px] text-white/30 mb-2">{desc}</p>
              {/* Mini progress */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
                <div className={`h-full rounded-full transition-all ${earned ? bg.replace('/10', '') : 'bg-white/20'}`}
                  style={{ width: `${Math.round(progress / total * 100)}%` }} />
              </div>
              <span className={`text-[10px] ${earned ? color : 'text-white/20'}`}>
                {earned ? "Qo'lga kiritildi" : hint}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
