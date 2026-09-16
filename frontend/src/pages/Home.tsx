import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../services/supabase'

type PropertyAd = {
  id: number
  type: 'Venda' | 'Aluguel'
  title: string
  location: string
  price: string
  description: string
  contact: string
  photos: string[]
}

const googleMapsPlaceUrl = 'https://www.google.com/maps/search/?api=1&query=Condom%C3%ADnio+Residencial+Sol+e+Mar%2C+Rua+Desembargador+Jos%C3%A9+Gomes+da+Costa%2C+1887%2C+Natal%2C+RN'
const googleMapsEmbedUrl = 'https://www.google.com/maps?q=Condom%C3%ADnio+Residencial+Sol+e+Mar%2C+Rua+Desembargador+Jos%C3%A9+Gomes+da+Costa%2C+1887%2C+Natal%2C+RN&output=embed'

export default function Home() {
  const [propertyAds, setPropertyAds] = useState<PropertyAd[]>([])
  const [propertyAdsLoading, setPropertyAdsLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('property_ads')
      .select('id, type, title, location, price, description, contact, photos')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPropertyAds((data as PropertyAd[]) || [])
        setPropertyAdsLoading(false)
      })
  }, [])

  return (
    <div className="site-root">
      <Header />
      <main className="home-page">
        <section className="banner">
          <div className="container">
            <div className="hero-visual">
              <img src="/imagem1.webp" alt="Área interna do Condomínio Sol e Mar" />
              <div className="hero-visual-caption">
                <strong>Capim Macio, Natal/RN</strong>
                <span>Um endereço familiar perto do mar</span>
              </div>
            </div>
          </div>
        </section>

        <section id="sobre" className="home-values-section">
          <div className="container home-values">
            <div className="home-values-intro"><span className="section-label">Condomínio Sol e Mar</span><h2>Qualidade de vida</h2><p>Um endereço pensado para oferecer qualidade de vida, integração com a natureza e um ambiente seguro e acolhedor para toda a família.</p></div>
            <div className="home-value"><span>◌</span><strong>Segurança</strong><small>Tranquilidade para sua família</small></div>
            <div className="home-value"><span>≈</span><strong>Praia por perto</strong><small>Mais tempo para aproveitar Natal</small></div>
            <div className="home-value"><span>☺</span><strong>Comunidade</strong><small>Um ambiente familiar e acolhedor</small></div>
            <div className="home-value"><span>✧</span><strong>Praticidade</strong><small>Shopping, escolas e clínicas próximas</small></div>
          </div>
        </section>

        <section id="history" className="section">
          <div className="container section-card">
              <span className="section-label">Nossa história</span><h2>Um endereço para chamar de lar</h2>
            <p>
              O Condomínio Residencial Sol e Mar está localizado no bairro Capim Macio, em Natal, no Rio Grande do Norte. Um endereço residencial para famílias que valorizam segurança, sossego e praticidade. O condomínio fica perto da Praia de Ponta Negra, do Shopping Seaway, do Parque Ecológico, de clínicas e escolas.
            </p>
            <div className="facts-grid">
              <div><strong>Endereço</strong><span>R. Des. José Gomes da Costa, 1887</span></div>
              <div><strong>Região</strong><span>Capim Macio · Natal/RN</span></div>
              <div><strong>Avaliação pública</strong><span>5,0 no Google · 8 avaliações</span></div>
            </div>
            <a className="source-link" href={googleMapsPlaceUrl} target="_blank" rel="noreferrer">Ver localização e fotos no Google Maps →</a>
          </div>
        </section>

        <section id="localizacao" className="section location-section">
          <div className="container location-grid">
            <div className="location-copy">
              <span className="section-label">Onde estamos</span>
              <h2>Localização no Google Maps</h2>
              <p>Encontre o Condomínio Sol e Mar na Rua Desembargador José Gomes da Costa, em Capim Macio, Natal/RN.</p>
              <a className="source-link" href={googleMapsPlaceUrl} target="_blank" rel="noreferrer">Abrir no Google Maps →</a>
            </div>
            <div className="map-frame">
              <iframe title="Localização do Condomínio Sol e Mar no Google Maps" src={googleMapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </section>

        <section id="imoveis" className="section">
          <div className="container">
            <h2>Imóveis em destaque</h2>
            <div className="property-list-grid">
              {propertyAds.map(ad => (
                <article className="property-ad-card" key={ad.id}>
                  {ad.photos[0] && <img src={ad.photos[0]} alt={`Foto de ${ad.title}`} />}
                  <div>
                    <span className="card-tag">{ad.type}</span>
                    <h3>{ad.title}</h3>
                    <p>{ad.location}</p>
                    <p>{ad.description}</p>
                    <strong>{ad.price}</strong>
                    <small>{ad.contact}</small>
                  </div>
                </article>
              ))}
              {!propertyAdsLoading && propertyAds.length === 0 && <div className="dashboard-empty"><strong>Nenhum imóvel anunciado no momento.</strong><span>Os anúncios publicados pelos moradores aparecerão aqui.</span></div>}
            </div>
          </div>
        </section>

        <section id="contacts" className="section">
          <div className="container contact-card">
            <div>
              <h2>Contato</h2>
              <p>Envie uma mensagem para saber mais sobre o Condomínio Sol e Mar.</p>
              <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
                <label htmlFor="contact-name">Nome</label>
                <input id="contact-name" name="name" type="text" placeholder="Seu nome" required />
                <label htmlFor="contact-email">E-mail</label>
                <input id="contact-email" name="email" type="email" placeholder="seuemail@exemplo.com" required />
                <label htmlFor="contact-message">Mensagem</label>
                <textarea id="contact-message" name="message" rows={4} placeholder="Como podemos ajudar?" required />
                <button type="submit">Enviar mensagem</button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
