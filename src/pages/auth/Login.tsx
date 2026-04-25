import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Activity } from 'lucide-react'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/login/', { username, password })
      login(response.data.access, response.data.refresh)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif", background: '#0a0a0f' }}>

      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #0a0a0f 100%)' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}>
              <Activity size={16} color="white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">HealthCore</span>
          </div>
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                ● Live System
              </div>
              <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                Modern healthcare,<br />
                <span style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  intelligently managed
                </span>
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                A unified platform for patients, doctors, and administrators to manage every aspect of hospital operations.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Patients', value: '2,400+' },
                { label: 'Doctors', value: '180+' },
                { label: 'Appointments', value: '12k+' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ background: '#0d1117' }}>
        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}>
              <Activity size={16} color="white" />
            </div>
            <span className="text-white font-semibold text-lg">HealthCore</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all pr-12"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all mt-2"
              style={{ background: loading ? 'rgba(56,189,248,0.5)' : 'linear-gradient(135deg, #38bdf8, #6366f1)' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: '#4b5563' }}>
            HealthCore Hospital Management System © 2026
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
