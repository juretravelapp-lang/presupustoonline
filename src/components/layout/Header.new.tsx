import logoImg from '@/assets/img/logo/logo.jpg'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-950/95 to-slate-900/95 backdrop-blur-md border-b border-blue-800/40 safe-area-top">
      <div className="mx-auto px-5 py-3 flex items-center justify-between">
        {/* Logo - Compacto */}
        <div className="flex items-center gap-2">
          <img 
            src={logoImg} 
            alt="Travel Jure" 
            className="h-8 w-8 rounded-md shadow-lg" 
          />
          <h1 className="text-white font-bold text-sm tracking-tight">
            Travel Jure
          </h1>
        </div>

        {/* CTA - Soporte o Info */}
        <a
          href="https://wa.me/5493812061066"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          ¿Ayuda?
        </a>
      </div>
    </header>
  )
}
