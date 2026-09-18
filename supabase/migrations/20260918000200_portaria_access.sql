create or replace function public.is_portaria_user()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'porteiros@solemar.com';
$$;

drop policy if exists "Admins can read package deliveries" on public.package_deliveries;
drop policy if exists "Portaria users can read package deliveries" on public.package_deliveries;
create policy "Portaria users can read package deliveries"
on public.package_deliveries for select
to authenticated
using (public.is_portaria_user());

drop policy if exists "Admins can create package deliveries" on public.package_deliveries;
drop policy if exists "Admins can update package deliveries" on public.package_deliveries;
drop policy if exists "Admins can delete package deliveries" on public.package_deliveries;
drop policy if exists "Portaria users can create package deliveries" on public.package_deliveries;
drop policy if exists "Portaria users can update package deliveries" on public.package_deliveries;
drop policy if exists "Portaria users can delete package deliveries" on public.package_deliveries;

create policy "Portaria users can create package deliveries"
on public.package_deliveries for insert
to authenticated
with check (public.is_portaria_user() and created_by = auth.uid());

create policy "Portaria users can update package deliveries"
on public.package_deliveries for update
to authenticated
using (public.is_portaria_user())
with check (public.is_portaria_user());

create policy "Portaria users can delete package deliveries"
on public.package_deliveries for delete
to authenticated
using (public.is_portaria_user());