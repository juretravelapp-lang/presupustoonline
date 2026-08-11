import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPagos,
  getPagosByQuote,
  crearPago,
  updatePago,
  deletePago,
  type InsertPago,
} from '@/lib/supabase'

const KEY = 'pagos'

export function usePagos() {
  return useQuery({ queryKey: [KEY], queryFn: getPagos })
}

export function usePagosByQuote(quoteId: string) {
  return useQuery({
    queryKey: [KEY, 'quote', quoteId],
    queryFn: () => getPagosByQuote(quoteId),
  })
}

export function useCrearPago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: InsertPago) => crearPago(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdatePago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertPago> }) =>
      updatePago(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeletePago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePago(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
