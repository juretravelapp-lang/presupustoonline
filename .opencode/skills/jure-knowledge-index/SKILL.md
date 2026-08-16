---
name: jure-knowledge-index
description: Puente al repositorio de conocimiento de negocio de Travel Jure en agents/skills/. Usar cuando el trabajo toque dominio de agencia de viajes, copywriting, ventas, diseño, marketing, SEO, CRM u operaciones turísticas.
---

# Índice de Conocimiento Travel Jure

El repo contiene knowledge-packs de dominio de negocio en `agents/skills/`. NO son skills registradas, son documentos de conocimiento. Consultar el pack relevante ANTES de proponer mejoras de producto o contenido.

## Categorías (ver `agents/skills/00-index.md`)

| Carpeta | Contenido |
|---------|-----------|
| `01-negocio-viajes/` | destinos-tipos-viaje, proceso-cotizacion, proveedores-mayoristas, estacionalidad |
| `02-ventas-conversion/` | psicologia-ventas, copywriting-wizard, whatsapp-sales-funnel, CRO |
| `03-ux-ui/` | wizard-ux, admin-dashboard-ux, landing-ux, animaciones |
| `04-diseno-grafico/` | branding, imagenes-promos, pdf-cotizacion, redes-sociales |
| `05-marketing-seo/` | seo-travel, ads, email-marketing, analytics-eventos |
| `06-crm-operaciones/` | flujo-trabajo-asesor, meetings, pricing-calculator, kanban |
| `07-desarrollo/` | stack, componentes, supabase-schema, estados-loading-error |
| `09-contenido-copy/` | contenido-destinos, preguntas-frecuentes |
| `10-calidad-seguridad/` | performance-lighthouse, seguridad-datos |

## Uso

Ante una mejora de producto, cargar primero `agents/skills/<categoria>/<archivo>.md` para alinear con la visión de negocio. Combinar con los skills técnicos (`jure-backend-supabase`, `jure-pricing-calculator`, `jure-factsheet`) para no colisionar con la arquitectura real.