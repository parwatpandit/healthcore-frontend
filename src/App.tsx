import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/patients/Patients'
import Doctors from './pages/doctors/Doctors'
import Appointments from './pages/appointments/Appointments'
import Prescriptions from './pages/prescriptions/Prescriptions'
import LabResults from './pages/lab_results/LabResults'
import Billing from './pages/billing/Billing'
import Layout from './components/Layout'
import PatientDetail from './pages/patients/PatientDetail'
import DoctorDetail from './pages/doctors/DoctorDetail'
import MLPredictor from './pages/ml/MLPredictor'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="lab-results" element={<LabResults />} />
          <Route path="billing" element={<Billing />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />
          <Route path="ml" element={<MLPredictor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}