import { WHATSAPP_NUMBER } from './constants'

export interface QuoteData {
  nombre: string
  apellido: string
  dni: string
  email: string
  celular: string
  ciudad_salida: string
  aeropuerto_salida?: string
  destino: string
  destino_personalizado?: string
  tipo_fecha: 'exacta' | 'flexible' | 'mes'
  fecha_salida?: string
  fecha_regreso?: string
  rango_fecha_inicio?: string
  rango_fecha_fin?: string
  mes_preferido?: string
  adultos: number
  ninos_2_12: number
  bebes_0_2: number
  edades_adultos?: string
  preferencias: string[]
  comentarios?: string
  ticket_id: string
}

export function generateWhatsAppMessage(data: QuoteData): string {
  const preferenciasText = data.preferencias.length > 0
    ? data.preferencias.map(p => `• ${p.replace(/_/g, ' ')}`).join('\n')
    : '• No especificado'

  let fechasText = ''
  if (data.tipo_fecha === 'exacta') {
    fechasText = `• Salida: ${data.fecha_salida || 'No especificada'}\n• Regreso: ${data.fecha_regreso || 'No especificada'}`
  } else if (data.tipo_fecha === 'flexible') {
    fechasText = `• Desde: ${data.rango_fecha_inicio || 'No especificado'}\n• Hasta: ${data.rango_fecha_fin || 'No especificado'}`
  } else {
    fechasText = `• Mes preferido: ${data.mes_preferido || 'No especificado'}`
  }

const mensaje = `*NUEVA SOLICITUD DE VIAJE*
━━━━━━━━━━━━━━━━━━━━
Ticket: ${data.ticket_id}

👤 *DATOS PERSONALES*
• Nombre: ${data.nombre} ${data.apellido}
• DNI: ${data.dni}
• Email: ${data.email || 'No proporcionado'}
• Celular: ${data.celular}

✈️ *VIAJE*
• Origen: ${data.ciudad_salida || 'No especificada'}
• Destino: ${data.destino}${data.destino_personalizado ? ` (${data.destino_personalizado})` : ''}
• Tipo de fecha: ${data.tipo_fecha.replace(/_/g, ' ')}
${fechasText}

👥 *PASAJEROS*
• Adultos: ${data.adultos}${data.edades_adultos ? ` (Edades: ${data.edades_adultos})` : ''}
• Niños (2 a 11 años): ${data.ninos_2_12}
• Bebés (0 a 2 años): ${data.bebes_0_2}

✨ *SERVICIOS*
${preferenciasText}

💬 *COMENTARIOS*
${data.comentarios || 'Sin comentarios'}

📅 Fecha de solicitud: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}
━━━━━━━━━━━━━━━━━━━━`

  return encodeURIComponent(mensaje)
}

export function getWhatsAppLink(data: QuoteData): string {
  const mensaje = generateWhatsAppMessage(data)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`
}

export function openWhatsApp(data: QuoteData): void {
  const link = getWhatsAppLink(data)
  window.open(link, '_blank', 'noopener,noreferrer')
}
