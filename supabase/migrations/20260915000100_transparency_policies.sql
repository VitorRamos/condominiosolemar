-- The transparency portal is available to authenticated condominium users.
drop policy if exists "Admins can manage financial entries" on public.financial_entries;

create policy "Authenticated users can read financial entries"
on public.financial_entries for select
to authenticated
using (true);

create policy "Authenticated users can create financial entries"
on public.financial_entries for insert
to authenticated
with check (true);

create policy "Authenticated users can update financial entries"
on public.financial_entries for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete financial entries"
on public.financial_entries for delete
to authenticated
using (true);