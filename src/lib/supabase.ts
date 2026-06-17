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
  estado: 'nuevo' | 'contactado' | 'cotizado' | 'reservado' | 'cancelado'
  whatsapp_enviado: boolean
  whatsapp_mensaje: string | null
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
  const { data, error } = await supabase.rpc('get_dashboard_stats')

  if (error) {
    // Fallback: manual count
    const counts = await Promise.all([
      supabase.from('travel_quotes').select('*', { count: 'exact', head: true }),
      supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'nuevo'),
      supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'contactado'),
      supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'cotizado'),
      supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'reservado'),
      supabase.from('travel_quotes').select('*', { count: 'exact', head: true }).eq('estado', 'cancelado'),
    ])

    return {
      total: counts[0].count || 0,
      nuevos: counts[1].count || 0,
      contactados: counts[2].count || 0,
      cotizados: counts[3].count || 0,
      reservados: counts[4].count || 0,
      cancelados: counts[5].count || 0,
    }
  }

  return data
}
