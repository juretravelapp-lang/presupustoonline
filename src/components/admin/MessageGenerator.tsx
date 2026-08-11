import { useState, useMemo, useEffect } from 'react'
import { useMessageTemplates } from '@/hooks/useMessageTemplatesQuery'
import {
  renderMessage,
  resolveFieldDefaults,
  DEFAULT_TEMPLATES,
  CATEGORIAS_TEMPLATE,
  type FormData as MessageFormData,
} from '@/lib/messageTemplates'
import {
  type CrmMessageTemplate,
  type TemplateFieldDef,
} from '@/lib/supabase'
import {
  Copy, Send, FileText, RefreshCw, Loader2, Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const CATEGORIA_MAP: Record<string, { label: string; emoji: string }> = {}
CATEGORIAS_TEMPLATE.forEach((c) => { CATEGORIA_MAP[c.value] = { label: c.label, emoji: c.emoji } })

const WIDTH_CLASS: Record<string, string> = {
  third: 'w-1/3',
  half: 'w-1/2',
  full: 'w-full',
}

export function MessageGenerator() {
  const { data: dbTemplates, isLoading: loadingTemplates } = useMessageTemplates(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [formData, setFormData] = useState<MessageFormData>({})
  const [copied, setCopied] = useState(false)

  /* ── Merge DB templates with fallback seeds ────────────────────── */
  const templates: CrmMessageTemplate[] = useMemo(() => {
    const db = (dbTemplates || []).filter((t) => t.is_active !== false)
    if (db.length === 0) return DEFAULT_TEMPLATES
    return db
  }, [dbTemplates])

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  )

  /* ── Initialize form data when template changes ────────────────── */
  useEffect(() => {
    if (selectedTemplate) {
      setFormData(resolveFieldDefaults(selectedTemplate.fields || []))
    }
  }, [selectedTemplate])

  /* ── Auto-select first template ────────────────────────────────── */
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id)
    }
  }, [templates, selectedTemplateId])

  /* ── Rendered output ────────────────────────────────────────────── */
  const rendered = useMemo(() => {
    if (!selectedTemplate) return ''
    return renderMessage(selectedTemplate, formData).raw
  }, [selectedTemplate, formData])

  const whatsappLink = useMemo(() => {
    if (!selectedTemplate) return ''
    return renderMessage(selectedTemplate, formData).whatsappLink
  }, [selectedTemplate, formData])

  /* ── Handlers ───────────────────────────────────────────────────── */
  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleCopy = async () => {
    if (!rendered) return
    try {
      await navigator.clipboard.writeText(rendered)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('No se pudo copiar. Seleccioná y copiá manualmente.')
    }
  }

  const handleWhatsApp = () => {
    if (!whatsappLink) return
    window.open(whatsappLink, '_blank', 'noopener,noreferrer')
  }

  const handleReset = () => {
    if (selectedTemplate) {
      setFormData(resolveFieldDefaults(selectedTemplate.fields || []))
    }
  }

  /* ── Render a single field ──────────────────────────────────────── */
  const renderField = (field: TemplateFieldDef) => {
    const value = formData[field.key] ?? ''
    const widthClass = WIDTH_CLASS[field.width || 'full']
    const inputStyle = {
      height: 40, fontSize: 13, minHeight: 40,
    }
    const labelStyle: React.CSSProperties = {
      marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
    }

    return (
      <div key={field.key} className={widthClass} style={{ minWidth: 0 }}>
        <label className="input-label" style={labelStyle}>
          {field.emoji && <span style={{ fontSize: 14 }}>{field.emoji}</span>}
          {field.label}
          {field.required && <span style={{ color: '#F87171' }}> *</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="textarea-dark"
            style={{ fontSize: 13, padding: '14px 18px', resize: 'vertical' }}
          />
        ) : field.type === 'select' ? (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="input-dark"
            style={inputStyle}
          >
            <option value="">{field.placeholder || 'Seleccionar...'}</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={field.type === 'number' || field.type === 'currency' ? 'number' : field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="input-dark"
            style={inputStyle}
          />
        )}
      </div>
    )
  }

  /* ── Group fields into rows based on width ──────────────────────── */
  const fieldRows = useMemo(() => {
    if (!selectedTemplate) return []
    const fields = selectedTemplate.fields || []
    const rows: TemplateFieldDef[][] = []
    let currentRow: TemplateFieldDef[] = []
    let currentWidth = 0

    const widthToFr = (w?: string) => {
      if (w === 'full') return 3
      if (w === 'half') return 1.5
      if (w === 'third') return 1
      return 3
    }

    fields.forEach((f) => {
      const w = widthToFr(f.width)
      if (currentWidth + w > 3 && currentRow.length > 0) {
        rows.push(currentRow)
        currentRow = []
        currentWidth = 0
      }
      currentRow.push(f)
      currentWidth += w
    })
    if (currentRow.length > 0) rows.push(currentRow)

    return rows
  }, [selectedTemplate])

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={24} className="text-gold" /> Generador de Mensajes
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Seleccioná una plantilla, completá el formulario y generá un mensaje indentado con emojis, listo para copiar y enviar por WhatsApp.
        </p>
      </div>

      {/* ── Template Selector ── */}
      <div className="glass-card" style={{ padding: 20 }}>
        {loadingTemplates ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
            <Loader2 className="animate-spin" size={18} /> Cargando plantillas...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> Plantilla
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {templates.map((t) => {
                const cat = CATEGORIA_MAP[t.categoria] || { label: t.categoria, emoji: t.emoji || '💬' }
                const isSelected = selectedTemplateId === t.id
                return (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTemplateId(t.id)}
                    style={{
                      flex: '1 1 200px', minWidth: 160,
                      padding: '14px 16px', borderRadius: 14,
                      background: isSelected
                        ? 'rgba(245,158,11,0.12)'
                        : 'var(--surface-2)',
                      border: isSelected
                        ? '1.5px solid rgba(245,158,11,0.4)'
                        : '1.5px solid var(--surface-3)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 18 }}>{t.emoji || cat.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{t.nombre}</span>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {cat.label} · {(t.fields || []).length} campos
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Form + Preview ── */}
      <AnimatePresence mode="wait">
        {selectedTemplate && (
          <motion.div
            key={selectedTemplate.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
          >
            {/* Form Panel */}
            <div className="glass-card" style={{ padding: 24, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
                  {selectedTemplate.emoji} {selectedTemplate.nombre}
                </h3>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    background: 'var(--surface-2)', border: '1px solid var(--surface-3)',
                    color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <RefreshCw size={11} /> Limpiar
                </button>
              </div>

              {selectedTemplate.descripcion && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  {selectedTemplate.descripcion}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {fieldRows.map((row, ri) => (
                  <div key={ri} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
                    {row.map((f) => renderField(f))}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Panel */}
            <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: '#F59E0B' }} /> Vista Previa del Mensaje
              </h3>

              <div
                style={{
                  flex: 1, minHeight: 200,
                  background: 'rgba(15, 30, 53, 0.6)',
                  border: '1.5px solid var(--surface-3)',
                  borderRadius: 14,
                  padding: 18,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--ink)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflow: 'auto',
                  position: 'relative',
                }}
              >
                {rendered || (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Completá los campos para ver el mensaje generado...
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  disabled={!rendered}
                  className="btn-secondary"
                  style={{ flex: 1, height: 46, fontSize: 13 }}
                >
                  <Copy size={16} />
                  {copied ? '¡Copiado!' : 'Copiar Mensaje'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  disabled={!whatsappLink}
                  className="btn-cta"
                  style={{ flex: 1, height: 46, fontSize: 13 }}
                >
                  <Send size={16} />
                  Enviar por WhatsApp
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
