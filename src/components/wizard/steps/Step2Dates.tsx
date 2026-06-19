import { useState, forwardRef, useImperativeHandle } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { DESTINOS_POPULARES, MESES } from '@/lib/constants'
import { CalendarDays, Calendar, Info } from 'lucide-react'
import type { StepHandle } from '../WizardShell'
import { motion, AnimatePresence } from 'motion/react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

/* ── Helpers ──────────────────────────────────────────────────────── */
const today = new Date().toISOString().split('T')[0]

function DateField({ label, id, value, min, onChange }: {
  label: string; id: string; value: string; min?: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="input-label" htmlFor={id}>{label}</label>
      <input
        id={id} type="date"
        value={value} min={min || today}
        onChange={e => onChange(e.target.value)}
        className="input-dark"
        style={{ width: '100%' }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */

export const Step2Dates = forwardRef<StepHandle>(function Step2Dates(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()

  /* ── Resolved destinos list ─────────────────────────────── */
  const allDestinos = [
    ...data.destination.destinos_seleccionados,
    ...data.destination.destinos_custom,
  ]
  const isMulti     = allDestinos.length > 1

  /* ── Mode state ─────────────────────────────────────────── */
  const [mode, setMode]         = useState<'exacta' | 'flexible'>(data.dates.tipo_fecha)

  /* Exact single */
  const [fechaSal, setFechaSal] = useState(data.dates.fecha_salida)
  const [fechaReg, setFechaReg] = useState(data.dates.fecha_regreso)

  /* Exact multi */
  const initMulti = (): Record<string, { fecha_salida: string; fecha_regreso: string }> => {
    const base = data.dates.fechas_por_destino || {}
    const result: Record<string, { fecha_salida: string; fecha_regreso: string }> = {}
    allDestinos.forEach(d => {
      result[d] = base[d] || { fecha_salida: '', fecha_regreso: '' }
    })
    return result
  }
  const [perDest, setPerDest]   = useState(initMulti)

  /* Flexible */
  const [mes, setMes]           = useState(data.dates.mes_preferido)
  const [error, setError]       = useState('')

  /* ── Validate & save ────────────────────────────────────── */
  useImperativeHandle(ref, () => ({
    validate: async () => {
      setError('')

      if (mode === 'exacta') {
        if (isMulti) {
          const incomplete = allDestinos.some(d => !perDest[d]?.fecha_salida || !perDest[d]?.fecha_regreso)
          if (incomplete) { setError('Completá fechas de salida y regreso para todos los destinos'); return false }
          // Compute global
          const salidas  = allDestinos.map(d => perDest[d].fecha_salida).sort()
          const regresos = allDestinos.map(d => perDest[d].fecha_regreso).sort().reverse()
          updateData('dates', {
            tipo_fecha: 'exacta',
            fechas_por_destino: perDest,
            fecha_salida:  salidas[0],
            fecha_regreso: regresos[0],
            rango_fecha_inicio: salidas[0],
            rango_fecha_fin:    regresos[0],
            mes_preferido: '',
          })
        } else {
          if (!fechaSal || !fechaReg) { setError('Seleccioná fecha de salida y regreso'); return false }
          updateData('dates', {
            tipo_fecha: 'exacta',
            fecha_salida:  fechaSal,
            fecha_regreso: fechaReg,
            rango_fecha_inicio: fechaSal,
            rango_fecha_fin:    fechaReg,
            fechas_por_destino: {},
            mes_preferido: '',
          })
        }
      } else {
        // flexible
        if (!mes) { setError('Seleccioná el mes en que querés viajar'); return false }
        updateData('dates', {
          tipo_fecha:    'flexible',
          mes_preferido: mes,
          fecha_salida:  '',
          fecha_regreso: '',
          fechas_por_destino: {},
          rango_fecha_inicio: '',
          rango_fecha_fin:    '',
        })
      }

      markStepCompleted('dates')
      return true
    },
  }))

  /* ── Render ─────────────────────────────────────────────── */
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
          ¿Cuándo viajás?
        </h2>
        <div className="gold-divider" style={{ margin: '20px 0 16px' }} />
        <p style={{ fontSize: 16, color: 'rgba(148,163,184,0.85)', fontWeight: 500, lineHeight: 1.6, maxWidth: 480 }}>
          Tenés fechas fijas o preferís algo flexible
        </p>
      </motion.div>

      {/* Mode selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {([
          { value: 'exacta',   label: 'Fecha exacta',  icon: CalendarDays, desc: 'Tengo fechas confirmadas', tooltip: null },
          { value: 'flexible', label: 'Mes flexible',   icon: Calendar,     desc: 'Sé en qué mes viajo', tooltip: 'Ideal si buscás las mejores tarifas dentro de un mes completo.' },
        ] as const).map(opt => {
          const isActive = mode === opt.value
          
          const ButtonContent = (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <opt.icon size={18} style={{ color: isActive ? '#F59E0B' : 'rgba(100,116,139,0.8)', flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: isActive ? '#FBBF24' : '#F0F4FF' }}>{opt.label}</span>
                {opt.tooltip && <Info size={14} style={{ color: 'rgba(100,116,139,0.8)' }} />}
              </div>
              <p style={{ fontSize: 12, color: isActive ? 'rgba(251,191,36,0.65)' : 'rgba(100,116,139,0.8)', fontWeight: 500 }}>{opt.desc}</p>
            </div>
          )
          const Button = (
            <button
              type="button"
              onClick={() => { setMode(opt.value); setError('') }}
              aria-pressed={isActive}
              style={{
                padding: '20px 20px',
                borderRadius: 18,
                border: isActive ? '2px solid rgba(201,169,110,0.55)' : '1.5px solid rgba(255,255,255,0.08)',
                background: isActive ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.18s',
                boxShadow: isActive ? '0 0 24px rgba(245,158,11,0.1)' : 'none',
                width: '100%',
              }}
            >
              {ButtonContent}
            </button>
          )

          return opt.tooltip ? (
            <Tooltip key={opt.value}>
              <TooltipTrigger asChild>
                {Button}
              </TooltipTrigger>
              <TooltipContent>
                {opt.tooltip}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div key={opt.value}>
              {Button}
            </div>
          )
        })}
      </div>

      {/* ── EXACT dates ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {mode === 'exacta' && (
          <motion.div
            key="exacta"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {!isMulti ? (
              /* Single destination */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <DateField label="✈️ Salida" id="fecha-sal" value={fechaSal} onChange={setFechaSal} />
                <DateField label="🛬 Regreso" id="fecha-reg" value={fechaReg} min={fechaSal || today} onChange={setFechaReg} />
              </div>
            ) : (
              /* Multiple destinations */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ padding: '14px 18px', background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 14, fontSize: 13, color: 'rgba(201,169,110,0.9)', fontWeight: 600 }}>
                  ✈️ Asigná fechas de salida y regreso para cada destino
                </div>
                {allDestinos.map((dest, idx) => {
                  const popular = DESTINOS_POPULARES.find(d => d.value === dest)
                  const label   = popular ? `${popular.emoji} ${popular.label}` : `✏️ ${dest}`
                  const prev    = perDest[dest] || { fecha_salida: '', fecha_regreso: '' }
                  return (
                    <motion.div
                      key={dest}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 16 }}
                    >
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#F0F4FF', marginBottom: 14 }}>{label}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <DateField
                          label="Salida" id={`sal-${dest}`}
                          value={prev.fecha_salida}
                          onChange={v => setPerDest(p => ({ ...p, [dest]: { ...p[dest], fecha_salida: v } }))}
                        />
                        <DateField
                          label="Regreso" id={`reg-${dest}`}
                          value={prev.fecha_regreso}
                          min={prev.fecha_salida || today}
                          onChange={v => setPerDest(p => ({ ...p, [dest]: { ...p[dest], fecha_regreso: v } }))}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── FLEXIBLE – month grid ────────────────────────── */}
        {mode === 'flexible' && (
          <motion.div
            key="flexible"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <label className="input-label" style={{ marginBottom: 14 }}>Mes preferido</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {MESES.map(m => (
                <button
                  key={m} type="button"
                  onClick={() => { setMes(m); setError('') }}
                  aria-pressed={mes === m}
                  style={{
                    padding: '16px 8px',
                    borderRadius: 14,
                    border: mes === m ? '1.5px solid rgba(201,169,110,0.55)' : '1.5px solid rgba(255,255,255,0.07)',
                    background: mes === m ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.03)',
                    color: mes === m ? '#C9A96E' : 'rgba(148,163,184,0.85)',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="error-text" style={{ textAlign: 'center' }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Tip */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'rgba(201,169,110,0.05)', borderRadius: 14, border: '1px solid rgba(201,169,110,0.12)' }}>
        <Info size={16} style={{ color: '#C9A96E', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.75)', lineHeight: 1.6, fontWeight: 500 }}>
          No te preocupes si no tenés fechas exactas. Nuestros asesores te ayudarán a encontrar las mejores opciones y precios.
        </p>
      </div>
    </div>
  )
})
