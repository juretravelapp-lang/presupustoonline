---
name: meetings-scheduling
description: Gestión de reuniones con clientes, agendamiento y coordinación de citas
category: crm-operaciones
tags: [reuniones, calendario, citas, google-calendar, agenda]
---

# Gestión de Reuniones con Clientes

## Tipos de Reunión
| Tipo | Descripción | Duración |
|------|-------------|----------|
| Presencial | En oficina | 30-60 min |
| Videollamada | Zoom/Meet/WhatsApp | 20-40 min |
| Telefónica | Llamada | 10-20 min |

## Estados de Reunión
- **Pendiente**: Confirmada pero no ocurrió
- **Confirmada**: Cliente confirmó
- **Realizada**: Ocurrió con éxito
- **Cancelada**: No ocurrió
- **Reprogramada**: Se movió a otra fecha

## Flujo de Agendamiento

### 1. Propuesta por WhatsApp
- Asesor envía link de Google Calendar (generado automáticamente)
- Cliente elige horario disponible
- Se guarda en `crm_meetings`

### 2. Confirmación Automática
- El sistema crea la reunión en el calendario del asesor
- Envía recordatorio 24h antes por WhatsApp
- Envía recordatorio 1h antes

### 3. Post-Reunión
- El asesor marca la reunión como "Realizada"
- Actualiza estado del lead si corresponde
- Agrega notas de la reunión en CRM

## Vista de Calendario (MeetingsBoard)
- **Vista Día**: Timeline horario de 8-20h
- **Vista Semana**: 7 columnas con tarjetas
- **Vista Mes**: Grilla con indicador de reuniones por día
- **Quick stats**: "Pendientes: 3 | Hoy: 5 | Canceladas: 1"

## Integración Google Calendar
- Botón "Agregar a Google Calendar" en el modal de reunión
- Genera link con: título, fecha, hora, descripción, duración
- Parámetros: `action=TEMPLATE`, `text=`, `dates=`, `details=`
- El asesor puede copiar el link y enviarlo al cliente
