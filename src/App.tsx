import { Header } from '@/components/layout/Header'
import { WizardShell } from '@/components/wizard/WizardShell'
import { SuccessModal } from '@/components/success-modal/SuccessModal'
import { QAUseCasePanel } from '@/components/ui/QAUseCasePanel'

function App() {
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
