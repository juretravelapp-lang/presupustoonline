import { useMemo, useState } from 'react'
import { usePagos, useUpdatePago, useDeletePago } from '@/hooks/usePagosQuery'
import type { CrmPago } from '@/lib/supabase'
import {
  CreditCard, Loader2, Trash2, CheckCircle, AlertTriangle, Search, Wallet, DollarSign, ArrowUpDown,
} from 'lucide-react'

const ESTADO_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'pagado', label: 'Pagados' },
  { id: 'cancelado', label: 'Cancelados' },
] as const

type EstadoFilter = (typeof ESTADO_FILTERS)[number]['id']

const ESTADO_COLOR: Record<string, string> = { pendiente: '#FBBF24', pagado: '#34D399', cancelado: '#F87171' }

const FORMA_LABEL: Record<string, string> = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta de Crédito',
  tarjeta_debito: 'Tarjeta de Débito',
  mercado_pago: 'Mercado Pago',
  otro: 'Otro',
}

function money(n: number): string {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PagosBoard() {
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos')
  const [monedaFilter, setMonedaFilter] = useState<'todas' | 'ARS' | 'USD'>('todas')
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  const { data: pagos, isLoading, refetch } = usePagos({
    fecha_desde: filtroFechaDesde || undefined,
    fecha_hasta: filtroFechaHasta || undefined
  })

  const hoy = new Date().toISOString().slice(0, 10)

  const resumen = useMemo(() => {
    const list = pagos || []
    const r = {
      cobradoARS: 0, cobradoUSD: 0, pendienteARS: 0, pendienteUSD: 0, vencidos: 0,
    }
    const vencidos: CrmPago[] = []
    for (const p of list) {
      if (p.estado === 'pagado') {
        if (p.moneda === 'ARS') r.cobradoARS += p.monto
        else r.cobradoUSD += p.monto
      } else if (p.estado === 'pendiente') {
        if (p.moneda === 'ARS') r.pendienteARS += p.monto
        else r.pendienteUSD += p.monto
        if (p.fecha_vencimiento && p.fecha_vencimiento < hoy) {
          r.vencidos++
          vencidos.push(p)
        }
      }
    }
    return { ...r, vencidos }
  }, [pagos, hoy])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (pagos || [])
      .filter((p) => estadoFilter === 'todos' || p.estado === estadoFilter)
      .filter((p) => monedaFilter === 'todas' || p.moneda === monedaFilter)
      .filter((p) => {
        if (!q) return true
        return `${p.cliente_nombre || ''} ${p.travel_quotes?.nombre || ''} ${p.travel_quotes?.apellido || ''} ${p.ticket_id || p.travel_quotes?.ticket_id || ''} ${p.concepto || ''} ${p.crm_quote_services?.nombre || ''} ${p.estado || ''}`.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        const va = a.fecha_vencimiento || a.created_at
        const vb = b.fecha_vencimiento || b.created_at
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
  }, [pagos, estadoFilter, monedaFilter, search, sortDir])

  const marcarPagado = async (p: CrmPago) => {
    try {
      await updatePago.mutateAsync({
        id: p.id,
        updates: { estado: 'pagado', fecha_pago: p.fecha_pago || hoy },
      })
      refetch()
    } catch (err) {
      console.error(err)
      alert('Error al marcar como pagado')
    }
  }

  const eliminar = async (p: CrmPago) => {
    if (!window.confirm(`¿Eliminar el pago "${p.concepto}" de ${p.cliente_nombre || ''}?`)) return
    try {
      await deletePago.mutateAsync(p.id)
      refetch()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar el pago')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={24} className="text-gold" /> Estados de Pagos
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Cobros por cotización en pesos o dólares, cuotas y alertas de vencimientos.
          </p>
        </div>
      </div>

      {/* Alerts de vencidos */}
      {resumen.vencidos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, background: 'rgba(248,113,113,0.08)', border: '1.5px solid rgba(248,113,113,0.35)', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#F87171' }}>
            <AlertTriangle size={16} />
            {resumen.vencidos.length} pago{resumen.vencidos.length > 1 ? 's' : ''} vencido{resumen.vencidos.length > 1 ? 's' : ''} sin cobrar
          </div>
          {resumen.vencidos.slice(0, 5).map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span style={{ color: '#F0F4FF', fontWeight: 600 }}>
                {p.cliente_nombre || 'Sin cliente'} · {p.ticket_id || ''} · {p.concepto}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#F87171', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  {p.moneda === 'ARS' ? '$' : 'u$s'} {money(p.monto)} · venció {new Date(p.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}
                </span>
                <button
                  onClick={() => marcarPagado(p)}
                  title="Marcar como pagado"
                  style={{ background: 'none', border: 'none', color: '#34D399', cursor: 'pointer', padding: 2, display: 'flex' }}
                >
                  <CheckCircle size={15} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Cobrado ARS', value: `$${money(resumen.cobradoARS)}`, color: '#34D399', bg: 'rgba(52,211,153,0.08)', icon: DollarSign },
          { label: 'Cobrado USD', value: `u$s ${money(resumen.cobradoUSD)}`, color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', icon: Wallet },
          { label: 'Pendiente ARS', value: `$${money(resumen.pendienteARS)}`, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', icon: DollarSign },
          { label: 'Pendiente USD', value: `u$s ${money(resumen.pendienteUSD)}`, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', icon: Wallet },
          { label: 'Vencidos', value: String(resumen.vencidos), color: '#F87171', bg: 'rgba(248,113,113,0.08)', icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 8, background: s.bg, border: `1px solid ${s.color}33` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
              <s.icon size={15} style={{ color: s.color }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ESTADO_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setEstadoFilter(f.id)}
              className={`option-chip ${estadoFilter === f.id ? 'selected' : ''}`}
              style={{ height: 34, padding: '0 12px', fontSize: 11 }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={monedaFilter}
          onChange={(e) => setMonedaFilter(e.target.value as 'todas' | 'ARS' | 'USD')}
          className="input-dark"
          style={{ height: 36, minHeight: 36, width: 110, fontSize: 12 }}
        >
          <option value="todas">Todas</option>
          <option value="ARS">ARS</option>
          <option value="USD">USD</option>
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.6)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, ticket, concepto o estado..."
            className="input-dark"
            style={{ height: 38, minHeight: 38, paddingLeft: 34, fontSize: 12, width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Desde:</span>
          <input 
            type="date" 
            className="input-dark" 
            style={{ width: 130, height: 36, fontSize: 12, padding: '0 8px' }} 
            value={filtroFechaDesde} 
            onChange={e => setFiltroFechaDesde(e.target.value)} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hasta:</span>
          <input 
            type="date" 
            className="input-dark" 
            style={{ width: 130, height: 36, fontSize: 12, padding: '0 8px' }} 
            value={filtroFechaHasta} 
            onChange={e => setFiltroFechaHasta(e.target.value)} 
          />
        </div>
        <button
          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 12px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#94A3B8', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          title="Cambiar orden por vencimiento"
        >
          <ArrowUpDown size={13} />
          {sortDir === 'asc' ? 'Próximos' : 'Últimos'}
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8', fontSize: 14 }}>
          <Loader2 className="animate-spin" size={18} /> Cargando pagos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No se encontraron pagos con los filtros aplicados.
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 110px 120px 130px 100px', gap: 12, fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10, marginBottom: 4 }}>
            <span>Cliente / Ticket</span>
            <span>Concepto</span>
            <span>Monto</span>
            <span>Estado</span>
            <span>Vencimiento</span>
            <span></span>
          </div>
          {filtered.map((p) => {
            const vencido = p.estado === 'pendiente' && p.fecha_vencimiento && p.fecha_vencimiento < hoy
            return (
              <div
                key={p.id}
                style={{
                  padding: '12px 16px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 110px 120px 130px 100px', gap: 12, alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: vencido ? 'rgba(248,113,113,0.05)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF' }}>
                    {p.cliente_nombre || (p.travel_quotes ? `${p.travel_quotes.nombre} ${p.travel_quotes.apellido}` : '—')}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.ticket_id || p.travel_quotes?.ticket_id || ''}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1' }}>{p.concepto}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {p.crm_quote_services?.nombre ? `Servicio: ${p.crm_quote_services.nombre}` : (p.forma_pago ? FORMA_LABEL[p.forma_pago] || p.forma_pago : '')}
                    {p.es_cuota && p.cuota_numero ? ` · Cuota ${p.cuota_numero}${p.cuota_total ? `/${p.cuota_total}` : ''}` : ''}
                  </span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color: vencido ? '#F87171' : '#F0F4FF', whiteSpace: 'nowrap' }}>
                  {p.moneda === 'ARS' ? '$' : 'u$s'} {money(p.monto)}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 800, textTransform: 'uppercase', textAlign: 'center',
                  color: ESTADO_COLOR[p.estado], background: `${ESTADO_COLOR[p.estado]}14`,
                  padding: '4px 8px', borderRadius: 99, justifySelf: 'start',
                }}>
                  {p.estado}
                </span>
                <span style={{ fontSize: 11, color: vencido ? '#F87171' : 'var(--text-muted)', fontWeight: vencido ? 800 : 400, whiteSpace: 'nowrap' }}>
                  {p.fecha_vencimiento
                    ? `${new Date(p.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}${vencido ? ' ⚠' : ''}`
                    : '—'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  {p.estado === 'pendiente' && (
                    <button
                      onClick={() => marcarPagado(p)}
                      title="Marcar como pagado"
                      style={{ background: 'none', border: 'none', color: '#34D399', cursor: 'pointer', padding: 4, display: 'flex' }}
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => eliminar(p)}
                    title="Eliminar"
                    style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 4, display: 'flex' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
