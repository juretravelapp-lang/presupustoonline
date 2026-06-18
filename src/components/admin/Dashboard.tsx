import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useWizardStore } from '@/stores/wizardStore'
import { KanbanBoard } from './KanbanBoard'
import { MeetingsBoard } from './MeetingsBoard'
import { WizardShell } from '@/components/wizard/WizardShell'
import { useDashboardStats } from '@/hooks/useQuotesQuery'
import {
  LayoutDashboard,
  KanbanSquare,
  ClipboardPlus,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Users,
  Compass,
  FileCheck,
  TrendingUp,
  Map,
  Send,
  Calendar,
  Loader2,
} from 'lucide-react'

type AdminView = 'metrics' | 'kanban' | 'meetings' | 'operator_wizard'

export function Dashboard() {
  const { user, logout } = useAuthStore()
  const resetWizard = useWizardStore(state => state.reset)
  const [activeView, setActiveView] = useState<AdminView>('kanban')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: stats, isLoading: statsLoading } = useDashboardStats({
    enabled: activeView === 'metrics' && user?.role === 'admin'
  })

  const handleLogout = () => {
    logout()
    // Redirect back to home page path in browser
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const handleViewChange = (view: AdminView) => {
    if (view === 'operator_wizard') {
      resetWizard() // clear any client draft before operator inputs
    }
    setActiveView(view)
    setSidebarOpen(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0A1526',
      color: '#F0F4FF',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* ── Mobile Hamburger Header ───────────────────────────────── */}
      <div className="flex sm:hidden w-full h-14 items-center justify-between px-4 fixed top-0 left-0 right-0 z-30" style={{
        background: 'rgba(10,21,38,0.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Compass size={20} style={{ color: '#F59E0B' }} />
          <span style={{ fontWeight: 800, fontSize: 14 }}>Jure CRM</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'none', border: 'none', color: '#F0F4FF', cursor: 'pointer' }}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Sidebar Navigation ────────────────────────────────────── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 p-6 flex flex-col justify-between transition-transform sm:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:sticky`}
        style={{
          background: 'rgba(15, 30, 53, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1.5px solid rgba(255,255,255,0.07)',
          height: '100vh',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Logo brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0A1526', fontWeight: 900, fontSize: 16,
            }}>
              ✈️
            </div>
            <div>
              <h1 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                Jure CRM
              </h1>
              <span style={{ fontSize: 9, color: 'rgba(245,158,11,0.85)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tablero de Control
              </span>
            </div>
          </div>

          {/* User profile segment */}
          <div style={{
            padding: '14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1.5px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
          }}>
            <p style={{ fontSize: 10, color: 'rgba(148,163,184,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Agente Activo
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.nombre}
            </p>
            <span style={{
              display: 'inline-block',
              fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
              background: user?.role === 'admin' ? 'rgba(245,158,11,0.12)' : 'rgba(96,165,250,0.12)',
              color: user?.role === 'admin' ? '#FBBF24' : '#60A5FA',
              border: `1.5px solid ${user?.role === 'admin' ? 'rgba(245,158,11,0.2)' : 'rgba(96,165,250,0.2)'}`,
              marginTop: 6,
              textTransform: 'uppercase',
            }}>
              {user?.role === 'admin' ? '📍 Admin' : '👤 Operador'}
            </span>
          </div>

          {/* Menu Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {user?.role === 'admin' && (
              <button
                onClick={() => handleViewChange('metrics')}
                className={`option-chip ${activeView === 'metrics' ? 'selected' : ''}`}
                style={{ height: 48, padding: '0 14px' }}
              >
                <LayoutDashboard size={18} />
                <span>Métricas</span>
              </button>
            )}

            <button
              onClick={() => handleViewChange('kanban')}
              className={`option-chip ${activeView === 'kanban' ? 'selected' : ''}`}
              style={{ height: 48, padding: '0 14px' }}
            >
              <KanbanSquare size={18} />
              <span>Tablero Kanban</span>
            </button>

            <button
              onClick={() => handleViewChange('meetings')}
              className={`option-chip ${activeView === 'meetings' ? 'selected' : ''}`}
              style={{ height: 48, padding: '0 14px' }}
            >
              <CalendarDays size={18} />
              <span>Reuniones</span>
            </button>

            <button
              onClick={() => handleViewChange('operator_wizard')}
              className={`option-chip ${activeView === 'operator_wizard' ? 'selected' : ''}`}
              style={{ height: 48, padding: '0 14px' }}
            >
              <ClipboardPlus size={18} />
              <span>Crear Solicitud</span>
            </button>
          </nav>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            height: 48,
            borderRadius: 14,
            border: '1.5px solid rgba(248,113,113,0.15)',
            background: 'rgba(248,113,113,0.05)',
            color: '#F87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.12)'
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.35)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.05)'
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)'
          }}
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────── */}
      <main className="flex-1 min-h-screen p-4 sm:p-8 pt-20 sm:pt-8" style={{
        maxWidth: activeView === 'operator_wizard' ? 760 : '100%',
        margin: activeView === 'operator_wizard' ? '0 auto' : '0',
        overflowX: 'auto',
      }}>
        {activeView === 'metrics' && user?.role === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
            {/* Page Header */}
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', marginBottom: 4 }}>
                Resumen de Métricas
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)' }}>Monitoreo en tiempo real de leads y cotizaciones</p>
            </div>

            {/* Stats Cards Grid */}
            {statsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8', fontSize: 14 }}>
                <Loader2 className="animate-spin" size={18} /> Cargando datos...
              </div>
            ) : stats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {[
                  { title: 'Total Leads', count: stats.total, color: '#60A5FA', icon: Map },
                  { title: 'No Cotizados', count: stats.no_cotizado, color: '#94A3B8', icon: Users },
                  { title: 'En Cotización', count: stats.en_cotizacion, color: '#FB923C', icon: TrendingUp },
                  { title: 'Cotizados', count: stats.cotizados, color: '#FBBF24', icon: LayoutDashboard },
                  { title: 'Enviados a Cliente', count: stats.enviado_cliente, color: '#818CF8', icon: Send },
                  { title: 'Concretados', count: stats.concretados, color: '#34D399', icon: FileCheck },
                  { title: 'Cancelados', count: stats.cancelados, color: '#F87171', icon: X },
                  { title: 'Reuniones Hoy', count: stats.reuniones_hoy, color: '#F59E0B', icon: Calendar },
                ].map((stat, idx) => (
                  <div
                    key={stat.title}
                    className="glass-card animate-fade-in-up"
                    style={{
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      animationDelay: `${idx * 0.05}s`,
                      borderLeft: `3px solid ${stat.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.title}</span>
                      <stat.icon size={16} style={{ color: stat.color }} />
                    </div>
                    <span style={{ fontSize: 32, fontWeight: 900, color: stat.color }}>{stat.count || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)' }}>No se pudieron recuperar las métricas.</p>
            )}
          </div>
        )}

        {activeView === 'kanban' && (
          <KanbanBoard />
        )}

        {activeView === 'meetings' && (
          <MeetingsBoard />
        )}

        {activeView === 'operator_wizard' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <span className="chip-tag" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                📝 Modo Operador Activo
              </span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F0F4FF', marginTop: 10, letterSpacing: '-0.02em' }}>
                Cargar Presupuesto
              </h2>
              <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.75)', marginTop: 4 }}>
                Los presupuestos ingresados aquí se registrarán a nombre de <strong>{user?.nombre}</strong>
              </p>
            </div>
            {/* Render client wizard shell directly */}
            <WizardShell />
          </div>
        )}
      </main>
    </div>
  )
}
