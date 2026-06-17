import { useState, useEffect } from 'react'
import { updateQuoteDetails, getMeetingsForQuote, deleteMeeting, type TravelQuoteRow, type PricingDetalles, type ProveedorPrecio, type CrmMeeting } from '@/lib/supabase'
import { MeetingFormModal } from './MeetingFormModal'
import { X, Calendar, DollarSign, FileText, CheckCircle, Printer, Save, Clock, Plus, Trash2, MapPin, Video, Phone, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ModalProps {
  quote: TravelQuoteRow
  onClose: () => void
  onStatusChange: (status: TravelQuoteRow['estado']) => void
}

type TabType = 'general' | 'agenda' | 'pricing'

export function QuoteDetailModal({ quote, onClose, onStatusChange: _onStatusChange }: ModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [saving, setSaving] = useState(false)

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

  /* ── CRM Pricing States ──────────────────────────────────────── */
  const initPricing = (): PricingDetalles => {
    if (quote.pricing_detalles && quote.pricing_detalles.proveedores?.length) {
      return quote.pricing_detalles as PricingDetalles
    }
    return {
      moneda: 'USD',
      markup_tipo: 'porcentaje',
      markup_valor: 10,
      proveedor_seleccionado: null,
      proveedores: [
        { nombre: 'Proveedor A', hotel_costo: 0, vuelos_costo: 0, otros_costo: 0, markup_aplicado: 0, precio_final: 0 },
        { nombre: 'Proveedor B', hotel_costo: 0, vuelos_costo: 0, otros_costo: 0, markup_aplicado: 0, precio_final: 0 },
        { nombre: 'Proveedor C', hotel_costo: 0, vuelos_costo: 0, otros_costo: 0, markup_aplicado: 0, precio_final: 0 },
        { nombre: 'Proveedor D', hotel_costo: 0, vuelos_costo: 0, otros_costo: 0, markup_aplicado: 0, precio_final: 0 },
      ],
    }
  }

  const [pricing, setPricing] = useState<PricingDetalles>(initPricing)

  /* ── Calculations helper ────────────────────────────────────── */
  const calculateFinalPrice = (
    hotel: number,
    vuelo: number,
    otros: number,
    markupVal: number,
    markupTipo: 'porcentaje' | 'fijo'
  ) => {
    const costo = hotel + vuelo + otros
    let markup = 0
    if (markupTipo === 'porcentaje') {
      markup = costo * (markupVal / 100)
    } else {
      markup = markupVal
    }
    return {
      markup,
      total: costo + markup,
    }
  }

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

  /* ── Save Provider Pricing ──────────────────────────────────── */
  const saveProviderPricing = async (winningProviderName: string | null) => {
    setSaving(true)
    try {
      // Re-calculate all provider prices with current state values
      const updatedProviders = pricing.proveedores.map(p => {
        const { markup, total } = calculateFinalPrice(
          p.hotel_costo,
          p.vuelos_costo,
          p.otros_costo,
          pricing.markup_valor,
          pricing.markup_tipo
        )
        return {
          ...p,
          markup_aplicado: markup,
          precio_final: total,
        }
      })

      const updatedPricing: PricingDetalles = {
        ...pricing,
        proveedor_seleccionado: winningProviderName,
        proveedores: updatedProviders,
      }

      setPricing(updatedPricing)

      // Save to supabase
      await updateQuoteDetails(quote.id, {
        pricing_detalles: updatedPricing,
        // If there's a winning provider, update the status to 'cotizado' if it was 'no_cotizado' or 'en_cotizacion'
        estado: winningProviderName && (quote.estado === 'no_cotizado' || quote.estado === 'en_cotizacion') 
          ? 'cotizado' 
          : quote.estado
      })

      alert('✓ Precios actualizados con éxito')
    } catch (err) {
      console.error(err)
      alert('Error al actualizar importes')
    } finally {
      setSaving(false)
    }
  }

  /* ── Generate printable PDF window ──────────────────────────── */
  const printPdf = () => {
    const selectedProvider = pricing.proveedores.find(p => p.nombre === pricing.proveedor_seleccionado)
    if (!selectedProvider) {
      alert('Seleccioná un proveedor de la calculadora primero para marcarlo como ganador antes de exportar el PDF.')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const symbol = pricing.moneda === 'USD' ? 'USD $' : 'ARS $'
    const destinationsText = [...quote.destinos, ...(quote.destino_personalizado ? quote.destino_personalizado.split(',') : [])]
      .map(d => d.trim().replace(/_/g, ' '))
      .join(', ')

    const preferencesText = quote.preferencias.map(p => p.toUpperCase().replace(/_/g, ' ')).join(' | ')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Presupuesto Jure Travel - ${quote.nombre} ${quote.apellido}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1E293B; margin: 40px; line-height: 1.5; }
          .header { border-bottom: 2px solid #F59E0B; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 24px; font-weight: 800; color: #0F1E35; }
          .logo span { color: #F59E0B; }
          .subtitle { font-size: 11px; text-transform: uppercase; color: #64748B; letter-spacing: 1px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 12px; color: #0F1E35; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #F1F5F9; font-size: 13px; }
          .row span:first-child { color: #64748B; font-weight: 600; }
          .row span:last-child { font-weight: 700; color: #0F1E35; }
          .price-box { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 20px; text-align: center; margin-top: 30px; }
          .price-title { font-size: 12px; text-transform: uppercase; color: #64748B; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 6px; }
          .price-val { font-size: 32px; font-weight: 900; color: #D97706; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Jure <span>Travel</span></div>
            <div class="subtitle">Presupuesto a medida</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748B;">
            Fecha: ${new Date().toLocaleDateString()}<br>
            Nº Referencia: #${quote.id.substring(0, 8).toUpperCase()}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Datos del Viajero</div>
          <div class="grid">
            <div>
              <div class="row"><span>Nombre Completo</span><span>${quote.nombre} ${quote.apellido}</span></div>
              <div class="row"><span>Documento DNI</span><span>${quote.dni}</span></div>
            </div>
            <div>
              <div class="row"><span>Correo Electrónico</span><span>${quote.email}</span></div>
              <div class="row"><span>Celular de Contacto</span><span>${quote.celular}</span></div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Planificación de Viaje</div>
          <div class="grid">
            <div>
              <div class="row"><span>Salida</span><span>${quote.ciudad_salida?.toUpperCase().replace(/_/g, ' ') || 'No especificada'}</span></div>
              <div class="row"><span>Destino(s)</span><span>${destinationsText}</span></div>
            </div>
            <div>
              <div class="row"><span>Tipo de Fechas</span><span>${quote.tipo_fecha === 'exacta' ? 'Exactas' : 'Flexible'}</span></div>
              <div class="row">
                <span>Fechas Estimadas</span>
                <span>
                  ${quote.tipo_fecha === 'exacta' 
                    ? `${quote.fecha_salida ? formatDate(quote.fecha_salida) : '—'} al ${quote.fecha_regreso ? formatDate(quote.fecha_regreso) : '—'}`
                    : quote.mes_preferido || '—'
                  }
                </span>
              </div>
            </div>
          </div>
          <div class="row" style="margin-top: 10px;">
            <span>Pasajeros</span>
            <span>🧑 ${quote.adultos} Adultos | 👧 ${quote.ninos_2_12} Niños | 👶 ${quote.bebes_0_2} Bebés</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Servicios Incluidos</div>
          <p style="font-size: 12px; color: #0F1E35; font-weight: 700; margin: 0; padding: 6px 0;">${preferencesText}</p>
        </div>

        ${quote.comentarios ? `
        <div class="section">
          <div class="section-title">Observaciones del Cliente</div>
          <p style="font-size: 12px; color: #475569; margin: 0; background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #F1F5F9;">${quote.comentarios}</p>
        </div>
        ` : ''}

        <div class="price-box">
          <div class="price-title">Importe Final Presupuestado</div>
          <div class="price-val">${symbol}${selectedProvider.precio_final.toLocaleString()}</div>
          <p style="font-size: 11px; color: #64748B; margin-top: 6px; font-weight: 500;">Precios vigentes al día de la fecha. Sujeto a disponibilidad.</p>
        </div>

        <div class="footer">
          Jure Travel - Legajo Nº 12345 · San Miguel de Tucumán · Correo: contacto@juretravel.com<br>
          ¡Gracias por confiar tu próximo viaje en nosotros!
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
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
          width: '100%', maxWidth: 720, maxHeight: '90vh',
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
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F0F4FF', marginTop: 2 }}>
              {quote.nombre} {quote.apellido}
            </h3>
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
              {/* Contact info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                  <p className="input-label" style={{ marginBottom: 6 }}>Contacto</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>DNI: {quote.dni}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Email: {quote.email}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Celular: {quote.celular}</p>
                </div>
                <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                  <p className="input-label" style={{ marginBottom: 6 }}>Plan</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Pasajeros: {quote.adultos} Ad / {quote.ninos_2_12} Ni / {quote.bebes_0_2} Be</p>
                  <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Salida: {quote.ciudad_salida?.toUpperCase().replace(/_/g, ' ') || 'No especificada'}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>Tipo: {quote.tipo_viaje ? quote.tipo_viaje.toUpperCase() : 'Vacaciones'}</p>
                </div>
              </div>

              {/* Destinations */}
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                <p className="input-label" style={{ marginBottom: 8 }}>Destino(s)</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {quote.destinos.map(d => (
                    <span key={d} className="chip-tag" style={{ fontSize: 11 }}>📍 {d.replace(/_/g, ' ')}</span>
                  ))}
                  {quote.destino_personalizado && (
                    <span className="chip-tag" style={{ fontSize: 11, background: 'rgba(148,163,184,0.1)', borderColor: 'rgba(148,163,184,0.2)', color: '#94A3B8' }}>✏️ {quote.destino_personalizado}</span>
                  )}
                </div>
              </div>

              {/* Dates Info */}
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                <p className="input-label" style={{ marginBottom: 6 }}>Fechas</p>
                <p style={{ fontSize: 13, fontWeight: 700 }}>
                  Modo: {quote.tipo_fecha === 'exacta' ? 'Fechas Exactas' : 'Mes Flexible'}
                </p>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14 }}>
                <div>
                  <label className="input-label">Moneda</label>
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
                  <label className="input-label">Tipo Markup</label>
                  <select
                    value={pricing.markup_tipo}
                    onChange={e => setPricing(p => ({ ...p, markup_tipo: e.target.value as any }))}
                    className="input-dark"
                    style={{ height: 42, minHeight: 42 }}
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Valor Markup</label>
                  <input
                    type="number"
                    value={pricing.markup_valor}
                    onChange={e => setPricing(p => ({ ...p, markup_valor: Number(e.target.value) || 0 }))}
                    className="input-dark"
                    style={{ height: 42, minHeight: 42 }}
                  />
                </div>
              </div>

              {/* 4 Providers Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pricing.proveedores?.map((prov, index) => {
                  const isSelected = pricing.proveedor_seleccionado === prov.nombre
                  
                  // Calculate markup and final price on the fly
                  const { markup, total } = calculateFinalPrice(
                    prov.hotel_costo,
                    prov.vuelos_costo,
                    prov.otros_costo,
                    pricing.markup_valor,
                    pricing.markup_tipo
                  )

                  const updateProvider = (field: keyof ProveedorPrecio, val: number) => {
                    const nextList = [...pricing.proveedores]
                    nextList[index] = { ...nextList[index], [field]: val }
                    setPricing(p => ({ ...p, proveedores: nextList }))
                  }

                  return (
                    <div
                      key={prov.nombre}
                      style={{
                        padding: 14,
                        background: isSelected ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '1.5px solid rgba(245,158,11,0.45)' : '1.5px solid rgba(255,255,255,0.06)',
                        borderRadius: 16,
                      }}
                    >
                      {/* Name of provider & select button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: isSelected ? '#FBBF24' : '#F0F4FF' }}>
                          🏢 {prov.nombre}
                        </span>
                        
                        <button
                          onClick={() => saveProviderPricing(prov.nombre)}
                          style={{
                            padding: '4px 10px',
                            background: isSelected ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                            color: isSelected ? '#0A1526' : '#94A3B8',
                            border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                          }}
                        >
                          <CheckCircle size={12} />
                          {isSelected ? 'Seleccionado' : 'Elegir Ganador'}
                        </button>
                      </div>

                      {/* Inputs grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <div>
                          <label className="input-label" style={{ fontSize: 9 }}>Hotel Costo</label>
                          <input
                            type="number"
                            value={prov.hotel_costo || ''}
                            onChange={e => updateProvider('hotel_costo', Number(e.target.value) || 0)}
                            className="input-dark"
                            style={{ height: 38, minHeight: 38, padding: '0 8px', fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <label className="input-label" style={{ fontSize: 9 }}>Vuelos Costo</label>
                          <input
                            type="number"
                            value={prov.vuelos_costo || ''}
                            onChange={e => updateProvider('vuelos_costo', Number(e.target.value) || 0)}
                            className="input-dark"
                            style={{ height: 38, minHeight: 38, padding: '0 8px', fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <label className="input-label" style={{ fontSize: 9 }}>Otros Costo</label>
                          <input
                            type="number"
                            value={prov.otros_costo || ''}
                            onChange={e => updateProvider('otros_costo', Number(e.target.value) || 0)}
                            className="input-dark"
                            style={{ height: 38, minHeight: 38, padding: '0 8px', fontSize: 13 }}
                          />
                        </div>
                      </div>

                      {/* Price outputs calculations */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'rgba(148,163,184,0.7)', fontWeight: 600, marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 8 }}>
                        <span>Costo: {pricing.moneda} ${(prov.hotel_costo + prov.vuelos_costo + prov.otros_costo).toLocaleString()}</span>
                        <span>Ganancia (+): {pricing.moneda} ${markup.toLocaleString()}</span>
                        <span style={{ color: '#34D399', fontWeight: 800 }}>
                          Precio Cliente: {pricing.moneda} ${total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom save pricing grid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 14 }}>
                <button
                  onClick={() => saveProviderPricing(pricing.proveedor_seleccionado)}
                  disabled={saving}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)', color: '#F0F4FF',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Save size={16} />
                  Guardar Planilla Costos
                </button>

                <button
                  onClick={printPdf}
                  className="btn-cta"
                  style={{ height: 44, padding: '0 20px', fontSize: 13 }}
                >
                  <Printer size={16} />
                  Exportar PDF Cliente
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
