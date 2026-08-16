import { describe, it, expect } from 'vitest'
import { buildCsv, escapeCsvCell, formatCurrencyForCsv } from '@/lib/exportCsv'

describe('exportCsv', () => {
  it('escapa comas, comillas y saltos de línea', () => {
    expect(escapeCsvCell('López, Juan')).toBe('"López, Juan"')
    expect(escapeCsvCell('Dice "hola"')).toBe('"Dice ""hola"""')
    expect(escapeCsvCell('línea\nnueva')).toBe('"línea\nnueva"')
    expect(escapeCsvCell(123)).toBe('123')
    expect(escapeCsvCell(null)).toBe('')
    expect(escapeCsvCell(undefined)).toBe('')
  })

  it('construye un CSV con encabezados y filas', () => {
    const csv = buildCsv(['Ticket', 'Cliente', 'Precio'], [
      ['JT-001', 'Ana García', 1000],
      ['JT-002', 'López, Juan', 'ARS 2.500'],
    ])
    expect(csv).toBe('Ticket,Cliente,Precio\nJT-001,Ana García,1000\nJT-002,"López, Juan",ARS 2.500')
  })

  it('formatea precios por moneda y vacía cuando no hay monto', () => {
    expect(formatCurrencyForCsv('USD', 1500.5)).toBe(`USD ${(1500.5).toLocaleString()}`)
    expect(formatCurrencyForCsv('ARS', 2500)).toBe(`ARS ${(2500).toLocaleString()}`)
    expect(formatCurrencyForCsv('USD', 0)).toBe('')
    expect(formatCurrencyForCsv(undefined, -1)).toBe('')
  })
})