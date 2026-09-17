alter table public.reclamacoes
  add column if not exists responder_para text;

alter table public.reclamacoes
  add column if not exists responder_contato text;

alter table public.reclamacoes
  drop constraint if exists reclamacoes_responder_para_check;

alter table public.reclamacoes
  add constraint reclamacoes_responder_para_check
  check (responder_para in ('WhatsApp', 'E-mail'));