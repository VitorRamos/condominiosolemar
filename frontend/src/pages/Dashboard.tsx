import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../services/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!session?.user.id) return
    supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => setIsAdmin(data?.role === 'ADMIN'))
  }, [session?.user.id])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="site-root">
      <Header />
      <main className="dashboard-shell container">
        <div className="dashboard-header">
          <div>
            <Link className="dashboard-back-link" to="/">← Voltar para a página inicial</Link>
            <span className="dashboard-kicker">Área do morador</span>
            <h1>Bem-vindo à sua área</h1>
            <p>{session?.user.email}</p>
          </div>
          <button className="dashboard-logout" type="button" onClick={handleLogout}>Sair</button>
        </div>

        <section className="resident-menu" aria-label="Opções da Área do Morador">
          <span className="section-label">Serviços</span>
          <h2>O que você deseja fazer?</h2>
          <Link className="resident-menu-link" to="/reclamacoes">Reclamações <span aria-hidden="true">→</span></Link>
          <Link className="resident-menu-link" to="/transparencia">Portal da Transparência <span aria-hidden="true">→</span></Link>
          {isAdmin && <>
            <Link className="resident-menu-link" to="/anunciar-imovel">Anunciar Imóvel <span aria-hidden="true">→</span></Link>
            <Link className="resident-menu-link" to="/anunciar-servicos">Anunciar Serviços <span aria-hidden="true">→</span></Link>
            <Link className="resident-menu-link" to="/formularios-enviados">Formulários Recebidos <span aria-hidden="true">→</span></Link>
          </>}
        </section>
      </main>
      <Footer />
    </div>
  )
}
