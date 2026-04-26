import { useEffect, useState } from 'react'
import axios from '../../api/axios'
import { FlaskConical, Plus, X } from 'lucide-react'

interface LabResult {
  id: number
  patient: number
  doctor: number
  appointment: number | null
  test_name: string
  test_date: string
  result_file: string | null
  result_file_url: string | null
  notes: string
  status: string
  created_at: string
  patient_name: string
  doctor_name: string
}

interface Patient {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
}

interface Doctor {
  id: number
  username: string
  specialisation: string
  license_number: string
}

export default function LabResults() {
  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [filtered, setFiltered] = useState<LabResult[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    appointment: '',
    test_name: '',
    test_date: '',
    notes: '',
    status: 'pending',
  })

  const fetchAll = async () => {
    try {
      const [labRes, patRes, docRes] = await Promise.all([
        axios.get('/lab-results/'),
        axios.get('/patients/'),
        axios.get('/doctors/'),
      ])
      setLabResults(labRes.data)
      setFiltered(labRes.data)
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

  useEffect(() => {
    const timer = setTimeout(() => {
      const q = search.toLowerCase()
      setFiltered(
        labResults.filter(
          (l) =>
            l.test_name.toLowerCase().includes(q) ||
            l.patient_name.toLowerCase().includes(q) ||
            l.doctor_name.toLowerCase().includes(q) ||
            l.status.toLowerCase().includes(q)
        )
      )
    }, 400)
    return () => clearTimeout(timer)
  }, [search, labResults])

  const handleSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('patient', form.patient)
      formData.append('doctor', form.doctor)
      if (form.appointment) formData.append('appointment', form.appointment)
      formData.append('test_name', form.test_name)
      formData.append('test_date', form.test_date)
      formData.append('notes', form.notes)
      formData.append('status', form.status)
      if (file) formData.append('result_file', file)

      await axios.post('/lab-results/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setShowModal(false)
      setForm({
        patient: '', doctor: '', appointment: '', test_name: '',
        test_date: '', notes: '', status: 'pending',
      })
      setFile(null)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'reviewed': return 'bg-indigo-500/20 text-indigo-400'
      default: return 'bg-yellow-500/20 text-yellow-400'
    }
  }

  const getPatientLabel = (p: Patient) => {
    const name = p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.username
    return `${name} — ${p.email}`
  }

  const getDoctorLabel = (d: Doctor) => {
    return `${d.username} — ${d.specialisation} — ${d.license_number}`
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FlaskConical className="text-sky-400" size={28} />
          <h1 className="text-2xl font-bold text-white">Lab Results</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-400 to-indigo-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={18} /> New Lab Result
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by test name, patient, doctor or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
      />

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#30363d]">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-[#161b22] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Test Name</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Test Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">File</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-[#30363d] hover:bg-[#161b22] transition">
                  <td className="px-4 py-3 font-medium text-white">{l.test_name}</td>
                  <td className="px-4 py-3">{l.patient_name}</td>
                  <td className="px-4 py-3">{l.doctor_name}</td>
                  <td className="px-4 py-3">{l.test_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(l.status)}`}>
                      {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{l.notes || '—'}</td>
                  <td className="px-4 py-3">
                    {l.result_file_url ? (
                      <button
                        onClick={() => window.open(l.result_file_url as string, '_blank')}
                        className="text-sky-400 hover:underline text-xs"
                      >
                        View File
                      </button>
                    ) : (
                      <span className="text-gray-500 text-xs">No file</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">No lab results found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-semibold">New Lab Result</h2>
              <button onClick={() => setShowModal(false)}><X className="text-gray-400 hover:text-white" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-gray-400 text-xs">Patient</label>
                <select
                  value={form.patient}
                  onChange={(e) => setForm({ ...form, patient: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-sm focus:outline-none focus:border-sky-400"
                >
                  <option value="">Select patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{getPatientLabel(p)}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-gray-400 text-xs">Doctor</label>
                <select
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-sm focus:outline-none focus:border-sky-400"
                >
                  <option value="">Select doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{getDoctorLabel(d)}</option>
                  ))}
                </select>
              </div>

              {[
                { label: 'Test Name', key: 'test_name' },
                { label: 'Test Date', key: 'test_date', type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-gray-400 text-xs">{label}</label>
                  <input
                    type={type || 'text'}
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-xs">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-sm focus:outline-none focus:border-sky-400"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="reviewed">Reviewed</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-gray-400 text-xs">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-sm focus:outline-none focus:border-sky-400"
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-gray-400 text-xs">Upload Result File (optional)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-gray-400 text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-gradient-to-r from-sky-400 to-indigo-500 text-white py-2 rounded-lg hover:opacity-90 transition font-semibold"
            >
              Add Lab Result
            </button>
          </div>
        </div>
      )}
    </div>
  )
}