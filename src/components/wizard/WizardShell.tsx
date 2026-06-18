import { useRef, useCallback, useState, useEffect } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { StepWrapper } from './StepWrapper'
import { Step1Destination } from './steps/Step1Destination'
import { Step2Dates } from './steps/Step2Dates'
import { Step3Passengers } from './steps/Step3Passengers'
import { Step4Preferences } from './steps/Step4Preferences'
import { Step5Contact } from './steps/Step5Contact'
import { Step6Summary } from './steps/Step6Summary'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { insertQuote, type InsertQuote } from '@/lib/supabase'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react'
import { WIZARD_STEPS, STEP_LABELS, STEP_EMOJIS } from '@/types/wizard'

export interface StepHandle {
  validate: () => Promise<boolean>
}

/* ── Sparkle particle on step advance ───────────────────────────── */
function StepSpark({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <AnimatePresence>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.2, 0],
            x: (Math.cos((i / 6) * Math.PI * 2) * 28),
            y: (Math.sin((i / 6) * Math.PI * 2) * 28),
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.55, delay: i * 0.04, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 6, height: 6,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#F59E0B' : '#FBBF24',
            pointerEvents: 'none',
          }}
        />
      ))}
    </AnimatePresence>
  )
}

/* ── Desktop step circle ─────────────────────────────────────────── */
function StepCircle({
  index, step, isCurrent, isDone,
  showSpark,
}: {
  index: number
  step: string
  isCurrent: boolean
  isDone: boolean
  showSpark: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
      {/* Spark particles */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StepSpark active={showSpark && isCurrent} />

        <motion.div
          animate={isCurrent ? {
            scale: [1, 1.08, 1],
            boxShadow: ['0 0 0 0 rgba(245,158,11,0)', '0 0 0 8px rgba(245,158,11,0.15)', '0 0 0 0 rgba(245,158,11,0)'],
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 38, height: 38,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isDone ? 16 : isCurrent ? 18 : 13,
            fontWeight: 800,
            background:
              isDone    ? 'linear-gradient(135deg, #F59E0B, #FBBF24)' :
              isCurrent ? 'rgba(245,158,11,0.15)' :
                          'rgba(255,255,255,0.05)',
            border:
              isDone    ? '2px solid transparent' :
              isCurrent ? '2px solid #F59E0B' :
                          '2px solid rgba(255,255,255,0.08)',
            color:
              isDone    ? '#0A1526' :
              isCurrent ? '#F59E0B' :
                          'rgba(100,116,139,0.8)',
            boxShadow: isDone ? '0 4px 16px rgba(245,158,11,0.35)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {isDone ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : isCurrent ? (
            STEP_EMOJIS[step as keyof typeof STEP_EMOJIS]
          ) : (
            index + 1
          )}
        </motion.div>
      </div>

      <span style={{
        fontSize: 10,
        fontWeight: isCurrent ? 700 : 500,
        color: isCurrent ? '#F59E0B' : isDone ? 'rgba(251,191,36,0.65)' : 'rgba(100,116,139,0.8)',
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}>
        {STEP_LABELS[step as keyof typeof STEP_LABELS]}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */

export function WizardShell() {
  const {
    currentStep, currentStepIndex, direction,
    nextStep, prevStep, isSubmitting,
    setSubmitting, setSubmitted, data, hasRestoredDraft
  } = useWizardStore()
  const { openModal }  = useUIStore()
  const stepRef        = useRef<StepHandle>(null)
  const [touchStart, setTouchStart]   = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [showSpark, setShowSpark]     = useState(false)

  /* ── Navigation ─────────────────────────────────────────────── */
  const handleValidate = useCallback(async () => {
    if (!stepRef.current) return
    const isValid = await stepRef.current.validate()
    if (isValid) {
      setShowSpark(true)
      setTimeout(() => setShowSpark(false), 700)
      nextStep()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [nextStep])

  const handlePrev = useCallback(() => {
    prevStep()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [prevStep])

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    try {
      const destinosSeleccionados = data.destination.destinos_seleccionados || []
      const destinosCustom = data.destination.destinos_custom || []
      const allDestinos = [
        ...destinosSeleccionados,
        ...destinosCustom,
      ]
      const destinosText = allDestinos.map(d => d.replace(/_/g, ' ')).join(', ')

      // Compute global start/end dates
      let globalSalida  = data.dates.fecha_salida
      let globalRegreso = data.dates.fecha_regreso
      if (Object.keys(data.dates.fechas_por_destino).length > 0) {
        const allSalidas  = Object.values(data.dates.fechas_por_destino).map(f => f.fecha_salida).filter(Boolean)
        const allRegresos = Object.values(data.dates.fechas_por_destino).map(f => f.fecha_regreso).filter(Boolean)
        if (allSalidas.length)  globalSalida  = allSalidas.sort()[0]
        if (allRegresos.length) globalRegreso = allRegresos.sort().reverse()[0]
      }

      // Read active session info for Operator Mode attribution
      const authUser = useAuthStore.getState().user
      const isOperatorMode = !!authUser

      const quoteData: InsertQuote = {
        nombre:                data.personal.nombre,
        apellido:              data.personal.apellido,
        dni:                   data.personal.dni,
        email:                 data.personal.email,
        celular:               data.personal.celular,
        ciudad_salida:         data.origin.ciudad_salida?.replace(/_/g, ' ') || null,
        aeropuerto_salida:     data.origin.aeropuerto_salida || null,
        destino:               destinosText || null,
        destino_personalizado: destinosCustom.length > 0 ? destinosCustom.join(', ') : (data.destination.destino_personalizado || null),
        destinos:              allDestinos,
        tipo_fecha:            data.dates.tipo_fecha === 'exacta' ? 'exacta' : 'flexible',
        fecha_salida:          globalSalida  || null,
        fecha_regreso:         globalRegreso || null,
        rango_fecha_inicio:    data.dates.tipo_fecha === 'exacta' ? (globalSalida || null) : null,
        rango_fecha_fin:       data.dates.tipo_fecha === 'exacta' ? (globalRegreso || null) : null,
        mes_preferido:         data.dates.mes_preferido || null,
        adultos:               data.passengers.adultos,
        ninos_2_12:            data.passengers.ninos_2_12,
        bebes_0_2:             data.passengers.bebes_0_2,
        preferencias:          data.preferences.preferencias,
        comentarios:           data.comments.comentarios || null,
        tipo_viaje:            data.comments.tipo_viaje || null,
        ip_address:            null,
        origen_consulta:       isOperatorMode ? 'operador' : 'web',
        estado:                'no_cotizado',
        whatsapp_enviado:      false,
        whatsapp_mensaje:      null,
        creador_email:         isOperatorMode ? authUser.email : null,
        operador_nombre:       isOperatorMode ? authUser.nombre : null,
      }

      console.log('%c✈️ COTIZACIÓN JURE TRAVEL', 'color:#F59E0B;font-weight:bold;font-size:14px;')
      console.log(JSON.stringify(quoteData, null, 2))

      await insertQuote(quoteData)
      setSubmitted(true)
      openModal('success')
    } catch (error) {
      console.error('Error saving quote:', error)
      alert('Error al guardar: ' + (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }, [data, setSubmitting, setSubmitted, openModal])

  /* ── Touch swipe ─────────────────────────────────────────────── */
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const handleTouchMove  = (e: React.TouchEvent) => {
    if (touchStart === null) return
    setSwipeOffset(Math.min(Math.max((touchStart - e.touches[0].clientX) * 0.25, -40), 40))
  }
  const handleTouchEnd = () => {
    if (swipeOffset > 30 && currentStepIndex < WIZARD_STEPS.length - 1) handleValidate()
    else if (swipeOffset < -30 && currentStepIndex > 0) handlePrev()
    setSwipeOffset(0)
    setTouchStart(null)
  }

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [currentStepIndex])

  const renderStep = () => {
    switch (currentStep) {
      case 'destination': return <Step1Destination ref={stepRef} />
      case 'dates':       return <Step2Dates ref={stepRef} />
      case 'passengers':  return <Step3Passengers ref={stepRef} />
      case 'preferences': return <Step4Preferences ref={stepRef} />
      case 'contact':     return <Step5Contact ref={stepRef} />
      case 'summary':     return <Step6Summary />
      default:            return null
    }
  }

  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1
  const progress   = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen pb-36 sm:pb-24" style={{ background: 'transparent' }}>
      <a href="#wizard-content" className="skip-link">Saltar al formulario</a>

      {/* Auto-Save Toast */}
      <AnimatePresence>
        {hasRestoredDraft && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 16, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: '50%',
              zIndex: 9999,
              background: 'rgba(245, 158, 11, 0.95)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Hemos recuperado tu progreso
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Loading Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: 'rgba(10,21,38,0.9)', backdropFilter: 'blur(10px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Loader2 className="animate-spin text-amber-500 mb-4" size={56} />
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#F0F4FF', marginBottom: 8 }}>
              Estamos tomando tu pedido...
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.9)', fontWeight: 500 }}>
              Preparando los detalles para nuestros asesores
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════
          DESKTOP – step indicator bar
      ════════════════════════════════════════════════════ */}
      <div className="hidden sm:block" style={{
        width: '100%', position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(10,21,38,0.96)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '16px 32px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
            {WIZARD_STEPS.map((step, index) => {
              const isDone    = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <StepCircle
                    index={index} step={step}
                    isCurrent={isCurrent} isDone={isDone}
                    showSpark={showSpark}
                  />
                  {index < WIZARD_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden', margin: '0 6px', marginBottom: 20 }}>
                      <motion.div
                        style={{ height: '100%', background: 'linear-gradient(90deg,#F59E0B,#FBBF24)', borderRadius: 1 }}
                        initial={{ width: '0%' }}
                        animate={{ width: isDone ? '100%' : isCurrent ? '35%' : '0%' }}
                        transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MOBILE – sticky top header with emotion
      ════════════════════════════════════════════════════ */}
      <div className="block sm:hidden" style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(10,21,38,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 16px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          {/* Back button */}
          {currentStepIndex > 0 ? (
            <button onClick={handlePrev} aria-label="Paso anterior" style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(148,163,184,1)',
            }}>
              <ArrowLeft size={16} />
            </button>
          ) : <div style={{ width: 36 }} />}

          {/* Current step info */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <motion.div
              key={currentStep}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              style={{ fontSize: 22, marginBottom: 2 }}
            >
              {STEP_EMOJIS[currentStep]}
            </motion.div>
            <motion.p
              key={`label-${currentStep}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B', letterSpacing: '-0.01em', lineHeight: 1 }}
            >
              {STEP_LABELS[currentStep]}
            </motion.p>
            <p style={{ fontSize: 10, color: 'rgba(100,116,139,0.9)', fontWeight: 500, marginTop: 2 }}>
              Paso {currentStepIndex + 1} de {WIZARD_STEPS.length}
            </p>
          </div>

          <div style={{ width: 36 }} />
        </div>

        {/* Animated progress bar with shimmer */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #B45309, #F59E0B, #FBBF24, #F59E0B)',
              backgroundSize: '200% 100%',
              borderRadius: 999,
              animation: 'shimmer-bar 2s linear infinite',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          />
        </div>

        {/* Mini step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 8 }}>
          {WIZARD_STEPS.map((step, index) => {
            const isDone    = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            return (
              <motion.div
                key={step}
                animate={{ width: isCurrent ? 24 : isDone ? 16 : 6 }}
                transition={{ duration: 0.3 }}
                style={{
                  height: 4,
                  borderRadius: 999,
                  background: isCurrent ? '#F59E0B' : isDone ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.1)',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          WIZARD CARD
      ════════════════════════════════════════════════════ */}
      <main
        id="wizard-content"
        role="main"
        className="w-full px-4 pt-5 sm:px-6 sm:pt-8"
        style={{ maxWidth: 672, margin: '0 auto' }}
      >
        <motion.div
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: swipeOffset === 0 ? 'transform 0.3s cubic-bezier(0.16,1,0.3,1)' : 'none',
          }}
        >
          <div className="p-5 sm:p-8">
            <StepWrapper stepKey={currentStep} direction={direction}>
              {renderStep()}
            </StepWrapper>
          </div>
        </motion.div>

        {/* Trust signals – desktop */}
        <motion.div
          className="hidden sm:flex mt-7 justify-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {['1.000+ viajeros asesorados', 'Atención personalizada', 'Sin compromiso'].map(text => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(100,116,139,0.9)', fontWeight: 500 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {text}
            </div>
          ))}
        </motion.div>
      </main>

      {/* ════════════════════════════════════════════════════
          MOBILE – bottom nav bar
      ════════════════════════════════════════════════════ */}
      <div className="block sm:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,21,38,0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
      }}>
        <AnimatePresence mode="wait">
          {isLastStep ? (
            <motion.button
              key="submit"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-cta"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {isSubmitting ? 'Enviando solicitud...' : '✈️ Enviar solicitud'}
            </motion.button>
          ) : (
            <motion.button
              key="next"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={handleValidate}
              className="btn-cta"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Siguiente paso
              <ArrowRight size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════
          DESKTOP – prev / next buttons
      ════════════════════════════════════════════════════ */}
      <div className="hidden sm:flex" style={{ maxWidth: 672, margin: '0 auto', padding: '20px 24px 48px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {currentStepIndex > 0 && (
            <button onClick={handlePrev} className="btn-ghost" aria-label="Paso anterior">
              <ArrowLeft size={16} /> Anterior
            </button>
          )}
        </div>
        <div>
          {isLastStep ? (
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-cta">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {isSubmitting ? 'Enviando...' : '✈️ Enviar solicitud'}
            </button>
          ) : (
            <button onClick={handleValidate} className="btn-cta">
              Siguiente <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
