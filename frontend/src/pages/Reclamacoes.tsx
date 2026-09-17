import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

function currentDateValue() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

function formatDateForDisplay(value: string) {
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}/${month}/${year}` : value
}

function normalizeDateValue(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return match ? `${match[3]}-${match[2]}-${match[1]}` : ''
}

export default function Reclamacoes() {
  const [nome, setNome] = useState('')
  const [apartamento, setApartamento] = useState('')
  const [bloco, setBloco] = useState('')
  const [assunto, setAssunto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(currentDateValue)
  const [dataDisplay, setDataDisplay] = useState(() => formatDateForDisplay(currentDateValue()))
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
      const normalizedDate = normalizeDateValue(dataDisplay)
      if (!normalizedDate) {
        setError('Informe a date no formato dd/mm/aaaa.')
        return
      }

      const payload = {
        user_id: session.user.id,
        nome,
        apartamento,
        assunto,
        descricao,
        data: normalizedDate
      }

      const { error: insertError } = await supabase.from('reclamacoes').insert({
        ...payload,
        ...(bloco ? { bloco } : {})
      })

      if (insertError) {
        if (insertError.message.includes('bloco')) {
          const { error: retryError } = await supabase.from('reclamacoes').insert(payload)
          if (retryError) throw retryError
        } else {
          throw insertError
        }
      }

      setSuccess('Reclamação enviada com sucesso.')
      setNome('')
      setApartamento('')
      setBloco('')
      setAssunto('')
      setDescricao('')
      setData(currentDateValue())
      setDataDisplay(formatDateForDisplay(currentDateValue()))
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
          <input id="complaint-date" type="text" inputMode="numeric" value={dataDisplay} onChange={e => { setDataDisplay(e.target.value); setData(normalizeDateValue(e.target.value)) }} placeholder="dd/mm/aaaa" pattern="\d{2}/\d{2}/\d{4}" maxLength={10} required />
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
