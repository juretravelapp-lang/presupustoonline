import { supabase } from './client'
import type { TravelQuoteRow, InsertQuote } from './types'

// =============================================
// Quotes / travel_quotes CRUD
// =============================================

export async function insertQuote(quote: InsertQuote) {
  const { data, error } = await supabase
    .from('travel_quotes')
    .insert(quote)
    .select()
    .single()

  if (error) throw error
  return data as TravelQuoteRow
}

export async function updateQuoteStatus(
  id: string,
  status: TravelQuoteRow['estado']
) {
  const { data, error } = await supabase
    .from('travel_quotes')
    .update({ estado: status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as TravelQuoteRow
}

export async function updateQuoteDetails(
  id: string,
  updates: Partial<TravelQuoteRow>
) {
  const { data, error } = await supabase
    .from('travel_quotes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as TravelQuoteRow
}

export async function deleteQuote(id: string) {
  const { error } = await supabase
    .from('travel_quotes')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export interface GetQuotesFilters {
  status?: string
  search?: string
  fecha_desde?: string
  fecha_hasta?: string
  operador?: string
  destino?: string
  limit?: number
  offset?: number
}

export async function getQuotes(filters?: GetQuotesFilters) {
  let query = supabase
    .from('travel_quotes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('estado', filters.status)
  }

  if (filters?.fecha_desde) {
    query = query.gte('created_at', filters.fecha_desde)
  }

  if (filters?.fecha_hasta) {
    // Add 1 day to include the whole end date
    const toDate = new Date(filters.fecha_hasta)
    toDate.setDate(toDate.getDate() + 1)
    query = query.lt('created_at', toDate.toISOString())
  }

  if (filters?.operador) {
    query = query.ilike('operador_nombre', `%${filters.operador}%`)
  }

  if (filters?.destino) {
    query = query.or(`destino.ilike.%${filters.destino}%,destino_personalizado.ilike.%${filters.destino}%`)
  }

  if (filters?.search) {
    query = query.or(
      `nombre.ilike.%${filters.search}%,apellido.ilike.%${filters.search}%,email.ilike.%${filters.search}%,dni.ilike.%${filters.search}%`
    )
  }

  if (filters?.limit) {
    const from = filters.offset || 0
    const to = from + filters.limit - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { data: data as TravelQuoteRow[], count }
}

export async function getQuoteById(id: string) {
  const { data, error } = await supabase
    .from('travel_quotes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as TravelQuoteRow
}

export async function markWhatsAppSent(id: string, message: string) {
  const { data, error } = await supabase
    .from('travel_quotes')
    .update({
      whatsapp_enviado: true,
      whatsapp_mensaje: message,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as TravelQuoteRow
}

export async function getDashboardStats() {
  // Direct count by current status names
  const counts = await Promise.all([
    supabase.from('travel_quotes').select('*', { count: 'exact', head: true }),
    supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'no_cotizado'),
    supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'en_cotizacion'),
    supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'cotizado'),
    supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'enviado_cliente'),
    supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'concretado'),
    supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'cancelado'),
  ])

  // Count today's pending meetings
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const { count: reunionesHoy } = await supabase
    .from('crm_meetings')
    .select('*', { count: 'exact', head: true })
    .gte('fecha_inicio', todayStart.toISOString())
    .lte('fecha_inicio', todayEnd.toISOString())
    .eq('estado', 'pendiente')

  return {
    total: counts[0].count || 0,
    no_cotizado: counts[1].count || 0,
    en_cotizacion: counts[2].count || 0,
    cotizados: counts[3].count || 0,
    enviado_cliente: counts[4].count || 0,
    concretados: counts[5].count || 0,
    cancelados: counts[6].count || 0,
    reuniones_hoy: reunionesHoy || 0,
  }
}

export async function getAdvancedAnalytics(dateRange?: { from: string; to: string }) {
  let query = supabase
    .from('travel_quotes')
    .select('id, destinos, mes_preferido, fecha_salida, estado, creador_email, operador_nombre, created_at, nombre, apellido, email, dni, celular')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (dateRange?.from) {
    query = query.gte('created_at', dateRange.from)
  }
  if (dateRange?.to) {
    query = query.lte('created_at', dateRange.to)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Partial<TravelQuoteRow>[]
}

// =============================================
// Cliente link del quote
// =============================================

export async function updateQuoteCliente(quoteId: string, clienteId: string) {
  const { error } = await supabase
    .from('travel_quotes')
    .update({ cliente_id: clienteId, updated_at: new Date().toISOString() })
    .eq('id', quoteId)

  if (error) throw error
  return true
}

/**
 * Crea o actualiza la ficha maestra del cliente a partir de los datos de una
 * consulta/presupuesto, buscando coincidencia por dni, email o celular.
 * Devuelve el id del cliente encontrado/creado (o null si no hay datos).
 */
export async function syncClienteFromQuote(person: {
  nombre: string
  apellido: string
  dni?: string | null
  email?: string | null
  celular?: string | null
}): Promise<string | null> {
  const matchers: string[] = []
  if (person.dni?.trim()) matchers.push(`dni.eq.${person.dni.trim()}`)
  if (person.email?.trim()) matchers.push(`email.eq.${person.email.trim()}`)
  if (person.celular?.trim()) matchers.push(`celular.eq.${person.celular.trim()}`)
  if (matchers.length === 0) return null

  const { data: existing, error } = await supabase
    .from('clientes')
    .select('id')
    .or(matchers.join(','))
    .limit(1)

  if (error) throw error

  const payload = {
    nombre: person.nombre,
    apellido: person.apellido || '',
    dni: person.dni?.trim() || null,
    email: person.email?.trim() || null,
    celular: person.celular?.trim() || null,
  }

  if (existing && existing.length > 0) {
    const { error: updateErr } = await supabase
      .from('clientes')
      .update(payload)
      .eq('id', existing[0].id)
    if (updateErr) throw updateErr
    return existing[0].id
  }

  const { data: created, error: createErr } = await supabase
    .from('clientes')
    .insert(payload)
    .select('id')
    .single()

  if (createErr) throw createErr
  return created?.id ?? null
}