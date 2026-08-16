import type { QuoteEstado } from '@/lib/estados'

export interface Lead {
  id: string
  nombre: string
  apellido: string
  dni: string
  email: string
  celular: string
  ciudad_salida?: string
  destino?: string
  destinos: string[]
  tipo_fecha: string
  fecha_salida?: string
  fecha_regreso?: string
  adultos: number
  ninos_2_12: number
  bebes_0_2: number
  preferencias: string[]
  comentarios?: string
  tipo_viaje?: string
  estado: QuoteEstado
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total: number
  no_cotizado: number
  en_cotizacion: number
  cotizados: number
  enviado_cliente: number
  concretados: number
  cancelados: number
}

export interface LeadFilters {
  status?: QuoteEstado | ''
  search?: string
  dateFrom?: string
  dateTo?: string
  destino?: string
  operador?: string
}