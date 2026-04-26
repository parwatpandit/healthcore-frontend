import { useEffect, useState } from 'react'
import axios from '../../api/axios'
import { Pill, Plus, X } from 'lucide-react'

interface Prescription {
  id: number
  patient: number
  doctor: number
  appointment: number | null
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  prescribed_date: string
  is_active: boolean
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

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filtered, setFiltered] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    appointment: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    is_active: true,
  })

  const fetchAll = async () => {
    try {
      const [presRes, patRes, docRes] = await Promise.all([
        axios.get('/prescriptions/'),
        axios.get('/patients/'),
        axios.get('/doctors/'),
      ])
      setPrescriptions(presRes.data)
      setFiltered(presRes.data)
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
        prescriptions.filter(
          (p) =>
            p.medication_name.toLowerCase().includes(q) ||
            p.patient_name.toLowerCase().includes(q) ||
            p.doctor_name.toLowerCase().includes(q)
        )
      )
    }, 400)
    return () => clearTimeout(timer)
  }, [search, prescriptions])

  const handleSubmit = async () => {
    try {
      await axios.post('/prescriptions/', {
        ...form,
        patient: Number(form.patient),
        doctor: Number(form.doctor),
        appointment: form.appointment ? Number(form.appointment) : null,
      })
      setShowModal(false)
      setForm({
        patient: '', doctor: '', appointment: '', medication_name: '',
        dosage: '', frequency: '', duration: '', instructions: '', is_active: true,
      })
      fetchAll()
    } catch (err) {
      console.error(err)
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
          <Pill className="text-sky-400" size={28} />
          <h1 className="text-2xl font-bold text-white">Prescriptions</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-400 to-indigo-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={18} /> New Prescription
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by medication, patient or doctor..."
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
                <th className="px-4 py-3">Medication</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Dosage</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-[#30363d] hover:bg-[#161b22] transition">
                  <td className="px-4 py-3 font-medium text-white">{p.medication_name}</td>
                  <td className="px-4 py-3">{p.patient_name}</td>
                  <td className="px-4 py-3">{p.doctor_name}</td>
                  <td className="px-4 py-3">{p.dosage}</td>
                  <td className="px-4 py-3">{p.frequency}</td>
                  <td className="px-4 py-3">{p.duration}</td>
                  <td className="px-4 py-3">{p.prescribed_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No prescriptions found</td>
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
              <h2 className="text-white text-lg font-semibold">New Prescription</h2>
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
                { label: 'Medication Name', key: 'medication_name' },
                { label: 'Dosage', key: 'dosage' },
                { label: 'Frequency', key: 'frequency' },
                { label: 'Duration', key: 'duration' },
              ].map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-gray-400 text-xs">{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-gray-400 text-xs">Instructions</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white text-sm focus:outline-none focus:border-sky-400"
                  rows={3}
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-gradient-to-r from-sky-400 to-indigo-500 text-white py-2 rounded-lg hover:opacity-90 transition font-semibold"
            >
              Add Prescription
            </button>
          </div>
        </div>
      )}
    </div>
  )
}