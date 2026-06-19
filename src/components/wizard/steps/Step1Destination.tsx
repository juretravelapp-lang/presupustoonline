import { useState, forwardRef, useImperativeHandle } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { DESTINOS_POPULARES } from '@/lib/constants'
import { Search, X, Plus, Trash2, MapPin } from 'lucide-react'
import type { StepHandle } from '../WizardShell'
import { motion, AnimatePresence } from 'motion/react'

export const Step1Destination = forwardRef<StepHandle>(function Step1Destination(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>(data.destination.destinos_seleccionados)
  const [customList, setCustomList] = useState<string[]>(data.destination.destinos_custom)
  const [showError, setShowError] = useState(false)

  const allDestinos = [...selected, ...customList]

  const toggleDestino = (value: string) => {
    setShowError(false)
    setSelected(prev =>
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
    )
  }

  const addFromSearch = () => {
    const trimmed = search.trim()
    if (!trimmed) return

    const matchedPopular = DESTINOS_POPULARES.find(
      d => d.label.toLowerCase() === trimmed.toLowerCase()
    )

    if (matchedPopular) {
      if (!selected.includes(matchedPopular.value)) {
        toggleDestino(matchedPopular.value)
      }
    } else {
      if (!customList.includes(trimmed)) {
        setCustomList(prev => [...prev, trimmed])
      }
    }
    setSearch('')
    setShowError(false)
  }

  const removeCustom = (val: string) =>
    setCustomList(prev => prev.filter(d => d !== val))

  useImperativeHandle(ref, () => ({
    validate: async () => {
      let finalSelected = [...selected]
      let finalCustomList = [...customList]

      const trimmedSearch = search.trim()
      if (trimmedSearch) {
        const matchedPopular = DESTINOS_POPULARES.find(
          d => d.label.toLowerCase() === trimmedSearch.toLowerCase()
        )
        if (matchedPopular) {
          if (!finalSelected.includes(matchedPopular.value)) {
            finalSelected.push(matchedPopular.value)
          }
        } else {
          const isAlreadySelectedPopular = finalSelected.some(v => {
            const p = DESTINOS_POPULARES.find(item => item.value === v)
            return p?.label.toLowerCase() === trimmedSearch.toLowerCase()
          })
          if (!finalCustomList.includes(trimmedSearch) && !isAlreadySelectedPopular) {
            finalCustomList.push(trimmedSearch)
          }
        }
        setSearch('')
      }

      const all = [...finalSelected, ...finalCustomList]
      if (all.length === 0) {
        setShowError(true)
        return false
      }

      updateData('destination', {
        destinos_seleccionados: finalSelected,
        destinos_custom: finalCustomList,
        destino: all[0],
        destino_personalizado: finalCustomList.join(', '),
      })
      markStepCompleted('destination')
      return true
    },
  }))

  const trimmedSearch = search.trim()
  const popularItem = trimmedSearch ? DESTINOS_POPULARES.find(p => p.label.toLowerCase() === trimmedSearch.toLowerCase()) : null
  const isSelectedPopular = popularItem ? selected.includes(popularItem.value) : false
  const isCustom = customList.some(c => c.toLowerCase() === trimmedSearch.toLowerCase())
  const alreadyAdded = isSelectedPopular || isCustom

  return (
    <div className="flex flex-col" style={{ gap: 28 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 style={{
          fontSize: 'clamp(24px, 5vw, 32px)',
          fontWeight: 700,
          fontFamily: 'var(--font-serif)',
          color: '#F0F4FF',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          marginBottom: 6,
        }}>
          ¿Hacia dónde viajamos?
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.8)', fontWeight: 500 }}>
          Escribí tu destino o elegí uno popular
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: '4px 4px 4px 18px',
          transition: 'border-color 0.2s',
        }}
          onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,169,110,0.4)' }}
          onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          <Search size={20} style={{ color: 'rgba(148,163,184,0.5)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Ej: Madrid, Tokio, Bariloche..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFromSearch() } }}
            style={{
              flex: 1, minWidth: 140, background: 'transparent', border: 'none', outline: 'none',
              color: '#F0F4FF', fontSize: 15, fontWeight: 500, padding: '14px 8px',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ padding: 6, color: 'rgba(148,163,184,0.5)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <X size={18} />
            </button>
          )}
          <button
            onClick={addFromSearch}
            disabled={!search.trim() || alreadyAdded}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              fontWeight: 700, fontSize: 13, cursor: !search.trim() || alreadyAdded ? 'not-allowed' : 'pointer',
              background: !search.trim() || alreadyAdded ? 'rgba(255,255,255,0.05)' : '#C9A96E',
              color: !search.trim() || alreadyAdded ? 'rgba(148,163,184,0.4)' : '#0A1526',
              transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {alreadyAdded ? '✓ Agregado' : 'Agregar'}
          </button>
        </div>

        <AnimatePresence>
          {showError && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ fontSize: 12, color: '#F87171', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <X size={12} strokeWidth={3} />
              Agregá al menos un destino para continuar
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Selected destinations */}
      <AnimatePresence>
        {allDestinos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MapPin size={16} style={{ color: '#C9A96E' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(148,163,184,0.9)' }}>
                Destinos seleccionados <span style={{ color: '#C9A96E' }}>({allDestinos.length})</span>
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allDestinos.map((value, idx) => {
                const isPopular = selected.includes(value)
                const dest = isPopular ? DESTINOS_POPULARES.find(d => d.value === value) : null
                const label = dest?.label || value
                const emoji = dest?.emoji || '📍'

                return (
                  <motion.div
                    key={value}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 12,
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(201,169,110,0.1)',
                      color: '#C9A96E', fontWeight: 700, fontSize: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: '#F0F4FF' }}>
                      {emoji} {label}
                    </span>
                    <button
                      onClick={() => isPopular ? toggleDestino(value) : removeCustom(value)}
                      style={{
                        padding: 6, background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(148,163,184,0.4)', borderRadius: 6, display: 'flex',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F87171' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.4)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popular destinations */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(148,163,184,0.5)', marginBottom: 10 }}>
          Destinos populares
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DESTINOS_POPULARES.map(destino => {
            const isSelected = selected.includes(destino.value)
            if (isSelected) return null

            return (
              <button
                key={destino.value}
                onClick={() => toggleDestino(destino.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(148,163,184,0.8)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'
                  e.currentTarget.style.background = 'rgba(201,169,110,0.06)'
                  e.currentTarget.style.color = '#F0F4FF'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.color = 'rgba(148,163,184,0.8)'
                }}
              >
                <span style={{ fontSize: 16 }}>{destino.emoji}</span>
                {destino.label}
                <Plus size={14} style={{ color: 'rgba(148,163,184,0.3)' }} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
})
