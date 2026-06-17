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
  { value: 'brasil',         label: 'Brasil',         emoji: '🌴', color: '#009739' },
  { value: 'caribe',         label: 'Caribe',         emoji: '🏝️', color: '#00B4D8' },
  { value: 'europa',         label: 'Europa',         emoji: '🏰', color: '#003399' },
  { value: 'estados_unidos', label: 'EEUU',           emoji: '🗽', color: '#B22234' },
  { value: 'mexico',         label: 'México',         emoji: '🌮', color: '#006847' },
  { value: 'punta_cana',     label: 'Punta Cana',     emoji: '🌊', color: '#CE1126' },
  { value: 'disney',         label: 'Disney',         emoji: '✨', color: '#1E3A5F' },
  { value: 'cruceros',       label: 'Cruceros',       emoji: '🚢', color: '#0077B6' },
  { value: 'otro',           label: 'Otro destino',   emoji: '🗺️', color: '#64748B' },
] as const

export const TIPOS_FECHA = [
  { value: 'exacta', label: 'Fecha exacta', description: 'Tengo fechas confirmadas' },
  { value: 'flexible', label: 'Fechas flexibles', description: 'Puedo variar unos días' },
  { value: 'mes', label: 'Mes flexible', description: 'Sé en qué mes viajo' },
] as const

export const PREFERENCIAS_SERVICIOS = [
  { value: 'solo_vuelos', label: 'Solo vuelos', icon: '✈️' },
  { value: 'vuelo_hotel', label: 'Vuelo + Hotel', icon: '🏨' },
  { value: 'all_inclusive', label: 'All Inclusive', icon: '🍽️' },
  { value: 'crucero', label: 'Crucero', icon: '🚢' },
  { value: 'asistencia_viajero', label: 'Asistencia al viajero', icon: '🛡️' },
  { value: 'traslados', label: 'Traslados', icon: '🚗' },
  { value: 'excursiones', label: 'Excursiones', icon: '🗺️' },
] as const

export const ESTADOS_LEAD = [
  { value: 'nuevo', label: 'Nuevo', color: '#3B82F6' },
  { value: 'contactado', label: 'Contactado', color: '#F59E0B' },
  { value: 'cotizado', label: 'Cotizado', color: '#8B5CF6' },
  { value: 'reservado', label: 'Reservado', color: '#10B981' },
  { value: 'cancelado', label: 'Cancelado', color: '#EF4444' },
] as const

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
