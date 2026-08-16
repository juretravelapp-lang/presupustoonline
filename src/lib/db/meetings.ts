import { supabase } from './client'
import type { CrmMeeting, InsertMeeting } from './types'

// =============================================
// CRM Meetings CRUD
// =============================================

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