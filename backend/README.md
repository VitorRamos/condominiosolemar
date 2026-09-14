# Supabase administration scripts

This directory no longer contains an application server. The frontend connects directly to Supabase from GitHub Pages.

The remaining scripts use `DIRECT_URL` from the local `.env` file. Keep that file private.

```bash
cd backend
npm install
npm run db:frontend
npm run db:security
npm run db:audit-rls
npm run db:promote-admin -- admin@solemar.local
```

As tabelas legadas do Prisma permanecem no banco por enquanto, mas estão com RLS
habilitado e sem acesso para `anon` ou `authenticated`. O frontend usa somente as
tabelas novas criadas em `supabase/migrations`.
