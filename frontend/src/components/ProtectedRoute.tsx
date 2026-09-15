import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) return <div className="container">Carregando sessão...</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  return children
}
