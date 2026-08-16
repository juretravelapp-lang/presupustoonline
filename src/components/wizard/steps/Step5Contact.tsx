import { forwardRef, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWizardStore } from '@/stores/wizardStore'
import { ShieldCheck, User, CreditCard, Mail, Phone } from 'lucide-react'
import type { StepHandle } from '../WizardShell'
import { motion } from 'motion/react'

const schema = z.object({
  nombre:       z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  apellido:     z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  dni:          z.string().min(6, 'Mínimo 6 dígitos').max(15, 'Máximo 15 dígitos').regex(/^[\d\.\s\-]+$/, 'Solo números, puntos y guiones'),
  email:        z.string().email('Email inválido').optional().or(z.literal('')),
  celular:      z.string().min(8, 'Mínimo 8 dígitos').max(30, 'Máximo 30 caracteres').regex(/^\+?[\d\s\-\()\.]+$/, 'Solo números, guiones, espacios y +'),
})

type FormData = z.infer<typeof schema>

type FieldDef = {
  name: keyof FormData
  label: string
  placeholder: string
  type: string
  inputMode?: React.HTMLInputTypeAttribute
  optional?: boolean
  icon: React.ElementType
}

const dataFields: FieldDef[] = [
  { name: 'nombre',   label: 'Nombre',   placeholder: 'Ej. Juan',         type: 'text', icon: User },
  { name: 'apellido', label: 'Apellido', placeholder: 'Ej. Pérez',        type: 'text', icon: User },
  { name: 'dni',      label: 'DNI / Pasaporte', placeholder: 'Nº de documento', type: 'tel', inputMode: 'numeric', icon: CreditCard },
]

const contactFields: FieldDef[] = [
  { name: 'email',   label: 'Email',   placeholder: 'tu@email.com',         type: 'email', inputMode: 'email', optional: true, icon: Mail },
  { name: 'celular', label: 'Celular / WhatsApp', placeholder: '+54 9 381 123-4567',   type: 'tel',   inputMode: 'tel', icon: Phone },
]

function SectionTitle({ icon: Icon, text, desc }: { icon: React.ElementType; text: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ 
          width: 36, height: 36, borderRadius: 10, 
          background: 'rgba(255,107,0,0.15)', color: '#FF6B00',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#F0F4FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {text}
        </h3>
      </div>
      {desc && <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 8, marginLeft: 48, lineHeight: 1.5 }}>{desc}</p>}
    </div>
  )
}

export const Step5Contact = forwardRef<StepHandle>(function Step5Contact(_, ref) {
  const { data, updateData, markStepCompleted } = useWizardStore()
  const [focusedField, setFocusedField] = useState<string | null>(null)

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
    const isFocused = focusedField === field.name
    const Icon = field.icon

    return (
      <motion.div
        key={field.name}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <label className="input-label" htmlFor={field.name} style={{ marginBottom: 8, color: isFocused ? '#FF6B00' : '#94A3B8', transition: 'color 0.2s' }}>
          {field.label}
          {field.optional && (
            <span style={{ color: 'rgba(148,163,184,0.5)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
              {' '}(opcional)
            </span>
          )}
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{ 
            position: 'absolute', left: 16, top: 0, bottom: 0, 
            display: 'flex', alignItems: 'center', pointerEvents: 'none', 
            color: err ? '#ef4444' : isFocused ? '#FF6B00' : '#64748B',
            transition: 'color 0.2s'
          }}>
            <Icon size={20} />
          </div>
          <input
            id={field.name}
            type={field.type}
            inputMode={field.inputMode as React.InputHTMLAttributes<HTMLInputElement>['inputMode']}
            placeholder={field.placeholder}
            className={`input-dark ${err ? 'has-error' : ''}`}
            style={{ paddingLeft: 48, background: isFocused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' }}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? `${field.name}-error` : undefined}
            autoComplete={
              field.name === 'nombre' ? 'given-name'
              : field.name === 'apellido' ? 'family-name'
              : field.name === 'dni' ? 'off'
              : field.name === 'email' ? 'email'
              : field.name === 'celular' ? 'tel'
              : undefined
            }
            {...register(field.name, {
              onBlur: () => setFocusedField(null)
            })}
            onFocus={() => setFocusedField(field.name)}
          />
        </div>
        {err && (
          <p id={`${field.name}-error`} role="alert" className="error-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#ef4444' }} />
            {err.message}
          </p>
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
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#F0F4FF',
            lineHeight: 1.15,
          }}
        >
          Tus datos de <span style={{ color: '#FF6B00' }}>contacto</span>
        </h2>
        <p style={{ fontSize: 16, color: '#94A3B8', marginTop: 12, lineHeight: 1.5 }}>
          Completá tu información para que podamos enviarte un presupuesto personalizado a tu medida.
        </p>
      </motion.div>

      <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', 
            background: 'rgba(52, 211, 153, 0.1)', 
            border: '1px solid rgba(52, 211, 153, 0.2)',
            borderRadius: 16 
          }}
        >
          <ShieldCheck size={24} style={{ color: '#34D399', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#A7F3D0', lineHeight: 1.5, fontWeight: 500 }}>
            Tus datos están <strong style={{ color: '#fff' }}>100% seguros</strong> y encriptados. 
            No compartimos tu información con terceros, solo la usamos para armar tu viaje.
          </p>
        </motion.div>

        {/* Datos Personales Group */}
        <motion.section
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 20,
            padding: '24px clamp(16px, 4vw, 24px)',
            boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.01)'
          }}
        >
          <SectionTitle icon={User} text="Información Personal" desc="Necesitamos estos datos para poder emitir tus reservas y buscar disponibilidad." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderField(dataFields[0], 0.15)}
            {renderField(dataFields[1], 0.2)}
          </div>
          <div className="mt-4">
            {renderField(dataFields[2], 0.25)}
          </div>
        </motion.section>

        {/* Medio de Contacto Group */}
        <motion.section
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 20,
            padding: '24px clamp(16px, 4vw, 24px)',
            boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.01)'
          }}
        >
          <SectionTitle icon={Phone} text="Vías de Comunicación" desc="¿A dónde te enviamos el presupuesto? Te enviaremos un WhatsApp con los detalles." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderField(contactFields[0], 0.3)}
            {renderField(contactFields[1], 0.35)}
          </div>
        </motion.section>

      </form>
    </div>
  )
})
