import { useState, forwardRef, useImperativeHandle } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { DESTINOS_POPULARES } from '@/lib/constants'
import { MapPin, Navigation, Check } from 'lucide-react'
import type { StepHandle } from '../WizardShell'
import { motion, AnimatePresence } from 'motion/react'

export const Step1Destination = forwardRef<StepHandle>(function Step1Destination(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()

  const [origin, setOrigin] = useState(data.origin.ciudad_salida || '')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>(data.destination.destinos_seleccionados)
  const [customList] = useState<string[]>(data.destination.destinos_custom)
  const [showError, setShowError] = useState(false)

  const toggleDestino = (value: string) => {
    setShowError(false)
    setSelected(prev =>
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
    )
  }

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
      }

      const all = [...finalSelected, ...finalCustomList]
      if (all.length === 0) {
        setShowError(true)
        return false
      }

      updateData('origin', { ciudad_salida: origin })
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

  return (
    <div className="flex flex-col" style={{ gap: 32 }}>
      {/* Inputs Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Origin Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: '#162032',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '16px 20px',
        }}>
          <Navigation size={24} style={{ color: '#D4B87A', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#D4B87A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ¿De qué ciudad salís?
            </label>
            <input
              type="text"
              placeholder="Ej. TUCUMAN"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 16, fontWeight: 700, width: '100%',
                textTransform: 'uppercase'
              }}
            />
          </div>
        </div>

        {/* Destination Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: '#162032',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '16px 20px',
        }}>
          <MapPin size={24} style={{ color: '#D4B87A', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#D4B87A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ¿A dónde viajás?
            </label>
            <input
              type="text"
              placeholder="Escribí tu destino (ej. Cancún, Europa)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 16, fontWeight: 500, width: '100%',
              }}
            />
          </div>
        </div>

        <AnimatePresence>
          {showError && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ fontSize: 13, color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Debés ingresar o seleccionar un destino
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Popular Destinations Grid */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          Destinos más buscados
        </h3>
        <p style={{ fontSize: 14, color: '#7a859b', marginBottom: 20, lineHeight: 1.5 }}>
          Podés escribir tu destino arriba o seleccionar uno (o varios) de los siguientes destinos populares:
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {DESTINOS_POPULARES.map(destino => {
            const isSelected = selected.includes(destino.value)

            return (
              <button
                key={destino.value}
                onClick={() => toggleDestino(destino.value)}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: 14,
                  minHeight: 110,
                  border: isSelected ? '2px solid #FF6B00' : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: isSelected ? '0 0 15px rgba(255,107,0,0.4)' : 'none',
                  overflow: 'hidden',
                  cursor: 'pointer', transition: 'all 0.2s',
                  textAlign: 'left'
                }}
              >
                {/* Background Image */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${destino.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0,
                  filter: isSelected ? 'brightness(0.9) saturate(1.2)' : 'brightness(0.5) saturate(0.8)',
                  transition: 'all 0.2s'
                }} />
                
                {/* Subtle gradient to ensure text readability */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)',
                  zIndex: 0
                }} />

                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#FF6B00', color: '#041224',
                        zIndex: 2
                      }}
                    >
                      <Check size={14} strokeWidth={4} />
                    </motion.span>
                  )}
                </AnimatePresence>
                
                <span style={{ 
                  position: 'relative', zIndex: 1, 
                  fontSize: 14, fontWeight: 800, 
                  color: '#fff', 
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)'
                }}>
                  {destino.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
})

