import { useWizardStore } from '@/stores/wizardStore'
import { DESTINOS_POPULARES, CIUDADES_SALIDA, PREFERENCIAS_SERVICIOS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { motion } from 'motion/react'

const TIPOS_VIAJE = [
  { value: 'vacaciones',   label: 'Vacaciones' },
  { value: 'luna_de_miel', label: 'Luna de miel' },
  { value: 'familia',      label: 'Viaje familiar' },
  { value: 'egresados',    label: 'Egresados' },
  { value: 'negocios',     label: 'Negocios' },
  { value: 'aventura',     label: 'Aventura' },
  { value: 'romantico',    label: 'Romántico' },
  { value: 'otro',         label: 'Otro' },
]

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingTop: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 12, color: 'rgba(100,116,139,1)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#F0F4FF', fontWeight: 600, textAlign: 'right', maxWidth: '65%' }}>{value}</span>
    </div>
  )
}

function SummaryCard({ emoji, title, children, delay = 0 }: { emoji: string; title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '16px 18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(251,191,36,0.9)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

export function Step6Summary() {
  const { data, updateData } = useWizardStore()

  const destinos = data.destination.destinos_seleccionados
    .map(d => DESTINOS_POPULARES.find(dest => dest.value === d))
    .filter(Boolean)

  const ciudad   = CIUDADES_SALIDA.find(c => c.value === data.origin.ciudad_salida)
  const servicios = data.preferences.preferencias
    .map(p => PREFERENCIAS_SERVICIOS.find(s => s.value === p))
    .filter(Boolean)

  const totalPax = data.passengers.adultos + data.passengers.ninos_2_12 + data.passengers.bebes_0_2

  const fechaResumen = () => {
    if (data.dates.tipo_fecha === 'exacta') {
      const hasDestDates = Object.keys(data.dates.fechas_por_destino || {}).length > 0
      
      if (hasDestDates) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            {Object.entries(data.dates.fechas_por_destino).map(([dest, d]: any) => (
              <span key={dest} style={{ fontSize: 11 }}>
                • <b>{dest.replace(/_/g, ' ')}</b>: {d.fecha_salida ? formatDate(d.fecha_salida) : '—'} al {d.fecha_regreso ? formatDate(d.fecha_regreso) : '—'}
              </span>
            ))}
          </div>
        )
      }

      return `${data.dates.fecha_salida ? formatDate(data.dates.fecha_salida) : '—'} al ${data.dates.fecha_regreso ? formatDate(data.dates.fecha_regreso) : '—'}`
    }
    if (data.dates.tipo_fecha === 'flexible') {
      return `${data.dates.rango_fecha_inicio ? formatDate(data.dates.rango_fecha_inicio) : '—'} al ${data.dates.rango_fecha_fin ? formatDate(data.dates.rango_fecha_fin) : '—'}`
    }
    return data.dates.mes_preferido || '—'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="step-icon"
        >
          <span style={{ fontSize: 32 }}>✅</span>
        </motion.div>
        <h2 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
          Revisá tu solicitud
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.9)', fontWeight: 500 }}>
          Confirmá los datos antes de enviar
        </p>
      </div>

      {/* Destination */}
      <SummaryCard emoji="🗺️" title="Destino" delay={0.08}>
        <SummaryRow label="Salida desde" value={ciudad?.label || data.origin.ciudad_salida || 'No especificado'} />
        <div style={{ paddingTop: 8, paddingBottom: 4 }}>
          <p style={{ fontSize: 12, color: 'rgba(100,116,139,1)', fontWeight: 600, marginBottom: 8 }}>Destinos</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {destinos.map(d => (
              <span key={d!.value} className="chip-tag" style={{ fontSize: 11 }}>
                {d!.emoji} {d!.label}
              </span>
            ))}
            {data.destination.destino_personalizado && (
              <span className="chip-tag" style={{ fontSize: 11 }}>✏️ {data.destination.destino_personalizado}</span>
            )}
          </div>
        </div>
      </SummaryCard>

      {/* Dates + Passengers grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <SummaryCard emoji="📅" title="Fechas" delay={0.13}>
          <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)', fontWeight: 500, lineHeight: 1.6 }}>
            <p style={{ fontWeight: 700, color: '#F0F4FF', marginBottom: 4 }}>
              {data.dates.tipo_fecha === 'exacta' ? 'Exacta' : data.dates.tipo_fecha === 'flexible' ? 'Flexible' : 'Mes'}
            </p>
            {fechaResumen()}
          </div>
        </SummaryCard>

        <SummaryCard emoji="👥" title="Pasajeros" delay={0.18}>
          <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)', fontWeight: 500, lineHeight: 1.8 }}>
            {data.passengers.adultos > 0 && <p>🧑 {data.passengers.adultos} Adultos</p>}
            {data.passengers.ninos_2_12 > 0 && <p>👧 {data.passengers.ninos_2_12} Niños</p>}
            {data.passengers.bebes_0_2 > 0 && <p>👶 {data.passengers.bebes_0_2} Bebés</p>}
            <p style={{ fontWeight: 800, color: '#F59E0B', marginTop: 4, fontSize: 13 }}>Total: {totalPax}</p>
          </div>
        </SummaryCard>
      </div>

      {/* Services */}
      <SummaryCard emoji="⭐" title="Servicios" delay={0.23}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {servicios.map(s => (
            <span key={s!.value} className="chip-tag" style={{ fontSize: 11 }}>
              {s!.icon} {s!.label}
            </span>
          ))}
        </div>
      </SummaryCard>

      {/* Contact */}
      {data.personal.nombre && (
        <SummaryCard emoji="📬" title="Contacto" delay={0.28}>
          <SummaryRow label="Nombre" value={`${data.personal.nombre} ${data.personal.apellido}`} />
          <SummaryRow label="Email"  value={data.personal.email} />
          <SummaryRow label="Celular" value={data.personal.celular} />
        </SummaryCard>
      )}

      {/* Extra – tipo de viaje + comentarios */}
      <SummaryCard emoji="💬" title="Detalles extra" delay={0.33}>
        <div className="space-y-3">
          <div>
            <label className="input-label" htmlFor="tipo-viaje">Tipo de viaje (opcional)</label>
            <select
              id="tipo-viaje"
              value={data.comments.tipo_viaje}
              onChange={e => updateData('comments', { tipo_viaje: e.target.value })}
              className="input-dark"
              style={{ paddingLeft: 12, paddingRight: 12 }}
              aria-label="Tipo de viaje"
            >
              <option value="" style={{ background: '#0A1526', color: '#F0F4FF' }}>Seleccioná el tipo de viaje</option>
              {TIPOS_VIAJE.map(t => (
                <option key={t.value} value={t.value} style={{ background: '#0A1526', color: '#F0F4FF' }}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="comentarios">Comentarios (opcional)</label>
            <textarea
              id="comentarios"
              value={data.comments.comentarios}
              onChange={e => updateData('comments', { comentarios: e.target.value })}
              placeholder="Servicios extra, requisitos especiales, etc."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.09)',
                borderRadius: 10,
                color: '#F0F4FF',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#F59E0B'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.12)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>
      </SummaryCard>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}
      >
        {[
          { emoji: '🛡️', label: 'Sin compromiso' },
          { emoji: '⚡', label: 'Respuesta rápida' },
          { emoji: '🌟', label: 'Personalizado' },
        ].map(({ emoji, label }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: 12 }}>
            <span style={{ fontSize: 20 }}>{emoji}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(100,116,139,1)', textAlign: 'center' }}>{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
