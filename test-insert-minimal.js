const URL = 'https://yqtoicuvbhwxktbkngrf.supabase.co/rest/v1/travel_quotes';
const KEY = 'sb_publishable_ED7m8Uly8eRg1eW_WFnZWg_UujXkaqi';

const quote = {
  nombre: 'Test',
  apellido: 'Minimal',
  dni: '12345678',
  email: 'test@minimal.com',
  celular: '+5493815550000',
  ciudad_salida: 'Tucuman',
  aeropuerto_salida: 'TUC',
  destino: 'Europa',
  destino_personalizado: null,
  destinos: ['europa'],
  tipo_fecha: 'exacta',
  fecha_salida: '2026-10-01',
  fecha_regreso: '2026-10-10',
  rango_fecha_inicio: '2026-10-01',
  rango_fecha_fin: '2026-10-10',
  mes_preferido: null,
  adultos: 2,
  ninos_2_12: 0,
  bebes_0_2: 0,
  preferencias: ['vuelos', 'hoteles_4'],
  comentarios: 'Comentario de prueba minimal',
  tipo_viaje: 'vacaciones',
  ip_address: null,
  origen_consulta: 'web',
  estado: 'nuevo',
  whatsapp_enviado: false,
  whatsapp_mensaje: null
};

async function run() {
  try {
    console.log('Inserting row with return=minimal...');
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(quote)
    });

    console.log('Status:', response.status, response.statusText);
    const text = await response.text();
    console.log('Body:', text);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

run();
