import { useEffect, useState } from 'react'
import { getQuoteById, type TravelQuoteRow, type PricingDetalles } from '@/lib/supabase'
import { motion } from 'motion/react'
import { Plane, Calendar, MapPin, Users, Loader2, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { QuotePDF } from '../admin/QuotePDF'

export function ClientQuoteView() {
  const [quote, setQuote] = useState<TravelQuoteRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Extract ID from URL
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
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-slate-400 text-center">{error}</p>
        <a href="/" className="mt-6 text-amber-500 hover:underline">Volver al inicio</a>
      </div>
    )
  }

  const allDestinos = [...quote.destinos, ...(quote.destino_personalizado ? quote.destino_personalizado.split(',') : [])]
  const destinationsText = allDestinos.map(d => d.trim().replace(/_/g, ' ')).join(', ')
  const pricing = quote.pricing_detalles as PricingDetalles | undefined
  const selectedProvider = pricing?.proveedores?.find(p => p.nombre === pricing.proveedor_seleccionado)

  return (
    <div className="min-h-screen bg-[#0A1526] text-white font-sans selection:bg-amber-500/30 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
              Jure <span className="text-amber-500">Travel</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mt-1">Presupuesto a medida</p>
          </div>
          <div className="text-slate-400 text-sm bg-white/5 px-4 py-2 rounded-xl border border-white/10 inline-block">
            <span className="block text-xs uppercase text-slate-500 font-bold mb-1">Referencia</span>
            <span className="font-mono text-amber-400">#{quote.id.substring(0, 8).toUpperCase()}</span>
          </div>
        </header>

        {/* Welcome */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 p-6 md:p-8 mb-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <h2 className="text-2xl font-bold mb-2">¡Hola, {quote.nombre}! 👋</h2>
          <p className="text-slate-300 leading-relaxed max-w-2xl">
            Preparé este presupuesto especialmente diseñado para tus próximas vacaciones. Revisá los detalles de tu viaje y el costo estimado a continuación.
          </p>
        </div>

        {/* Trip Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DetailCard icon={MapPin} title="Destino(s)" value={destinationsText} />
          <DetailCard 
            icon={Calendar} 
            title="Fechas" 
            value={quote.tipo_fecha === 'exacta' 
              ? `${quote.fecha_salida ? formatDate(quote.fecha_salida) : '—'} al ${quote.fecha_regreso ? formatDate(quote.fecha_regreso) : '—'}`
              : quote.mes_preferido || '—'
            } 
          />
          <DetailCard icon={Users} title="Pasajeros" value={`${quote.adultos} Ad | ${quote.ninos_2_12} Ni | ${quote.bebes_0_2} Be`} />
          <DetailCard icon={Plane} title="Salida desde" value={quote.ciudad_salida?.toUpperCase().replace(/_/g, ' ') || 'No especificada'} />
        </div>

        {/* Services & Comments */}
        <div className="bg-slate-800/50 rounded-2xl border border-white/5 p-6 mb-6">
          <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Servicios Incluidos</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {quote.preferencias.map(p => (
              <span key={p} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                ✓ {p.replace(/_/g, ' ')}
              </span>
            ))}
          </div>

          {quote.comentarios && (
            <>
              <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">Tus Observaciones</h3>
              <p className="text-sm text-slate-300 bg-black/20 p-4 rounded-xl border border-white/5 italic">
                "{quote.comentarios}"
              </p>
            </>
          )}
        </div>

        {/* Pricing */}
        {selectedProvider ? (
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-2xl border border-amber-500/30 p-8 text-center relative overflow-hidden">
            <h3 className="text-sm font-bold uppercase text-amber-200/80 mb-2 tracking-widest">Inversión Total Estimada</h3>
            <div className="text-4xl md:text-6xl font-black text-amber-400 drop-shadow-md">
              {pricing?.moneda === 'USD' ? 'USD $' : 'ARS $'}
              {selectedProvider.precio_final.toLocaleString()}
            </div>
            <p className="text-xs text-amber-200/60 mt-4 font-medium max-w-md mx-auto">
              Precios vigentes al día de la fecha. Sujetos a disponibilidad y modificaciones al momento de realizar la reserva efectiva.
            </p>
          </div>
        ) : (
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-8 text-center">
             <div className="text-2xl font-bold text-slate-300 mb-2">Presupuesto en armado</div>
             <p className="text-sm text-slate-400">Estamos armando las mejores opciones para tu viaje. Pronto verás el precio aquí.</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {selectedProvider && (
            <PDFDownloadLink
              document={<QuotePDF quote={quote} selectedProvider={selectedProvider} />}
              fileName={`Presupuesto_Jure_Travel_${quote.nombre}_${quote.apellido}.pdf`}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
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
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 px-8 rounded-xl transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2"
          >
            Hablar con un asesor
          </a>
        </div>

        <footer className="mt-12 text-center text-slate-500 text-xs border-t border-white/5 pt-6 pb-6">
          <p>Jure Travel - Legajo Nº 12345 · San Miguel de Tucumán</p>
          <p className="mt-1">¡Gracias por confiar tu próximo viaje en nosotros!</p>
        </footer>
      </motion.div>
    </div>
  )
}

function DetailCard({ icon: Icon, title, value }: { icon: any, title: string, value: string }) {
  return (
    <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5 flex items-start gap-4">
      <div className="bg-white/5 p-3 rounded-lg text-amber-500">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">{title}</h4>
        <p className="text-sm font-bold text-slate-200">{value}</p>
      </div>
    </div>
  )
}
