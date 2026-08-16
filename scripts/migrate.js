import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const { Client } = pg

const __dirname = dirname(fileURLToPath(import.meta.url))

const migrations = [
  '001_create_tables.sql',
  '002_fix_rls.sql',
  '003_seed_data.sql',
  '003_update_schema.sql',
  '004_crm_extensions.sql',
  '005_crm_meetings.sql',
  '006_add_ticket_id.sql',
  '007_ttoo_services.sql',
  '008_security_and_state_consistency.sql',
  '009_destinos_catalog.sql',
  '010_message_templates.sql',
  '011_clientes.sql',
  '012_backfill_clientes.sql',
  '013_quote_detalle_pagos.sql',
  '014_quote_services.sql',
  '015_roles_rls_hardening.sql',
]

async function run() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL

  if (!databaseUrl) {
    console.log('⚠  No se encontró DATABASE_URL (ni SUPABASE_DATABASE_URL).')
    console.log('')
    console.log('Para migrar por terminal:')
    console.log('  1. Entrá a https://supabase.com/dashboard → tu proyecto')
    console.log('  2. Project Settings > Database > Connection string (modo "Direct connection")')
    console.log('  3. Copiá la URL tipo: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres')
    console.log('  4. Guardala en .env.local como:  DATABASE_URL="postgresql://..."')
    console.log('  5. Volvé a ejecutar:  npm run migrate')
    console.log('')
    console.log('Alternativa manual (sin terminal):')
    console.log('  Supabase Dashboard > SQL Editor > New Query → pegá el contenido de cada archivo en supabase/migrations/')
    for (const file of migrations) {
      console.log(`     - supabase/migrations/${file}`)
    }
    process.exit(1)
  }

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `)
  } catch (err) {
    console.error(`✗ No se pudo inicializar la tabla de control: ${err.message}`)
    process.exit(1)
  }

  console.log('▶  Aplicando migraciones...')

  for (const file of migrations) {
    const filePath = join(__dirname, '..', 'supabase', 'migrations', file)
    let sql
    try {
      sql = readFileSync(filePath, 'utf-8')
    } catch {
      console.log(`  ⚠  ${file} no encontrado, saltando...`)
      continue
    }

    const already = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file])
    if (already.rowCount > 0) {
      console.log(`  · ${file} ya aplicada, omitida`)
      continue
    }

    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`  ✓ ${file}`)
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`  ✗ ${file} falló: ${err.message}`)
      console.error('    -> Revisá el error y volvé a correr el script (las anteriores no se repiten).')
      process.exit(1)
    }
  }

  console.log('\n✓ Migraciones completadas')
  await client.end()
}

run().catch((err) => {
  console.error('Error inesperado:', err.message)
  process.exit(1)
})