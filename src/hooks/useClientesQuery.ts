import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getClientes,
  getRelacionesCliente,
  getClientesViajes,
  crearCliente,
  updateCliente,
  deleteCliente,
  addRelacion,
  removeRelacion,
  type InsertCliente,
  type ClienteTipoRelacion,
} from '@/lib/supabase'

const KEY = 'clientes'
const REL = 'clientes-relaciones'
const VIAJES = 'clientes-viajes'

export function useClientes() {
  return useQuery({ queryKey: [KEY], queryFn: getClientes })
}

export function useRelacionesCliente(clienteId: string | null) {
  return useQuery({
    queryKey: [REL, clienteId],
    queryFn: () => getRelacionesCliente(clienteId as string),
    enabled: !!clienteId,
  })
}

export function useClientesViajes(clienteId: string | null) {
  return useQuery({
    queryKey: [VIAJES, clienteId],
    queryFn: () => getClientesViajes(clienteId as string),
    enabled: !!clienteId,
  })
}

export function useCrearCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (c: InsertCliente) => crearCliente(c),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertCliente> }) =>
      updateCliente(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: [REL] })
      qc.invalidateQueries({ queryKey: [VIAJES] })
    },
  })
}

export function useDeleteCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCliente(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useAddRelacion(clienteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { relacionadoId: string; tipo: ClienteTipoRelacion; nota?: string }) =>
      addRelacion(clienteId, args.relacionadoId, args.tipo, args.nota),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REL] })
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}

export function useRemoveRelacion(_clienteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeRelacion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REL] })
      qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}