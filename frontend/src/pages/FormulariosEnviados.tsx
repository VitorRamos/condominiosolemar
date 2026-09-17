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
  data: string
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
      .select('id, nome, apartamento, bloco, assunto, descricao, data, created_at, user_id')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setComplaints((data as ComplaintItem[]) || [])
    setLoading(false)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

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

        <section className="complaint-admin-panel">
          {loading && <p>Carregando formulários...</p>}
          {error && <div className="error" role="alert">{error}</div>}

          {!loading && complaints.length === 0 && (
            <div className="empty-state">Nenhuma reclamação foi enviada até o momento.</div>
          )}

          {!loading && complaints.length > 0 && (
            <div className="complaint-admin-list">
              {complaints.map((complaint) => (
                <article key={complaint.id} className="complaint-admin-item">
                  <div className="complaint-admin-header">
                    <div>
                      <strong>{complaint.nome}</strong>
                      <span>{complaint.apartamento} • {complaint.bloco}</span>
                    </div>
                    <small>{formatComplaintDate(complaint.data)}</small>
                  </div>

                  <div className="complaint-admin-meta">
                    <span>Assunto: {complaint.assunto}</span>
                  </div>

                  <p>{complaint.descricao}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
