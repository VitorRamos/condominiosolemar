import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Reclamacoes() {
  const [nome, setNome] = useState('')
  const [apartamento, setApartamento] = useState('')
  const [bloco, setBloco] = useState('')
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
        bloco,
        assunto,
        descricao,
        data: data || undefined
      })

      if (insertError) throw insertError

      setSuccess('Reclamação enviada com sucesso')
      setNome('')
      setApartamento('')
      setBloco('')
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
          <label htmlFor="complaint-name">Nome <span className="required-mark" aria-hidden="true">*</span></label>
          <input id="complaint-name" value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="complaint-apartment">Apartamento <span className="required-mark" aria-hidden="true">*</span></label>
          <select id="complaint-apartment" value={apartamento} onChange={e => setApartamento(e.target.value)} required>
            <option value="" disabled>Selecione o apartamento</option>
            {['101', '102', '103', '104', '201', '202', '203', '204', '301', '302', '303', '304', '401', '402', '403', '404', '501', '502', '503', '504', '601', '602', '603', '604', '701', '702', '703', '704'].map(apartment => <option key={apartment} value={apartment}>{apartment}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="complaint-block">Bloco <span className="required-mark" aria-hidden="true">*</span></label>
          <select id="complaint-block" value={bloco} onChange={e => setBloco(e.target.value)} required>
            <option value="" disabled>Selecione o bloco</option>
            <option value="Bloco A">Bloco A</option>
            <option value="Bloco B">Bloco B</option>
          </select>
        </div>
        <div>
          <label htmlFor="complaint-subject">Assunto <span className="required-mark" aria-hidden="true">*</span></label>
          <select id="complaint-subject" value={assunto} onChange={e => setAssunto(e.target.value)} required>
            <option value="" disabled>Selecione o assunto</option>
            <option value="Problemas com vizinhos">Problemas com vizinhos</option>
            <option value="Manutenções">Manutenções</option>
            <option value="Dúvidas">Dúvidas</option>
            <option value="Boleto">Boleto</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div>
          <label htmlFor="complaint-description">Descrição <span className="required-mark" aria-hidden="true">*</span></label>
          <textarea id="complaint-description" value={descricao} onChange={e => setDescricao(e.target.value)} rows={6} required />
        </div>
        <div>
          <label htmlFor="complaint-date">Data <span className="required-mark" aria-hidden="true">*</span></label>
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
