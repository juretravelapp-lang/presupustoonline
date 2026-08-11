import { useState } from 'react'
import { useDestinosList, useCreateDestino, useUpdateDestino, useDeleteDestino } from '@/hooks/useCatalogQuery'
import { Plus, Edit2, Trash2, Loader2, Globe } from 'lucide-react'
import type { CrmDestino } from '@/lib/supabase'

interface DestinoForm {
  nombre: string
  slug: string
  emoji: string
  color: string
  activo: boolean
  descripcion: string
}

export function DestinosBoard() {
  const { data: destinos, isLoading, refetch } = useDestinosList()
  const createMutation = useCreateDestino()
  const updateMutation = useUpdateDestino()
  const deleteMutation = useDeleteDestino()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<DestinoForm>({
    nombre: '', slug: '', emoji: '', color: 'var(--text-muted)', activo: true, descripcion: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  const resetForm = () => setFormData({ nombre: '', slug: '', emoji: '', color: 'var(--text-muted)', activo: true, descripcion: '' })

  const handleCreate = async () => {
    if (!formData.nombre || !formData.slug) return alert('Nombre y slug son obligatorios')
    await createMutation.mutateAsync({ nombre: formData.nombre, slug: formData.slug, emoji: formData.emoji, color: formData.color, activo: formData.activo, descripcion: formData.descripcion || null })
    resetForm(); setIsCreating(false); refetch()
  }

  const handleUpdate = async (id: string) => {
    if (!formData.nombre || !formData.slug) return alert('Nombre y slug son obligatorios')
    await updateMutation.mutateAsync({ id, nombre: formData.nombre, slug: formData.slug, emoji: formData.emoji, color: formData.color, activo: formData.activo, descripcion: formData.descripcion || null })
    setEditingId(null); resetForm(); refetch()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que querés eliminar este destino?')) {
      await deleteMutation.mutateAsync(id)
      refetch()
    }
  }

  const startEdit = (d: CrmDestino) => {
    setEditingId(d.id)
    setFormData({
      nombre: d.nombre, slug: d.slug, emoji: d.emoji || '', color: d.color || 'var(--text-muted)',
      activo: !!d.activo, descripcion: d.descripcion || '',
    })
    setIsCreating(false)
  }

  const activeOps = (createMutation.isPending || updateMutation.isPending || deleteMutation.isPending)

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={24} className="text-gold" /> Destinos Turísticos
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Gestioná los destinos populares que aparecen en el wizard de presupuestos.</p>
        </div>
        <button
          onClick={() => { setIsCreating(true); setEditingId(null); resetForm() }}
          className="btn-cta"
          style={{ height: 44, padding: '0 20px', fontSize: 14 }}
        >
          <Plus size={16} /> Nuevo Destino
        </button>
      </div>

      {!isCreating && !editingId && (
        <div className="glass-card" style={{ padding: 4, background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.18)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.5fr 0.6fr 0.8fr 0.6fr', gap: 10, padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span>Nombre</span>
            <span>Slug / Emoji</span>
            <span>Color</span>
            <span>Activo</span>
            <span>Descripción</span>
            <span className="justify-end">Acciones</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={24} /> Cargando destinos...
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          {(destinos || []).map((d: CrmDestino) => (
            <div key={d.id} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.5fr 0.6fr 0.8fr 0.6fr', gap: 10,
              alignItems: 'center', padding: '10px 16px',
              borderBottom: '1px solid var(--surface-2)',
            }}>
              {editingId === d.id ? (
                <>
                  <input className="input-dark" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData(f => ({ ...f, nombre: e.target.value }))} style={{ height: 36, fontSize: 13 }} />
                  <input className="input-dark" placeholder="Slug" value={formData.slug} onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))} style={{ height: 36, fontSize: 13 }} />
                  <input className="input-dark" placeholder="Emoji" value={formData.emoji} onChange={e => setFormData(f => ({ ...f, emoji: e.target.value }))} style={{ height: 36, fontSize: 13 }} />
                  <input type="color" value={formData.color} onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} className="w-full h-8 p-0 border-none bg-transparent cursor-pointer" />
                  <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13 }}>
                    <input type="checkbox" checked={formData.activo} onChange={e => setFormData(f => ({ ...f, activo: e.target.checked }))} /> Activo
                  </label>
                  <input className="input-dark" placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData(f => ({ ...f, descripcion: e.target.value }))} style={{ height: 36, fontSize: 13 }} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleUpdate(d.id)} disabled={updateMutation.isPending} className="btn-cta" style={{ height: 32, padding: '0 12px', fontSize: 12 }}>{updateMutation.isPending ? <Loader2 className="animate-spin" size={12} /> : 'Guardar'}</button>
                    <button onClick={() => { setEditingId(null); resetForm() }} className="btn-secondary" style={{ height: 32, padding: '0 12px', fontSize: 12 }}>Cancelar</button>
                  </div>
                </>
              ) : isCreating ? null : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                    <span style={{ fontSize: formData.emoji || d.emoji || '🗺️' }}>{d.emoji}</span> {d.nombre}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.slug}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: d.color || 'var(--text-muted)', display: 'inline-block', border: '1px solid var(--text-secondary)' }} />
                    {d.color}
                  </div>
                  <span style={{ fontSize: 11, color: d.activo ? '#34D399' : '#F87171', fontWeight: 700 }}>{d.activo ? 'Sí' : 'No'}</span>
                  <span className="truncate" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.descripcion}</span>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => startEdit(d)} className="action-btn" style={{ height: 28, width: 28, padding: 0 }} title="Editar">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(d.id)} disabled={deleteMutation.isPending} className="action-btn" style={{ height: 28, width: 28, padding: 0, color: '#F87171' }} title="Eliminar">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {isCreating && (
        <div className="glass-card" style={{ padding: 16, background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.18)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.5fr 0.6fr 0.8fr 0.6fr', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <input className="input-dark" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData(f => ({ ...f, nombre: e.target.value }))} style={{ height: 36, fontSize: 13 }} />
            <input className="input-dark" placeholder="Slug" value={formData.slug} onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))} style={{ height: 36, fontSize: 13 }} />
            <input className="input-dark" placeholder="Emoji" value={formData.emoji} onChange={e => setFormData(f => ({ ...f, emoji: e.target.value }))} style={{ height: 36, fontSize: 13 }} />
            <input type="color" value={formData.color} onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} className="w-full h-8 p-0 border-none bg-transparent cursor-pointer" />
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13 }}>
              <input type="checkbox" checked={formData.activo} onChange={e => setFormData(f => ({ ...f, activo: e.target.checked }))} /> Activo
            </label>
            <input className="input-dark" placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData(f => ({ ...f, descripcion: e.target.value }))} style={{ height: 36, fontSize: 13 }} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setIsCreating(false); resetForm() }} className="btn-secondary" style={{ height: 36, padding: '0 16px', fontSize: 13 }}>Cancelar</button>
            <button onClick={handleCreate} disabled={createMutation.isPending || activeOps} className="btn-cta" style={{ height: 36, padding: '0 16px', fontSize: 13 }}>{createMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Crear Destino'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
