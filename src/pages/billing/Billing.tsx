import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { FileText, Plus, Download, X } from 'lucide-react'

interface InvoiceItem {
  id?: number
  description: string
  quantity: number
  unit_price: string
  line_total?: number
}

interface Invoice {
  id: number
  invoice_number: string
  status: string
  patient: number
  patient_name: string
  doctor: number
  doctor_name: string
  appointment: number | null
  issue_date: string
  due_date: string
  notes: string
  items: InvoiceItem[]
  total_amount: number
  created_at: string
}

interface Patient {
  id: number
  first_name: string
  last_name: string
  email: string
}

interface Doctor {
  id: number
  user: { username: string }
  specialisation: string
  license_number: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  sent: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  paid: 'bg-green-500/20 text-green-300 border border-green-500/30',
  overdue: 'bg-red-500/20 text-red-300 border border-red-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
}

const EMPTY_ITEM: InvoiceItem = { description: '', quantity: 1, unit_price: '' }

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    due_date: '',
    status: 'draft',
    notes: '',
    items: [{ ...EMPTY_ITEM }],
  })

  const fetchInvoices = async () => {
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/billing/', { params })
      setInvoices(res.data)
    } catch {
      setError('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdowns = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        api.get('/patients/'),
        api.get('/doctors/'),
      ])
      setPatients(pRes.data)
      setDoctors(dRes.data)
    } catch {
      setError('Failed to load patients or doctors')
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  useEffect(() => {
    fetchDropdowns()
  }, [])

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...form.items]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, items: updated })
  }

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { ...EMPTY_ITEM }] })
  }

  const removeItem = (index: number) => {
    if (form.items.length === 1) return
    const updated = form.items.filter((_, i) => i !== index)
    setForm({ ...form, items: updated })
  }

  const calcTotal = () => {
    return form.items.reduce((sum, item) => {
      return sum + item.quantity * (parseFloat(item.unit_price) || 0)
    }, 0).toFixed(2)
  }

  const handleSubmit = async () => {
    if (!form.patient || !form.doctor || !form.due_date) {
      setError('Patient, doctor and due date are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post('/billing/', {
        patient: parseInt(form.patient),
        doctor: parseInt(form.doctor),
        due_date: form.due_date,
        status: form.status,
        notes: form.notes,
        items: form.items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      })
      setShowModal(false)
      setForm({
        patient: '',
        doctor: '',
        due_date: '',
        status: 'draft',
        notes: '',
        items: [{ ...EMPTY_ITEM }],
      })
      fetchInvoices()
    } catch {
      setError('Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const res = await api.get(`/billing/${invoice.id}/pdf/`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoice.invoice_number}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to download PDF')
    }
  }

  const filtered = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    inv.doctor_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-gray-400 text-sm mt-1">Manage invoices and payments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 transition"
        >
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Invoice Table */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading invoices...</div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d] text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Invoice</th>
                <th className="px-4 py-3 text-left">Patient</th>
                <th className="px-4 py-3 text-left">Doctor</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-[#30363d] hover:bg-[#0d1117] transition">
                    <td className="px-4 py-3 font-mono text-sky-400 font-semibold">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-white">{inv.patient_name}</td>
                    <td className="px-4 py-3 text-gray-300">{inv.doctor_name}</td>
                    <td className="px-4 py-3 text-gray-400">{inv.due_date}</td>
                    <td className="px-4 py-3 text-white font-semibold">
                      £{inv.total_amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs hover:bg-sky-500/20 transition"
                      >
                        <Download size={12} /> PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText size={18} className="text-sky-400" /> New Invoice
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 flex flex-col gap-4">
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Patient */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Patient</label>
                <select
                  value={form.patient}
                  onChange={e => setForm({ ...form, patient: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">Select patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} — {p.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Doctor</label>
                <select
                  value={form.doctor}
                  onChange={e => setForm({ ...form, doctor: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">Select doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.user?.username} — {d.specialisation} — {d.license_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date and Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Line Items</label>
                  <button
                    onClick={addItem}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {form.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                        className="col-span-5 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        min={1}
                        onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        className="col-span-2 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unit_price}
                        step="0.01"
                        onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                        className="col-span-4 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={() => removeItem(index)}
                        className="col-span-1 text-gray-500 hover:text-red-400 transition flex justify-center"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Preview */}
              <div className="flex justify-end">
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-sm">
                  <span className="text-gray-400">Total: </span>
                  <span className="text-white font-bold text-lg">£{calcTotal()}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Optional notes..."
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}