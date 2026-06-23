import { Instagram, Phone, Mail, MapPin } from 'lucide-react'
import logoImg from '@/assets/img/logo/logo.jpg'
import { useIsMobile } from '@/hooks/useMediaQuery'

export function Footer() {
  const isMobile = useIsMobile()

  return (
    <footer className="bg-secondary text-white">
      <div className={`mx-auto px-5 ${isMobile ? 'py-10' : 'max-w-6xl py-14'}`}>
        <div className={`grid gap-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'}`}>
          {/* Brand */}
          <div className={isMobile ? '' : 'md:col-span-2'}>
            <div className="flex items-center gap-3 mb-5">
              <img src={logoImg} alt="JURE TRAVEL" className="w-11 h-11 rounded-[10px] object-contain" />
              <div>
                <h3 className="text-[18px] font-bold text-white tracking-[-0.02em] font-sans">Travel Jure</h3>
                <p className="text-[10px] text-primary/60 font-semibold tracking-[0.1em] uppercase">Viajes Premium</p>
              </div>
            </div>
            <p className="text-[13px] text-white/35 max-w-md leading-relaxed mb-6">
              Creamos experiencias de viaje únicas y personalizadas. Con más de 1.000 viajeros asesorados,
              nos dedicamos a encontrar las mejores tarifas y destinos para vos.
            </p>
            <div className="flex gap-2.5">
              {[
                { icon: Instagram, href: 'https://www.instagram.com/traveljure', label: 'Instagram' },
                { icon: Phone, href: 'https://wa.me/5493812061066', label: 'WhatsApp' },
                { icon: Mail, href: 'mailto:info@traveljure.com', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-10 h-10 bg-white/5 hover:bg-primary/20 rounded-[10px] flex items-center justify-center transition-all duration-[200ms] active:scale-95"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4 text-white/50 group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          {/* Destinos - desktop */}
          {!isMobile && (
            <div>
              <h4 className="font-bold mb-5 text-[11px] text-white/50 uppercase tracking-[0.08em] font-sans">Destinos</h4>
              <ul className="space-y-3 text-[13px] text-white/35">
                {['Brasil', 'Caribe', 'Europa', 'Estados Unidos', 'Disney', 'Cruceros'].map(d => (
                  <li key={d}><a href="#" className="hover:text-primary transition-colors duration-[200ms] font-medium">{d}</a></li>
                ))}
              </ul>
            </div>
          )}

          {/* Contacto */}
          <div>
            <h4 className="font-bold mb-5 text-[11px] text-white/50 uppercase tracking-[0.08em] font-sans">Contacto</h4>
            <ul className="space-y-3.5 text-[13px] text-white/35">
              <li className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-primary/50" />
                <span className="font-medium">+54 9 381 206-1066</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="h-3.5 w-3.5 text-primary/50" />
                <span className="font-medium">@traveljure</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-primary/50" />
                <span className="font-medium">info@traveljure.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-primary/50" />
                <span className="font-medium">San Miguel de Tucumán, Argentina</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] mt-12 pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/20 font-medium">
            © 2026 Travel Jure. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-[11px] text-white/20 font-medium">
            <a href="#" className="hover:text-primary/60 transition-colors duration-[200ms]">Política de Privacidad</a>
            <a href="#" className="hover:text-primary/60 transition-colors duration-[200ms]">Términos y Condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
