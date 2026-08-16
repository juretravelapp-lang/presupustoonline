import { supabase } from './client'
import type { CrmMessageTemplate, InsertMessageTemplate } from './types'

// =============================================
// Message Templates CRUD (crm_message_templates)
// =============================================

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