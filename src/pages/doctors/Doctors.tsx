import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Stethoscope, Plus, X, Search } from 'lucide-react'

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

const specialisations = [
  'cardiology', 'dermatology', 'neurology', 'oncology',
  'paediatrics', 'psychiatry', 'radiology', 'surgery', 'general'
]

const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    specialisation: '',
    license_number: '',
    years_experience: '',
    available_days: [] as string[],
  })

  const fetchDoctors = async (searchTerm = '') => {
    try {
      const url = searchTerm ? `/doctors/?search=${searchTerm}` : '/doctors/'
      const response = await api.get(url)
      setDoctors(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDoctors(search)
    }, 400)
    return () => clearTimeout(delay)
  }, [search])

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/doctors/', form)
      setShowForm(false)
      setForm({
        username: '', email: '', password: '', specialisation: '',
        license_number: '', years_experience: '', available_days: [],
      })
      fetchDoctors()
    } catch (err: any) {
      setError('Failed to create doctor. Please check all fields.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Doctors</h1>
          <p className="text-gray-500 text-sm">{doctors.length} total doctors</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition"
          style={{ background: 'linear-gradient(135deg, #38bdf8, #6366f1)' }}
        >
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, specialisation or email..."
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
                {['Name', 'Specialisation', 'License', 'Experience', 'Available Days'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-600 text-sm">No doctors found</td>
                </tr>
              ) : (
                doctors.map((doctor, i) => (
                  <tr key={doctor.id} style={{ background: i % 2 === 0 ? '#0a0e17' : '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)' }}>
                          {doctor.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{doctor.username}</div>
                          <div className="text-gray-500 text-xs">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium capitalize" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                        {doctor.specialisation}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{doctor.license_number}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{doctor.years_experience} yrs</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {doctor.available_days.map(day => (
                          <span key={day} className="px-2 py-0.5 rounded text-xs capitalize" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
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
          <div className="w-full max-w-lg rounded-2xl p-6 relative max-h-screen overflow-y-auto" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <Stethoscope size={16} style={{ color: '#818cf8' }} />
                </div>
                <h2 className="text-white font-semibold">Add New Doctor</h2>
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
                  { label: 'Username', key: 'username', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Password', key: 'password', type: 'password' },
                  { label: 'License Number', key: 'license_number', type: 'text' },
                  { label: 'Years Experience', key: 'years_experience', type: 'number' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      required
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Specialisation</label>
                  <select
                    value={form.specialisation}
                    onChange={(e) => setForm({ ...form, specialisation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    required
                  >
                    <option value="">Select</option>
                    {specialisations.map(s => <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {allDays.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition"
                      style={{
                        background: form.available_days.includes(day) ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                        border: form.available_days.includes(day) ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        color: form.available_days.includes(day) ? '#34d399' : '#6b7280',
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
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
                  Create Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctors