import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const migrations = [
  '001_create_tables.sql',
  '002_fix_rls.sql',
  '003_update_schema.sql',
]

// Try direct DB connection via service_role key + exec_sql RPC
if (supabaseUrl && serviceRoleKey) {
  console.log('▶  Intentando migrar via service_role key...')
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  for (const file of migrations) {
    const filePath = join(__dirname, '..', 'supabase', 'migrations', file)
    let sql
    try {
      sql = readFileSync(filePath, 'utf-8')
    } catch {
      console.log(`  ⚠  ${file} no encontrado, saltando...`)
      continue
    }

    // Try via rpc exec_sql
    const { error } = await supabase.rpc('exec_sql', { query: sql }).maybeSingle()
    if (!error) {
      console.log(`  ✓ ${file} ejecutado via RPC`)
      continue
    }

    // Try via rpc with different param name
    const { error: error2 } = await supabase.rpc('exec_sql', { sql }).maybeSingle()
    if (!error2) {
      console.log(`  ✓ ${file} ejecutado via RPC`)
      continue
    }

    // Try via raw SQL endpoint with service_role
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Prefer': 'params=single-object',
        },
        body: JSON.stringify({ query: sql }),
      })
      if (res.ok || res.status === 200) {
        console.log(`  ✓ ${file} ejecutado via REST`)
        continue
      }
    } catch {}

    console.log(`  ✗ No se pudo ejecutar ${file} automáticamente`)
    console.log(`    -> Copiá el contenido en Supabase Dashboard > SQL Editor`)
    console.log(`    -> Archivo: supabase/migrations/${file}`)
    process.exit(1)
  }

  console.log('\n✓ Migraciones completadas')
} else {
  console.log('⚠  SUPABASE_SERVICE_ROLE_KEY no configurada.')
  console.log('\nPara migrar manualmente:')
  console.log('  1. Andá a https://supabase.com/dashboard')
  console.log('  2. Abrí tu proyecto')
  console.log('  3. SQL Editor > New Query')
  console.log('  4. Pegá y ejecutá el contenido de cada archivo en supabase/migrations/:')
  for (const file of migrations) {
    console.log(`     - supabase/migrations/${file}`)
  }
  console.log('\nO configurá SUPABASE_SERVICE_ROLE_KEY como variable de entorno y volvé a ejecutar este script.')
  process.exit(1)
}
