import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Users, Plus, X, Search } from 'lucide-react'

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

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    blood_type: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_history: '',
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const fetchPatients = async (searchTerm = '') => {
    try {
      const url = searchTerm ? `/patients/?search=${searchTerm}` : '/patients/'
      const response = await api.get(url)
      setPatients(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPatients(search)
    }, 400)
    return () => clearTimeout(delay)
  }, [search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/patients/', form)
      setShowForm(false)
      setForm({
        username: '', email: '', password: '', first_name: '', last_name: '',
        date_of_birth: '', blood_type: '', allergies: '',
        emergency_contact_name: '', emergency_contact_phone: '', medical_history: '',
      })
      fetchPatients()
    } catch (err: any) {
      setError('Failed to create patient. Please check all fields.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Patients</h1>
          <p className="text-gray-500 text-sm">{patients.length} total patients</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition"
          style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}
        >
          <Plus size={16} /> Add Patient
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading...</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Name', 'Email', 'Blood Type', 'Allergies', 'Emergency Contact'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-600 text-sm">No patients found</td>
                </tr>
              ) : (
                patients.map((patient, i) => (
                  <tr key={patient.id} style={{ background: i % 2 === 0 ? '#0a0e17' : '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}>
                          {(patient.first_name || patient.username)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">
                            {patient.first_name && patient.last_name
                              ? `${patient.first_name} ${patient.last_name}`
                              : patient.username}
                          </div>
                          <div className="text-gray-500 text-xs">{patient.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{patient.email}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
                        {patient.blood_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{patient.allergies || '—'}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{patient.emergency_contact_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 relative max-h-screen overflow-y-auto" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.1)' }}>
                  <Users size={16} style={{ color: '#38bdf8' }} />
                </div>
                <h2 className="text-white font-semibold">Add New Patient</h2>
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
                {[
                  { label: 'First Name', key: 'first_name', type: 'text' },
                  { label: 'Last Name', key: 'last_name', type: 'text' },
                  { label: 'Username', key: 'username', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Password', key: 'password', type: 'password' },
                  { label: 'Date of Birth', key: 'date_of_birth', type: 'date' },
                  { label: 'Emergency Contact Name', key: 'emergency_contact_name', type: 'text' },
                  { label: 'Emergency Contact Phone', key: 'emergency_contact_phone', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Blood Type</label>
                <select
                  value={form.blood_type}
                  onChange={(e) => setForm({ ...form, blood_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  required
                >
                  <option value="">Select blood type</option>
                  {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Allergies</label>
                <input
                  type="text"
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Medical History</label>
                <textarea
                  value={form.medical_history}
                  onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
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
                  Create Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients