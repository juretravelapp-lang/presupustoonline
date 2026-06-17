import { useAuthStore } from '@/stores/authStore'
import { Login } from './Login'
import { Dashboard } from './Dashboard'
import { Loader2 } from 'lucide-react'

export function AdminPanel() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0A1526 0%, #0F1E35 100%)',
        gap: 16,
        color: '#F0F4FF',
      }}>
        <Loader2 className="animate-spin" size={36} style={{ color: '#F59E0B' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(148,163,184,0.8)' }}>Cargando Panel...</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <Dashboard />
}
