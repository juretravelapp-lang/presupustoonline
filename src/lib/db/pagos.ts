import { supabase } from './client'
import type { CrmPago, InsertPago } from './types'

// =============================================
// Pagos CRUD (crm_pagos) — historial y cuotas por cotización
// =============================================

function mapPago(p: CrmPago): CrmPago {
  return { ...p, monto: Number(p.monto) }
}

export interface GetPagosFilters {
  fecha_desde?: string
  fecha_hasta?: string
}

export async function getPagos(filters?: GetPagosFilters) {
  let query = supabase
    .from('crm_pagos')
    .select('*, crm_quote_services(nombre), travel_quotes(nombre, apellido, ticket_id)')
    .order('fecha_vencimiento', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (filters?.fecha_desde) {
    query = query.gte('fecha_vencimiento', filters.fecha_desde)
  }
  if (filters?.fecha_hasta) {
    query = query.lte('fecha_vencimiento', filters.fecha_hasta)
  }

  const { data, error } = await query

  if (error) throw error
  return (data as CrmPago[]).map(mapPago)
}

export async function getPagosByQuote(quoteId: string) {
  const { data, error } = await supabase
    .from('crm_pagos')
    .select('*')
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as CrmPago[]).map(mapPago)
}

export async function crearPago(data: InsertPago) {
  const { data: row, error } = await supabase
    .from('crm_pagos')
    .insert({ ...data, monto: Number(data.monto) })
    .select()
    .single()

  if (error) throw error
  return mapPago(row as CrmPago)
}

export async function updatePago(id: string, updates: Partial<InsertPago>) {
  const { data: row, error } = await supabase
    .from('crm_pagos')
    .update({ ...updates, monto: updates.monto !== undefined ? Number(updates.monto) : undefined })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapPago(row as CrmPago)
}

export async function deletePago(id: string) {
  const { error } = await supabase
    .from('crm_pagos')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}