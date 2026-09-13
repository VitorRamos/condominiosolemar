import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'

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
    <div className="container reclamacoes-page">
      <h2>Registrar Reclamação</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>
          <input value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        <div>
          <label>Apartamento</label>
          <input value={apartamento} onChange={e => setApartamento(e.target.value)} required />
        </div>
        <div>
          <label>Assunto</label>
          <input value={assunto} onChange={e => setAssunto(e.target.value)} required />
        </div>
        <div>
          <label>Descrição</label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} required />
        </div>
        <div>
          <label>Data</label>
          <input type="date" value={data} onChange={e => setData(e.target.value)} />
        </div>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}
