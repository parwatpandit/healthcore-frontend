import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Activity, LogOut } from 'lucide-react'

const Dashboard = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}>
            <Activity size={20} color="white" />
          </div>
          <span className="text-white font-bold text-2xl">HealthCore</span>
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">Welcome to your Dashboard</h1>
        <p className="text-gray-400 mb-8">You are successfully logged in.</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-lg text-sm font-medium text-white transition"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  )
}

export default Dashboard
