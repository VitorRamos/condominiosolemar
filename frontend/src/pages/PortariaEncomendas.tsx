import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { isPortariaEmail } from '../services/portaria'

export type DeliveryStatus = 'RECEBIDA' | 'NOTIFICADA' | 'ENTREGUE'

type DeliveryRecord = {
  id: number
  recipient_name: string
  apartment: string
  block: string
  carrier: string
  tracking_code: string | null
  received_at: string
  status: DeliveryStatus
  notes: string | null
}

export default function PortariaEncomendas() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const emptyForm = { recipient_name: '', apartment: '', block: '', carrier: '', tracking_code: '', notes: '' }
  const [isPortaria, setIsPortaria] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState<'TODAS' | DeliveryStatus>('TODAS')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const statusLabels: Record<DeliveryStatus, string> = { RECEBIDA: 'Recebida', NOTIFICADA: 'Morador notificado', ENTREGUE: 'Entregue' }

  useEffect(() => {
    if (!session?.user.id) return
    const allowed = isPortariaEmail(session.user.email)
    setIsPortaria(allowed)
    supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => {
      const admin = data?.role === 'ADMIN'
      setIsAdmin(admin)
      if (allowed) loadDeliveries()
      else setLoading(false)
    })
  }, [session?.user.id])

  async function loadDeliveries() {
    const { data, error: queryError } = await supabase.from('package_deliveries').select('id, recipient_name, apartment, block, carrier, tracking_code, received_at, status, notes').order('received_at', { ascending: false })
    if (queryError) setError(queryError.message)
    setDeliveries((data as DeliveryRecord[]) || [])
    setLoading(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!session?.user.id) return
    setSaving(true)
    const { data, error: insertError } = await supabase.from('package_deliveries').insert({ ...form, tracking_code: form.tracking_code.trim() || null, notes: form.notes.trim() || null, created_by: session.user.id }).select('id, recipient_name, apartment, block, carrier, tracking_code, received_at, status, notes').single()
    if (insertError) setError(insertError.message)
    else {
      setDeliveries(current => [data as DeliveryRecord, ...current])
      setForm(emptyForm)
      setSuccess('Encomenda registrada com sucesso.')
    }
    setSaving(false)
  }

  async function updateStatus(delivery: DeliveryRecord, status: DeliveryStatus) {
    setActionId(delivery.id)
    setError('')
    const { error: updateError } = await supabase.from('package_deliveries').update({ status }).eq('id', delivery.id)
    if (updateError) setError(updateError.message)
    else setDeliveries(current => current.map(item => item.id === delivery.id ? { ...item, status } : item))
    setActionId(null)
  }

  async function deleteDelivery(delivery: DeliveryRecord) {
    if (!window.confirm(`Excluir a encomenda de ${delivery.recipient_name}?`)) return
    setActionId(delivery.id)
    const { error: deleteError } = await supabase.from('package_deliveries').delete().eq('id', delivery.id)
    if (deleteError) setError(deleteError.message)
    else setDeliveries(current => current.filter(item => item.id !== delivery.id))
    setActionId(null)
  }

  const visibleDeliveries = useMemo(() => deliveries.filter(delivery => {
    const matchesFilter = filter === 'TODAS' || delivery.status === filter
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [delivery.recipient_name, delivery.apartment, delivery.block, delivery.carrier, delivery.tracking_code || ''].some(value => value.toLowerCase().includes(query))
    return matchesFilter && matchesSearch
  }), [deliveries, filter, search])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  }

  if (!isPortaria) return <div className="site-root"><Header /><main className="dashboard-shell container"><Link className="dashboard-back-link" to="/portaria">← Voltar para a Portaria</Link><h1>Acesso restrito</h1><p>Esta área está disponível somente para usuários autorizados da portaria.</p></main><Footer /></div>

  return (
    <div className="site-root">
      <Header />
      <main className="delivery-page container">
        <div className="dashboard-header">
          <div><Link className="dashboard-back-link" to="/dashboard">← Voltar para a Área do Morador</Link><span className="dashboard-kicker">Portaria</span><h1>Registro de encomendas</h1><p>Registre a chegada, avise o morador e acompanhe a retirada.</p></div>
          <button className="dashboard-logout" type="button" onClick={handleLogout}>Sair</button>
        </div>
        {success && <div className="success" role="status">{success}</div>}
        {error && <div className="error" role="alert">{error}</div>}
        {isAdmin && <section className="delivery-form-card"><div className="section-heading"><div><span className="section-label">Nova entrada</span><h2>Registrar encomenda</h2></div></div><form onSubmit={handleSubmit}><div className="delivery-form-grid"><div><label htmlFor="delivery-recipient">Destinatário</label><input id="delivery-recipient" value={form.recipient_name} onChange={event => setForm({ ...form, recipient_name: event.target.value })} required /></div><div><label htmlFor="delivery-carrier">Transportadora</label><input id="delivery-carrier" value={form.carrier} onChange={event => setForm({ ...form, carrier: event.target.value })} placeholder="Correios, iFood..." required /></div><div><label htmlFor="delivery-apartment">Apartamento</label><select id="delivery-apartment" value={form.apartment} onChange={event => setForm({ ...form, apartment: event.target.value })} required><option value="" disabled>Selecione</option>{['101','102','103','104','201','202','203','204','301','302','303','304','401','402','403','404','501','502','503','504','601','602','603','604','701','702','703','704'].map(value => <option key={value}>{value}</option>)}</select></div><div><label htmlFor="delivery-block">Bloco</label><select id="delivery-block" value={form.block} onChange={event => setForm({ ...form, block: event.target.value })} required><option value="" disabled>Selecione</option><option>Bloco A</option><option>Bloco B</option></select></div><div><label htmlFor="delivery-tracking">Código de rastreio <span className="field-help">opcional</span></label><input id="delivery-tracking" value={form.tracking_code} onChange={event => setForm({ ...form, tracking_code: event.target.value })} /></div><div><label htmlFor="delivery-notes">Observações <span className="field-help">opcional</span></label><input id="delivery-notes" value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></div></div><button type="submit" disabled={saving}>{saving ? 'Registrando...' : 'Registrar encomenda'}</button></form></section>}
        <section className="delivery-list-section"><div className="section-heading"><div><span className="section-label">Livro da portaria</span><h2>Encomendas registradas</h2></div><span className="section-count">{visibleDeliveries.length} de {deliveries.length}</span></div><div className="delivery-toolbar"><input aria-label="Buscar encomenda" placeholder="Buscar por morador, apartamento ou transportadora" value={search} onChange={event => setSearch(event.target.value)} /><select aria-label="Filtrar por status" value={filter} onChange={event => setFilter(event.target.value as typeof filter)}><option value="TODAS">Todos os status</option><option value="RECEBIDA">Recebidas</option><option value="NOTIFICADA">Notificadas</option><option value="ENTREGUE">Entregues</option></select></div>{loading && <div className="dashboard-loading">Carregando encomendas...</div>}{!loading && visibleDeliveries.length === 0 && <div className="dashboard-empty"><strong>Nenhuma encomenda encontrada.</strong><span>Os registros da portaria aparecerão aqui.</span></div>}<div className="delivery-list">{visibleDeliveries.map(delivery => <article className="delivery-item" key={delivery.id}><div className="delivery-item-main"><div><span className={`delivery-status delivery-status-${delivery.status.toLowerCase()}`}>{statusLabels[delivery.status]}</span><h3>{delivery.recipient_name}</h3><p>Apartamento {delivery.apartment} · {delivery.block}</p></div><time dateTime={delivery.received_at}>{formatDate(delivery.received_at)}</time></div><div className="delivery-meta"><span>{delivery.carrier}</span>{delivery.tracking_code && <span>Rastreio: {delivery.tracking_code}</span>}{delivery.notes && <span>{delivery.notes}</span>}</div>{isAdmin && <div className="delivery-actions"><button type="button" onClick={() => updateStatus(delivery, 'RECEBIDA')} disabled={actionId === delivery.id || delivery.status === 'RECEBIDA'}>Recebida</button><button type="button" onClick={() => updateStatus(delivery, 'NOTIFICADA')} disabled={actionId === delivery.id || delivery.status === 'NOTIFICADA'}>Notificar</button><button type="button" onClick={() => updateStatus(delivery, 'ENTREGUE')} disabled={actionId === delivery.id || delivery.status === 'ENTREGUE'}>Entregue</button><button type="button" className="delivery-delete" onClick={() => deleteDelivery(delivery)} disabled={actionId === delivery.id}>Excluir</button></div>}</article>)}</div></section>
      </main>
      <Footer />
    </div>
  )
}
