import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWizardStore } from '@/stores/wizardStore'
import { Shield } from 'lucide-react'
import type { StepHandle } from '../WizardShell'
import { motion } from 'motion/react'

const schema = z.object({
  nombre:       z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  apellido:     z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  dni:          z.string().min(6, 'Mínimo 6 dígitos').max(15, 'Máximo 15 dígitos').regex(/^[\d\.\s\-]+$/, 'Solo números, puntos y guiones'),
  email:        z.string().email('Email inválido').optional().or(z.literal('')),
  celular:      z.string().min(8, 'Mínimo 8 dígitos').max(30, 'Máximo 30 caracteres').regex(/^[\d\s\-\+]+$/, 'Solo números, guiones, espacios y +'),
})

type FormData = z.infer<typeof schema>

type FieldDef = {
  name: keyof FormData
  label: string
  placeholder: string
  type: string
  inputMode?: React.HTMLInputTypeAttribute
  optional?: boolean
}

const dataFields: FieldDef[] = [
  { name: 'nombre',   label: 'Nombre',   placeholder: 'Tu nombre',            type: 'text' },
  { name: 'apellido', label: 'Apellido', placeholder: 'Tu apellido',          type: 'text' },
  { name: 'dni',      label: 'DNI',      placeholder: 'Nº de documento',      type: 'tel', inputMode: 'numeric' },
]

const contactFields: FieldDef[] = [
  { name: 'email',   label: 'Email',   placeholder: 'tu@email.com',         type: 'email', inputMode: 'email', optional: true },
  { name: 'celular', label: 'Celular', placeholder: '+54 9 381 123-4567',   type: 'tel',   inputMode: 'tel' },
]

function SectionTitle({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#D4B87A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(201,169,110,0.2)' }} />
    </div>
  )
}

export const Step5Contact = forwardRef<StepHandle>(function Step5Contact(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()

  const { register, trigger, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre:        data.personal.nombre,
      apellido:      data.personal.apellido,
      dni:           data.personal.dni,
      email:         data.personal.email,
      celular:       data.personal.celular,
    },
    mode: 'onChange',
  })

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await trigger()
      if (isValid) {
        const values = getValues()
        updateData('personal', { nombre: values.nombre, apellido: values.apellido, dni: values.dni, email: values.email, celular: values.celular })
        markStepCompleted('contact')
      }
      return isValid
    },
  }))

  const renderField = (field: FieldDef, delay: number) => {
    const err = errors[field.name]
    return (
      <motion.div
        key={field.name}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <label className="input-label" htmlFor={field.name}>
          {field.label}
          {field.optional && (
            <span style={{ color: 'rgba(148,163,184,0.5)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
              {' '}(opcional)
            </span>
          )}
        </label>
        <input
          id={field.name}
          type={field.type}
          inputMode={field.inputMode as React.InputHTMLAttributes<HTMLInputElement>['inputMode']}
          placeholder={field.placeholder}
          className={`input-dark ${err ? 'has-error' : ''}`}
          {...register(field.name)}
        />
        {err && (
          <p className="error-text">{err.message}</p>
        )}
      </motion.div>
    )
  }

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
          Pasanos tus datos para contactarte
        </h2>
        <div className="gold-divider" style={{ margin: '20px 0 16px' }} />
      </motion.div>

      <form onSubmit={e => e.preventDefault()} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: 'rgba(201,169,110,0.05)', borderRadius: 14, border: '1px solid rgba(201,169,110,0.12)' }}
        >
          <Shield size={16} style={{ color: 'rgba(201,169,110,0.8)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.75)', lineHeight: 1.5, fontWeight: 500 }}>
            Tu información está protegida y no será compartida con terceros. Usamos tus datos solo para contactarte.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <section>
            <SectionTitle icon="👤" text="Datos personales" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {renderField(dataFields[0], 0.1)}
              {renderField(dataFields[1], 0.15)}
            </div>
            <div style={{ marginTop: 16 }}>
              {renderField(dataFields[2], 0.2)}
            </div>
          </section>

          <section>
            <SectionTitle icon="📞" text="Medio de contacto" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {renderField(contactFields[0], 0.25)}
              {renderField(contactFields[1], 0.3)}
            </div>
          </section>
        </div>
      </form>
    </div>
  )
})
