import { useState, useEffect } from 'react'
import { updateQuoteDetails, getMeetingsForQuote, deleteMeeting, type TravelQuoteRow, type PricingDetalles, type ProveedorPrecio, type CrmMeeting } from '@/lib/supabase'
import { MeetingFormModal } from './MeetingFormModal'
import { useTTOOList, useServiciosList } from '@/hooks/useCatalogQuery'
import { X, Calendar, DollarSign, FileText, CheckCircle, Printer, Save, Clock, Plus, Trash2, MapPin, Video, Phone, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { QuotePDF } from './QuotePDF'
interface ModalProps {
  quote: TravelQuoteRow
  onClose: () => void
  onStatusChange: (status: TravelQuoteRow['estado']) => void
}

type TabType = 'general' | 'agenda' | 'pricing'

export function QuoteDetailModal({ quote, onClose, onStatusChange: _onStatusChange }: ModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [saving, setSaving] = useState(false)

  /* ── Catalogs ────────────────────────────────────────────────── */
  const { data: ttoos } = useTTOOList()
  const { data: serviciosCatalog } = useServiciosList()

  /* ── CRM Agenda States ───────────────────────────────────────── */
  const [notasCrm, setNotasCrm]           = useState(quote.notas_crm || '')

  /* ── Meetings from crm_meetings table ─────────────────────── */
  const [meetings, setMeetings] = useState<CrmMeeting[]>([])
  const [meetingsLoading, setMeetingsLoading] = useState(false)
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<CrmMeeting | null>(null)

  const loadMeetings = async () => {
    setMeetingsLoading(true)
    try {
      const data = await getMeetingsForQuote(quote.id)
      setMeetings(data || [])
    } catch (err) {
      console.error('Error loading meetings:', err)
    } finally {
      setMeetingsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'agenda') loadMeetings()
  }, [activeTab])

  const handleDeleteMeeting = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar esta reunión?')) return
    try {
      await deleteMeeting(id)
      setMeetings(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      console.error(err)
      alert('Error al eliminar reunión')
    }
  }

  /* ── General Edit Mode ───────────────────────────────────────── */
  const [editMode, setEditMode] = useState(false)
  const [editedQuote, setEditedQuote] = useState<TravelQuoteRow>(quote)

  const saveGeneralDetails = async () => {
    setSaving(true)
    try {
      await updateQuoteDetails(quote.id, {
        nombre: editedQuote.nombre,
        apellido: editedQuote.apellido,
        dni: editedQuote.dni,
        email: editedQuote.email,
        celular: editedQuote.celular,
        adultos: editedQuote.adultos,
        ninos_2_12: editedQuote.ninos_2_12,
        bebes_0_2: editedQuote.bebes_0_2,
        edades_adultos: editedQuote.edades_adultos,
        ciudad_salida: editedQuote.ciudad_salida,
        tipo_viaje: editedQuote.tipo_viaje,
        destino_personalizado: editedQuote.destino_personalizado,
        mes_preferido: editedQuote.mes_preferido,
      })
      setEditMode(false)
      alert('✓ Detalles actualizados')
    } catch (err) {
      console.error(err)
      alert('Error al guardar detalles')
    } finally {
      setSaving(false)
    }
  }

  /* ── CRM Pricing States ──────────────────────────────────────── */
  const initPricing = (): PricingDetalles => {
    if (quote.pricing_detalles) {
      const p = quote.pricing_detalles as PricingDetalles
      if (!p.servicios) p.servicios = []
      if (p.proveedores?.length && p.proveedor_seleccionado && p.servicios.length === 0) {
         const winner = p.proveedores.find(x => x.nombre === p.proveedor_seleccionado)
         if (winner) {
            if (winner.hotel_costo) p.servicios.push({ id: crypto.randomUUID(), tipo: 'Hotel', descripcion: `Hotel - ${winner.nombre}`, costo: winner.hotel_costo, fecha_vto_ttoo: '' })
            if (winner.vuelos_costo) p.servicios.push({ id: crypto.randomUUID(), tipo: 'Vuelo', descripcion: `Vuelo - ${winner.nombre}`, costo: winner.vuelos_costo, fecha_vto_ttoo: '' })
            if (winner.otros_costo) p.servicios.push({ id: crypto.randomUUID(), tipo: 'Otro', descripcion: `Otros - ${winner.nombre}`, costo: winner.otros_costo, fecha_vto_ttoo: '' })
         }
      }
      p.markup_valor = 20
      p.markup_tipo = 'porcentaje'
      return p
    }
    return {
      moneda: 'USD',
      markup_tipo: 'porcentaje',
      markup_valor: 20,
      servicios: [],
    }
  }

  const [pricing, setPricing] = useState<PricingDetalles>(initPricing)

  /* ── Save CRM Notes ─────────────────────────────────────────── */
  const saveCrmNotes = async () => {
    setSaving(true)
    try {
      await updateQuoteDetails(quote.id, {
        notas_crm: notasCrm,
      })
      alert('✓ Notas guardadas con éxito')
    } catch (err) {
      console.error(err)
      alert('Error al guardar notas')
    } finally {
      setSaving(false)
    }
  }

  const ESTADO_COLORS: Record<string, string> = {
    pendiente: '#FBBF24', realizada: '#34D399', cancelada: '#F87171', reprogramada: '#60A5FA',
  }
  const TIPO_ICONS: Record<string, typeof MapPin> = {
    presencial: MapPin, videollamada: Video, telefonica: Phone,
  }

  /* ── Calculations & Services helper ────────────────────────── */
  const totalCosto = (pricing.servicios || []).reduce((acc, s) => acc + s.costo, 0)
  const totalMarkup = pricing.markup_tipo === 'porcentaje' ? totalCosto * (pricing.markup_valor / 100) : pricing.markup_valor
  const precioFinal = totalCosto + totalMarkup

  const addService = () => {
    setPricing(p => ({
      ...p,
      servicios: [...(p.servicios || []), { id: crypto.randomUUID(), tipo: 'Vuelo', descripcion: '', costo: 0, fecha_vto_ttoo: '' }]
    }))
  }

  const removeService = (id: string) => {
    setPricing(p => ({
      ...p,
      servicios: (p.servicios || []).filter(s => s.id !== id)
    }))
  }

  const updateService = (id: string, field: keyof import('@/lib/supabase').ServicioPrecio, value: any) => {
    setPricing(p => ({
      ...p,
      servicios: (p.servicios || []).map(s => s.id === id ? { ...s, [field]: value } : s)
    }))
  }

  /* ── Save Pricing ──────────────────────────────────── */
  const savePricing = async () => {
    setSaving(true)
    try {
      const updatedPricing: PricingDetalles = {
        ...pricing,
        markup_valor: 20,
        markup_tipo: 'porcentaje'
      }

      setPricing(updatedPricing)

      // Save to supabase
      await updateQuoteDetails(quote.id, {
        pricing_detalles: updatedPricing,
        estado: (quote.estado === 'no_cotizado' || quote.estado === 'en_cotizacion') ? 'cotizado' : quote.estado
      })

      alert('✓ Presupuesto actualizado con éxito')
    } catch (err) {
      console.error(err)
      alert('Error al guardar presupuesto')
    } finally {
      setSaving(false)
    }
  }


  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(12px)',
      padding: 16,
    }}>
      <div
        className="glass-card flex flex-col"
        style={{
          width: '100%', maxWidth: 900, maxHeight: '90vh',
          background: 'linear-gradient(160deg, #0F1E35 0%, #0D2040 100%)',
          borderRadius: 24, overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Lead CRM
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F0F4FF', marginTop: 2 }}>
                {quote.nombre} {quote.apellido} {quote.ticket_id ? ` - ${quote.ticket_id}` : ''}
              </h3>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/quote/${quote.id}`;
                  navigator.clipboard.writeText(url);
                  alert('¡Link copiado al portapapeles!');
                }}
                style={{
                  padding: '4px 8px', fontSize: 10, fontWeight: 700, borderRadius: 6,
                  background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
                title="Copiar link para el cliente"
              >
                Copiar Link
              </button>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Tab headers */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {([
            { id: 'general', label: 'Detalles del Viaje', icon: FileText },
            { id: 'agenda',  label: 'Cita y Agenda CRM', icon: Calendar },
            { id: 'pricing', label: 'Calculadora Precios', icon: DollarSign },
          ] as const).map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '12px 14px', border: 'none', background: 'none',
                  fontSize: 12, fontWeight: 700,
                  color: isActive ? '#FBBF24' : 'rgba(148,163,184,0.7)',
                  borderBottom: isActive ? '2px solid #F59E0B' : '2px solid transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Modal body (scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ─── TAB 1: General details ───────────────────────────── */}
          {activeTab === 'general' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -6 }}>
                <button
                  onClick={() => editMode ? saveGeneralDetails() : setEditMode(true)}
                  disabled={saving}
                  style={{
                    padding: '6px 16px', borderRadius: 10,
                    background: editMode ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                    border: editMode ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)',
                    color: editMode ? '#34D399' : '#94A3B8', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                  }}
                >
                  <Save size={14} />
                  {editMode ? (saving ? 'Guardando...' : 'Guardar Cambios') : 'Editar Detalles'}
                </button>
              </div>

              {/* Contact info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                  <p className="input-label" style={{ marginBottom: 6 }}>Contacto</p>
                  {editMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input type="text" className="input-dark" value={editedQuote.nombre} onChange={e => setEditedQuote(q => ({...q, nombre: e.target.value}))} placeholder="Nombre" style={{height: 30, fontSize: 12}} />
                      <input type="text" className="input-dark" value={editedQuote.apellido} onChange={e => setEditedQuote(q => ({...q, apellido: e.target.value}))} placeholder="Apellido" style={{height: 30, fontSize: 12}} />
                      <input type="text" className="input-dark" value={editedQuote.dni} onChange={e => setEditedQuote(q => ({...q, dni: e.target.value}))} placeholder="DNI" style={{height: 30, fontSize: 12}} />
                      <input type="email" className="input-dark" value={editedQuote.email} onChange={e => setEditedQuote(q => ({...q, email: e.target.value}))} placeholder="Email" style={{height: 30, fontSize: 12}} />
                      <input type="text" className="input-dark" value={editedQuote.celular} onChange={e => setEditedQuote(q => ({...q, celular: e.target.value}))} placeholder="Celular" style={{height: 30, fontSize: 12}} />
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>DNI: {quote.dni}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Email: {quote.email}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Celular: {quote.celular}</p>
                    </>
                  )}
                </div>
                <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                  <p className="input-label" style={{ marginBottom: 6 }}>Plan</p>
                  {editMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input type="number" className="input-dark" value={editedQuote.adultos} onChange={e => setEditedQuote(q => ({...q, adultos: Number(e.target.value)}))} placeholder="Ad" style={{height: 30, fontSize: 12, flex: 1}} />
                        <input type="number" className="input-dark" value={editedQuote.ninos_2_12} onChange={e => setEditedQuote(q => ({...q, ninos_2_12: Number(e.target.value)}))} placeholder="Ni" style={{height: 30, fontSize: 12, flex: 1}} />
                        <input type="number" className="input-dark" value={editedQuote.bebes_0_2} onChange={e => setEditedQuote(q => ({...q, bebes_0_2: Number(e.target.value)}))} placeholder="Be" style={{height: 30, fontSize: 12, flex: 1}} />
                      </div>
                      <input type="text" className="input-dark" value={editedQuote.edades_adultos || ''} onChange={e => setEditedQuote(q => ({...q, edades_adultos: e.target.value}))} placeholder="Edades (ej: 25, 30)" style={{height: 30, fontSize: 12}} />
                      <input type="text" className="input-dark" value={editedQuote.ciudad_salida || ''} onChange={e => setEditedQuote(q => ({...q, ciudad_salida: e.target.value}))} placeholder="Ciudad Salida" style={{height: 30, fontSize: 12}} />
                      <input type="text" className="input-dark" value={editedQuote.tipo_viaje || ''} onChange={e => setEditedQuote(q => ({...q, tipo_viaje: e.target.value}))} placeholder="Tipo (Vacaciones...)" style={{height: 30, fontSize: 12}} />
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>Pasajeros: {quote.adultos} Ad {quote.edades_adultos ? `(Edades: ${quote.edades_adultos}) ` : ''}/ {quote.ninos_2_12} Ni / {quote.bebes_0_2} Be</p>
                      <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Salida: {quote.ciudad_salida?.toUpperCase().replace(/_/g, ' ') || 'No especificada'}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Tipo: {quote.tipo_viaje ? quote.tipo_viaje.toUpperCase() : 'Vacaciones'}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Destinations */}
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                <p className="input-label" style={{ marginBottom: 8 }}>Destino(s)</p>
                {editMode ? (
                  <input type="text" className="input-dark" value={editedQuote.destino_personalizado || ''} onChange={e => setEditedQuote(q => ({...q, destino_personalizado: e.target.value}))} placeholder="Ingresá los destinos (o cambia el personalizado)" style={{height: 36, fontSize: 12}} />
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {quote.destinos.map(d => (
                      <span key={d} className="chip-tag" style={{ fontSize: 11 }}>📍 {d.replace(/_/g, ' ')}</span>
                    ))}
                    {quote.destino_personalizado && (
                      <span className="chip-tag" style={{ fontSize: 11, background: 'rgba(148,163,184,0.1)', borderColor: 'rgba(148,163,184,0.2)', color: '#94A3B8' }}>✏️ {quote.destino_personalizado}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Dates Info */}
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                <p className="input-label" style={{ marginBottom: 6 }}>Fechas</p>
                {editMode && editedQuote.tipo_fecha === 'mes' ? (
                  <input type="text" className="input-dark" value={editedQuote.mes_preferido || ''} onChange={e => setEditedQuote(q => ({...q, mes_preferido: e.target.value}))} placeholder="Mes preferido" style={{height: 36, fontSize: 12}} />
                ) : (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>Modo: {quote.tipo_fecha === 'exacta' ? 'Fechas Exactas' : 'Mes Flexible'}</p>
                    <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.9)', marginTop: 4 }}>
                      Fechas: {quote.tipo_fecha === 'exacta'
                        ? `${quote.fecha_salida ? formatDate(quote.fecha_salida) : '—'} al ${quote.fecha_regreso ? formatDate(quote.fecha_regreso) : '—'}`
                        : quote.mes_preferido || '—'
                      }
                    </p>
                    {Object.keys(quote.dates?.fechas_por_destino || {}).length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <p style={{ fontSize: 11, color: '#FBBF24', fontWeight: 800 }}>Desglose por destino:</p>
                        {Object.entries(quote.dates.fechas_por_destino).map(([dest, info]: [string, any]) => (
                          <p key={dest} style={{ fontSize: 11, color: 'rgba(148,163,184,0.8)' }}>
                            👉 <strong>{dest.replace(/_/g, ' ')}</strong>: {info.fecha_salida ? formatDate(info.fecha_salida) : '—'} al {info.fecha_regreso ? formatDate(info.fecha_regreso) : '—'}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Preferences */}
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                <p className="input-label" style={{ marginBottom: 8 }}>Servicios Solicitados</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {quote.preferencias.map(p => (
                    <span key={p} className="chip-tag" style={{ fontSize: 10, background: 'rgba(52,211,153,0.1)', color: '#34D399', borderColor: 'rgba(52,211,153,0.3)' }}>✓ {p.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>

              {/* Client Comments */}
              {quote.comentarios && (
                <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                  <p className="input-label" style={{ marginBottom: 4 }}>Comentarios del Cliente</p>
                  <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.95)', lineHeight: 1.6 }}>{quote.comentarios}</p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 2: Meeting Agenda & Notes ───────────────────── */}
          {activeTab === 'agenda' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Meetings List Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} style={{ color: '#F59E0B' }} />
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#F0F4FF' }}>Reuniones del Lead</h4>
                  <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: '#FBBF24', padding: '2px 7px', borderRadius: 99 }}>
                    {meetings.length}
                  </span>
                </div>
                <button
                  onClick={() => { setEditingMeeting(null); setShowMeetingForm(true) }}
                  style={{
                    padding: '6px 12px', borderRadius: 10, background: 'rgba(245,158,11,0.1)',
                    border: '1.5px solid rgba(245,158,11,0.3)', color: '#FBBF24',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.18)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.1)')}
                >
                  <Plus size={13} /> Agregar Reunión
                </button>
              </div>

              {/* Meetings List */}
              {meetingsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', fontSize: 12, padding: 20, justifyContent: 'center' }}>
                  <Loader2 size={14} className="animate-spin" /> Cargando reuniones...
                </div>
              ) : meetings.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', color: 'rgba(100,116,139,0.5)', fontSize: 12, border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 14 }}>
                  <Calendar size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  No hay reuniones agendadas para este lead.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 250, overflowY: 'auto' }}>
                  {meetings.map(m => {
                    const estadoColor = ESTADO_COLORS[m.estado] || '#94A3B8'
                    const TipoIcon = TIPO_ICONS[m.tipo] || MapPin
                    return (
                      <div
                        key={m.id}
                        style={{
                          padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${estadoColor}25`, borderLeft: `3px solid ${estadoColor}`,
                          borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8,
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onClick={() => { setEditingMeeting(m); setShowMeetingForm(true) }}
                        onMouseEnter={e => (e.currentTarget.style.background = `${estadoColor}08`)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF' }}>{m.titulo}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 99, background: `${estadoColor}18`, color: estadoColor, textTransform: 'uppercase' }}>
                              {m.estado}
                            </span>
                            <button
                              onClick={(e) => handleDeleteMeeting(e, m.id)}
                              style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 2, display: 'flex', transition: 'color 0.15s' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,113,113,0.5)')}
                              title="Eliminar reunión"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(148,163,184,0.7)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: estadoColor }}>
                            <Clock size={11} />
                            {new Date(m.fecha_inicio).toLocaleDateString('es-AR')} {new Date(m.fecha_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            {m.fecha_fin && ` – ${new Date(m.fecha_fin).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                            <TipoIcon size={11} /> {m.tipo}
                          </span>
                        </div>
                        {m.notas && (
                          <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)', lineHeight: 1.4, margin: 0, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 6 }}>
                            {m.notas.length > 80 ? m.notas.substring(0, 80) + '...' : m.notas}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* CRM Notes */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <label className="input-label">Notas Comerciales / CRM (En Vivo)</label>
                <textarea
                  value={notasCrm}
                  onChange={e => setNotasCrm(e.target.value)}
                  placeholder="Tomá nota de los requisitos del cliente durante la llamada o reunión..."
                  rows={3}
                  style={{
                    width: '100%', padding: 14, background: 'rgba(255,255,255,0.04)',
                    border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 14,
                    color: '#F0F4FF', fontSize: 13, resize: 'none', outline: 'none',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <button
                onClick={saveCrmNotes}
                disabled={saving}
                className="btn-cta"
                style={{ alignSelf: 'flex-end', height: 44, padding: '0 20px', fontSize: 13 }}
              >
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar Notas'}
              </button>

              {/* State logs history */}
              {quote.historial && quote.historial.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p className="input-label" style={{ marginBottom: 8 }}>Historial de Cambios de Estado</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(0,0,0,0.15)', padding: 12, borderRadius: 10 }}>
                    {quote.historial.map((hist, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(148,163,184,0.7)', borderBottom: i < (quote.historial?.length || 0) - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', padding: '4px 0' }}>
                        <span>👉 Estado cambiado a <strong>{hist.estado.toUpperCase()}</strong></span>
                        <span>{new Date(hist.fecha).toLocaleString()} por {hist.usuario}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Form Modal */}
              {showMeetingForm && (
                <MeetingFormModal
                  meeting={editingMeeting}
                  preselectedQuoteId={quote.id}
                  preselectedQuoteName={`${quote.nombre} ${quote.apellido}`}
                  onClose={() => { setShowMeetingForm(false); setEditingMeeting(null) }}
                  onSaved={() => { setShowMeetingForm(false); setEditingMeeting(null); loadMeetings() }}
                />
              )}
            </div>
          )}

          {/* ─── TAB 3: Pricing Calculator ────────────────────────── */}
          {activeTab === 'pricing' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Settings selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14 }}>
                <div>
                  <label className="input-label">Moneda del Presupuesto</label>
                  <select
                    value={pricing.moneda}
                    onChange={e => setPricing(p => ({ ...p, moneda: e.target.value as any }))}
                    className="input-dark"
                    style={{ height: 42, minHeight: 42 }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="ARS">ARS ($)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Margen de Ganancia (Fijo)</label>
                  <div style={{ height: 42, display: 'flex', alignItems: 'center', padding: '0 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: 'rgba(148,163,184,0.7)', fontSize: 13 }}>
                    20% (Porcentaje)
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#F0F4FF' }}>Servicios Incluidos</h4>
                <button
                  onClick={addService}
                  style={{
                    padding: '6px 12px', borderRadius: 10, background: 'rgba(52,211,153,0.1)',
                    border: '1.5px solid rgba(52,211,153,0.3)', color: '#34D399',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.18)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.1)')}
                >
                  <Plus size={13} /> Agregar Servicio
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pricing.servicios?.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: 'rgba(100,116,139,0.5)', fontSize: 12, border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 14 }}>
                    Aún no hay servicios cargados en el presupuesto.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{
                        padding: '0 14px',
                        display: 'grid',
                        gridTemplateColumns: '110px 130px 1fr 100px 120px 100px 32px',
                        gap: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'rgba(148,163,184,0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                    }}>
                      <span>Tipo</span>
                      <span>TTOO</span>
                      <span>Descripción</span>
                      <span>Costo</span>
                      <span>Fecha Vto.</span>
                      <span>Pago TTOO</span>
                      <span></span>
                    </div>
                    {pricing.servicios?.map((serv) => (
                      <div
                        key={serv.id}
                        style={{
                          padding: 14,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1.5px solid rgba(255,255,255,0.06)',
                          borderRadius: 14,
                          display: 'grid',
                          gridTemplateColumns: '110px 130px 1fr 100px 120px 100px 32px',
                          gap: 12,
                          alignItems: 'center'
                        }}
                      >
                      <select
                        value={serv.tipo}
                        onChange={e => updateService(serv.id, 'tipo', e.target.value)}
                        className="input-dark"
                        style={{ height: 38, minHeight: 38, fontSize: 12 }}
                      >
                        {serviciosCatalog ? (
                          serviciosCatalog.map(sc => (
                            <option key={sc.id} value={sc.nombre}>{sc.nombre}</option>
                          ))
                        ) : (
                          <option value="Cargando...">Cargando...</option>
                        )}
                        {!serviciosCatalog?.find(sc => sc.nombre === serv.tipo) && serv.tipo && (
                          <option value={serv.tipo}>{serv.tipo}</option>
                        )}
                      </select>

                      <select
                        value={serv.ttoo || ''}
                        onChange={e => updateService(serv.id, 'ttoo', e.target.value)}
                        className="input-dark"
                        style={{ height: 38, minHeight: 38, fontSize: 12 }}
                      >
                        <option value="">(Sin TTOO)</option>
                        {ttoos?.map(t => (
                          <option key={t.id} value={t.nombre}>{t.nombre}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={serv.descripcion}
                        onChange={e => updateService(serv.id, 'descripcion', e.target.value)}
                        className="input-dark"
                        placeholder="Descripción detallada..."
                        style={{ height: 38, minHeight: 38, fontSize: 12 }}
                      />

                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>$</span>
                        <input
                          type="number"
                          value={serv.costo || ''}
                          onChange={e => updateService(serv.id, 'costo', Number(e.target.value) || 0)}
                          className="input-dark"
                          style={{ height: 38, minHeight: 38, paddingLeft: 22, fontSize: 12 }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <input
                          type="date"
                          value={serv.fecha_vto_ttoo || ''}
                          onChange={e => updateService(serv.id, 'fecha_vto_ttoo', e.target.value)}
                          className="input-dark"
                          style={{ height: 38, minHeight: 38, fontSize: 11, padding: '0 8px' }}
                          title="Fecha de vencimiento TTOO"
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                          height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: serv.estado_pago === 'pagado' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                          color: serv.estado_pago === 'pagado' ? '#34D399' : '#F87171',
                          borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {serv.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}
                        </div>
                      </div>

                      <button
                        onClick={() => removeService(serv.id)}
                        style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,113,113,0.5)')}
                        title="Eliminar Servicio"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              </div>

              {/* Price outputs calculations */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(148,163,184,0.8)', fontWeight: 600, marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                <span>Costo Total: {pricing.moneda} ${totalCosto.toLocaleString()}</span>
                <span>Markup (20%): {pricing.moneda} ${totalMarkup.toLocaleString()}</span>
                <span style={{ color: '#FBBF24', fontWeight: 800, fontSize: 14, background: 'rgba(245,158,11,0.1)', padding: '4px 12px', borderRadius: 8 }}>
                  Precio Final: {pricing.moneda} ${precioFinal.toLocaleString()}
                </span>
              </div>

              {/* Bottom save pricing grid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 14 }}>
                <button
                  onClick={savePricing}
                  disabled={saving || (pricing.servicios?.length === 0)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)', color: '#F0F4FF',
                    fontSize: 13, fontWeight: 700, cursor: (pricing.servicios?.length === 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    opacity: (pricing.servicios?.length === 0) ? 0.5 : 1
                  }}
                >
                  <Save size={16} />
                  Guardar Presupuesto
                </button>

                <PDFDownloadLink
                  document={<QuotePDF quote={quote} pricing={pricing} precioFinal={precioFinal} />}
                  fileName={`Presupuesto_Jure_Travel_${quote.nombre}_${quote.apellido}.pdf`}
                  className="btn-cta"
                  style={{ height: 44, padding: '0 20px', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {({ loading }) => (
                    <>
                      <Printer size={16} />
                      {loading ? 'Generando PDF...' : 'Exportar PDF Cliente'}
                    </>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
