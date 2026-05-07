import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  CheckCircle, Circle, Plus, Trash2, X,
  Sun, BookOpen, Dumbbell, Clock, BookMarked,
  Flame, Target, Brain, Music, Droplets, Bike, Pencil
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ICONS = [
  { key: 'sun',       Icon: Sun,       label: 'Erta turish' },
  { key: 'book',      Icon: BookOpen,  label: 'Kitob' },
  { key: 'dumbbell',  Icon: Dumbbell,  label: 'Sport' },
  { key: 'clock',     Icon: Clock,     label: 'Vaqt' },
  { key: 'bookmark',  Icon: BookMarked,label: 'O\'qish' },
  { key: 'flame',     Icon: Flame,     label: 'Motivatsiya' },
  { key: 'target',    Icon: Target,    label: 'Maqsad' },
  { key: 'brain',     Icon: Brain,     label: 'Aql' },
  { key: 'music',     Icon: Music,     label: 'Musiqa' },
  { key: 'droplets',  Icon: Droplets,  label: 'Suv' },
  { key: 'bike',      Icon: Bike,      label: 'Velosiped' },
  { key: 'pencil',    Icon: Pencil,    label: 'Yozish' },
]

function getIcon(key) {
  return ICONS.find(i => i.key === key)?.Icon || Target
}

export default function Habits() {
  const { token } = useAuth()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('target')
  const [saving, setSaving] = useState(false)
  const [editHabit, setEditHabit] = useState(null) // { _id, name, icon }
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/habits`, { headers })
      const data = await res.json()
      setHabits(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggle = async (id) => {
    // Optimistic update
    setHabits(h => h.map(x => x._id === id ? { ...x, done: !x.done } : x))
    try {
      const res = await fetch(`${API}/api/habits/${id}/toggle`, { method: 'PATCH', headers })
      const updated = await res.json()
      setHabits(h => h.map(x => x._id === id ? { ...x, done: updated.done } : x))
    } catch (e) {
      // Revert on error
      setHabits(h => h.map(x => x._id === id ? { ...x, done: !x.done } : x))
    }
  }

  const addHabit = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/habits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newName.trim(), icon: newIcon })
      })
      const data = await res.json()
      setHabits(h => [...h, { ...data, done: false }])
      setNewName('')
      setNewIcon('target')
      setShowAdd(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const [confirmDelete, setConfirmDelete] = useState(null) // habit id

  const deleteHabit = async (id) => {
    setConfirmDelete(null)
    setHabits(h => h.filter(x => x._id !== id))
    try {
      await fetch(`${API}/api/habits/${id}`, { method: 'DELETE', headers })
    } catch (e) {
      console.error(e)
    }
  }

  const openEdit = (e, habit) => {
    e.stopPropagation()
    setEditHabit(habit)
    setEditName(habit.name)
    setEditIcon(habit.icon || 'target')
  }

  const saveEdit = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/habits/${editHabit._id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ name: editName.trim(), icon: editIcon })
      })
      const updated = await res.json()
      // todayRating va done ni saqlab qolamiz
      setHabits(h => h.map(x =>
        x._id === updated._id
          ? { ...updated, done: x.done, todayRating: x.todayRating }
          : x
      ))
      setEditHabit(null)
      setEditName('')
      setEditIcon('')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const rateHabit = async (id, percent) => {
    setHabits(h => h.map(x => x._id === id ? { ...x, todayRating: percent } : x))
    try {
      await fetch(`${API}/api/habits/${id}/rate`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ percent })
      })
    } catch (e) {
      console.error(e)
    }
  }

  const completedCount = habits.filter(h => h.done).length
  const progress = habits.length ? (completedCount / habits.length) * 100 : 0

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Odatlar</h2>
          <p className="text-xs text-white/40 mt-0.5">Kunlik odatlaringizni kuzating</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark transition-all px-4 py-2 rounded-xl text-sm font-medium">
          <Plus size={16} /> Yangi odat
        </button>
      </div>

      {/* Progress summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold">{completedCount}<span className="text-white/30 text-base font-normal">/{habits.length}</span></p>
            <p className="text-xs text-white/40">bugun bajarildi</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-light">{Math.round(progress)}%</p>
            <p className="text-xs text-white/40">progress</p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Habits list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : habits.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-white/30 gap-3">
          <Target size={36} />
          <p className="text-sm">Hali odat qo'shilmagan</p>
          <button onClick={() => setShowAdd(true)}
            className="text-primary-light text-sm hover:text-white transition-colors">
            Birinchi odatni qo'shing
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map(habit => {
            const Icon = getIcon(habit.icon)
            return (
              <div key={habit._id}
                className={`group flex flex-col rounded-2xl border px-4 py-3.5 transition-all ${
                  habit.done
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-white/8 bg-white/5 hover:bg-white/8 hover:border-white/15'
                }`}>

                {/* Top row */}
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggle(habit._id)}>
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    habit.done ? 'bg-primary' : 'bg-white/10'
                  }`}>
                    <Icon size={18} className={habit.done ? 'text-white' : 'text-white/50'} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm transition-all ${habit.done ? 'line-through text-white/30' : 'text-white'}`}>
                      {habit.name}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {habit.done ? '+10 XP qo\'shildi' : 'Bajarish uchun bosing'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {habit.done
                      ? <CheckCircle size={20} className="text-primary flex-shrink-0" />
                      : <Circle size={20} className="text-white/20 flex-shrink-0" />
                    }
                    <button onClick={e => openEdit(e, habit)}
                      className="p-1.5 text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10 transition-all rounded-lg">
                      <Pencil size={14} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(habit._id) }}
                      className="p-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Rating row */}
                <div className="mt-3 pt-3 border-t border-white/5" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/40 flex-shrink-0">Qoniqish:</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${
                        (habit.todayRating ?? 0) >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                        (habit.todayRating ?? 0) >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                        (habit.todayRating ?? 0) > 0  ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                        'bg-white/10'
                      }`} style={{ width: `${habit.todayRating ?? 0}%` }} />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <input
                        type="number" min="0" max="100"
                        value={habit.todayRating ?? ''}
                        placeholder="0"
                        onWheel={e => e.target.blur()}
                        onChange={e => {
                          const val = Math.min(100, Math.max(0, +e.target.value || 0))
                          rateHabit(habit._id, val)
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            e.target.blur()
                            if (!habit.done) toggle(habit._id)
                          }
                        }}
                        className="w-14 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-primary"
                      />
                      <span className="text-xs text-white/40">%</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* All done banner */}
      {habits.length > 0 && completedCount === habits.length && (
        <div className="card border-primary/30 bg-gradient-to-r from-primary/20 to-secondary/20 text-center py-6">
          <CheckCircle size={32} className="mx-auto mb-2 text-primary-light" />
          <h3 className="font-bold">Barcha odatlar bajarildi!</h3>
          <p className="text-white/50 text-sm mt-1">Ajoyib natija. Bugun siz g'olib bo'ldingiz.</p>
        </div>
      )}

      {/* Add habit modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1a0f3a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Yangi odat qo'shish</h3>
              <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Odat nomi</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addHabit()}
                  autoFocus
                  placeholder="Masalan: Kitob o'qish"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Ikonka tanlang</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONS.map(({ key, Icon }) => (
                    <button key={key} onClick={() => setNewIcon(key)}
                      className={`flex items-center justify-center h-10 rounded-xl border transition-all ${
                        newIcon === key
                          ? 'border-primary bg-primary/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30'
                      }`}>
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">
                  Bekor qilish
                </button>
                <button onClick={addHabit} disabled={!newName.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-40">
                  {saving ? 'Saqlanmoqda...' : 'Qo\'shish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1a0f3a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <p className="font-semibold text-center mb-2">Odatni o'chirish</p>
            <p className="text-white/50 text-sm text-center mb-5">
              Bu odat va uning barcha tarixi butunlay o'chib ketadi. Ishonchingiz komilmi?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">
                Bekor qilish
              </button>
              <button onClick={() => deleteHabit(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit habit modal */}
      {editHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1a0f3a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Odatni tahrirlash</h3>
              <button onClick={() => setEditHabit(null)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Odat nomi</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()}
                  autoFocus
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Ikonka</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONS.map(({ key, Icon }) => (
                    <button key={key} onClick={() => setEditIcon(key)}
                      className={`flex items-center justify-center h-10 rounded-xl border transition-all ${
                        editIcon === key
                          ? 'border-primary bg-primary/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30'
                      }`}>
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditHabit(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">
                  Bekor qilish
                </button>
                <button onClick={saveEdit} disabled={!editName.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-40">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
