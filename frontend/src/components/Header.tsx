import React from 'react'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <a className="brand" href="/">Condomínio Sol e Mar</a>
        <nav>
          <a href="/#history">História</a>
          <a href="/#gallery">Galeria</a>
          <a href="/#imoveis">Imóveis</a>
          <a href="/#contacts">Contato</a>
          <a href="/login" className="btn">Área do Morador</a>
        </nav>
      </div>
    </header>
  )
}
