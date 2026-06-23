import { forwardRef, useImperativeHandle } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { motion } from 'motion/react'
import type { StepHandle } from '../WizardShell'

interface CounterProps {
  label: string
  emoji: string
  ageRange: string
  badge?: string
  badgeColor?: string
  value: number
  min: number
  max: number
  onChange: (val: number) => void
  delay?: number
}

function Counter({ label, emoji, ageRange, badge, badgeColor, value, min, max, onChange, delay = 0 }: CounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 18px',
        gap: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Icon bubble */}
        <div style={{
          width: 48, height: 48,
          borderRadius: 14,
          background: 'rgba(201,169,110,0.1)',
          border: '1.5px solid rgba(201,169,110,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {emoji}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#F0F4FF' }}>{label}</p>
            {badge && (
              <span style={{
                fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 99,
                background: badgeColor || 'rgba(52,211,153,0.12)',
                color: badgeColor ? '#0A1526' : '#34D399',
                border: `1px solid ${badgeColor ? 'transparent' : 'rgba(52,211,153,0.25)'}`,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {badge}
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(100,116,139,0.8)', fontWeight: 500 }}>{ageRange}</p>
        </div>
      </div>

      {/* Counter controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="counter-btn"
          aria-label={`Reducir ${label}`}
        >
          −
        </button>
        <motion.span
          key={value}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 22 }}
          style={{ minWidth: 24, textAlign: 'center', fontSize: 22, fontWeight: 900, color: '#F0F4FF', fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </motion.span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="counter-btn"
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */

export const Step3Passengers = forwardRef<StepHandle>(function Step3Passengers(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()

  useImperativeHandle(ref, () => ({
    validate: async () => {
      markStepCompleted('passengers')
      return true
    },
  }))

  const total = data.passengers.adultos + data.passengers.ninos_2_12 + data.passengers.bebes_0_2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
          ¿Cuántos viajan?
        </h2>
        <div className="gold-divider" style={{ margin: '20px 0 16px' }} />
        <p style={{ fontSize: 16, color: 'rgba(148,163,184,0.85)', fontWeight: 500, lineHeight: 1.6, maxWidth: 480 }}>
          Indicanos quiénes integran el grupo
        </p>
      </motion.div>

      {/* Counters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <Counter
            label="Adultos" emoji="🧑" ageRange="Desde 12 años"
            value={data.passengers.adultos} min={1} max={20}
            onChange={val => updateData('passengers', { adultos: val })}
            delay={0.05}
          />
          {data.passengers.adultos > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ marginTop: 12 }}
            >
              <label className="input-label" htmlFor="edades-adultos">Escribí las edades de los adultos (opcional)</label>
              <input
                id="edades-adultos"
                type="text"
                placeholder="Ejemplo: 35, 42, 28"
                className="input-dark"
                value={data.passengers.edades_adultos || ''}
                onChange={e => updateData('passengers', { edades_adultos: e.target.value })}
                style={{ width: '100%' }}
              />
            </motion.div>
          )}
        </div>
        <Counter
          label="Niños" emoji="👧" ageRange="De 2 a 11 años"
          value={data.passengers.ninos_2_12} min={0} max={15}
          onChange={val => updateData('passengers', { ninos_2_12: val })}
          delay={0.10}
        />
        <Counter
          label="Bebés" emoji="👶" ageRange="De 0 a 2 años"
          value={data.passengers.bebes_0_2} min={0} max={10}
          onChange={val => updateData('passengers', { bebes_0_2: val })}
          delay={0.15}
        />
      </div>

      {/* Total summary card */}
      <motion.div
        layout
        style={{
          padding: '20px 24px',
          background: 'rgba(201,169,110,0.07)',
          border: '1.5px solid rgba(201,169,110,0.2)',
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Total pasajeros
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.passengers.adultos > 0 && (
              <span style={{ fontSize: 12, color: 'rgba(251,191,36,0.85)', fontWeight: 600 }}>
                🧑 {data.passengers.adultos} Adult{data.passengers.adultos > 1 ? 'os' : 'o'}
              </span>
            )}
            {data.passengers.ninos_2_12 > 0 && (
              <span style={{ fontSize: 12, color: 'rgba(251,191,36,0.85)', fontWeight: 600 }}>
                👧 {data.passengers.ninos_2_12} Niño{data.passengers.ninos_2_12 > 1 ? 's' : ''}
              </span>
            )}
            {data.passengers.bebes_0_2 > 0 && (
              <span style={{ fontSize: 12, color: 'rgba(251,191,36,0.85)', fontWeight: 600 }}>
                👶 {data.passengers.bebes_0_2} Bebé{data.passengers.bebes_0_2 > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <motion.span
          key={total}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          style={{ fontSize: 48, fontWeight: 900, color: '#F59E0B', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
        >
          {total}
        </motion.span>
      </motion.div>

      {/* Note */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, background: 'rgba(52,211,153,0.05)', borderRadius: 12, border: '1px solid rgba(52,211,153,0.12)' }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.75)', lineHeight: 1.6, fontWeight: 500 }}>
          👶 Los bebés de <strong style={{ color: '#34D399' }}>0 a 2 años</strong> generalmente viajan gratis en vuelos (sin asiento propio). Consultá con tu asesor para más detalles.
        </p>
      </div>
    </div>
  )
})
