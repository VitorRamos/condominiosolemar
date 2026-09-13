# Frontend — Condomínio Sol e Mar

Passos rápidos:

```bash
cd frontend
npm install
# opcional: crie .env com VITE_API_URL
npm run dev
```

A aplicação roda em `http://localhost:3000` por padrão (configurado em `vite.config.ts`).

## Publicar no GitHub Pages

Com o GitHub Pages configurado para publicar a raiz da branch `master`, execute:

```bash
npm run build:pages
```

Esse comando gera o build e copia os arquivos estáticos para a raiz do repositório. Depois, faça commit e push das alterações.

*** End Patch