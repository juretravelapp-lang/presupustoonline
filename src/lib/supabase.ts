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

export interface ServicioPrecio {
  id: string
  tipo: string
  ttoo?: string
  descripcion: string
  costo: number
  fecha_vto_ttoo?: string
  estado_pago?: 'pendiente' | 'pagado'
}

export interface CrmTTOO {
  id: string
  nombre: string
  contacto: string | null
  created_at: string
}

export interface CrmServicio {
  id: string
  nombre: string
  descripcion: string | null
  created_at: string
}

export interface CrmDestino {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  emoji: string | null
  color: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface PricingDetalles {
  moneda: 'ARS' | 'USD'
  markup_tipo: 'porcentaje' | 'fijo'
  markup_valor: number
  proveedor_seleccionado?: string | null
  proveedores?: ProveedorPrecio[]
  servicios?: ServicioPrecio[]
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
  edades_adultos: string | null
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
  ticket_id: string | null
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

// =============================================
// Message Templates CRUD (crm_message_templates)
// =============================================

export type FieldWidth = 'third' | 'half' | 'full'

export type TemplateFieldType =
  | 'text' | 'textarea' | 'number' | 'currency'
  | 'email' | 'tel' | 'date' | 'time' | 'select'

export interface TemplateFieldDef {
  key: string
  label: string
  type: TemplateFieldType
  placeholder?: string
  required?: boolean
  emoji?: string
  options?: string[]
  width: FieldWidth
}

export interface CrmMessageTemplate {
  id: string
  nombre: string
  slug: string
  categoria: string
  emoji: string | null
  descripcion: string | null
  is_active: boolean
  fields: TemplateFieldDef[]
  mensaje_template: string
  orden: number
  created_at: string
  updated_at: string
}

export type InsertMessageTemplate = Omit<CrmMessageTemplate, 'id' | 'created_at' | 'updated_at'>

export async function getMessageTemplates(activeOnly = false) {
  let query = supabase
    .from('crm_message_templates')
    .select('*')
    .order('orden', { ascending: true })
    .order('nombre', { ascending: true })

  if (activeOnly) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) throw error
  return data as CrmMessageTemplate[]
}

export async function getMessageTemplateById(id: string) {
  const { data, error } = await supabase
    .from('crm_message_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as CrmMessageTemplate
}

export async function createMessageTemplate(template: InsertMessageTemplate) {
  const { data, error } = await supabase
    .from('crm_message_templates')
    .insert(template)
    .select()
    .single()

  if (error) throw error
  return data as CrmMessageTemplate
}

export async function updateMessageTemplate(id: string, updates: Partial<CrmMessageTemplate>) {
  const { data, error } = await supabase
    .from('crm_message_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as CrmMessageTemplate
}

export async function deleteMessageTemplate(id: string) {
  const { error } = await supabase
    .from('crm_message_templates')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// =============================================
// Clientes CRUD (clientes + clientes_relaciones)
// =============================================

export type ClienteTipoRelacion = 'pareja' | 'familia' | 'amigo' | 'otro'

export interface Cliente {
  id: string
  nombre: string
  apellido: string | null
  dni: string | null
  email: string | null
  celular: string | null
  fecha_nacimiento: string | null
  pasaporte: string | null
  direccion: string | null
  notas: string | null
  preferencias: Record<string, unknown>
  creado_por: string | null
  created_at: string
  updated_at: string
}

export type InsertCliente = Pick<
  Cliente,
  'nombre' | 'apellido' | 'dni' | 'email' | 'celular' | 'fecha_nacimiento' | 'pasaporte' | 'direccion' | 'notas' | 'preferencias'
>

export interface ClienteRelacion {
  id: string
  cliente_id: string
  relacionado_id: string
  tipo: ClienteTipoRelacion
  nota: string | null
  created_at: string
  relacionado?: Cliente
}

export interface ClienteViaje {
  id: string
  cliente_id: string | null
  nombre: string
  apellido: string
  destino: string | null
  fecha_salida: string | null
  fecha_regreso: string | null
  estado: string
  ticket_id: string | null
  created_at: string
}

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
