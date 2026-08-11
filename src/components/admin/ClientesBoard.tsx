import { useState } from 'react'
import {
  useClientes,
  useDeleteCliente,
  useSyncClientes,
} from '@/hooks/useClientesQuery'
import {
  Plus, X, User, Users, Phone, Pencil, Trash2, Mail, Loader2, RefreshCw, IdCard,
} from 'lucide-react'
import type { Cliente } from '@/lib/supabase'
import { ClienteDetail } from './ClienteDetail'
import { ClienteFormModal } from './ClienteFormModal'

const FILTERS = [
  { id: 'all', label: 'Todos', icon: Users },
  { id: 'nombre', label: 'Nombre', icon: User },
  { id: 'apellido', label: 'Apellido', icon: User },
  { id: 'dni', label: 'DNI', icon: IdCard },
  { id: 'celular', label: 'Celular', icon: Phone },
  { id: 'email', label: 'Email', icon: Mail },
] as const

type FilterId = (typeof FILTERS)[number]['id']

const PLACEHOLDER: Record<FilterId, string> = {
  all: 'Buscar por nombre, apellido, DNI, celular o email...',
  nombre: 'Buscar por nombre...',
  apellido: 'Buscar por apellido...',
  dni: 'Buscar por DNI (ej: 40437410)...',
  celular: 'Buscar por celular...',
  email: 'Buscar por email...',
}

const cleanDigits = (v: string) => v.replace(/\D/g, '')

export function ClientesBoard() {
  const { data: clientes, isLoading, refetch } = useClientes()
  const deleteMutation = useDeleteCliente()
  const syncMutation = useSyncClientes()

  const [filterField, setFilterField] = useState<FilterId>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Cliente | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)

  const filtered = (clientes || []).filter(c => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    switch (filterField) {
      case 'nombre': return c.nombre.toLowerCase().includes(q)
      case 'apellido': return (c.apellido || '').toLowerCase().includes(q)
      case 'dni': return cleanDigits(c.dni || '').includes(cleanDigits(q))
      case 'celular': return cleanDigits(c.celular || '').includes(cleanDigits(q))
      case 'email': return (c.email || '').toLowerCase().includes(q)
      default:
        return `${c.nombre} ${c.apellido || ''} ${c.dni || ''} ${c.celular || ''} ${c.email || ''}`.toLowerCase().includes(q)
    }
  })

  const FilterIcon = FILTERS.find(f => f.id === filterField)?.icon || Users

  const openNew = () => { setEditing(null); setShowForm(true) }
  const openEdit = (c: Cliente) => { setSelected(null); setEditing(c); setShowForm(true) }

  const handleDeleted = async (c: Cliente) => {
    if (!window.confirm(`¿Eliminar al cliente "${c.nombre} ${c.apellido}" y todas sus relaciones?`)) return
    try {
      await deleteMutation.mutateAsync(c.id)
      setSelected(null)
    } catch (err) {
      console.error(err)
      alert('Error al eliminar el cliente.')
    }
  }

  const handleSync = async () => {
    if (!window.confirm('¿Crear/actualizar fichas de clientes desde los presupuestos que no tienen cliente vinculado?')) return
    try {
      const res = await syncMutation.mutateAsync()
      refetch()
      alert(`✓ ${res.creados} cliente(s) creado(s) y ${res.vinculados} presupuesto(s) vinculado(s).`)
    } catch (err) {
      console.error(err)
      alert('Error al sincronizar. Revisá la consola.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={24} className="text-gold" /> Clientes
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Ficha maestra por persona. Filtrá por nombre, DNI, celular o email y obtené sus datos, familia y histórico de viajes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="btn-secondary"
            style={{ height: 44, padding: '0 16px', fontSize: 13 }}
            title="Crea/actualiza fichas de clientes a partir de los presupuestos sin vincular"
          >
            {syncMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar desde presupuestos'}
          </button>
          <button onClick={openNew} className="btn-cta" style={{ height: 44, padding: '0 20px', fontSize: 14 }}>
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Filters + search */}
      <div className="glass-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FILTERS.map((f) => {
            const active = filterField === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFilterField(f.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 99, cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: active ? 'rgba(245,158,11,0.14)' : 'var(--surface-2)',
                  border: active ? '1.5px solid rgba(245,158,11,0.45)' : '1.5px solid var(--surface-3)',
                  color: active ? '#FBBF24' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                <f.icon size={13} /> {f.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px', minWidth: 200, position: 'relative' }}>
            <FilterIcon size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={PLACEHOLDER[filterField]}
              style={{
                width: '100%', height: 42, paddingLeft: 36, paddingRight: 30, borderRadius: 10,
                background: 'var(--surface-2)', border: '1.5px solid var(--surface-3)',
                color: 'var(--ink)', fontSize: 13, outline: 'none',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: 11, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            )}
          </div>
          <button
            onClick={() => refetch()}
            style={{ width: 42, height: 42, borderRadius: 10, border: '1.5px solid var(--surface-3)', background: 'var(--surface-2)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Refrescar"
          >
            <Loader2 size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {search.trim() && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="glass-card" style={{ padding: 20 }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
            <Loader2 size={18} className="animate-spin" /> Cargando clientes...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={30} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
            {search ? 'No se encontraron clientes con esa búsqueda.' : 'Todavía no hay clientes cargados.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '88px 1.6fr 1fr 1.2fr 90px',
              gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--surface-2)',
              color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              <span></span>
              <span>Nombre</span>
              <span>DNI</span>
              <span>Contacto</span>
              <span style={{ textAlign: 'right' }}>Acciones</span>
            </div>

            {filtered.map(c => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  display: 'grid', gridTemplateColumns: '88px 1.6fr 1fr 1.2fr 90px',
                  gap: 12, alignItems: 'center', padding: '12px 14px',
                  background: 'var(--surface-2)', borderRadius: 10,
                  border: '1.5px solid var(--surface-2)', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.05)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--surface-2)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
                    {c.nombre[0]}{c.apellido ? c.apellido[0].toUpperCase() : ''}
                  </div>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13 }}>{c.nombre} {c.apellido}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.dni || '—'}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  {c.celular && <span style={{ fontSize: 12, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={11} /> {c.celular}</span>}
                  {c.email && <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={11} /> {c.email}</span>}
                  {!c.celular && !c.email && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(c) }}
                    style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60A5FA', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleted(c) }}
                    style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <ClienteDetail
          cliente={selected}
          onClose={() => setSelected(null)}
          onEdit={openEdit}
          onDelete={handleDeleted}
        />
      )}

      {/* Form modal */}
      {showForm && (
        <ClienteFormModal
          cliente={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}