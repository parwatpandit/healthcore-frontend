import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import {
  ArrowLeft, Stethoscope, Calendar, Users,
  FileText, Award, Clock
} from 'lucide-react'

interface Doctor {
  id: number
  username: string
  email: string
  specialisation: string
  license_number: string
  years_experience: number
  available_days: string[]
  created_at: string
}

interface Appointment {
  id: number
  patient_name: string
  appointment_date: string
  appointment_time: string
  status: string
  reason: string
}

interface Prescription {
  id: number
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  prescribed_date: string
  is_active: boolean
  patient_name: string
}

interface Invoice {
  id: number
  invoice_number: string
  status: string
  total_amount: number
  issue_date: string
  due_date: string
  patient_name: string
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

const TABS = [
  { key: 'overview', label: 'Overview', icon: Stethoscope },
  { key: 'appointments', label: 'Appointments', icon: Calendar },
  { key: 'prescriptions', label: 'Prescriptions', icon: FileText },
  { key: 'billing', label: 'Billing', icon: FileText },
]

export default function DoctorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dRes, aRes, prRes, bRes] = await Promise.all([
          api.get(`/doctors/${id}/`),
          api.get(`/appointments/?doctor=${id}`),
          api.get(`/prescriptions/?doctor=${id}`),
          api.get(`/billing/?doctor=${id}`),
        ])
        setDoctor(dRes.data)
        setAppointments(aRes.data)
        setPrescriptions(prRes.data)
        setInvoices(bRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500 text-sm">Loading doctor...</div>
    </div>
  )

  if (!doctor) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500 text-sm">Doctor not found</div>
    </div>
  )

  const uniquePatients = [...new Set(appointments.map(a => a.patient_name))].length
  const completedAppointments = appointments.filter(a => a.status === 'completed').length
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0)

  return (
    <div className="text-white">

      {/* Back Button */}
      <button
        onClick={() => navigate('/doctors')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Doctors
      </button>

      {/* Hero Header */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(56,189,248,0.08))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)' }}>
            {doctor.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{doctor.username}</h1>
              <span className="px-2 py-1 rounded-lg text-xs font-bold capitalize"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                {doctor.specialisation}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{doctor.email}</p>
            <div className="flex items-center gap-6 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Award size={13} />
                <span>License: {doctor.license_number}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Clock size={13} />
                <span>{doctor.years_experience} years experience</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Calendar size={13} />
                <span>Available: {doctor.available_days.map(d => d.slice(0, 3)).join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3 flex-shrink-0">
            {[
              { label: 'Appointments', value: appointments.length, color: '#38bdf8' },
              { label: 'Completed', value: completedAppointments, color: '#34d399' },
              { label: 'Patients Seen', value: uniquePatients, color: '#a78bfa' },
              { label: 'Revenue', value: `£${totalRevenue.toFixed(0)}`, color: '#fbbf24' },
            ].map(stat => (
              <div key={stat.label} className="text-center px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
            style={activeTab === key ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(56,189,248,0.2))', border: '1px solid rgba(99,102,241,0.3)' } : {}}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-5" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope size={15} style={{ color: '#818cf8' }} />
              <h3 className="text-white font-semibold text-sm">Professional Details</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Username', value: doctor.username },
                { label: 'Email', value: doctor.email },
                { label: 'Specialisation', value: doctor.specialisation },
                { label: 'License Number', value: doctor.license_number },
                { label: 'Years Experience', value: `${doctor.years_experience} years` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
                  <span className="text-white text-sm font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={15} style={{ color: '#34d399' }} />
              <h3 className="text-white font-semibold text-sm">Available Days</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                <span key={day} className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
                  style={{
                    background: doctor.available_days.includes(day) ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.03)',
                    border: doctor.available_days.includes(day) ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    color: doctor.available_days.includes(day) ? '#34d399' : '#374151',
                  }}>
                  {day.slice(0, 3)}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Users size={15} style={{ color: '#38bdf8' }} />
              <h3 className="text-white font-semibold text-sm">Recent Appointments</h3>
            </div>
            <div className="space-y-2">
              {appointments.slice(0, 4).map(a => (
                <div key={a.id} className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <p className="text-white text-xs font-medium">{a.patient_name}</p>
                    <p className="text-gray-500 text-xs">{a.appointment_date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_COLORS[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-gray-600 text-sm">No appointments yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Patient', 'Date', 'Time', 'Reason', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-600 text-sm">No appointments found</td></tr>
              ) : appointments.map((a, i) => (
                <tr key={a.id} style={{ background: i % 2 === 0 ? '#0a0e17' : '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-4 text-white text-sm font-medium">{a.patient_name}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{a.appointment_date}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{a.appointment_time}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{a.reason || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Patient', 'Medication', 'Dosage', 'Frequency', 'Duration', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-600 text-sm">No prescriptions found</td></tr>
              ) : prescriptions.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#0a0e17' : '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-4 text-white text-sm font-medium">{p.patient_name}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{p.medication_name}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{p.dosage}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{p.frequency}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{p.duration}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.is_active ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Invoice', 'Patient', 'Issue Date', 'Due Date', 'Total', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-600 text-sm">No invoices found</td></tr>
              ) : invoices.map((inv, i) => (
                <tr key={inv.id} style={{ background: i % 2 === 0 ? '#0a0e17' : '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-4 font-mono text-sm font-semibold" style={{ color: '#38bdf8' }}>{inv.invoice_number}</td>
                  <td className="px-5 py-4 text-white text-sm">{inv.patient_name}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{inv.issue_date}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{inv.due_date}</td>
                  <td className="px-5 py-4 text-white text-sm font-semibold">£{inv.total_amount.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${STATUS_COLORS[inv.status]}`}>{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}