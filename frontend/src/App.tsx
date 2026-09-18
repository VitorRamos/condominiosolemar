import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import { PortariaRoute, ResidentRoute } from './components/ProtectedRoute'
import { AuthProvider } from './hooks/useAuth'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Reclamacoes = lazy(() => import('./pages/Reclamacoes'))
const PortalTransparencia = lazy(() => import('./pages/PortalTransparencia'))
const AnunciarImovel = lazy(() => import('./pages/AnunciarImovel'))
const AnunciarServicos = lazy(() => import('./pages/AnunciarServicos'))
const FormulariosEnviados = lazy(() => import('./pages/FormulariosEnviados'))
const PortariaEncomendas = lazy(() => import('./pages/PortariaEncomendas'))
const Portaria = lazy(() => import('./pages/Portaria'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteFallback() {
  return <div className="container">Carregando...</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
