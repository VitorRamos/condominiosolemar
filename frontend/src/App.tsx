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
import Portaria from './pages/Portaria'
import NotFound from './pages/NotFound'
import { PortariaRoute, ResidentRoute } from './components/ProtectedRoute'
import { AuthProvider } from './hooks/useAuth'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reclamacoes" element={<ResidentRoute><Reclamacoes /></ResidentRoute>} />
          <Route path="/transparencia" element={<ResidentRoute><PortalTransparencia /></ResidentRoute>} />
          <Route path="/anunciar-imovel" element={<ResidentRoute><AnunciarImovel /></ResidentRoute>} />
          <Route path="/anunciar-servicos" element={<ResidentRoute><AnunciarServicos /></ResidentRoute>} />
          <Route path="/formularios-enviados" element={<ResidentRoute><FormulariosEnviados /></ResidentRoute>} />
          <Route path="/portaria/encomendas" element={<PortariaRoute><PortariaEncomendas /></PortariaRoute>} />
          <Route path="/portaria" element={<PortariaRoute><Portaria /></PortariaRoute>} />
          <Route path="/dashboard" element={<ResidentRoute><Dashboard /></ResidentRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
