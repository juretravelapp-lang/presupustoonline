---
name: seo-travel
description: Optimización SEO para agencia de viajes, landing pages y presupuestador online
category: marketing-seo
tags: [seo, posicionamiento, google, palabras-clave, trafico-organico]
---

# SEO para Agencia de Viajes

## Estrategia de Palabras Clave

### Head Terms (Alto volumen, alta competencia)
- "presupuesto de viajes" / "cotizar viaje" / "paquetes turísticos"
- "agencia de viajes [ciudad]" / "viajes todo incluido"

### Long Tail (Menor volumen, alta intención)
- "presupuesto viaje a Brasil desde Tucumán"
- "paquete todo incluido Caribe desde Buenos Aires"
- "vuelo + hotel Porto de Galinhas precio"
- "viaje de egresados a Bariloche desde Salta"
- "luna de miel en Europa desde Argentina"

### Palabras Clave por Destino
- Brasil: "viaje a Brasil", "playas Brasil", "Porto de Galinhas", "Nordeste Brasil"
- Caribe: "Punta Cana todo incluido", "Cancún vuelo y hotel", "Riviera Maya"
- Europa: "viaje a Europa", "paquete Europa", "Eurotrip"
- Cruceros: "crucero por el Caribe", "crucero Mediterráneo"

## SEO On-Page

### Meta Tags
```html
<title>Presupuesto de Viajes Online | Travel Jure</title>
<meta name="description" content="Solicitá tu presupuesto de viaje personalizado.
Los mejores destinos: Brasil, Caribe, Europa. Atención personalizada." />
```

### Open Graph
```html
<meta property="og:title" content="Travel Jure - Presupuesto de Viajes" />
<meta property="og:description" content="Creá tu viaje ideal en minutos" />
<meta property="og:image" content="/assets/images/og-image.jpg" />
<meta property="og:type" content="website" />
```

### Schema.org (TravelAgency)
```json
{
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Travel Jure",
  "description": "Agencia de viajes premium",
  "url": "https://traveljure.com",
  "areaServed": ["Tucumán", "Argentina"],
  "priceRange": "$$"
}
```

### Estructura de Contenido
- H1: Título principal por página
- H2: Secciones del wizard (destinos, pasos)
- Imágenes con alt text descriptivo ("playa brasil porto de galinhas")
- Internal links a páginas de destinos

## SEO Técnico
- **SPA friendly**: Netlify redirects `/*` → `/index.html` (SSR no disponible)
- **Sitemap.xml**: Generado con rutas principales
- **Robots.txt**: Permitir todo, apuntar a sitemap
- **Canonical**: Cada página con su URL canónica
- **Performance**: Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Mobile first**: Diseño responsive

## SEO Local (Google My Business)
- Categoría: "Agencia de viajes"
- Ciudad: Tucumán, Argentina
- Reseñas de Google: Solicitar activamente
- Fotos: Oficina, equipo, destinos
- Post semanal en GMB
