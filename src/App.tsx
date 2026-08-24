import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Participate from './pages/Participate'
import Game from './pages/Game'
import FinalCode from './pages/FinalCode'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminQR from './pages/AdminQR'
import Audit from './pages/Audit'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/participar" element={<Participate />} />
        <Route path="/jogo/:code" element={<Game />} />
        <Route path="/final/:code" element={<FinalCode />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard/:code" element={<AdminDashboard />} />
        <Route path="/admin/qr/:code" element={<AdminQR />} />
        <Route path="/auditoria" element={<Audit />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}
