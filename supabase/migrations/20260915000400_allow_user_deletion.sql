alter table public.financial_documents
  alter column uploaded_by drop not null;

alter table public.financial_documents
  drop constraint if exists financial_documents_uploaded_by_fkey;

alter table public.financial_documents
  add constraint financial_documents_uploaded_by_fkey
  foreign key (uploaded_by) references auth.users(id) on delete set null;