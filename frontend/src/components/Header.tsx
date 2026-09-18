import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isPortariaEmail } from '../services/portaria'

export default function Header() {
  const { isAuthenticated, loading, session } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isPortaria = isPortariaEmail(session?.user.email)
  const residentPath = !loading && isAuthenticated ? (isPortaria ? '/portaria' : '/dashboard') : '/login'

  function handleContactClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (location.pathname !== '/') {
      event.preventDefault()
      navigate('/#contacts')
    }
  }

  return (
    <header className={`site-header${location.pathname === '/' ? ' home-header' : ''}`}>
      <div className="container">
        <a className="brand" href="/">
          <img className="brand-logo" src="/logo-sol-e-mar.svg" alt="Logo Sol e Mar" />
          <span>Condomínio Sol e Mar</span>
        </a>
        <nav>
          <a href="/#history">História</a>
          <a href="/#imoveis">Imóveis</a>
          <a href="/#contacts" onClick={handleContactClick}>Contato</a>
          {!isPortaria && <><a href="/reclamacoes">Reclamações</a><a href="/transparencia">Portal da Transparência</a></>}
          <Link to={residentPath} className="btn">{isPortaria ? 'Área da Portaria' : 'Área do Morador'}</Link>
        </nav>
      </div>
    </header>
  )
}
