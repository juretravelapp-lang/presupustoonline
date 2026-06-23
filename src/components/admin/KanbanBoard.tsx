import { useState } from 'react'
import { type TravelQuoteRow, type HistorialEstado, type CrmMeeting } from '@/lib/supabase'
import { useQuotesList, useUpdateQuoteStatus, useDeleteQuote } from '@/hooks/useQuotesQuery'
import { useAuthStore } from '@/stores/authStore'
import { QuoteDetailModal } from './QuoteDetailModal'
import { motion, AnimatePresence } from 'motion/react'
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors, type DragStartEvent, type DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Search,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  User,
  Calendar,
  Trash2,
  Phone,
} from 'lucide-react'

const COLUMNS: { id: TravelQuoteRow['estado']; label: string; emoji: string; color: string; bg: string }[] = [
  { id: 'no_cotizado',     label: 'No Cotizado',     emoji: '📋', color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' },
  { id: 'en_cotizacion',   label: 'En Cotización',   emoji: '⚙️', color: '#FB923C', bg: 'rgba(251,146,60,0.08)' },
  { id: 'cotizado',        label: 'Cotizado',        emoji: '💰', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)' },
  { id: 'enviado_cliente', label: 'Enviado Cliente',  emoji: '📨', color: '#60A5FA', bg: 'rgba(96,165,250,0.08)' },
  { id: 'concretado',      label: 'Concretado',      emoji: '✅', color: '#34D399', bg: 'rgba(52,211,153,0.08)' },
  { id: 'cancelado',       label: 'Cancelado',       emoji: '❌', color: '#F87171', bg: 'rgba(248,113,113,0.08)' },
]

export function KanbanBoard() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [selectedQuote, setSelectedQuote] = useState<TravelQuoteRow | null>(null)
  
  // Mobile active column view (only used on mobile viewports)
  const [activeMobileCol, setActiveMobileCol] = useState<TravelQuoteRow['estado']>('no_cotizado')

  /* ── Fetch data ─────────────────────────────────────────────── */
  const { data: quotesData, isLoading, refetch } = useQuotesList({ limit: 100 })
  const quotes = quotesData?.data || []

  const updateStatusMutation = useUpdateQuoteStatus()
  const deleteQuoteMutation = useDeleteQuote()

  /* ── Drag & Drop State ────────────────────────────────────────── */
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const activeDragQuote = activeDragId ? quotes.find(q => q.id === activeDragId) : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = event
    if (!over) return

    const activeQuoteId = active.id as string
    const overId = over.id as string

    // Find the quote
    const quote = quotes.find(q => q.id === activeQuoteId)
    if (!quote) return

    // If dropped over a column id
    const targetStatus = COLUMNS.find(c => c.id === overId)?.id
    // If dropped over another item, its sortable data might contain the status
    // Actually we will set the column id as the droppable id.
    
    // In Kanban, we'll let SortableContext items also act as droppable targets. 
    // If we drop on an item, we look up its status
    let newStatus: TravelQuoteRow['estado'] | undefined = targetStatus
    if (!newStatus) {
      const overQuote = quotes.find(q => q.id === overId)
      if (overQuote) newStatus = overQuote.estado
    }

    if (newStatus && newStatus !== quote.estado) {
      moveCard(quote, newStatus)
    }
  }

  /* ── Move Quote ─────────────────────────────────────────────── */
  const moveCard = async (quote: TravelQuoteRow, newStatus: TravelQuoteRow['estado']) => {
    try {
      await updateStatusMutation.mutateAsync({ id: quote.id, status: newStatus })
      // Note: if you want to save history as well, you can still call updateQuoteDetails
      const { updateQuoteDetails } = await import('@/lib/supabase')
      const historyRecord: HistorialEstado = {
        estado: newStatus,
        fecha: new Date().toISOString(),
        usuario: user?.email || 'Agente',
      }
      const newHistory = [...(quote.historial || []), historyRecord]
      await updateQuoteDetails(quote.id, { historial: newHistory })
    } catch (err) {
      console.error('Failed to move quote:', err)
      alert('Error al mover cotización')
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm('¿Estás seguro de eliminar esta solicitud permanentemente?')) return

    try {
      await deleteQuoteMutation.mutateAsync(id)
    } catch (err) {
      console.error(err)
      alert('Error al eliminar')
    }
  }

  /* ── Filter quotes ──────────────────────────────────────────── */
  const filtered = quotes.filter(q => {
    const query = search.toLowerCase()
    return (
      q.nombre.toLowerCase().includes(query) ||
      q.apellido.toLowerCase().includes(query) ||
      q.email.toLowerCase().includes(query) ||
      q.destino?.toLowerCase().includes(query) ||
      q.operador_nombre?.toLowerCase().includes(query) ||
      (q.destino_personalizado && q.destino_personalizado.toLowerCase().includes(query)) ||
      (q.ticket_id && q.ticket_id.toLowerCase().includes(query))
    )
  })

  /* ── Pricing calculations ───────────────────────────────────── */
  const calculateFinalPrice = (details: import('@/lib/supabase').PricingDetalles | null | undefined) => {
    if (!details) return 0;
    
    // Support legacy calculation if only proveedores exist and no services
    if (details.proveedor_seleccionado && (!details.servicios || details.servicios.length === 0)) {
        const prov = details.proveedores?.find(p => p.nombre === details.proveedor_seleccionado)
        return prov?.precio_final || 0
    }

    // New services calculation
    if (details.servicios && details.servicios.length > 0) {
        const totalCosto = details.servicios.reduce((acc, s) => acc + s.costo, 0);
        const markup = details.markup_tipo === 'porcentaje' ? totalCosto * (details.markup_valor / 100) : details.markup_valor;
        return totalCosto + markup;
    }

    return 0;
  }

  const getColumnTotals = (colId: TravelQuoteRow['estado']) => {
    const colQuotes = filtered.filter(q => q.estado === colId)
    let usd = 0
    let ars = 0

    colQuotes.forEach(q => {
      const details = q.pricing_detalles
      if (details) {
        const price = calculateFinalPrice(details)
        if (price > 0) {
            if (details.moneda === 'USD') usd += price
            if (details.moneda === 'ARS') ars += price
        }
      }
    })

    return { usd, ars }
  }

  const getQuotePriceText = (quote: TravelQuoteRow) => {
    const details = quote.pricing_detalles
    if (details) {
      const price = calculateFinalPrice(details)
      if (price > 0) {
        const symbol = details.moneda === 'USD' ? 'USD $' : 'ARS $'
        return `${symbol}${price.toLocaleString()}`
      }
    }
    return 'Sin cotizar'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      
      {/* ── Header Filters ───────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Bandeja de Solicitudes
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)' }}>Gestión visual de leads mediante embudo comercial</p>
        </div>

        <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: '420px', flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(100,116,139,0.7)' }} />
            <input
              type="text"
              placeholder="Buscar por ticket, cliente, destino u operador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-dark"
              style={{ paddingLeft: 38, height: 44, minHeight: 44 }}
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            style={{
              width: 44, height: 44, borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)', color: '#F0F4FF',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
            title="Refrescar datos"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Mobile Tab Navigation (sm:hidden) ────────────────────── */}
      <div className="flex sm:hidden overflow-x-auto gap-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {COLUMNS.map(col => {
          const isActive = activeMobileCol === col.id
          const count = filtered.filter(q => q.estado === col.id).length
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileCol(col.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 14px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                background: isActive ? col.color : 'rgba(255,255,255,0.03)',
                color: isActive ? '#0A1526' : 'rgba(148,163,184,0.8)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{col.emoji} {col.label}</span>
              <span style={{
                background: isActive ? 'rgba(10,21,38,0.2)' : 'rgba(255,255,255,0.08)',
                padding: '1px 6px',
                borderRadius: 99,
                fontSize: 10,
              }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* ── Columns Layout ───────────────────────────────────────── */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 16,
            alignItems: 'flex-start',
          }}
          className="hidden sm:grid"
        >
          {COLUMNS.map(col => {
            const colQuotes = filtered.filter(q => q.estado === col.id)
            const totals = getColumnTotals(col.id)
            return (
              <DroppableColumn key={col.id} col={col} totals={totals} colQuotes={colQuotes} isLoading={isLoading}>
                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ height: 100, background: 'rgba(255,255,255,0.03)', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 100, background: 'rgba(255,255,255,0.03)', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />
                  </div>
                ) : (
                  <SortableContext items={colQuotes.map(q => q.id)} strategy={verticalListSortingStrategy}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100 }}>
                      <AnimatePresence>
                        {colQuotes.map((q, idx) => (
                            <SortableKanbanCard
                              key={q.id}
                              quote={q}
                              priceText={getQuotePriceText(q)}
                              index={idx}
                              onSelect={() => setSelectedQuote(q)}
                              onMove={moveCard}
                              onDelete={handleDelete}
                            />
                        ))}
                      </AnimatePresence>
                      {colQuotes.length === 0 && (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: 'rgba(100,116,139,0.5)', fontSize: 11, border: '1px dashed rgba(255,255,255,0.04)', borderRadius: 12 }}>
                          Arrastrá aquí
                        </div>
                      )}
                    </div>
                  </SortableContext>
                )}
              </DroppableColumn>
            )
          })}
        </div>

        <DragOverlay>
          {activeDragQuote ? (
            <KanbanCard
              quote={activeDragQuote}
              priceText={getQuotePriceText(activeDragQuote)}
              index={0}
              onSelect={() => {}}
              onMove={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── Mobile Vertical View (sm:hidden) ─────────────────────── */}
      <div className="flex sm:hidden flex-col gap-10">
        {(() => {
          const col = COLUMNS.find(c => c.id === activeMobileCol)!
          const colQuotes = filtered.filter(q => q.estado === col.id)
          const totals = getColumnTotals(col.id)
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Financial aggregates */}
              <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: 'rgba(148,163,184,0.8)' }}>Ingresos Estimados:</span>
                <div style={{ display: 'flex', gap: 12, fontWeight: 800 }}>
                  <span style={{ color: '#FBBF24' }}>USD: ${totals.usd.toLocaleString()}</span>
                  <span style={{ color: '#60A5FA' }}>ARS: ${totals.ars.toLocaleString()}</span>
                </div>
              </div>

              {/* Mobile Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {isLoading ? (
                  <>
                    <div style={{ height: 120, background: 'rgba(255,255,255,0.03)', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: 120, background: 'rgba(255,255,255,0.03)', borderRadius: 14, animation: 'pulse 1.5s infinite' }} />
                  </>
                ) : (
                  <>
                    {colQuotes.map((q, idx) => (
                      <KanbanCard
                        key={q.id}
                        quote={q}
                        priceText={getQuotePriceText(q)}
                        index={idx}
                        onSelect={() => setSelectedQuote(q)}
                        onMove={moveCard}
                        onDelete={handleDelete}
                        isMobileView
                      />
                    ))}
                    {colQuotes.length === 0 && (
                      <div style={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(100,116,139,0.5)', fontSize: 13 }}>
                        No hay solicitudes en esta columna.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* ── Detail CRM Modal ─────────────────────────────────────── */}
      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={() => { setSelectedQuote(null); refetch() }}
          onStatusChange={(newStatus) => moveCard(selectedQuote, newStatus)}
        />
      )}

    </div>
  )
}

/* ─── Inner Card Component ───────────────────────────────────────── */
interface CardProps {
  quote: TravelQuoteRow
  priceText: string
  index: number
  onSelect: () => void
  onMove: (q: TravelQuoteRow, newStatus: TravelQuoteRow['estado']) => void
  onDelete: (e: React.MouseEvent, id: string) => void
  isMobileView?: boolean
  nextMeeting?: CrmMeeting | null
}

function KanbanCard({ quote, priceText, index, onSelect, onMove, onDelete, nextMeeting }: CardProps) {
  const allDestinos = [...quote.destinos, ...(quote.destino_personalizado ? quote.destino_personalizado.split(',') : [])]
  const curIdx = COLUMNS.findIndex(c => c.id === quote.estado)

  // Use meeting from crm_meetings if available, fallback to legacy field
  const meetingDate = nextMeeting?.fecha_inicio || quote.reunion_fecha
  const meetingEstado = nextMeeting?.estado || quote.reunion_estado
  const meetingTitle = nextMeeting?.titulo || null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={onSelect}
      style={{
        padding: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1.5px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
    >
      {/* Name and delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {quote.ticket_id && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(201,169,110,0.9)', letterSpacing: '0.05em' }}>
              {quote.ticket_id}
            </span>
          )}
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF', lineHeight: 1.2 }}>
            {quote.nombre} {quote.apellido}
          </h4>
        </div>
        <button
          onClick={(e) => onDelete(e, quote.id)}
          style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 2, display: 'flex', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,113,113,0.5)')}
          title="Eliminar"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Destination badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {allDestinos.slice(0, 2).map((d, i) => (
          <span key={i} style={{ fontSize: 9, fontWeight: 700, background: 'rgba(245,158,11,0.06)', color: '#FBBF24', padding: '1px 6px', borderRadius: 99 }}>
            📍 {d.trim().replace(/_/g, ' ')}
          </span>
        ))}
        {allDestinos.length > 2 && (
          <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.7)', padding: '1px 6px', borderRadius: 99 }}>
            +{allDestinos.length - 2}
          </span>
        )}
      </div>

      {/* Price tag & passengers count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'rgba(148,163,184,0.7)', fontWeight: 600 }}>
        <span>👥 {quote.adultos + quote.ninos_2_12 + quote.bebes_0_2} pax</span>
        <span style={{ color: priceText !== 'Sin cotizar' ? '#34D399' : 'rgba(148,163,184,0.6)', fontWeight: 800 }}>
          {priceText}
        </span>
      </div>

      {/* Meeting Indicator (from crm_meetings or legacy) */}
      {meetingDate && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, fontSize: 10,
          background: meetingEstado === 'realizada' ? 'rgba(52,211,153,0.08)' : meetingEstado === 'cancelada' ? 'rgba(248,113,113,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${meetingEstado === 'realizada' ? 'rgba(52,211,153,0.18)' : meetingEstado === 'cancelada' ? 'rgba(248,113,113,0.18)' : 'rgba(245,158,11,0.18)'}`,
          color: meetingEstado === 'realizada' ? '#34D399' : meetingEstado === 'cancelada' ? '#F87171' : '#FBBF24',
          padding: '3px 8px', borderRadius: 8, fontWeight: 700,
        }}>
          <Calendar size={11} />
          <span>{meetingTitle ? `${meetingTitle} · ` : 'Cita: '}{new Date(meetingDate).toLocaleDateString('es-AR')} {new Date(meetingDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
          <span style={{ fontSize: 9, opacity: 0.7 }}>({meetingEstado})</span>
        </div>
      )}

      {/* Operator label */}
      {quote.operador_nombre && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'rgba(100,116,139,1)', fontWeight: 600, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
          <User size={10} style={{ color: '#60A5FA' }} />
          <span>Vendido por: <strong>{quote.operador_nombre}</strong></span>
        </div>
      )}

      {/* Shift Column Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: 8,
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => onMove(quote, COLUMNS[curIdx - 1].id)}
          disabled={curIdx <= 0}
          className="counter-btn"
          style={{ width: 26, height: 26, fontSize: 12, borderRadius: 6 }}
          title="Mover a columna anterior"
        >
          <ArrowLeft size={12} />
        </button>
        
        {/* Quick WhatsApp Link */}
        <a
          href={`https://wa.me/${quote.celular.replace(/[^\d]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: 26, height: 26, borderRadius: 6, border: '1.5px solid rgba(52,211,153,0.15)',
            background: 'rgba(52,211,153,0.05)', color: '#34D399',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.05)')}
          title="Contactar WhatsApp"
        >
          <Phone size={12} />
        </a>

        <button
          onClick={() => onMove(quote, COLUMNS[curIdx + 1].id)}
          disabled={curIdx >= COLUMNS.length - 1}
          className="counter-btn"
          style={{ width: 26, height: 26, fontSize: 12, borderRadius: 6 }}
          title="Mover a columna siguiente"
        >
          <ArrowRight size={12} />
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Drag & Drop Wrapper Components ─────────────────────────────── */

import { useDroppable } from '@dnd-kit/core'

function DroppableColumn({ col, totals, colQuotes, children }: any) {
  const { setNodeRef } = useDroppable({ id: col.id })
  return (
    <div
      ref={setNodeRef}
      style={{
        background: 'rgba(15,30,53,0.4)',
        border: '1.5px solid rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: '60vh',
      }}
    >
      {/* Column header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 16 }}>{col.emoji}</span>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: col.color }}>{col.label}</h3>
          <span style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 7px',
            borderRadius: 99,
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(148,163,184,0.8)',
          }}>{colQuotes.length}</span>
        </div>
        {/* Aggregated Totals per column */}
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 10, color: 'rgba(148,163,184,0.6)', fontWeight: 600, marginTop: 4 }}>
          {totals.usd > 0 && <span style={{ color: '#FBBF24' }}>USD: ${totals.usd.toLocaleString()}</span>}
          {totals.ars > 0 && <span style={{ color: '#60A5FA' }}>ARS: ${totals.ars.toLocaleString()}</span>}
          {totals.usd === 0 && totals.ars === 0 && <span>$0.00</span>}
        </div>
      </div>
      
      {/* Cards List (children) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '55vh', overflowY: 'auto', paddingRight: 2 }}>
        {children}
      </div>
    </div>
  )
}

function SortableKanbanCard(props: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.quote.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard {...props} />
    </div>
  )
}
