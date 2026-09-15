import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Reclamacoes from './pages/Reclamacoes'
import PortalTransparencia from './pages/PortalTransparencia'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reclamacoes" element={<ProtectedRoute><Reclamacoes /></ProtectedRoute>} />
        <Route path="/transparencia" element={<ProtectedRoute><PortalTransparencia /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
