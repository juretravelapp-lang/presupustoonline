---
name: admin-dashboard-ux
description: Diseño UX para paneles administrativos, tableros CRM y gestión de leads
category: ux-ui
tags: [admin, dashboard, crm, kanban, metrica, tablas]
---

# UX para Admin Dashboard CRM

## Estructura del Dashboard
Travel Jure tiene 4 vistas principales:

### 1. Métricas (Dashboard Principal)
- **Stats cards**: Total leads, nuevos, cotizados, concretados, cancelados
- **Gráficos**: Funnel de estados (Recharts), Top destinos (donut), Top meses (barra)
- **Tabla de leads**: Paginada (15 por página), con búsqueda y filtro por estado
- **Modal de detalle**: Al hacer clic en un lead

### 2. Kanban (Gestión visual)
- **6 columnas**: No Cotizado → En Cotización → Cotizado → Enviado Cliente → Concretado → Cancelado
- **Drag & drop**: Mover tarjetas entre columnas (@dnd-kit)
- **Tarjeta**: Nombre, destino(s), pasajeros, precio, indicador de reunión, operador
- **Búsqueda**: Filtro por texto en todas las columnas
- **Mobile**: Tabs en lugar de columnas (una columna a la vez)

### 3. Reuniones (Calendario)
- **Tres vistas**: Día (timeline horario), Semana (7 columnas), Mes (grilla)
- **Tarjeta de reunión**: Hora, título, cliente, tipo, estado
- **Quick stats**: Pendientes/Hoy/Canceladas
- **Modal CRUD**: Crear/editar/eliminar reuniones

### 4. Crear Solicitud (Wizard embebido)
- Mismo wizard que el público pero en contexto admin
- Para operadores que toman pedidos por teléfono

## Principios de UX para Admin CRM

### Información al Alcance
- Menos clicks = mejor (máximo 3 clicks para acción común)
- Tooltips en iconos (no asumir que se entienden)
- Acciones comunes visibles (no escondidas en menús)

### Feedback de Acciones
| Acción | Feedback |
|--------|----------|
| Mover kanban | Animación de transición + actualización automática |
| Guardar precio | "Cotización guardada" + badge "cotizado" |
| Crear reunión | Toast + redirección a vista de calendario |
| Eliminar lead | Confirmación "¿Estás seguro?" |
| Error API | Toast con mensaje claro + botón reintentar |

### Estados de Datos
| Estado | Qué mostrar |
|--------|-------------|
| Cargando | Skeleton cards (no spinner genérico) |
| Vacío | "Todavía no hay leads" + ilustración |
| Error | "No pudimos cargar los datos" + botón "Reintentar" |
| Sin resultados | "No se encontraron leads con esos filtros" |
| Offline | Indicador sutil + datos cacheados |

### Responsive Admin
- Sidebar colapsable en mobile (hamburger)
- Kanban → vista de lista en mobile
- Tablas con scroll horizontal en mobile
- Cards en lugar de filas en mobile

### Accesibilidad Admin
- Contraste suficiente en tablas
- Focus visible en todos los elementos
- Labels en todos los inputs
- Navegación por teclado en kanban
- Roles ARIA en drag & drop
