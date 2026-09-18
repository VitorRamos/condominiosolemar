import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <div className="site-root">
      <Header />
      <main className="not-found-page container">
        <span className="dashboard-kicker">Página não encontrada</span>
        <h1>Esta página não existe</h1>
        <p>O endereço que você acessou não corresponde a nenhuma página do site.</p>
        <Link className="btn not-found-home" to="/">Voltar para a página inicial</Link>
      </main>
      <Footer />
    </div>
  )
}
