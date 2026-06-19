import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWizardStore } from '@/stores/wizardStore'
import { CIUDADES_SALIDA } from '@/lib/constants'
import { Shield } from 'lucide-react'
import type { StepHandle } from '../WizardShell'
import { motion } from 'motion/react'

const schema = z.object({
  nombre:       z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  apellido:     z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  dni:          z.string().min(6, 'Mínimo 6 dígitos').max(15, 'Máximo 15 dígitos').regex(/^[\d\.\s\-]+$/, 'Solo números, puntos y guiones'),
  email:        z.string().email('Email inválido'),
  celular:      z.string().min(8, 'Mínimo 8 dígitos').max(30, 'Máximo 30 caracteres').regex(/^[\d\s\-\+]+$/, 'Solo números, guiones, espacios y +'),
  ciudad_salida: z.string().optional().default(''),
})

type FormData = z.infer<typeof schema>

const ICONS: Record<string, string> = {
  nombre: '👤',
  apellido: '👤',
  dni: '🪪',
  email: '📧',
  celular: '📱',
}

export const Step5Contact = forwardRef<StepHandle>(function Step5Contact(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()

  const { register, trigger, getValues, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre:        data.personal.nombre,
      apellido:      data.personal.apellido,
      dni:           data.personal.dni,
      email:         data.personal.email,
      celular:       data.personal.celular,
      ciudad_salida: data.origin.ciudad_salida,
    },
    mode: 'onChange',
  })

  const selectedCity = watch('ciudad_salida')

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger()
      if (isValid) {
        const values = getValues()
        const ciudad = CIUDADES_SALIDA.find(c => c.value === values.ciudad_salida)
        updateData('personal', { nombre: values.nombre, apellido: values.apellido, dni: values.dni, email: values.email, celular: values.celular })
        updateData('origin', { ciudad_salida: values.ciudad_salida, aeropuerto_salida: ciudad?.aeropuerto || '' })
        markStepCompleted('contact')
      }
      return isValid
    },
  }))

  const rowFields: { name: keyof FormData; label: string; placeholder: string; type: string; inputMode?: React.HTMLInputTypeAttribute }[] = [
    { name: 'nombre',   label: 'Nombre',   placeholder: 'Tu nombre',            type: 'text' },
    { name: 'apellido', label: 'Apellido', placeholder: 'Tu apellido',           type: 'text' },
  ]
  const colFields: { name: keyof FormData; label: string; placeholder: string; type: string; inputMode?: React.HTMLInputTypeAttribute }[] = [
    { name: 'dni',    label: 'DNI',    placeholder: 'Nº de documento',     type: 'tel',   inputMode: 'numeric' },
    { name: 'email',  label: 'Email',  placeholder: 'tu@email.com',        type: 'email', inputMode: 'email' },
    { name: 'celular',label: 'Celular',placeholder: '+54 9 381 123-4567',  type: 'tel',   inputMode: 'tel' },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2
          style={{
            fontSize: 'clamp(32px, 7vw, 52px)',
            fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.03em',
            color: '#F0F4FF',
            lineHeight: 1.1,
          }}
        >
          Datos de contacto
        </h2>
        <div className="gold-divider" style={{ margin: '20px 0 16px' }} />
        <p style={{ fontSize: 16, color: 'rgba(148,163,184,0.9)', fontWeight: 500, lineHeight: 1.6, maxWidth: 480 }}>
          ¿Cómo te contactamos para enviarte el presupuesto?
        </p>
      </motion.div>

      <form onSubmit={e => e.preventDefault()} className="space-y-6">
        {/* Nombre + Apellido row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {rowFields.map((field, i) => (
            <motion.div key={field.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <label className="input-label" htmlFor={field.name}>
                {ICONS[field.name]} {field.label}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={`input-dark ${errors[field.name] ? 'has-error' : ''}`}
                  {...register(field.name)}
                />
              </div>
              {errors[field.name] && (
                <p className="error-text">{errors[field.name]?.message}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Other fields */}
        {colFields.map((field, i) => (
          <motion.div key={field.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 2) * 0.05 }}>
            <label className="input-label" htmlFor={field.name}>
              {ICONS[field.name]} {field.label}
            </label>
            <input
              id={field.name}
              type={field.type}
              inputMode={field.inputMode as React.InputHTMLAttributes<HTMLInputElement>['inputMode']}
              placeholder={field.placeholder}
              className={`input-dark ${errors[field.name] ? 'has-error' : ''}`}
              {...register(field.name)}
            />
            {errors[field.name] && (
              <p className="error-text">{errors[field.name]?.message}</p>
            )}
          </motion.div>
        ))}

        {/* Ciudad de salida */}
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <label className="input-label">📍 Ciudad de salida (opcional)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {CIUDADES_SALIDA.filter(c => c.value !== 'otra').map(ciudad => (
              <button
                key={ciudad.value}
                type="button"
                onClick={() => setValue('ciudad_salida', ciudad.value, { shouldValidate: true })}
                aria-pressed={selectedCity === ciudad.value}
                style={{
                  padding: '14px',
                  borderRadius: 14,
                  border: selectedCity === ciudad.value ? '1.5px solid rgba(201,169,110,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
                  background: selectedCity === ciudad.value ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.03)',
                  color: selectedCity === ciudad.value ? '#C9A96E' : 'rgba(148,163,184,0.8)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                {ciudad.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setValue('ciudad_salida', '', { shouldValidate: true })}
            aria-pressed={!selectedCity}
            style={{
              width: '100%',
              marginTop: 10,
              padding: '14px',
              borderRadius: 14,
              border: !selectedCity ? '1.5px solid rgba(201,169,110,0.4)' : '1.5px solid rgba(255,255,255,0.07)',
              background: !selectedCity ? 'rgba(201,169,110,0.07)' : 'rgba(255,255,255,0.03)',
              color: 'rgba(148,163,184,0.7)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            No estoy seguro / Otra ciudad
          </button>
          <input type="hidden" {...register('ciudad_salida')} />
        </motion.div>
      </form>

      {/* Privacy note */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'rgba(201,169,110,0.05)', borderRadius: 14, border: '1px solid rgba(201,169,110,0.12)' }}
      >
        <Shield size={16} style={{ color: 'rgba(201,169,110,0.8)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.75)', lineHeight: 1.5, fontWeight: 500 }}>
          Tu información está protegida y no será compartida con terceros. Usamos tus datos solo para enviarte el presupuesto.
        </p>
      </motion.div>
    </div>
  )
})