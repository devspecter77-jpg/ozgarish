import { Link } from 'react-router-dom'
import { CheckCircle, TrendingUp, Target, Award, Timer, BarChart2, Shield } from 'lucide-react'
import ParticlesBackground from '../components/ParticlesBackground'
import { useTheme } from '../context/ThemeContext'

const features = [
  { icon: CheckCircle, title: "Odatlar Trekeri",   desc: "Kundalik odatlarni kuzating va har kuni yangi rekord qo'ying",           iconBg: 'bg-green-500/20',  iconColor: 'text-green-600',  tag: 'Kundalik',       accent: '#22c55e' },
  { icon: TrendingUp,  title: "Kundalik Baholash", desc: "O'zingizni 5 mezon bo'yicha baholab, zaif tomonlarni kuchaytiring",      iconBg: 'bg-blue-500/20',   iconColor: 'text-blue-600',   tag: 'Tahlil',         accent: '#3b82f6' },
  { icon: Target,      title: "Maqsadlar Tizimi",  desc: "7 kunlik, 30 kunlik va yillik maqsadlar qo'ying va bajaring",            iconBg: 'bg-orange-500/20', iconColor: 'text-orange-600', tag: 'Rejalashtirish', accent: '#f97316' },
  { icon: Award,       title: "Gamification",      desc: "XP, level, badge va streak tizimi bilan o'zingizni rag'batlantiring",    iconBg: 'bg-yellow-500/20', iconColor: 'text-yellow-600', tag: 'Motivatsiya',    accent: '#eab308' },
  { icon: Timer,       title: "Fokus Taymeri",     desc: "Pomodoro texnikasi bilan chuqur diqqat va samaradorlikka erishing",      iconBg: 'bg-purple-500/20', iconColor: 'text-purple-600', tag: 'Produktivlik',   accent: '#a855f7' },
  { icon: BarChart2,   title: "Statistika",        desc: "Haftalik o'sish grafigi va radar chart bilan rivojlanishingizni ko'ring", iconBg: 'bg-pink-500/20',  iconColor: 'text-pink-600',   tag: 'Kuzatuv',        accent: '#ec4899' },
]

function HoloToggle({ dark, toggle }) {
  return (
    <div className="toggle-container">
      <div className="toggle-wrap">
        <input className="toggle-input" id="landing-toggle" type="checkbox" checked={!dark} onChange={toggle} />
        <label className="toggle-track" htmlFor="landing-toggle">
          <div className="track-lines"><div className="track-line"></div></div>
          <div className="toggle-thumb">
            <div className="thumb-core"></div><div className="thumb-inner"></div><div className="thumb-scan"></div>
            <div className="thumb-particles">{[1,2,3,4,5].map(i=><div key={i} className="thumb-particle"></div>)}</div>
          </div>
          <div className="toggle-data">
            <div className="data-text off">Dark</div><div className="data-text on">Light</div>
            <div className="status-indicator off"></div><div className="status-indicator on"></div>
          </div>
          <div className="energy-rings">{[1,2,3].map(i=><div key={i} className="energy-ring"></div>)}</div>
          <div className="toggle-reflection"></div><div className="holo-glow"></div>
        </label>
      </div>
    </div>
  )
}

export default function Landing() {
  const isAdmin = !!localStorage.getItem('adminToken')
  const { dark, toggle } = useTheme()

  // Theme-aware classes
  const bg       = dark ? 'bg-[#0a0618]'        : 'bg-[#f5f3ff]'
  const bgAlt    = dark ? 'bg-[#0d0820]'        : 'bg-[#ede9fe]'
  const bgFooter = dark ? 'bg-[#060412]'        : 'bg-[#e0d9ff]'
  const text     = dark ? 'text-white'           : 'text-[#1a0f3a]'
  const textMuted= dark ? 'text-white/50'        : 'text-[#1a0f3a]/50'
  const textFaint= dark ? 'text-white/30'        : 'text-[#1a0f3a]/30'
  const border   = dark ? 'border-white/8'       : 'border-[#7C3AED]/15'
  const navBg    = dark ? 'bg-[#0a0618]/90'      : 'bg-[#f5f3ff]/90'
  const cardBg   = dark ? 'bg-white/3 border-white/8 hover:border-white/20'
                        : 'bg-white border-[#7C3AED]/15 hover:border-[#7C3AED]/40 shadow-sm'
  const statCard = dark ? 'bg-white/5 border-white/10'
                        : 'bg-white border-[#7C3AED]/20 shadow-sm'
  const heroGrad = dark ? 'from-[#0a0618]'       : 'from-[#f5f3ff]'

  return (
    <div className={`min-h-screen ${bg} ${text} transition-colors duration-300`}>

      {/* ── Navbar ── */}
      <nav className={`sticky top-0 z-50 ${navBg} backdrop-blur border-b ${border}`}>
        <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="O'zgarish" className="w-10 h-10 rounded-xl" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary-light">O'zgarish</span>
              <span className={`text-xs ${textMuted} hidden sm:block`}>= Mukammallik</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HoloToggle dark={dark} toggle={toggle} />
            {isAdmin ? (
              <Link to="/admin" className="flex items-center gap-2 btn-primary text-sm">
                <Shield size={14} /> Admin
              </Link>
            ) : (
              <>
                <Link to="/login" className={`text-sm py-2 px-4 rounded-xl border ${border} ${textMuted} hover:text-primary transition-colors`}>Kirish</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Ro'yxatdan o'tish</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={`relative overflow-hidden border-b ${border}`}>
        <div className="absolute inset-0 z-0">
          <ParticlesBackground />
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${dark ? 'from-[#0a0618]' : 'from-[#f5f3ff]'} to-transparent z-10 pointer-events-none`} />

        <div className="relative z-20 text-center py-28 px-6 max-w-4xl mx-auto">
          <span className={`inline-block ${dark ? 'bg-primary/20 border-primary/30 text-primary-light' : 'bg-primary/10 border-primary/20 text-primary'} border text-xs font-medium px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase`}>
            Shaxsiy rivojlanish platformasi
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Har kun <span className="text-primary-light">kechagidan</span><br />yaxshiroq bo'l
          </h1>
          <p className={`${textMuted} text-lg mb-10 max-w-xl mx-auto leading-relaxed`}>
            Intizom, odatlar va maqsadlar orqali o'zingizni tarbiyalang.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn-primary text-base px-8 py-3 rounded-xl">Bepul boshlash →</Link>
            <Link to="/login" className={`text-base px-8 py-3 rounded-xl border ${border} ${textMuted} hover:text-primary transition-colors`}>Kirish</Link>
          </div>

          <div className="flex items-center justify-center gap-2 mt-16">
            {[
              { value: '7+', label: 'Odatlar' },
              { value: '5',  label: 'Baholash mezoni' },
              { value: '∞',  label: 'Imkoniyat' },
            ].map((s, i) => (
              <>
                <div key={s.label} className={`text-center px-8 py-4 rounded-2xl ${statCard} backdrop-blur`}>
                  <div className="text-3xl font-bold text-primary-light">{s.value}</div>
                  <div className={`text-xs ${textFaint} mt-1`}>{s.label}</div>
                </div>
                {i < 2 && <div key={`sep-${i}`} className={`w-px h-12 ${dark ? 'bg-white/10' : 'bg-[#7C3AED]/15'}`} />}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={`border-b ${border} ${bgAlt} transition-colors duration-300`}>
        <div className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-primary-light text-xs font-semibold bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full uppercase tracking-wider">
              Imkoniyatlar
            </span>
            <h2 className="text-4xl font-bold mt-5 mb-3">Nima imkoniyatlar bor?</h2>
            <p className={`${textMuted} max-w-lg mx-auto`}>Har bir xususiyat siz uchun — o'sish, intizom va mukammallik yo'lida</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, iconBg, iconColor, tag, accent }) => (
              <div key={title}
                className={`group relative overflow-hidden rounded-2xl border p-6 hover:-translate-y-1 transition-all duration-300 cursor-default ${cardBg}`}>
                <span className={`absolute top-4 right-4 text-[10px] ${textFaint} border ${border} px-2 py-0.5 rounded-full`}>{tag}</span>
                <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={iconColor} size={22} />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className={`${textMuted} text-sm leading-relaxed`}>{desc}</p>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: `linear-gradient(90deg, ${accent}80, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`border-b ${border} ${bg} transition-colors duration-300`}>
        <div className="py-20 px-6 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Bugundan boshlang</h2>
          <p className={`${textMuted} mb-8 text-lg`}>Intizomdan mukammallikka — birinchi qadam siz bilan</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3 rounded-xl">
            Ro'yxatdan o'tish — bepul
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`${bgFooter} border-t ${border} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="O'zgarish" className="w-10 h-10 rounded-xl" />
                <div>
                  <p className="font-bold text-primary-light">O'zgarish</p>
                  <p className={`text-xs ${textFaint}`}>= Mukammallik</p>
                </div>
              </div>
              <p className={`${textMuted} text-sm leading-relaxed max-w-xs`}>
                Shaxsiy rivojlanish platformasi. Intizom, odatlar va maqsadlar orqali har kun kechagidan yaxshiroq bo'l.
              </p>
            </div>
            <div>
              <p className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-4`}>Sahifalar</p>
              <ul className="space-y-2.5">
                {[
                  { to: '/register', label: "Ro'yxatdan o'tish" },
                  { to: '/login',    label: 'Kirish' },
                  { to: '/dashboard/habits', label: 'Odatlar' },
                  { to: '/dashboard/goals',  label: 'Maqsadlar' },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className={`text-sm ${textMuted} hover:text-primary-light transition-colors`}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-4`}>Imkoniyatlar</p>
              <ul className="space-y-2.5">
                {['Odatlar trekeri','Kundalik baholash','Fokus taymeri','Statistika','Mukofotlar'].map(f => (
                  <li key={f} className={`text-sm ${textMuted}`}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className={`${textFaint} text-xs`}>© 2026 O'zgarish = Mukammallik. Barcha huquqlar himoyalangan.</p>
            <p className={`${textFaint} text-xs`}>RootDev® tomonidan ishlab chiqilgan</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
