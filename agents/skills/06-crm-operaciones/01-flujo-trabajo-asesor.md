---
name: flujo-trabajo-asesor
description: Flujo de trabajo diario del asesor de viajes, gestión de leads y priorización
category: crm-operaciones
tags: [operaciones, asesor, workflow, productividad, leads]
---

# Flujo de Trabajo del Asesor de Viajes

## Rutina Diaria
### Mañana (9-12h) - Alta Intención
1. Revisar leads nuevos de las últimas 12h
2. Responder consultas de WhatsApp pendientes
3. Priorizar leads en "En Cotización" (más antiguos primero)
4. Enviar cotizaciones pendientes

### Mediodía (12-15h) - Seguimiento
5. Contactar leads en "Cotizado" sin respuesta (24h+)
6. Llamadas telefónicas a leads calientes
7. Armar presupuestos nuevos

### Tarde (15-18h) - Cierres y Admin
8. Cerrar ventas (enviar voucher, coordinar pagos)
9. Actualizar estados en CRM
10. Registrar reuniones del día siguiente

## Priorización de Leads

### Matriz de Prioridad
| Alta intención | Baja intención |
|----------------|----------------|
| Contactó por WhatsApp | Solo email |
| Destino específico | "No sé todavía" |
| Fechas definidas | "Mes flexible" |
| 2+ pasajeros | Viajero solo |
| Multi-destino (más valor) | Destino único |
| Respondió seguimiento | No responde |

### Regla de Oro: Lead Caliente
**Lead caliente** = respondió en las últimas 24h + tiene destinos definidos + fechas claras
→ Contactar dentro de la primera hora

### SLA por Estado
| Estado | Tiempo Máximo | Acción |
|--------|---------------|--------|
| No cotizado | 4h laborales | Primer contacto |
| En cotización | 24h | Armar presupuesto |
| Cotizado | 48h para follow-up | Enviar y hacer seguimiento |
| Sin respuesta | 72h lead frío | Último intento |

## Atribución de Operador
- Cada lead se asigna al operador que lo contacta primero
- El campo `operador_nombre` se guarda en la DB
- El operador se muestra en la tarjeta del Kanban
- Dashboard filtra por operador (visibilidad individual)
