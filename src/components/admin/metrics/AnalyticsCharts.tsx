import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Loader2 } from 'lucide-react'
import type { TravelQuoteRow } from '@/lib/supabase'

interface AnalyticsChartsProps {
  data: Partial<TravelQuoteRow>[]
  isLoading: boolean
}

// Colors for the charts matching the app theme
const COLORS = ['#F59E0B', '#34D399', '#60A5FA', '#F87171', '#A78BFA', '#FBBF24']
const FUNNEL_COLORS = {
  no_cotizado: '#94A3B8',
  en_cotizacion: '#FB923C',
  cotizado: '#FBBF24',
  enviado_cliente: '#818CF8',
  concretado: '#34D399',
  cancelado: '#F87171',
}

export function AnalyticsCharts({ data, isLoading }: AnalyticsChartsProps) {
  
  const funnelData = useMemo(() => {
    if (!data.length) return []
    const counts: Record<string, number> = {
      no_cotizado: 0,
      en_cotizacion: 0,
      cotizado: 0,
      enviado_cliente: 0,
      concretado: 0,
    }
    data.forEach(q => {
      if (q.estado && counts[q.estado] !== undefined) {
        counts[q.estado]++
      }
    })
    return [
      { name: 'Nuevos', value: counts.no_cotizado, fill: FUNNEL_COLORS.no_cotizado },
      { name: 'Cotizando', value: counts.en_cotizacion, fill: FUNNEL_COLORS.en_cotizacion },
      { name: 'Cotizados', value: counts.cotizado, fill: FUNNEL_COLORS.cotizado },
      { name: 'Enviados', value: counts.enviado_cliente, fill: FUNNEL_COLORS.enviado_cliente },
      { name: 'Concretados', value: counts.concretado, fill: FUNNEL_COLORS.concretado },
    ]
  }, [data])

  const destinationsData = useMemo(() => {
    if (!data.length) return []
    const counts: Record<string, number> = {}
    data.forEach(q => {
      if (q.destinos && Array.isArray(q.destinos)) {
        q.destinos.forEach(d => {
          counts[d] = (counts[d] || 0) + 1
        })
      }
    })
    
    // Sort and take top 6
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' ').toUpperCase(), value }))
    return sorted
  }, [data])

  const monthsData = useMemo(() => {
    if (!data.length) return []
    const counts: Record<string, number> = {}
    data.forEach(q => {
      let mes = 'No especificado'
      if (q.mes_preferido) {
        mes = q.mes_preferido
      } else if (q.fecha_salida) {
        const d = new Date(q.fecha_salida)
        mes = d.toLocaleString('es-ES', { month: 'short' })
        mes = mes.charAt(0).toUpperCase() + mes.slice(1)
      }
      counts[mes] = (counts[mes] || 0) + 1
    })
    // Sort by count descending
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
    return sorted
  }, [data])

  if (isLoading) {
    return (
      <div style={{ padding: 40, display: 'flex', justifyContent: 'center', color: 'rgba(148,163,184,0.8)' }}>
        <Loader2 className="animate-spin" size={24} /> <span style={{ marginLeft: 10 }}>Cargando gráficas...</span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'rgba(148,163,184,0.6)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
        No hay datos suficientes para mostrar gráficas en este rango de fechas.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
      {/* Funnel de Ventas */}
      <div className="glass-card" style={{ padding: 20, borderRadius: 20, background: 'rgba(15,30,53,0.6)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#F0F4FF', marginBottom: 16 }}>Embudo de Ventas</h4>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ background: '#0F1E35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F0F4FF' }}
                itemStyle={{ color: '#F59E0B', fontWeight: 700 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Destinos */}
      <div className="glass-card" style={{ padding: 20, borderRadius: 20, background: 'rgba(15,30,53,0.6)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#F0F4FF', marginBottom: 16 }}>Destinos Top</h4>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={destinationsData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {destinationsData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ background: '#0F1E35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F0F4FF' }}
                itemStyle={{ color: '#F59E0B', fontWeight: 700 }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, color: 'rgba(148,163,184,0.8)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Meses / Temporada */}
      <div className="glass-card" style={{ padding: 20, borderRadius: 20, background: 'rgba(15,30,53,0.6)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#F0F4FF', marginBottom: 16 }}>Temporada Alta</h4>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(148,163,184,0.8)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ background: '#0F1E35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F0F4FF' }}
                itemStyle={{ color: '#34D399', fontWeight: 700 }}
              />
              <Bar dataKey="value" fill="#34D399" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
