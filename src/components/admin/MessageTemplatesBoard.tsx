import { useState } from 'react'
import {
  useMessageTemplates,
  useUpdateMessageTemplate,
  useDeleteMessageTemplate,
} from '@/hooks/useMessageTemplatesQuery'
import {
  Plus, Edit2, Trash2, Loader2, ToggleLeft, MessageCircleMore,
} from 'lucide-react'
import { TemplateFormModal } from './TemplateFormModal'
import { CATEGORIAS_TEMPLATE } from '@/lib/messageTemplates'
import type { CrmMessageTemplate } from '@/lib/supabase'

const CATEGORIA_MAP: Record<string, { label: string; emoji: string }> = {}
CATEGORIAS_TEMPLATE.forEach((c) => { CATEGORIA_MAP[c.value] = { label: c.label, emoji: c.emoji } })

export function MessageTemplatesBoard() {
  const { data: templates, isLoading, refetch } = useMessageTemplates(false)
  const updateMutation = useUpdateMessageTemplate()
  const deleteMutation = useDeleteMessageTemplate()

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CrmMessageTemplate | null>(null)

  const handleEdit = (t: CrmMessageTemplate) => {
    setEditingTemplate(t)
    setShowFormModal(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowFormModal(true)
  }

  const handleDelete = async (t: CrmMessageTemplate) => {
    if (!window.confirm(`¿Eliminar el template "${t.nombre}" permanentemente?`)) return
    try {
      await deleteMutation.mutateAsync(t.id)
    } catch (e) {
      console.error(e)
      alert('Error al eliminar el template')
    }
  }

  const handleToggleActive = async (t: CrmMessageTemplate) => {
    try {
      await updateMutation.mutateAsync({ id: t.id, is_active: !t.is_active })
    } catch (e) {
      console.error(e)
      alert('Error al cambiar estado')
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircleMore size={24} className="text-gold" /> Plantillas de Mensajes
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>CRUD de templates con formularios para generar mensajes WhatsApp listos para enviar.</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-cta"
          style={{ height: 44, padding: '0 20px', fontSize: 14 }}
        >
          <Plus size={16} /> Nuevo Template
        </button>
      </div>

      {/* Content */}
      <div className="glass-card" style={{ padding: 24 }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
            <Loader2 className="animate-spin" size={18} /> Cargando plantillas...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 80px 120px 100px',
              gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--surface-2)',
              color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              <span></span>
              <span>Nombre / Slang</span>
              <span>Categoría</span>
              <span>Campos</span>
              <span>Estado</span>
              <span style={{ textAlign: 'right' }}>Acciones</span>
            </div>

            {(templates || []).length === 0 && !isLoading && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No hay plantillas registradas. Creá una nueva.
              </div>
            )}

            {(templates || []).map((t) => {
              const cat = CATEGORIA_MAP[t.categoria] || { label: t.categoria, emoji: t.emoji || '💬' }
              const fieldCount = (t.fields || []).length
              const active = t.is_active

              return (
                <div key={t.id} style={{
                  display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 80px 120px 100px',
                  gap: 12, alignItems: 'center', padding: '12px 16px',
                  background: 'var(--surface-2)', borderRadius: 8,
                  border: active ? '1.5px solid rgba(52,211,153,0.1)' : '1.5px solid var(--surface-2)',
                }}>
                  <span style={{ fontSize: 20, textAlign: 'center' }}>{t.emoji || cat.emoji}</span>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13, display: 'block' }}>{t.nombre}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/{t.slug}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {cat.emoji} {cat.label}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {fieldCount} campo{fieldCount !== 1 ? 's' : ''}
                  </span>
                  <span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: active ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                      color: active ? '#34D399' : '#F87171',
                      border: `1px solid ${active ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    }}>
                      {active ? 'Activo' : 'Inactivo'}
                    </span>
                  </span>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleToggleActive(t)}
                      title={active ? 'Desactivar' : 'Activar'}
                      style={{
                        background: 'none', border: 'none',
                        color: active ? '#FBBF24' : 'var(--text-muted)',
                        cursor: 'pointer', padding: 4,
                      }}
                    >
                      <ToggleLeft size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(t)}
                      style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', padding: 4 }}
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={deleteMutation.isPending}
                      style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 4 }}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Empty state hint for seeds */}
            {(templates || []).some((t) => t.nombre.includes('seed')) && (
              <div style={{
                marginTop: 12, padding: '12px 16px', background: 'rgba(245,158,11,0.06)',
                borderRadius: 10, fontSize: 11, color: 'var(--text-muted)',
                border: '1px solid rgba(245,158,11,0.15)',
              }}>
                <strong>Nota:</strong> Los templates con "(seed)" son plantillas predeterminadas. Editálos para personalizarlos o eliminálos para empezar desde cero.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <TemplateFormModal
          template={editingTemplate}
          onClose={() => { setShowFormModal(false); setEditingTemplate(null) }}
          onSaved={() => { setShowFormModal(false); setEditingTemplate(null); refetch() }}
        />
      )}
    </div>
  )
}
