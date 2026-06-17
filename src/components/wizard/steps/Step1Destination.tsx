import { useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { DESTINOS_POPULARES } from '@/lib/constants'
import { Search, X, Plus, MapPin } from 'lucide-react'
import type { StepHandle } from '../WizardShell'
import { motion, AnimatePresence } from 'motion/react'

export const Step1Destination = forwardRef<StepHandle>(function Step1Destination(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()

  /* ── Local state ───────────────────────────────────────── */
  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState<string[]>(data.destination.destinos_seleccionados)
  const [customList, setCustomList]   = useState<string[]>(data.destination.destinos_custom)
  const [customInput, setCustomInput] = useState('')
  const [showError, setShowError]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const allDestinos = [...selected, ...customList]

  /* ── Filter popular grid ────────────────────────────────── */
  const filtered = DESTINOS_POPULARES.filter(d =>
    d.label.toLowerCase().includes(search.toLowerCase())
  )

  /* ── Toggle popular destino ─────────────────────────────── */
  const toggleDestino = (value: string) => {
    setShowError(false)
    setSelected(prev =>
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
    )
  }

  /* ── Add custom destination ─────────────────────────────── */
  const addCustom = () => {
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (customList.includes(trimmed) || selected.includes(trimmed)) return
    setCustomList(prev => [...prev, trimmed])
    setCustomInput('')
    setShowError(false)
  }

  const removeCustom = (val: string) =>
    setCustomList(prev => prev.filter(d => d !== val))

  /* ── Validate ───────────────────────────────────────────── */
  useImperativeHandle(ref, () => ({
    validate: async () => {
      const all = [...selected, ...customList]
      if (all.length === 0) { setShowError(true); return false }
      updateData('destination', {
        destinos_seleccionados: selected,
        destinos_custom:        customList,
        destino:                all[0],
        destino_personalizado:  customList.join(', '),
      })
      markStepCompleted('destination')
      return true
    },
  }))

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="step-icon animate-float"
          style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontSize: 36, lineHeight: 1 }}>🌍</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 'clamp(21px,5vw,26px)', fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', marginBottom: 6, fontFamily: 'var(--font-display)' }}
        >
          ¿A dónde querés viajar?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{ fontSize: 14, color: 'rgba(148,163,184,0.85)', fontWeight: 500 }}
        >
          Elegí uno o más destinos — también podés escribir el tuyo
        </motion.p>
      </div>

      {/* ── Search bar ─────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(100,116,139,0.8)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Buscar destino popular..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark"
          style={{ paddingLeft: 42 }}
          aria-label="Buscar destino"
        />
      </div>

      {/* ── Popular destinations grid ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {filtered.map((destino, index) => {
          const isSelected = selected.includes(destino.value)
          return (
            <motion.button
              key={destino.value}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.22 }}
              type="button"
              onClick={() => toggleDestino(destino.value)}
              aria-pressed={isSelected}
              aria-label={`${destino.label}${isSelected ? ' (seleccionado)' : ''}`}
              style={{
                position: 'relative',
                padding: '14px 6px',
                borderRadius: 14,
                border: isSelected ? '1.5px solid rgba(245,158,11,0.55)' : '1.5px solid rgba(255,255,255,0.07)',
                background: isSelected ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.18s',
                minHeight: 72,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: isSelected ? '0 0 20px rgba(245,158,11,0.1)' : 'none',
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{destino.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#FBBF24' : 'rgba(148,163,184,0.85)', lineHeight: 1.2 }}>
                {destino.label}
              </span>
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{ position: 'absolute', top: -7, right: -7, width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(245,158,11,0.5)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0A1526" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px 0', color: 'rgba(100,116,139,0.6)', fontSize: 13 }}>
            No se encontraron destinos. Escribí el tuyo abajo ↓
          </div>
        )}
      </div>

      {/* ── Custom destination input ─────────────────────────── */}
      <div>
        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <MapPin size={12} style={{ color: '#F59E0B' }} />
          Escribí tu destino (opcional)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ej: Tailandia, Maldivas, Japón..."
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
            className="input-dark"
            style={{ flex: 1 }}
            aria-label="Escribir destino personalizado"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            style={{
              width: 52, height: 52, borderRadius: 12, border: 'none',
              background: customInput.trim() ? '#F59E0B' : 'rgba(255,255,255,0.06)',
              color: customInput.trim() ? '#0A1526' : 'rgba(100,116,139,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: customInput.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s', flexShrink: 0,
            }}
            aria-label="Agregar destino"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* ── All selected chips ───────────────────────────────── */}
      <AnimatePresence>
        {allDestinos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="input-label" style={{ marginBottom: 10 }}>
              {allDestinos.length === 1 ? '📍 Destino elegido' : `📍 ${allDestinos.length} destinos elegidos`}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {/* Popular selected */}
              {selected.map(value => {
                const dest = DESTINOS_POPULARES.find(d => d.value === value)
                return (
                  <motion.span
                    key={value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="chip-tag"
                  >
                    {dest?.emoji} {dest?.label}
                    <button
                      onClick={() => toggleDestino(value)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'rgba(251,191,36,0.7)', display: 'flex', marginLeft: 2 }}
                      aria-label={`Quitar ${dest?.label}`}
                    >
                      <X size={11} />
                    </button>
                  </motion.span>
                )
              })}
              {/* Custom destinations */}
              {customList.map(value => (
                <motion.span
                  key={`custom-${value}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="chip-tag"
                  style={{ background: 'rgba(148,163,184,0.1)', borderColor: 'rgba(148,163,184,0.2)', color: '#94A3B8' }}
                >
                  ✏️ {value}
                  <button
                    onClick={() => removeCustom(value)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'rgba(148,163,184,0.6)', display: 'flex', marginLeft: 2 }}
                    aria-label={`Quitar ${value}`}
                  >
                    <X size={11} />
                  </button>
                </motion.span>
              ))}
            </div>

            {/* Multi-destination hint */}
            {allDestinos.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, fontSize: 12, color: 'rgba(251,191,36,0.85)', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 8 }}
              >
                <span style={{ flexShrink: 0, fontSize: 16 }}>✈️</span>
                <span>¡Elegiste {allDestinos.length} destinos! En el siguiente paso podrás asignar fechas por separado para cada uno si querés.</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showError && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="error-text" style={{ textAlign: 'center' }}>
            ✕ Seleccioná o escribí al menos un destino para continuar
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})
