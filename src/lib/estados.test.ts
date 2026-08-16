import { describe, it, expect } from 'vitest'
import { getEstadoLabel, getEstadoColor, QUOTE_ESTADOS, QUOTE_ESTADOS_VALUE } from '@/lib/estados'

describe('estados', () => {
  it('expone los 6 estados válidos del CHECK de la migración 008', () => {
    expect(QUOTE_ESTADOS_VALUE.sort()).toEqual(
      ['no_cotizado', 'en_cotizacion', 'cotizado', 'enviado_cliente', 'concretado', 'cancelado'].sort()
    )
  })

  it('traduce estados conocidos a etiquetas legibles', () => {
    expect(getEstadoLabel('no_cotizado')).toBe('No cotizado')
    expect(getEstadoLabel('enviado_cliente')).toBe('Enviado al cliente')
    expect(getEstadoLabel('concretado')).toBe('Concretado')
  })

  it('devuelve el valor pasado cuando el estado es desconocido', () => {
    expect(getEstadoLabel('legacy_nuevo')).toBe('legacy_nuevo')
  })

  it('tiene un color asociado por estado', () => {
    for (const e of QUOTE_ESTADOS) {
      expect(getEstadoColor(e.value)).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})