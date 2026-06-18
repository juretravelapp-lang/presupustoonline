import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WizardStep, WizardData } from '@/types/wizard'
import { WIZARD_STEPS } from '@/types/wizard'

interface WizardState {
  currentStep:      WizardStep
  currentStepIndex: number
  direction:        number
  completedSteps:   WizardStep[]
  data:             WizardData
  isSubmitting:     boolean
  isSubmitted:      boolean
  hasRestoredDraft: boolean

  nextStep:          () => void
  prevStep:          () => void
  goToStep:          (step: WizardStep) => void
  markStepCompleted: (step: WizardStep) => void
  updateData:        <K extends keyof WizardData>(step: K, data: Partial<WizardData[K]>) => void
  setSubmitting:     (value: boolean) => void
  setSubmitted:      (value: boolean) => void
  setHasRestoredDraft: (value: boolean) => void
  reset:             () => void
}

const initialData: WizardData = {
  personal: { nombre: '', apellido: '', dni: '', email: '', celular: '' },
  origin:   { ciudad_salida: '', aeropuerto_salida: '' },
  destination: {
    destinos_seleccionados: [],
    destinos_custom:        [],
    destino:                '',
    destino_personalizado:  '',
  },
  dates: {
    tipo_fecha:          'exacta',
    fecha_salida:        '',
    fecha_regreso:       '',
    fechas_por_destino:  {},
    mes_preferido:       '',
    rango_fecha_inicio:  '',
    rango_fecha_fin:     '',
  },
  passengers:  { adultos: 2, ninos_2_12: 0, bebes_0_2: 0 },
  preferences: { preferencias: [] },
  comments:    { comentarios: '', tipo_viaje: '' },
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep:      'destination',
      currentStepIndex: 0,
      direction:        1,
      completedSteps:   [],
      data:             initialData,
      isSubmitting:     false,
      isSubmitted:      false,
      hasRestoredDraft: false,

      nextStep: () => {
        const { currentStepIndex } = get()
        if (currentStepIndex < WIZARD_STEPS.length - 1) {
          const next = currentStepIndex + 1
          set({ currentStep: WIZARD_STEPS[next], currentStepIndex: next, direction: 1 })
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get()
        if (currentStepIndex > 0) {
          const prev = currentStepIndex - 1
          set({ currentStep: WIZARD_STEPS[prev], currentStepIndex: prev, direction: -1 })
        }
      },

      goToStep: (step) => {
        const targetIndex = WIZARD_STEPS.indexOf(step)
        const { currentStepIndex } = get()
        set({ currentStep: step, currentStepIndex: targetIndex, direction: targetIndex > currentStepIndex ? 1 : -1 })
      },

      markStepCompleted: (step) => {
        const { completedSteps } = get()
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step] })
        }
      },

      updateData: (step, data) => {
        const { data: current } = get()
        set({ data: { ...current, [step]: { ...current[step], ...data } } })
      },

      setSubmitting: (value) => set({ isSubmitting: value }),
      setSubmitted:  (value) => set({ isSubmitted: value }),
      setHasRestoredDraft: (value) => set({ hasRestoredDraft: value }),

      reset: () => set({
        currentStep:      'destination',
        currentStepIndex: 0,
        direction:        1,
        completedSteps:   [],
        data:             initialData,
        isSubmitting:     false,
        isSubmitted:      false,
        hasRestoredDraft: false,
      }),
    }),
    {
      name: 'jure-travel-wizard-v2',
      partialize: (state) => ({
        data:             state.data,
        currentStep:      state.currentStep,
        currentStepIndex: state.currentStepIndex,
        completedSteps:   state.completedSteps,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.completedSteps.length > 0) {
          state.setHasRestoredDraft(true)
          setTimeout(() => state.setHasRestoredDraft(false), 5000)
        }
      }
    }
  )
)
