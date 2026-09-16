import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'

type ServiceAd = { id: number; name: string; phone: string; description: string }

export default function AnunciarServicos() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [ads, setAds] = useState<ServiceAd[]>([])
  const [form, setForm] = useState({ name: '', description: '', phone: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!session?.user.id) return
    supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => {
      const admin = data?.role === 'ADMIN'
      setIsAdmin(admin)
      if (admin) loadAds()
    })
  }, [session?.user.id])

  async function loadAds() {
    const { data } = await supabase.from('service_ads').select('id, name, phone, description').order('created_at', { ascending: false }).limit(6)
    setAds((data as ServiceAd[]) || [])
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (ads.length >= 6) {
      setError('O limite de 6 anúncios foi atingido.')
      return
    }
    const { error: insertError } = await supabase.from('service_ads').insert({
      name: form.name.trim(),
      category: 'Serviço',
      description: form.description.trim(),
      phone: form.phone.trim(),
      created_by: session?.user.id,
      published: true,
    })
    if (insertError) {
      setError(insertError.message)
      return
    }
    setForm({ name: '', description: '', phone: '' })
    setSuccess('Anúncio publicado na página inicial.')
    loadAds()
  }

  async function handleDelete(id: number) {
    await supabase.from('service_ads').delete().eq('id', id)
    loadAds()
  }

  if (!isAdmin) {
    return <div className="site-root"><Header /><main className="dashboard-shell container"><Link className="dashboard-back-link" to="/dashboard">← Voltar para a Área do Morador</Link><h1>Acesso restrito</h1><p>Esta área está disponível somente para administradores.</p></main><Footer /></div>
  }

  return (
    <div className="site-root">
      <Header />
      <main className="dashboard-shell container">
        <div className="dashboard-header">
          <div><Link className="dashboard-back-link" to="/dashboard">← Voltar para a Área do Morador</Link><span className="dashboard-kicker">Administração</span><h1>Anunciar Serviços</h1><p>Cadastre até 6 prestadores para aparecerem na página inicial.</p></div>
          <button className="dashboard-logout" type="button" onClick={handleLogout}>Sair</button>
        </div>
        <section className="service-manager">
          <form className="service-manager-form" onSubmit={handleSubmit}>
            <label htmlFor="service-name">Título do anúncio</label>
            <input id="service-name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Eletricista residencial" required />
            <label htmlFor="service-description">Descrição</label>
            <textarea id="service-description" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Descreva o serviço" rows={3} required />
            <label htmlFor="service-phone">Telefone</label>
            <input id="service-phone" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="(84) 99999-0000" required />
            <button type="submit" disabled={ads.length >= 6}>Publicar anúncio</button>
          </form>
          {error && <div className="error" role="alert">{error}</div>}
          {success && <div className="success" role="status">{success}</div>}
          <div className="service-manager-list">{ads.map(ad => <article className="service-manager-item" key={ad.id}><div><strong>{ad.name}</strong><span>{ad.description}</span><small>{ad.phone}</small></div><button type="button" onClick={() => handleDelete(ad.id)}>Excluir</button></article>)}</div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
