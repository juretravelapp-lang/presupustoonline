import { supabase } from './client'
import type { CrmQuoteService, InsertQuoteService } from './types'

// =============================================
// Quote Services CRUD (crm_quote_services)
// =============================================

function mapQuoteService(s: CrmQuoteService): CrmQuoteService {
  return { ...s, precio_total: Number(s.precio_total) }
}

export async function getQuoteServices(quoteId: string) {
  const { data, error } = await supabase
    .from('crm_quote_services')
    .select('*')
    .eq('quote_id', quoteId)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as CrmQuoteService[]).map(mapQuoteService)
}

export async function createQuoteService(data: InsertQuoteService) {
  const { data: row, error } = await supabase
    .from('crm_quote_services')
    .insert({ ...data, precio_total: Number(data.precio_total) })
    .select()
    .single()

  if (error) throw error
  return mapQuoteService(row as CrmQuoteService)
}

export async function updateQuoteService(id: string, updates: Partial<InsertQuoteService>) {
  const { data: row, error } = await supabase
    .from('crm_quote_services')
    .update({ ...updates, precio_total: updates.precio_total !== undefined ? Number(updates.precio_total) : undefined })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapQuoteService(row as CrmQuoteService)
}

export async function deleteQuoteService(id: string) {
  const { error } = await supabase
    .from('crm_quote_services')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}