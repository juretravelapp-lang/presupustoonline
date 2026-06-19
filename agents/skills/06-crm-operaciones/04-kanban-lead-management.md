---
name: kanban-lead-management
description: Gestión visual de leads mediante Kanban, drag & drop y seguimiento de pipeline
category: crm-operaciones
tags: [kanban, pipeline, drag-drop, lead-management, estados]
---

# Gestión de Leads con Kanban

## Columnas del Kanban (Pipeline Travel Jure)
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ No       │ │ En       │ │ Cotizado │ │ Enviado  │ │Concretado│ │Cancelado │
│ Cotizado │ │Cotización│ │          │ │ Cliente  │ │          │ │          │
│          │ │          │ │          │ │          │ │          │ │          │
│ [Card 1] │ │ [Card 2] │ │ [Card 3] │ │ [Card 4] │ │ [Card 5] │ │ [Card 6] │
│ [Card 3] │ │          │ │          │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## Tarjeta de Lead (Kanban Card)
Cada tarjeta muestra:
- **Nombre**: Apellido, Nombre (formato: "Pérez, Juan")
- **Destinos**: Emoji + nombre ("🇧🇷 Brasil, 🏝️ Caribe")
- **Pasajeros**: "👥 2A + 1N" (adultos + niños)
- **Precio**: Si ya fue cotizado, muestra "$1.299 USD"
- **Reunión**: Si tiene reunión agendada, icono 📅 + hora
- **Operador**: Inicial del operador asignado
- **Antigüedad**: "Hace 2h" / "Ayer" (badge de tiempo)

## Acciones sobre la Tarjeta
| Acción | Cómo | Resultado |
|--------|------|-----------|
| Mover columna | Drag & drop o botones < > | Cambia estado |
| Ver detalle | Click en tarjeta | Abre QuoteDetailModal |
| WhatsApp | Icono 💬 | Abre conversación |
| Eliminar | Botón eliminar (confirmación) | Borra lead |
| Asignar operador | Dropdown en modal | Actualiza operador_nombre |

## Búsqueda y Filtros
- **Búsqueda por texto**: Nombre, email, destino (filtra en todas las columnas)
- **Mostrar sólo columna activa**: En mobile (tabs en lugar de columnas)
- **Total por columna**: "12 leads" badge en header de columna
- **Suma de precios**: Total cotizado por columna (header)

## Historial de Cambios
Cada cambio de estado se registra en `historial` (JSONB):
```json
[
  {
    "estado_anterior": "no_cotizado",
    "estado_nuevo": "en_cotizacion",
    "cambiado_por": "operador@email.com",
    "fecha": "2026-03-15T10:30:00Z"
  }
]
```

## Buenas Prácticas
- No dejar tarjetas en "No Cotizado" por más de 24h
- Mover a "En Cotización" cuando estás trabajando en el presupuesto
- Marcar "Cotizado" cuando envías la propuesta
- Si el cliente no responde en 7 días → mover a "Cancelado"
- Usar las notas CRM para registrar interacciones importantes
