---
name: landing-page-travel-ux
description: Diseño UX para landing pages de agencia de viajes, banners, carruseles y CTAs
category: ux-ui
tags: [landing-page, banner, carrusel, hero, cta, confianza]
---

# UX para Landing Page de Agencia de Viajes

## Estructura de la Landing (Travel Jure)

### 1. Hero Banner (Carrusel)
**Propósito**: Captar atención, inspirar, mostrar destinos

**Requisitos UX**:
- Autoplay cada 5-6 segundos (no más rápido, el usuario lee)
- Pausar al hacer hover (accesibilidad)
- Flechas de navegación en desktop
- Swipe en mobile
- CTA claro: "Solicitar Presupuesto" (scroll al wizard)
- Badge de precio: "Paquetes desde USD X" (ancla precio bajo)
- Imágenes: Alta calidad, formato WebP, lazy loading, srcSet responsive
- Texto legible sobre imagen (gradiente overlay 60% opacidad)

### 2. Barra de Confianza (Trust Bar)
- "Más de 1.000 viajeros asesorados" (contador animado)
- Logos de medios/pagos si aplican
- Calificación (stars) de Google Reviews
- Ubicación: justo debajo del banner, antes del wizard

### 3. Sección de Wizard (Principal CTA)
- El formulario multi-paso es el centro de la página
- Debe ser scrolleable inmediatamente después del banner
- Sin distracciones laterales en el wizard

### 4. Testimonios (Social Proof)
- Carrusel de testimonios reales con foto, nombre, destino
- "La experiencia de [nombre] en [destino]"
- Ubicación: después del wizard o como sección lateral

### 5. Footer
- Links legales (términos, privacidad, defensa consumidor)
- Redes sociales (Instagram, WhatsApp, Email)
- Contacto directo
- Mapa del sitio (destinos populares)
- Copyright y datos de la agencia

## Patrones de Confianza (Trust Signals)
| Elemento | Ubicación | Propósito |
|----------|-----------|-----------|
| Contador viajeros | Debajo banner | Prueba social |
| Badge seguridad 🔒 | Paso contacto | Privacidad datos |
| "Sin compromiso" | Resumen | Reducir riesgo |
| "Asesor especializado" | Resumen | Autoridad |
| Testimonios | Post-wizard | Social proof |
| WhatsApp visible | Header + Footer | Accesibilidad |

## Mobile UX
- Banner altura reducida (50vh max)
- CTA flotante visible al hacer scroll
- Wizard ocupa todo el ancho
- Footer simplificado (3-4 links principales)
- Navegación con gestos en carrusel
