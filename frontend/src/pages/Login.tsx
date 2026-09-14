import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Erro ao efetuar login')
    } finally {
      setIsSubmitting(false)
    }
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
            <input id="password" value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" required />
          </div>
          {error && <div className="error" role="alert">{error}</div>}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </main>
      <Footer />
    </div>
  )
}
