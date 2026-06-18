import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Running in demo mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-key'
)

// =============================================
// Types for the travel_quotes table
// =============================================
export interface ProveedorPrecio {
  nombre: string
  hotel_costo: number
  vuelos_costo: number
  otros_costo: number
  markup_aplicado: number
  precio_final: number
}

export interface PricingDetalles {
  moneda: 'ARS' | 'USD'
  markup_tipo: 'porcentaje' | 'fijo'
  markup_valor: number
  proveedor_seleccionado: string | null
  proveedores: ProveedorPrecio[]
}

export interface HistorialEstado {
  estado: TravelQuoteRow['estado']
  fecha: string
  usuario: string
}

export interface TravelQuoteRow {
  id: string
  nombre: string
  apellido: string
  dni: string
  email: string
  celular: string
  ciudad_salida: string | null
  aeropuerto_salida: string | null
  destino: string | null
  destino_personalizado: string | null
  destinos: string[]
  tipo_fecha: 'exacta' | 'flexible' | 'mes'
  fecha_salida: string | null
  fecha_regreso: string | null
  rango_fecha_inicio: string | null
  rango_fecha_fin: string | null
  mes_preferido: string | null
  adultos: number
  ninos_2_12: number
  bebes_0_2: number
  preferencias: string[]
  comentarios: string | null
  tipo_viaje: string | null
  ip_address: string | null
  origen_consulta: string
  estado: 'no_cotizado' | 'en_cotizacion' | 'cotizado' | 'enviado_cliente' | 'concretado' | 'cancelado'
  whatsapp_enviado: boolean
  whatsapp_mensaje: string | null
  creador_email?: string | null
  operador_nombre?: string | null
  reunion_fecha?: string | null
  reunion_estado?: 'pendiente' | 'realizada' | 'cancelada' | null
  notas_crm?: string | null
  pricing_detalles?: PricingDetalles | null
  historial?: HistorialEstado[] | null
  dates?: {
    fechas_por_destino: Record<string, { fecha_salida: string; fecha_regreso: string }>
  } | null
  created_at: string
  updated_at: string
}

export type InsertQuote = Omit<TravelQuoteRow, 'id' | 'created_at' | 'updated_at'>


// =============================================
// CRUD Operations
// =============================================

export async function insertQuote(quote: InsertQuote) {
  const { data, error } = await supabase
    .from('travel_quotes')
    .insert(quote)

  if (error) throw error
  return data
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

export async function getQuotes(filters?: {
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('travel_quotes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('estado', filters.status)
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
// CRM Meetings CRUD
// =============================================

export interface CrmMeeting {
  id: string
  quote_id: string
  titulo: string
  fecha_inicio: string
  fecha_fin: string | null
  estado: 'pendiente' | 'realizada' | 'cancelada' | 'reprogramada'
  tipo: 'presencial' | 'videollamada' | 'telefonica'
  notas: string | null
  creado_por: string | null
  created_at: string
  updated_at: string
  // Joined fields from travel_quotes (when fetching with join)
  travel_quotes?: {
    nombre: string
    apellido: string
    email: string
    celular: string
    destino: string | null
    destino_personalizado: string | null
    destinos: string[]
    estado: TravelQuoteRow['estado']
  }
}

export type InsertMeeting = Omit<CrmMeeting, 'id' | 'created_at' | 'updated_at' | 'travel_quotes'>

export async function getMeetingsByDateRange(from: string, to: string) {
  const { data, error } = await supabase
    .from('crm_meetings')
    .select(`
      *,
      travel_quotes ( nombre, apellido, email, celular, destino, destino_personalizado, destinos, estado )
    `)
    .gte('fecha_inicio', from)
    .lte('fecha_inicio', to)
    .order('fecha_inicio', { ascending: true })

  if (error) throw error
  return data as CrmMeeting[]
}

export async function getMeetingsForQuote(quoteId: string) {
  const { data, error } = await supabase
    .from('crm_meetings')
    .select('*')
    .eq('quote_id', quoteId)
    .order('fecha_inicio', { ascending: true })

  if (error) throw error
  return data as CrmMeeting[]
}

export async function createMeeting(meeting: InsertMeeting) {
  const { data, error } = await supabase
    .from('crm_meetings')
    .insert(meeting)
    .select()
    .single()

  if (error) throw error
  return data as CrmMeeting
}

export async function updateMeeting(id: string, updates: Partial<CrmMeeting>) {
  const { data, error } = await supabase
    .from('crm_meetings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as CrmMeeting
}

export async function deleteMeeting(id: string) {
  const { error } = await supabase
    .from('crm_meetings')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function getNextMeetingForQuotes(quoteIds: string[]) {
  if (quoteIds.length === 0) return []
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('crm_meetings')
    .select('*')
    .in('quote_id', quoteIds)
    .gte('fecha_inicio', now)
    .eq('estado', 'pendiente')
    .order('fecha_inicio', { ascending: true })

  if (error) throw error
  return data as CrmMeeting[]
}
