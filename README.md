# Condomínio Sol e Mar

Frontend React + Vite publicado no GitHub Pages e conectado diretamente ao Supabase.

O diretório `backend` agora contém somente scripts administrativos do Supabase; não há servidor para executar.

## Resumo dos comandos

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Publicar no GitHub Pages:

```bash
cd frontend
npm run build:pages
```

O deploy automático usa `.github/workflows/deploy-pages.yml` e publica `frontend/dist`.
No GitHub, configure `Settings > Pages > Source` como `GitHub Actions` e crie a variável
de repositório `VITE_SUPABASE_PUBLISHABLE_KEY` em `Settings > Secrets and variables > Actions > Variables`.

Scripts Supabase:

```bash
cd backend
npm install
npm run db:frontend
npm run db:promote-admin -- admin@solemar.local
```

