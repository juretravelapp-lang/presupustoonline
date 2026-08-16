import { QUOTE_ESTADOS } from './estados'

export const CIUDADES_SALIDA = [
  { value: 'tucuman', label: 'Tucumán', aeropuerto: 'TUC - Teniente General Benjamín Matienzo' },
  { value: 'buenos_aires', label: 'Buenos Aires', aeropuerto: 'EZE - Ministro Pistarini' },
  { value: 'cordoba', label: 'Córdoba', aeropuerto: 'COR - Ingeniero Ambrosio Taravella' },
  { value: 'salta', label: 'Salta', aeropuerto: 'SLA - Martín Miguel de Güemes' },
  { value: 'rosario', label: 'Rosario', aeropuerto: 'ROS - Islas Malvinas' },
  { value: 'mendoza', label: 'Mendoza', aeropuerto: 'MDZ - El Plumerillo' },
  { value: 'otra', label: 'Otra ciudad', aeropuerto: '' },
] as const

export const DESTINOS_POPULARES = [
  { value: 'punta_cana',     label: 'Punta Cana',        image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=600&auto=format&fit=crop' },
  { value: 'cancun',         label: 'Cancún',            image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?q=80&w=600&auto=format&fit=crop' },
  { value: 'playa_del_carmen', label: 'Playa del Carmen', image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=600&auto=format&fit=crop' },
  { value: 'aruba',          label: 'Aruba',             image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=600&auto=format&fit=crop' },
  { value: 'curazao',        label: 'Curazao',           image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop' },
  { value: 'rio_de_janeiro', label: 'Río de Janeiro',    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=600&auto=format&fit=crop' },
  { value: 'norte_brasil',   label: 'Norte de Brasil',   image: 'https://images.unsplash.com/photo-1533038590840-1cbea976a47a?q=80&w=600&auto=format&fit=crop' },
  { value: 'usa',            label: 'USA',               image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=600&auto=format&fit=crop' },
  { value: 'disney',         label: 'Disney',            image: 'https://images.unsplash.com/photo-1522055662706-5384bc1d8892?q=80&w=600&auto=format&fit=crop' },
  { value: 'europa',         label: 'Europa',            image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600&auto=format&fit=crop' },
  { value: 'cruceros',       label: 'Cruceros',          image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=600&auto=format&fit=crop' },
  { value: 'otro',           label: 'Otros destinos',    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=600&auto=format&fit=crop' },
] as const

export const TIPOS_FECHA = [
  { value: 'exacta', label: 'Fecha exacta', description: 'Tengo fechas confirmadas' },
  { value: 'flexible', label: 'Fechas flexibles', description: 'Puedo variar unos días' },
  { value: 'mes', label: 'Mes flexible', description: 'Sé en qué mes viajo' },
] as const

export const PREFERENCIAS_SERVICIOS = [
  { value: 'vuelos',             label: 'Vuelos',                icon: '✈️' },
  { value: 'hotel',              label: 'Hotel',                 icon: '🏨' },
  { value: 'traslado',           label: 'Traslado',              icon: '🚐' },
  { value: 'asistencia_viajero', label: 'Asistencia al viajero', icon: '🛡️' },
  { value: 'tour_actividades',   label: 'Tour / Actividades',    icon: '🎟️' },
  { value: 'autos',              label: 'Autos',                 icon: '🚗' },
  { value: 'circuitos_paquetes', label: 'Circuitos / Paquetes',  icon: '🌎' },
] as const

export const ESTADOS_LEAD = QUOTE_ESTADOS

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const

export const WHATSAPP_NUMBER = '5493812061066'

export const PROMOS_SLIDES = [
  {
    id: 1,
    titulo: 'Descubrí Brasil',
    subtitulo: 'Los mejores paquetes con vuelo incluido',
    precio: 'Desde USD 1.299',
    imagen: '/assets/images/promos/brasil.jpg',
    destino: 'brasil',
  },
  {
    id: 2,
    titulo: 'Caribe Paradisíaco',
    subtitulo: 'Playas blancas y aguas cristalinas',
    precio: 'Desde USD 1.599',
    imagen: '/assets/images/promos/caribe.jpg',
    destino: 'caribe',
  },
  {
    id: 3,
    titulo: 'Europa Inolvidable',
    subtitulo: 'Recorrí las ciudades más hermosas del mundo',
    precio: 'Desde USD 2.899',
    imagen: '/assets/images/promos/europa.jpg',
    destino: 'europa',
  },
  {
    id: 4,
    titulo: 'Disney te espera',
    subtitulo: 'La experiencia mágica para toda la familia',
    precio: 'Desde USD 1.899',
    imagen: '/assets/images/promos/disney.jpg',
    destino: 'disney',
  },
  {
    id: 5,
    titulo: 'Cruceros de Lujo',
    subtitulo: 'Navigá por los mejores destinos del mundo',
    precio: 'Desde USD 2.199',
    imagen: '/assets/images/promos/crucero.jpg',
    destino: 'cruceros',
  },
] as const
