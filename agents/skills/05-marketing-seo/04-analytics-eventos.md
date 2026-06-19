---
name: analytics-eventos
description: Estrategia de analytics y tracking de eventos para conversiones en presupuestador de viajes
category: marketing-seo
tags: [analytics, eventos, tracking, ga4, conversion, datos]
---

# Analytics y Tracking de Eventos

## Eventos a Trackear (GA4 / Meta Pixel)

### Eventos del Wizard
| Evento | Parámetros | Propósito |
|--------|------------|-----------|
| `wizard_started` | `destino: string` | Inicio del funnel |
| `wizard_step_completed` | `step: number, name: string` | Embudo por paso |
| `wizard_step_abandoned` | `step: number, time_spent: number` | Punto de abandono |
| `wizard_destination_selected` | `destination: string[], count: number` | Preferencias destino |
| `wizard_date_selected` | `type: 'exact'/'flexible', range: string` | Temporalidad |
| `wizard_passenger_count` | `adults, children, babies, total` | Perfil viajero |
| `wizard_preferences` | `services: string[]` | Productos de interés |
| `wizard_submitted` | `id: uuid, destino, total_destinos` | **Conversión principal** |

### Eventos de Landing
| Evento | Parámetros | Propósito |
|--------|------------|-----------|
| `banner_slide_viewed` | `slide_index, destino` | Engagement carrusel |
| `banner_cta_clicked` | `slide_index, destino` | CTA banner efectividad |
| `whatsapp_clicked` | `location: 'header'/'footer'/'modal'` | Canal preferido |
| `instagram_clicked` | `-` | Social traffic |

### Eventos de Admin
| Evento | Parámetros | Propósito |
|--------|------------|-----------|
| `admin_login` | `role: 'admin'/'operador'` | Uso del sistema |
| `lead_status_changed` | `from, to, lead_id` | Pipeline velocity |
| `quote_priced` | `lead_id, total, provider` | Pricing actividad |
| `meeting_created` | `type, lead_id` | CRM engagement |
| `quote_pdf_downloaded` | `lead_id` | Documentación |

### Eventos de Conversión (Meta Pixel)
| Evento Estándar | Cuándo |
|-----------------|--------|
| `Lead` | Submit del wizard (conversión principal) |
| `ViewContent` | Ver paso 1 del wizard |
| `AddToCart` | Seleccionar preferencias (paso 4) |
| `InitiateCheckout` | Llegar a paso 5 (contacto) |
| `Purchase` | Lead marcado como "concretado" en admin |
| `Contact` | Click en WhatsApp |

## Dashboard de Métricas (Admin)

### KPIs Principales
| Métrica | Cálculo | Refresco |
|---------|---------|----------|
| Leads totales | COUNT(id) | 30s |
| Leads por estado | GROUP BY estado | 30s |
| Leads hoy | COUNT(created_at = today) | 30s |
| Tasa conversión | concretados / total | Diario |
| Reuniones hoy | COUNT(fecha = today) | 30s |
| Tiempo promedio en pipeline | AVG(concretado_at - created_at) | Diario |

### Reportes Avanzados (AnalyticsCharts)
- **Funnel de estados**: Leads en cada etapa del pipeline (bar chart)
- **Top destinos**: Destinos más solicitados (donut chart)
- **Top meses**: Meses de viaje más elegidos (bar chart)
- **Tendencia temporal**: Leads por día/semana/mes (line chart)
