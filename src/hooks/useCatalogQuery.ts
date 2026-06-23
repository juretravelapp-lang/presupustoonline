import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type CrmTTOO, type CrmServicio } from '@/lib/supabase'

/* ── TTOO Hooks ────────────────────────────────────────── */

export function useTTOOList() {
  return useQuery({
    queryKey: ['ttoo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_ttoo')
        .select('*')
        .order('nombre', { ascending: true })
      
      if (error) throw error
      return data as CrmTTOO[]
    }
  })
}

export function useCreateTTOO() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newData: Omit<CrmTTOO, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('crm_ttoo')
        .insert([newData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ttoo'] })
    }
  })
}

export function useUpdateTTOO() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<CrmTTOO> & { id: string }) => {
      const { data, error } = await supabase
        .from('crm_ttoo')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ttoo'] })
    }
  })
}

export function useDeleteTTOO() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_ttoo')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ttoo'] })
    }
  })
}

/* ── Servicios Hooks ───────────────────────────────────── */

export function useServiciosList() {
  return useQuery({
    queryKey: ['servicios_cat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_servicios')
        .select('*')
        .order('nombre', { ascending: true })
      
      if (error) throw error
      return data as CrmServicio[]
    }
  })
}

export function useCreateServicio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newData: Omit<CrmServicio, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('crm_servicios')
        .insert([newData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios_cat'] })
    }
  })
}

export function useUpdateServicio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<CrmServicio> & { id: string }) => {
      const { data, error } = await supabase
        .from('crm_servicios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios_cat'] })
    }
  })
}

export function useDeleteServicio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_servicios')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios_cat'] })
    }
  })
}
