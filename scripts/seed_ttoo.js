import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);

function getFutureDateStr(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function seed() {
  const baseQuote = {
    tipo_fecha: 'flexible',
    destinos: ['Test'],
    adultos: 2,
    ninos_2_12: 0,
    bebes_0_2: 0,
    preferencias: [],
    whatsapp_enviado: false,
    whatsapp_mensaje: null,
  };

  const mockQuotes = [
    {
      ...baseQuote,
      nombre: 'Lucía',
      apellido: 'Martínez',
      dni: '34567890',
      email: 'lucia.m@example.com',
      celular: '1122334455',
      origen_consulta: 'WhatsApp',
      estado: 'concretado',
      ticket_id: 'JT-2026-000001',
      pricing_detalles: {
        moneda: 'USD',
        markup_tipo: 'porcentaje',
        markup_valor: 20,
        servicios: [
          {
            id: crypto.randomUUID(),
            tipo: 'Hotel',
            ttoo: 'Despegar',
            descripcion: 'Hotel Riu Cancún (Vence Hoy)',
            costo: 1200,
            fecha_vto_ttoo: getFutureDateStr(0),
            estado_pago: 'pendiente'
          }
        ]
      }
    },
    {
      ...baseQuote,
      nombre: 'Carlos',
      apellido: 'Gómez',
      dni: '29384756',
      email: 'carlos.g@example.com',
      celular: '1199887766',
      origen_consulta: 'Instagram',
      estado: 'concretado',
      ticket_id: 'JT-2026-000002',
      pricing_detalles: {
        moneda: 'ARS',
        markup_tipo: 'fijo',
        markup_valor: 50000,
        servicios: [
          {
            id: crypto.randomUUID(),
            tipo: 'Vuelo',
            ttoo: 'Latam',
            descripcion: 'Vuelos BUE-MIA (Vence en 3 días)',
            costo: 850000,
            fecha_vto_ttoo: getFutureDateStr(3),
            estado_pago: 'pendiente'
          }
        ]
      }
    },
    {
      ...baseQuote,
      nombre: 'Sofía',
      apellido: 'Pérez',
      dni: '41234567',
      email: 'sofia.p@example.com',
      celular: '1144556677',
      origen_consulta: 'Web',
      estado: 'cotizado',
      ticket_id: 'JT-2026-000003',
      pricing_detalles: {
        moneda: 'USD',
        markup_tipo: 'porcentaje',
        markup_valor: 15,
        servicios: [
          {
            id: crypto.randomUUID(),
            tipo: 'Asistencia',
            ttoo: 'Latam',
            descripcion: 'Assist Card Global (Vence en 10 días)',
            costo: 450,
            fecha_vto_ttoo: getFutureDateStr(10),
            estado_pago: 'pendiente'
          }
        ]
      }
    },
    {
      ...baseQuote,
      nombre: 'Javier',
      apellido: 'Rodríguez',
      dni: '25678901',
      email: 'javier.r@example.com',
      celular: '1166778899',
      origen_consulta: 'Referido',
      estado: 'concretado',
      ticket_id: 'JT-2026-000004',
      pricing_detalles: {
        moneda: 'USD',
        markup_tipo: 'porcentaje',
        markup_valor: 20,
        servicios: [
          {
            id: crypto.randomUUID(),
            tipo: 'Excursión',
            ttoo: 'Despegar',
            descripcion: 'Tour Xcaret (Pagado, hace 2 días)',
            costo: 800,
            fecha_vto_ttoo: getFutureDateStr(-2),
            estado_pago: 'pagado'
          }
        ]
      }
    },
    {
      ...baseQuote,
      nombre: 'Valentina',
      apellido: 'Fernández',
      dni: '38123456',
      email: 'valentina.f@example.com',
      celular: '1155443322',
      origen_consulta: 'Facebook',
      estado: 'concretado',
      ticket_id: 'JT-2026-000005',
      pricing_detalles: {
        moneda: 'ARS',
        markup_tipo: 'fijo',
        markup_valor: 80000,
        servicios: [
          {
            id: crypto.randomUUID(),
            tipo: 'Vuelo',
            ttoo: 'Iberia',
            descripcion: 'Vuelos BUE-MAD (Vence en 5 días)',
            costo: 1200000,
            fecha_vto_ttoo: getFutureDateStr(5),
            estado_pago: 'pendiente'
          }
        ]
      }
    }
  ];

  console.log('Inserting 5 mock quotes...');
  for (const q of mockQuotes) {
    const { error } = await supabase.from('travel_quotes').insert(q);
    if (error) {
      console.error('Error inserting:', error);
    } else {
      console.log(`Inserted ${q.ticket_id}`);
    }
  }
  console.log('Done!');
}

seed();
