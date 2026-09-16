alter table public.reclamacoes
  add column if not exists bloco text;

alter table public.reclamacoes
  drop constraint if exists reclamacoes_bloco_check;

alter table public.reclamacoes
  add constraint reclamacoes_bloco_check
  check (bloco in ('Bloco A', 'Bloco B'));

update public.reclamacoes
set bloco = 'Bloco A'
where bloco is null;

alter table public.reclamacoes
  alter column bloco set not null;
