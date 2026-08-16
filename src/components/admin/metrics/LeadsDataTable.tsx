import { useState, useMemo } from 'react'
import type { TravelQuoteRow } from '@/lib/supabase'
import { buildCsv, downloadCsv, formatCurrencyForCsv } from '@/lib/exportCsv'
import { getEstadoLabel } from '@/lib/estados'
import { Search, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react'

interface LeadsDataTableProps {
  data: Partial<TravelQuoteRow>[]
  onRowClick?: (id: string) => void
}

const ITEMS_PER_PAGE = 15

export function LeadsDataTable({ data, onRowClick }: LeadsDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('todos')

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Status filter
      if (statusFilter !== 'todos' && item.estado !== statusFilter) return false
      
      // Search term
      if (searchTerm) {
        const s = searchTerm.toLowerCase()
        const matchesName = `${item.nombre || ''} ${item.apellido || ''}`.toLowerCase().includes(s)
        const matchesEmail = (item.email || '').toLowerCase().includes(s)
        const matchesDni = (item.dni || '').includes(s)
        if (!matchesName && !matchesEmail && !matchesDni) return false
      }
      
      return true
    })
  }, [data, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1
  
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredData, currentPage])

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p)
    }
  }

  const handleExportCsv = () => {
    const rows = filteredData.map(it => {
      const details = it.pricing_detalles
      let precioText = ''
      if (details) {
        let total = 0
        if (details.proveedor_seleccionado && (!details.servicios || details.servicios.length === 0)) {
          total = details.proveedores?.find(p => p.nombre === details.proveedor_seleccionado)?.precio_final || 0
        } else if (details.servicios && details.servicios.length > 0) {
          const totalCosto = details.servicios.reduce((acc, s) => acc + s.costo, 0)
          total = totalCosto + (details.markup_tipo === 'porcentaje' ? totalCosto * (details.markup_valor / 100) : details.markup_valor)
        }
        if (total > 0) precioText = formatCurrencyForCsv(details.moneda, total)
      }
      return [
        it.ticket_id || '',
        `${it.nombre || ''} ${it.apellido || ''}`,
        it.email || '',
        it.celular || '',
        it.destino_personalizado || it.destino || '',
        it.operador_nombre || '',
        getEstadoLabel(it.estado as TravelQuoteRow['estado']),
        precioText,
        (it.adultos || 0) + (it.ninos_2_12 || 0) + (it.bebes_0_2 || 0),
        it.fecha_salida ? String(it.fecha_salida).slice(0, 10) : '',
        it.created_at ? String(it.created_at).slice(0, 10) : '',
      ]
    })
    downloadCsv(`leads_${new Date().toISOString().slice(0, 10)}.csv`, buildCsv(
      ['Ticket', 'Cliente', 'Email', 'Celular', 'Destino', 'Operador', 'Estado', 'Precio', 'Pax', 'Fecha Salida', 'Fecha Ingreso'],
      rows
    ))
  }

  return (
    <div className="glass-card" style={{ padding: 24, borderRadius: 20, background: 'rgba(15,30,53,0.6)', marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#F0F4FF', marginBottom: 4 }}>Lista de Leads Recientes</h4>
          <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)' }}>
            Mostrando {filteredData.length} resultados
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleExportCsv}
            disabled={filteredData.length === 0}
            title="Exportar CSV de la vista filtrada"
            style={{
              height: 38, padding: '0 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)', color: '#F0F4FF', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s',
              opacity: filteredData.length === 0 ? 0.4 : 1, whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
          >
            <Download size={14} />
            Exportar Excel
          </button>
          <select 
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            className="input-dark"
            style={{ width: 140, height: 38 }}
          >
            <option value="todos">Todos los Estados</option>
            <option value="no_cotizado">Nuevos</option>
            <option value="en_cotizacion">Cotizando</option>
            <option value="cotizado">Cotizados</option>
            <option value="enviado_cliente">Enviados</option>
            <option value="concretado">Concretados</option>
            <option value="cancelado">Cancelados</option>
          </select>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.6)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, dni..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="input-dark"
              style={{ width: 220, height: 38, paddingLeft: 34 }}
            />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.9)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Cliente</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Contacto</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Destinos</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Estado</th>
              <th style={{ padding: '12px 16px', fontWeight: 800 }}>Fecha Ingreso</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'rgba(148,163,184,0.5)', fontSize: 13 }}>
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              currentData.map((row) => (
                <tr 
                  key={row.id} 
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.03)', 
                    transition: 'background 0.15s',
                    cursor: onRowClick ? 'pointer' : 'default'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => onRowClick && onRowClick(row.id as string)}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF' }}>{row.nombre} {row.apellido}</p>
                    <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.7)' }}>DNI: {row.dni}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: 12, color: '#E2E8F0' }}>{row.email}</p>
                    <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.7)' }}>{row.celular}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {row.destinos?.slice(0, 2).map((d: string) => (
                        <span key={d} style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 6 }}>{d.replace(/_/g, ' ')}</span>
                      ))}
                      {(row.destinos?.length || 0) > 2 && <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.6)' }}>+{(row.destinos?.length || 0) - 2}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ 
                      fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 99, 
                      background: 'rgba(255,255,255,0.05)', color: '#94A3B8', textTransform: 'uppercase'
                    }}>
                      {row.estado?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(148,163,184,0.9)' }}>
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('es-AR') : ''}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer' }} title="Ver Detalle">
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>
            Página {currentPage} de {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : '#E2E8F0', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : '#E2E8F0', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
