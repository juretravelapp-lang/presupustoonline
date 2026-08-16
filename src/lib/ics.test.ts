import { describe, it, expect } from 'vitest'
import { buildIcs } from '@/lib/ics'

describe('ics', () => {
  const event = {
    uid: 'abc@juretravel',
    summary: 'Reunión de cierre',
    description: 'Notas de la reunión',
    location: 'Oficina central',
    start: '2026-08-20T10:00:00',
    end: '2026-08-20T11:00:00',
  }

  it('genera un vevent con DTSTART y DTEND formateados', () => {
    const ics = buildIcs(event)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('UID:abc@juretravel')
    expect(ics).toContain('DTSTART:20260820T100000')
    expect(ics).toContain('DTEND:20260820T110000')
    expect(ics).toContain('SUMMARY:Reunión de cierre')
    expect(ics).toContain('DESCRIPTION:Notas de la reunión')
    expect(ics).toContain('LOCATION:Oficina central')
  })

  it('calcula DTEND a partir de durationMinutes cuando no se pasa end', () => {
    const ics = buildIcs({ uid: '1', summary: 's', start: '2026-08-20T10:00:00', durationMinutes: 90 })
    expect(ics).toContain('DTSTART:20260820T100000')
    expect(ics).toContain('DTEND:20260820T113000')
  })

  it('normaliza saltos de línea en summary', () => {
    const ics = buildIcs({ uid: '2', summary: 'a\nb', start: '2026-08-20T10:00:00' })
    expect(ics).toContain('SUMMARY:a b')
  })
})