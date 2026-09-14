import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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
    <div className="login-page">
      <header className="login-header">
        <div className="container login-header-inner">
          <Link className="login-brand" to="/">Condomínio Sol e Mar</Link>
          <nav aria-label="Navegação principal">
            <Link to="/#history">História</Link>
            <Link to="/#gallery">Galeria</Link>
            <Link to="/#imoveis">Imóveis</Link>
            <Link to="/#contacts">Contato</Link>
          </nav>
        </div>
      </header>

      <main className="login-main container">
        <section className="login-visual" aria-label="Condomínio Sol e Mar">
          <span className="pill">Área do morador</span>
          <h1>Bem-vindo de volta.</h1>
          <p>Acesse sua conta para acompanhar a vida do condomínio e falar com a administração.</p>
          <Link className="login-home-link" to="/">← Voltar para a página inicial</Link>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-heading">
            <span className="login-kicker">Acesso seguro</span>
            <h2 id="login-title">Entrar na sua conta</h2>
            <p>Use o e-mail cadastrado no condomínio.</p>
          </div>
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
          <Link className="login-back-link" to="/">← Voltar sem entrar</Link>
        </section>
      </main>
    </div>
  )
}
