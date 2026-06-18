import { useState, forwardRef, useImperativeHandle } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { PREFERENCIAS_SERVICIOS } from '@/lib/constants'
import type { StepHandle } from '../WizardShell'
import { motion, AnimatePresence } from 'motion/react'

export const Step4Preferences = forwardRef<StepHandle>(function Step4Preferences(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()
  const [selected, setSelected] = useState<string[]>(data.preferences.preferencias)
  const [showError, setShowError] = useState(false)

  const toggle = (value: string) => {
    setShowError(false)
    setSelected(prev =>
      prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
    )
  }

  useImperativeHandle(ref, () => ({
    validate: async () => {
      if (selected.length === 0) { setShowError(true); return false }
      updateData('preferences', { preferencias: selected })
      markStepCompleted('preferences')
      return true
    },
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="step-icon"
        >
          <span style={{ fontSize: 32 }}>✨</span>
        </motion.div>
        <h2 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
          ¿Qué incluimos?
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.9)', fontWeight: 500 }}>
          Seleccioná los servicios que necesitás
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PREFERENCIAS_SERVICIOS.map((servicio, index) => {
          const isSelected = selected.includes(servicio.value)
          const isUpsell = servicio.value === 'asistencia_viajero'
          return (
            <motion.button
              key={servicio.value}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
              type="button"
              onClick={() => toggle(servicio.value)}
              aria-pressed={isSelected}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '15px 16px',
                background: isUpsell ? (isSelected ? 'rgba(52, 211, 153, 0.15)' : 'rgba(52, 211, 153, 0.04)') : (isSelected ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)'),
                border: isUpsell ? (isSelected ? '1.5px solid rgba(52, 211, 153, 0.5)' : '1.5px solid rgba(52, 211, 153, 0.2)') : (isSelected ? '1.5px solid rgba(245,158,11,0.45)' : '1.5px solid rgba(255,255,255,0.08)'),
                borderRadius: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s',
                boxShadow: isUpsell ? (isSelected ? '0 2px 16px rgba(52, 211, 153, 0.1)' : 'none') : (isSelected ? '0 2px 16px rgba(245,158,11,0.08)' : 'none'),
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isUpsell && !isSelected && (
                <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderBottomLeftRadius: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recomendado
                </div>
              )}
              <span style={{ fontSize: 24, flexShrink: 0 }}>{servicio.icon}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isUpsell ? (isSelected ? '#34D399' : '#6EE7B7') : (isSelected ? '#FBBF24' : 'rgba(148,163,184,1)'),
                }}>
                  {servicio.label}
                </span>
                {isUpsell && (
                  <span style={{ fontSize: 11, color: isSelected ? 'rgba(52, 211, 153, 0.8)' : 'rgba(110, 231, 183, 0.6)', marginTop: 2, fontWeight: 500 }}>
                    Viajá tranquilo con cobertura total
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isSelected ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: isUpsell ? '#34D399' : '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0A1526" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.12)', flexShrink: 0 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {/* Status feedback */}
      <AnimatePresence>
        {showError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="error-text text-center"
          >
            ✕ Seleccioná al menos un servicio para continuar
          </motion.p>
        )}
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{ textAlign: 'center' }}
          >
            <span className="chip-tag">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {selected.length} servicio{selected.length > 1 ? 's' : ''} seleccionado{selected.length > 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
