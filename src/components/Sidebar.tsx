import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck,
  Pill,
  FlaskConical,
  LogOut,
} from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/prescriptions', label: 'Prescriptions', icon: Pill },
  { to: '/lab-results', label: 'Lab Results', icon: FlaskConical },
]

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <div className="w-64 min-h-screen bg-[#161b22] border-r border-[#30363d] flex flex-col">
      <div className="px-6 py-6 border-b border-[#30363d]">
        <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
          HealthCore
        </h1>
        <p className="text-gray-500 text-xs mt-1">Hospital Management</p>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-gradient-to-r from-sky-400/20 to-indigo-500/20 text-white font-semibold border border-sky-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-[#0d1117]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-[#30363d]">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#0d1117] transition w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}