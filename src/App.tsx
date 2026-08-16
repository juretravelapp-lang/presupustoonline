import { useState, useEffect } from 'react'
import { lazy, Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { WizardShell } from '@/components/wizard/WizardShell'
import { SuccessModal } from '@/components/success-modal/SuccessModal'
import { TooltipProvider } from './components/ui/tooltip'
import { useAuthStore } from '@/stores/authStore'
import { QAUseCasePanel } from '@/components/ui/QAUseCasePanel'

const AdminPanel = lazy(() => import('@/components/admin/AdminPanel').then(module => ({ default: module.AdminPanel })))
const ClientQuoteView = lazy(() => import('@/components/client/ClientQuoteView').then(module => ({ default: module.ClientQuoteView })))

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const initializeAuth = useAuthStore(state => state.initialize)

  useEffect(() => {
    // Initialize Supabase auth listeners
    initializeAuth()

    // Simple path routing listener
    const handleLocationChange = () => {
      setPath(window.location.pathname)

      if (window.location.pathname.startsWith('/quote/')) {
        document.title = 'Tu Presupuesto | JURE TRAVEL'
      } else if (window.location.pathname === '/admin') {
        document.title = 'Panel Admin | JURE TRAVEL'
      } else {
        document.title = 'JURE TRAVEL — Presupuesto Online | Viajes a Medida'
      }
    }

    // Listen to custom navigation events
    window.addEventListener('popstate', handleLocationChange)
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [initializeAuth])

  if (path === '/admin') {
    return (
      <TooltipProvider>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">Cargando panel...</div>}>
          <AdminPanel />
        </Suspense>
      </TooltipProvider>
    )
  }

  if (path.startsWith('/quote/')) {
    return (
      <TooltipProvider>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0A1526] text-slate-400">Cargando presupuesto...</div>}>
          <ClientQuoteView />
        </Suspense>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen">
        <a
          href="#wizard"
          className="skip-link"
        >
          Saltar al formulario de presupuesto
        </a>
        <Header />

        <main>
          <section id="wizard">
            <WizardShell />
          </section>
        </main>

        <SuccessModal />
        {import.meta.env.DEV && <QAUseCasePanel />}
      </div>
    </TooltipProvider>
  )
}

export default App
