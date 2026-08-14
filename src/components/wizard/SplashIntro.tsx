import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import logoImg from '@/assets/img/logo/logo.jpg'

interface SplashIntroProps {
  onFinish: () => void
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const HERO_IMAGE = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2400&auto=format&fit=crop' // Playa alta calidad

const SAFE_TOP = 'max(env(safe-area-inset-top), 60px)'
const SAFE_BOTTOM = 'max(env(safe-area-inset-bottom), 40px)'

export function SplashIntro({ onFinish }: SplashIntroProps) {
  const [isExiting, setIsExiting] = useState(false)
  const reduceMotion = useReducedMotion()

  const handleClick = () => {
    if (isExiting) return
    setIsExiting(true)
    setTimeout(onFinish, reduceMotion ? 200 : 500)
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: EASE }}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleClick()
          }}
          role="button"
          tabIndex={0}
          aria-label="Jure Travel. Tocá para comenzar tu aventura"
          className="fixed inset-0 z-[99999] overflow-hidden font-sans"
          style={{ background: '#041224', cursor: 'pointer', outline: 'none' }}
        >
          {/* Static Background Image with absolute fullscreen styling for mobile compatibility */}
          <motion.img
            src={HERO_IMAGE}
            alt="Fondo de Playa"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'saturate(1.2) brightness(0.85)',
            }}
            loading="eager"
            fetchPriority="high"
          />

          {/* Subtle light overlay to keep photos vibrant */}
          <div className="absolute inset-0 bg-black/10" />

          <div
            className="relative z-10 flex h-full flex-col px-6 md:px-12"
            style={{ paddingTop: SAFE_TOP, paddingBottom: SAFE_BOTTOM }}
          >
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              
              {/* Glassmorphism Container for Content */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
                className="w-full max-w-[400px] rounded-[32px] p-8"
                style={{
                  background: 'rgba(4, 18, 36, 0.4)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 24px 40px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
              
              {/* Logo Animation with Floating Sparkles */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative mb-8"
              >
                {/* Floating Sparkle 1 */}
                <motion.svg
                  animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-6 text-[#FF6B00]"
                  width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M12 3v18M3 12h18M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                </motion.svg>
                
                {/* Floating Sparkle 2 */}
                <motion.svg
                  animate={{ y: [0, 6, 0], opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.2, 0.9] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-2 -left-5 text-[#FF9900]"
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M12 3v18M3 12h18M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                </motion.svg>

                <div style={{
                  background: 'rgba(255,255,255,0.95)',
                  padding: '16px',
                  borderRadius: '24px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3), 0 0 40px rgba(255,107,0,0.2)'
                }}>
                  <img 
                    src={logoImg} 
                    alt="Jure Travel Logo" 
                    style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: '12px' }}
                  />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
                className="font-display text-[48px] font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-[64px]"
                style={{ textShadow: '0 8px 32px rgba(0,0,0,0.7)' }}
              >
                Jure <span style={{ color: '#FF6B00' }}>Travel</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
                className="mt-6 font-sans text-lg font-medium tracking-wide text-white/90 sm:text-xl"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}
              >
                Tu aventura comienza aquí
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8, ease: EASE }}
                className="mt-16 w-full max-w-sm"
              >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
                className="group relative flex min-h-[64px] w-full items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-5 text-[17px] font-extrabold tracking-tight text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(255,107,0,0.5)] active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #FF8533 0%, #FF6B00 50%, #E65A00 100%)',
                  boxShadow: '0 12px 30px rgba(255,107,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                <span className="relative z-10 text-shadow-sm">Comenzar Aventura</span>
                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
                  <ChevronRight size={18} strokeWidth={3} className="text-white" />
                </span>
                {!reduceMotion && (
                  <motion.span
                    initial={{ x: '-150%' }}
                    animate={{ x: '250%' }}
                    transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
                  />
                )}
              </button>
            </motion.div>
            </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
