import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Calendar, Plus, X } from 'lucide-react'

interface Patient {
  id: number
  username: string
}

interface Doctor {
  id: number
  username: string
  specialisation: string
}

interface Appointment {
  id: number
  patient_detail: Patient
  doctor_detail: Doctor
  appointment_date: string
  appointment_time: string
  status: string
  reason: string
  notes: string | null
  created_at: string
}

const statusColors: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: 'rgba(56,189,248,0.1)', color: '#38bdf8' },
  completed: { bg: 'rgba(52,211,153,0.1)', color: '#34d399' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
  no_show: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    notes: '',
  })

  const fetchAll = async () => {
    try {
      const [apptRes, patRes, docRes] = await Promise.all([
        api.get('/appointments/'),
        api.get('/patients/'),
        api.get('/doctors/'),
      ])
      setAppointments(apptRes.data)
      setPatients(patRes.data)
      setDoctors(docRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/appointments/', form)
      setShowForm(false)
      setForm({ patient: '', doctor: '', appointment_date: '', appointment_time: '', reason: '', notes: '' })
      fetchAll()
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Failed to create appointment.')
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.patch(`/appointments/${id}/status/`, { status })
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Appointments</h1>
          <p className="text-gray-500 text-sm">{appointments.length} total appointments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition"
          style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}
        >
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading...</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Patient', 'Doctor', 'Date', 'Time', 'Reason', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-600 text-sm">No appointments yet</td>
                </tr>
              ) : (
                appointments.map((appt, i) => (
                  <tr key={appt.id} style={{ background: i % 2 === 0 ? '#0a0e17' : '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-4 text-white text-sm">{appt.patient_detail.username}</td>
                    <td className="px-5 py-4">
                      <div className="text-white text-sm">{appt.doctor_detail.username}</div>
                      <div className="text-gray-500 text-xs capitalize">{appt.doctor_detail.specialisation}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{appt.appointment_date}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{appt.appointment_time}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{appt.reason}</td>
                    <td className="px-5 py-4">
                      <select
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                        className="px-2 py-1 rounded text-xs font-medium outline-none cursor-pointer"
                        style={{
                          background: statusColors[appt.status]?.bg,
                          color: statusColors[appt.status]?.color,
                          border: 'none',
                        }}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 relative" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.1)' }}>
                  <Calendar size={16} style={{ color: '#38bdf8' }} />
                </div>
                <h2 className="text-white font-semibold">Book Appointment</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-gray-300 transition">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Patient</label>
                  <select
                    value={form.patient}
                    onChange={(e) => setForm({ ...form, patient: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    required
                  >
                    <option value="">Select patient</option>
                    {patients.map(p => <option key={p.id} value={p.id} className="bg-gray-900">{p.username}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Doctor</label>
                  <select
                    value={form.doctor}
                    onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    required
                  >
                    <option value="">Select doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id} className="bg-gray-900">{d.username} — {d.specialisation}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Date</label>
                  <input
                    type="date"
                    value={form.appointment_date}
                    onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Time</label>
                  <input
                    type="time"
                    value={form.appointment_time}
                    onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Reason</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-400 transition"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition"
                  style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments