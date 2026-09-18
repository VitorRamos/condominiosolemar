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