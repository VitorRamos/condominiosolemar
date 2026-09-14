-- Legacy Prisma tables are no longer used by the frontend.
-- RLS without public policies denies access through the Supabase API.
alter table if exists public."User" enable row level security;
alter table if exists public."Morador" enable row level security;
alter table if exists public."Apartment" enable row level security;
alter table if exists public."Imovel" enable row level security;
alter table if exists public."Foto" enable row level security;
alter table if exists public."Reclamacao" enable row level security;
alter table if exists public."CategoriaFinanceira" enable row level security;
alter table if exists public."Lancamento" enable row level security;
alter table if exists public."Anexo" enable row level security;
alter table if exists public."FundoReserva" enable row level security;
alter table if exists public."Log" enable row level security;
alter table if exists public._prisma_migrations enable row level security;

revoke all on table
  public."User",
  public."Morador",
  public."Apartment",
  public."Imovel",
  public."Foto",
  public."Reclamacao",
  public."CategoriaFinanceira",
  public."Lancamento",
  public."Anexo",
  public."FundoReserva",
  public."Log",
  public._prisma_migrations
from anon, authenticated;
