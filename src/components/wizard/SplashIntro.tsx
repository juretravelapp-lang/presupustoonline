import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronRight } from 'lucide-react'

interface SplashIntroProps {
  onFinish: () => void
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2400&auto=format&fit=crop'

const SAFE_TOP = 'max(env(safe-area-inset-top), 40px)'
const SAFE_BOTTOM = 'max(env(safe-area-inset-bottom), 32px)'

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
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(14px)' }}
          transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: EASE }}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleClick()
          }}
          role="button"
          tabIndex={0}
          aria-label="Jure Travel. Tocá para comenzar tu aventura"
          className="fixed inset-0 z-[99999] overflow-hidden font-sans"
          style={{ background: '#0A1526', cursor: 'pointer', outline: 'none' }}
        >
          <motion.div
            initial={{ scale: reduceMotion ? 1 : 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 4, ease: EASE }}
            className="absolute inset-0"
          >
            <img
              src={HERO_IMAGE}
              alt=""
              className="h-full w-full object-cover"
              style={{
                filter: 'blur(3px) saturate(1.05)',
                transform: 'scale(1.04)',
                objectPosition: 'center',
              }}
              loading="eager"
              fetchPriority="high"
            />
          </motion.div>

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,21,38,0.45)_0%,rgba(10,21,38,0.15)_40%,rgba(10,21,38,0.6)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_75%_at_50%_50%,transparent_45%,rgba(10,21,38,0.35)_100%)]" />

          <div
            className="relative z-10 flex h-full flex-col px-6"
            style={{ paddingTop: SAFE_TOP, paddingBottom: SAFE_BOTTOM }}
          >
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
                className="mb-7"
              >
                <motion.svg
                  animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ filter: 'drop-shadow(0 4px 18px rgba(201,169,110,0.5))' }}
                >
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="#D4B87A" />
                </motion.svg>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                className="font-serif text-[54px] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-[76px]"
                style={{ textShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              >
                Jure <span style={{ color: '#D4B87A' }}>Travel</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                className="mt-5 font-serif text-base font-medium italic tracking-wide text-white/75 sm:text-lg"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
              >
                Tu próximo destino te espera
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
                className="mt-16 w-full max-w-md"
              >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
                className="group relative flex min-h-[60px] w-full items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-5 text-[16px] font-extrabold tracking-tight text-[#0A1526] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(201,169,110,0.55)] active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #F0D98C 0%, #D4B87A 40%, #C9A96E 70%, #B08D57 100%)',
                  boxShadow: '0 16px 40px rgba(201,169,110,0.45), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <span className="relative z-10">Comenzar Aventura</span>
                <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#0A1526]/10 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ChevronRight size={16} strokeWidth={3} />
                </span>
                {!reduceMotion && (
                  <motion.span
                    initial={{ x: '-150%' }}
                    animate={{ x: '250%' }}
                    transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
                  />
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  )
}
