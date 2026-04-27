import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import {
  ArrowLeft, User, Phone, Heart, Calendar,
  Pill, FlaskConical, FileText, Activity
} from 'lucide-react'

interface Patient {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_of_birth: string
  blood_type: string
  allergies: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_history: string
  created_at: string
}

interface Appointment {
  id: number
  doctor_name: string
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
  doctor_name: string
}

interface LabResult {
  id: number
  test_name: string
  test_date: string
  status: string
  notes: string
  result_file_url: string
  doctor_name: string
}

interface Invoice {
  id: number
  invoice_number: string
  status: string
  total_amount: number
  issue_date: string
  due_date: string
  doctor_name: string
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  completed: 'bg-green-500/20 text-green-300 border border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
  no_show: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  reviewed: 'bg-green-500/20 text-green-300 border border-green-500/30',
  draft: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  sent: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  paid: 'bg-green-500/20 text-green-300 border border-green-500/30',
  overdue: 'bg-red-500/20 text-red-300 border border-red-500/30',
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'appointments', label: 'Appointments', icon: Calendar },
  { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { key: 'lab_results', label: 'Lab Results', icon: FlaskConical },
  { key: 'billing', label: 'Billing', icon: FileText },
]

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, aRes, prRes, lrRes, bRes] = await Promise.all([
          api.get(`/patients/${id}/`),
          api.get(`/appointments/?patient=${id}`),
          api.get(`/prescriptions/?patient=${id}`),
          api.get(`/lab-results/?patient=${id}`),
          api.get(`/billing/?patient=${id}`),
        ])
        setPatient(pRes.data)
        setAppointments(aRes.data)
        setPrescriptions(prRes.data)
        setLabResults(lrRes.data)
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
      <div className="text-gray-500 text-sm">Loading patient...</div>
    </div>
  )

  if (!patient) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500 text-sm">Patient not found</div>
    </div>
  )

  const fullName = `${patient.first_name} ${patient.last_name}`.trim() || patient.username
  const initials = (patient.first_name?.[0] || patient.username[0]).toUpperCase()

  return (
    <div className="text-white">

      {/* Back Button */}
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Patients
      </button>

      {/* Hero Header */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(99,102,241,0.08))', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}>
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{fullName}</h1>
              <span className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                {patient.blood_type}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">@{patient.username} · {patient.email}</p>
            <div className="flex items-center gap-6 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Calendar size={13} />
                <span>DOB: {patient.date_of_birth}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Phone size={13} />
                <span>{patient.emergency_contact_name} · {patient.emergency_contact_phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Heart size={13} />
                <span>Allergies: {patient.allergies || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3 flex-shrink-0">
            {[
              { label: 'Appointments', value: appointments.length, color: '#38bdf8' },
              { label: 'Prescriptions', value: prescriptions.length, color: '#6366f1' },
              { label: 'Lab Results', value: labResults.length, color: '#a78bfa' },
              { label: 'Invoices', value: invoices.length, color: '#34d399' },
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
              activeTab === key
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            style={activeTab === key ? { background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(99,102,241,0.2))', border: '1px solid rgba(56,189,248,0.3)' } : {}}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-5" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <User size={15} style={{ color: '#38bdf8' }} />
              <h3 className="text-white font-semibold text-sm">Personal Information</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: fullName },
                { label: 'Username', value: patient.username },
                { label: 'Email', value: patient.email },
                { label: 'Date of Birth', value: patient.date_of_birth },
                { label: 'Blood Type', value: patient.blood_type },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={15} style={{ color: '#f43f5e' }} />
              <h3 className="text-white font-semibold text-sm">Medical Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-xs uppercase tracking-wider">Allergies</span>
                <p className="text-white text-sm mt-1">{patient.allergies || 'No known allergies'}</p>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
                <span className="text-gray-500 text-xs uppercase tracking-wider">Medical History</span>
                <p className="text-gray-300 text-sm mt-1 leading-relaxed">{patient.medical_history || 'No medical history recorded'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Phone size={15} style={{ color: '#34d399' }} />
              <h3 className="text-white font-semibold text-sm">Emergency Contact</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Contact Name', value: patient.emergency_contact_name },
                { label: 'Phone Number', value: patient.emergency_contact_phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
                  <span className="text-white text-sm font-medium">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} style={{ color: '#a78bfa' }} />
              <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
            </div>
            <div className="space-y-2">
              {appointments.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <p className="text-white text-xs font-medium">{a.reason || 'Appointment'}</p>
                    <p className="text-gray-500 text-xs">{a.appointment_date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${STATUS_COLORS[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-gray-600 text-sm">No recent activity</p>
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
                {['Doctor', 'Date', 'Time', 'Reason', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-600 text-sm">No appointments found</td></tr>
              ) : appointments.map((a, i) => (
                <tr key={a.id} style={{ background: i % 2 === 0 ? '#0a0e17' : '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-4 text-white text-sm">{a.doctor_name}</td>
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
                {['Medication', 'Dosage', 'Frequency', 'Duration', 'Doctor', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-600 text-sm">No prescriptions found</td></tr>
              ) : prescriptions.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#0a0e17' : '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-4 text-white text-sm font-medium">{p.medication_name}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{p.dosage}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{p.frequency}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{p.duration}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{p.doctor_name}</td>
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

      {/* Lab Results Tab */}
      {activeTab === 'lab_results' && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Test Name', 'Date', 'Doctor', 'Notes', 'Status', 'File'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labResults.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-600 text-sm">No lab results found</td></tr>
              ) : labResults.map((lr, i) => (
                <tr key={lr.id} style={{ background: i % 2 === 0 ? '#0a0e17' : '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-4 text-white text-sm font-medium">{lr.test_name}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{lr.test_date}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{lr.doctor_name}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{lr.notes || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${STATUS_COLORS[lr.status]}`}>{lr.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    {lr.result_file_url ? (
                      <a href={lr.result_file_url} target="_blank" rel="noreferrer"
                        className="text-xs px-3 py-1 rounded-lg transition"
                        style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                        View File
                      </a>
                    ) : <span className="text-gray-600 text-xs">—</span>}
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
                {['Invoice', 'Doctor', 'Issue Date', 'Due Date', 'Total', 'Status'].map(h => (
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
                  <td className="px-5 py-4 text-gray-400 text-sm">{inv.doctor_name}</td>
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