import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, ChevronDown, ChevronUp, Plane, Car, Hotel, Map, Loader2 } from 'lucide-react'
import {
  type TravelQuoteRow,
  type CrmQuoteService,
  type CrmServicio,
  getQuoteServices,
  createQuoteService,
  deleteQuoteService,
  supabase
} from '@/lib/supabase'
import { QuoteServiceEditor } from './QuoteServiceEditor'

interface QuoteBuilderTabProps {
  quote: TravelQuoteRow
}

export function QuoteBuilderTab({ quote }: QuoteBuilderTabProps) {
  const [services, setServices] = useState<CrmQuoteService[]>([])
  const [catalog, setCatalog] = useState<CrmServicio[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [isAdding, setIsAdding] = useState(false)
  const [newServiceType, setNewServiceType] = useState<string>('')
  
  useEffect(() => {
    fetchData()
  }, [quote.id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [srvData, catData] = await Promise.all([
        getQuoteServices(quote.id),
        supabase.from('crm_servicios').select('*').order('nombre')
      ])
      setServices(srvData)
      setCatalog(catData.data as CrmServicio[] || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async () => {
    if (!newServiceType) return
    const srv = catalog.find(c => c.id === newServiceType)
    if (!srv) return

    try {
      const newSrv = await createQuoteService({
        quote_id: quote.id,
        servicio_id: srv.id,
        nombre: srv.nombre,
        descripcion: srv.descripcion || '',
        proveedor: '',
        precio_total: 0,
        moneda: 'USD',
        fecha_desde: null,
        fecha_hasta: null,
        estado: 'cotizado',
        orden: services.length,
        notas: '',
        detalles_operativos: { tipo: srv.nombre.toLowerCase() }
      })
      setServices([...services, newSrv])
      setIsAdding(false)
      setNewServiceType('')
      setEditingId(newSrv.id)
    } catch (err) {
      console.error(err)
      alert('Error al agregar el servicio')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este servicio de la cotización?')) return
    try {
      await deleteQuoteService(id)
      setServices(services.filter(s => s.id !== id))
    } catch (err) {
      console.error(err)
      alert('Error al eliminar')
    }
  }

  const totalARS = services.filter(s => s.moneda === 'ARS').reduce((acc, s) => acc + Number(s.precio_total), 0)
  const totalUSD = services.filter(s => s.moneda === 'USD').reduce((acc, s) => acc + Number(s.precio_total), 0)

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Loader2 className="animate-spin text-gray-400" /></div>
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#fff', fontWeight: 600 }}>Servicios Cotizados</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          Gestiona cada servicio de manera independiente con su propio precio, moneda y detalle operativo.
        </p>
      </div>

      {/* Services List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {services.map(srv => (
          <div key={srv.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: 16, background: editingId === srv.id ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  {srv.nombre.toLowerCase().includes('vuelo') ? <Plane size={18} /> : 
                   srv.nombre.toLowerCase().includes('auto') ? <Car size={18} /> : 
                   srv.nombre.toLowerCase().includes('hotel') ? <Hotel size={18} /> : <Map size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{srv.nombre}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{srv.moneda} {Number(srv.precio_total).toLocaleString()} • {srv.estado}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => setEditingId(editingId === srv.id ? null : srv.id)}
                  style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  {editingId === srv.id ? <ChevronUp size={14} /> : <Edit size={14} />}
                  {editingId === srv.id ? 'Cerrar' : 'Editar'}
                </button>
                <button 
                  onClick={() => handleDelete(srv.id)}
                  style={{ padding: '6px 8px', borderRadius: 6, background: 'transparent', color: '#F87171', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            {editingId === srv.id && (
              <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                <QuoteServiceEditor 
                  quoteService={srv} 
                  catalog={catalog}
                  onUpdate={(updated) => setServices(services.map(s => s.id === updated.id ? updated : s))} 
                />
              </div>
            )}
          </div>
        ))}

        {services.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, color: 'rgba(255,255,255,0.4)' }}>
            No hay servicios en esta cotización.
          </div>
        )}
      </div>

      {/* Add Action */}
      {isAdding ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <select 
            className="input-dark" 
            style={{ flex: 1 }}
            value={newServiceType}
            onChange={e => setNewServiceType(e.target.value)}
          >
            <option value="">Seleccionar tipo de servicio...</option>
            {catalog.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <button onClick={handleAddService} className="btn-cta" disabled={!newServiceType} style={{ padding: '0 16px', height: 40 }}>
            Confirmar
          </button>
          <button onClick={() => setIsAdding(false)} style={{ padding: '0 16px', height: 40, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, 
            padding: 14, borderRadius: 12, background: 'rgba(52,211,153,0.1)', 
            border: '1px dashed rgba(52,211,153,0.3)', color: '#34D399', cursor: 'pointer',
            fontWeight: 600, fontSize: 13
          }}
        >
          <Plus size={16} /> Agregar Servicio
        </button>
      )}

      {/* Totals */}
      {(totalARS > 0 || totalUSD > 0) && (
        <div style={{ marginTop: 20, padding: 20, borderRadius: 14, background: 'linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8))', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: 14 }}>Total Cotización</h4>
          <div style={{ display: 'flex', gap: 32 }}>
            {totalARS > 0 && (
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>TOTAL ARS</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>$ {totalARS.toLocaleString()}</div>
              </div>
            )}
            {totalUSD > 0 && (
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>TOTAL USD</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>$ {totalUSD.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
