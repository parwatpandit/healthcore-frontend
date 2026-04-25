import Layout from '../components/Layout'
import { Users, Stethoscope, Calendar, Activity } from 'lucide-react'

const stats = [
  { label: 'Total Patients', value: '0', icon: Users, color: '#38bdf8' },
  { label: 'Total Doctors', value: '0', icon: Stethoscope, color: '#6366f1' },
  { label: 'Appointments Today', value: '0', icon: Calendar, color: '#34d399' },
  { label: 'System Status', value: 'Live', icon: Activity, color: '#f59e0b' },
]

const Dashboard = () => {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome to HealthCore Hospital Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl p-5"
            style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export default Dashboard