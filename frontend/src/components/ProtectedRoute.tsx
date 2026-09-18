import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isPortariaEmail } from '../services/portaria'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) return <div className="container">Carregando sessão...</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  return children
}

export function ResidentRoute({ children }: { children: JSX.Element }) {
  const { loading, isAuthenticated, session } = useAuth()
  const location = useLocation()

  if (loading) return <div className="container">Carregando sessão...</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (isPortariaEmail(session?.user.email)) return <Navigate to="/portaria" replace />

  return children
}

export function PortariaRoute({ children }: { children: JSX.Element }) {
  const { loading, isAuthenticated, session } = useAuth()
  const location = useLocation()

  if (loading) return <div className="container">Carregando sessão...</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isPortariaEmail(session?.user.email)) return <Navigate to="/dashboard" replace />

  return children
}
