import { useState, useEffect } from 'react'
import { createMeeting, updateMeeting, deleteMeeting, getQuotes, type CrmMeeting, type TravelQuoteRow } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { X, Save, Trash2, Search, Calendar, Clock, Users, Video, Phone, MapPin, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'

interface Props {
  meeting?: CrmMeeting | null
  preselectedQuoteId?: string | null
  preselectedQuoteName?: string | null
  onClose: () => void
  onSaved: () => void
}

export function MeetingFormModal({ meeting, preselectedQuoteId, preselectedQuoteName, onClose, onSaved }: Props) {
  const { user } = useAuthStore()
  const isEdit = !!meeting

  /* ── Form State ──────────────────────────────────────────────── */
  const [titulo, setTitulo] = useState(meeting?.titulo || 'Reunión comercial')
  const [fechaInicio, setFechaInicio] = useState(meeting?.fecha_inicio ? meeting.fecha_inicio.split('T')[0] : '')
  const [horaInicio, setHoraInicio] = useState(meeting?.fecha_inicio ? meeting.fecha_inicio.split('T')[1]?.substring(0, 5) : '10:00')
  const [fechaFin, setFechaFin] = useState(meeting?.fecha_fin ? meeting.fecha_fin.split('T')[0] : '')
  const [horaFin, setHoraFin] = useState(meeting?.fecha_fin ? meeting.fecha_fin.split('T')[1]?.substring(0, 5) : '11:00')
  const [estado, setEstado] = useState<CrmMeeting['estado']>(meeting?.estado || 'pendiente')
  const [tipo, setTipo] = useState<CrmMeeting['tipo']>(meeting?.tipo || 'presencial')
  const [notas, setNotas] = useState(meeting?.notas || '')
  const [quoteId, setQuoteId] = useState(meeting?.quote_id || preselectedQuoteId || '')
  const [quoteName, setQuoteName] = useState(preselectedQuoteName || '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /* ── Lead Search ──────────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TravelQuoteRow[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(!preselectedQuoteId && !meeting)

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await getQuotes({ search: searchQuery, limit: 5 })
        setSearchResults(data || [])
      } catch { setSearchResults([]) }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  /* ── Handlers ────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!titulo.trim()) { setError('El título es obligatorio'); return }
    if (!fechaInicio) { setError('La fecha de inicio es obligatoria'); return }
    if (!quoteId) { setError('Debés seleccionar un lead asociado'); return }
    setError('')
    setSaving(true)

    try {
      const fechaInicioISO = `${fechaInicio}T${horaInicio}:00.000Z`
      const fechaFinISO = fechaFin ? `${fechaFin}T${horaFin}:00.000Z` : null

      if (isEdit && meeting) {
        await updateMeeting(meeting.id, {
          titulo, fecha_inicio: fechaInicioISO, fecha_fin: fechaFinISO,
          estado, tipo, notas: notas || null, quote_id: quoteId,
        })
      } else {
        await createMeeting({
          quote_id: quoteId, titulo,
          fecha_inicio: fechaInicioISO, fecha_fin: fechaFinISO,
          estado, tipo, notas: notas || null,
          creado_por: user?.email || user?.nombre || null,
        })
      }
      onSaved()
    } catch (err) {
      console.error(err)
      setError('Error al guardar la reunión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!meeting) return
    if (!window.confirm('¿Eliminar esta reunión permanentemente?')) return
    setSaving(true)
    try {
      await deleteMeeting(meeting.id)
      onSaved()
    } catch (err) {
      console.error(err)
      setError('Error al eliminar')
    } finally { setSaving(false) }
  }

  const selectQuote = (q: TravelQuoteRow) => {
    setQuoteId(q.id)
    setQuoteName(`${q.nombre} ${q.apellido}`)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
  }

  /* ── Meeting type icons ─────────────────────────────────────── */
  const TIPO_OPTIONS: { value: CrmMeeting['tipo']; label: string; icon: typeof MapPin }[] = [
    { value: 'presencial', label: 'Presencial', icon: MapPin },
    { value: 'videollamada', label: 'Videollamada', icon: Video },
    { value: 'telefonica', label: 'Telefónica', icon: Phone },
  ]

  const ESTADO_OPTIONS: { value: CrmMeeting['estado']; label: string; color: string }[] = [
    { value: 'pendiente', label: 'Pendiente', color: '#FBBF24' },
    { value: 'realizada', label: 'Realizada', color: '#34D399' },
    { value: 'cancelada', label: 'Cancelada', color: '#F87171' },
    { value: 'reprogramada', label: 'Reprogramada', color: '#60A5FA' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: 16,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card"
        style={{
          width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden',
          background: 'linear-gradient(160deg, #0F1E35 0%, #0D2040 100%)',
          borderRadius: 24, display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEdit ? '✏️ Editar Reunión' : '📅 Nueva Reunión'}
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F0F4FF', marginTop: 2 }}>
              {isEdit ? meeting?.titulo : 'Agendar Reunión'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Lead Selector */}
          <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
            <label className="input-label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={13} /> Lead Asociado
            </label>
            {quoteId && !showSearch ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF' }}>
                  👤 {quoteName || quoteId.substring(0, 8)}
                </span>
                <button
                  onClick={() => { setShowSearch(true); setQuoteId(''); setQuoteName('') }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: '#94A3B8', cursor: 'pointer' }}
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(100,116,139,0.7)' }} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o DNI..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-dark"
                    style={{ paddingLeft: 36, height: 40 }}
                    autoFocus
                  />
                  {searching && <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }} />}
                </div>
                {searchResults.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 150, overflowY: 'auto' }}>
                    {searchResults.map(q => (
                      <button
                        key={q.id}
                        onClick={() => selectQuote(q)}
                        style={{
                          padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                          cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      >
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#F0F4FF' }}>{q.nombre} {q.apellido}</span>
                          <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.7)', marginLeft: 8 }}>{q.email}</span>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: '#FBBF24', padding: '2px 6px', borderRadius: 99 }}>
                          {q.estado.replace(/_/g, ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="input-label">Título / Asunto</label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Reunión de cierre de venta"
              className="input-dark"
            />
          </div>

          {/* Date/Time Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} /> Fecha Inicio
              </label>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="input-dark" />
            </div>
            <div>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> Hora Inicio
              </label>
              <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="input-dark" />
            </div>
            <div>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} /> Fecha Fin (opcional)
              </label>
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="input-dark" />
            </div>
            <div>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> Hora Fin
              </label>
              <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} className="input-dark" />
            </div>
          </div>

          {/* Type Selector (chips) */}
          <div>
            <label className="input-label" style={{ marginBottom: 6 }}>Tipo de Reunión</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TIPO_OPTIONS.map(opt => {
                const isActive = tipo === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTipo(opt.value)}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: 12,
                      background: isActive ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isActive ? '1.5px solid rgba(245,158,11,0.4)' : '1.5px solid rgba(255,255,255,0.06)',
                      color: isActive ? '#FBBF24' : 'rgba(148,163,184,0.8)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.15s',
                    }}
                  >
                    <opt.icon size={14} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label className="input-label" style={{ marginBottom: 6 }}>Estado</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {ESTADO_OPTIONS.map(opt => {
                const isActive = estado === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setEstado(opt.value)}
                    style={{
                      flex: 1, padding: '8px 6px', borderRadius: 10,
                      background: isActive ? `${opt.color}18` : 'rgba(255,255,255,0.03)',
                      border: isActive ? `1.5px solid ${opt.color}55` : '1.5px solid rgba(255,255,255,0.06)',
                      color: isActive ? opt.color : 'rgba(148,163,184,0.7)',
                      fontSize: 10, fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="input-label">Notas / Minutas</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Puntos a tratar, observaciones del cliente..."
              rows={3}
              style={{
                width: '100%', padding: 14, background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 14,
                color: '#F0F4FF', fontSize: 13, resize: 'none', outline: 'none', lineHeight: 1.5,
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 12, color: '#F87171', fontWeight: 700, textAlign: 'center', padding: '8px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.18)' }}>
              ✕ {error}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={saving}
              style={{
                padding: '10px 16px', borderRadius: 12,
                border: '1.5px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.06)',
                color: '#F87171', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
              }}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          )}
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 16px', borderRadius: 12,
                border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
                color: '#94A3B8', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-cta"
              style={{ height: 42, padding: '0 20px', fontSize: 13 }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Reunión'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
