import { useState } from 'react'
import { useTTOOList, useCreateTTOO, useUpdateTTOO, useDeleteTTOO } from '@/hooks/useCatalogQuery'
import { Plus, Edit2, Trash2, Loader2, Building2 } from 'lucide-react'
import type { CrmTTOO } from '@/lib/supabase'

export function TTOOBoard() {
  const { data: ttoos, isLoading } = useTTOOList()
  const createMutation = useCreateTTOO()
  const updateMutation = useUpdateTTOO()
  const deleteMutation = useDeleteTTOO()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nombre: '', contacto: '' })
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!formData.nombre) return alert('El nombre es obligatorio')
    await createMutation.mutateAsync({ nombre: formData.nombre, contacto: formData.contacto })
    setFormData({ nombre: '', contacto: '' })
    setIsCreating(false)
  }

  const handleUpdate = async (id: string) => {
    if (!formData.nombre) return alert('El nombre es obligatorio')
    await updateMutation.mutateAsync({ id, nombre: formData.nombre, contacto: formData.contacto })
    setEditingId(null)
    setFormData({ nombre: '', contacto: '' })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que querés eliminar este operador?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const startEdit = (ttoo: CrmTTOO) => {
    setEditingId(ttoo.id)
    setFormData({ nombre: ttoo.nombre, contacto: ttoo.contacto || '' })
    setIsCreating(false)
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={24} className="text-gold" /> Operadores TTOO
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)' }}>Gestioná los proveedores mayoristas para el armado de presupuestos.</p>
        </div>
        <button 
          onClick={() => { setIsCreating(true); setEditingId(null); setFormData({ nombre: '', contacto: '' }) }}
          className="btn-cta" 
          style={{ height: 44, padding: '0 20px', fontSize: 14 }}
        >
          <Plus size={16} /> Nuevo Operador
        </button>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8' }}>
            <Loader2 className="animate-spin" size={18} /> Cargando catálogo...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Formulario de Creación / Edición */}
            {(isCreating || editingId) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1.5px solid rgba(245,158,11,0.3)' }}>
                <input 
                  type="text" 
                  placeholder="Nombre del Operador" 
                  value={formData.nombre} 
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })} 
                  className="input-dark" 
                  style={{ height: 40, minHeight: 40 }}
                />
                <input 
                  type="text" 
                  placeholder="Contacto (Email, Tel, etc.)" 
                  value={formData.contacto} 
                  onChange={e => setFormData({ ...formData, contacto: e.target.value })} 
                  className="input-dark" 
                  style={{ height: 40, minHeight: 40 }}
                />
                <button 
                  onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                  className="btn-cta" 
                  style={{ height: 40, padding: '0 16px', fontSize: 13 }}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? 'Guardar' : 'Agregar'}
                </button>
                <button 
                  onClick={() => { setIsCreating(false); setEditingId(null); setFormData({ nombre: '', contacto: '' }) }}
                  className="btn-ghost" 
                  style={{ height: 40, padding: '0 16px', fontSize: 13 }}
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Grilla */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 16, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              <span>Nombre</span>
              <span>Contacto</span>
              <span style={{ textAlign: 'right' }}>Acciones</span>
            </div>
            
            {ttoos?.length === 0 && !isCreating && (
              <p style={{ padding: 16, color: '#64748B', fontSize: 14 }}>No hay operadores registrados.</p>
            )}

            {ttoos?.map(ttoo => (
              <div key={ttoo.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#F0F4FF' }}>{ttoo.nombre}</span>
                <span style={{ color: '#94A3B8', fontSize: 13 }}>{ttoo.contacto || '—'}</span>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => startEdit(ttoo)} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', padding: 4 }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(ttoo.id)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
