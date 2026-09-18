alter table public.package_deliveries
  add column if not exists received_by text not null default 'Não informado';