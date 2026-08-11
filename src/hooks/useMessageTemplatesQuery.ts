import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as supabaseService from '@/lib/supabase'
import type { CrmMessageTemplate, InsertMessageTemplate } from '@/lib/supabase'

export const messageTemplateKeys = {
  all: ['messageTemplates'] as const,
  lists: () => [...messageTemplateKeys.all, 'list'] as const,
  list: (activeOnly: boolean) => [...messageTemplateKeys.all, 'list', { activeOnly }] as const,
  detail: (id: string) => [...messageTemplateKeys.all, 'detail', id] as const,
}

export function useMessageTemplates(activeOnly = false) {
  return useQuery({
    queryKey: messageTemplateKeys.list(activeOnly),
    queryFn: () => supabaseService.getMessageTemplates(activeOnly),
  })
}

export function useMessageTemplate(id: string) {
  return useQuery({
    queryKey: messageTemplateKeys.detail(id),
    queryFn: () => supabaseService.getMessageTemplateById(id),
    enabled: !!id,
  })
}

export function useCreateMessageTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newData: InsertMessageTemplate) => supabaseService.createMessageTemplate(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all })
    },
  })
}

export function useUpdateMessageTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<CrmMessageTemplate> & { id: string }) =>
      supabaseService.updateMessageTemplate(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all })
      queryClient.setQueryData(messageTemplateKeys.detail(variables.id), data)
    },
  })
}

export function useDeleteMessageTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => supabaseService.deleteMessageTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all })
    },
  })
}
