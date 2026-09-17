alter table public.reclamacoes
  add column if not exists arquivado boolean not null default false;