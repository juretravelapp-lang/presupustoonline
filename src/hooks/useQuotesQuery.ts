import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as supabaseService from '@/lib/supabase'

export const queryKeys = {
  allQuotes: ['quotes'] as const,
  quotesList: (filters: any) => ['quotes', 'list', filters] as const,
  quoteDetail: (id: string) => ['quotes', 'detail', id] as const,
  dashboardStats: ['dashboardStats'] as const,
  meetingsList: (from: string, to: string) => ['meetings', 'list', from, to] as const,
  meetingsForQuote: (quoteId: string) => ['meetings', 'quote', quoteId] as const,
}

// ----------------------
// QUERIES
// ----------------------

export function useQuotesList(filters?: { status?: string; search?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.quotesList(filters),
    queryFn: () => supabaseService.getQuotes(filters),
  })
}

export function useQuoteDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.quoteDetail(id),
    queryFn: () => supabaseService.getQuoteById(id),
    enabled: !!id,
  })
}

export function useDashboardStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => supabaseService.getDashboardStats(),
    refetchInterval: 30000, // refresh every 30s
    enabled: options?.enabled,
  })
}

// ----------------------
// MUTATIONS
// ----------------------

export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string, status: supabaseService.TravelQuoteRow['estado'] }) => 
      supabaseService.updateQuoteStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allQuotes })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
      queryClient.setQueryData(queryKeys.quoteDetail(variables.id), data)
    },
  })
}

export function useDeleteQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => supabaseService.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allQuotes })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
    },
  })
}
