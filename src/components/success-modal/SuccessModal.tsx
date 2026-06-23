import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useWizardStore } from '@/stores/wizardStore'
import { useWhatsApp } from '@/hooks/useWhatsApp'
import { motion, AnimatePresence } from 'motion/react'
import { X, RotateCcw } from 'lucide-react'

/* ── Confetti particle ───────────────────────────────────────────── */
const CONFETTI_COLORS = ['#F59E0B', '#FBBF24', '#34D399', '#60A5FA', '#F472B6', '#A78BFA', '#FB923C']

function ConfettiParticle({ index }: { index: number }) {
  const color  = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
  const x      = Math.random() * 300 - 150
  const rotate = Math.random() * 720 - 360
  const delay  = Math.random() * 0.4
  const size   = 6 + Math.random() * 8

  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ y: 250 + Math.random() * 100, x, opacity: 0, rotate, scale: 0.4 }}
      transition={{ duration: 1.4 + Math.random() * 0.6, delay, ease: 'easeIn' }}
      style={{
        position: 'absolute',
        top: '30%', left: '50%',
        width: size, height: size * (Math.random() > 0.5 ? 1 : 0.5),
        borderRadius: Math.random() > 0.5 ? '50%' : 2,
        background: color,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  )
}

/* ── Airplane takeoff animation ─────────────────────────────────── */
function AirplaneLiftoff({ started }: { started: boolean }) {
  return (
    <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto' }}>
      {/* Glow ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={started ? { scale: [0.5, 1.4, 1], opacity: [0, 0.5, 0] } : {}}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: -10,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)',
        }}
      />

      {/* Outer ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={started ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
        style={{
          width: 100, height: 100,
          borderRadius: '50%',
          background: 'rgba(245,158,11,0.1)',
          border: '2px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Inner ring */}
        <motion.div
          initial={{ scale: 0 }}
          animate={started ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.2 }}
          style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: 'rgba(245,158,11,0.15)',
            border: '2px solid rgba(245,158,11,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Airplane */}
          <motion.span
            initial={{ scale: 0, rotate: -30, y: 0 }}
            animate={started ? {
              scale:  [0, 1.4, 1],
              rotate: [-30, -30, -30],
              y:      [0, 0, -4, 0, -4, 0],
            } : {}}
            transition={{
              scale:  { duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] },
              rotate: { duration: 0.5, delay: 0.3 },
              y:      { duration: 1.6, delay: 0.9, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ fontSize: 38, display: 'inline-block', transformOrigin: 'center' }}
          >
            ✈️
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Exhaust trail */}
      {started && [0, 1, 2].map(i => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: [0, 0.6, 0], scaleX: [0, 1, 1.4] }}
          transition={{ duration: 0.8, delay: 0.5 + i * 0.15, repeat: Infinity, repeatDelay: 0.3 }}
          style={{
            position: 'absolute',
            bottom: 14 + i * 6,
            left: -28 - i * 8,
            width: 20 + i * 8,
            height: 3,
            borderRadius: 999,
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4))',
            transformOrigin: 'right',
          }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */

export function SuccessModal() {
  const { activeModal, closeModal } = useUIStore()
  const { reset }                   = useWizardStore()
  const { sendWhatsApp }            = useWhatsApp()
  const isOpen   = activeModal === 'success'
  const [animStarted, setAnimStarted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiCount = 18

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimStarted(true), 100)
      setTimeout(() => setShowConfetti(true), 200)
      setTimeout(() => setShowConfetti(false), 2000)
      setTimeout(() => sendWhatsApp(), 2500)
    } else {
      setAnimStarted(false)
      setShowConfetti(false)
    }
  }, [isOpen])

  const handleNewQuote = () => { reset(); closeModal() }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-5"
          style={{
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
          }}
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="relative overflow-hidden w-full rounded-t-[28px] sm:rounded-[28px] max-w-full sm:max-w-[420px] px-6 pt-8 pb-11 sm:p-11"
            style={{
              background: 'linear-gradient(160deg, #0F1E35 0%, #0D2040 100%)',
              border: '1.5px solid rgba(255,255,255,0.09)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Drag handle */}
            <div className="block sm:hidden" style={{ width: 44, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 999, margin: '-12px auto 28px' }} />

            {/* Close (desktop) */}
            <button onClick={closeModal} aria-label="Cerrar" className="hidden sm:flex" style={{ position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(148,163,184,0.8)' }}>
              <X size={16} />
            </button>

            {/* Confetti burst */}
            {showConfetti && [...Array(confettiCount)].map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}

            {/* Decorative ambient glow */}
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Airplane animation */}
            <div style={{ marginBottom: 24 }}>
              <AirplaneLiftoff started={animStarted} />
            </div>

            {/* Check badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={animStarted ? { scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.8 }}
              style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#34D399,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(52,211,153,0.35)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={animStarted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 }}
              style={{ fontSize: 26, fontWeight: 900, color: '#F0F4FF', textAlign: 'center', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', marginBottom: 10, lineHeight: 1.2 }}
            >
              ¡Solicitud recibida! 🎉
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={animStarted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.0 }}
              style={{ fontSize: 15, color: 'rgba(148,163,184,0.85)', textAlign: 'center', lineHeight: 1.65, fontWeight: 500, marginBottom: 28 }}
            >
              Tu solicitud fue recibida con éxito. Pronto nos pondremos en contacto con vos con la mejor propuesta personalizada para tu viaje. ✨
            </motion.p>

            {/* Success details */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={animStarted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}
            >
              <div style={{ padding: '12px 24px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'rgba(201,169,110,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', textAlign: 'center', marginBottom: 4 }}>
                  TICKET
                </span>
                <span style={{ fontSize: 20, color: '#C9A96E', fontWeight: 900, letterSpacing: '0.02em', textAlign: 'center', display: 'block' }}>
                  {useWizardStore.getState().generatedTicket}
                </span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={animStarted ? { opacity: 1 } : {}}
              transition={{ delay: 1.3 }}
              style={{ fontSize: 11, color: 'rgba(100,116,139,0.7)', textAlign: 'center', marginTop: 18, fontWeight: 500 }}
            >
              Sin compromiso · Tu info está protegida · Atención personalizada
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
