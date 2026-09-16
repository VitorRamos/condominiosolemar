import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <strong>Condomínio Sol e Mar</strong>
          <p>Um endereço familiar no coração de Capim Macio.</p>
          <small>© {new Date().getFullYear()} Condomínio Sol e Mar</small>
        </div>
        <nav className="footer-links" aria-label="Links úteis">
          <strong>Links úteis</strong>
          <a href="/transparencia">Portal da transparência</a>
          <a href="/reclamacoes">Reclamações</a>
          <a href="/anunciar-imovel">Anunciar imóvel</a>
        </nav>
        <div className="footer-location">
          <strong>Onde estamos</strong>
          <p>R. Des. José Gomes da Costa, 1887</p>
          <p>Capim Macio · Natal/RN</p>
          <a href="/#contacts">Entre em contato →</a>
        </div>
      </div>
    </footer>
  )
}
