import { useState, useEffect } from 'react'
import { useNavigate, NavLink, Routes, Route, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BarChart2, Settings,
  LogOut, Shield, Trash2, ChevronRight, X,
  CheckCircle, Target, Star, MessageCircle,
  Activity, Calendar, TrendingUp, Menu, Home, Pencil
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function useAdminHeaders() {
  const token = localStorage.getItem('adminToken')
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
}

// ── Sidebar ──────────────────────────────────────────────
function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('adminToken'); navigate('/admin/login') }

  const links = [
    { to: '/admin',          label: 'Dashboard',        Icon: LayoutDashboard, end: true },
    { to: '/admin/users',    label: 'Foydalanuvchilar', Icon: Users },
    { to: '/admin/stats',    label: 'Statistika',       Icon: BarChart2 },
    { to: '/admin/settings', label: 'Sozlamalar',       Icon: Settings },
  ]

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-56 bg-[#0d0820] border-r border-white/10 flex flex-col z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
          <Shield size={18} className="text-primary-light" />
          <span className="font-bold text-sm text-primary-light">Admin Panel</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive ? 'bg-primary text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'
                }`
              }>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
          {/* Bosh sahifa — logout qilmasdan */}
          <button onClick={() => { onClose(); navigate('/dashboard') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/10 hover:text-white transition-all w-full">
            <Home size={17} /> Bosh sahifa
          </button>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:bg-red-400/10 hover:text-red-400 transition-all w-full">
            <LogOut size={17} /> Admin chiqish
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Dashboard ─────────────────────────────────────────────
function AdminDashboard() {
  const headers = useAdminHeaders()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/admin/stats`, { headers })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p className="text-xs text-white/40 mt-0.5">Umumiy ko'rinish</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Foydalanuvchilar', value: stats?.totalUsers ?? 0,  Icon: Users,          color: 'text-blue-400',   bg: 'bg-blue-400/10' },
          { label: 'Bugun faol',       value: stats?.activeToday ?? 0, Icon: Activity,       color: 'text-green-400',  bg: 'bg-green-400/10' },
          { label: 'Odatlar',          value: stats?.totalHabits ?? 0, Icon: CheckCircle,    color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Maqsadlar',        value: stats?.totalGoals ?? 0,  Icon: Target,         color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Chatlar',          value: stats?.totalChats ?? 0,  Icon: MessageCircle,  color: 'text-pink-400',   bg: 'bg-pink-400/10' },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="card flex flex-col gap-2">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-white/40">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Notification ─────────────────────────────────────────
function Notify({ msg, type }) {
  if (!msg) return null
  return (
    <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
      type === 'error' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'
    }`}>
      {msg}
    </div>
  )
}

// ── Users ─────────────────────────────────────────────────
function AdminUsers() {
  const headers = useAdminHeaders()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [tab, setTab] = useState('habits')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', email: '' })
  const [search, setSearch] = useState('')
  const [notify, setNotify] = useState({ msg: '', type: 'success' })

  const showNotify = (msg, type = 'success') => {
    setNotify({ msg, type })
    setTimeout(() => setNotify({ msg: '', type: 'success' }), 2500)
  }

  useEffect(() => {
    fetch(`${API}/api/admin/users`, { headers })
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openUser = async (user) => {
    setSelectedUser(user)
    setTab('habits')
    setUserStats(null)
    const data = await fetch(`${API}/api/admin/users/${user._id}/stats`, { headers }).then(r => r.json())
    setUserStats(data)
  }

  const deleteUser = async () => {
    const id = confirmDelete
    setConfirmDelete(null)
    setUsers(u => u.filter(x => x._id !== id))
    if (selectedUser?._id === id) setSelectedUser(null)
    await fetch(`${API}/api/admin/users/${id}`, { method: 'DELETE', headers })
    showNotify("Foydalanuvchi o'chirildi")
  }

  const openEdit = (u) => {
    setEditUser(u)
    setEditForm({ fullName: u.fullName || '', phone: u.phone || '', email: u.email || '' })
  }

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API}/api/admin/users/${editUser._id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify(editForm)
      })
      const updated = await res.json()
      if (!res.ok) return showNotify(updated.error || 'Xatolik', 'error')
      setUsers(u => u.map(x => x._id === updated._id ? updated : x))
      setEditUser(null)
      showNotify('Saqlandi')
    } catch { showNotify('Xatolik', 'error') }
  }

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Foydalanuvchilar</h2>
          <p className="text-xs text-white/40 mt-0.5">{users.length} ta ro'yxatdan o'tgan</p>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Ism, telefon yoki email bo'yicha qidirish..."
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-primary" />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/30 text-xs border-b border-white/10">
              <th className="text-left pb-3 font-medium">Foydalanuvchi</th>
              <th className="text-left pb-3 font-medium">Kontakt</th>
              <th className="text-center pb-3 font-medium">Level</th>
              <th className="text-center pb-3 font-medium">Sana</th>
              <th className="text-center pb-3 font-medium">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(u => (
              <tr key={u._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {u.avatar
                      ? <img src={u.avatar} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      : <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-light flex-shrink-0">
                          {u.fullName?.[0]}
                        </div>
                    }
                    <div>
                      <p className="text-white/80 font-medium">{u.fullName}</p>
                      {u.googleId && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Google</span>}
                    </div>
                  </div>
                </td>
                <td className="py-3 text-white/40 text-xs">{u.phone || u.email || '—'}</td>
                <td className="py-3 text-center">
                  <span className="text-xs bg-primary/20 text-primary-light px-2 py-0.5 rounded-full">Lv.{u.level}</span>
                </td>
                <td className="py-3 text-center text-xs text-white/40">
                  {new Date(u.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openUser(u)}
                      className="p-1.5 text-blue-400/60 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all" title="Batafsil">
                      <ChevronRight size={14} />
                    </button>
                    <button onClick={() => openEdit(u)}
                      className="p-1.5 text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all" title="Tahrirlash">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(u._id)}
                      className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="O'chirish">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-white/30 py-8 text-sm">Foydalanuvchi topilmadi</p>
        )}
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#120a2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                {selectedUser.avatar
                  ? <img src={selectedUser.avatar} className="w-9 h-9 rounded-full object-cover" />
                  : <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary-light">
                      {selectedUser.fullName?.[0]}
                    </div>
                }
                <div>
                  <p className="font-semibold text-sm">{selectedUser.fullName}</p>
                  <p className="text-xs text-white/40">{selectedUser.phone || selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-1 px-6 pt-3 flex-shrink-0 overflow-x-auto">
              {[
                { key: 'habits', label: 'Odatlar', Icon: CheckCircle },
                { key: 'goals', label: 'Maqsadlar', Icon: Target },
                { key: 'assessment', label: 'Baholash', Icon: Star },
                { key: 'chats', label: 'Chatlar', Icon: MessageCircle },
              ].map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    tab === key ? 'bg-primary text-white' : 'text-white/50 hover:text-white hover:bg-white/10'
                  }`}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!userStats ? <Spinner /> : (
                <>
                  {tab === 'habits' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="card text-center"><p className="text-xl font-bold">{userStats.habits.total}</p><p className="text-xs text-white/40">Jami odat</p></div>
                        <div className="card text-center"><p className="text-xl font-bold text-green-400">{userStats.habits.completedToday}</p><p className="text-xs text-white/40">Bugun bajarildi</p></div>
                      </div>
                      {userStats.habits.list.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl">
                          <span className="text-sm flex-1 text-white/80">{h.name}</span>
                          <span className="text-xs text-white/40">{h.totalDays} kun</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {tab === 'goals' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="card text-center"><p className="text-xl font-bold">{userStats.goals.total}</p><p className="text-xs text-white/40">Jami</p></div>
                        <div className="card text-center"><p className="text-xl font-bold text-green-400">{userStats.goals.completed}</p><p className="text-xs text-white/40">Bajarildi</p></div>
                      </div>
                      {userStats.goals.list.map((g, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${g.done ? 'border-green-500/20 bg-green-500/5' : 'bg-white/5 border-white/5'}`}>
                          <CheckCircle size={14} className={g.done ? 'text-green-400' : 'text-white/20'} />
                          <span className={`text-sm flex-1 ${g.done ? 'text-white/70' : 'text-white/40 line-through'}`}>{g.text}</span>
                          <span className="text-[10px] text-white/30">{g.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {tab === 'assessment' && (
                    <div className="space-y-2">
                      {userStats.assessments.length === 0
                        ? <p className="text-center text-white/30 py-8 text-sm">Baholash yo'q</p>
                        : userStats.assessments.map((a, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl">
                            <Calendar size={13} className="text-white/30" />
                            <span className="text-xs text-white/50 w-24 flex-shrink-0">{a.date}</span>
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${a.avg}%` }} />
                            </div>
                            <span className="text-xs font-medium text-primary-light w-10 text-right">{a.avg}%</span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                  {tab === 'chats' && (
                    <div className="space-y-2">
                      {userStats.chats.length === 0
                        ? <p className="text-center text-white/30 py-8 text-sm">Chat yo'q</p>
                        : userStats.chats.map((c, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl">
                            <MessageCircle size={13} className="text-white/30" />
                            <span className="text-sm text-white/70 flex-1 truncate">{c.title || 'Yangi suhbat'}</span>
                            <span className="text-xs text-white/30">{new Date(c.updatedAt).toLocaleDateString('uz-UZ')}</span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notify */}
      <Notify msg={notify.msg} type={notify.type} />

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#1a0f3a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Foydalanuvchini tahrirlash</h3>
              <button onClick={() => setEditUser(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Ism Familya</label>
                <input value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Telefon</label>
                <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Email</label>
                <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">
                  Bekor qilish
                </button>
                <button onClick={saveEdit}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all">
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#1a0f3a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <p className="font-semibold text-center mb-2">Foydalanuvchini o'chirish</p>
            <p className="text-white/50 text-sm text-center mb-5">Barcha ma'lumotlari o'chib ketadi.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 transition-all">Bekor qilish</button>
              <button onClick={deleteUser} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Stats ─────────────────────────────────────────────────
function AdminStats() {
  const headers = useAdminHeaders()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/admin/users`, { headers })
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const levels = [1,2,3,4,5]
  const levelCounts = levels.map(l => ({ level: `Lv.${l}`, count: users.filter(u => u.level === l).length }))
  const googleUsers = users.filter(u => u.googleId).length
  const phoneUsers = users.filter(u => u.phone && !u.googleId).length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Statistika</h2>
        <p className="text-xs text-white/40 mt-0.5">Batafsil tahlil</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Ro'yxatdan o'tish usuli */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-white/40" /> Ro'yxatdan o'tish usuli</h3>
          <div className="space-y-3">
            {[
              { label: 'Google orqali', value: googleUsers, color: 'bg-blue-400', total: users.length },
              { label: 'Telefon bilan', value: phoneUsers, color: 'bg-purple-400', total: users.length },
            ].map(({ label, value, color, total }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">{label}</span>
                  <span className="text-white/40">{value} ta ({total ? Math.round(value/total*100) : 0}%)</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${total ? value/total*100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level taqsimoti */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart2 size={15} className="text-white/40" /> Level taqsimoti</h3>
          <div className="space-y-2">
            {levelCounts.map(({ level, count }) => (
              <div key={level} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-10">{level}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    style={{ width: `${users.length ? count/users.length*100 : 0}%` }} />
                </div>
                <span className="text-xs text-white/40 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yangi userlar jadvali */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-4">So'nggi ro'yxatdan o'tganlar</h3>
        <div className="space-y-2">
          {[...users].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,10).map(u => (
            <div key={u._id} className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl">
              {u.avatar
                ? <img src={u.avatar} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                : <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-light flex-shrink-0">{u.fullName?.[0]}</div>
              }
              <span className="text-sm text-white/80 flex-1">{u.fullName}</span>
              {u.googleId && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Google</span>}
              <span className="text-xs text-white/30">{new Date(u.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────
function AdminSettings() {
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('adminToken'); navigate('/admin/login') }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Sozlamalar</h2>
        <p className="text-xs text-white/40 mt-0.5">Admin panel sozlamalari</p>
      </div>
      <div className="card space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-white/10">
          <div>
            <p className="text-sm font-medium">Admin hisobi</p>
            <p className="text-xs text-white/40">+998 91 405 84 81</p>
          </div>
          <span className="text-xs bg-primary/20 text-primary-light px-2 py-1 rounded-full">Admin</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-white/10">
          <div>
            <p className="text-sm font-medium">API manzili</p>
            <p className="text-xs text-white/40">{API}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors">
          <LogOut size={16} /> Admin paneldan chiqish
        </button>
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Main Layout ───────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) navigate('/admin/login')
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0618] text-white flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0618]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/50 hover:text-white">
            <Menu size={20} />
          </button>
          <Shield size={16} className="text-primary-light hidden md:block" />
          <span className="text-sm font-medium text-white/60 hidden md:block">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="stats" element={<AdminStats />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
