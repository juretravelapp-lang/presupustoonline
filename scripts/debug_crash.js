const fs = require('fs')

async function run() {
  try {
    // This script will just fetch quotes and try to run the useMemo logic to see where it crashes.
    require('dotenv').config({ path: '.env.local' })
    const { createClient } = require('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
    
    const { data: quotes, error } = await supabase.from('travel_quotes').select('*')
    if (error) throw error
    
    console.log(`Fetched ${quotes.length} quotes.`)
    
    const ttooMap = {}
    
    for (const quote of quotes) {
      const pricing = quote.pricing_detalles
      if (!pricing || !pricing.servicios) continue
      
      // crash test
      if (!Array.isArray(pricing.servicios)) {
          console.log('NOT AN ARRAY:', pricing.servicios, 'in quote', quote.id)
          continue
      }
      
      const moneda = pricing.moneda || 'USD'
      
      for (const serv of pricing.servicios) {
        if (!serv.ttoo || !serv.costo) continue
        
        const ttooName = serv.ttoo
        const fechaVto = serv.fecha_vto_ttoo || 'Sin Fecha Asignada'
        
        if (!ttooMap[ttooName]) ttooMap[ttooName] = { ttoo: ttooName, vencimientos: {}, totalUSD: 0, totalARS: 0 }
        if (!ttooMap[ttooName].vencimientos[fechaVto]) ttooMap[ttooName].vencimientos[fechaVto] = { fecha: fechaVto, totalUSD: 0, totalARS: 0, items: [] }
        
        const cost = Number(serv.costo)
        if (moneda === 'USD') {
          ttooMap[ttooName].totalUSD += cost
          ttooMap[ttooName].vencimientos[fechaVto].totalUSD += cost
        } else {
          ttooMap[ttooName].totalARS += cost
          ttooMap[ttooName].vencimientos[fechaVto].totalARS += cost
        }
        
        ttooMap[ttooName].vencimientos[fechaVto].items.push({
          quoteId: quote.id,
          ticketId: quote.ticket_id || 'S/N',
          cliente: `${quote.nombre || ''} ${quote.apellido || ''}`.trim() || 'Sin Nombre',
          servicioDesc: serv.descripcion || 'Sin descripción',
          tipoServicio: serv.tipo,
          moneda,
          costo: cost,
          estado: quote.estado
        })
      }
    }
    
    const res = Object.values(ttooMap).map(ttooObj => {
      const sortedVencimientos = Object.values(ttooObj.vencimientos).sort((a, b) => {
        if (a.fecha === 'Sin Fecha Asignada') return 1
        if (b.fecha === 'Sin Fecha Asignada') return -1
        return a.fecha.localeCompare(b.fecha)
      })
      return { ...ttooObj, sortedVencimientos }
    })
    
    console.log('SUCCESS! Aggregated length:', res.length)
  } catch (err) {
    console.error('CRASHED:', err)
  }
}

run()
