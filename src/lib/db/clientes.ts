import { supabase } from './client'
import type { Cliente, InsertCliente, ClienteRelacion, ClienteTipoRelacion, ClienteViaje } from './types'

// =============================================
// Clientes CRUD (clientes + clientes_relaciones)
// =============================================

export async function getClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Cliente[]
}

export async function crearCliente(data: InsertCliente) {
  const { data: row, error } = await supabase
    .from('clientes')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return row as Cliente
}

export async function updateCliente(id: string, updates: Partial<InsertCliente>) {
  const { data: row, error } = await supabase
    .from('clientes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return row as Cliente
}

export async function deleteCliente(id: string) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function getRelacionesCliente(clienteId: string) {
  const { data, error } = await supabase
    .from('clientes_relaciones')
    .select(`
      *,
      cliente:clientes!clientes_relaciones_cliente_id_fkey (*),
      relacionado:clientes!clientes_relaciones_relacionado_id_fkey (*)
    `)
    .or(`cliente_id.eq.${clienteId},relacionado_id.eq.${clienteId}`)

  if (error) throw error
  return (data as (ClienteRelacion & { cliente?: Cliente })[]).map((r) => {
    const other = r.cliente_id === clienteId ? r.relacionado : r.cliente
    return { ...r, relacionado: other }
  })
}

export async function addRelacion(
  clienteId: string,
  relacionadoId: string,
  tipo: ClienteTipoRelacion,
  nota?: string
) {
  const { data, error } = await supabase
    .from('clientes_relaciones')
    .insert({
      cliente_id: clienteId,
      relacionado_id: relacionadoId,
      tipo,
      nota: nota || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as ClienteRelacion
}

export async function removeRelacion(relacionId: string) {
  const { error } = await supabase
    .from('clientes_relaciones')
    .delete()
    .eq('id', relacionId)

  if (error) throw error
  return true
}

export async function getClientesViajes(clienteId: string) {
  const { data, error } = await supabase.rpc('get_cliente_viajes', {
    p_cliente_id: clienteId,
  })

  if (error) throw error
  return data as ClienteViaje[]
}

// ── Backfill / sync de clientes desde presupuestos existentes ────────

function normalizeKey(v: string | null | undefined): string {
  if (!v) return ''
  return v.toLowerCase().trim()
}

function normalizeDni(v: string | null | undefined): string {
  if (!v) return ''
  return v.replace(/[^0-9]/g, '')
}

function normalizeCelular(v: string | null | undefined): string {
  if (!v) return ''
  let d = v.replace(/[^0-9]/g, '')
  if (d.length >= 12 && d.startsWith('54')) d = d.slice(2)
  if (d.length === 11 && d.startsWith('9')) d = d.slice(1)
  return d
}

/**
 * Crea/actualiza fichas de clientes a partir de todos los presupuestos que
 * aún no tienen cliente_id (match normalizado por dni/email/celular).
 * Devuelve cuántos clientes se crearon y cuántos presupuestos se vincularon.
 */
export async function syncClientesFromQuotes(): Promise<{ creados: number; vinculados: number }> {
  const { data: quotes, error } = await supabase
    .from('travel_quotes')
    .select('id, ticket_id, nombre, apellido, dni, email, celular')
    .is('cliente_id', null)
    .limit(500)

  if (error) throw error

  const { data: allClientes, error: errClientes } = await supabase
    .from('clientes')
    .select('id, dni, email, celular')

  if (errClientes) throw errClientes

  const clientes: { id: string; dni: string | null; email: string | null; celular: string | null }[] =
    allClientes as never[]

  let creados = 0
  let vinculados = 0

  for (const q of quotes as {
    id: string
    ticket_id: string | null
    nombre: string
    apellido: string | null
    dni: string | null
    email: string | null
    celular: string | null
  }[]) {
    const qDni = normalizeDni(q.dni)
    const qEmail = normalizeKey(q.email)
    const qCel = normalizeCelular(q.celular)
    if (!qDni && !qEmail && !qCel) continue

    let match = clientes.find(
      (c) =>
        (qDni && normalizeDni(c.dni) === qDni) ||
        (qEmail && normalizeKey(c.email) === qEmail) ||
        (qCel && normalizeCelular(c.celular) === qCel)
    )

    if (!match) {
      const { data: created, error: cerr } = await supabase
        .from('clientes')
        .insert({
          nombre: q.nombre,
          apellido: q.apellido || '',
          dni: q.dni || null,
          email: q.email || null,
          celular: q.celular || null,
          notas: `Creado automáticamente desde el presupuesto ${q.ticket_id || q.id.slice(0, 8)}`,
        })
        .select('id, dni, email, celular')
        .single()

      if (cerr) continue
      match = created as { id: string; dni: string | null; email: string | null; celular: string | null }
      clientes.push(match)
      creados++
    }

    // Enriquecer campos faltantes del cliente con los del presupuesto
    const enriquece = {
      dni: normalizeDni(match.dni) ? match.dni : q.dni,
      email: normalizeKey(match.email) ? match.email : q.email,
      celular: normalizeCelular(match.celular) ? match.celular : q.celular,
    }
    const hayMejora =
      (enriquece.dni && !normalizeDni(match.dni)) ||
      (enriquece.email && !normalizeKey(match.email)) ||
      (enriquece.celular && !normalizeCelular(match.celular))
    if (hayMejora) {
      await supabase
        .from('clientes')
        .update({ dni: enriquece.dni || null, email: enriquece.email || null, celular: enriquece.celular || null })
        .eq('id', match.id)
      match.dni = enriquece.dni || null
      match.email = enriquece.email || null
      match.celular = enriquece.celular || null
    }

    const { error: lerr } = await supabase
      .from('travel_quotes')
      .update({ cliente_id: match.id, updated_at: new Date().toISOString() })
      .eq('id', q.id)

    if (!lerr) vinculados++
  }

  return { creados, vinculados }
}