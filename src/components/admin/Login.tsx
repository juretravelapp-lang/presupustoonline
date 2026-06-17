import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { motion, AnimatePresence } from 'motion/react'
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react'

export function Login() {
  const login = useAuthStore(state => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmedEmail = email.trim()
    const trimmedPass = password.trim()

    if (!trimmedEmail || !trimmedPass) {
      setError('Completá todos los campos')
      return
    }

    setSubmitting(true)
    try {
      const res = await login(trimmedEmail, trimmedPass)
      if (!res.success) {
        setError(res.error || 'Credenciales inválidas')
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const goBackHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #0A1526 0%, #0F1E35 45%, #0C1A30 100%)',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '40px 32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: 'rgba(245,158,11,0.1)',
            border: '1.5px solid rgba(245,158,11,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#F59E0B',
          }}>
            <Lock size={22} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            Panel de Acceso
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.85)', fontWeight: 500 }}>
            Ingresá tus credenciales de agente Jure Travel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Email */}
          <div>
            <label className="input-label" htmlFor="email-input">Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(100,116,139,0.8)' }} />
              <input
                id="email-input"
                type="email"
                placeholder="agente@juretravel.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-dark"
                style={{ paddingLeft: 42 }}
                disabled={submitting}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="input-label" htmlFor="password-input">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(100,116,139,0.8)' }} />
              <input
                id="password-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-dark"
                style={{ paddingLeft: 42 }}
                disabled={submitting}
                required
              />
            </div>
          </div>

          {/* Error display */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="error-text"
                style={{ textAlign: 'center', margin: 0, padding: '8px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.18)' }}
              >
                ✕ {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit CTA */}
          <button
            type="submit"
            className="btn-cta"
            disabled={submitting}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {submitting ? 'Iniciando sesión...' : 'Ingresar al sistema'}
            {!submitting ? <ArrowRight size={18} /> : null}
          </button>
        </form>

        {/* Footer actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            type="button"
            onClick={goBackHome}
            style={{
              background: 'none', border: 'none',
              fontSize: 12, fontWeight: 700, color: 'rgba(148,163,184,0.7)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F59E0B')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.7)')}
          >
            ← Volver a cotizar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(100,116,139,0.7)', fontWeight: 600 }}>
            <ShieldCheck size={12} style={{ color: '#34D399' }} /> Conexión segura SSL
          </div>
        </div>
      </motion.div>
    </div>
  )
}
