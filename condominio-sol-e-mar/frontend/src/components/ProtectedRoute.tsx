import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) return <div className="container">Carregando sessão...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}
