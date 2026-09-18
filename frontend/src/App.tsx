import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Reclamacoes from './pages/Reclamacoes'
import PortalTransparencia from './pages/PortalTransparencia'
import AnunciarImovel from './pages/AnunciarImovel'
import AnunciarServicos from './pages/AnunciarServicos'
import FormulariosEnviados from './pages/FormulariosEnviados'
import PortariaEncomendas from './pages/PortariaEncomendas'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './hooks/useAuth'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reclamacoes" element={<ProtectedRoute><Reclamacoes /></ProtectedRoute>} />
          <Route path="/transparencia" element={<ProtectedRoute><PortalTransparencia /></ProtectedRoute>} />
          <Route path="/anunciar-imovel" element={<ProtectedRoute><AnunciarImovel /></ProtectedRoute>} />
          <Route path="/anunciar-servicos" element={<ProtectedRoute><AnunciarServicos /></ProtectedRoute>} />
          <Route path="/formularios-enviados" element={<ProtectedRoute><FormulariosEnviados /></ProtectedRoute>} />
          <Route path="/portaria/encomendas" element={<ProtectedRoute><PortariaEncomendas /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
