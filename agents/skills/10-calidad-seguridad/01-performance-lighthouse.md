---
name: performance-lighthouse
description: Optimización de performance, Core Web Vitals y auditoría Lighthouse para la app
category: calidad-seguridad
tags: [performance, lighthouse, core-web-vitals, optimizacion, velocidad]
---

# Performance y Core Web Vitals

## Métricas Objetivo (Lighthouse)
| Métrica | Objetivo | Estrategia |
|---------|----------|------------|
| LCP | < 2.5s | Lazy loading imágenes, preload crítico |
| FID | < 100ms | Chunks pequeños, evitar blocking JS |
| CLS | < 0.1 | Dimensiones fijas en imágenes, no layout shift |
| TBT | < 200ms | Code splitting, lazy routes |
| Performance Score | > 90 | Todas las anteriores |
| Accessibility | > 95 | ARIA labels, contraste, focus |
| Best Practices | > 90 | HTTPS, no console.log, safe dependencies |

## Optimizaciones Aplicadas

### Imágenes
- Formato WebP con fallback JPEG
- srcSet responsive (1920/1200/800px)
- Lazy loading nativo (`loading="lazy"`)
- Compresión con Sharp (scripts/optimize-images.js)
- Imágenes de banner: preload la primera, lazy las demás

### Código
- Code splitting por rutas (lazy load AdminPanel)
- Tree shaking con Vite (ESM nativo)
- Chunks separados: vendor, componentes pesados
- Lazy load Framer Motion en carrusel (no en bundle inicial)

### Fuentes
- `font-display: swap` (evitar FOIT/CLS)
- Subset de caracteres latinos (no cargar todo el set)
- Preconnect a Google Fonts

### CSS
- Tailwind CSS v4 con JIT (solo estilos usados)
- Purge CSS en build (sin estilos no utilizados)
- `@theme` tokens personalizados (sin valores duplicados)

## Auditoría Lighthouse
Se ejecuta con:
```bash
npm run audit:lighthouse
```
Resultados en `lighthouse-report.json`. Revisar periódicamente.

## Monitoreo
- RUM (Real User Monitoring) con GA4 Core Web Vitals
- Reportes semanales de Lighthouse CI
- Alertas si LCP > 3s o CLS > 0.25
