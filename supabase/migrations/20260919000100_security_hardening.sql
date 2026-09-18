-- Existing residents stay approved. New Auth signups get approved = false.
alter table public.profiles
  add column if not exists approved boolean not null default false;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('ADMIN', 'SINDICO', 'MORADOR', 'VISUALIZADOR', 'PORTARIA'));

update public.profiles as profile
set approved = true
from auth.users as auth_user
where auth_user.id = profile.id
  and coalesce(auth_user.email, '') not like 'solemar.probe.%';

update public.profiles
set role = 'PORTARIA', approved = true
where id in (
  select id from auth.users where lower(email) = 'porteiros@solemar.com'
);

create or replace function public.is_approved_resident()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and approved
  );
$$;

create or replace function public.is_portaria_user()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'PORTARIA'
  );
$$;

create or replace function public.is_delivery_staff()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select public.is_admin() or public.is_portaria_user();
$$;

drop policy if exists "Authenticated users can read financial entries" on public.financial_entries;
drop policy if exists "Approved users can read financial entries" on public.financial_entries;
create policy "Approved users can read financial entries"
on public.financial_entries for select
to authenticated
using (public.is_approved_resident() or public.is_finance_manager());

drop policy if exists "Authenticated users can read financial documents" on public.financial_documents;
drop policy if exists "Finance managers can read financial documents" on public.financial_documents;
create policy "Finance managers can read financial documents"
on public.financial_documents for select
to authenticated
using (public.is_finance_manager());

drop policy if exists "Authenticated users can read financial documents files" on storage.objects;
drop policy if exists "Finance managers can read financial documents files" on storage.objects;
create policy "Finance managers can read financial documents files"
on storage.objects for select
to authenticated
using (bucket_id = 'financial-documents' and public.is_finance_manager());

drop policy if exists "Users can create their own complaints" on public.reclamacoes;
drop policy if exists "Approved users can create their own complaints" on public.reclamacoes;
create policy "Approved users can create their own complaints"
on public.reclamacoes for insert
to authenticated
with check (user_id = auth.uid() and public.is_approved_resident());

drop policy if exists "Users can read their own complaints" on public.reclamacoes;
drop policy if exists "Approved users can read their own complaints" on public.reclamacoes;
create policy "Approved users can read their own complaints"
on public.reclamacoes for select
to authenticated
using ((user_id = auth.uid() and public.is_approved_resident()) or public.is_admin());

alter table public.reclamacoes drop constraint if exists reclamacoes_nome_length;
alter table public.reclamacoes drop constraint if exists reclamacoes_descricao_length;
alter table public.reclamacoes drop constraint if exists reclamacoes_assunto_length;
alter table public.reclamacoes drop constraint if exists reclamacoes_responder_contato_length;
alter table public.reclamacoes
  add constraint reclamacoes_nome_length check (char_length(nome) between 1 and 120);
alter table public.reclamacoes
  add constraint reclamacoes_assunto_length check (char_length(assunto) between 1 and 80);
alter table public.reclamacoes
  add constraint reclamacoes_descricao_length check (char_length(descricao) between 1 and 4000);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reclamacoes' and column_name = 'responder_contato'
  ) then
    alter table public.reclamacoes drop constraint if exists reclamacoes_responder_contato_length;
    alter table public.reclamacoes
      add constraint reclamacoes_responder_contato_length
      check (responder_contato is null or char_length(responder_contato) <= 80);
  end if;
end $$;

alter table public.contact_messages drop constraint if exists contact_messages_nome_length;
alter table public.contact_messages drop constraint if exists contact_messages_email_length;
alter table public.contact_messages drop constraint if exists contact_messages_mensagem_length;
alter table public.contact_messages
  add constraint contact_messages_nome_length check (char_length(nome) between 1 and 120);
alter table public.contact_messages
  add constraint contact_messages_email_length check (char_length(email) between 3 and 254);
alter table public.contact_messages
  add constraint contact_messages_mensagem_length check (char_length(mensagem) between 1 and 2000);

drop policy if exists "Anyone can send contact messages" on public.contact_messages;
create policy "Anyone can send contact messages"
on public.contact_messages for insert
to anon, authenticated
with check (
  char_length(nome) between 1 and 120
  and char_length(email) between 3 and 254
  and char_length(mensagem) between 1 and 2000
);

drop policy if exists "Portaria users can read package deliveries" on public.package_deliveries;
drop policy if exists "Portaria users can create package deliveries" on public.package_deliveries;
drop policy if exists "Portaria users can update package deliveries" on public.package_deliveries;
drop policy if exists "Portaria users can delete package deliveries" on public.package_deliveries;
drop policy if exists "Admins can read package deliveries" on public.package_deliveries;
drop policy if exists "Admins can create package deliveries" on public.package_deliveries;
drop policy if exists "Admins can update package deliveries" on public.package_deliveries;
drop policy if exists "Admins can delete package deliveries" on public.package_deliveries;
drop policy if exists "Staff can read package deliveries" on public.package_deliveries;
drop policy if exists "Staff can create package deliveries" on public.package_deliveries;
drop policy if exists "Staff can update package deliveries" on public.package_deliveries;
drop policy if exists "Staff can delete package deliveries" on public.package_deliveries;

create policy "Staff can read package deliveries"
on public.package_deliveries for select
to authenticated
using (public.is_delivery_staff());

create policy "Staff can create package deliveries"
on public.package_deliveries for insert
to authenticated
with check (public.is_delivery_staff() and created_by = auth.uid());

create policy "Staff can update package deliveries"
on public.package_deliveries for update
to authenticated
using (public.is_delivery_staff())
with check (public.is_delivery_staff());

create policy "Staff can delete package deliveries"
on public.package_deliveries for delete
to authenticated
using (public.is_delivery_staff());

create or replace function public.enforce_property_ad_photos()
returns trigger
language plpgsql
as $$
declare
  photo text;
begin
  if cardinality(coalesce(new.photos, '{}')) > 8 then
    raise exception 'maximum of 8 photos per property ad';
  end if;

  foreach photo in array coalesce(new.photos, '{}') loop
    if photo is null or photo not like 'data:image/%' then
      raise exception 'property photos must be compressed image data URLs';
    end if;
    if char_length(photo) > 400000 then
      raise exception 'property photo exceeds the maximum size';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists property_ads_photos_trigger on public.property_ads;
create trigger property_ads_photos_trigger
before insert or update of photos on public.property_ads
for each row execute function public.enforce_property_ad_photos();
