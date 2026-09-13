# Supabase administration scripts

This directory no longer contains an application server. The frontend connects directly to Supabase from GitHub Pages.

The remaining scripts use `DIRECT_URL` from the local `.env` file. Keep that file private.

```bash
 npm install
 npm run db:frontend
 npm run db:promote-admin -- admin@solemar.local
```

```bash
cd backend
npm install
```

2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e ajuste `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` e `SMTP_*` para envio de e-mail.

O banco de produção usa PostgreSQL no Supabase. `DATABASE_URL` deve usar a conexão
pooler (Transaction pooler) e `DIRECT_URL` deve usar a conexão direta do Supabase.
As duas variáveis contêm a senha do banco e ficam somente no backend.

3. Gerar Prisma Client e aplicar migrações

```bash
npm run db:generate
npm run db:deploy
```

4. Rodar seed (cria Admin e Síndico)

```bash
npm run seed
```

5. Rodar em modo dev

```bash
npm run dev
```

Endpoints principais

- `GET /api/health` — status
- `POST /api/auth/register` — registrar usuário
- `POST /api/auth/login` — autenticar
- `GET /api/users` — listar usuários (ADMIN)
- `POST /api/reclamacoes` — criar reclamação (pública)

*** End Patch