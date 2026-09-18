const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config()

const migrationsDirectory = path.resolve(__dirname, '..', '..', 'supabase', 'migrations')
const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  if (!process.env.DIRECT_URL) throw new Error('DIRECT_URL is not configured')

  await client.connect()
  const result = await client.query('select to_regclass($1) as table_name', ['public.profiles'])

  if (!result.rows[0].table_name) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260913000100_frontend_schema.sql'), 'utf8'))
    console.log('Supabase frontend migration applied')
  } else {
    console.log('Supabase frontend migration already applied')
  }

  const transparencyPolicyResult = await client.query(`
    select exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'financial_entries'
        and policyname = 'Authenticated users can read financial entries'
    ) as applied
  `)
  if (!transparencyPolicyResult.rows[0].applied) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260915000100_transparency_policies.sql'), 'utf8'))
    console.log('Supabase transparency policies applied')
  }

  const documentsResult = await client.query('select to_regclass($1) as table_name', ['public.financial_documents'])
  if (!documentsResult.rows[0].table_name) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260915000200_financial_documents.sql'), 'utf8'))
    console.log('Supabase financial documents migration applied')
  } else {
    console.log('Supabase financial documents migration already applied')
  }

  const propertyPolicyResult = await client.query(`
    select exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'property_ads'
        and policyname = 'Residents can create their own property ads'
    ) as applied
  `)
  if (!propertyPolicyResult.rows[0].applied) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260915000300_property_ads_resident_management.sql'), 'utf8'))
    console.log('Supabase resident property ads migration applied')
  } else {
    console.log('Supabase resident property ads migration already applied')
  }

  const userDeletionResult = await client.query(`
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'financial_documents'
        and column_name = 'uploaded_by'
        and is_nullable = 'YES'
    ) as applied
  `)
  if (!userDeletionResult.rows[0].applied) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260915000400_allow_user_deletion.sql'), 'utf8'))
    console.log('Supabase user deletion migration applied')
  } else {
    console.log('Supabase user deletion migration already applied')
  }

  const complaintBlockResult = await client.query(`
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'reclamacoes'
        and column_name = 'bloco'
    ) as applied
  `)
  if (!complaintBlockResult.rows[0].applied) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260916000100_add_bloco_to_reclamacoes.sql'), 'utf8'))
    console.log('Supabase complaint block migration applied')
  } else {
    console.log('Supabase complaint block migration already applied')
  }

  const complaintArchiveResult = await client.query(`
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'reclamacoes'
        and column_name = 'arquivado'
    ) as applied
  `)
  if (!complaintArchiveResult.rows[0].applied) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260917000100_add_archived_to_reclamacoes.sql'), 'utf8'))
    console.log('Supabase complaint archive migration applied')
  } else {
    console.log('Supabase complaint archive migration already applied')
  }

  const complaintReplyResult = await client.query(`
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'reclamacoes'
        and column_name = 'responder_contato'
    ) as applied
  `)
  if (!complaintReplyResult.rows[0].applied) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260917000200_add_reply_contact_to_reclamacoes.sql'), 'utf8'))
    console.log('Supabase complaint reply contact migration applied')
  } else {
    console.log('Supabase complaint reply contact migration already applied')
  }

  const contactMessagesResult = await client.query('select to_regclass($1) as table_name', ['public.contact_messages'])
  if (!contactMessagesResult.rows[0].table_name) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260917000300_contact_messages.sql'), 'utf8'))
    console.log('Supabase contact messages migration applied')
  } else {
    console.log('Supabase contact messages migration already applied')
  }

  const packageDeliveriesResult = await client.query('select to_regclass($1) as table_name', ['public.package_deliveries'])
  if (!packageDeliveriesResult.rows[0].table_name) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260918000100_package_deliveries.sql'), 'utf8'))
    console.log('Supabase package deliveries migration applied')
  } else {
    console.log('Supabase package deliveries migration already applied')
  }

  const deliveryReceivedByResult = await client.query(`
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'package_deliveries'
        and column_name = 'received_by'
    ) as applied
  `)
  if (!deliveryReceivedByResult.rows[0].applied) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260918000300_delivery_received_by.sql'), 'utf8'))
    console.log('Supabase delivery received-by migration applied')
  } else {
    console.log('Supabase delivery received-by migration already applied')
  }

  const deliveryCarrierResult = await client.query(`
    select is_nullable = 'YES' as applied
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'package_deliveries'
      and column_name = 'carrier'
  `)
  if (!deliveryCarrierResult.rows[0]?.applied) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260918000400_optional_delivery_carrier.sql'), 'utf8'))
    console.log('Supabase optional delivery carrier migration applied')
  } else {
    console.log('Supabase optional delivery carrier migration already applied')
  }

  await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260918000200_portaria_access.sql'), 'utf8'))
  console.log('Supabase portaria access policy applied')

  await client.query(`
    insert into public.profiles (id, name)
    select id, coalesce(raw_user_meta_data ->> 'name', email)
    from auth.users
    on conflict (id) do nothing
  `)
  console.log('Existing Auth users synchronized with profiles')
}

main()
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => client.end())
