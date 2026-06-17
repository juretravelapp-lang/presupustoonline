import { useState } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { motion, AnimatePresence } from 'motion/react'
import { Beaker, Check, Play, RefreshCw, X } from 'lucide-react'
import type { WizardData, WizardStep } from '@/types/wizard'

interface TestCase {
  id: string
  title: string
  description: string
  emoji: string
  data: WizardData
}

const TEST_CASES: TestCase[] = [
  {
    id: 'luna-miel-caribe',
    title: 'Luna de miel en el Caribe',
    description: 'Pareja, fechas exactas en Septiembre, hoteles 5 estrellas y comentarios románticos.',
    emoji: '🏝️',
    data: {
      personal: {
        nombre: 'Sofía',
        apellido: 'Rodríguez',
        dni: '35123456',
        email: 'sofia.rodriguez@email.com',
        celular: '+5493815551234',
      },
      origin: {
        ciudad_salida: 'tucuman',
        aeropuerto_salida: 'TUC',
      },
      destination: {
        destinos_seleccionados: ['caribe'],
        destinos_custom: [],
        destino: 'caribe',
        destino_personalizado: '',
      },
      dates: {
        tipo_fecha: 'exacta',
        fecha_salida: '2026-09-10',
        fecha_regreso: '2026-09-25',
        fechas_por_destino: {},
        mes_preferido: '',
        rango_fecha_inicio: '2026-09-10',
        rango_fecha_fin: '2026-09-25',
      },
      passengers: {
        adultos: 2,
        ninos_2_12: 0,
        bebes_0_2: 0,
      },
      preferences: {
        preferencias: ['vuelos', 'hoteles_5', 'traslados', 'asistencia'],
      },
      comments: {
        comentarios: 'Viaje de luna de miel, preferimos habitación con vista al mar y cama matrimonial.',
        tipo_viaje: 'luna_de_miel',
      },
    },
  },
  {
    id: 'brasil-flexible',
    title: 'Aventura en Brasil Flexible',
    description: 'Viajero solo, mes flexible en Octubre, excursiones y asistencia médica.',
    emoji: '🌴',
    data: {
      personal: {
        nombre: 'Lucas',
        apellido: 'Gómez',
        dni: '38765432',
        email: 'lucas.gomez@email.com',
        celular: '+5491144445555',
      },
      origin: {
        ciudad_salida: 'buenos_aires',
        aeropuerto_salida: 'EZE/AEP',
      },
      destination: {
        destinos_seleccionados: ['brasil'],
        destinos_custom: [],
        destino: 'brasil',
        destino_personalizado: '',
      },
      dates: {
        tipo_fecha: 'flexible',
        fecha_salida: '',
        fecha_regreso: '',
        fechas_por_destino: {},
        mes_preferido: 'Octubre',
        rango_fecha_inicio: '',
        rango_fecha_fin: '',
      },
      passengers: {
        adultos: 1,
        ninos_2_12: 0,
        bebes_0_2: 0,
      },
      preferences: {
        preferencias: ['excursiones', 'asistencia'],
      },
      comments: {
        comentarios: 'Buscando hacer surf y tours de ecoturismo.',
        tipo_viaje: 'aventura',
      },
    },
  },
  {
    id: 'disney-familia',
    title: 'Familia en Orlando y Miami',
    description: '2 adultos, 2 niños y 1 bebé (GRATIS), alquiler de auto familiar y hoteles de 4 estrellas.',
    emoji: '🏰',
    data: {
      personal: {
        nombre: 'Diego',
        apellido: 'Pérez',
        dni: '32987654',
        email: 'diego.perez@email.com',
        celular: '+5493519876543',
      },
      origin: {
        ciudad_salida: 'cordoba',
        aeropuerto_salida: 'COR',
      },
      destination: {
        destinos_seleccionados: [],
        destinos_custom: ['Orlando y Miami'],
        destino: 'Orlando y Miami',
        destino_personalizado: 'Orlando y Miami',
      },
      dates: {
        tipo_fecha: 'exacta',
        fecha_salida: '2027-01-15',
        fecha_regreso: '2027-02-05',
        fechas_por_destino: {},
        mes_preferido: '',
        rango_fecha_inicio: '2027-01-15',
        rango_fecha_fin: '2027-02-05',
      },
      passengers: {
        adultos: 2,
        ninos_2_12: 2,
        bebes_0_2: 1,
      },
      preferences: {
        preferencias: ['vuelos', 'hoteles_4', 'auto', 'excursiones', 'asistencia'],
      },
      comments: {
        comentarios: 'Necesitamos sillas para niños y bebé en el auto rentado. Vamos a visitar los parques.',
        tipo_viaje: 'familia',
      },
    },
  },
  {
    id: 'eurotrip-multi',
    title: 'Eurotrip Múltiples Destinos',
    description: '3 pasajeros con fechas por destino (Europa, Londres, París), vuelos y hoteles 4★.',
    emoji: '🇪🇺',
    data: {
      personal: {
        nombre: 'Martina',
        apellido: 'Silva',
        dni: '34111222',
        email: 'martina.silva@email.com',
        celular: '+5492616667777',
      },
      origin: {
        ciudad_salida: 'mendoza',
        aeropuerto_salida: 'MDZ',
      },
      destination: {
        destinos_seleccionados: ['europa'],
        destinos_custom: ['Londres', 'París'],
        destino: 'europa',
        destino_personalizado: 'Londres, París',
      },
      dates: {
        tipo_fecha: 'exacta',
        fecha_salida: '2026-10-01',
        fecha_regreso: '2026-10-20',
        fechas_por_destino: {
          europa: { fecha_salida: '2026-10-01', fecha_regreso: '2026-10-10' },
          Londres: { fecha_salida: '2026-10-10', fecha_regreso: '2026-10-15' },
          París: { fecha_salida: '2026-10-15', fecha_regreso: '2026-10-20' },
        },
        mes_preferido: '',
        rango_fecha_inicio: '2026-10-01',
        rango_fecha_fin: '2026-10-20',
      },
      passengers: {
        adultos: 3,
        ninos_2_12: 1,
        bebes_0_2: 0,
      },
      preferences: {
        preferencias: ['vuelos', 'hoteles_4', 'traslados', 'asistencia'],
      },
      comments: {
        comentarios: 'Deseamos viajar en tren entre ciudades europeas. Recorrido detallado.',
        tipo_viaje: 'vacaciones',
      },
    },
  },
]

export function QAUseCasePanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [loadedCase, setLoadedCase] = useState<string | null>(null)
  const { reset, updateData, goToStep, markStepCompleted } = useWizardStore()

  const loadCaseData = (testCase: TestCase, jumpToSummary: boolean) => {
    // Reset store
    reset()

    // Populate store step-by-step
    const keys = Object.keys(testCase.data) as Array<keyof WizardData>
    keys.forEach((key) => {
      updateData(key, testCase.data[key])
    })

    // Mark steps completed depending on destination
    const stepsToComplete: WizardStep[] = [
      'destination',
      'dates',
      'passengers',
      'preferences',
      'contact',
    ]

    stepsToComplete.forEach((step) => {
      markStepCompleted(step)
    })

    if (jumpToSummary) {
      goToStep('summary')
    } else {
      goToStep('destination')
    }

    setLoadedCase(testCase.id)
    setTimeout(() => setLoadedCase(null), 2000)
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 100,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0A1526',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        title="Panel de Casos de Uso"
      >
        {isOpen ? <X size={24} /> : <Beaker size={24} />}
      </button>

      {/* Floating Drawer / Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            style={{
              position: 'fixed',
              bottom: 84,
              right: 20,
              zIndex: 99,
              width: '360px',
              maxWidth: 'calc(100vw - 40px)',
              maxHeight: '75vh',
              overflowY: 'auto',
              background: 'rgba(15, 30, 53, 0.92)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.08)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Beaker size={18} style={{ color: '#F59E0B' }} />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.01em' }}>🧪 Casos de Uso</h3>
              </div>
              <button
                onClick={() => {
                  reset()
                  goToStep('destination')
                }}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '4px 8px',
                  fontSize: 10,
                  color: 'rgba(148,163,184,0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                <RefreshCw size={10} /> Reiniciar
              </button>
            </div>

            <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.75)', lineHeight: 1.4, margin: 0 }}>
              Hacé clic en cualquier perfil para cargar datos automáticos. Podés testear el wizard desde el inicio o saltar al resumen para validar el submit.
            </p>

            {/* Test Cases List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TEST_CASES.map((tc) => {
                const isLoaded = loadedCase === tc.id
                return (
                  <div
                    key={tc.id}
                    style={{
                      padding: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{tc.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF', flex: 1 }}>{tc.title}</span>
                      {isLoaded && (
                        <span style={{ fontSize: 10, color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={11} /> Cargado
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 10.5, color: 'rgba(148,163,184,0.7)', lineHeight: 1.35, margin: 0 }}>{tc.description}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
                      <button
                        onClick={() => loadCaseData(tc, false)}
                        style={{
                          padding: '6px 4px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: 8,
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#94A3B8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
                          e.currentTarget.style.color = '#F0F4FF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.color = '#94A3B8'
                        }}
                      >
                        <Play size={10} /> Cargar en Paso 1
                      </button>
                      <button
                        onClick={() => loadCaseData(tc, true)}
                        style={{
                          padding: '6px 4px',
                          background: 'rgba(245,158,11,0.1)',
                          border: '1px solid rgba(245,158,11,0.25)',
                          borderRadius: 8,
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#FBBF24',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(245,158,11,0.18)'
                          e.currentTarget.style.boxShadow = '0 0 10px rgba(245,158,11,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(245,158,11,0.1)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        🚀 Ir al Resumen
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
