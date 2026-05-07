import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Plus, Trash2, CheckCircle, Circle, X, Pencil,
  Target, Star, Flame, BookOpen, Dumbbell, Brain,
  Music, Droplets, Sun, Clock, Bike, Heart, Zap, Award
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TYPES = [
  { key: '7kun',   label: '7 Kunlik',  color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',      dot: 'bg-blue-400' },
  { key: '30kun',  label: '30 Kunlik', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
  { key: 'yillik', label: 'Yillik',    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' },
]

const ICONS = [
  { key: 'target',   Icon: Target   },
  { key: 'star',     Icon: Star     },
  { key: 'flame',    Icon: Flame    },
  { key: 'book',     Icon: BookOpen },
  { key: 'dumbbell', Icon: Dumbbell },
  { key: 'brain',    Icon: Brain    },
  { key: 'music',    Icon: Music    },
  { key: 'droplets', Icon: Droplets },
  { key: 'sun',      Icon: Sun      },
  { key: 'clock',    Icon: Clock    },
  { key: 'bike',     Icon: Bike     },
  { key: 'heart',    Icon: Heart    },
  { key: 'zap',      Icon: Zap      },
  { key: 'award',    Icon: Award    },
]

function getIcon(key) {
  return ICONS.find(i => i.key === key)?.Icon || Target
}

function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {ICONS.map(({ key, Icon }) => (
        <button key={key} type="button" onClick={() => onChange(key)}
          className={`flex items-center justify-center h-9 rounded-xl border transition-all ${
            value === key
              ? 'border-primary bg-primary/20 text-white'
              : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white/70'
          }`}>
          <Icon size={15} />
        </button>
      ))}
    </div>
  )
}

export default function Goals() {
  const { token } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [input, setInput] = useState('')
  const [type, setType] = useState('7kun')
  const [icon, setIcon] = useState('target')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editGoal, setEditGoal] = useState(null)
  const [editInput, setEditInput] = useState('')
  const [editType, setEditType] = useState('7kun')
  const [editIcon, setEditIcon] = useState('target')

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  useEffect(() => {
    fetch(`${API}/api/goals`, { headers })
      .then(r => r.json())
      .then(d => setGoals(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const closeAdd = () => { setShowAdd(false); setInput(''); setType('7kun'); setIcon('target') }

  const add = async () => {
    if (!input.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/goals`, {
        method: 'POST', headers,
        body: JSON.stringify({ text: input.trim(), type, icon })
      })
      const data = await res.json()
      if (data._id) { setGoals(g => [data, ...g]); closeAdd() }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const toggle = async (id) => {
    setGoals(g => g.map(x => x._id === id ? { ...x, done: !x.done } : x))
    try {
      const res = await fetch(`${API}/api/goals/${id}/toggle`, { method: 'PATCH', headers })
      const updated = await res.json()
      setGoals(g => g.map(x => x._id === id ? updated : x))
    } catch (e) {
      setGoals(g => g.map(x => x._id === id ? { ...x, done: !x.done } : x))
    }
  }

  const openEdit = (g) => { setEditGoal(g); setEditInput(g.text); setEditType(g.type); setEditIcon(g.icon || 'target') }

  const saveEdit = async () => {
    if (!editInput.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/goals/${editGoal._id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ text: editInput.trim(), type: editType, icon: editIcon })
      })
      const updated = await res.json()
      setGoals(g => g.map(x => x._id === updated._id ? updated : x))
      setEditGoal(null)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const confirmRemove = async () => {
    const id = confirmDelete
    setConfirmDelete(null)
    setGoals(g => g.filter(x => x._id !== id))
    try { await fetch(`${API}/api/goals/${id}`, { method: 'DELETE', headers }) }
    catch (e) { console.error(e) }
  }

  const done = goals.filter(g => g.done).length

  return (
    <div className="space-y-5 pb-8">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Maqsadlar</h2>
          <p className="text-xs text-white/40 mt-0.5">{done}/{goals.length} maqsad bajarildi</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark transition-all px-4 py-2 rounded-xl text-sm font-medium">
          <Plus size={16} /> Yangi maqsad
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-white/30 gap-3">
          <Target size={36} />
          <p className="text-sm">Hali maqsad qo'shilmagan</p>
          <button onClick={() => setShowAdd(true)} className="text-primary-light text-sm hover:text-white transition-colors">
            Birinchi maqsadni qo'shing
          </button>
        </div>
      ) : (
        TYPES.map(t => {
          const filtered = goals.filter(g => g.type === t.key)
          if (!filtered.length) return null
          const typeDone = filtered.filter(g => g.done).length
          return (
            <div key={t.key} className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-1 rounded-lg text-xs border font-medium ${t.color}`}>{t.label}</span>
                <span className="text-white/30 text-xs">{typeDone}/{filtered.length}</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden ml-1">
                  <div className={`h-full ${t.dot} rounded-full transition-all`}
                    style={{ width: `${filtered.length ? typeDone / filtered.length * 100 : 0}%` }} />
                </div>
              </div>
              {filtered.map(g => {
                const Icon = getIcon(g.icon)
                return (
                  <div key={g._id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    g.done ? 'border-white/10 bg-white/5' : 'border-white/8 bg-white/5 hover:bg-white/8'
                  }`}>
                    <button onClick={() => toggle(g._id)} className="flex-shrink-0">
                      {g.done
                        ? <CheckCircle size={20} className="text-green-400" />
                        : <Circle size={20} className="text-white/20 hover:text-white/50 transition-colors" />
                      }
                    </button>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${g.done ? 'bg-white/5' : 'bg-primary/20'}`}>
                      <Icon size={15} className={g.done ? 'text-white/20' : 'text-primary-light'} />
                    </div>
                    <span className={`flex-1 text-sm ${g.done ? 'line-through text-white/30' : 'text-white/90'}`}>
                      {g.text}
                    </span>
                    <button onClick={() => openEdit(g)}
                      className="p-1.5 text-blue-400/60 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all flex-shrink-0">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(g._id)}
                      className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1a0f3a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Yangi maqsad</h3>
              <button onClick={closeAdd} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Maqsad matni</label>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && add()} autoFocus
                  placeholder="Masalan: Har kuni kitob o'qish"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Ikonka</label>
                <IconPicker value={icon} onChange={setIcon} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Muddat</label>
                <div className="flex gap-2">
                  {TYPES.map(t => (
                    <button key={t.key} onClick={() => setType(t.key)}
                      className={`flex-1 py-2 rounded-xl text-xs border transition-all ${type === t.key ? t.color : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={closeAdd}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">
                  Bekor qilish
                </button>
                <button onClick={add} disabled={!input.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-40">
                  {saving ? 'Saqlanmoqda...' : "Qo'shish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1a0f3a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Maqsadni tahrirlash</h3>
              <button onClick={() => setEditGoal(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Maqsad matni</label>
                <input value={editInput} onChange={e => setEditInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()} autoFocus
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Ikonka</label>
                <IconPicker value={editIcon} onChange={setEditIcon} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Muddat</label>
                <div className="flex gap-2">
                  {TYPES.map(t => (
                    <button key={t.key} onClick={() => setEditType(t.key)}
                      className={`flex-1 py-2 rounded-xl text-xs border transition-all ${editType === t.key ? t.color : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditGoal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">
                  Bekor qilish
                </button>
                <button onClick={saveEdit} disabled={!editInput.trim() || saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-40">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
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
            <p className="font-semibold text-center mb-2">Maqsadni o'chirish</p>
            <p className="text-white/50 text-sm text-center mb-5">Bu maqsad butunlay o'chib ketadi. Ishonchingiz komilmi?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">
                Bekor qilish
              </button>
              <button onClick={confirmRemove}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
