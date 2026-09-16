import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const residentPath = !loading && isAuthenticated ? '/dashboard' : '/login'

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
          <a href="/#contacts">Contato</a>
          <Link to={residentPath} className="btn">Área do Morador</Link>
        </nav>
      </div>
    </header>
  )
}
