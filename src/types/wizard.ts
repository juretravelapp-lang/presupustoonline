export interface PersonalInfo {
  nombre: string
  apellido: string
  dni: string
  email: string
  celular: string
}

export interface OriginInfo {
  ciudad_salida: string
  aeropuerto_salida: string
}

export interface DestinationInfo {
  /** Destinos seleccionados del grid de populares */
  destinos_seleccionados: string[]
  /** Destinos escritos a mano por el usuario */
  destinos_custom: string[]
  /** Valor legacy para compatibilidad */
  destino: string
  destino_personalizado: string
}

export interface DateInfo {
  /** 'exacta' = rango de fechas fijas | 'flexible' = mes preferido */
  tipo_fecha: 'exacta' | 'flexible'

  /* --- Fecha exacta: destino único --- */
  fecha_salida: string
  fecha_regreso: string

  /* --- Fecha exacta: múltiples destinos --- */
  /** Record<destinoKey, {fecha_salida, fecha_regreso}> */
  fechas_por_destino: Record<string, { fecha_salida: string; fecha_regreso: string }>

  /* --- Flexible --- */
  mes_preferido: string

  /** Campos legacy para compatibilidad con Supabase (se calculan al submit) */
  rango_fecha_inicio: string
  rango_fecha_fin: string
}

export interface PassengerInfo {
  adultos: number
  ninos_2_12: number
  bebes_0_2: number
  edades_adultos?: string
}

export interface PreferencesInfo {
  preferencias: string[]
}

export interface CommentsInfo {
  comentarios: string
  tipo_viaje: string
}

export type WizardStep =
  | 'destination'
  | 'dates'
  | 'passengers'
  | 'preferences'
  | 'contact'
  | 'summary'

export interface WizardData {
  personal:    PersonalInfo
  origin:      OriginInfo
  destination: DestinationInfo
  dates:       DateInfo
  passengers:  PassengerInfo
  preferences: PreferencesInfo
  comments:    CommentsInfo
}

export const STEP_LABELS: Record<WizardStep, string> = {
  destination: 'Destino',
  dates:       'Fechas',
  passengers:  'Pasajeros',
  preferences: 'Servicios',
  contact:     'Contacto',
  summary:     'Resumen',
}

export const STEP_EMOJIS: Record<WizardStep, string> = {
  destination: '🗺️',
  dates:       '📅',
  passengers:  '👥',
  preferences: '✨',
  contact:     '📬',
  summary:     '✅',
}

export const WIZARD_STEPS: WizardStep[] = [
  'destination',
  'dates',
  'passengers',
  'preferences',
  'contact',
  'summary',
]
