import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  useRelacionesCliente,
  useClientesViajes,
  useAddRelacion,
  useRemoveRelacion,
  useClientes,
} from '@/hooks/useClientesQuery'
import {
  X, User, Users, Pencil, Trash2, Plus, Search, Loader2, Plane, Phone, Mail, IdCard, Link2, Unlink,
} from 'lucide-react'
import type { Cliente, ClienteTipoRelacion } from '@/lib/supabase'

const REL_LABEL: Record<ClienteTipoRelacion, { label: string; emoji: string; color: string }> = {
  pareja: { label: 'Pareja', emoji: '💞', color: '#F472B6' },
  familia: { label: 'Familia', emoji: '👨‍👩‍👧‍👦', color: '#34D399' },
  amigo: { label: 'Amigo', emoji: '🤝', color: '#60A5FA' },
  otro: { label: 'Otro', emoji: '🔗', color: 'var(--text-muted)' },
}

const ESTADO_LABEL: Record<string, string> = {
  no_cotizado: 'No cotizado',
  en_cotizacion: 'En cotización',
  cotizado: 'Cotizado',
  enviado_cliente: 'Enviado a cliente',
  concretado: 'Concretado',
  cancelado: 'Cancelado',
}

interface Props {
  cliente: Cliente
  onClose: () => void
  onEdit: (c: Cliente) => void
  onDelete: (c: Cliente) => void
}

export function ClienteDetail({ cliente, onClose, onEdit, onDelete }: Props) {
  const [tab, setTab] = useState<'datos' | 'relaciones' | 'viajes'>('datos')

  const { data: relaciones, isLoading: relLoading } = useRelacionesCliente(cliente.id)
  const { data: viajes, isLoading: viajesLoading } = useClientesViajes(cliente.id)
  const { data: todos, isLoading: todosLoading } = useClientes()

  const addRelacion = useAddRelacion(cliente.id)
  const removeRelacion = useRemoveRelacion(cliente.id)

  const [showPicker, setShowPicker] = useState(false)
  const [targetFilter, setTargetFilter] = useState('')
  const [targetId, setTargetId] = useState<string | null>(null)
  const [relTipo, setRelTipo] = useState<ClienteTipoRelacion>('pareja')
  const [relNota, setRelNota] = useState('')

  const relatedId = (r: { cliente_id: string; relacionado_id: string }) =>
    r.cliente_id === cliente.id ? r.relacionado_id : r.cliente_id

  const alreadyRelated = (id: string) => (relaciones || []).some(r => relatedId(r) === id)

  const candidates = (todosLoading ? [] : todos || [])
    .filter(c => c.id !== cliente.id && !alreadyRelated(c.id))
    .filter(c => {
      if (!targetFilter.trim()) return true
      const q = targetFilter.trim().toLowerCase()
      return `${c.nombre} ${c.apellido} ${c.dni || ''} ${c.celular || ''} ${c.email || ''}`.toLowerCase().includes(q)
    })

  const handleAdd = async () => {
    if (!targetId) return
    try {
      await addRelacion.mutateAsync({ relacionadoId: targetId, tipo: relTipo, nota: relNota || undefined })
      setShowPicker(false); setTargetId(null); setTargetFilter(''); setRelNota('')
    } catch (err) {
      console.error(err); alert('No se pudo vincular. Revisá que el cliente no esté ya relacionado.')
    }
  }

  const handleRemove = async (rel: { id: string }) => {
    if (!window.confirm('¿Desvincular esta relación?')) return
    try {
      await removeRelacion.mutateAsync(rel.id)
    } catch (err) { console.error(err); alert('Error al desvincular.') }
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: 16,
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: 720, maxHeight: '92vh', margin: 'auto',
        background: 'linear-gradient(160deg, var(--surface-3) 0%, var(--surface-3) 100%)',
        borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>
              {cliente.nombre[0]}{cliente.apellido ? cliente.apellido[0].toUpperCase() : ''}
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ficha de Cliente</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginTop: 1 }}>
                {cliente.nombre} {cliente.apellido}
              </h3>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => onEdit(cliente)} title="Editar" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60A5FA', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(cliente)} title="Eliminar" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Trash2 size={14} />
            </button>
            <button onClick={onClose} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '0 24px', background: 'rgba(0,0,0,0.12)' }}>
          {([
            { id: 'datos', label: 'Datos', icon: User },
            { id: 'relaciones', label: `Relaciones (${relaciones?.length || 0})`, icon: Users },
            { id: 'viajes', label: `Viajes (${viajes?.length || 0})`, icon: Plane },
          ] as const).map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '12px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                background: 'none', border: 'none', borderBottom: active ? '2px solid #F59E0B' : '2px solid transparent',
                color: active ? '#FBBF24' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <t.icon size={14} /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {tab === 'datos' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <Field icon={<IdCard size={14} />} label="DNI" value={cliente.dni} />
              <Field icon={<Phone size={14} />} label="Celular / WhatsApp" value={cliente.celular} />
              <Field icon={<Mail size={14} />} label="Email" value={cliente.email} />
              <Field icon={<Plane size={14} />} label="Pasaporte" value={cliente.pasaporte} />
              <Field icon={<User size={14} />} label="F. Nacimiento" value={cliente.fecha_nacimiento} />
              <Field icon={<User size={14} />} label="Dirección" value={cliente.direccion} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Field icon={<User size={14} />} label="Notas" value={cliente.notas} />
              </div>
            </div>
          )}

          {tab === 'relaciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setShowPicker(true)} className="btn-cta" style={{ height: 40, alignSelf: 'flex-start', fontSize: 13 }}>
                <Plus size={15} /> Vincular con otro cliente
              </button>

              {showPicker && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, background: 'var(--surface-2)', border: '1.5px solid var(--surface-3)', borderRadius: 14 }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input value={targetFilter} onChange={e => { setTargetFilter(e.target.value); setTargetId(null) }} placeholder="Buscar cliente para vincular (nombre, DNI, cel.)..." style={{ width: '100%', height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 10, background: 'var(--surface-2)', border: '1.5px solid var(--surface-3)', color: 'var(--ink)', fontSize: 13, outline: 'none' }} />
                  </div>

                  {targetFilter.trim() && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
                      {candidates.length === 0 && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 8 }}>Sin resultados.</div>
                      )}
                      {candidates.slice(0, 8).map(c => (
                        <button key={c.id} onClick={() => { setTargetId(c.id); setTargetFilter(`${c.nombre} ${c.apellido}`) }} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 10px', textAlign: 'left', cursor: 'pointer',
                          background: targetId === c.id ? 'rgba(245,158,11,0.12)' : 'var(--surface-2)',
                          border: targetId === c.id ? '1.5px solid rgba(245,158,11,0.35)' : '1px solid var(--surface-2)', borderRadius: 8,
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{c.nombre} {c.apellido}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.dni || c.celular || c.email || '—'}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tipo</span>
                      <select value={relTipo} onChange={e => setRelTipo(e.target.value as ClienteTipoRelacion)} style={{ height: 38, background: 'var(--surface-2)', border: '1.5px solid var(--surface-3)', borderRadius: 10, color: 'var(--ink)', fontSize: 12, padding: '0 10px' }}>
                        <option value="pareja" style={{ background: 'var(--surface-2)' }}>💞 Pareja</option>
                        <option value="familia" style={{ background: 'var(--surface-2)' }}>👨‍👩‍👧‍👦 Familia</option>
                        <option value="amigo" style={{ background: 'var(--surface-2)' }}>🤝 Amigo</option>
                        <option value="otro" style={{ background: 'var(--surface-2)' }}>🔗 Otro</option>
                      </select>
                    </div>
                    <input value={relNota} onChange={e => setRelNota(e.target.value)} placeholder="Nota (opcional)" style={{ flex: 1, minWidth: 120, height: 40, padding: '0 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1.5px solid var(--surface-3)', color: 'var(--ink)', fontSize: 13, outline: 'none' }} />
                    <button
                      onClick={handleAdd}
                      disabled={!targetId || addRelacion.isPending}
                      style={{ height: 40, padding: '0 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 800, background: '#F59E0B', color: 'var(--ink)', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {addRelacion.isPending ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} Vincular
                    </button>
                  </div>
                </div>
              )}

              {relLoading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando relaciones...</div>
              ) : (relaciones || []).length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'rgba(100,116,139,0.5)', fontSize: 13 }}>
                  Sin relaciones aún. Vinculá a este cliente con familia, pareja o amigos.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(relaciones || []).map(r => {
                    const rel = r.relacionado
                    const meta = REL_LABEL[r.tipo]
                    return (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--surface-2)', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${meta.color}22`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {rel ? `${rel.nombre} ${rel.apellido}` : '—'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              <span style={{ color: meta.color, fontWeight: 700 }}>{meta.label}</span>
                              {r.nota ? ` · ${r.nota}` : ''} · {rel?.dni || rel?.celular || '—'}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleRemove(r)} title="Desvincular" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Unlink size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'viajes' && (
            viajesLoading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando historial...</div>
            ) : (viajes || []).length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'rgba(100,116,139,0.5)', fontSize: 13 }}>
                Sin viajes registrados todavía.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(viajes || []).map(v => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--surface-2)', borderRadius: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(96,165,250,0.15)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Plane size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.destino || 'Viaje'}
                        {v.ticket_id ? ` · #${v.ticket_id}` : ''}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {v.fecha_salida ? formatVacio(new Date(v.fecha_salida)) : ''}{v.fecha_salida && v.fecha_regreso ? ' → ' : ''}{v.fecha_regreso ? formatVacio(new Date(v.fecha_regreso)) : ''}
                        {' · '}<span className="" style={{ color: ESTADO_COLORS[v.estado || ''] || 'var(--text-muted)', fontWeight: 700 }}>{ESTADO_LABEL[v.estado || ''] || v.estado}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatFechaCorta(new Date(v.created_at))}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string | number | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid var(--surface-2)', borderRadius: 12, minWidth: 0 }}>
      {icon && (
        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', wordBreak: 'break-word' }}>{value || '—'}</div>
      </div>
    </div>
  )
}

const ESTADO_COLORS: Record<string, string> = {
  no_cotizado: 'var(--text-muted)', en_cotizacion: '#FB923C', cotizado: '#FBBF24',
  enviado_cliente: '#818CF8', concretado: '#34D399', cancelado: '#F87171',
}

function formatVacio(d: Date) {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatFechaCorta(d: Date) {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}