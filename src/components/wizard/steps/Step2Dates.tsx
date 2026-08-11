import { useState, forwardRef, useImperativeHandle } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { MESES } from '@/lib/constants'
import { CalendarDays, Calendar, Check } from 'lucide-react'
import type { StepHandle } from '../WizardShell'
import { motion, AnimatePresence } from 'motion/react'

/* ── Helpers ──────────────────────────────────────────────────────── */
const today = new Date().toISOString().split('T')[0]
const maxDate = new Date()
maxDate.setDate(maxDate.getDate() + 365)
const maxLimit = maxDate.toISOString().split('T')[0]

function DateField({ label, id, value, min, onChange, disabled }: {
  label: string; id: string; value: string; min?: string; onChange: (v: string) => void; disabled?: boolean
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, opacity: disabled ? 0.5 : 1 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#D4B87A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }} htmlFor={id}>{label}</label>
      <input
        id={id} type="date"
        value={value} min={min || today} max={maxLimit}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%', background: '#162032',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '14px 16px',
          color: '#fff', fontSize: 15, fontWeight: 600, outline: 'none'
        }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */

export const Step2Dates = forwardRef<StepHandle>(function Step2Dates(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()

  const [mode, setMode] = useState<'exacta' | 'flexible'>(data.dates.tipo_fecha)
  const [fechaSal, setFechaSal] = useState(data.dates.fecha_salida)
  const [fechaReg, setFechaReg] = useState(data.dates.fecha_regreso)
  const [undefinedDates, setUndefinedDates] = useState(false)
  const [mes, setMes] = useState(data.dates.mes_preferido)
  const [error, setError] = useState('')

  useImperativeHandle(ref, () => ({
    validate: async () => {
      setError('')

      if (mode === 'exacta') {
        if (!undefinedDates && (!fechaSal || !fechaReg)) { 
          setError('Seleccioná fecha de salida y regreso o marcá la opción de fechas no definidas.')
          return false 
        }
        updateData('dates', {
          tipo_fecha: 'exacta',
          fecha_salida: undefinedDates ? '' : fechaSal,
          fecha_regreso: undefinedDates ? '' : fechaReg,
          rango_fecha_inicio: undefinedDates ? '' : fechaSal,
          rango_fecha_fin: undefinedDates ? '' : fechaReg,
          fechas_por_destino: {},
          mes_preferido: '',
        })
      } else {
        if (!mes) { setError('Seleccioná el mes en que querés viajar'); return false }
        updateData('dates', {
          tipo_fecha: 'flexible',
          mes_preferido: mes,
          fecha_salida: '',
          fecha_regreso: '',
          fechas_por_destino: {},
          rango_fecha_inicio: '',
          rango_fecha_fin: '',
        })
      }

      markStepCompleted('dates')
      return true
    },
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Mode selector (Tabs) */}
      <div style={{ 
        display: 'flex', background: 'rgba(255,255,255,0.03)', 
        borderRadius: 999, padding: 4, gap: 4, border: '1px solid rgba(255,255,255,0.05)' 
      }}>
        <button
          type="button"
          onClick={() => { setMode('exacta'); setError('') }}
          style={{
            flex: 1, padding: '14px 20px', borderRadius: 999,
            background: mode === 'exacta' ? '#D4B87A' : 'transparent',
            color: mode === 'exacta' ? '#0A1526' : '#fff',
            fontWeight: 700, fontSize: 14, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <CalendarDays size={18} /> Fechas Exactas
        </button>
        <button
          type="button"
          onClick={() => { setMode('flexible'); setError('') }}
          style={{
            flex: 1, padding: '14px 20px', borderRadius: 999,
            background: mode === 'flexible' ? '#D4B87A' : 'transparent',
            color: mode === 'flexible' ? '#0A1526' : '#fff',
            fontWeight: 700, fontSize: 14, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <Calendar size={18} /> Mes Flexible
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'exacta' && (
          <motion.div
            key="exacta"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div style={{ display: 'flex', gap: 16 }}>
              <DateField label="SALIDA (OPCIONAL)" id="fecha-sal" value={fechaSal} onChange={setFechaSal} disabled={undefinedDates} />
              <DateField label="REGRESO (OPCIONAL)" id="fecha-reg" value={fechaReg} min={fechaSal || today} onChange={setFechaReg} disabled={undefinedDates} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '0 4px' }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                border: undefinedDates ? 'none' : '2px solid rgba(255,255,255,0.2)',
                background: undefinedDates ? '#D4B87A' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {undefinedDates && <Check size={14} color="#0A1526" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>
                Las fechas todavía no están definidas
              </span>
              <input type="checkbox" style={{ display: 'none' }} checked={undefinedDates} onChange={e => setUndefinedDates(e.target.checked)} />
            </label>
          </motion.div>
        )}

        {mode === 'flexible' && (
          <motion.div
            key="flexible"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 20 }}>
              ¿En qué mes te gustaría viajar?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {MESES.map(m => (
                <button
                  key={m} type="button"
                  onClick={() => { setMes(m); setError('') }}
                  style={{
                    position: 'relative',
                    padding: '16px 8px',
                    borderRadius: 12,
                    border: mes === m ? '1px solid #34D399' : '1px solid rgba(255,255,255,0.05)',
                    background: mes === m ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)',
                    boxShadow: mes === m ? '0 0 16px rgba(52,211,153,0.12)' : 'none',
                    color: mes === m ? '#6EE7B7' : '#fff',
                    fontSize: 14, fontWeight: mes === m ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 8, minHeight: 56
                  }}
                >
                  <AnimatePresence>
                    {mes === m && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        style={{
                          position: 'absolute', top: 6, right: 6,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 20, height: 20, borderRadius: '50%',
                          background: '#34D399', color: '#0A1526',
                        }}
                      >
                        <Check size={12} strokeWidth={3.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})
