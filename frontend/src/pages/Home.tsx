import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

const googleMapsPlaceUrl = 'https://www.google.com/maps/search/?api=1&query=Condom%C3%ADnio+Residencial+Sol+e+Mar%2C+Rua+Desembargador+Jos%C3%A9+Gomes+da+Costa%2C+1887%2C+Natal%2C+RN'
const googleMapsEmbedUrl = 'https://www.google.com/maps?q=Condom%C3%ADnio+Residencial+Sol+e+Mar%2C+Rua+Desembargador+Jos%C3%A9+Gomes+da+Costa%2C+1887%2C+Natal%2C+RN&output=embed'

export default function Home() {
  return (
    <div className="site-root">
      <Header />
      <main className="home-page">
        <section className="banner">
          <div className="container">
            <div className="banner-card">
              <span className="pill">Capim Macio · Natal/RN</span>
              <h1>Um condomínio no coração de Capim Macio</h1>
              <p>Um condomínio seguro e familiar, a poucos minutos da praia, para viver com tranquilidade, conforto e mais tempo para aproveitar Natal.</p>
              <div className="hero-actions"><a className="btn" href="#localizacao">Conheça a localização</a></div>
            </div>
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
            <div className="home-values-intro"><span className="section-label">Condomínio Sol e Mar</span><h2>Viver bem é aqui.</h2><p>Um endereço pensado para oferecer qualidade de vida, integração com a natureza e um ambiente seguro e acolhedor para toda a família.</p></div>
            <div className="home-value"><span>◌</span><strong>Segurança</strong><small>Tranquilidade para sua família</small></div>
            <div className="home-value"><span>≈</span><strong>Praia por perto</strong><small>Mais tempo para aproveitar Natal</small></div>
            <div className="home-value"><span>♧</span><strong>Comunidade</strong><small>Um ambiente familiar e acolhedor</small></div>
            <div className="home-value"><span>✧</span><strong>Praticidade</strong><small>Shopping, escolas e clínicas próximas</small></div>
          </div>
        </section>

        <section id="history" className="section">
          <div className="container section-card">
              <span className="section-label">Nossa história</span><h2>Um endereço para chamar de lar</h2>
            <p>
              O Condomínio Residencial Sol e Mar está localizado no bairro Capim Macio, em Natal, no Rio Grande do Norte.
              Um endereço residencial para famílias que valorizam segurança, sossego e praticidade. O condomínio fica perto da praia, do Shopping Seaway, do Parque Ecológico, de clínicas e escolas.
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
              <div className="gallery-card gallery-photo">
                <img src="/condominio-google-1.jpg" alt="Área externa do Condomínio Residencial Sol e Mar" />
                <span>Foto pública do condomínio</span>
              </div>
              <div className="gallery-card gallery-photo gallery-photo-secondary">
                <img src="/imagem1.webp" alt="Área interna do Condomínio Sol e Mar" />
                <span>Convivência e espaços internos</span>
              </div>
              <div className="gallery-card">Capim Macio, Natal/RN</div>
              <div className="gallery-card">Perto da praia e de serviços</div>
            </div>
            <p className="section-note">Imagens locais do condomínio e do entorno. A primeira foto foi obtida na ficha pública do Google Maps. <a className="source-link" href={googleMapsPlaceUrl} target="_blank" rel="noreferrer">Ver origem e mais fotos →</a></p>
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
            <div className="info-grid">
              <div className="card">
                <h3>Apartamento anunciado</h3>
                <p>Referência pública encontrada na região: apartamento de 72 m², com 3 quartos, 2 banheiros e 1 vaga.</p>
                <a className="source-link" href="https://www.google.com/search?q=%22Condom%C3%ADnio+Residencial+Sol+e+Mar%22+%2272m%C2%B2%22" target="_blank" rel="noreferrer">Consultar anúncio e disponibilidade →</a>
              </div>
              <div className="card">
                <h3>Localização</h3>
                <p>Capim Macio reúne praia, Shopping Seaway, Parque Ecológico, clínicas, escolas e serviços que deixam a vida mais prática.</p>
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
