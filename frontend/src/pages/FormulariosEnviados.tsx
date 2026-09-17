import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'

type ComplaintItem = {
  id: number
  nome: string
  apartamento: string
  bloco: string
  assunto: string
  descricao: string
  responder_para: string
  responder_contato: string
  data: string
  lido: boolean
  arquivado: boolean
  user_id?: string
  created_at?: string
}

function formatComplaintDate(value: string) {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
  }
  return value
}

export default function FormulariosEnviados() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [complaints, setComplaints] = useState<ComplaintItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ComplaintItem | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.user.id) return

    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        const admin = data?.role === 'ADMIN'
        setIsAdmin(admin)
        if (admin) {
          loadComplaints()
        } else {
          setLoading(false)
        }
      })
      .catch(() => {
        setIsAdmin(false)
        setLoading(false)
      })
  }, [session?.user.id])

  async function loadComplaints() {
    const { data, error: fetchError } = await supabase
      .from('reclamacoes')
      .select('id, nome, apartamento, bloco, assunto, descricao, responder_para, responder_contato, data, lido, arquivado, created_at, user_id')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setComplaints((data as ComplaintItem[]) || [])
    setLoading(false)
  }

  async function archiveComplaint(id: number) {
    setActionId(id)
    setError('')
    const complaint = complaints.find(item => item.id === id)
    const { error: archiveError } = await supabase.from('reclamacoes').update({ arquivado: !complaint?.arquivado }).eq('id', id)
    if (archiveError) {
      setError(archiveError.message)
    } else {
      setComplaints(current => current.map(item => item.id === id ? { ...item, arquivado: !item.arquivado } : item))
    }
    setActionId(null)
  }

  async function toggleRead(id: number) {
    const complaint = complaints.find(item => item.id === id)
    if (!complaint) return

    setActionId(id)
    setError('')
    const { error: readError } = await supabase.from('reclamacoes').update({ lido: !complaint.lido }).eq('id', id)
    if (readError) {
      setError(readError.message)
    } else {
      setComplaints(current => current.map(item => item.id === id ? { ...item, lido: !item.lido } : item))
    }
    setActionId(null)
  }

  async function deleteComplaint(id: number) {
    setActionId(id)
    setError('')
    const { error: deleteError } = await supabase.from('reclamacoes').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
    } else {
      setComplaints(current => current.filter(complaint => complaint.id !== id))
    }
    setActionId(null)
    setPendingDelete(null)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const visibleComplaints = complaints.filter(complaint => complaint.arquivado === showArchived)
  const activeCount = complaints.filter(complaint => !complaint.arquivado).length
  const archivedCount = complaints.filter(complaint => complaint.arquivado).length

  if (!isAdmin) {
    return (
      <div className="site-root">
        <Header />
        <main className="dashboard-shell container">
          <Link className="dashboard-back-link" to="/dashboard">← Voltar para a Área do Morador</Link>
          <h1>Acesso restrito</h1>
          <p>Esta área está disponível somente para administradores.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="site-root">
      <Header />
      <main className="dashboard-shell container">
        <div className="dashboard-header">
          <div>
            <Link className="dashboard-back-link" to="/dashboard">← Voltar para a Área do Morador</Link>
            <span className="dashboard-kicker">Administração</span>
            <h1>Formulários Recebidos</h1>
            <p>Leitura das reclamações recebidas pelos moradores.</p>
          </div>
          <button className="dashboard-logout" type="button" onClick={handleLogout}>Sair</button>
        </div>

        <section className="complaint-admin-panel" aria-label="Caixa de entrada de formulários">
          <div className="inbox-toolbar">
            <div className="inbox-title">
              <span className="inbox-icon" aria-hidden="true">✉</span>
              <div>
                <strong>Caixa de entrada</strong>
                <span>Reclamações e mensagens dos moradores</span>
              </div>
            </div>
            <span className="inbox-count">{visibleComplaints.length} {visibleComplaints.length === 1 ? 'mensagem' : 'mensagens'}</span>
          </div>

          <div className="inbox-tabs" role="tablist" aria-label="Pastas de mensagens">
            <button type="button" className={!showArchived ? 'is-active' : ''} onClick={() => setShowArchived(false)} role="tab" aria-selected={!showArchived}>
              Recebidas <span>{activeCount}</span>
            </button>
            <button type="button" className={showArchived ? 'is-active' : ''} onClick={() => setShowArchived(true)} role="tab" aria-selected={showArchived}>
              Arquivadas <span>{archivedCount}</span>
            </button>
          </div>

          {loading && <p>Carregando formulários...</p>}
          {error && <div className="error" role="alert">{error}</div>}

          {!loading && visibleComplaints.length === 0 && (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">✉</span>
              <strong>{showArchived ? 'Nenhuma mensagem arquivada' : 'Caixa de entrada vazia'}</strong>
              <span>{showArchived ? 'As mensagens arquivadas aparecerão aqui.' : 'Nenhuma reclamação foi enviada até o momento.'}</span>
            </div>
          )}

          {!loading && visibleComplaints.length > 0 && (
            <div className="complaint-admin-list">
              {visibleComplaints.map((complaint) => (
                <article key={complaint.id} className={`complaint-admin-item ${complaint.lido ? 'is-read' : 'is-unread'}`}>
                  <div className="complaint-subject-row">
                    <div className="complaint-subject-info">
                      <strong>{complaint.assunto}</strong>
                      <span className="complaint-subject-separator" aria-hidden="true">•</span>
                      <span>Mensagem recebida</span>
                    </div>
                    <span>{complaint.lido ? 'Lida' : 'Não lida'}</span>
                  </div>
                  <div className="complaint-admin-header">
                    <div className="complaint-sender">
                      <div>
                      <strong>{complaint.nome}</strong>
                        <span>Apartamento {complaint.apartamento} • {complaint.bloco || 'Bloco não informado'}</span>
                      </div>
                    </div>
                    <small className="complaint-date">{formatComplaintDate(complaint.data)}</small>
                  </div>

                  <p className="complaint-message">{complaint.descricao}</p>

                  <div className="complaint-reply-contact">
                    <strong>Responder para:</strong>
                    <span>{complaint.responder_para || 'Não informado'}</span>
                    {complaint.responder_contato && <span>{complaint.responder_contato}</span>}
                  </div>

                  <div className="complaint-actions">
                    <button type="button" className="complaint-action complaint-read" onClick={() => toggleRead(complaint.id)} disabled={actionId === complaint.id}>
                      {complaint.lido ? 'Marcar como não lida' : 'Marcar como lida'}
                    </button>
                    <button type="button" className="complaint-action complaint-archive" onClick={() => archiveComplaint(complaint.id)} disabled={actionId === complaint.id}>
                      {showArchived ? 'Restaurar' : 'Arquivar'}
                    </button>
                    <button type="button" className="complaint-action complaint-delete" onClick={() => setPendingDelete(complaint)} disabled={actionId === complaint.id}>
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      {pendingDelete && (
        <div className="delete-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null) }}>
          <section className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
            <div className="delete-dialog-icon" aria-hidden="true">!</div>
            <h2 id="delete-dialog-title">Excluir mensagem?</h2>
            <p id="delete-dialog-description">Tem certeza que deseja excluir esta mensagem de <strong>{pendingDelete.nome}</strong>? Esta ação é permanente.</p>
            <div className="delete-dialog-actions">
              <button type="button" className="delete-dialog-cancel" onClick={() => setPendingDelete(null)}>Cancelar</button>
              <button type="button" className="delete-dialog-confirm" onClick={() => deleteComplaint(pendingDelete.id)} disabled={actionId === pendingDelete.id}>
                {actionId === pendingDelete.id ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
