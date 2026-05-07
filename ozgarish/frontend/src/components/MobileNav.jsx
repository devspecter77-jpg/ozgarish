import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, Star, Target, Timer, BarChart2, Award, History } from 'lucide-react'

const links = [
  { to: '/dashboard',            icon: Home,        label: 'Bosh'      },
  { to: '/dashboard/habits',     icon: CheckSquare, label: 'Odatlar'   },
  { to: '/dashboard/assessment', icon: Star,        label: 'Baholash'  },
  { to: '/dashboard/goals',      icon: Target,      label: 'Maqsad'    },
  { to: '/dashboard/stats',      icon: BarChart2,   label: 'Statistika'},
  { to: '/dashboard/rewards',    icon: Award,       label: 'Mukofot'   },
  { to: '/dashboard/focus',      icon: Timer,       label: 'Fokus'     },
  { to: '/dashboard/history',    icon: History,     label: 'Tarix'     },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F0A1E]/95 backdrop-blur border-t border-white/10 z-50 overflow-x-auto">
      <div className="flex min-w-max">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2.5 px-3 gap-1 text-[10px] transition-all min-w-[60px] ${
                isActive ? 'text-primary-light' : 'text-white/40'
              }`
            }>
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
