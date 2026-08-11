import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCrearCliente, useUpdateCliente } from '@/hooks/useClientesQuery'
import { X, Save, Loader2, UserPlus, PencilLine } from 'lucide-react'
import type { Cliente, InsertCliente } from '@/lib/supabase'

interface Props {
  cliente: Cliente | null
  onClose: () => void
  onSaved: (c: Cliente) => void
}

const empty: InsertCliente = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  celular: '',
  fecha_nacimiento: null,
  pasaporte: '',
  direccion: '',
  notas: '',
  preferencias: {},
}

export function ClienteFormModal({ cliente, onClose, onSaved }: Props) {
  const isEdit = !!cliente
  const crear = useCrearCliente()
  const update = useUpdateCliente()

  const [form, setForm] = useState<InsertCliente>(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre,
        apellido: cliente.apellido || '',
        dni: cliente.dni || '',
        email: cliente.email || '',
        celular: cliente.celular || '',
        fecha_nacimiento: cliente.fecha_nacimiento || '',
        pasaporte: cliente.pasaporte || '',
        direccion: cliente.direccion || '',
        notas: cliente.notas || '',
        preferencias: cliente.preferencias || {},
      })
    } else {
      setForm(empty)
    }
  }, [cliente])

  const set = (field: keyof InsertCliente, value: string | null) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      alert('El nombre es obligatorio.')
      return
    }
    setSaving(true)
    try {
      if (isEdit && cliente) {
        const saved = await update.mutateAsync({ id: cliente.id, updates: form })
        onSaved(saved)
      } else {
        const saved = await crear.mutateAsync(form)
        onSaved(saved)
      }
    } catch (err) {
      console.error(err)
      alert('Error al guardar el cliente.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = { height: 40, minHeight: 40, width: '100%' }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: 16,
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: 560, maxHeight: '90vh', margin: 'auto',
        background: 'linear-gradient(160deg, var(--surface-3) 0%, var(--surface-3) 100%)',
        borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEdit ? <PencilLine size={11} /> : <UserPlus size={11} />} Cliente
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>
              {isEdit ? `Editar: ${cliente!.nombre} ${cliente!.apellido}` : 'Nuevo Cliente'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <label className="input-label">Nombre *</label>
              <input className="input-dark" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: María" style={inputStyle} />
            </div>
            <div>
              <label className="input-label">Apellido</label>
              <input className="input-dark" value={form.apellido} onChange={e => set('apellido', e.target.value)} placeholder="Ej: Pérez" style={inputStyle} />
            </div>
            <div>
              <label className="input-label">DNI / Documento</label>
              <input className="input-dark" value={form.dni || ''} onChange={e => set('dni', e.target.value)} placeholder="12345678" style={inputStyle} />
            </div>
            <div>
              <label className="input-label">Celular / WhatsApp</label>
              <input className="input-dark" value={form.celular || ''} onChange={e => set('celular', e.target.value)} placeholder="54 9 381 1234567" style={inputStyle} />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input className="input-dark" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="cliente@email.com" style={inputStyle} />
            </div>
            <div>
              <label className="input-label">Fecha de Nacimiento</label>
              <input className="input-dark" type="date" value={form.fecha_nacimiento || ''} onChange={e => set('fecha_nacimiento', e.target.value || null)} style={inputStyle} />
            </div>
            <div>
              <label className="input-label">Pasaporte</label>
              <input className="input-dark" value={form.pasaporte || ''} onChange={e => set('pasaporte', e.target.value)} placeholder="N° de pasaporte" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Dirección</label>
              <input className="input-dark" value={form.direccion || ''} onChange={e => set('direccion', e.target.value)} placeholder="Calle, ciudad, país" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="input-label">Notas internas</label>
            <textarea
              className="input-dark"
              value={form.notas || ''}
              onChange={e => set('notas', e.target.value)}
              placeholder="Preferencias, forma de pago, qué viajó antes, etc."
              rows={3}
              style={{ width: '100%', minHeight: 84, resize: 'vertical', fontSize: 13, lineHeight: 1.5 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--surface-3)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              height: 42, padding: '0 18px', borderRadius: 12, cursor: 'pointer',
              border: '1.5px solid var(--border-strong)', background: 'var(--surface-2)',
              color: 'var(--text-muted)', fontSize: 13, fontWeight: 700,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-cta"
            style={{ height: 42, padding: '0 20px', fontSize: 13 }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Cliente'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}