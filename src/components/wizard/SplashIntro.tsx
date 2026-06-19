import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plane } from 'lucide-react'

interface SplashIntroProps {
  onFinish: () => void
}

const TAGLINES = [
  'Tu próximo destino te espera',
  'Viajá con confianza',
  'Tu presupuesto, sin compromiso',
]

export function SplashIntro({ onFinish }: SplashIntroProps) {
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [showCta, setShowCta] = useState(false)
  const [planeReady, setPlaneReady] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  /* Cycle taglines every 2s */
  useEffect(() => {
    if (taglineIdx < TAGLINES.length - 1) {
      const t = setTimeout(() => setTaglineIdx(i => i + 1), 2000)
      return () => clearTimeout(t)
    }
  }, [taglineIdx])

  /* Plane takes off after 2nd tagline */
  useEffect(() => {
    if (taglineIdx === 1) {
      const t = setTimeout(() => setPlaneReady(true), 300)
      return () => clearTimeout(t)
    }
  }, [taglineIdx])

  /* CTA button after all taglines */
  useEffect(() => {
    if (taglineIdx === TAGLINES.length - 1) {
      const t = setTimeout(() => setShowCta(true), 600)
      return () => clearTimeout(t)
    }
  }, [taglineIdx])

  /* Auto-finish at ~7.5s */
  const finish = useCallback(() => {
    if (isExiting) return
    setIsExiting(true)
    setTimeout(onFinish, 500)
  }, [isExiting, onFinish])

  useEffect(() => {
    const t = setTimeout(finish, 7500)
    return () => clearTimeout(t)
  }, [finish])

  const handleClick = () => finish()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'linear-gradient(160deg, #0A1526 0%, #0F1E35 45%, #0D2040 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ── Ambient glow orbs ─────────────── */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%', width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30,58,95,0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', right: '5%', width: 180, height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Stars ─────────────── */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
          transition={{
            duration: 2 + (i % 3) * 1.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: `${10 + (i * 7) % 80}%`,
            left: `${(i * 13) % 90}%`,
            width: 2, height: 2, borderRadius: '50%',
            background: '#C9A96E',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Logo ─────────────── */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        style={{ marginBottom: 24, position: 'relative' }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0px rgba(201,169,110,0)',
              '0 0 50px rgba(201,169,110,0.12)',
              '0 0 20px rgba(201,169,110,0.06)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            borderRadius: 20, padding: '10px 20px',
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <img
            src="/assets/logo.svg"
            alt="Jure Travel"
            style={{ width: 'clamp(180px, 40vw, 260px)', height: 'auto', display: 'block' }}
          />
        </motion.div>
      </motion.div>

      {/* ── Gold line ─────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
        style={{
          width: 100, height: 1.5,
          background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)',
          marginBottom: 28, transformOrigin: 'center',
        }}
      />

      {/* ── Taglines ─────────────── */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={taglineIdx}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(17px, 2.8vw, 23px)',
              color: 'rgba(240,244,255,0.8)',
              fontWeight: 400, textAlign: 'center',
              letterSpacing: '0.02em', fontStyle: 'italic',
              margin: 0,
            }}
          >
            {TAGLINES[taglineIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Airplane ─────────────── */}
      <AnimatePresence>
        {planeReady && (
          <motion.div
            key="plane"
            initial={{ x: '-40vw', y: '12vh', opacity: 0, rotate: 25 }}
            animate={{ x: '70vw', y: '-12vh', opacity: [0, 1, 1, 0], rotate: 5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', bottom: '28%', left: 0,
              color: '#C9A96E', pointerEvents: 'none',
            }}
          >
            <Plane size={28} fill="#C9A96E" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Vapor trail ─────────────── */}
      <AnimatePresence>
        {planeReady && (
          <motion.div
            key="trail"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.4, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.8, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: '28%', left: '5%',
              width: '90%', height: 1.5,
              background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.2) 15%, rgba(201,169,110,0.15) 40%, transparent 60%)',
              transformOrigin: 'left center',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── CTA ─────────────── */}
      <AnimatePresence>
        {showCta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: 36, textAlign: 'center' }}
          >
            <button
              onClick={e => { e.stopPropagation(); handleClick() }}
              style={{
                padding: '14px 40px', borderRadius: 12, border: 'none',
                background: '#C9A96E', color: '#0A1526',
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                fontFamily: 'var(--font-sans)',
                boxShadow: '0 4px 28px rgba(201,169,110,0.3)',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#D4B87A'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,169,110,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 28px rgba(201,169,110,0.3)' }}
            >
              Comenzar
            </button>
            <p style={{
              fontSize: 11, color: 'rgba(148,163,184,0.35)',
              marginTop: 10, fontWeight: 500,
            }}>
              o tocá en cualquier parte
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
