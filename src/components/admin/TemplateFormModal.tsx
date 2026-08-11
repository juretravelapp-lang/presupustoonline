import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  type CrmMessageTemplate,
  type InsertMessageTemplate,
  type TemplateFieldDef,
} from '@/lib/supabase'
import {
  CATEGORIAS_TEMPLATE,
  FIELD_TYPE_OPTIONS,
  FIELD_WIDTH_OPTIONS,
} from '@/lib/messageTemplates'
import {
  X, Save, Trash2, Edit, Loader2,
} from 'lucide-react'
import { motion } from 'motion/react'

interface Props {
  template?: CrmMessageTemplate | null
  onClose: () => void
  onSaved: () => void
}

interface FieldBuilderForm {
  key: string
  label: string
  type: TemplateFieldDef['type']
  placeholder: string
  required: boolean
  emoji: string
  options: string
  width: TemplateFieldDef['width']
}

const EMPTY_FIELD: FieldBuilderForm = {
  key: '',
  label: '',
  type: 'text',
  placeholder: '',
  required: false,
  emoji: '',
  options: '',
  width: 'full',
}

export function TemplateFormModal({ template, onClose, onSaved }: Props) {
  const isEdit = !!template
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /* ── Metadata ───────────────────────────────────────────────────── */
  const [nombre, setNombre] = useState(template?.nombre || '')
  const [slug, setSlug] = useState(template?.slug || '')
  const [categoria, setCategoria] = useState(template?.categoria || 'cotizacion')
  const [emoji, setEmoji] = useState(template?.emoji || '')
  const [descripcion, setDescripcion] = useState(template?.descripcion || '')
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [orden, setOrden] = useState(template?.orden ?? 0)

  /* ── Message Template ──────────────────────────────────────────── */
  const [mensajeTemplate, setMensajeTemplate] = useState(template?.mensaje_template || '')

  /* ── Fields Builder ────────────────────────────────────────────── */
  const [fields, setFields] = useState<TemplateFieldDef[]>(
    template?.fields || []
  )
  const [fieldDraft, setFieldDraft] = useState<FieldBuilderForm>(EMPTY_FIELD)
  const [editingFieldIdx, setEditingFieldIdx] = useState<number | null>(null)

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')

  const resetFieldDraft = () => setFieldDraft({ ...EMPTY_FIELD })

  /* ── Field Builder Handlers ────────────────────────────────────── */
  const handleAddField = () => {
    if (!fieldDraft.key.trim()) {
      setError('La clave del campo es obligatoria')
      return
    }
    setError('')

    const newField: TemplateFieldDef = {
      key: fieldDraft.key,
      label: fieldDraft.label || fieldDraft.key,
      type: fieldDraft.type,
      placeholder: fieldDraft.placeholder || undefined,
      required: fieldDraft.required,
      emoji: fieldDraft.emoji || undefined,
      width: fieldDraft.width,
    }
    if (fieldDraft.type === 'select' && fieldDraft.options.trim()) {
      newField.options = fieldDraft.options
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    }

    if (editingFieldIdx !== null) {
      setFields((prev) => {
        const copy = [...prev]
        copy[editingFieldIdx] = newField
        return copy
      })
      setEditingFieldIdx(null)
    } else {
      setFields((prev) => [...prev, newField])
    }
    resetFieldDraft()
  }

  const startEditField = (idx: number) => {
    const f = fields[idx]
    setFieldDraft({
      key: f.key,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder || '',
      required: f.required ?? false,
      emoji: f.emoji || '',
      options: f.options ? f.options.join(', ') : '',
      width: f.width || 'full',
    })
    setEditingFieldIdx(idx)
  }

  const removeField = (idx: number) => {
    if (!window.confirm('¿Eliminar este campo del formulario?')) return
    setFields((prev) => prev.filter((_, i) => i !== idx))
    if (editingFieldIdx === idx) {
      setEditingFieldIdx(null)
      resetFieldDraft()
    }
  }

  const moveField = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= fields.length) return
    setFields((prev) => {
      const copy = [...prev]
      const [removed] = copy.splice(idx, 1)
      copy.splice(newIdx, 0, removed)
      return copy
    })
  }

  /* ── Save Handler ──────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!nombre.trim() || !slug.trim() || !categoria) {
      setError('Nombre, slug y categoría son obligatorios')
      return
    }
    if (!mensajeTemplate.trim()) {
      setError('El template del mensaje es obligatorio')
      return
    }
    setError('')
    setSaving(true)

    try {
      const payload: InsertMessageTemplate = {
        nombre: nombre.trim(),
        slug: slug.trim(),
        categoria,
        emoji: emoji || null,
        descripcion: descripcion || null,
        is_active: isActive,
        fields,
        mensaje_template: mensajeTemplate,
        orden,
      }

      if (isEdit && template) {
        const { updateMessageTemplate } = await import('@/lib/supabase')
        await updateMessageTemplate(template.id, payload)
      } else {
        const { createMessageTemplate } = await import('@/lib/supabase')
        await createMessageTemplate(payload)
      }

      onSaved()
    } catch (e) {
      console.error(e)
      setError('Error al guardar el template')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: 16,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card"
        style={{
          width: '100%', maxWidth: 1100, maxHeight: '90vh',
          margin: 'auto',
          background: 'linear-gradient(160deg, var(--surface-3) 0%, var(--surface-3) 100%)',
          borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--surface-3)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEdit ? 'Editar Template' : 'Nuevo Template'}
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>
              {isEdit ? (template?.nombre || 'Editar Template') : 'Crear Template de Mensaje'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border-strong)',
              color: 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Metadata Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="input-label">Nombre del Template</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Cotización de Viaje"
                className="input-dark"
                style={{ height: 42, fontSize: 14 }}
              />
            </div>
            <div>
              <label className="input-label">Slug (único)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="cotizacion"
                className="input-dark"
                style={{ height: 42, fontSize: 14 }}
              />
            </div>
            <div>
              <label className="input-label">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="input-dark"
                style={{ height: 42, fontSize: 14 }}
              >
                {CATEGORIAS_TEMPLATE.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Emoji del Template</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="💰"
                className="input-dark"
                style={{ height: 42, fontSize: 14, textAlign: 'center' }}
              />
            </div>
            <div>
              <label className="input-label">Orden</label>
              <input
                type="number"
                value={orden}
                onChange={(e) => setOrden(Number(e.target.value))}
                className="input-dark"
                style={{ height: 42, fontSize: 14 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Activo
              </label>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Descripción</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción breve del propósito de este template"
                className="input-dark"
                style={{ height: 42, fontSize: 14 }}
              />
            </div>
          </div>

          {/* Auto-slug helper */}
          {!isEdit && nombre && !slug && (
            <div style={{ padding: '8px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: 10, fontSize: 11, color: '#FBBF24' }}>
              Slug sugerido: <strong>{slugify(nombre)}</strong>
            </div>
          )}

          {/* ── Message Template ── */}
          <div>
            <label className="input-label">Mensaje Template</label>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
              Usá <strong>{`{{nombre_campo}}`}</strong> como placeholder. Los campos definidos abajo se insertan automáticamente.
            </p>
            <textarea
              value={mensajeTemplate}
              onChange={(e) => setMensajeTemplate(e.target.value)}
              placeholder="*COTIZACIÓN DE VIAJE*
━━━━━━━━━━━━━━━━━━━━
👤 *DATOS DEL CLIENTE*
  • Nombre: {{nombre}}
  • Email: {{email}}
...
━━━━━━━━━━━━━━━━━━━━"
              className="textarea-dark"
              rows={16}
              style={{ fontSize: 13, fontFamily: 'monospace', lineHeight: 1.5 }}
            />
          </div>

          {/* ── Fields Builder ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>
                Campos del Formulario ({fields.length})
              </h4>
            </div>

            {/* Add Field Row */}
            <div style={{
              padding: 16, background: 'var(--surface-2)',
              border: '1.5px solid rgba(245,158,11,0.3)', borderRadius: 14,
              marginBottom: 12,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
                <div>
                  <label className="input-label">Clave ({`{{key}}`})</label>
                  <input
                    type="text"
                    value={fieldDraft.key}
                    onChange={(e) => setFieldDraft((f) => ({ ...f, key: e.target.value }))}
                    placeholder="nombre"
                    className="input-dark"
                    style={{ height: 38, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label className="input-label">Tipo</label>
                  <select
                    value={fieldDraft.type}
                    onChange={(e) => setFieldDraft((f) => ({ ...f, type: e.target.value as TemplateFieldDef['type'] }))}
                    className="input-dark"
                    style={{ height: 38, fontSize: 13 }}
                  >
                    {FIELD_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.emoji} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Etiqueta</label>
                  <input
                    type="text"
                    value={fieldDraft.label}
                    onChange={(e) => setFieldDraft((f) => ({ ...f, label: e.target.value }))}
                    placeholder="Nombre visible"
                    className="input-dark"
                    style={{ height: 38, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label className="input-label">Emoji</label>
                  <input
                    type="text"
                    value={fieldDraft.emoji}
                    onChange={(e) => setFieldDraft((f) => ({ ...f, emoji: e.target.value }))}
                    placeholder="👤"
                    className="input-dark"
                    style={{ height: 38, fontSize: 13, textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label className="input-label">Ancho</label>
                  <select
                    value={fieldDraft.width}
                    onChange={(e) => setFieldDraft((f) => ({ ...f, width: e.target.value as TemplateFieldDef['width'] }))}
                    className="input-dark"
                    style={{ height: 38, fontSize: 13 }}
                  >
                    {FIELD_WIDTH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}>
                  <label className="flex items-center gap-1 cursor-pointer" style={{ fontSize: 11, fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={fieldDraft.required}
                      onChange={(e) => setFieldDraft((f) => ({ ...f, required: e.target.checked }))}
                    />
                    Requerido
                  </label>
                </div>
              </div>

              {fieldDraft.type === 'select' && (
                <div style={{ marginTop: 12 }}>
                  <label className="input-label">Opciones (separadas por coma)</label>
                  <input
                    type="text"
                    value={fieldDraft.options}
                    onChange={(e) => setFieldDraft((f) => ({ ...f, options: e.target.value }))}
                    placeholder="Transferencia, Efectivo, Tarjeta"
                    className="input-dark"
                    style={{ height: 38, fontSize: 13 }}
                  />
                </div>
              )}

              {fieldDraft.type !== 'select' && (
                <div style={{ marginTop: 12 }}>
                  <label className="input-label">Placeholder</label>
                  <input
                    type="text"
                    value={fieldDraft.placeholder}
                    onChange={(e) => setFieldDraft((f) => ({ ...f, placeholder: e.target.value }))}
                    placeholder="Texto de ayuda"
                    className="input-dark"
                    style={{ height: 38, fontSize: 13 }}
                  />
                </div>
              )}

              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAddField}
                  disabled={!fieldDraft.key.trim()}
                  className="btn-cta"
                  style={{ height: 36, padding: '0 14px', fontSize: 12 }}
                >
                  {editingFieldIdx !== null ? 'Actualizar Campo' : 'Agregar Campo'}
                </button>
              </div>
            </div>

            {/* Fields List */}
            {fields.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, border: '1px dashed var(--surface-3)', borderRadius: 14 }}>
                Aún no hay campos definidos. Agregá uno arriba.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fields.map((f, idx) => (
                  <div
                    key={`${f.key}-${idx}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr 100px 40px 70px',
                      gap: 10,
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--surface-2)',
                      borderRadius: 10,
                    }}
                  >
                    <span style={{ fontSize: 18, textAlign: 'center' }}>{f.emoji || '🔤'}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{f.label || f.key}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {`{{${f.key}}} • ${f.type}`}
                        {f.required && ' · requerido'}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {f.width}
                    </span>
                    <button
                      onClick={() => moveField(idx, -1)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', justifyContent: 'center' }}
                      title="Subir"
                    >
                      ⬆️
                    </button>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => startEditField(idx)}
                        style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', padding: 4, display: 'flex' }}
                        title="Editar"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => removeField(idx)}
                        style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 4, display: 'flex' }}
                        title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 12, color: '#F87171', fontWeight: 700, textAlign: 'center', padding: '8px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.18)' }}>
              ✕ {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: 12,
              border: '1.5px solid var(--border-strong)', background: 'var(--surface-2)',
              color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-cta"
            style={{ height: 44, padding: '0 24px', fontSize: 13 }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar Template' : 'Crear Template')}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
