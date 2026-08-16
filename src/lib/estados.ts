export const QUOTE_ESTADOS = [
  { value: 'no_cotizado', label: 'No cotizado', color: '#94A3B8', emoji: '📋' },
  { value: 'en_cotizacion', label: 'En cotización', color: '#FB923C', emoji: '⚙️' },
  { value: 'cotizado', label: 'Cotizado', color: '#FBBF24', emoji: '💰' },
  { value: 'enviado_cliente', label: 'Enviado al cliente', color: '#60A5FA', emoji: '📨' },
  { value: 'concretado', label: 'Concretado', color: '#34D399', emoji: '✅' },
  { value: 'cancelado', label: 'Cancelado', color: '#F87171', emoji: '❌' },
] as const

export type QuoteEstado = (typeof QUOTE_ESTADOS)[number]['value']

export const QUOTE_ESTADOS_VALUE = QUOTE_ESTADOS.map((e) => e.value) as QuoteEstado[]

export const QUOTE_ESTADO_MAP = Object.fromEntries(
  QUOTE_ESTADOS.map((e) => [e.value, e])
) as Record<QuoteEstado, (typeof QUOTE_ESTADOS)[number]>

export function getEstadoLabel(estado: string): string {
  return QUOTE_ESTADO_MAP[estado as QuoteEstado]?.label ?? estado
}

export function getEstadoColor(estado: string): string {
  return QUOTE_ESTADO_MAP[estado as QuoteEstado]?.color ?? '#64748B'
}

export type HistorialEntry = {
  estado: string
  fecha?: string
  operador?: string
  nota?: string
}