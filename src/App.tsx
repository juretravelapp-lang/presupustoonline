import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { WizardShell } from '@/components/wizard/WizardShell'
import { SuccessModal } from '@/components/success-modal/SuccessModal'
import { QAUseCasePanel } from '@/components/ui/QAUseCasePanel'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useAuthStore } from '@/stores/authStore'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const initializeAuth = useAuthStore(state => state.initialize)

  useEffect(() => {
    // Initialize Supabase auth listeners
    initializeAuth()

    // Simple path routing listener
    const handleLocationChange = () => {
      setPath(window.location.pathname)
    }
    
    // Listen to custom navigation events
    window.addEventListener('popstate', handleLocationChange)
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [initializeAuth])

  if (path === '/log') {
    return <AdminPanel />
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section id="wizard">
          <WizardShell />
        </section>
      </main>

      <SuccessModal />
      <QAUseCasePanel />
    </div>
  )
}

export default App
