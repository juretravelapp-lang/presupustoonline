// =============================================
// Tipos de datos de Supabase (domain layer)
// =============================================

export interface ProveedorPrecio {
  nombre: string
  hotel_costo: number
  vuelos_costo: number
  otros_costo: number
  markup_aplicado: number
  precio_final: number
}

export interface ServicioPrecio {
  id: string
  tipo: string
  ttoo?: string
  descripcion: string
  costo: number
  fecha_vto_ttoo?: string
  estado_pago?: 'pendiente' | 'pagado'
}

export interface CrmTTOO {
  id: string
  nombre: string
  contacto: string | null
  created_at: string
}

export interface CrmServicio {
  id: string
  nombre: string
  descripcion: string | null
  created_at: string
}

export interface CrmDestino {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  emoji: string | null
  color: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface PricingDetalles {
  moneda: 'ARS' | 'USD'
  markup_tipo: 'porcentaje' | 'fijo'
  markup_valor: number
  proveedor_seleccionado?: string | null
  proveedores?: ProveedorPrecio[]
  servicios?: ServicioPrecio[]
}

export interface TravelQuoteRow {
  id: string
  nombre: string
  apellido: string
  dni: string
  email: string
  celular: string
  ciudad_salida: string | null
  aeropuerto_salida: string | null
  destino: string | null
  destino_personalizado: string | null
  destinos: string[]
  tipo_fecha: 'exacta' | 'flexible' | 'mes'
  fecha_salida: string | null
  fecha_regreso: string | null
  rango_fecha_inicio: string | null
  rango_fecha_fin: string | null
  mes_preferido: string | null
  adultos: number
  ninos_2_12: number
  bebes_0_2: number
  edades_adultos: string | null
  preferencias: string[]
  comentarios: string | null
  tipo_viaje: string | null
  ip_address: string | null
  origen_consulta: string
  estado: 'no_cotizado' | 'en_cotizacion' | 'cotizado' | 'enviado_cliente' | 'concretado' | 'cancelado'
  whatsapp_enviado: boolean
  whatsapp_mensaje: string | null
  creador_email?: string | null
  operador_nombre?: string | null
  reunion_fecha?: string | null
  reunion_estado?: 'pendiente' | 'realizada' | 'cancelada' | null
  notas_crm?: string | null
  pricing_detalles?: PricingDetalles | null
  historial?: HistorialEstado[] | null
  dates?: {
    fechas_por_destino: Record<string, { fecha_salida: string; fecha_regreso: string }>
  } | null
  ticket_id: string | null
  cliente_id?: string | null
  cotizacion_detalles?: CotizacionDetalles | null
  created_at: string
  updated_at: string
}

export type InsertQuote = Omit<TravelQuoteRow, 'id' | 'created_at' | 'updated_at'>

export interface HistorialEstado {
  estado: TravelQuoteRow['estado']
  fecha: string
  usuario: string
}

export interface PasajeroDetalle {
  nombre: string
  apellido?: string
  dni?: string
  pasaporte?: string
  fecha_nacimiento?: string
  edad?: string
  observaciones?: string
  pedidos_especiales?: string
}

export interface CotizacionDetalles {
  observaciones?: string
  pasajeros?: PasajeroDetalle[]
}

export interface FlightSegment {
  origen: string
  destino: string
  fecha: string
  hora_salida?: string
  hora_llegada?: string
  vuelo?: string
  aerolinea?: string
}

export interface FlightDetails {
  tipo: 'vuelo'
  pnr?: string
  tramos: FlightSegment[]
  pasajeros: string[]
  observaciones?: string
}

export interface HotelDetails {
  tipo: 'hotel'
  check_in?: string
  check_out?: string
  habitacion?: string
  regimen?: string
  pasajeros: string[]
  reserva?: string
  observaciones?: string
}

export interface CarRentalDetails {
  tipo: 'auto'
  pick_up_lugar?: string
  pick_up_fecha?: string
  drop_off_lugar?: string
  drop_off_fecha?: string
  conductor?: string
  categoria?: string
  reserva?: string
  observaciones?: string
}

export type QuoteServiceOperativa = FlightDetails | HotelDetails | CarRentalDetails | any

export interface CrmQuoteService {
  id: string
  quote_id: string
  servicio_id: string | null
  nombre: string
  descripcion: string | null
  proveedor: string | null
  precio_total: number
  moneda: 'ARS' | 'USD'
  fecha_desde: string | null
  fecha_hasta: string | null
  estado: 'cotizado' | 'reservado' | 'confirmado' | 'emitido' | 'cancelado' | 'finalizado'
  orden: number
  notas: string | null
  detalles_operativos: QuoteServiceOperativa
  created_at: string
  updated_at: string
}

export type InsertQuoteService = Omit<CrmQuoteService, 'id' | 'created_at' | 'updated_at'>
export type UpdateQuoteService = Partial<InsertQuoteService>

export interface CrmPago {
  id: string
  created_at: string
  quote_id: string
  quote_service_id: string | null
  cliente_id: string | null
  ticket_id: string | null
  cliente_nombre: string | null
  concepto: string
  moneda: 'ARS' | 'USD'
  monto: number
  forma_pago: string
  fecha_pago: string | null
  fecha_vencimiento: string | null
  estado: 'pendiente' | 'pagado' | 'cancelado'
  notas: string | null
  es_cuota: boolean
  cuota_numero: number | null
  cuota_total: number | null
  crm_quote_services?: { nombre: string }
  travel_quotes?: { nombre: string, apellido: string, ticket_id: string }
  updated_at: string
}

export type InsertPago = Omit<CrmPago, 'id' | 'created_at' | 'updated_at'>

export interface CrmMeeting {
  id: string
  quote_id: string
  titulo: string
  fecha_inicio: string
  fecha_fin: string | null
  estado: 'pendiente' | 'realizada' | 'cancelada' | 'reprogramada'
  tipo: 'presencial' | 'videollamada' | 'telefonica'
  notas: string | null
  creado_por: string | null
  created_at: string
  updated_at: string
  travel_quotes?: {
    nombre: string
    apellido: string
    email: string
    celular: string
    destino: string | null
    destino_personalizado: string | null
    destinos: string[]
    estado: TravelQuoteRow['estado']
  }
}

export type InsertMeeting = Omit<CrmMeeting, 'id' | 'created_at' | 'updated_at' | 'travel_quotes'>

export type FieldWidth = 'third' | 'half' | 'full'

export type TemplateFieldType =
  | 'text' | 'textarea' | 'number' | 'currency'
  | 'email' | 'tel' | 'date' | 'time' | 'select'

export interface TemplateFieldDef {
  key: string
  label: string
  type: TemplateFieldType
  placeholder?: string
  required?: boolean
  emoji?: string
  options?: string[]
  width: FieldWidth
}

export interface CrmMessageTemplate {
  id: string
  nombre: string
  slug: string
  categoria: string
  emoji: string | null
  descripcion: string | null
  is_active: boolean
  fields: TemplateFieldDef[]
  mensaje_template: string
  orden: number
  created_at: string
  updated_at: string
}

export type InsertMessageTemplate = Omit<CrmMessageTemplate, 'id' | 'created_at' | 'updated_at'>

export type ClienteTipoRelacion = 'pareja' | 'familia' | 'amigo' | 'otro'

export interface Cliente {
  id: string
  nombre: string
  apellido: string | null
  dni: string | null
  email: string | null
  celular: string | null
  fecha_nacimiento: string | null
  pasaporte: string | null
  direccion: string | null
  notas: string | null
  preferencias: Record<string, unknown>
  creado_por: string | null
  created_at: string
  updated_at: string
}

export type InsertCliente = Pick<
  Cliente,
  'nombre' | 'apellido' | 'dni' | 'email' | 'celular' | 'fecha_nacimiento' | 'pasaporte' | 'direccion' | 'notas' | 'preferencias'
>

export interface ClienteRelacion {
  id: string
  cliente_id: string
  relacionado_id: string
  tipo: ClienteTipoRelacion
  nota: string | null
  created_at: string
  relacionado?: Cliente
}

export interface ClienteViaje {
  id: string
  cliente_id: string | null
  nombre: string
  apellido: string
  destino: string | null
  fecha_salida: string | null
  fecha_regreso: string | null
  estado: string
  ticket_id: string | null
  created_at: string
}