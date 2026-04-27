import { useEffect, useState } from 'react'
import api from '../api/axios'
import {
  Users, Stethoscope, Calendar, PoundSterling,
  TrendingUp, Activity
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface DashboardData {
  stats: {
    total_patients: number
    total_doctors: number
    appointments_today: number
    total_revenue: number
  }
  appointments_last_7_days: { date: string; count: number }[]
  status_breakdown: { status: string; count: number }[]
  revenue_trend: { month: string; revenue: number }[]
  recent_appointments: {
    id: number
    patient_name: string
    doctor_name: string
    date: string
    time: string
    status: string
  }[]
  recent_invoices: {
    id: number
    invoice_number: string
    patient_name: string
    total_amount: number
    status: string
    issue_date: string
  }[]
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  completed: 'bg-green-500/20 text-green-300 border border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
  no_show: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  draft: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  sent: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  paid: 'bg-green-500/20 text-green-300 border border-green-500/30',
  overdue: 'bg-red-500/20 text-red-300 border border-red-500/30',
}

const PIE_COLORS = ['#38bdf8', '#34d399', '#f87171', '#fbbf24']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-sm"
        style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.name === 'Revenue' ? `£${p.value.toFixed(2)}` : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/')
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500 text-sm">Loading dashboard...</div>
    </div>
  )

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500 text-sm">Failed to load dashboard</div>
    </div>
  )

  const statCards = [
    {
      label: 'Total Patients',
      value: data.stats.total_patients,
      icon: Users,
      color: '#38bdf8',
      suffix: ''
    },
    {
      label: 'Total Doctors',
      value: data.stats.total_doctors,
      icon: Stethoscope,
      color: '#6366f1',
      suffix: ''
    },
    {
      label: 'Appointments Today',
      value: data.stats.appointments_today,
      icon: Calendar,
      color: '#34d399',
      suffix: ''
    },
    {
      label: 'Total Revenue',
      value: `£${data.stats.total_revenue.toFixed(2)}`,
      icon: PoundSterling,
      color: '#fbbf24',
      suffix: ''
    },
  ]

  return (
    <div className="text-white">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome to HealthCore Hospital Management System</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-5 relative overflow-hidden"
            style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5"
              style={{ background: `radial-gradient(circle, ${color}, transparent)`, transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Appointments Last 7 Days */}
        <div className="col-span-2 rounded-xl p-5"
          style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} style={{ color: '#38bdf8' }} />
            <h3 className="text-white font-semibold text-sm">Appointments — Last 7 Days</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.appointments_last_7_days}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Appointments"
                stroke="#38bdf8"
                strokeWidth={2}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="rounded-xl p-5"
          style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} style={{ color: '#6366f1' }} />
            <h3 className="text-white font-semibold text-sm">Appointment Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data.status_breakdown}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
              >
                {data.status_breakdown.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.status_breakdown.map((item, index) => (
              <div key={item.status} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[index] }} />
                <span className="text-gray-400 text-xs capitalize">{item.status} ({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="mb-6">
        <div className="rounded-xl p-5"
          style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <PoundSterling size={15} style={{ color: '#fbbf24' }} />
            <h3 className="text-white font-semibold text-sm">Revenue — Last 6 Months</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.revenue_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-4">

        {/* Recent Appointments */}
        <div className="rounded-xl p-5"
          style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} style={{ color: '#34d399' }} />
            <h3 className="text-white font-semibold text-sm">Recent Appointments</h3>
          </div>
          <div className="space-y-3">
            {data.recent_appointments.length === 0 ? (
              <p className="text-gray-600 text-sm">No appointments yet</p>
            ) : data.recent_appointments.map(appt => (
              <div key={appt.id} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)', color: '#fff' }}>
                    {appt.patient_name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{appt.patient_name}</p>
                    <p className="text-gray-500 text-xs">{appt.doctor_name} · {appt.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_COLORS[appt.status]}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-xl p-5"
          style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <PoundSterling size={15} style={{ color: '#fbbf24' }} />
            <h3 className="text-white font-semibold text-sm">Recent Invoices</h3>
          </div>
          <div className="space-y-3">
            {data.recent_invoices.length === 0 ? (
              <p className="text-gray-600 text-sm">No invoices yet</p>
            ) : data.recent_invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#fff' }}>
                    £
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{inv.invoice_number}</p>
                    <p className="text-gray-500 text-xs">{inv.patient_name} · {inv.issue_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-xs font-bold">£{inv.total_amount.toFixed(2)}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_COLORS[inv.status]}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}