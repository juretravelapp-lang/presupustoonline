export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  return [headers.map(escapeCsvCell).join(','), ...rows.map(r => r.map(escapeCsvCell).join(','))].join('\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function formatCurrencyForCsv(moneda: string | undefined, value: number): string {
  if (!value || value <= 0) return ''
  return moneda === 'USD' ? `USD ${value.toLocaleString()}` : `ARS ${value.toLocaleString()}`
}