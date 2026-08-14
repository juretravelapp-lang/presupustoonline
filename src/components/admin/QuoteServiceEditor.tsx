import { useState, useEffect } from 'react'
import { Save, Loader2, Plus, Trash2 } from 'lucide-react'
import {
  type CrmQuoteService,
  type CrmServicio,
  type CrmPago,
  updateQuoteService,
  getPagosByQuote,
  crearPago,
  updatePago,
  deletePago,
} from '@/lib/supabase'

interface QuoteServiceEditorProps {
  quoteService: CrmQuoteService
  onUpdate: (srv: CrmQuoteService) => void
}

export function QuoteServiceEditor({ quoteService, onUpdate }: QuoteServiceEditorProps) {
  const [srv, setSrv] = useState<CrmQuoteService>(quoteService)
  const [pagos, setPagos] = useState<CrmPago[]>([])
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'comercial' | 'pagos' | 'operativo'>('comercial')

  useEffect(() => {
    fetchPagos()
  }, [quoteService.id])

  const fetchPagos = async () => {
    try {
      const allPagos = await getPagosByQuote(quoteService.quote_id)
      setPagos(allPagos.filter(p => p.quote_service_id === quoteService.id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateQuoteService(srv.id, {
        nombre: srv.nombre,
        descripcion: srv.descripcion,
        precio_total: srv.precio_total,
        moneda: srv.moneda,
        estado: srv.estado,
        fecha_desde: srv.fecha_desde,
        fecha_hasta: srv.fecha_hasta,
        detalles_operativos: srv.detalles_operativos
      })
      onUpdate(updated)
      alert('Servicio guardado')
    } catch (err) {
      console.error(err)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // --- Pagos logic ---
  const handleAddPago = async () => {
    try {
      const newPago = await crearPago({
        quote_id: srv.quote_id,
        quote_service_id: srv.id,
        cliente_id: null,
        ticket_id: null,
        cliente_nombre: null,
        concepto: `Pago ${srv.nombre}`,
        moneda: srv.moneda,
        monto: 0,
        forma_pago: '',
        fecha_pago: null,
        fecha_vencimiento: null,
        estado: 'pendiente',
        es_cuota: true,
        cuota_numero: pagos.length + 1,
        cuota_total: null,
        notas: ''
      })
      setPagos([...pagos, newPago])
    } catch (err) {
      console.error(err)
      alert('Error creando pago')
    }
  }

  const handleUpdatePago = async (id: string, field: keyof CrmPago, value: any) => {
    try {
      const updated = await updatePago(id, { [field]: value })
      setPagos(pagos.map(p => p.id === id ? updated : p))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePago = async (id: string) => {
    if (!confirm('¿Eliminar pago?')) return
    try {
      await deletePago(id)
      setPagos(pagos.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const sumPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
        {(['comercial', 'pagos', 'operativo'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              fontWeight: activeTab === tab ? 600 : 400,
              borderBottom: activeTab === tab ? '2px solid #60A5FA' : '2px solid transparent',
              padding: '4px 8px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'comercial' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="input-label">Nombre del servicio</label>
            <input className="input-dark" value={srv.nombre} onChange={e => setSrv({ ...srv, nombre: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="input-label">Estado</label>
            <select className="input-dark" value={srv.estado} onChange={e => setSrv({ ...srv, estado: e.target.value as any })}>
              <option value="cotizado">Cotizado</option>
              <option value="reservado">Reservado</option>
              <option value="confirmado">Confirmado</option>
              <option value="emitido">Emitido</option>
              <option value="cancelado">Cancelado</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="input-label">Moneda</label>
            <select className="input-dark" value={srv.moneda} onChange={e => setSrv({ ...srv, moneda: e.target.value as any })}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="input-label">Precio Total</label>
            <input type="number" className="input-dark" value={srv.precio_total} onChange={e => setSrv({ ...srv, precio_total: Number(e.target.value) })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="input-label">Fecha Desde</label>
            <input type="date" className="input-dark" value={srv.fecha_desde || ''} onChange={e => setSrv({ ...srv, fecha_desde: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label className="input-label">Fecha Hasta</label>
            <input type="date" className="input-dark" value={srv.fecha_hasta || ''} onChange={e => setSrv({ ...srv, fecha_hasta: e.target.value })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
            <label className="input-label">Descripción pública</label>
            <textarea className="input-dark" rows={2} value={srv.descripcion || ''} onChange={e => setSrv({ ...srv, descripcion: e.target.value })} />
          </div>
        </div>
      )}

      {activeTab === 'pagos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              Total Cotizado: <strong style={{ color: '#fff' }}>{srv.moneda} {srv.precio_total}</strong> <br/>
              Total Pagos Prog.: <strong style={{ color: sumPagos !== srv.precio_total ? '#F59E0B' : '#34D399' }}>{sumPagos}</strong>
            </div>
            <button onClick={handleAddPago} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Agregar Cuota
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pagos.map((p) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
                <input className="input-dark" value={p.concepto} onChange={e => handleUpdatePago(p.id, 'concepto', e.target.value)} placeholder="Concepto" />
                <div style={{ display: 'flex', gap: 4 }}>
                  <select className="input-dark" style={{ width: 70, padding: '0 4px' }} value={p.moneda} onChange={e => handleUpdatePago(p.id, 'moneda', e.target.value)}>
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                  <input type="number" className="input-dark" value={p.monto} onChange={e => handleUpdatePago(p.id, 'monto', e.target.value)} placeholder="Monto" />
                </div>
                <input type="date" className="input-dark" title="Vencimiento" value={p.fecha_vencimiento || ''} onChange={e => handleUpdatePago(p.id, 'fecha_vencimiento', e.target.value)} />
                <select className="input-dark" value={p.estado} onChange={e => handleUpdatePago(p.id, 'estado', e.target.value)}>
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                </select>
                <button onClick={() => handleDeletePago(p.id)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            ))}
            {pagos.length === 0 && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, padding: 16 }}>No hay pagos programados para este servicio.</div>}
          </div>
        </div>
      )}

      {activeTab === 'operativo' && (
        <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
           {/* Simple generic operative detail editor using a textarea for now, could be expanded to a dynamic form */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label className="input-label">Detalles Operativos (JSON)</label>
              <textarea 
                className="input-dark" 
                rows={10} 
                style={{ fontFamily: 'monospace', fontSize: 12 }}
                value={JSON.stringify(srv.detalles_operativos, null, 2)}
                onChange={e => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    setSrv({ ...srv, detalles_operativos: parsed })
                  } catch (err) {
                    // ignore until valid
                  }
                }}
              />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Editá la estructura JSON de reservas, tramos, pasajeros (temporal).</span>
           </div>
        </div>
      )}

      {/* Save action */}
      {activeTab !== 'pagos' && (
        <button onClick={handleSave} disabled={saving} className="btn-cta" style={{ alignSelf: 'flex-end', padding: '0 20px', height: 40 }}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Guardar Cambios
        </button>
      )}
    </div>
  )
}
