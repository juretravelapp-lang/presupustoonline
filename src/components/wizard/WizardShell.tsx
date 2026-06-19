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
import { ArrowLeft, ArrowRight, Send, Loader2, Check } from 'lucide-react'
import { WIZARD_STEPS, STEP_LABELS, STEP_EMOJIS } from '@/types/wizard'

export interface StepHandle {
  validate: () => Promise<boolean>
}

/* ── Single step circle (desktop & mobile) ──────────────────────── */
function StepDot({ label, isDone, isCurrent, index }: {
  label: string; isDone: boolean; isCurrent: boolean; index: number
}) {
  const size = isCurrent ? 36 : 32
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
      <motion.div
        animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: size, height: size, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isDone ? 13 : isCurrent ? 14 : 12,
          fontWeight: 800,
          background: isDone ? '#C9A96E' : isCurrent ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.06)',
          border: isDone ? 'none' : `2px solid ${isCurrent ? '#C9A96E' : 'rgba(255,255,255,0.1)'}`,
          color: isDone ? '#0A1526' : isCurrent ? '#C9A96E' : 'rgba(148,163,184,0.5)',
          boxShadow: isCurrent ? '0 0 20px rgba(201,169,110,0.2)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {isDone ? <Check size={14} strokeWidth={3} /> : index + 1}
      </motion.div>
      <span className="hidden sm:block" style={{
        fontSize: 10, fontWeight: isCurrent ? 700 : 500,
        color: isCurrent ? '#C9A96E' : isDone ? 'rgba(201,169,110,0.5)' : 'rgba(148,163,184,0.4)',
        textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        maxWidth: 80, lineHeight: 1.2,
      }}>
        {label}
      </span>
    </div>
  )
}

/* ── Step progress line ─────────────────────────────────────────── */
function ProgressLine({ done }: { done: boolean }) {
  return (
    <div style={{ flex: 1, height: 2, margin: '0 4px', marginBottom: 22, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: done ? '100%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
        style={{ height: '100%', background: '#C9A96E', borderRadius: 2 }}
      />
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
  const { openModal } = useUIStore()
  const stepRef = useRef<StepHandle>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)

  /* ── Navigation ─────────────────────────────────────────────── */
  const handleValidate = useCallback(async () => {
    if (!stepRef.current) return
    const isValid = await stepRef.current.validate()
    if (isValid) {
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
      const allDestinos = [...destinosSeleccionados, ...destinosCustom]
      const destinosText = allDestinos.map(d => d.replace(/_/g, ' ')).join(', ')

      let globalSalida = data.dates.fecha_salida
      let globalRegreso = data.dates.fecha_regreso
      if (Object.keys(data.dates.fechas_por_destino).length > 0) {
        const allSalidas = Object.values(data.dates.fechas_por_destino).map(f => f.fecha_salida).filter(Boolean)
        const allRegresos = Object.values(data.dates.fechas_por_destino).map(f => f.fecha_regreso).filter(Boolean)
        if (allSalidas.length) globalSalida = allSalidas.sort()[0]
        if (allRegresos.length) globalRegreso = allRegresos.sort().reverse()[0]
      }

      const authUser = useAuthStore.getState().user
      const isOperatorMode = !!authUser

      const quoteData: InsertQuote = {
        nombre: data.personal.nombre,
        apellido: data.personal.apellido,
        dni: data.personal.dni,
        email: data.personal.email,
        celular: data.personal.celular,
        ciudad_salida: data.origin.ciudad_salida?.replace(/_/g, ' ') || null,
        aeropuerto_salida: data.origin.aeropuerto_salida || null,
        destino: destinosText || null,
        destino_personalizado: destinosCustom.length > 0 ? destinosCustom.join(', ') : (data.destination.destino_personalizado || null),
        destinos: allDestinos,
        tipo_fecha: data.dates.tipo_fecha === 'exacta' ? 'exacta' : 'flexible',
        fecha_salida: globalSalida || null,
        fecha_regreso: globalRegreso || null,
        rango_fecha_inicio: data.dates.tipo_fecha === 'exacta' ? (globalSalida || null) : null,
        rango_fecha_fin: data.dates.tipo_fecha === 'exacta' ? (globalRegreso || null) : null,
        mes_preferido: data.dates.mes_preferido || null,
        adultos: data.passengers.adultos,
        ninos_2_12: data.passengers.ninos_2_12,
        bebes_0_2: data.passengers.bebes_0_2,
        preferencias: data.preferences.preferencias,
        comentarios: data.comments.comentarios || null,
        tipo_viaje: data.comments.tipo_viaje || null,
        ip_address: null,
        origen_consulta: isOperatorMode ? 'operador' : 'web',
        estado: 'no_cotizado',
        whatsapp_enviado: false,
        whatsapp_mensaje: null,
        creador_email: isOperatorMode ? authUser.email : null,
        operador_nombre: isOperatorMode ? authUser.nombre : null,
      }

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
  const handleTouchMove = (e: React.TouchEvent) => {
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
      case 'dates': return <Step2Dates ref={stepRef} />
      case 'passengers': return <Step3Passengers ref={stepRef} />
      case 'preferences': return <Step4Preferences ref={stepRef} />
      case 'contact': return <Step5Contact ref={stepRef} />
      case 'summary': return <Step6Summary />
      default: return null
    }
  }

  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen pb-32 sm:pb-28"
      style={{
        background: 'linear-gradient(160deg, #0A1526 0%, #0F1E35 45%, #0D2040 100%)',
      }}
    >
      <a href="#wizard-content" className="skip-link">Saltar al formulario</a>

      {/* Auto-Save Toast */}
      <AnimatePresence>
        {hasRestoredDraft && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
              zIndex: 9999, background: '#C9A96E', color: '#0A1526',
              padding: '10px 24px', borderRadius: 999,
              display: 'flex', alignItems: 'center', gap: 8,
              fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(201,169,110,0.35)',
            }}
          >
            <Check size={16} strokeWidth={3} />
            Recuperamos tu progreso
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
              background: 'rgba(10,21,38,0.92)', backdropFilter: 'blur(12px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '3px solid rgba(201,169,110,0.15)',
                borderTopColor: '#C9A96E', marginBottom: 20,
              }}
            />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#F0F4FF' }}>
              Enviando solicitud...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step progress bar ──────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(10,21,38,0.96)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 20px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {WIZARD_STEPS.map((step, index) => {
              const isDone = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <StepDot
                    index={index}
                    label={STEP_LABELS[step as keyof typeof STEP_LABELS]}
                    isDone={isDone}
                    isCurrent={isCurrent}
                  />
                  {index < WIZARD_STEPS.length - 1 && <ProgressLine done={isDone} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Step content ──────────────────────────────────────── */}
      <main
        id="wizard-content"
        role="main"
        className="px-4 sm:px-6 pt-6 sm:pt-8"
        style={{ maxWidth: 720, margin: '0 auto' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: 'clamp(20px, 4vw, 40px)',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <StepWrapper stepKey={currentStep} direction={direction}>
            {renderStep()}
          </StepWrapper>

          {/* ── Navigation ───────────────────────────────────── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div>
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 18px', background: 'transparent',
                    color: 'rgba(148,163,184,0.8)', fontWeight: 600, fontSize: 13,
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#F0F4FF' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(148,163,184,0.8)' }}
                >
                  <ArrowLeft size={15} /> Anterior
                </button>
              )}
            </div>
            <div>
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px', background: '#C9A96E',
                    color: '#0A1526', fontWeight: 800, fontSize: 14,
                    border: 'none', borderRadius: 12,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.5 : 1,
                    transition: 'all 0.15s',
                    boxShadow: '0 4px 16px rgba(201,169,110,0.25)',
                  }}
                  onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.background = '#D4B87A'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              ) : (
                <button
                  onClick={handleValidate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 28px', background: '#C9A96E',
                    color: '#0A1526', fontWeight: 800, fontSize: 14,
                    border: 'none', borderRadius: 12,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: '0 4px 16px rgba(201,169,110,0.25)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#D4B87A'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  Continuar <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex', justifyContent: 'center', gap: 20,
            marginTop: 20, paddingBottom: 20,
          }}
        >
          {['1.000+ viajeros', 'Atención personalizada', 'Sin compromiso'].map(text => (
            <span key={text} style={{
              fontSize: 11, color: 'rgba(100,116,139,0.5)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#C9A96E', display: 'inline-block' }} />
              {text}
            </span>
          ))}
        </motion.div>
      </main>
    </div>
  )
}
