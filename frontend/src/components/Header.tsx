import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isPortariaEmail } from '../services/portaria'

export default function Header() {
  const { isAuthenticated, loading, session } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const isPortaria = isPortariaEmail(session?.user.email)
  const residentPath = !loading && isAuthenticated ? (isPortaria ? '/portaria' : '/dashboard') : '/login'

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!menuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    function handlePointerDown(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleHashClick(event: React.MouseEvent<HTMLAnchorElement>, hash: string) {
    closeMenu()
    if (location.pathname !== '/') {
      event.preventDefault()
      navigate(`/${hash}`)
    }
  }

  return (
    <header className={`site-header${location.pathname === '/' ? ' home-header' : ''}`}>
      <div className="container">
        <a className="brand" href="/">
          <img className="brand-logo" src="/logo-sol-e-mar.svg" alt="Logo Sol e Mar" />
          <span>Condomínio Sol e Mar</span>
        </a>
        <nav ref={navRef} className={menuOpen ? 'is-open' : undefined}>
          <div className="nav-links" id="site-nav-links">
            <a href="/#history" onClick={event => handleHashClick(event, '#history')}>História</a>
            <a href="/#imoveis" onClick={event => handleHashClick(event, '#imoveis')}>Imóveis</a>
            <a href="/#contacts" onClick={event => handleHashClick(event, '#contacts')}>Contato</a>
            {!isPortaria && <>
              <a href="/reclamacoes" onClick={closeMenu}>Reclamações</a>
              <a href="/transparencia" onClick={closeMenu}>Portal da Transparência</a>
            </>}
          </div>
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-nav-links"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen(current => !current)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
          <Link to={residentPath} className="btn" onClick={closeMenu}>{isPortaria ? 'Área da Portaria' : 'Área do Morador'}</Link>
        </nav>
      </div>
    </header>
  )
}
