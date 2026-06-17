import { useCallback } from 'react'
import type { QuoteData } from '@/lib/whatsapp'
import { openWhatsApp, getWhatsAppLink } from '@/lib/whatsapp'
import { useWizardStore } from '@/stores/wizardStore'

export function useWhatsApp() {
  const data = useWizardStore((state) => state.data)

  const buildQuoteData = useCallback((): QuoteData => {
    const destinosText = data.destination.destinos_seleccionados
      .map(d => d.replace(/_/g, ' '))
      .join(', ')

    return {
      nombre: data.personal.nombre,
      apellido: data.personal.apellido,
      dni: data.personal.dni,
      email: data.personal.email,
      celular: data.personal.celular,
      ciudad_salida: data.origin.ciudad_salida.replace(/_/g, ' '),
      aeropuerto_salida: data.origin.aeropuerto_salida,
      destino: destinosText || data.destination.destino,
      destino_personalizado: data.destination.destino_personalizado,
      tipo_fecha: data.dates.tipo_fecha,
      fecha_salida: data.dates.fecha_salida,
      fecha_regreso: data.dates.fecha_regreso,
      rango_fecha_inicio: data.dates.rango_fecha_inicio,
      rango_fecha_fin: data.dates.rango_fecha_fin,
      mes_preferido: data.dates.mes_preferido,
      adultos: data.passengers.adultos,
      ninos_2_12: data.passengers.ninos_2_12,
      bebes_0_2: data.passengers.bebes_0_2,
      preferencias: data.preferences.preferencias,
      comentarios: data.comments.comentarios,
    }
  }, [data])

  const sendWhatsApp = useCallback(() => {
    const quoteData = buildQuoteData()
    openWhatsApp(quoteData)
  }, [buildQuoteData])

  const getLink = useCallback(() => {
    const quoteData = buildQuoteData()
    return getWhatsAppLink(quoteData)
  }, [buildQuoteData])

  return { sendWhatsApp, getLink, buildQuoteData }
}
