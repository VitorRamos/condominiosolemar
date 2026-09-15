alter table public.property_ads
  add column if not exists contact text not null default '';

create or replace function public.enforce_property_ad_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.published and new.created_by is not null and (
    select count(*) from public.property_ads
    where created_by = new.created_by and published and id <> coalesce(new.id, 0)
  ) >= 4 then
    raise exception 'maximum of 4 active property ads per resident';
  end if;
  return new;
end;
$$;

create or replace function public.is_property_ad_owner_allowed()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select count(*) < 4
  from public.property_ads
  where created_by = auth.uid() and published;
$$;

drop trigger if exists property_ads_limit_trigger on public.property_ads;
create trigger property_ads_limit_trigger
before insert or update of published, created_by on public.property_ads
for each row execute function public.enforce_property_ad_limit();

create policy "Residents can create their own property ads"
on public.property_ads for insert
to authenticated
with check (created_by = auth.uid() and public.is_property_ad_owner_allowed());

create policy "Residents can update their own property ads"
on public.property_ads for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Residents can delete their own property ads"
on public.property_ads for delete
to authenticated
using (created_by = auth.uid());