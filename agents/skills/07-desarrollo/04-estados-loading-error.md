---
name: estados-loading-error
description: Manejo de estados de carga, error, vacío y edge cases en toda la aplicación
category: desarrollo
tags: [loading, error, estados, edge-cases, ux]
---

# Manejo de Estados: Loading, Error, Vacío y Edge Cases

## Principios Generales
- **Cada componente debe manejar 4 estados**: loading, error, empty, success
- **Nunca asumir que los datos existen** (incluso si la query fue exitosa)
- **Loading states deben ser esqueletos** (no spinners genéricos)
- **Errores deben ser accionables** (botón reintentar, mensaje claro)

## Estados por Componente

### Wizard Steps
| Estado | UI |
|--------|----|
| Loading (submit) | Botón "Enviando..." + spinner, overlay semi-transparente |
| Error submit | Toast error + "Reintentar" en botón + datos preservados |
| Validación error | Campo en rojo + mensaje debajo + shake animación |
| Empty | Placeholder con ejemplo (textarea: "Ej: preferencias de hotel...") |

### Dashboard Admin
| Estado | UI |
|--------|----|
| Loading stats | Skeleton cards (5 cards animados pulse) |
| Loading charts | Skeleton rectángulo con pulse |
| Loading table | Skeleton rows (5-10 filas pulse) |
| Error stats | Card con icono alerta + "No pudimos cargar las métricas" + Reintentar |
| Error charts | Ícono de gráfico roto + "Error al cargar analytics" + Reintentar |
| Empty leads | Ilustración "Todavía no hay leads" + texto |
| Empty filters | "No se encontraron leads con esos filtros" + botón "Limpiar filtros" |

### Kanban
| Estado | UI |
|--------|----|
| Loading | Esqueletos de tarjetas en cada columna |
| Error | Toast + overlay de error en kanban |
| Empty column | "No hay leads en esta columna" con icono |
| Empty search | "Sin resultados para '[búsqueda]'" |

### ClientQuoteView
| Estado | UI |
|--------|----|
| Loading | Skeleton modal (header + body) |
| Error quote | "No encontramos esta cotización" + links útiles |
| Not found | "El presupuesto ya no está disponible" |
| No pricing | "El presupuesto aún está en preparación" |

### MeetingsBoard
| Estado | UI |
|--------|----|
| Loading | Skeleton grid de tarjetas |
| Error | Toast + "Error al cargar reuniones" |
| Empty day | "No hay reuniones para este día" + botón "Crear reunión" |
| Empty week/month | Similar, adaptado al período |

## Edge Cases Importantes
1. **Draft expirado** (>7 días): Toast "Tu borrador expiró" + reset automático
2. **Submit duplicado**: Deshabilitar botón después del primer click + loading
3. **Session expirada**: Redirigir a login + toast "Tu sesión expiró"
4. **Sin conexión**: Detectar `navigator.onLine`, mostrar indicador + datos cacheados
5. **Multi-tab**: Zustand persist sincroniza entre tabs (`storageEventListener`)
6. **Mobile keyboard**: Scroll automático a input activo
7. **Redirects SPA**: `_redirects` file para Netlify (evitar 404 en refresh)
