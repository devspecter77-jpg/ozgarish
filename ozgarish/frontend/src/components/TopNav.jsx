import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LogOut } from 'lucide-react'

export default function TopNav() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <header className="sticky top-0 z-40 bg-[#0F0A1E]/95 dark:bg-[#0F0A1E]/95 backdrop-blur border-b border-white/10">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onDoubleClick={() => navigate('/admin/login')}>
          <img src="/logo.png" alt="logo" className="w-9 h-9 rounded-xl" />
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-primary-light">O'zgarish</span>
            <span className="text-white/40 text-xs hidden sm:block">= Mukammallik</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Holo toggle */}
          <div className="toggle-container">
            <div className="toggle-wrap">
              <input className="toggle-input" id="holo-toggle" type="checkbox" checked={!dark} onChange={toggle} />
              <label className="toggle-track" htmlFor="holo-toggle">
                <div className="track-lines"><div className="track-line"></div></div>
                <div className="toggle-thumb">
                  <div className="thumb-core"></div>
                  <div className="thumb-inner"></div>
                  <div className="thumb-scan"></div>
                  <div className="thumb-particles">
                    <div className="thumb-particle"></div>
                    <div className="thumb-particle"></div>
                    <div className="thumb-particle"></div>
                    <div className="thumb-particle"></div>
                    <div className="thumb-particle"></div>
                  </div>
                </div>
                <div className="toggle-data">
                  <div className="data-text off">Dark</div>
                  <div className="data-text on">Light</div>
                  <div className="status-indicator off"></div>
                  <div className="status-indicator on"></div>
                </div>
                <div className="energy-rings">
                  <div className="energy-ring"></div>
                  <div className="energy-ring"></div>
                  <div className="energy-ring"></div>
                </div>
                <div className="toggle-reflection"></div>
                <div className="holo-glow"></div>
              </label>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-2">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-white/20" />
              : <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
                  {user?.fullName?.[0] || 'U'}
                </div>
            }
            <span className="text-sm font-medium hidden sm:block">{user?.fullName}</span>
          </div>

          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors text-sm border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg">
            <LogOut size={16} />
            <span className="hidden sm:block">Chiqish</span>
          </button>
        </div>
      </div>
    </header>
  )
}
