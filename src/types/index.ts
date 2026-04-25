export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'doctor' | 'patient'
}

export interface Patient {
  id: number
  username: string
  email: string
  date_of_birth: string
  blood_type: string
  allergies: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_history: string
  created_at: string
}

export interface Doctor {
  id: number
  username: string
  email: string
  specialisation: string
  license_number: string
  years_experience: number
  available_days: string[]
  created_at: string
}

export interface Appointment {
  id: number
  patient_detail: Patient
  doctor_detail: Doctor
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  reason: string
  notes: string | null
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}
