import { useState, useMemo } from 'react'
import { useQuotesList, queryKeys } from '@/hooks/useQuotesQuery'
import { DollarSign, Loader2, ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { updateQuoteDetails } from '@/lib/supabase'

type DesgloseItem = {
  quoteId: string
  servicioId: string
  ticketId: string
  cliente: string
  servicioDesc: string
  tipoServicio: string
  moneda: 'USD' | 'ARS'
  costo: number
  estado_venta: string
  fecha_vto: string
  estado_pago: 'pendiente' | 'pagado'
}

type TTOOData = {
  ttoo: string
  items: DesgloseItem[]
  totalPendienteUSD: number
  totalPendienteARS: number
  totalPagadoUSD: number
  totalPagadoARS: number
}

export function TTOOVencimientosBoard() {
  const { data: quotesResponse, isLoading } = useQuotesList()
  const quotes = quotesResponse?.data || []
  const queryClient = useQueryClient()
  
  const [filterVenta, setFilterVenta] = useState<string>('concretados') // 'all', 'concretados'
  const [filterPago, setFilterPago] = useState<string>('todos') // 'todos', 'pendiente', 'pagado'
  
  // Nuevos Filtros: TTOO y Rango de Fechas
  const [filterTTOO, setFilterTTOO] = useState<string>('todos')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  const [expandedTTOO, setExpandedTTOO] = useState<Record<string, boolean>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const toggleTTOO = (ttoo: string) => setExpandedTTOO(prev => ({ ...prev, [ttoo]: !prev[ttoo] }))

  const handleTogglePago = async (quoteId: string, servicioId: string, currentPago: string) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (!quote || !quote.pricing_detalles) return

    const newServicios = quote.pricing_detalles.servicios.map((s: any) => {
      if (s.id === servicioId) {
        return { ...s, estado_pago: currentPago === 'pagado' ? 'pendiente' : 'pagado' }
      }
      return s
    })

    setUpdatingId(servicioId)
    try {
      await updateQuoteDetails(quoteId, { pricing_detalles: { ...quote.pricing_detalles, servicios: newServicios } })
      await queryClient.invalidateQueries({ queryKey: queryKeys.allQuotes })
    } catch (error) {
      console.error("Error updating pago:", error)
      alert("Error al actualizar el estado de pago.")
    } finally {
      setUpdatingId(null)
    }
  }

  // Process data safely
  const { aggregatedData, metrics, availableTTOOs, expiringItems } = useMemo(() => {
    if (!quotes.length) return { aggregatedData: [], metrics: { pendUSD: 0, pendARS: 0, pagUSD: 0, pagARS: 0, proxVencerUSD: 0, proxVencerARS: 0 }, availableTTOOs: [], expiringItems: [] }

    const ttooMap: Record<string, TTOOData> = {}
    const m = { pendUSD: 0, pendARS: 0, pagUSD: 0, pagARS: 0, proxVencerUSD: 0, proxVencerARS: 0 }
    const uniqueTTOOs = new Set<string>()
    const expiringItems: (DesgloseItem & { ttoo: string, vtoDateObj: Date })[] = []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const in7Days = new Date(today)
    in7Days.setDate(today.getDate() + 7)

    const fromDateObj = dateFrom ? new Date(dateFrom + 'T00:00:00') : null
    const toDateObj = dateTo ? new Date(dateTo + 'T23:59:59') : null

    try {
      quotes.forEach(quote => {
        if (filterVenta === 'concretados' && quote.estado !== 'concretado') return
        
        const pricing = quote.pricing_detalles
        if (!pricing || !Array.isArray(pricing.servicios)) return

        const moneda = pricing.moneda || 'USD'

        pricing.servicios.forEach(serv => {
          if (!serv.ttoo || !serv.costo) return
          uniqueTTOOs.add(serv.ttoo)

          if (filterTTOO !== 'todos' && serv.ttoo !== filterTTOO) return

          const estadoPago = serv.estado_pago === 'pagado' ? 'pagado' : 'pendiente'
          if (filterPago !== 'todos' && estadoPago !== filterPago) return

          const ttooName = serv.ttoo
          const fechaVto = serv.fecha_vto_ttoo || 'Sin Fecha Asignada'
          const cost = Number(serv.costo) || 0

          let vtoDateObj: Date | null = null
          let isInDateRange = true

          // Date Parsing for Filtering and 7-Day Logic
          if (fechaVto !== 'Sin Fecha Asignada') {
            vtoDateObj = new Date(fechaVto);
            if (fechaVto.includes('-')) {
              const [y, mStr, d] = fechaVto.split('-')
              vtoDateObj = new Date(Number(y), Number(mStr) - 1, Number(d))
            } else if (fechaVto.includes('/')) {
              const [d, mStr, y] = fechaVto.split('/')
              vtoDateObj = new Date(Number(y), Number(mStr) - 1, Number(d))
            }
            if (!isNaN(vtoDateObj.getTime())) {
              vtoDateObj.setHours(0, 0, 0, 0)
              
              if (fromDateObj && vtoDateObj < fromDateObj) isInDateRange = false
              if (toDateObj && vtoDateObj > toDateObj) isInDateRange = false
            }
          } else {
             if (fromDateObj || toDateObj) isInDateRange = false
          }

          if (!isInDateRange) return

          if (!ttooMap[ttooName]) {
            ttooMap[ttooName] = { ttoo: ttooName, items: [], totalPendienteUSD: 0, totalPendienteARS: 0, totalPagadoUSD: 0, totalPagadoARS: 0 }
          }

          const itemObj: DesgloseItem = {
            quoteId: quote.id,
            servicioId: serv.id,
            ticketId: quote.ticket_id || 'S/N',
            cliente: `${quote.nombre || ''} ${quote.apellido || ''}`.trim() || 'Sin Nombre',
            servicioDesc: serv.descripcion || 'Sin descripción',
            tipoServicio: serv.tipo,
            moneda,
            costo: cost,
            estado_venta: quote.estado || 'desconocido',
            fecha_vto: fechaVto,
            estado_pago: estadoPago
          }

          // Accumulate Metrics
          if (estadoPago === 'pagado') {
            if (moneda === 'USD') { ttooMap[ttooName].totalPagadoUSD += cost; m.pagUSD += cost }
            else { ttooMap[ttooName].totalPagadoARS += cost; m.pagARS += cost }
          } else {
            if (moneda === 'USD') { ttooMap[ttooName].totalPendienteUSD += cost; m.pendUSD += cost }
            else { ttooMap[ttooName].totalPendienteARS += cost; m.pendARS += cost }

            // Check if expiring in 7 days
            if (vtoDateObj && !isNaN(vtoDateObj.getTime())) {
              if (vtoDateObj >= today && vtoDateObj <= in7Days) {
                if (moneda === 'USD') m.proxVencerUSD += cost
                else m.proxVencerARS += cost
                
                expiringItems.push({ ...itemObj, ttoo: ttooName, vtoDateObj })
              }
            }
          }

          ttooMap[ttooName].items.push(itemObj)
        })
      })
    } catch (err) {
      console.error('Error processing TTOO data:', err)
    }

    const dataArr = Object.values(ttooMap).sort((a, b) => a.ttoo.localeCompare(b.ttoo)).map(t => {
      t.items.sort((a, b) => {
        if (a.fecha_vto === 'Sin Fecha Asignada') return 1
        if (b.fecha_vto === 'Sin Fecha Asignada') return -1
        return a.fecha_vto.localeCompare(b.fecha_vto)
      })
      return t
    })

    expiringItems.sort((a, b) => a.vtoDateObj.getTime() - b.vtoDateObj.getTime())

    return { aggregatedData: dataArr, metrics: m, availableTTOOs: Array.from(uniqueTTOOs).sort(), expiringItems }
  }, [quotes, filterVenta, filterPago, filterTTOO, dateFrom, dateTo])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount)
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <DollarSign size={26} className="text-gold" /> Finanzas y Pagos TTOO
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.8)' }}>
            Centro de cuentas corrientes. Seguimiento de pagos a operadores.
          </p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', alignSelf: 'center', margin: '0 8px' }}>VENTAS</span>
            <button
              onClick={() => setFilterVenta('all')}
              style={{ 
                padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, transition: 'all 0.2s',
                background: filterVenta === 'all' ? 'rgba(245,158,11,0.15)' : 'transparent', color: filterVenta === 'all' ? '#FBBF24' : '#94A3B8'
              }}
            >Todas</button>
            <button
              onClick={() => setFilterVenta('concretados')}
              style={{ 
                padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, transition: 'all 0.2s',
                background: filterVenta === 'concretados' ? 'rgba(52,211,153,0.15)' : 'transparent', color: filterVenta === 'concretados' ? '#34D399' : '#94A3B8'
              }}
            >Concretadas</button>
          </div>

          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', alignSelf: 'center', margin: '0 8px' }}>PAGOS TTOO</span>
            <button
              onClick={() => setFilterPago('todos')}
              style={{ 
                padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, transition: 'all 0.2s',
                background: filterPago === 'todos' ? 'rgba(255,255,255,0.1)' : 'transparent', color: filterPago === 'todos' ? '#FFF' : '#94A3B8'
              }}
            >Todos</button>
            <button
              onClick={() => setFilterPago('pendiente')}
              style={{ 
                padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, transition: 'all 0.2s',
                background: filterPago === 'pendiente' ? 'rgba(248,113,113,0.15)' : 'transparent', color: filterPago === 'pendiente' ? '#F87171' : '#94A3B8'
              }}
            >Pendientes</button>
            <button
              onClick={() => setFilterPago('pagado')}
              style={{ 
                padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, transition: 'all 0.2s',
                background: filterPago === 'pagado' ? 'rgba(52,211,153,0.15)' : 'transparent', color: filterPago === 'pagado' ? '#34D399' : '#94A3B8'
              }}
            >Pagados</button>
          </div>

          {/* Filtro por Operador */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', margin: '0 8px' }}>OPERADOR</span>
            <select
              value={filterTTOO}
              onChange={(e) => setFilterTTOO(e.target.value)}
              className="input-dark"
              style={{ height: 32, minHeight: 32, fontSize: 12, padding: '0 12px', width: 140, border: 'none', background: 'rgba(0,0,0,0.2)' }}
            >
              <option value="todos">Todos los TTOO</option>
              {availableTTOOs.map(ttoo => (
                <option key={ttoo} value={ttoo}>{ttoo}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Rango de Fechas */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', margin: '0 8px' }}>VENCIMIENTO</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-dark"
              style={{ height: 32, minHeight: 32, fontSize: 12, padding: '0 8px', border: 'none', background: 'rgba(0,0,0,0.2)' }}
              title="Desde"
            />
            <span style={{ color: '#94A3B8', fontSize: 12 }}>a</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-dark"
              style={{ height: 32, minHeight: 32, fontSize: 12, padding: '0 8px', border: 'none', background: 'rgba(0,0,0,0.2)' }}
              title="Hasta"
            />
            {(dateFrom || dateTo) && (
              <button 
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                style={{ fontSize: 11, color: '#F87171', background: 'rgba(248,113,113,0.1)', padding: '4px 8px', borderRadius: 4 }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Total Deuda */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '4px solid #F87171' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#F87171' }}>
            <AlertCircle size={20} />
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>Total Deuda a TTOO</h3>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#F0F4FF' }}>{formatCurrency(metrics.pendUSD, 'USD')}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8' }}>{formatCurrency(metrics.pendARS, 'ARS')}</div>
          </div>
        </div>

        {/* Próximos a Vencer */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '4px solid #FBBF24' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#FBBF24' }}>
            <Clock size={20} />
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>Vencen Prox. 7 Días</h3>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#F0F4FF' }}>{formatCurrency(metrics.proxVencerUSD, 'USD')}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8' }}>{formatCurrency(metrics.proxVencerARS, 'ARS')}</div>
          </div>
        </div>

        {/* Total Pagado */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '4px solid #34D399' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#34D399' }}>
            <CheckCircle2 size={20} />
            <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>Pagos Realizados</h3>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#F0F4FF' }}>{formatCurrency(metrics.pagUSD, 'USD')}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8' }}>{formatCurrency(metrics.pagARS, 'ARS')}</div>
          </div>
        </div>
      </div>

      {/* Alerta de Vencimientos Próximos */}
      {expiringItems.length > 0 && filterPago !== 'pagado' && (
        <div className="glass-card" style={{ padding: 20, border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: '#FBBF24' }}>
            <AlertCircle size={20} />
            <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase' }}>Atención: Vencimientos en los próximos 7 días</h3>
          </div>
          <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(251,191,36,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ borderBottom: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.05)' }}>
                <tr>
                  <th style={{ padding: '12px', fontSize: 11, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase' }}>Fecha</th>
                  <th style={{ padding: '12px', fontSize: 11, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase' }}>Operador</th>
                  <th style={{ padding: '12px', fontSize: 11, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase' }}>Ticket / Cliente</th>
                  <th style={{ padding: '12px', fontSize: 11, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase' }}>Servicio</th>
                  <th style={{ padding: '12px', fontSize: 11, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
                  <th style={{ padding: '12px', fontSize: 11, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {expiringItems.map((item, i) => (
                  <tr key={`exp-${item.quoteId}-${i}`} style={{ borderBottom: i === expiringItems.length - 1 ? 'none' : '1px solid rgba(251,191,36,0.1)' }}>
                    <td style={{ padding: '12px', fontSize: 13, color: '#F0F4FF', fontWeight: 600 }}>{formatDate(item.fecha_vto)}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#F0F4FF', fontWeight: 700 }}>{item.ttoo}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: 13, color: '#F0F4FF', fontWeight: 600 }}>{item.ticketId}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.cliente}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#94A3B8' }}>
                      <span style={{ color: '#FBBF24', marginRight: 6, fontWeight: 600 }}>{item.tipoServicio}</span>
                      {item.servicioDesc}
                    </td>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 700, color: '#F87171', textAlign: 'right' }}>{formatCurrency(item.costo, item.moneda)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTogglePago(item.quoteId, item.servicioId, item.estado_pago)
                        }}
                        disabled={updatingId === item.servicioId}
                        style={{ 
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: 'rgba(248,113,113,0.15)', color: '#F87171', border: '1px solid rgba(248,113,113,0.3)',
                          cursor: updatingId === item.servicioId ? 'wait' : 'pointer', opacity: updatingId === item.servicioId ? 0.5 : 1, transition: 'all 0.2s',
                          display: 'inline-flex', alignItems: 'center', gap: 6
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                      >
                        {updatingId === item.servicioId && <Loader2 size={12} className="spin" />}
                        {updatingId === item.servicioId ? '...' : 'MARCAR PAGADO'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Board */}
      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 16px' }} />
          Calculando finanzas...
        </div>
      ) : aggregatedData.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          No se encontraron servicios que coincidan con los filtros.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {aggregatedData.map(ttooObj => (
            <div key={ttooObj.ttoo} className="glass-card" style={{ overflow: 'hidden' }}>
              
              {/* TTOO Header (Clickable to Expand) */}
              <button 
                onClick={() => toggleTTOO(ttooObj.ttoo)}
                style={{
                  width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: expandedTTOO[ttooObj.ttoo] ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {expandedTTOO[ttooObj.ttoo] ? <ChevronDown size={20} color="#FBBF24" /> : <ChevronRight size={20} color="#94A3B8" />}
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#F0F4FF' }}>{ttooObj.ttoo}</span>
                  <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}>
                    {ttooObj.items.length} {ttooObj.items.length === 1 ? 'servicio' : 'servicios'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  {/* Totales Pendientes */}
                  {(ttooObj.totalPendienteUSD > 0 || ttooObj.totalPendienteARS > 0) && (
                    <div style={{ textAlign: 'right', paddingRight: 16, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ display: 'block', fontSize: 11, color: '#F87171', textTransform: 'uppercase', fontWeight: 700 }}>Pendiente</span>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {ttooObj.totalPendienteUSD > 0 && <span style={{ fontSize: 16, fontWeight: 800, color: '#F0F4FF' }}>{formatCurrency(ttooObj.totalPendienteUSD, 'USD')}</span>}
                        {ttooObj.totalPendienteARS > 0 && <span style={{ fontSize: 16, fontWeight: 800, color: '#F0F4FF' }}>{formatCurrency(ttooObj.totalPendienteARS, 'ARS')}</span>}
                      </div>
                    </div>
                  )}
                  {/* Totales Pagados */}
                  {(ttooObj.totalPagadoUSD > 0 || ttooObj.totalPagadoARS > 0) && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: 11, color: '#34D399', textTransform: 'uppercase', fontWeight: 700 }}>Pagado</span>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {ttooObj.totalPagadoUSD > 0 && <span style={{ fontSize: 16, fontWeight: 800, color: '#F0F4FF' }}>{formatCurrency(ttooObj.totalPagadoUSD, 'USD')}</span>}
                        {ttooObj.totalPagadoARS > 0 && <span style={{ fontSize: 16, fontWeight: 800, color: '#F0F4FF' }}>{formatCurrency(ttooObj.totalPagadoARS, 'ARS')}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </button>

              {/* TTOO Body (Tabla Consolidada) */}
              {expandedTTOO[ttooObj.ttoo] && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', background: 'rgba(0,0,0,0.1)' }}>
                  <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', background: '#0B1728' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <tr>
                          <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Vencimiento</th>
                          <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Servicio</th>
                          <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Ticket / Cliente</th>
                          <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center' }}>Estado Venta</th>
                          <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'center' }}>Pago TTOO</th>
                          <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ttooObj.items.map((item, i) => {
                          const isPendiente = item.estado_pago === 'pendiente';
                          return (
                          <tr key={`${item.quoteId}-${i}`} style={{ borderBottom: i === ttooObj.items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: item.fecha_vto === 'Sin Fecha Asignada' ? '#F87171' : '#E2E8F0', fontWeight: 600 }}>
                              {item.fecha_vto === 'Sin Fecha Asignada' ? item.fecha_vto : formatDate(item.fecha_vto)}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#94A3B8' }}>
                              <span style={{ color: '#FBBF24', marginRight: 6, fontWeight: 600 }}>{item.tipoServicio}</span>
                              {item.servicioDesc}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontSize: 13, color: '#F0F4FF', fontWeight: 600 }}>{item.ticketId}</div>
                              <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.cliente}</div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span style={{ 
                                padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                background: item.estado_venta === 'concretado' ? 'rgba(52,211,153,0.1)' : 'rgba(148,163,184,0.1)',
                                color: item.estado_venta === 'concretado' ? '#34D399' : '#94A3B8'
                              }}>
                                {item.estado_venta.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTogglePago(item.quoteId, item.servicioId, item.estado_pago)
                                }}
                                disabled={updatingId === item.servicioId}
                                style={{ 
                                  padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                  background: isPendiente ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)',
                                  color: isPendiente ? '#F87171' : '#34D399',
                                  border: '1px solid ' + (isPendiente ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'),
                                  cursor: updatingId === item.servicioId ? 'wait' : 'pointer',
                                  opacity: updatingId === item.servicioId ? 0.5 : 1,
                                  display: 'inline-flex', alignItems: 'center', gap: 6,
                                  transition: 'all 0.2s'
                                }}
                                title="Clic para cambiar el estado de pago"
                                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                              >
                                {updatingId === item.servicioId && <Loader2 size={12} className="spin" />}
                                {isPendiente ? 'PENDIENTE' : 'PAGADO'}
                              </button>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: item.moneda === 'USD' ? '#34D399' : '#60A5FA', textAlign: 'right' }}>
                              {formatCurrency(item.costo, item.moneda)}
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
