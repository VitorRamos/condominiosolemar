import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'

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

  if (loading) return <div className="container"><p>Carregando dashboard...</p></div>

  return (
    <div className="container dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard do Morador</h2>
          <p>{profile?.name || session?.user.email} · {profile?.role || 'MORADOR'}</p>
        </div>
        <button type="button" onClick={handleLogout}>Sair</button>
      </div>

      {error && <div className="error">{error}</div>}

      <section className="section">
        <h2>Imóveis publicados</h2>
        <div className="info-grid">
          {properties.length === 0 && <p>Nenhum imóvel publicado.</p>}
          {properties.map(property => (
            <article className="card" key={property.id}>
              <h3>{property.title}</h3>
              <p><strong>{property.type}</strong> · {property.location}</p>
              <p>{property.description}</p>
              <p><strong>{property.price}</strong></p>
              {property.photos[0] && <img className="service-photo" src={property.photos[0]} alt={property.title} />}
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Prestadores de serviços</h2>
        <div className="info-grid">
          {services.length === 0 && <p>Nenhum prestador publicado.</p>}
          {services.map(service => (
            <article className="card" key={service.id}>
              <h3>{service.name}</h3>
              <p><strong>{service.category}</strong> · {service.phone}</p>
              <p>{service.description}</p>
              {service.photo && <img className="service-photo" src={service.photo} alt={service.name} />}
            </article>
          ))}
        </div>
      </section>

      {profile?.role === 'ADMIN' && (
        <section className="section">
          <h2>Financeiro</h2>
          <div className="info-grid">
            {entries.length === 0 && <p>Nenhum lançamento financeiro.</p>}
            {entries.map(entry => (
              <article className="card" key={entry.id}>
                <h3>{entry.description}</h3>
                <p>{entry.entry_date} · {entry.category}</p>
                <p><strong>{entry.type}: R$ {Number(entry.value).toFixed(2)}</strong></p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
