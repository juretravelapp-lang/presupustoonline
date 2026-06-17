import { useState, useEffect, useCallback } from 'react'
import { PROMOS_SLIDES } from '@/lib/constants'
// banner will be dynamically imported to avoid bundling it into the main chunk
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useIsMobile } from '@/hooks/useMediaQuery'

const GRADIENT_MAP: Record<string, string> = {
  brasil: 'from-secondary via-secondary/90 to-primary/40',
  caribe: 'from-secondary via-secondary/80 to-accent/30',
  europa: 'from-secondary via-secondary-dark to-primary/20',
  disney: 'from-secondary via-secondary/90 to-accent/40',
  cruceros: 'from-secondary via-secondary-dark to-primary/30',
}

export function PromoCarousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [motionModule, setMotionModule] = useState<any | null>(null)
  const isMobile = useIsMobile()

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(prev => (prev + 1) % PROMOS_SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(prev => (prev - 1 + PROMOS_SLIDES.length) % PROMOS_SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  // Lazy-load motion/react after initial render to reduce main bundle
  useEffect(() => {
    let mounted = true
    // defer to idle to prioritize LCP
    const id = (window as any).requestIdleCallback
      ? (window as any).requestIdleCallback(() => {
          import('motion/react').then(mod => { if (mounted) setMotionModule(mod) })
        })
      : setTimeout(() => {
          import('motion/react').then(mod => { if (mounted) setMotionModule(mod) })
        }, 600)
    return () => { mounted = false; if (typeof id === 'number') clearTimeout(id as number) }
  }, [])

  // Lazy-load banner image after mount to reduce initial bundle pressure
  useEffect(() => {
    // banner is loaded eagerly for LCP; no client-side lazy init needed
  }, [])

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '50%' : '-50%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-50%' : '50%',
      opacity: 0,
    }),
  }

  const currentSlide = PROMOS_SLIDES[current]
  const gradient = GRADIENT_MAP[currentSlide.destino] || 'from-secondary via-secondary to-primary'

  const MotionWrapper: any = motionModule?.motion ?? null

  const inner = (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      {/* Banner image for depth and brand consistency (eager for LCP) */}
      <img
        src="/assets/images/promos/banner1-1200.webp"
        srcSet="/assets/images/promos/banner1-800.webp 800w, /assets/images/promos/banner1-1200.webp 1200w, /assets/images/promos/banner1.webp 1920w"
        sizes="100vw"
        alt="Promotional banner"
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-normal"
        loading="eager"
        width={1920}
        height={720}
        fetchPriority="high"
      />

      {/* Decorative pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(232,99,74,0.05)_0%,transparent_60%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(201,168,76,0.03)_0%,transparent_70%)]" />
        {MotionWrapper ? (
          <>
            <MotionWrapper.div
              animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-20 right-20 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl"
            />
            <MotionWrapper.div
              animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-20 left-20 w-72 h-72 bg-white/[0.02] rounded-full blur-3xl"
            />
          </>
        ) : (
          <>
            <div className="absolute top-20 right-20 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-white/[0.02] rounded-full blur-3xl" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className={`${isMobile ? 'px-5' : 'max-w-6xl mx-auto px-12'} w-full`}>
          <div className="max-w-xl">
            <div className="relative z-10 p-4 md:p-6 rounded-md bg-gradient-to-t from-black/60 via-transparent">
            {MotionWrapper ? (
              <MotionWrapper.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/15 backdrop-blur-md rounded-full mb-5 border border-primary/20"
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.1em]">Oferta especial</span>
              </MotionWrapper.div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/15 backdrop-blur-md rounded-full mb-5 border border-primary/20">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.1em]">Oferta especial</span>
              </div>
            )}

            {MotionWrapper ? (
              <MotionWrapper.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`font-serif font-bold text-white mb-3 tracking-[-0.02em] leading-[1.08] drop-shadow-lg ${isMobile ? 'text-[28px]' : 'text-[48px] lg:text-[56px]'}`}
              >
                {currentSlide.titulo}
              </MotionWrapper.h2>
            ) : (
              <h2 className={`font-serif font-bold text-white mb-3 tracking-[-0.02em] leading-[1.08] drop-shadow-lg ${isMobile ? 'text-[28px]' : 'text-[48px] lg:text-[56px]'}`}>{currentSlide.titulo}</h2>
            )}

            {MotionWrapper ? (
              <MotionWrapper.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-white/70 mb-4 leading-relaxed font-medium ${isMobile ? 'text-[13px]' : 'text-[16px]'}`}
              >
                {currentSlide.subtitulo}
              </MotionWrapper.p>
            ) : (
              <p className={`text-white/70 mb-4 leading-relaxed font-medium ${isMobile ? 'text-[13px]' : 'text-[16px]'}`}>{currentSlide.subtitulo}</p>
            )}

            {MotionWrapper ? (
              <MotionWrapper.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`font-serif font-bold text-primary mb-6 tracking-[-0.01em] ${isMobile ? 'text-xl' : 'text-3xl'}`}
              >
                {currentSlide.precio}
              </MotionWrapper.p>
            ) : (
              <p className={`font-serif font-bold text-primary mb-6 tracking-[-0.01em] ${isMobile ? 'text-xl' : 'text-3xl'}`}>{currentSlide.precio}</p>
            )}

            {MotionWrapper ? (
              <MotionWrapper.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full md:w-auto px-6 py-3 bg-white text-secondary font-bold text-[14px] rounded-[12px] shadow-lg
                  transition-all duration-[200ms] hover:shadow-xl hover:bg-primary-50"
                onClick={() => { document.getElementById('wizard')?.scrollIntoView({ behavior: 'smooth' }) }}
              >
                Solicitar Presupuesto
              </MotionWrapper.button>
            ) : (
              <button
                className="w-full md:w-auto px-6 py-3 bg-white text-secondary font-bold text-[14px] rounded-[12px] shadow-lg
                  transition-all duration-[200ms] hover:shadow-xl hover:bg-primary-50"
                onClick={() => { document.getElementById('wizard')?.scrollIntoView({ behavior: 'smooth' }) }}
              >
                Solicitar Presupuesto
              </button>
            )}
            </div>
          </div>
        </div>
      </div>

    </>
  )

  return (
    <div className={`relative w-full overflow-hidden ${isMobile ? 'h-[320px]' : 'h-[460px] lg:h-[520px]'}`}>
      {MotionWrapper ? (
        <motionModule.AnimatePresence initial={false} custom={direction} mode="wait">
          <MotionWrapper.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 180, damping: 26, mass: 1.1 }}
            className="absolute inset-0"
          >
            {inner}
          </MotionWrapper.div>
        </motionModule.AnimatePresence>
      ) : (
        <div className="absolute inset-0">{inner}</div>
      )}

      {/* Arrows */}
      {!isMobile && (
        <>
          <button
            onClick={prev}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/8 hover:bg-white/15
              backdrop-blur-md rounded-full flex items-center justify-center text-white
              transition-all duration-[200ms] border border-white/[0.06]"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/8 hover:bg-white/15
              backdrop-blur-md rounded-full flex items-center justify-center text-white
              transition-all duration-[200ms] border border-white/[0.06]"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Pill Indicators - Modern Style */}
      <div className={`absolute ${isMobile ? 'bottom-5' : 'bottom-7'} left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full`}>
        {PROMOS_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > current ? 1 : -1)
              setCurrent(index)
            }}
            className={`transition-all duration-[300ms] rounded-full ${
              index === current
                ? 'bg-white w-2.5 h-2.5 shadow-[0_2px_8px_rgba(255,255,255,0.3)]'
                : 'bg-white/40 hover:bg-white/60 w-2 h-2'
            }`}
            aria-label={`Slide ${index + 1}`}
            aria-current={index === current ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  )
}
