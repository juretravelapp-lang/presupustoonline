import { useState, forwardRef, useImperativeHandle } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { DESTINOS_POPULARES } from '@/lib/constants'
import { Search, X, MapPin, Plus, Trash2 } from 'lucide-react'
import type { StepHandle } from '../WizardShell'
import { motion, AnimatePresence } from 'motion/react'

export const Step1Destination = forwardRef<StepHandle>(function Step1Destination(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()

  /* ── Local state ───────────────────────────────────────── */
  const [search, setSearch]     = useState('')
  const [selected, setSelected]   = useState<string[]>(data.destination.destinos_seleccionados)
  const [customList, setCustomList] = useState<string[]>(data.destination.destinos_custom)
  const [showError, setShowError]   = useState(false)

  const allDestinos = [...selected, ...customList]

  /* ── Toggle popular destino ─────────────────────────────── */
  const toggleDestino = (value: string) => {
    setShowError(false)
    setSelected(prev =>
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
    )
  }

  /* ── Add custom/popular destination from search ───────── */
  const addFromSearch = () => {
    const trimmed = search.trim()
    if (!trimmed) return

    // Check if it matches a popular destination (by label, case-insensitive)
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

  /* ── Validate & Auto-capture ────────────────────────────── */
  useImperativeHandle(ref, () => ({
    validate: async () => {
      let finalSelected = [...selected]
      let finalCustomList = [...customList]

      const trimmedSearch = search.trim()
      if (trimmedSearch) {
        // Auto-capture the current search input text as destination before moving next
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
        destinos_custom:        finalCustomList,
        destino:                all[0],
        destino_personalizado:  finalCustomList.join(', '),
      })
      markStepCompleted('destination')
      return true
    },
  }))

  /* Helper to check if search input is already added */
  const trimmedSearch = search.trim()
  const popularItem = trimmedSearch ? DESTINOS_POPULARES.find(p => p.label.toLowerCase() === trimmedSearch.toLowerCase()) : null
  const isSelectedPopular = popularItem ? selected.includes(popularItem.value) : false
  const isCustom = customList.some(c => c.toLowerCase() === trimmedSearch.toLowerCase())
  const alreadyAdded = isSelectedPopular || isCustom

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto w-full px-4 sm:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="text-center space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight"
        >
          ¿Hacia dónde viajamos?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-slate-400 font-medium"
        >
          Escribe tu destino ideal. Puedes elegir un solo lugar o armar un viaje multi-destino.
        </motion.p>
      </div>

      {/* ── Foolproof Flexbox Search Pill ─────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full flex flex-col items-center gap-2"
      >
        {/* The Pill */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 p-2 sm:p-2.5 rounded-[2rem] sm:rounded-full shadow-xl focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/30 transition-all flex flex-col sm:flex-row items-center gap-2">
          
          <div className="flex-1 flex items-center w-full bg-slate-800/50 rounded-full px-4 sm:px-6 h-12 sm:h-14">
            <Search className="text-slate-400 shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
            <input
              type="text"
              placeholder="Ej: Madrid, Tokio, Bariloche..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addFromSearch()
                }
              }}
              className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 px-3 sm:px-4 focus:outline-none text-base sm:text-lg font-medium w-full"
              aria-label="Buscar destino"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-slate-500 hover:text-slate-300 shrink-0 p-1"
                aria-label="Limpiar búsqueda"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <button
            type="button"
            onClick={addFromSearch}
            disabled={!search.trim() || alreadyAdded}
            className={`w-full sm:w-auto h-12 sm:h-14 px-8 rounded-full font-bold flex items-center justify-center transition-all shrink-0 text-base sm:text-lg ${
              !search.trim() || alreadyAdded
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md'
            }`}
          >
            {alreadyAdded ? 'Agregado' : 'Agregar'}
          </button>
        </div>

        {/* Error message inline */}
        <AnimatePresence>
          {showError && (
            <motion.p 
              initial={{ opacity: 0, y: -5, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              className="text-red-400 text-sm font-semibold mt-2 flex items-center gap-1.5"
            >
              <X size={14} strokeWidth={3} />
              Debes agregar al menos un destino para continuar
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Visual List of Selected Destinations (Solid Cards) ───────────────────────────────── */}
      <AnimatePresence>
        {allDestinos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full flex flex-col gap-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={20} className="text-amber-500" />
              <h3 className="text-base sm:text-lg font-bold text-slate-200">
                Tu Itinerario ({allDestinos.length})
              </h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Process all destinations chronologically */}
              {allDestinos.map((value, idx) => {
                const isPopular = selected.includes(value)
                const dest = isPopular ? DESTINOS_POPULARES.find(d => d.value === value) : null
                const label = dest?.label || value
                const emoji = dest?.emoji || '📍'

                return (
                  <motion.div
                    key={value}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-800/80 border border-slate-700 hover:border-slate-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Number badge */}
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-slate-100 font-bold text-lg leading-tight flex items-center gap-2">
                          {emoji} {label}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => isPopular ? toggleDestino(value) : removeCustom(value)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-colors shrink-0"
                      aria-label={`Quitar ${label}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Suggestions Chips ────────────────────────── */}
      <div className="w-full flex flex-col items-center sm:items-start border-t border-slate-800 pt-6">
        <p className="text-sm font-semibold text-slate-500 mb-4">
          O añade destinos populares:
        </p>
        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5">
          {DESTINOS_POPULARES.map(destino => {
            const isSelected = selected.includes(destino.value)
            if (isSelected) return null
            
            return (
              <button
                key={destino.value}
                type="button"
                onClick={() => toggleDestino(destino.value)}
                className="bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 py-2 px-4 rounded-full text-sm font-medium flex items-center gap-2 transition-all hover:bg-slate-800 shadow-sm"
              >
                <span className="text-lg">{destino.emoji}</span>
                <span>{destino.label}</span>
                <Plus size={16} className="text-slate-500 ml-1" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
})
