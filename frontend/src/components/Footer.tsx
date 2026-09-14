import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div>© {new Date().getFullYear()} Condomínio Sol e Mar</div>
        <div>Capim Macio · Natal/RN</div>
      </div>
    </footer>
  )
}
