import { useState } from 'react'
import { updateQuoteDetails, type TravelQuoteRow, type CotizacionDetalles, type PasajeroDetalle } from '@/lib/supabase'
import { Save, Plus, Trash2, Loader2, Users } from 'lucide-react'

interface QuoteCotizacionTabProps {
  quote: TravelQuoteRow
}

interface PasajeroRow extends PasajeroDetalle {
  _id: string
}

const EMPTY_PAX: PasajeroDetalle = {
  nombre: '',
  apellido: '',
  dni: '',
  pasaporte: '',
  fecha_nacimiento: '',
  edad: '',
  observaciones: '',
  pedidos_especiales: '',
}

export function QuoteCotizacionTab({ quote }: QuoteCotizacionTabProps) {
  const [detalles, setDetalles] = useState<CotizacionDetalles>(() => {
    const base = quote.cotizacion_detalles || {}
    return {
      observaciones: base.observaciones || '',
      pasajeros: (base.pasajeros || []).map((p) => ({ ...p, _id: crypto.randomUUID() })),
    } as CotizacionDetalles
  })
  const [saving, setSaving] = useState(false)

  const pasajeros = (detalles.pasajeros || []) as PasajeroRow[]

  const updatePax = (id: string, field: keyof PasajeroDetalle, value: string) => {
    setDetalles((d) => ({
      ...d,
      pasajeros: (d.pasajeros as PasajeroRow[]).map((p) =>
        p._id === id ? { ...p, [field]: value } : p
      ),
    }))
  }

  const addPax = () => {
    setDetalles((d) => ({
      ...d,
      pasajeros: [...(d.pasajeros || []), { ...EMPTY_PAX, _id: crypto.randomUUID() }],
    }))
  }

  const removePax = (id: string) => {
    setDetalles((d) => ({
      ...d,
      pasajeros: (d.pasajeros as PasajeroRow[]).filter((p) => p._id !== id),
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload: CotizacionDetalles = {
        observaciones: detalles.observaciones || '',
        pasajeros: (detalles.pasajeros ?? []).map((p) => {
          const { _id, ...rest } = p as PasajeroRow
          void _id
          return rest
        }),
      }
      await updateQuoteDetails(quote.id, { cotizacion_detalles: payload })
      alert('✓ Detalle de cotización guardado')
    } catch (err) {
      console.error(err)
      alert('Error al guardar el detalle de cotización')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Observaciones de la cotización */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label className="input-label">Observaciones de la Cotización</label>
        <textarea
          value={detalles.observaciones || ''}
          onChange={(e) => setDetalles((d) => ({ ...d, observaciones: e.target.value }))}
          placeholder="Condiciones de venta, vigencia del precio, detalles no incluidos, advertencias..."
          rows={4}
          style={{
            width: '100%', padding: 14, background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 14,
            color: '#F0F4FF', fontSize: 13, resize: 'vertical', outline: 'none',
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* Pasajeros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#F0F4FF', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={15} style={{ color: '#F59E0B' }} />
          Pasajeros de la Cotización ({pasajeros.length})
        </h4>
        <button
          onClick={addPax}
          style={{
            padding: '7px 14px', borderRadius: 10, background: 'rgba(52,211,153,0.1)',
            border: '1.5px solid rgba(52,211,153,0.3)', color: '#34D399',
            fontSize: 11, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <Plus size={13} /> Agregar Pasajero
        </button>
      </div>

      {pasajeros.length === 0 ? (
        <div style={{ padding: '28px 16px', textAlign: 'center', color: 'rgba(100,116,139,0.5)', fontSize: 12, border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 14 }}>
          Aún no se cargaron los pasajeros. Usá "Agregar Pasajero" para detallar nombres, DNI, pasaporte, edades y pedidos especiales.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pasajeros.map((pax, idx) => (
            <div
              key={pax._id}
              style={{
                padding: 14, background: 'rgba(255,255,255,0.03)',
                border: '1.5px solid rgba(255,255,255,0.06)', borderRadius: 14,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pasajero {idx + 1}
                </span>
                <button
                  onClick={() => removePax(pax._id)}
                  style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F87171')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(248,113,113,0.5)')}
                  title="Quitar pasajero"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  type="text"
                  value={pax.nombre}
                  onChange={(e) => updatePax(pax._id, 'nombre', e.target.value)}
                  placeholder="Nombre *"
                  className="input-dark"
                  style={{ height: 38, minHeight: 38, fontSize: 12 }}
                />
                <input
                  type="text"
                  value={pax.apellido || ''}
                  onChange={(e) => updatePax(pax._id, 'apellido', e.target.value)}
                  placeholder="Apellido"
                  className="input-dark"
                  style={{ height: 38, minHeight: 38, fontSize: 12 }}
                />
                <input
                  type="text"
                  value={pax.dni || ''}
                  onChange={(e) => updatePax(pax._id, 'dni', e.target.value)}
                  placeholder="DNI"
                  className="input-dark"
                  style={{ height: 38, minHeight: 38, fontSize: 12 }}
                />
                <input
                  type="text"
                  value={pax.pasaporte || ''}
                  onChange={(e) => updatePax(pax._id, 'pasaporte', e.target.value)}
                  placeholder="Pasaporte"
                  className="input-dark"
                  style={{ height: 38, minHeight: 38, fontSize: 12 }}
                />
                <input
                  type="date"
                  value={pax.fecha_nacimiento || ''}
                  onChange={(e) => updatePax(pax._id, 'fecha_nacimiento', e.target.value)}
                  className="input-dark"
                  title="Fecha de nacimiento"
                  style={{ height: 38, minHeight: 38, fontSize: 12, padding: '0 8px' }}
                />
                <input
                  type="text"
                  value={pax.edad || ''}
                  onChange={(e) => updatePax(pax._id, 'edad', e.target.value)}
                  placeholder="Edad"
                  className="input-dark"
                  style={{ height: 38, minHeight: 38, fontSize: 12 }}
                />
              </div>

              <input
                type="text"
                value={pax.pedidos_especiales || ''}
                onChange={(e) => updatePax(pax._id, 'pedidos_especiales', e.target.value)}
                placeholder="Pedidos especiales (dieta, accesibilidad, asiento, etc.)"
                className="input-dark"
                style={{ height: 38, minHeight: 38, fontSize: 12 }}
              />
              <input
                type="text"
                value={pax.observaciones || ''}
                onChange={(e) => updatePax(pax._id, 'observaciones', e.target.value)}
                placeholder="Observaciones del pasajero"
                className="input-dark"
                style={{ height: 38, minHeight: 38, fontSize: 12 }}
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="btn-cta"
        style={{ alignSelf: 'flex-end', height: 44, padding: '0 20px', fontSize: 13 }}
      >
        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        {saving ? 'Guardando...' : 'Guardar Detalle de Cotización'}
      </button>
    </div>
  )
}
