# Supabase

A migration em `migrations/20260913000100_frontend_schema.sql` cria as tabelas usadas pelo frontend publicado no GitHub Pages e habilita RLS.

## Aplicar

No painel do Supabase:

1. Abra **SQL Editor**.
2. Crie uma nova query.
3. Cole o conteúdo da migration.
4. Execute a query.

A migration cria automaticamente um perfil quando um usuário é criado no Supabase Auth. O perfil começa com role `MORADOR`.

Para promover o primeiro administrador, execute no SQL Editor:

```sql
update public.profiles
set role = 'ADMIN'
where id = (select id from auth.users where email = 'seu-email@example.com');
```

As policies RLS permitem leitura pública apenas de anúncios publicados. Reclamações são privadas por usuário, e dados financeiros ficam restritos a administradores.
