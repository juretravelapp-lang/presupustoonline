# Travel Jure - Presupuestador Online Premium
## Plan Maestro del Proyecto

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Framework | React | 19 | UI Library |
| Build Tool | Vite | 6 | Bundler ultrarrápido |
| Lenguaje | TypeScript | 5.7 | Type safety |
| Estilos | Tailwind CSS | 4 | Mobile-first responsive |
| Formularios | React Hook Form | 8 | Validación por paso, zero re-renders |
| Validación | Zod | 4 | Schemas TypeScript-first |
| Estado Global | Zustand | 5 | Wizard state management |
| Animaciones | Motion (Framer Motion) | 12 | Transiciones premium |
| UI Components | shadcn/ui | latest | Componentes accesibles |
| Base de Datos | Supabase | latest | PostgreSQL + Auth + RLS |
| Hosting | Netlify | - | Deploy estático + Functions |
| Control Versiones | GitHub | - | Repositorio + CI/CD |
| WhatsApp | wa.me | - | Enlace directo sin API |

---

## 2. Estructura de Carpetas

```
travel-jure-presupuesto/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── promos/              # Imágenes del carrusel
│   │   │   ├── destinations/        # Imágenes de destinos
│   │   │   ├── icons/               # Iconos personalizados
│   │   │   └── logo/                # Logo y variaciones
│   │   └── fonts/                   # Fuentes premium
│   └── robots.txt
│
├── src/
│   ├── app/                         # App Router (si usamos React puro,carpeta components)
│   │   ├── App.tsx                  # Componente raíz
│   │   └── main.tsx                 # Entry point
│   │
│   ├── components/
│   │   ├── ui/                      # Componentes base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Navbar principal
│   │   │   ├── Footer.tsx           # Footer con info legal
│   │   │   └── Layout.tsx           # Layout wrapper
│   │   │
│   │   ├── banner/
│   │   │   ├── PromoCarousel.tsx    # Carrusel infinito principal
│   │   │   ├── PromoSlide.tsx       # Slide individual
│   │   │   └── PromoIndicators.tsx  # Indicadores del carrusel
│   │   │
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx      # Contenedor principal del wizard
│   │   │   ├── ProgressBar.tsx      # Barra de progreso animada
│   │   │   ├── StepWrapper.tsx      # Animación de transición entre pasos
│   │   │   ├── StepNavigation.tsx   # Botones Anterior/Siguiente
│   │   │   └── steps/
│   │   │       ├── Step1PersonalInfo.tsx    # Datos personales
│   │   │       ├── Step2Origin.tsx          # Origen del viaje
│   │   │       ├── Step3Destination.tsx     # Destino
│   │   │       ├── Step4Dates.tsx           # Fechas
│   │   │       ├── Step5Passengers.tsx      # Pasajeros
│   │   │       ├── Step6Preferences.tsx     # Preferencias
│   │   │       ├── Step7Comments.tsx        # Comentarios
│   │   │       └── Step8Summary.tsx         # Resumen y envío
│   │   │
│   │   ├── social-proof/
│   │   │   ├── TestimonialCarousel.tsx  # Testimonios
│   │   │   ├── StatsCounter.tsx         # Contadores de viajeros
│   │   │   └── TrustBadges.tsx          # Sellos de confianza
│   │   │
│   │   ├── success-modal/
│   │   │   └── SuccessModal.tsx         # Modal de éxito con confetti
│   │   │
│   │   └── admin/
│   │       ├── Dashboard.tsx            # Panel principal
│   │       ├── LeadsTable.tsx           # Tabla de leads
│   │       ├── LeadDetail.tsx           # Detalle de lead
│   │       ├── FiltersPanel.tsx         # Filtros de búsqueda
│   │       └── ExportButtons.tsx        # Exportar Excel/PDF
│   │
│   ├── hooks/
│   │   ├── useWizardForm.ts        # Hook principal del wizard
│   │   ├── useAutoSaveDraft.ts     # Auto-guardado en localStorage
│   │   ├── useSupabase.ts          # Conexión Supabase
│   │   ├── useWhatsApp.ts          # Generar mensaje WhatsApp
│   │   ├── useAnalytics.ts         # Eventos de tracking
│   │   └── useMediaQuery.ts        # Responsive breakpoints
│   │
│   ├── stores/
│   │   ├── wizardStore.ts          # Estado del wizard (Zustand)
│   │   └── uiStore.ts              # Estado de UI (modals, etc.)
│   │
│   ├── schemas/
│   │   ├── step1-personal.ts       # Zod schema paso 1
│   │   ├── step2-origin.ts         # Zod schema paso 2
│   │   ├── step3-destination.ts    # Zod schema paso 3
│   │   ├── step4-dates.ts          # Zod schema paso 4
│   │   ├── step5-passengers.ts     # Zod schema paso 5
│   │   ├── step6-preferences.ts    # Zod schema paso 6
│   │   ├── step7-comments.ts       # Zod schema paso 7
│   │   └── index.ts                # Export combinado
│   │
│   ├── lib/
│   │   ├── supabase.ts             # Cliente Supabase
│   │   ├── constants.ts            # Constantes (destinos, ciudades, etc.)
│   │   ├── whatsapp.ts             # Helper para generar links wa.me
│   │   ├── instagram.ts            # Helper para Instagram
│   │   ├── analytics.ts            # Eventos GA4 / Meta Pixel
│   │   └── utils.ts                # Utilidades generales
│   │
│   ├── types/
│   │   ├── wizard.ts               # Tipos del wizard
│   │   ├── quote.ts                # Tipos de presupuesto
│   │   └── admin.ts                # Tipos del admin
│   │
│   └── styles/
│       └── globals.css             # Estilos globales + Tailwind
│
├── supabase/
│   ├── migrations/
│   │   └── 001_create_tables.sql   # Migración inicial
│   └── seed.sql                    # Datos de prueba
│
├── .env.local                      # Variables de entorno
├── .env.example                    # Template de envs
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── netlify.toml                    # Configuración Netlify
├── README.md
└── PLAN.md                         # Este archivo
```

---

## 3. Base de Datos Supabase

### 3.1 Tabla Principal: `travel_quotes`

```sql
CREATE TABLE travel_quotes (
  -- Identificación
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Datos personales (Paso 1)
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT NOT NULL,
  email TEXT NOT NULL,
  celular TEXT NOT NULL,
  
  -- Origen (Paso 2)
  ciudad_salida TEXT NOT NULL,
  aeropuerto_salida TEXT,
  
  -- Destino (Paso 3)
  destino TEXT NOT NULL,
  destino_personalizado TEXT,
  
  -- Fechas (Paso 4)
  tipo_fecha TEXT NOT NULL CHECK (tipo_fecha IN ('exacta', 'flexible', 'mes')),
  fecha_salida DATE,
  fecha_regreso DATE,
  rango_fecha_inicio DATE,
  rango_fecha_fin DATE,
  mes_preferido TEXT,
  
  -- Pasajeros (Paso 5)
  adultos INTEGER NOT NULL DEFAULT 1 CHECK (adultos > 0),
  ninos_2_12 INTEGER DEFAULT 0 CHECK (ninos_2_12 >= 0),
  bebes_0_2 INTEGER DEFAULT 0 CHECK (bebes_0_2 >= 0),
  
  -- Preferencias (Paso 6)
  preferencias JSONB DEFAULT '[]'::jsonb,
  
  -- Comentarios (Paso 7)
  comentarios TEXT,
  
  -- Metadata
  ip_address TEXT,
  origen_consulta TEXT DEFAULT 'web',
  estado TEXT DEFAULT 'nuevo' CHECK (estado IN (
    'nuevo', 'contactado', 'cotizado', 'reservado', 'cancelado'
  )),
  
  -- WhatsApp
  whatsapp_enviado BOOLEAN DEFAULT FALSE,
  whatsapp_mensaje TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_travel_quotes_estado ON travel_quotes(estado);
CREATE INDEX idx_travel_quotes_created_at ON travel_quotes(created_at DESC);
CREATE INDEX idx_travel_quotes_email ON travel_quotes(email);
CREATE INDEX idx_travel_quotes_destino ON travel_quotes(destino);

-- RLS (Row Level Security)
ALTER TABLE travel_quotes ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (solo admin autenticado)
CREATE POLICY "Admin can view all quotes" ON travel_quotes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserción anónima (cualquiera puede enviar)
CREATE POLICY "Anyone can insert quotes" ON travel_quotes
  FOR INSERT WITH CHECK (true);

-- Política para actualización solo admin
CREATE POLICY "Admin can update quotes" ON travel_quotes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON travel_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 3.2 Tabla de Analytics (opcional)

```sql
CREATE TABLE quote_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES travel_quotes(id),
  event_type TEXT NOT NULL, -- 'step_started', 'step_completed', 'form_abandoned'
  step_number INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Flujo del Wizard - Diseño UX/UI

### 4.1 Banner Superior (Carrusel)

```
┌──────────────────────────────────────────────────────────┐
│  ←  [SLIDE 1: Brasil]  Imagen parallax  →              │
│  ┌──────────────────────────────────────┐                │
│  │  "Descubrí Brasil"                   │                │
│  │  "Paquetes desde USD 1.299"          │                │
│  │  [Solicitar Presupuesto]             │                │
│  └──────────────────────────────────────┘                │
│  ● ○ ○ ○ ○  (indicadores)                               │
└──────────────────────────────────────────────────────────┘
```

**Características:**
- Autoplay cada 5 segundos
- Transición slide con efecto parallax
- Flechas de navegación en desktop
- Swipe en mobile
- Lazy loading de imágenes

### 4.2 Wizard - 8 Pasos

#### BARRA DE PROGRESO (siempre visible)
```
┌──────────────────────────────────────────────────────────┐
│  ●──────●──────●──────●──────●──────●──────●──────○      │
│  1      2      3      4      5      6      7      8     │
│  Datos  Origen Destino Fechas Pasaj. Prefer. Coment. Res │
└──────────────────────────────────────────────────────────┘
```

#### PASO 1: Datos Personales
```
┌──────────────────────────────────────────────────────────┐
│  📋 Datos Personales                                     │
│                                                          │
│  Nombre        [________________]  ✓                     │
│  Apellido      [________________]  ✓                     │
│  DNI           [________________]  ✓                     │
│  Email         [________________]  ✓                     │
│  Celular       [________________]  ✓                     │
│                                                          │
│  Validaciones en tiempo real con feedback visual          │
│                                                          │
│                          [Siguiente →]                   │
└──────────────────────────────────────────────────────────┘
```

#### PASO 2: Origen del Viaje
```
┌──────────────────────────────────────────────────────────┐
│  🛫 ¿De dónde salís?                                     │
│                                                          │
│  Ciudad de salida:                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │Tucumán│ │Buenos │ │Córdoba│ │Salta │                    │
│  │  ✓   │ │Aires │ │      │ │      │                    │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
│  ┌──────┐ ┌──────────┐                                   │
│  │Rosario│ │Otra...   │                                   │
│  └──────┘ └──────────┘                                   │
│                                                          │
│  Aeropuerto de salida (opcional):                        │
│  [________________________________]                      │
│                                                          │
│  [← Anterior]              [Siguiente →]                 │
└──────────────────────────────────────────────────────────┘
```

#### PASO 3: Destino
```
┌──────────────────────────────────────────────────────────┐
│  🌎 ¿A dónde viajás?                                     │
│                                                          │
│  Buscar destino:                                         │
│  [🔍 Escribí tu destino...              ]                │
│                                                          │
│  Destinos populares:                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │  🇧🇷    │ │  🏝️    │ │  🇪🇺    │ │  🇺🇸    │        │
│  │ Brasil  │ │ Caribe  │ │ Europa  │ │ EEUU    │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │  🇲🇽    │ │  🇵🇷    │ │  🚢    │ │  ✏️    │        │
│  │ México  │ │Punta    │ │Crucero  │ │Otro     │        │
│  │         │ │ Cana    │ │         │ │         │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│                                                          │
│  Destinos seleccionados:                                 │
│  [Brasil ×] [Caribe ×]                                  │
│                                                          │
│  [← Anterior]              [Siguiente →]                 │
└──────────────────────────────────────────────────────────┘
```

#### PASO 4: Fechas
```
┌──────────────────────────────────────────────────────────┐
│  📅 ¿Cuándo viajás?                                      │
│                                                          │
│  Tipo de fecha:                                          │
│  ○ Fecha exacta                                          │
│  ○ Fechas flexibles                                      │
│  ○ Mes flexible                                          │
│                                                          │
│  ── Si selecciona "Fecha exacta" ──                      │
│  Fecha de salida:  [📅 Seleccionar fecha]                │
│  Fecha de regreso: [📅 Seleccionar fecha]                │
│                                                          │
│  ── Si selecciona "Fechas flexibles" ──                  │
│  Desde: [📅]  Hasta: [📅]                                │
│                                                          │
│  ── Si selecciona "Mes flexible" ──                      │
│  Seleccioná el mes: [Dropdown de meses]                  │
│                                                          │
│  [← Anterior]              [Siguiente →]                 │
└──────────────────────────────────────────────────────────┘
```

#### PASO 5: Pasajeros
```
┌──────────────────────────────────────────────────────────┐
│  👥 ¿Cuántos viajan?                                     │
│                                                          │
│  Adultos (+12 años)                                      │
│  [ - ]  [ 2 ]  [ + ]                                    │
│                                                          │
│  Niños (2 a 12 años)                                     │
│  [ - ]  [ 1 ]  [ + ]                                    │
│                                                          │
│  Bebés (0 a 2 años)                                      │
│  [ - ]  [ 0 ]  [ + ]                                    │
│                                                          │
│  ┌────────────────────────────────────┐                  │
│  │  📊 Resumen: 2 Adultos, 1 Niño    │                  │
│  │  Total: 3 pasajeros                │                  │
│  └────────────────────────────────────┘                  │
│                                                          │
│  [← Anterior]              [Siguiente →]                 │
└──────────────────────────────────────────────────────────┘
```

#### PASO 6: Preferencias
```
┌──────────────────────────────────────────────────────────┐
│  ✨ ¿Qué te gustaría incluir?                            │
│                                                          │
│  Servicios:                                              │
│  ☑ Solo vuelos                                           │
│  ☑ Vuelo + Hotel                                         │
│  ☐ All Inclusive                                         │
│  ☐ Crucero                                               │
│  ☐ Asistencia al viajero                                 │
│  ☐ Traslados                                             │
│  ☐ Excursiones                                           │
│                                                          │
│  [← Anterior]              [Siguiente →]                 │
└──────────────────────────────────────────────────────────┘
```

#### PASO 7: Comentarios
```
┌──────────────────────────────────────────────────────────┐
│  💬 Comentarios adicionales                              │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │ Cuéntanos cualquier detalle importante para  │        │
│  │ preparar la mejor propuesta para vos.         │        │
│  │                                               │        │
│  │ Por ejemplo: preferencias de hotel,           │        │
│  │ actividades que te gustaría hacer,            │        │
│  │ celebraciones especial, etc.                  │        │
│  │                                               │        │
│  │                                               │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  [← Anterior]              [Siguiente →]                 │
└──────────────────────────────────────────────────────────┘
```

#### PASO 8: Resumen
```
┌──────────────────────────────────────────────────────────┐
│  📋 Resumen de tu solicitud                              │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │ 👤 Datos Personales                          │        │
│  │ Juan Pérez | DNI: 12345678                   │        │
│  │ juan@email.com | +54 9 381 123-4567          │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │ ✈️ Viaje                                     │        │
│  │ Origen: Tucumán                              │        │
│  │ Destino: Brasil, Caribe                      │        │
│  │ Fechas: 15/03 - 25/03/2026                   │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │ 👥 Pasajeros: 2 Adultos, 1 Niño              │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  ┌──────────────────────────────────────────────┐        │
│  │ ✨ Servicios: Vuelo + Hotel, Traslados       │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│  ☑ "Más de 1.000 viajeros asesorados"                   │
│  ☑ "Recibirás atención personalizada"                   │
│  ☑ "Sin compromiso"                                     │
│                                                          │
│  [← Anterior]     [📤 Enviar Solicitud]                  │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Integración WhatsApp (wa.me)

### Generación de Mensaje

```typescript
// lib/whatsapp.ts
const WHATSAPP_NUMBER = '5493812061066';

export function generateWhatsAppMessage(quote: QuoteFormData): string {
  const mensaje = `
*NUEVA SOLICITUD DE VIAJE*
━━━━━━━━━━━━━━━━━━━━

👤 *DATOS PERSONALES*
• Nombre: ${quote.nombre} ${quote.apellido}
• DNI: ${quote.dni}
• Email: ${quote.email}
• Celular: ${quote.celular}

✈️ *VIAJE*
• Origen: ${quote.ciudad_salida}
• Destino: ${quote.destino}
• Tipo de fecha: ${quote.tipo_fecha}
• Salida: ${quote.fecha_salida || 'Flexible'}
• Regreso: ${quote.fecha_regreso || 'Flexible'}

👥 *PASAJEROS*
• Adultos: ${quote.adultos}
• Niños 2-12: ${quote.ninos_2_12}
• Bebés 0-2: ${quote.bebes_0_2}

✨ *SERVICIOS*
${quote.preferencias.map(p => `• ${p}`).join('\n')}

💬 *COMENTARIOS*
${quote.comentarios || 'Sin comentarios'}

📅 Fecha de solicitud: ${new Date().toLocaleDateString('es-AR')}
━━━━━━━━━━━━━━━━━━━━`;

  return encodeURIComponent(mensaje);
}

export function getWhatsAppLink(quote: QuoteFormData): string {
  const mensaje = generateWhatsAppMessage(quote);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`;
}
```

### Auto-envío después de submit

```typescript
// Después de guardar en Supabase, redirigir a WhatsApp
const whatsappLink = getWhatsAppLink(formData);
window.open(whatsappLink, '_blank');
```

---

## 6. Psicología de Ventas - Elementos Visuales

### Ubicación estratégica de mensajes

| Ubicación | Mensaje | Elemento |
|-----------|---------|----------|
| Debajo del banner | "Más de 1.000 viajeros asesorados" | Contador animado |
| Paso 1 | "Tu información está segura" | Badge de seguridad |
| Paso 3 | "Los destinos más pedidos" | Badge de popularidad |
| Paso 6 | "Las mejores tarifas suelen agotarse rápido" | Urgencia sutil |
| Paso 8 | "Un asesor especializado preparará tu propuesta" | Autoridad |
| Modal éxito | "Sin compromiso" | Confianza |

### Colores y Tipografía

```
Primario:    #1E3A5F (azul oscuro premium)
Secundario:  #C9A96E (dorado elegante)
Acento:      #2E7D32 (verde éxito)
Error:       #D32F2F
Background:  #F8FAFC (gris ultra claro)
Texto:       #1E293B (casi negro)
```

**Fuentes:**
- Títulos: Playfair Display (elegancia)
- Cuerpo: Inter (legibilidad)

---

## 7. Panel Administrador (Dashboard)

### Vistas

```
┌──────────────────────────────────────────────────────────┐
│  🏠 Dashboard Travel Jure                                │
│                                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │  47  │ │  12  │ │   8  │ │   3  │                    │
│  │Nuevos│ │Cotiz.│ │Reserv│ │Cancel│                    │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
│                                                          │
│  Filtros: [Estado▼] [Fecha▼] [Destino▼] [Buscar...]    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Nombre    │ Destino │ Fecha    │ Estado  │ Acción│    │
│  │───────────│─────────│──────────│─────────│───────│    │
│  │ Juan Pérez│ Brasil  │ 15/03    │ Nuevo   │ Ver   │    │
│  │ María López│ Europa │ 20/04    │ Cotizado│ Ver   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [📊 Exportar Excel] [📄 Exportar PDF]                    │
└──────────────────────────────────────────────────────────┘
```

### Funcionalidades

- **Búsqueda avanzada** por nombre, email, DNI, destino
- **Filtros** por estado, rango de fechas, destino
- **Exportar** a Excel (SheetJS) y PDF (jsPDF)
- **Detalle de lead** con timeline de estados
- **CRM básico** con cambio de estado y notas

---

## 8. SEO y Performance

### SEO On-Page

```html
<title>Presupuesto de Viajes Online | Travel Jure</title>
<meta name="description" content="Solicitá tu presupuesto de viaje personalizado. 
  Los mejores destinos: Brasil, Caribe, Europa, Estados Unidos. 
  Atención personalizada y las mejores tarifas." />

<!-- Open Graph -->
<meta property="og:title" content="Travel Jure - Presupuesto de Viajes" />
<meta property="og:description" content="Creá tu viaje ideal en minutos" />
<meta property="og:image" content="/assets/images/og-image.jpg" />

<!-- Schema.org -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Travel Jure",
  "description": "Agencia de viajes premium",
  "url": "https://traveljure.com"
}
</script>
```

### Performance

- Lazy loading de imágenes del carrusel
- Code splitting por rutas
- Optimización de fuentes (font-display: swap)
- Compresión de imágenes (WebP)
- Minimización de JS/CSS
- Cache headers en Netlify

---

## 9. Fases de Desarrollo

### FASE 1: Fundamentos (Semana 1)
- [ ] Inicializar proyecto React + Vite + TypeScript
- [ ] Configurar Tailwind CSS + shadcn/ui
- [ ] Configurar Supabase (proyecto + tablas)
- [ ] Estructura de carpetas
- [ ] Tipos TypeScript

### FASE 2: Wizard Core (Semana 2)
- [ ] WizardShell + ProgressBar
- [ ] StepWrapper con animaciones
- [ ] Paso 1-4 (datos personales, origen, destino, fechas)
- [ ] Validación Zod por paso
- [ ] Auto-save en localStorage

### FASE 3: Wizard Completo (Semana 3)
- [ ] Paso 5-8 (pasajeros, preferencias, comentarios, resumen)
- [ ] Integración Supabase (submit)
- [ ] Generación de mensaje WhatsApp
- [ ] Modal de éxito con animaciones

### FASE 4: Landing Page (Semana 3)
- [ ] Header + Footer
- [ ] Banner carrusel infinito
- [ ] Social proof (testimonios, contadores)
- [ ] Trust badges

### FASE 5: Admin Panel (Semana 4)
- [ ] Dashboard con métricas
- [ ] Tabla de leads con filtros
- [ ] Detalle de lead
- [ ] Exportar Excel/PDF

### FASE 6: Optimización (Semana 4)
- [ ] SEO on-page
- [ ] Performance optimization
- [ ] Responsive testing
- [ ] Deploy en Netlify

---

## 10. Configuración Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 11. Variables de Entorno

```env
# .env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_WHATSAPP_NUMBER=5493812061066
VITE_INSTAGRAM_URL=https://www.instagram.com/traveljure
VITE_GA_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=XXXXXXXXX
```

---

## 12. Dependencias Principales

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.49.0",
    "react-hook-form": "^8.0.0",
    "@hookform/resolvers": "^4.0.0",
    "zod": "^4.0.0",
    "zustand": "^5.0.0",
    "motion": "^12.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-checkbox": "^1.0.0",
    "@radix-ui/react-radio-group": "^1.0.0",
    "lucide-react": "^0.400.0",
    "date-fns": "^4.0.0",
    "react-datepicker": "^7.0.0",
    "xlsx": "^0.18.0",
    "jspdf": "^2.5.0",
    "html2canvas": "^1.4.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```
