import { useMemo } from 'react'
import type { TravelQuoteRow } from '@/lib/supabase'
import { getEstadoColor } from '@/lib/estados'
import { UserRound, TrendingUp } from 'lucide-react'

type PartialQuote = Partial<TravelQuoteRow>

interface OperatorMetricsProps {
  data: PartialQuote[]
  isLoading?: boolean
}

interface RowAcc {
  total: number
  no_cotizado: number
  en_cotizacion: number
  cotizado: number
  enviado_cliente: number
  concretado: number
  cancelado: number
}

const EMPTY: RowAcc = {
  total: 0, no_cotizado: 0, en_cotizacion: 0, cotizado: 0,
  enviado_cliente: 0, concretado: 0, cancelado: 0,
}

export function OperatorMetrics({ data, isLoading }: OperatorMetricsProps) {
  const rows = useMemo(() => {
    const map = new Map<string, RowAcc>()
    for (const q of data) {
      const name = q.operador_nombre?.trim() || q.creador_email?.trim() || 'Sin asignar'
      const acc = map.get(name) ?? { ...EMPTY }
      acc.total += 1
      switch (q.estado) {
        case 'no_cotizado': acc.no_cotizado += 1; break
        case 'en_cotizacion': acc.en_cotizacion += 1; break
        case 'cotizado': acc.cotizado += 1; break
        case 'enviado_cliente': acc.enviado_cliente += 1; break
        case 'concretado': acc.concretado += 1; break
        case 'cancelado': acc.cancelado += 1; break
      }
      map.set(name, acc)
    }
    return Array.from(map.entries())
      .map(([operador, acc]) => ({ operador, ...acc }))
      .sort((a, b) => b.total - a.total)
  }, [data])

  if (isLoading) {
    return (
      <span style={{ fontSize: 13, color: '#94A3B8' }}>Calculando métricas por operador...</span>
    )
  }

  if (rows.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)' }}>
        Sin datos para el período seleccionado.
      </p>
    )
  }

  const cols: { key: keyof RowAcc; label: string }[] = [
    { key: 'total', label: 'Total' },
    { key: 'no_cotizado', label: 'No Cotizados' },
    { key: 'en_cotizacion', label: 'En Cotización' },
    { key: 'cotizado', label: 'Cotizados' },
    { key: 'enviado_cliente', label: 'Enviados' },
    { key: 'concretado', label: 'Concretados' },
    { key: 'cancelado', label: 'Cancelados' },
  ]

  return (
    <div className="glass-card" style={{ padding: 24, borderRadius: 20, background: 'rgba(15,30,53,0.6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#F0F4FF', marginBottom: 4 }}>
            Metas por Operador
          </h4>
          <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)' }}>
            Desempeño comercial según el usuario que gestionó cada solicitud
          </p>
        </div>
        <TrendingUp size={18} style={{ color: '#F59E0B' }} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.9)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '10px 16px', fontWeight: 800 }}>Operador</th>
              {cols.map(c => (
                <th key={c.key} style={{ padding: '10px 16px', fontWeight: 800, textAlign: 'center' }}>{c.label}</th>
              ))}
              <th style={{ padding: '10px 16px', fontWeight: 800, textAlign: 'center' }}>Conversión</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const conversion = row.total > 0 ? Math.round((row.concretado / row.total) * 100) : 0
              return (
                <tr key={row.operador} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#F0F4FF' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <UserRound size={14} style={{ color: '#60A5FA' }} />
                      {row.operador}
                    </span>
                  </td>
                  {cols.map(c => (
                    <td
                      key={c.key}
                      style={{
                        padding: '12px 16px', fontSize: 13, textAlign: 'center',
                        fontWeight: c.key === 'total' ? 800 : 600,
                        color: c.key === 'concretado' ? '#34D399' : c.key === 'cancelado' ? '#F87171' : '#E2E8F0',
                      }}
                    >
                      {row[c.key]}
                    </td>
                  ))}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 800, padding: '3px 10px',
                        borderRadius: 99, color: getEstadoColor('concretado'),
                        background: 'rgba(52,211,153,0.1)',
                      }}
                    >
                      {conversion}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}