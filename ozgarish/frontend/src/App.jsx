import { Routes, Route, Navigate } from 'react-router-dom'
import { useRef } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import TopNav from './components/TopNav'
import AiChat from './components/AiChat'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import AuthCallback from './pages/AuthCallback'
import Home from './pages/Home'
import Habits from './pages/Habits'
import Assessment from './pages/Assessment'
import Goals from './pages/Goals'
import Stats from './pages/Stats'
import Rewards from './pages/Rewards'
import Focus from './pages/Focus'
import DailyHistory from './pages/DailyHistory'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'

function ProtectedLayout() {
  const { user } = useAuth()
  const aiChatRef = useRef(null)
  if (!user) return <Navigate to="/login" replace />
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 min-w-0 pb-24 md:pb-8">
            <div className="w-full px-4 md:px-6 py-4 md:py-6">
              <Routes>
                <Route path="/" element={<Home aiChatRef={aiChatRef} />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/focus" element={<Focus />} />
                <Route path="/history" element={<DailyHistory />} />
              </Routes>
            </div>
          </main>
        </div>
        <MobileNav />
        <AiChat ref={aiChatRef} />
      </div>
    </AppProvider>
  )
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard/*" element={<ProtectedLayout />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
