import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { isPortariaEmail } from '../services/portaria'

export default function Portaria() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const allowed = isPortariaEmail(session?.user.email)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (!allowed) {
    return <div className="site-root"><Header /><main className="dashboard-shell container"><Link className="dashboard-back-link" to="/">← Voltar para a página inicial</Link><h1>Acesso restrito</h1><p>Esta área está disponível somente para usuários autorizados da portaria.</p></main><Footer /></div>
  }

  return (
    <div className="site-root">
      <Header />
      <main className="portaria-shell container">
        <div className="dashboard-header">
          <div><Link className="dashboard-back-link" to="/">← Voltar para a página inicial</Link><span className="dashboard-kicker">Portaria</span><h1>Painel da portaria</h1><p>Escolha uma operação para continuar.</p></div>
          <button className="dashboard-logout" type="button" onClick={handleLogout}>Sair</button>
        </div>
        <section className="portaria-welcome" aria-label="Status do acesso">
          <div className="portaria-welcome-mark" aria-hidden="true">⌂</div>
          <div><strong>Central operacional</strong><span>O acesso da portaria está ativo para este dispositivo.</span></div>
          <span className="portaria-access-badge">Acesso autorizado</span>
        </section>
        <section className="portaria-menu" aria-label="Menu da portaria">
          <div className="portaria-menu-heading"><div><span className="section-label">Operações</span><h2>Controle do condomínio</h2></div><span className="portaria-menu-count">01</span></div>
          <Link className="portaria-menu-link" to="/portaria/encomendas"><span className="portaria-menu-icon" aria-hidden="true">▣</span><span className="portaria-menu-copy"><strong>Registrar encomendas</strong><small>Cadastre chegadas, notifique moradores e acompanhe as retiradas.</small><em>Abrir operação</em></span><span className="portaria-menu-arrow" aria-hidden="true">→</span></Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}