import { forwardRef, useImperativeHandle } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { motion, AnimatePresence } from 'motion/react'
import type { StepHandle } from '../WizardShell'
import { User, Baby, Users } from 'lucide-react'

interface CounterProps {
  label: string
  icon: React.ReactNode
  ageRange: string
  value: number
  min: number
  max: number
  onChange: (val: number) => void
  delay?: number
}

function Counter({ label, icon, ageRange, value, min, max, onChange, delay = 0 }: CounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: '#162032',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(212,184,122,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#D4B87A', flexShrink: 0,
        }}>
          {icon}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{label}</p>
          <p style={{ fontSize: 13, color: '#7a859b', fontWeight: 500 }}>{ageRange}</p>
        </div>
      </div>

      {/* Counter controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, cursor: value <= min ? 'not-allowed' : 'pointer',
            opacity: value <= min ? 0.5 : 1, transition: 'all 0.15s'
          }}
        >
          −
        </button>
        <span style={{ minWidth: 20, textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, cursor: value >= max ? 'not-allowed' : 'pointer',
            opacity: value >= max ? 0.5 : 1, transition: 'all 0.15s'
          }}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Counters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Counter
            label="Adultos" icon={<User size={24} />} ageRange="12+ años"
            value={data.passengers.adultos} min={1} max={20}
            onChange={val => updateData('passengers', { adultos: val })}
            delay={0.05}
          />
          <AnimatePresence>
            {data.passengers.adultos > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 16 }}
              >
                <div style={{ background: '#162032', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#D4B87A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }} htmlFor="edades-adultos">
                    EDADES (OPCIONAL) Ej: 35, 42, 28
                  </label>
                  <input
                    id="edades-adultos"
                    type="text"
                    placeholder="Ejemplo: 35, 42, 28"
                    value={data.passengers.edades_adultos || ''}
                    onChange={e => updateData('passengers', { edades_adultos: e.target.value })}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: 15, fontWeight: 500, outline: 'none' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Counter
          label="Niños" icon={<Users size={24} />} ageRange="2 a 11 años"
          value={data.passengers.ninos_2_12} min={0} max={15}
          onChange={val => updateData('passengers', { ninos_2_12: val })}
          delay={0.10}
        />
        
        <Counter
          label="Bebés" icon={<Baby size={24} />} ageRange="0 a 2 años"
          value={data.passengers.bebes_0_2} min={0} max={10}
          onChange={val => updateData('passengers', { bebes_0_2: val })}
          delay={0.15}
        />
      </div>

      {/* Note */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'rgba(212,184,122,0.1)', borderRadius: 16, border: '1px solid rgba(212,184,122,0.2)' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: 13, color: '#e6c886', lineHeight: 1.5, fontWeight: 500 }}>
          <strong>Bebés GRATIS 0 a 2 años.</strong> Generalmente viajan gratis sin asiento. Consultá con tu asesor para más detalles.
        </p>
      </div>

      {/* Total summary card */}
      <motion.div
        layout
        style={{
          padding: '24px',
          background: '#0A1526',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 12, color: '#7a859b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TOTAL PASAJEROS
          </p>
          <p style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>
            {data.passengers.adultos} Adul, {data.passengers.ninos_2_12} Niñ, {data.passengers.bebes_0_2} Beb
          </p>
        </div>
        <motion.span
          key={total}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          style={{ fontSize: 40, fontWeight: 800, color: '#D4B87A', lineHeight: 1 }}
        >
          {total}
        </motion.span>
      </motion.div>
    </div>
  )
})
