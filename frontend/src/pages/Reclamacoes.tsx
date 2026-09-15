import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Reclamacoes() {
  const [nome, setNome] = useState('')
  const [apartamento, setApartamento] = useState('')
  const [assunto, setAssunto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const { session } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess('')
    setError('')

    if (!session?.user) {
      setError('Sua sessão expirou. Entre novamente para enviar uma reclamação.')
      return
    }

    try {
      const { error: insertError } = await supabase.from('reclamacoes').insert({
        user_id: session.user.id,
        nome,
        apartamento,
        assunto,
        descricao,
        data: data || undefined
      })

      if (insertError) throw insertError

      setSuccess('Reclamação enviada com sucesso')
      setNome('')
      setApartamento('')
      setAssunto('')
      setDescricao('')
      setData('')
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar')
    }
  }

  return (
    <div className="site-root">
      <Header />
      <main className="reclamacoes-page container">
        <Link className="dashboard-back-link" to="/dashboard">← Voltar para a Área do Morador</Link>
        <div className="reclamacoes-heading">
          <span className="dashboard-kicker">Área do morador</span>
          <h1>Registrar reclamação</h1>
          <p>Envie sua mensagem para a administração do condomínio. Todos os campos são obrigatórios.</p>
        </div>
        <section className="reclamacoes-card">
          <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="complaint-name">Nome</label>
          <input id="complaint-name" value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="complaint-apartment">Apartamento</label>
          <input id="complaint-apartment" value={apartamento} onChange={e => setApartamento(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="complaint-subject">Assunto</label>
          <input id="complaint-subject" value={assunto} onChange={e => setAssunto(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="complaint-description">Descrição</label>
          <textarea id="complaint-description" value={descricao} onChange={e => setDescricao(e.target.value)} rows={6} required />
        </div>
        <div>
          <label htmlFor="complaint-date">Data</label>
          <input id="complaint-date" type="date" value={data} onChange={e => setData(e.target.value)} required />
        </div>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <button className="complaint-submit" type="submit">Enviar reclamação</button>
      </form>
        </section>
      </main>
      <Footer />
    </div>
  )
}
