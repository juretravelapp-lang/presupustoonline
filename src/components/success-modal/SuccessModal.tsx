import { useEffect, useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useWizardStore } from '@/stores/wizardStore'
import { useWhatsApp } from '@/hooks/useWhatsApp'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

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
  const { sendWhatsApp }            = useWhatsApp()
  const { data, generatedTicket }   = useWizardStore()
  const isOpen   = activeModal === 'success'
  const [animStarted, setAnimStarted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiCount = 18

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimStarted(true), 100)
      setTimeout(() => setShowConfetti(true), 200)
      setTimeout(() => setShowConfetti(false), 2000)
    } else {
      setAnimStarted(false)
      setShowConfetti(false)
    }
  }, [isOpen])

  const nombre = data?.personal?.nombre || 'Pasajero'
  const apellido = data?.personal?.apellido || ''
  const destinoRaw = data?.destination?.destinos_seleccionados?.[0]?.replace(/_/g, ' ') || data?.destination?.destino_personalizado || 'DESTINO A MEDIDA'
  const destino = destinoRaw.toUpperCase()
  const origen = data?.origin?.ciudad_salida?.toUpperCase().substring(0, 3) || 'BUE'
  const destinoCode = destino.substring(0, 3).toUpperCase()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-5"
          style={{
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={closeModal}
        >
          {/* Confetti burst */}
          {showConfetti && [...Array(confettiCount)].map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-full sm:max-w-[420px]"
          >
            {/* Close (desktop) */}
            <button onClick={closeModal} aria-label="Cerrar" className="hidden sm:flex" style={{ position: 'absolute', top: -40, right: 0, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(148,163,184,0.8)', zIndex: 10 }}>
              <X size={16} />
            </button>

            {/* Boarding Pass Container */}
            <div style={{ display: 'flex', flexDirection: 'column', filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.6))' }}>
              
              {/* TOP SECTION */}
              <div style={{
                background: 'linear-gradient(160deg, #1A2744 0%, #0D1A2E 100%)',
                borderRadius: '24px 24px 0 0',
                padding: '32px 24px 28px',
                position: 'relative'
              }}>
                <div className="block sm:hidden" style={{ width: 44, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 999, margin: '-16px auto 24px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#C9A96E', fontWeight: 800, letterSpacing: '0.1em' }}>PASAJERO</span>
                    <h4 style={{ fontSize: 18, color: '#fff', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.1, marginTop: 4 }}>
                      {nombre} {apellido}
                    </h4>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(201,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20 }}>✈️</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 38, fontWeight: 900, color: '#F0F4FF', lineHeight: 1, letterSpacing: '-0.03em' }}>{origen}</h2>
                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Origen</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                    <div style={{ height: 2, width: '100%', background: 'rgba(255,255,255,0.1)', position: 'absolute', top: '50%', zIndex: 0 }} />
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={animStarted ? { x: 0, opacity: 1 } : {}}
                      transition={{ type: 'spring', delay: 0.5, stiffness: 200 }}
                      style={{ background: '#0D1A2E', padding: '0 8px', zIndex: 1, color: '#C9A96E' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l5.5 4L5 15.5 2.8 15 2 16l3 3 1-.8L9.5 19l3.5-3.5L16 21l1.8-.7-.2-1.1z"/></svg>
                    </motion.div>
                  </div>

                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <h2 style={{ fontSize: 38, fontWeight: 900, color: '#F0F4FF', lineHeight: 1, letterSpacing: '-0.03em' }}>{destinoCode}</h2>
                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80, display: 'inline-block' }}>{destino}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Ticket N°</span>
                    <div style={{ fontSize: 14, color: '#34D399', fontWeight: 800 }}>{generatedTicket || '---'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Clase</span>
                    <div style={{ fontSize: 14, color: '#C9A96E', fontWeight: 800 }}>PREMIUM</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Estado</span>
                    <div style={{ fontSize: 14, color: '#60A5FA', fontWeight: 800 }}>RECIBIDO</div>
                  </div>
                </div>
              </div>

              {/* PERFORATION DIVIDER */}
              <div style={{ height: 24, position: 'relative', display: 'flex', alignItems: 'center', background: '#0A1526' }}>
                <div style={{ position: 'absolute', left: -12, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.85)' }} />
                <div style={{ width: '100%', borderBottom: '2px dashed rgba(255,255,255,0.15)', margin: '0 16px' }} />
                <div style={{ position: 'absolute', right: -12, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.85)' }} />
              </div>

              {/* BOTTOM SECTION */}
              <div style={{
                background: '#0A1526',
                borderRadius: '0 0 24px 24px',
                padding: '24px',
              }}>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={animStarted ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 }}
                  style={{ fontSize: 20, fontWeight: 900, color: '#F0F4FF', textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 8 }}
                >
                  ¡Tu aventura está cerca! 🎉
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={animStarted ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.7 }}
                  style={{ fontSize: 13, color: 'rgba(148,163,184,0.85)', textAlign: 'center', lineHeight: 1.6, fontWeight: 500, marginBottom: 24 }}
                >
                  Para asignar tu ticket a un agente y enviarte el presupuesto, hace clic para enviar este pase por WhatsApp.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={animStarted ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 }}
                >
                  <button
                    onClick={() => sendWhatsApp()}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      padding: '16px 24px',
                      background: '#25D366',
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: 800,
                      border: 'none',
                      borderRadius: 16,
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(37,211,102,0.25)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(37,211,102,0.35)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,0.25)' }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)' }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Confirmar Envío por WhatsApp
                  </button>
                </motion.div>
                
                {/* Fake Barcode */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={animStarted ? { opacity: 1 } : {}}
                  transition={{ delay: 1 }}
                  style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 3, height: 28, opacity: 0.3 }}
                >
                  {[...Array(24)].map((_, i) => (
                    <div key={i} style={{ width: Math.random() > 0.5 ? 2 : 4, background: '#fff', borderRadius: 1 }} />
                  ))}
                </motion.div>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
