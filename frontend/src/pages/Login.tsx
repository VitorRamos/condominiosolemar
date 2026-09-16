import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import Footer from '../components/Footer'

function postLoginPath(from: string | undefined) {
  return from && from !== '/login' ? from : '/dashboard'
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading } = useAuth()
  const destination = postLoginPath((location.state as { from?: string } | null)?.from)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate(destination, { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Erro ao efetuar login')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="site-root">
        <Header />
        <main className="login-page container">
          <p>Carregando sessão...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={destination} replace />
  }

  return (
    <div className="site-root">
      <Header />
      <main className="login-page container">
        <Link className="login-back-link" to="/">← Voltar para a página inicial</Link>
        <h2>Área do Morador - Login</h2>
        <p>Entre para acessar o painel do condomínio.</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">E-mail</label>
            <input id="email" value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" required />
          </div>
          <div>
            <label htmlFor="password">Senha</label>
            <div className="password-field">
              <input id="password" value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                <svg className="password-eye" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M2.5 12s3.4-5 9.5-5 9.5 5 9.5 5-3.4 5-9.5 5-9.5-5-9.5-5Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </button>
            </div>
          </div>
          {error && <div className="error" role="alert">{error}</div>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </main>
      <Footer />
    </div>
  )
}
