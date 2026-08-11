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

function Card({ icon, title, children, delay = 0 }: { icon: string; title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '22px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{
          display: 'flex', width: 34, height: 34, borderRadius: 12, flexShrink: 0,
          background: 'rgba(201,169,110,0.12)',
          alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>
          {icon}
        </span>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#F0F4FF', letterSpacing: '0.02em', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#F0F4FF', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
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

  const tipoLabel = data.dates.tipo_fecha === 'exacta'
    ? 'Fechas exactas'
    : data.dates.tipo_fecha === 'flexible'
      ? 'Mes flexible'
      : 'Mes'

  const datesContent = () => {
    const d = data.dates
    if (d.tipo_fecha === 'exacta') {
      const perDest = Object.entries(d.fechas_por_destino || {})
      if (perDest.length > 0) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {perDest.map(([dest, fd]) => (
              <span key={dest} style={{ fontSize: 13, color: '#F0F4FF', fontWeight: 600, lineHeight: 1.5 }}>
                <b style={{ color: '#C9A96E' }}>{dest.replace(/_/g, ' ')}</b>: {fd.fecha_salida ? formatDate(fd.fecha_salida) : '—'} <span style={{ color: '#C9A96E' }}>→</span> {fd.fecha_regreso ? formatDate(fd.fecha_regreso) : '—'}
              </span>
            ))}
          </div>
        )
      }
      if (d.fecha_salida && d.fecha_regreso) {
        return (
          <p style={{ fontSize: 16, fontWeight: 800, color: '#F0F4FF', margin: 0, lineHeight: 1.4 }}>
            {formatDate(d.fecha_salida)} <span style={{ color: '#C9A96E' }}>→</span> {formatDate(d.fecha_regreso)}
          </p>
        )
      }
      return <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Fechas a definir</p>
    }
    return <p style={{ fontSize: 16, fontWeight: 800, color: '#F0F4FF', margin: 0 }}>{d.mes_preferido || '—'}</p>
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2
          style={{
            fontSize: 'clamp(32px, 7vw, 52px)',
            fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.03em',
            color: '#F0F4FF',
            lineHeight: 1.1,
          }}
        >
          Revisá tu solicitud
        </h2>
        <div className="gold-divider" style={{ margin: '20px 0 16px' }} />
        <p style={{ fontSize: 16, color: 'rgba(148,163,184,0.9)', fontWeight: 500, lineHeight: 1.6, maxWidth: 480 }}>
          Confirmá los datos antes de enviar
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card icon="🗺️" title="Destino" delay={0.08}>
          <Row label="Salida desde" value={ciudad?.label || data.origin.ciudad_salida || 'No especificado'} />
          <div style={{ paddingTop: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {destinos.map(d => (
                <span key={d!.value} className="chip-tag" style={{ fontSize: 12, padding: '6px 14px' }}>
                  {d!.emoji} {d!.label}
                </span>
              ))}
              {data.destination.destino_personalizado && (
                <span className="chip-tag" style={{ fontSize: 12, padding: '6px 14px' }}>✏️ {data.destination.destino_personalizado}</span>
              )}
            </div>
          </div>
        </Card>

        <Card icon="📅" title="Fechas" delay={0.13}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="chip-tag" style={{ alignSelf: 'flex-start', fontSize: 11, padding: '4px 12px' }}>
              {tipoLabel}
            </span>
            {datesContent()}
          </div>
        </Card>

        <Card icon="👥" title="Pasajeros" delay={0.18}>
          {data.passengers.adultos > 0 && <Row label="Adultos" value={String(data.passengers.adultos)} />}
          {data.passengers.ninos_2_12 > 0 && <Row label="Niños" value={String(data.passengers.ninos_2_12)} />}
          {data.passengers.bebes_0_2 > 0 && <Row label="Bebés" value={String(data.passengers.bebes_0_2)} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, paddingTop: 10 }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Total viajeros</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#C9A96E' }}>{totalPax}</span>
          </div>
        </Card>

        <Card icon="⭐" title="Servicios" delay={0.23}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {servicios.map(s => (
              <span key={s!.value} className="chip-tag" style={{ fontSize: 12, padding: '6px 14px' }}>
                {s!.icon} {s!.label}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {data.personal.nombre && (
        <Card icon="📬" title="Contacto" delay={0.28}>
          <Row label="Nombre" value={`${data.personal.nombre} ${data.personal.apellido}`} />
          <Row label="Email"  value={data.personal.email || '—'} />
          <Row label="Celular" value={data.personal.celular || '—'} />
        </Card>
      )}

      <Card icon="💬" title="Detalles extra" delay={0.33}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
              className="textarea-dark"
            />
          </div>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}
      >
        {[
          { emoji: '🛡️', label: 'Sin compromiso' },
          { emoji: '⚡', label: 'Respuesta rápida' },
          { emoji: '🌟', label: 'Personalizado' },
        ].map(({ emoji, label }) => (
          <span key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 999,
            background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.12)',
            fontSize: 12, fontWeight: 700, color: 'rgba(148,163,184,1)',
          }}>
            <span style={{ fontSize: 15 }}>{emoji}</span>
            {label}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
