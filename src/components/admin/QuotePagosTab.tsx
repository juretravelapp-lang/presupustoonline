import { useMemo, useState } from 'react'
import type { TravelQuoteRow, CrmPago, InsertPago } from '@/lib/supabase'
import { usePagosByQuote, useCrearPago, useUpdatePago, useDeletePago } from '@/hooks/usePagosQuery'
import { Plus, Trash2, Edit3, CheckCircle, Loader2, CreditCard, Wallet, AlertTriangle, MessageCircle } from 'lucide-react'

interface QuotePagosTabProps {
  quote: TravelQuoteRow
}

const FORMAS = ['transferencia', 'efectivo', 'tarjeta_credito', 'tarjeta_debito', 'mercado_pago', 'otro']

const FORMA_LABEL: Record<string, string> = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta de Crédito',
  tarjeta_debito: 'Tarjeta de Débito',
  mercado_pago: 'Mercado Pago',
  otro: 'Otro',
}

const ESTADO_COLOR: Record<string, string> = { pendiente: '#FBBF24', pagado: '#34D399', cancelado: '#F87171' }

interface PagoFormState {
  concepto: string
  moneda: 'ARS' | 'USD'
  monto: string
  forma_pago: string
  fecha_pago: string
  fecha_vencimiento: string
  estado: CrmPago['estado']
  es_cuota: boolean
  cuota_numero: string
  cuota_total: string
  notas: string
}

const EMPTY_FORM: PagoFormState = {
  concepto: '',
  moneda: 'ARS',
  monto: '',
  forma_pago: 'transferencia',
  fecha_pago: new Date().toISOString().slice(0, 10),
  fecha_vencimiento: '',
  estado: 'pendiente',
  es_cuota: false,
  cuota_numero: '',
  cuota_total: '',
  notas: '',
}

function formFromPago(p: CrmPago): PagoFormState {
  return {
    concepto: p.concepto,
    moneda: p.moneda,
    monto: String(p.monto),
    forma_pago: p.forma_pago || 'transferencia',
    fecha_pago: p.fecha_pago || '',
    fecha_vencimiento: p.fecha_vencimiento || '',
    estado: p.estado,
    es_cuota: p.es_cuota,
    cuota_numero: p.cuota_numero != null ? String(p.cuota_numero) : '',
    cuota_total: p.cuota_total != null ? String(p.cuota_total) : '',
    notas: p.notas || '',
  }
}

function money(n: number): string {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function QuotePagosTab({ quote }: QuotePagosTabProps) {
  const { data: pagos, isLoading, refetch } = usePagosByQuote(quote.id)
  const crearPago = useCrearPago()
  const updatePago = useUpdatePago()
  const deletePago = useDeletePago()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CrmPago | null>(null)
  const [form, setForm] = useState<PagoFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const totals = useMemo(() => {
    const list = pagos || []
    const res = { pagadoARS: 0, pagadoUSD: 0, pendienteARS: 0, pendienteUSD: 0, vencidos: 0 }
    for (const p of list) {
      const esPagado = p.estado === 'pagado'
      const monto = p.monto
      if (esPagado) {
        if (p.moneda === 'ARS') res.pagadoARS += monto
        else res.pagadoUSD += monto
      } else if (p.estado === 'pendiente') {
        if (p.moneda === 'ARS') res.pendienteARS += monto
        else res.pendienteUSD += monto
        if (p.fecha_vencimiento && new Date(p.fecha_vencimiento + 'T00:00:00') < new Date()) res.vencidos++
      }
    }
    return res
  }, [pagos])

  const set = (k: keyof PagoFormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openNew = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
  }

  const openEdit = (p: CrmPago) => {
    setEditing(p)
    setForm(formFromPago(p))
    setShowForm(true)
  }

  const submit = async () => {
    if (!form.concepto.trim() || !form.monto) {
      alert('Completá concepto y monto.')
      return
    }
    setSaving(true)
    try {
      const payload: InsertPago = {
        quote_id: quote.id,
        cliente_id: quote.cliente_id || null,
        ticket_id: quote.ticket_id,
        cliente_nombre: `${quote.nombre} ${quote.apellido}`.trim(),
        concepto: form.concepto.trim(),
        moneda: form.moneda,
        monto: Number(form.monto),
        forma_pago: form.forma_pago || null,
        fecha_pago: form.fecha_pago || null,
        fecha_vencimiento: form.fecha_vencimiento || null,
        estado: form.estado,
        es_cuota: form.es_cuota,
        cuota_numero: form.es_cuota && form.cuota_numero ? Number(form.cuota_numero) : null,
        cuota_total: form.es_cuota && form.cuota_total ? Number(form.cuota_total) : null,
        notas: form.notas || null,
        quote_service_id: null,
      }
      if (editing) {
        await updatePago.mutateAsync({ id: editing.id, updates: payload })
      } else {
        await crearPago.mutateAsync(payload)
      }
      setShowForm(false)
      setEditing(null)
      alert('✓ Pago guardado')
    } catch (err) {
      console.error(err)
      alert('Error al guardar el pago')
    } finally {
      setSaving(false)
      refetch()
    }
  }

  const marcarPagado = async (p: CrmPago) => {
    try {
      await updatePago.mutateAsync({
        id: p.id,
        updates: {
          estado: 'pagado',
          fecha_pago: p.fecha_pago || new Date().toISOString().slice(0, 10),
        },
      })
      refetch()
    } catch (err) {
      console.error(err)
      alert('Error al marcar como pagado')
    }
  }

  const eliminar = async (p: CrmPago) => {
    if (!window.confirm('¿Eliminar este pago?')) return
    try {
      await deletePago.mutateAsync(p.id)
      refetch()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar el pago')
    }
  }

  const hoy = new Date().toISOString().slice(0, 10)

  const openWhatsAppReminder = () => {
    const phone = quote.celular?.replace(/[^\d]/g, '')
    if (!phone) { alert('El lead no tiene número de celular cargado.'); return }
    const parts: string[] = []
    if (totals.pendienteARS > 0) parts.push(`ARS $${money(totals.pendienteARS)}`)
    if (totals.pendienteUSD > 0) parts.push(`USD $${money(totals.pendienteUSD)}`)
    const quoteRef = quote.ticket_id ? ` (${quote.ticket_id})` : ''
    const summary = parts.join(' + ') || 'un saldo'
    const msg = `Hola ${quote.nombre}! 👋 Te escribimos de JURE TRAVEL por tu presupuesto${quoteRef}.\n\nQuedó pendiente de pago: ${summary}. Respondenos para coordinar el pago y seguir avanzando con tu viaje ✈️`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
  }

  const input = (style?: React.CSSProperties) => ({
    height: 40, minHeight: 40, fontSize: 12,
    ...style,
  } as React.CSSProperties)

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Totales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <div style={{ padding: 14, background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase' }}>Cobrado ARS</span>
          <p style={{ fontSize: 18, fontWeight: 900, color: '#34D399', margin: '4px 0 0' }}>${money(totals.pagadoARS)}</p>
        </div>
        <div style={{ padding: 14, background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase' }}>Cobrado USD</span>
          <p style={{ fontSize: 18, fontWeight: 900, color: '#60A5FA', margin: '4px 0 0' }}>${money(totals.pagadoUSD)}</p>
        </div>
        <div style={{ padding: 14, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase' }}>Pendiente ARS</span>
          <p style={{ fontSize: 18, fontWeight: 900, color: '#FBBF24', margin: '4px 0 0' }}>${money(totals.pendienteARS)}</p>
        </div>
        <div style={{ padding: 14, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase' }}>Pendiente USD</span>
          <p style={{ fontSize: 18, fontWeight: 900, color: '#FBBF24', margin: '4px 0 0' }}>${money(totals.pendienteUSD)}</p>
        </div>
      </div>

      {totals.vencidos > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#F87171' }}>
          <AlertTriangle size={15} />
          {totals.vencidos} pago{totals.vencidos > 1 ? 's' : ''} con vencimiento ya cumplido.
        </div>
      )}

      {/* Encabezado + botón */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#F0F4FF', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={15} style={{ color: '#F59E0B' }} />
          Historial de Pagos ({pagos?.length || 0})
        </h4>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={openWhatsAppReminder}
            title="Enviar recordatorio de pago por WhatsApp"
            style={{
              padding: '7px 14px', borderRadius: 10, background: 'rgba(37,211,102,0.1)',
              border: '1.5px solid rgba(37,211,102,0.3)', color: '#4ADE80',
              fontSize: 11, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <MessageCircle size={13} /> Recordar por WhatsApp
          </button>
          <button
            onClick={openNew}
            style={{
              padding: '7px 14px', borderRadius: 10, background: 'rgba(52,211,153,0.1)',
              border: '1.5px solid rgba(52,211,153,0.3)', color: '#34D399',
              fontSize: 11, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <Plus size={13} /> Registrar Pago
          </button>
        </div>
      </div>

      {/* Formulario de pago */}
      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(245,158,11,0.3)', borderRadius: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {editing ? 'Editar Pago' : 'Nuevo Pago'}
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 130px', gap: 10 }}>
            <input
              type="text"
              value={form.concepto}
              onChange={(e) => set('concepto', e.target.value)}
              placeholder="Concepto (Ej: Señal, Saldo, Cuota 1/3...)"
              className="input-dark"
              style={input()}
            />
            <select value={form.moneda} onChange={(e) => set('moneda', e.target.value as 'ARS' | 'USD')} className="input-dark" style={input()}>
              <option value="ARS">ARS ($)</option>
              <option value="USD">USD (u$s)</option>
            </select>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>$</span>
              <input
                type="number"
                value={form.monto}
                onChange={(e) => set('monto', e.target.value)}
                placeholder="Monto"
                className="input-dark"
                style={input({ paddingLeft: 22 })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <select value={form.forma_pago} onChange={(e) => set('forma_pago', e.target.value)} className="input-dark" style={input()}>
              {FORMAS.map((f) => (
                <option key={f} value={f}>{FORMA_LABEL[f]}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.fecha_pago}
              onChange={(e) => set('fecha_pago', e.target.value)}
              className="input-dark"
              style={input()}
              title="Fecha del pago"
            />
            <input
              type="date"
              value={form.fecha_vencimiento}
              onChange={(e) => set('fecha_vencimiento', e.target.value)}
              className="input-dark"
              style={input()}
              title="Fecha de vencimiento (cuotas/alertas)"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'center' }}>
            <select value={form.estado} onChange={(e) => set('estado', e.target.value as CrmPago['estado'])} className="input-dark" style={input()}>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(148,163,184,0.9)', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.es_cuota}
                onChange={(e) => set('es_cuota', e.target.checked)}
                style={{ accentColor: '#F59E0B', width: 15, height: 15 }}
              />
              Es cuota
            </label>
            {form.es_cuota && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  value={form.cuota_numero}
                  onChange={(e) => set('cuota_numero', e.target.value)}
                  placeholder="Cuota N°"
                  className="input-dark"
                  style={input({ width: '50%' })}
                />
                <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: 12 }}>/</span>
                <input
                  type="number"
                  value={form.cuota_total}
                  onChange={(e) => set('cuota_total', e.target.value)}
                  placeholder="Total"
                  className="input-dark"
                  style={input({ width: '50%' })}
                />
              </div>
            )}
          </div>

          <textarea
            value={form.notas}
            onChange={(e) => set('notas', e.target.value)}
            placeholder="Notas del pago (opcional)"
            rows={2}
            style={{
              width: '100%', padding: 12, background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 10,
              color: '#F0F4FF', fontSize: 12, resize: 'vertical', outline: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={() => { setShowForm(false); setEditing(null) }}
              style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#94A3B8', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="btn-cta"
              style={{ height: 38, padding: '0 18px', fontSize: 12 }}
            >
              {saving ? <Loader2 className="animate-spin" size={15} /> : <Wallet size={15} />}
              {editing ? 'Actualizar Pago' : 'Guardar Pago'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de pagos */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8', fontSize: 13, padding: 8 }}>
          <Loader2 className="animate-spin" size={16} /> Cargando pagos...
        </div>
      ) : (pagos || []).length === 0 ? (
        <div style={{ padding: '28px 16px', textAlign: 'center', color: 'rgba(100,116,139,0.5)', fontSize: 12, border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 14 }}>
          No hay pagos registrados para esta cotización.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(pagos || []).map((p) => {
            const vencido = p.estado === 'pendiente' && p.fecha_vencimiento && p.fecha_vencimiento < hoy
            return (
              <div
                key={p.id}
                style={{
                  padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${vencido ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF' }}>{p.concepto}</span>
                    {p.es_cuota && p.cuota_numero && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 99 }}>
                        CUOTA {p.cuota_numero}{p.cuota_total ? `/${p.cuota_total}` : ''}
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                      color: ESTADO_COLOR[p.estado],
                      background: `${ESTADO_COLOR[p.estado]}14`,
                      padding: '2px 8px', borderRadius: 99,
                    }}>
                      {p.estado}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.7)' }}>
                    {p.forma_pago ? `${FORMA_LABEL[p.forma_pago] || p.forma_pago} · ` : ''}
                    {p.fecha_pago ? `Pagado el ${new Date(p.fecha_pago + 'T00:00:00').toLocaleDateString('es-AR')}` : 'Sin fecha de pago'}
                    {p.fecha_vencimiento && ` · Vence ${new Date(p.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}`}
                    {p.notas ? ` · ${p.notas}` : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: vencido ? '#F87171' : '#F0F4FF', whiteSpace: 'nowrap' }}>
                    {p.moneda === 'ARS' ? '$' : 'u$s'} {money(p.monto)}
                  </span>
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
                    onClick={() => openEdit(p)}
                    title="Editar"
                    style={{ background: 'none', border: 'none', color: 'rgba(148,163,184,0.7)', cursor: 'pointer', padding: 4, display: 'flex' }}
                  >
                    <Edit3 size={15} />
                  </button>
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
