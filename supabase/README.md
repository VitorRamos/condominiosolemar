# Supabase

A migration em `migrations/20260913000100_frontend_schema.sql` cria as tabelas usadas pelo frontend publicado no GitHub Pages e habilita RLS.

## Aplicar

No painel do Supabase:

1. Abra **SQL Editor**.
2. Crie uma nova query.
3. Cole o conteúdo da migration.
4. Execute a query.

A migration cria automaticamente um perfil quando um usuário é criado no Supabase Auth. O perfil começa com role `MORADOR` e `approved = false`. Moradores já existentes são aprovados pela migration de segurança.

Desative o cadastro público no painel: **Authentication → Providers → Email → Disable sign ups**. Convide usuários pelo dashboard e aprove o perfil:

```sql
update public.profiles
set approved = true
where id = (select id from auth.users where email = 'morador@example.com');
```

Para promover o primeiro administrador, execute no SQL Editor:

```sql
update public.profiles
set role = 'ADMIN', approved = true
where id = (select id from auth.users where email = 'seu-email@example.com');
```

Para a portaria, use um usuário por porteiro com role `PORTARIA`:

```sql
update public.profiles
set role = 'PORTARIA', approved = true
where id = (select id from auth.users where email = 'porteiro@example.com');
```

Anúncios publicados continuam públicos. Reclamações continuam abertas a moradores aprovados, com limite de 4.000 caracteres na descrição. O formulário de contato da home continua público, com limite de 2.000 caracteres. Os PDFs da prestação de contas ficam só para ADMIN/SÍNDICO; o portal da transparência continua mostrando os lançamentos aos moradores aprovados.
