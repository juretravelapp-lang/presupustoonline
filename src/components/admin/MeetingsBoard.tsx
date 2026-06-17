import { useState, useEffect, useCallback } from 'react'
import { getMeetingsByDateRange, type CrmMeeting } from '@/lib/supabase'
import { MeetingFormModal } from './MeetingFormModal'
import { motion, AnimatePresence } from 'motion/react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  RefreshCw,
  Eye,
} from 'lucide-react'

type ViewMode = 'day' | 'week' | 'month'

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_ES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const ESTADO_COLORS: Record<string, string> = {
  pendiente: '#FBBF24',
  realizada: '#34D399',
  cancelada: '#F87171',
  reprogramada: '#60A5FA',
}

const TIPO_ICONS: Record<string, typeof MapPin> = {
  presencial: MapPin,
  videollamada: Video,
  telefonica: Phone,
}

/* ── Helpers ────────────────────────────────────────────────────── */
function startOfDay(d: Date) { const n = new Date(d); n.setHours(0, 0, 0, 0); return n }
function endOfDay(d: Date) { const n = new Date(d); n.setHours(23, 59, 59, 999); return n }

function startOfWeek(d: Date) {
  const n = new Date(d)
  const day = n.getDay()
  // Monday = start of week
  const diff = day === 0 ? -6 : 1 - day
  n.setDate(n.getDate() + diff)
  n.setHours(0, 0, 0, 0)
  return n
}

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatTimeShort(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function MeetingsBoard() {
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meetings, setMeetings] = useState<CrmMeeting[]>([])
  const [loading, setLoading] = useState(false)

  /* ── Modal State ──────────────────────────────────────────────── */
  const [showFormModal, setShowFormModal] = useState(false)
  const [editMeeting, setEditMeeting] = useState<CrmMeeting | null>(null)

  /* ── Date Range Calculation ──────────────────────────────────── */
  const getDateRange = useCallback(() => {
    if (viewMode === 'day') {
      return { from: startOfDay(currentDate), to: endOfDay(currentDate) }
    }
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate)
      const end = endOfDay(addDays(start, 6))
      return { from: start, to: end }
    }
    // month
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)
    return { from: start, to: end }
  }, [viewMode, currentDate])

  /* ── Data Fetch ─────────────────────────────────────────────── */
  const loadMeetings = useCallback(async () => {
    setLoading(true)
    try {
      const { from, to } = getDateRange()
      const data = await getMeetingsByDateRange(from.toISOString(), to.toISOString())
      setMeetings(data || [])
    } catch (err) {
      console.error('Error loading meetings:', err)
    } finally {
      setLoading(false)
    }
  }, [getDateRange])

  useEffect(() => { loadMeetings() }, [loadMeetings])

  /* ── Navigation ─────────────────────────────────────────────── */
  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate)
    if (viewMode === 'day') d.setDate(d.getDate() + dir)
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date())

  const getTitle = () => {
    if (viewMode === 'day') {
      return `${DAYS_ES_FULL[currentDate.getDay()]} ${currentDate.getDate()} de ${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    }
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate)
      const end = addDays(start, 6)
      return `${start.getDate()} ${MONTHS_ES[start.getMonth()].substring(0, 3)} – ${end.getDate()} ${MONTHS_ES[end.getMonth()].substring(0, 3)} ${end.getFullYear()}`
    }
    return `${MONTHS_ES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }

  /* ── Meeting Card ───────────────────────────────────────────── */
  const renderMeetingCard = (m: CrmMeeting, compact = false) => {
    const TipoIcon = TIPO_ICONS[m.tipo] || MapPin
    const estadoColor = ESTADO_COLORS[m.estado] || '#94A3B8'
    const clientName = m.travel_quotes
      ? `${m.travel_quotes.nombre} ${m.travel_quotes.apellido}`
      : '—'

    return (
      <motion.div
        key={m.id}
        layout
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => { setEditMeeting(m); setShowFormModal(true) }}
        style={{
          padding: compact ? '6px 8px' : '12px 14px',
          background: 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${estadoColor}30`,
          borderLeft: `3px solid ${estadoColor}`,
          borderRadius: compact ? 8 : 12,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? 3 : 8,
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = `${estadoColor}10` }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      >
        {/* Time + Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={compact ? 10 : 12} style={{ color: estadoColor }} />
            <span style={{ fontSize: compact ? 10 : 12, fontWeight: 800, color: estadoColor }}>
              {formatTimeShort(m.fecha_inicio)}
              {m.fecha_fin && ` - ${formatTimeShort(m.fecha_fin)}`}
            </span>
          </div>
          <span style={{
            fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 99,
            background: `${estadoColor}18`, color: estadoColor,
            textTransform: 'uppercase',
          }}>
            {m.estado}
          </span>
        </div>

        {/* Title */}
        <span style={{ fontSize: compact ? 11 : 13, fontWeight: 700, color: '#F0F4FF', lineHeight: 1.2 }}>
          {m.titulo}
        </span>

        {/* Client & Type */}
        {!compact && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: 'rgba(148,163,184,0.7)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <Users size={10} /> {clientName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <TipoIcon size={10} /> {m.tipo}
            </span>
          </div>
        )}
      </motion.div>
    )
  }

  /* ── Day View ────────────────────────────────────────────────── */
  const renderDayView = () => {
    // Group meetings by hour
    const hours: { [hour: number]: CrmMeeting[] } = {}
    meetings.forEach(m => {
      const h = new Date(m.fecha_inicio).getHours()
      if (!hours[h]) hours[h] = []
      hours[h].push(m)
    })

    const allHours = Array.from({ length: 14 }, (_, i) => i + 7) // 7:00 - 20:00

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {allHours.map(hour => {
          const hourMeetings = hours[hour] || []
          const isNow = new Date().getHours() === hour && isSameDay(currentDate, new Date())

          return (
            <div
              key={hour}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr',
                gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                background: isNow ? 'rgba(245,158,11,0.04)' : 'transparent',
              }}
            >
              <div style={{
                fontSize: 12, fontWeight: isNow ? 800 : 600,
                color: isNow ? '#F59E0B' : 'rgba(148,163,184,0.5)',
                textAlign: 'right', paddingTop: 4,
              }}>
                {String(hour).padStart(2, '0')}:00
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 36 }}>
                {hourMeetings.map(m => renderMeetingCard(m))}
              </div>
            </div>
          )
        })}
        {meetings.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(100,116,139,0.5)', fontSize: 13 }}>
            <CalendarDays size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
            No hay reuniones programadas para este día.
          </div>
        )}
      </div>
    )
  }

  /* ── Week View ───────────────────────────────────────────────── */
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const today = new Date()

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {days.map((day, idx) => {
          const dayMeetings = meetings.filter(m => isSameDay(new Date(m.fecha_inicio), day))
          const isToday = isSameDay(day, today)

          return (
            <div
              key={idx}
              style={{
                background: isToday ? 'rgba(245,158,11,0.04)' : 'rgba(15,30,53,0.4)',
                border: isToday ? '1.5px solid rgba(245,158,11,0.2)' : '1.5px solid rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: '45vh',
              }}
            >
              {/* Day header */}
              <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? '#F59E0B' : 'rgba(148,163,184,0.6)', textTransform: 'uppercase' }}>
                  {DAYS_ES[day.getDay()]}
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 900,
                  color: isToday ? '#F59E0B' : '#F0F4FF',
                  width: 32, height: 32, borderRadius: '50%',
                  background: isToday ? 'rgba(245,158,11,0.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '4px auto 0',
                }}>
                  {day.getDate()}
                </div>
                {dayMeetings.length > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#FBBF24', marginTop: 4, display: 'inline-block' }}>
                    {dayMeetings.length} reunión{dayMeetings.length > 1 ? 'es' : ''}
                  </span>
                )}
              </div>

              {/* Day meetings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto', maxHeight: '40vh' }}>
                {dayMeetings.map(m => renderMeetingCard(m, true))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  /* ── Month View ──────────────────────────────────────────────── */
  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const today = new Date()

    // Pad to start of week (Monday)
    let startPad = firstDay.getDay() - 1
    if (startPad < 0) startPad = 6

    const totalCells = startPad + lastDay.getDate()
    const rows = Math.ceil(totalCells / 7)
    const cells: (Date | null)[] = []

    for (let i = 0; i < startPad; i++) cells.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d))
    while (cells.length < rows * 7) cells.push(null)

    return (
      <div>
        {/* Week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((cell, idx) => {
            if (!cell) return <div key={idx} style={{ minHeight: 80 }} />

            const dayMeetings = meetings.filter(m => isSameDay(new Date(m.fecha_inicio), cell))
            const isToday = isSameDay(cell, today)
            const hasMeetings = dayMeetings.length > 0

            return (
              <div
                key={idx}
                onClick={() => {
                  setCurrentDate(cell)
                  setViewMode('day')
                }}
                style={{
                  minHeight: 80,
                  padding: 6,
                  background: isToday ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                  border: isToday ? '1.5px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = isToday ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)' }}
              >
                <span style={{
                  fontSize: 12, fontWeight: isToday ? 900 : 600,
                  color: isToday ? '#F59E0B' : '#F0F4FF',
                }}>
                  {cell.getDate()}
                </span>

                {/* Meeting dots/labels */}
                {dayMeetings.slice(0, 2).map(m => (
                  <div key={m.id} style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 6,
                    background: `${ESTADO_COLORS[m.estado] || '#94A3B8'}18`,
                    color: ESTADO_COLORS[m.estado] || '#94A3B8',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {formatTimeShort(m.fecha_inicio)} {m.titulo.substring(0, 12)}
                  </div>
                ))}
                {dayMeetings.length > 2 && (
                  <span style={{ fontSize: 9, color: 'rgba(148,163,184,0.6)', fontWeight: 700 }}>
                    +{dayMeetings.length - 2} más
                  </span>
                )}
                {hasMeetings && dayMeetings.length <= 2 && (
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 3 }}>
                    {dayMeetings.map(m => (
                      <div key={m.id} style={{ width: 6, height: 6, borderRadius: '50%', background: ESTADO_COLORS[m.estado] || '#94A3B8' }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ── Stats Summary ──────────────────────────────────────────── */
  const pendientes = meetings.filter(m => m.estado === 'pendiente').length
  const realizadas = meetings.filter(m => m.estado === 'realizada').length
  const canceladas = meetings.filter(m => m.estado === 'cancelada').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', marginBottom: 4 }}>
            📅 Tablero de Reuniones
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)' }}>Agenda y calendario de reuniones comerciales</p>
        </div>

        <button
          onClick={() => { setEditMeeting(null); setShowFormModal(true) }}
          className="btn-cta"
          style={{ height: 42, padding: '0 18px', fontSize: 13 }}
        >
          <Plus size={16} /> Nueva Reunión
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        {[
          { label: 'Pendientes', count: pendientes, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)' },
          { label: 'Realizadas', count: realizadas, color: '#34D399', bg: 'rgba(52,211,153,0.08)' },
          { label: 'Canceladas', count: canceladas, color: '#F87171', bg: 'rgba(248,113,113,0.08)' },
          { label: 'Total Periodo', count: meetings.length, color: '#60A5FA', bg: 'rgba(96,165,250,0.08)' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '14px 16px', borderLeft: `3px solid ${s.color}` }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase' }}>{s.label}</span>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color, marginTop: 2 }}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* View Controls + Navigation */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'rgba(15,30,53,0.5)', border: '1.5px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
      }}>
        {/* View Mode Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {([
            { id: 'day', label: 'Día', icon: Eye },
            { id: 'week', label: 'Semana', icon: Calendar },
            { id: 'month', label: 'Mes', icon: CalendarDays },
          ] as const).map(tab => {
            const isActive = viewMode === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                style={{
                  padding: '8px 14px', borderRadius: 10,
                  background: isActive ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1.5px solid rgba(245,158,11,0.35)' : '1.5px solid rgba(255,255,255,0.06)',
                  color: isActive ? '#FBBF24' : 'rgba(148,163,184,0.7)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Date Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate(-1)}
            className="counter-btn"
            style={{ width: 32, height: 32, borderRadius: 8 }}
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{ fontSize: 14, fontWeight: 800, color: '#F0F4FF', minWidth: 200, textAlign: 'center' }}>
            {getTitle()}
          </span>

          <button
            onClick={() => navigate(1)}
            className="counter-btn"
            style={{ width: 32, height: 32, borderRadius: 8 }}
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={goToday}
            style={{
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              color: '#FBBF24', fontSize: 11, fontWeight: 800, cursor: 'pointer',
            }}
          >
            Hoy
          </button>

          <button
            onClick={loadMeetings}
            disabled={loading}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1.5px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
              color: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
            title="Refrescar"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Calendar View Content */}
      <div style={{
        background: 'rgba(15,30,53,0.3)',
        border: '1.5px solid rgba(255,255,255,0.05)',
        borderRadius: 18,
        padding: viewMode === 'month' ? 16 : 20,
        minHeight: '50vh',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + currentDate.toISOString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'month' && renderMonthView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Meeting Form Modal */}
      {showFormModal && (
        <MeetingFormModal
          meeting={editMeeting}
          onClose={() => { setShowFormModal(false); setEditMeeting(null) }}
          onSaved={() => { setShowFormModal(false); setEditMeeting(null); loadMeetings() }}
        />
      )}
    </div>
  )
}
