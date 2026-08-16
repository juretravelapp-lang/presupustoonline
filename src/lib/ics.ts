interface IcsEvent {
  uid: string
  summary: string
  description?: string
  location?: string
  start: string // ISO
  end?: string // ISO (optional)
  durationMinutes?: number
}

function formatIcsDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  )
}

export function buildIcs(event: IcsEvent): string {
  const startDate = formatIcsDate(event.start)
  let endDate: string
  if (event.end) {
    endDate = formatIcsDate(event.end)
  } else {
    const dur = new Date(event.start)
    dur.setMinutes(dur.getMinutes() + (event.durationMinutes || 60))
    endDate = formatIcsDate(dur.toISOString())
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JureTravel//Presupuestador//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.summary.replace(/[\n\r]+/g, ' ')}`,
  ]
  if (event.description) lines.push(`DESCRIPTION:${event.description.replace(/[\n\r]+/g, ' ')}`)
  if (event.location) lines.push(`LOCATION:${event.location.replace(/[\n\r]+/g, ' ')}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.join('\r\n')
}

export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}