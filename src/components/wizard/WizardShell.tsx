import { useRef, useCallback, useState, useEffect } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { StepWrapper } from './StepWrapper'
import { SplashIntro } from './SplashIntro'
import { Step1Destination } from './steps/Step1Destination'
import { Step2Dates } from './steps/Step2Dates'
import { Step3Passengers } from './steps/Step3Passengers'
import { Step4Preferences } from './steps/Step4Preferences'
import { Step5Contact } from './steps/Step5Contact'
import { Step6Summary } from './steps/Step6Summary'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { insertQuote, syncClienteFromQuote, updateQuoteCliente, type InsertQuote } from '@/lib/supabase'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Send, Loader2, Check, Plane, Calendar, Users, Sparkles, Mail, FileText } from 'lucide-react'
import { WIZARD_STEPS, STEP_LABELS } from '@/types/wizard'

export interface StepHandle {
  validate: () => Promise<boolean>
}

const STEP_ICONS: Record<string, React.ElementType> = {
  destination: Plane,
  dates: Calendar,
  passengers: Users,
  preferences: Sparkles,
  contact: Mail,
  summary: FileText,
}

/* ── Single step circle (desktop & mobile) ──────────────────────── */
function StepDot({ isDone, isCurrent, stepKey }: {
  isDone: boolean; isCurrent: boolean; stepKey: string
}) {
  const size = 36
  const Icon = STEP_ICONS[stepKey] || Plane
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0, position: 'relative' }}>
      <motion.div
        animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: size, height: size, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isDone ? '#2d3345' : isCurrent ? '#FF6B00' : '#1e2433',
          border: isCurrent ? '2px solid rgba(255,107,0,0.3)' : '1px solid rgba(255,255,255,0.05)',
          color: isDone ? '#5e687e' : isCurrent ? '#041224' : '#384152',
          boxShadow: isCurrent ? '0 0 15px rgba(255,107,0,0.3)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          zIndex: 2,
        }}
      >
        <Icon size={16} strokeWidth={isCurrent ? 2.5 : 2} />
      </motion.div>
    </div>
  )
}

/* ── Step progress line ─────────────────────────────────────────── */
function ProgressLine({ done }: { done: boolean }) {
  return (
    <div style={{ flex: 1, height: 2, margin: '0 -4px', background: '#1e2433', zIndex: 1, position: 'relative' }}>
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: done ? '100%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
        style={{ height: '100%', background: '#FF6B00' }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */

export function WizardShell() {
  const [splashDone, setSplashDone] = useState(false)
  const {
    currentStep, currentStepIndex, direction,
    nextStep, prevStep, isSubmitting,
    setSubmitting, setSubmitted, data, hasRestoredDraft
  } = useWizardStore()
  const { openModal } = useUIStore()
  const stepRef = useRef<StepHandle>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    // Validar el paso final antes de enviar (ej. Paso de contacto)
    if (stepRef.current) {
      const isValid = await stepRef.current.validate()
      if (!isValid) return
    }

    setSubmitting(true)
    setSubmitError(null)
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
      
      const ticket = 'JT-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000).toString()
      useWizardStore.getState().setGeneratedTicket(ticket)

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
        edades_adultos: data.passengers.edades_adultos || null,
        preferencias: data.preferences.preferencias,
        comentarios: data.comments.comentarios || null,
        tipo_viaje: data.comments.tipo_viaje || null,
        ip_address: null,
        origen_consulta: isOperatorMode ? 'operador' : 'web',
        estado: 'no_cotizado',
        whatsapp_enviado: false,
        whatsapp_mensaje: null,
        ticket_id: ticket,
        creador_email: isOperatorMode ? authUser.email : null,
        operador_nombre: isOperatorMode ? authUser.nombre : null,
      }

      const inserted = await insertQuote(quoteData)

      // Alta/actualización automática de la ficha maestra del cliente
      try {
        const clienteId = await syncClienteFromQuote({
          nombre: quoteData.nombre,
          apellido: quoteData.apellido,
          dni: quoteData.dni,
          email: quoteData.email,
          celular: quoteData.celular,
        })
        if (clienteId) {
          await updateQuoteCliente(inserted.id, clienteId)
        }
      } catch (err) {
        console.error('Error al vincular cliente:', err)
      }

      setSubmitted(true)
      openModal('success')
    } catch (error) {
      console.error('Error saving quote:', error)
      setSubmitError(
        'No pudimos guardar tu solicitud. Revisá tu conexión a internet e intentá de nuevo.'
      )
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
    <>
      <AnimatePresence>
        {!splashDone && <SplashIntro onFinish={() => setSplashDone(true)} />}
      </AnimatePresence>
      <div className="min-h-screen pb-32 sm:pb-28"
        style={{
          background: 'linear-gradient(160deg, #041224 0%, #0A1D36 45%, #08172D 100%)',
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
              zIndex: 9999, background: '#FF6B00', color: '#041224',
              padding: '10px 24px', borderRadius: 999,
              display: 'flex', alignItems: 'center', gap: 8,
              fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(255,107,0,0.35)',
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
              background: 'rgba(4,18,36,0.92)', backdropFilter: 'blur(12px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '3px solid rgba(255,107,0,0.15)',
                borderTopColor: '#FF6B00', marginBottom: 20,
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
        background: '#041224', // Solid dark background for the header
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            {WIZARD_STEPS.map((step, index) => {
              const isDone = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <StepDot
                    stepKey={step}
                    isDone={isDone}
                    isCurrent={isCurrent}
                  />
                  {index < WIZARD_STEPS.length - 1 && <ProgressLine done={isDone} />}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>
              Paso {currentStepIndex + 1} de {WIZARD_STEPS.length}: <span style={{ color: '#FF6B00' }}>{STEP_LABELS[currentStep as keyof typeof STEP_LABELS]}</span>
            </h2>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7a859b' }}>
              {Math.round(((currentStepIndex) / WIZARD_STEPS.length) * 100)}% completado
            </span>
          </div>
        </div>
      </div>

      {/* ── Step content ──────────────────────────────────────── */}
      <main
        id="wizard-content"
        role="main"
        className="px-4 sm:px-6 pt-0 sm:pt-4"
        style={{ maxWidth: 720, margin: '0 auto' }}
      >
        {submitError && (
          <div
            role="alert"
            style={{
              marginBottom: 16,
              padding: '14px 18px',
              borderRadius: 14,
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#FECACA',
              fontSize: 13.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span>{submitError}</span>
            <button
              type="button"
              aria-label="Cerrar aviso"
              onClick={() => setSubmitError(null)}
              style={{
                background: 'none', border: 'none', color: '#FECACA',
                cursor: 'pointer', fontSize: 16, lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: '#162032',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.03)',
            padding: 'clamp(20px, 4vw, 32px)',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <StepWrapper stepKey={currentStep} direction={direction}>
            {renderStep()}
          </StepWrapper>
        </motion.div>

        {/* ── Navigation (Sticky Bottom) ─────────────────────── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(4, 18, 36, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 20px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          display: 'flex', justifyContent: 'center',
          zIndex: 50,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{ 
            width: '100%', maxWidth: 720, margin: '0 auto', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <div>
              {currentStepIndex > 0 ? (
                <button
                  onClick={handlePrev}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '12px 20px', background: 'transparent',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                  <ArrowLeft size={16} /> Atrás
                </button>
              ) : (
                <span style={{ fontSize: 14, fontWeight: 700, color: '#FF6B00' }}>
                  Armá tu viaje
                </span>
              )}
            </div>
            <div>
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '14px 28px', background: '#FF6B00',
                    color: '#041224', fontWeight: 800, fontSize: 15,
                    border: 'none', borderRadius: 12,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              ) : (
                <button
                  onClick={handleValidate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '14px 28px', background: '#FF6B00',
                    color: '#041224', fontWeight: 800, fontSize: 15,
                    border: 'none', borderRadius: 12,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FF8533' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FF6B00' }}
                >
                  Siguiente <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Spacer to prevent content from hiding behind the fixed bottom bar */}
        <div style={{ height: 100 }} />

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
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#FF6B00', display: 'inline-block' }} />
              {text}
            </span>
          ))}
        </motion.div>
      </main>
    </div>
  </>
  )
}
