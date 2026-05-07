import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, BarChart2, Target, Star, Award, Timer, History } from 'lucide-react'

const links = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/dashboard/habits', icon: CheckSquare, label: 'Odatlar' },
  { to: '/dashboard/assessment', icon: Star, label: 'Baholash' },
  { to: '/dashboard/goals', icon: Target, label: 'Maqsadlar' },
  { to: '/dashboard/stats', icon: BarChart2, label: 'Statistika' },
  { to: '/dashboard/rewards', icon: Award, label: 'Mukofotlar' },
  { to: '/dashboard/focus', icon: Timer, label: 'Fokus' },
  { to: '/dashboard/history', icon: History, label: 'Kunlik tarix' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white/5 border-r border-white/10 px-3 sticky top-[57px] self-start h-[calc(100vh-57px)] overflow-y-auto">
      <div className="mt-8 flex flex-col gap-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-primary text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`
            }>
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
