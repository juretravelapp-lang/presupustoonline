import { WHATSAPP_NUMBER } from './constants'
import type { CrmMessageTemplate, TemplateFieldDef, FieldWidth } from './supabase'

export type FormData = Record<string, string | number>

export interface RenderedMessage {
  raw: string
  whatsappLink: string
}

const SYSTEM_PLACEHOLDERS = {
  _today: () => new Date().toLocaleDateString('es-AR'),
  _hora: () => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  _timestamp: () => `${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`,
  _factura_num: () => {
    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const rand = Math.floor(1000 + Math.random() * 9000)
    return `${yy}${mm}${dd}-${rand}`
  },
}

function formatCurrencyValue(value: string | number): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(num)
}

function formatFieldValue(field: TemplateFieldDef, rawValue: string): string {
  const value = (rawValue ?? '').trim()

  if (value === '') {
    return field.required ? '⏳ pendiente' : '—'
  }

  switch (field.type) {
    case 'date':
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split('-')
        return `${d}/${m}/${y}`
      }
      return value
    case 'currency':
      return formatCurrencyValue(value)
    case 'number':
      return Number(value).toLocaleString('es-AR')
    default:
      return value
  }
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function resolveFieldDefaults(fields: TemplateFieldDef[]): FormData {
  const defaults: FormData = {}
  fields.forEach((f) => {
    defaults[f.key] = ''
  })
  return defaults
}

export function renderMessageTemplate(
  template: CrmMessageTemplate,
  data: FormData
): string {
  const { mensaje_template, fields } = template
  let result = mensaje_template

  fields.forEach((field) => {
    const raw = data[field.key]
    const value = raw != null ? String(raw) : ''
    const formatted = formatFieldValue(field, value)
    result = result.replace(new RegExp(`{{${escapeRegExp(field.key)}}}`, 'g'), formatted)
  })

  result = result.replace(/{{\s*(_today|_hora|_timestamp|_factura_num)\s*}}/g, (_match, p1: string) => {
    const fn = SYSTEM_PLACEHOLDERS[p1 as keyof typeof SYSTEM_PLACEHOLDERS]
    return fn ? fn() : _match
  })

  result = result.replace(/(?:\r\n|\r|\n)/g, '\n')

  const lines = result.split('\n')
  const cleaned: string[] = []
  let blankStreak = 0
  lines.forEach((line) => {
    const trimmed = line.replace(/[ \t]+$/, '')
    if (trimmed === '') {
      blankStreak++
      if (blankStreak <= 1) cleaned.push('')
    } else {
      blankStreak = 0
      cleaned.push(trimmed)
    }
  })
  result = cleaned.join('\n').trim()

  return result
}

export function buildWhatsAppLink(message: string, customNumber?: string): string {
  return `https://wa.me/${customNumber || WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function renderMessage(
  template: CrmMessageTemplate,
  data: FormData
): RenderedMessage {
  const raw = renderMessageTemplate(template, data)
  const whatsappLink = buildWhatsAppLink(raw)
  return { raw, whatsappLink }
}

export function previewMessage(template: CrmMessageTemplate, data: FormData): string {
  return renderMessageTemplate(template, data)
}

export function isTemplateValid(template: CrmMessageTemplate): boolean {
  return !!template.nombre && !!template.slug && !!template.categoria && !!template.mensaje_template
}

export const CATEGORIAS_TEMPLATE = [
  { value: 'cotizacion', label: 'Cotización', emoji: '💰' },
  { value: 'recibo_pago', label: 'Recibo de Pago', emoji: '💵' },
  { value: 'confirmacion', label: 'Confirmación', emoji: '✅' },
  { value: 'recordatorio', label: 'Recordatorio', emoji: '📅' },
  { value: 'factura', label: 'Factura', emoji: '🧾' },
  { value: 'otro', label: 'Otro', emoji: '💬' },
] as const

export const FIELD_TYPE_OPTIONS: { value: TemplateFieldDef['type']; label: string; emoji: string }[] = [
  { value: 'text', label: 'Texto', emoji: '🔤' },
  { value: 'textarea', label: 'Párrafo', emoji: '📝' },
  { value: 'number', label: 'Número', emoji: '🔢' },
  { value: 'currency', label: 'Moneda', emoji: '💵' },
  { value: 'email', label: 'Email', emoji: '📧' },
  { value: 'tel', label: 'Teléfono', emoji: '📱' },
  { value: 'date', label: 'Fecha', emoji: '📅' },
  { value: 'time', label: 'Hora', emoji: '🕐' },
  { value: 'select', label: 'Lista (Opciones)', emoji: '📋' },
]

export const FIELD_WIDTH_OPTIONS: { value: FieldWidth; label: string }[] = [
  { value: 'third', label: '1/3 (ancho estrecho)' },
  { value: 'half', label: '1/2 (ancho medio)' },
  { value: 'full', label: '100% (ancho completo)' },
]

export const DEFAULT_TEMPLATES: CrmMessageTemplate[] = [
  {
    id: 'seed-cotizacion',
    nombre: 'Cotización de Viaje',
    slug: 'cotizacion',
    categoria: 'cotizacion',
    emoji: '💰',
    descripcion: 'Plantilla para enviar presupuestos de viaje al cliente',
    is_active: true,
    orden: 10,
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ej: Juan', required: true, emoji: '👤', width: 'half' },
      { key: 'apellido', label: 'Apellido', type: 'text', placeholder: 'Ej: Pérez', required: true, emoji: '👤', width: 'half' },
      { key: 'dni', label: 'DNI', type: 'text', placeholder: '12345678', required: true, emoji: '🆔', width: 'half' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'cliente@email.com', required: false, emoji: '📧', width: 'half' },
      { key: 'celular', label: 'Celular', type: 'tel', placeholder: '54 9 381 1234567', required: true, emoji: '📱', width: 'full' },
      { key: 'origen', label: 'Ciudad de Salida', type: 'text', placeholder: 'Tucumán', required: true, emoji: '✈️', width: 'half' },
      { key: 'destino', label: 'Destino', type: 'text', placeholder: 'Punta Cana, República Dominicana', required: true, emoji: '🗺️', width: 'half' },
      { key: 'fechas', label: 'Fechas', type: 'text', placeholder: '15/11 al 22/11', required: true, emoji: '📅', width: 'full' },
      { key: 'adultos', label: 'Adultos', type: 'number', placeholder: '2', required: true, emoji: '👥', width: 'third' },
      { key: 'ninos', label: 'Niños (2-11)', type: 'number', placeholder: '0', required: false, emoji: '👶', width: 'third' },
      { key: 'bebes', label: 'Bebés (0-2)', type: 'number', placeholder: '0', required: false, emoji: '👶', width: 'third' },
      { key: 'servicios', label: 'Servicios Incluidos', type: 'textarea', placeholder: '• Hotel 7 noches\n• Vuelo ida y vuelta\n• Traslados', required: true, emoji: '✨', width: 'full' },
      { key: 'total', label: 'Total', type: 'currency', placeholder: '1299', required: true, emoji: '💵', width: 'half' },
      { key: 'moneda', label: 'Moneda', type: 'select', placeholder: 'Seleccionar moneda', required: true, emoji: '💱', options: ['ARS', 'USD', 'EUR'], width: 'half' },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea', placeholder: 'Notas adicionales...', required: false, emoji: '💬', width: 'full' },
    ],
    mensaje_template: [
      '*COTIZACIÓN DE VIAJE*',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'Hola *{{nombre}} {{apellido}}*,',
      '',
      '👤 *DATOS DEL CLIENTE*',
      '  • DNI: {{dni}}',
      '  • Email: {{email}}',
      '  • Celular: {{celular}}',
      '',
      '✈️ *DETALLE DEL VIAJE*',
      '  • Origen: {{origen}}',
      '  • Destino: {{destino}}',
      '  • Fechas: {{fechas}}',
      '  • Pasajeros: {{adultos}} adultos, {{ninos}} niños, {{bebes}} bebés',
      '',
      '✨ *SERVICIOS INCLUIDOS*',
      '{{servicios}}',
      '',
      '💰 *TOTAL: {{moneda}} ${{total}}*',
      '',
      '💬 *OBSERVACIONES*',
      '{{observaciones}}',
      '',
      ' ¡Quedo atento para cualquier consulta!',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ].join('\n'),
    created_at: '',
    updated_at: '',
  },
]
