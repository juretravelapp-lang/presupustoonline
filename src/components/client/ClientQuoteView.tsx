import { useEffect, useState } from 'react'
import { getQuoteById, type TravelQuoteRow, type PricingDetalles } from '@/lib/supabase'
import { motion } from 'motion/react'
import { Plane, Calendar, MapPin, Users, Loader2, AlertCircle, Shield, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { QuotePDF } from '../admin/QuotePDF'
import { DESTINOS_POPULARES } from '@/lib/constants'

const DESTINO_FLAGS: Record<string, string> = {
  brasil: '🇧🇷',
  caribe: '🏝️',
  europa: '🏰',
  estados_unidos: '🗽',
  mexico: '🌮',
  punta_cana: '🌊',
  disney: '✨',
  cruceros: '🚢',
}

const HERO_BG = '/assets/images/promos/banner1.webp'

function getDestinoEmoji(destino: string): string {
  const normalized = destino.toLowerCase().trim()
  if (DESTINO_FLAGS[normalized]) return DESTINO_FLAGS[normalized]
  const popular = DESTINOS_POPULARES.find(d => d.value === normalized)
  if (popular) return popular.emoji
  return '🌍'
}

function formatDestinos(destinos: string[]): string {
  return destinos.map(d => {
    const trimmed = d.trim()
    const popular = DESTINOS_POPULARES.find(dp => dp.value === trimmed)
    const label = popular?.label || trimmed.replace(/_/g, ' ')
    const emoji = getDestinoEmoji(trimmed)
    return `${emoji} ${label}`
  }).join(', ')
}

export function ClientQuoteView() {
  const [quote, setQuote] = useState<TravelQuoteRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = window.location.pathname.split('/').pop()
    if (!id) {
      setError('ID de presupuesto no válido.')
      setLoading(false)
      return
    }

    getQuoteById(id)
      .then(data => {
        if (!data) setError('Presupuesto no encontrado.')
        else setQuote(data)
      })
      .catch(err => {
        console.error(err)
        setError('Ocurrió un error al cargar el presupuesto.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1526] text-white">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={48} />
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A1526] text-white p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Error</h2>
        <p className="text-slate-400 text-center">{error}</p>
        <a href="/" className="mt-6 text-amber-500 hover:underline">Volver al inicio</a>
      </div>
    )
  }

  const allDestinos = [...quote.destinos, ...(quote.destino_personalizado ? quote.destino_personalizado.split(',') : [])]
  const destinationsDisplay = formatDestinos(allDestinos)
  const pricing = quote.pricing_detalles as PricingDetalles | undefined
  const selectedProvider = pricing?.proveedores?.find(p => p.nombre === pricing.proveedor_seleccionado)

  return (
    <div className="min-h-screen bg-[#0A1526] text-white font-sans selection:bg-amber-500/30">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.35) saturate(0.7)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1526] via-[#0A1526]/70 to-transparent" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(201,169,110,0.08) 0%, transparent 70%)',
          }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-3xl mx-auto px-5 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32"
        >
          {/* Logo + Ref */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 12px rgba(201,169,110,0.3))' }}>
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="#C9A96E"/>
              </svg>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#F0F4FF', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                  Jure <span className="text-gold">Travel</span>
                </h1>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Presupuesto a medida</p>
              </div>
            </div>
            <div className="bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="block text-[10px] uppercase text-slate-500 font-bold mb-0.5 tracking-wider">Referencia</span>
              <span className="font-mono text-xs text-gold font-bold tracking-wide">#{quote.id.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Greeting */}
          <h2 style={{
            fontSize: 'clamp(36px, 8vw, 60px)',
            fontWeight: 700,
            color: '#F0F4FF',
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            maxWidth: 700,
          }}>
            ¡Hola, {quote.nombre}!
          </h2>
          <div className="gold-divider" style={{ margin: '24px 0 20px' }} />
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl font-medium" style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.7 }}>
            Preparé este presupuesto especialmente diseñado para tus próximas vacaciones. Revisá los detalles de tu viaje y el costo estimado a continuación.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 md:px-10 -mt-12 relative z-10">
        {/* Trip Details Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10"
        >
          <GlassCard icon={MapPin} title="Destino(s)" value={destinationsDisplay} />
          <GlassCard
            icon={Calendar}
            title="Fechas"
            value={quote.tipo_fecha === 'exacta'
              ? `${quote.fecha_salida ? formatDate(quote.fecha_salida) : '—'} al ${quote.fecha_regreso ? formatDate(quote.fecha_regreso) : '—'}`
              : quote.mes_preferido || '—'
            }
          />
          <GlassCard icon={Users} title="Pasajeros" value={`${quote.adultos} Adulto${quote.adultos !== 1 ? 's' : ''} · ${quote.ninos_2_12} Niño${quote.ninos_2_12 !== 1 ? 's' : ''} · ${quote.bebes_0_2} Bebé${quote.bebes_0_2 !== 1 ? 's' : ''}`} />
          <GlassCard icon={Plane} title="Salida desde" value={quote.ciudad_salida?.toUpperCase().replace(/_/g, ' ') || 'No especificada'} />
        </motion.div>

        {/* Services & Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.07] p-8 md:p-10 mb-10"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <h3 className="text-sm font-bold uppercase text-gold mb-5 tracking-wider flex items-center gap-2">
            <Star size={16} className="text-gold" /> Servicios Incluidos
          </h3>
          <div className="flex flex-wrap gap-3 mb-8">
            {quote.preferencias.map(p => (
              <span key={p} className="badge-gold">
                {p.replace(/_/g, ' ')}
              </span>
            ))}
          </div>

          {quote.comentarios && (
            <>
              <div className="gold-divider" />
              <h3 className="text-sm font-bold uppercase text-gold mb-4 tracking-wider flex items-center gap-2">
                Tus Observaciones
              </h3>
              <p className="text-sm text-slate-300 bg-black/30 p-5 rounded-xl border border-white/5 italic backdrop-blur-sm leading-relaxed">
                "{quote.comentarios}"
              </p>
            </>
          )}
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {selectedProvider ? (
            <div className="relative overflow-hidden rounded-2xl border border-gold-border bg-gradient-to-br from-gold-light to-transparent p-10 md:p-12 text-center shadow-gold">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

              <h3 className="text-xs font-bold uppercase text-gold/80 mb-3 tracking-widest">Inversión Total Estimada</h3>
              <div className="gold-divider-center" />
              <div className="text-4xl md:text-6xl font-black text-gold drop-shadow-md mt-4" style={{ fontFamily: 'var(--font-serif)' }}>
                {pricing?.moneda === 'USD' ? 'USD $' : 'ARS $'}
                {selectedProvider.precio_final.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-4 font-medium max-w-md mx-auto">
                Precios vigentes al día de la fecha. Sujetos a disponibilidad y modificaciones al momento de realizar la reserva efectiva.
              </p>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/[0.07] p-10 md:p-12 text-center shadow-lg">
              <div className="text-2xl font-bold text-slate-300 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Presupuesto en armado</div>
              <p className="text-sm text-slate-400">Estamos armando las mejores opciones para tu viaje. Pronto verás el precio aquí.</p>
            </div>
          )}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 mt-10"
        >
          {[
            { icon: Shield, text: '1.000+ viajeros asesorados' },
            { icon: Star, text: 'Atención personalizada' },
            { icon: Shield, text: 'Sin compromiso' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2.5 text-sm text-slate-500 font-semibold">
              <div className="w-7 h-7 rounded-full bg-gold-muted flex items-center justify-center">
                <item.icon size={14} className="text-gold" />
              </div>
              {item.text}
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          {selectedProvider && (
            <PDFDownloadLink
              document={<QuotePDF quote={quote} selectedProvider={selectedProvider} />}
              fileName={`Presupuesto_Jure_Travel_${quote.nombre}_${quote.apellido}.pdf`}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm hover:border-gold-border text-sm"
            >
              {({ loading }) => (
                loading ? 'Generando PDF...' : 'Descargar en PDF'
              )}
            </PDFDownloadLink>
          )}
          <a
            href={`https://wa.me/5493812061066?text=Hola, estaba viendo mi presupuesto referenciado con el número #${quote.id.substring(0, 8).toUpperCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-gold hover:bg-gold-hover text-[#0A1526] font-black py-4 px-10 rounded-xl transition-all shadow-gold hover:shadow-[0_0_30px_rgba(201,169,110,0.3)] flex items-center justify-center gap-2 text-sm"
          >
            Hablar con un asesor
          </a>
        </motion.div>

        {/* Footer */}
        <footer className="mt-16 mb-10 text-center">
          <div className="gold-divider-center mb-8" />
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.5">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="#C9A96E"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Jure <span className="text-gold">Travel</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">Legajo Nº 12345 · San Miguel de Tucumán</p>
          <p className="text-xs text-slate-600 mt-1">¡Gracias por confiar tu próximo viaje en nosotros!</p>
        </footer>
      </div>
    </div>
  )
}

function GlassCard({ icon: Icon, title, value }: { icon: any, title: string, value: string }) {
  return (
    <div
      className="flex items-start gap-5 transition-all duration-300 group"
      style={{
        padding: '24px 28px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: 'rgba(201,169,110,0.1)',
          color: '#C9A96E',
          display: 'flex',
          flexShrink: 0,
        }}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <h4 className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1.5">{title}</h4>
        <p className="text-base font-bold text-slate-200 break-words leading-snug">{value}</p>
      </div>
    </div>
  )
}
