import { motion, AnimatePresence } from 'motion/react'
import type { ReactNode } from 'react'

interface StepWrapperProps {
  stepKey: string
  direction: number
  children: ReactNode
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 24 : -24,
    opacity: 0,
    filter: 'blur(3px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -24 : 24,
    opacity: 0,
    filter: 'blur(3px)',
  }),
}

export function StepWrapper({ stepKey, direction, children }: StepWrapperProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 32,
          mass: 0.8,
          opacity: { duration: 0.15 },
          filter: { duration: 0.12 },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
