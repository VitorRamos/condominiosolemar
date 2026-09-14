import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

type Profile = {
  name: string | null
  role: string
}

type PropertyAd = {
  id: number
  title: string
  type: string
  location: string
  price: string
  description: string
  photos: string[]
}

type ServiceAd = {
  id: number
  name: string
  category: string
  phone: string
  description: string
  photo: string | null
}

type FinancialEntry = {
  id: number
  entry_date: string
  type: string
  description: string
  category: string
  value: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [properties, setProperties] = useState<PropertyAd[]>([])
  const [services, setServices] = useState<ServiceAd[]>([])
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.user) return

    async function loadDashboard() {
      setLoading(true)
      setError('')

      const profileResult = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', session.user.id)
        .single()

      const [propertiesResult, servicesResult] = await Promise.all([
        supabase.from('property_ads').select('id, title, type, location, price, description, photos').eq('published', true).order('created_at', { ascending: false }),
        supabase.from('service_ads').select('id, name, category, phone, description, photo').eq('published', true).order('created_at', { ascending: false })
      ])

      if (profileResult.error || propertiesResult.error || servicesResult.error) {
        setError(profileResult.error?.message || propertiesResult.error?.message || servicesResult.error?.message || 'Não foi possível carregar o dashboard')
        setLoading(false)
        return
      }

      setProfile(profileResult.data)
      setProperties(propertiesResult.data || [])
      setServices(servicesResult.data || [])

      if (profileResult.data.role === 'ADMIN') {
        const entriesResult = await supabase
          .from('financial_entries')
          .select('id, entry_date, type, description, category, value')
          .order('entry_date', { ascending: false })

        if (entriesResult.error) setError(entriesResult.error.message)
        setEntries(entriesResult.data || [])
      }

      setLoading(false)
    }

    loadDashboard().catch((loadError: Error) => {
      setError(loadError.message)
      setLoading(false)
    })
  }, [session])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (loading) return (
    <div className="site-root">
      <Header />
      <main className="dashboard-shell container">
        <div className="dashboard-loading">Carregando seu painel...</div>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className="site-root">
      <Header />
      <main className="dashboard-shell container">
        <div className="dashboard-header">
          <div>
            <span className="dashboard-kicker">Área do morador</span>
            <h1>Seu condomínio, em um só lugar</h1>
            <p>{profile?.name || session?.user.email} <span className="role-badge">{profile?.role || 'MORADOR'}</span></p>
          </div>
          <button className="dashboard-logout" type="button" onClick={handleLogout}>Sair</button>
        </div>

        {error && <div className="error" role="alert">{error}</div>}

        <section className="dashboard-summary" aria-label="Resumo do painel">
          <div className="summary-card summary-primary">
            <span>Imóveis disponíveis</span>
            <strong>{properties.length}</strong>
            <small>anúncios publicados</small>
          </div>
          <div className="summary-card">
            <span>Serviços no condomínio</span>
            <strong>{services.length}</strong>
            <small>prestadores cadastrados</small>
          </div>
          <div className="summary-card">
            <span>Acesso</span>
            <strong>{profile?.role === 'ADMIN' ? 'Admin' : 'Morador'}</strong>
            <small>perfil ativo</small>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="section-label">Mural do condomínio</span>
              <h2>Imóveis publicados</h2>
            </div>
            <span className="section-count">{properties.length} {properties.length === 1 ? 'item' : 'itens'}</span>
          </div>
          <div className="dashboard-grid">
            {properties.length === 0 && <div className="dashboard-empty"><strong>Nenhum imóvel disponível ainda</strong><span>Novos anúncios aparecerão aqui quando forem publicados.</span></div>}
            {properties.map(property => (
              <article className="dashboard-card" key={property.id}>
                {property.photos[0] && <img src={property.photos[0]} alt={property.title} />}
                <div className="dashboard-card-body">
                  <span className="card-tag">{property.type}</span>
                  <h3>{property.title}</h3>
                  <p>{property.location} · {property.description}</p>
                  <strong className="card-price">{property.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="section-label">Rede local</span>
              <h2>Prestadores de serviços</h2>
            </div>
            <span className="section-count">{services.length} {services.length === 1 ? 'item' : 'itens'}</span>
          </div>
          <div className="dashboard-grid">
            {services.length === 0 && <div className="dashboard-empty"><strong>Nenhum prestador cadastrado ainda</strong><span>Quando houver serviços disponíveis, eles aparecerão neste espaço.</span></div>}
            {services.map(service => (
              <article className="dashboard-card" key={service.id}>
                {service.photo && <img src={service.photo} alt={service.name} />}
                <div className="dashboard-card-body">
                  <span className="card-tag">{service.category}</span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <strong className="card-contact">{service.phone}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        {profile?.role === 'ADMIN' && (
          <section className="dashboard-section dashboard-financial">
            <div className="section-heading">
              <div>
                <span className="section-label">Gestão</span>
                <h2>Financeiro</h2>
              </div>
              <span className="section-count">{entries.length} lançamentos</span>
            </div>
            <div className="dashboard-grid">
              {entries.length === 0 && <div className="dashboard-empty"><strong>Nenhum lançamento financeiro</strong><span>Os registros financeiros do condomínio aparecerão aqui.</span></div>}
              {entries.map(entry => (
                <article className="financial-row" key={entry.id}>
                  <div><strong>{entry.description}</strong><span>{entry.entry_date} · {entry.category}</span></div>
                  <strong className={entry.type === 'Entrada' ? 'amount-positive' : 'amount-negative'}>{entry.type}: R$ {Number(entry.value).toFixed(2)}</strong>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
