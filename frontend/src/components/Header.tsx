import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { isAuthenticated, loading } = useAuth()
  const residentPath = !loading && isAuthenticated ? '/dashboard' : '/login'

  return (
    <header className="site-header">
      <div className="container">
        <a className="brand" href="/">Condomínio Sol e Mar</a>
        <nav>
          <a href="/#history">História</a>
          <a href="/#gallery">Galeria</a>
          <a href="/#imoveis">Imóveis</a>
          <a href="/#contacts">Contato</a>
          <Link to={residentPath} className="btn">Área do Morador</Link>
        </nav>
      </div>
    </header>
  )
}
