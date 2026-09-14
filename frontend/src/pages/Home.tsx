import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const googleMapsPlaceUrl = 'https://www.google.com/maps/search/?api=1&query=Condom%C3%ADnio+Residencial+Sol+e+Mar%2C+Rua+Desembargador+Jos%C3%A9+Gomes+da+Costa%2C+1887%2C+Natal%2C+RN'

export default function Home() {
  return (
    <div className="site-root">
      <Header />
      <main>
        <section className="banner">
          <div className="container">
            <div className="banner-card">
              <span className="pill">Natal, Rio Grande do Norte</span>
              <h1>Condomínio Sol e Mar</h1>
              <p>Informações públicas, localização e referências do Condomínio Residencial Sol e Mar em Natal/RN.</p>
              <a className="btn" href="#imoveis">Ver imóveis</a>
            </div>
            <div className="hero-visual">
              <img src="https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200" alt="Paisagem litorânea de contexto do Rio Grande do Norte" />
              <div className="hero-visual-caption">
                <strong>Capim Macio, Natal/RN</strong>
                <span>Um endereço residencial na capital potiguar</span>
              </div>
            </div>
          </div>
        </section>

        <section id="history" className="section">
          <div className="container section-card">
            <h2>História</h2>
            <p>
              O Condomínio Residencial Sol e Mar está localizado no bairro Capim Macio, em Natal, no Rio Grande do Norte.
              A página reúne informações públicas do empreendimento e referências para moradores, visitantes e interessados em imóveis na região.
            </p>
            <div className="facts-grid">
              <div><strong>Endereço</strong><span>R. Des. José Gomes da Costa, 1887</span></div>
              <div><strong>Região</strong><span>Capim Macio · Natal/RN</span></div>
              <div><strong>Avaliação pública</strong><span>5,0 no Google · 8 avaliações</span></div>
            </div>
            <a className="source-link" href={googleMapsPlaceUrl} target="_blank" rel="noreferrer">Ver localização e fotos no Google Maps →</a>
          </div>
        </section>

        <section id="gallery" className="section">
          <div className="container">
            <h2>Galeria</h2>
            <div className="gallery-grid">
              <a className="gallery-card gallery-photo" href={googleMapsPlaceUrl} target="_blank" rel="noreferrer">
                <img src="https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?auto=format&fit=crop&w=900&q=85" alt="Paisagem urbana de Natal, Rio Grande do Norte" />
                <span>Ver fotos públicas do condomínio</span>
              </a>
              <div className="gallery-card">Capim Macio, Natal/RN</div>
              <div className="gallery-card">Endereço confirmado no mapa</div>
              <div className="gallery-card">Informações públicas do empreendimento</div>
            </div>
            <p className="section-note">As imagens de contexto mostram Natal/RN. As fotos específicas do condomínio estão disponíveis no Google Maps.</p>
          </div>
        </section>

        <section id="imoveis" className="section">
          <div className="container">
            <h2>Imóveis em destaque</h2>
            <div className="info-grid">
              <div className="card">
                <h3>Apartamento anunciado</h3>
                <p>Referência pública encontrada na região: apartamento de 72 m², com 3 quartos, 2 banheiros e 1 vaga.</p>
                <a className="source-link" href="https://www.google.com/search?q=%22Condom%C3%ADnio+Residencial+Sol+e+Mar%22+%2272m%C2%B2%22" target="_blank" rel="noreferrer">Consultar anúncio e disponibilidade →</a>
              </div>
              <div className="card">
                <h3>Localização</h3>
                <p>Capim Macio é uma região residencial de Natal, com acesso a serviços, comércio e vias importantes da cidade.</p>
                <a className="source-link" href={googleMapsPlaceUrl} target="_blank" rel="noreferrer">Abrir no mapa →</a>
              </div>
            </div>
          </div>
        </section>

        <section id="contacts" className="section">
          <div className="container contact-card">
            <div>
              <h2>Contato</h2>
                <p>Consulte localização, fotos e avaliações no Google Maps.</p>
                <a className="source-link" href={googleMapsPlaceUrl} target="_blank" rel="noreferrer">Abrir página pública →</a>
            </div>
            <div>
              <h2>Informações</h2>
                <p>R. Des. José Gomes da Costa, 1887</p>
                <p>Capim Macio · Natal/RN · 59082-140</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
