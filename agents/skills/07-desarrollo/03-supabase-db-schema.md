---
name: supabase-db-schema
description: Esquema de base de datos Supabase, migraciones, tablas y políticas de seguridad
category: desarrollo
tags: [supabase, base-datos, esquema, migraciones, sql, rls]
---

# Esquema de Base de Datos Supabase

## Tabla: `travel_quotes`
Almacena todas las solicitudes de presupuesto.

### Columnas Principales
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | Identificador único |
| nombre | TEXT | Nombre del viajero |
| apellido | TEXT | Apellido |
| dni | TEXT | Documento |
| email | TEXT | Email |
| celular | TEXT | Teléfono |
| ciudad_salida | TEXT | Ciudad de origen |
| destino | TEXT | Destino principal (legacy) |
| destinos | JSONB | Multi-destino: ["Brasil","Caribe"] |
| tipo_fecha | TEXT | exacta, flexible, mes |
| fecha_salida | DATE | Fecha salida exacta |
| fecha_regreso | DATE | Fecha regreso exacta |
| adultos | INT | Cantidad adultos |
| ninos_2_12 | INT | Niños 2-12 años |
| bebes_0_2 | INT | Bebés 0-2 años |
| preferencias | JSONB | Array de servicios: ["vuelo+hotel","asistencia"] |
| tipo_viaje | TEXT | vacacional, luna_miel, familiar, etc. |
| comentarios | TEXT | Comentarios adicionales |
| estado | TEXT | Pipeline: no_cotizado → concretado |
| creador_email | TEXT | Email del operador que creó el lead |
| operador_nombre | TEXT | Nombre del operador asignado |
| pricing_detalles | JSONB | Precios de 4 proveedores + markup |
| historial | JSONB | Timeline de cambios de estado |
| notas_crm | TEXT | Notas internas del operador |
| reunion_fecha | TIMESTAMPTZ | Fecha de próxima reunión (legacy) |
| reunion_estado | TEXT | Estado de reunión (legacy) |
| whatsapp_enviado | BOOLEAN | Si se envió WhatsApp |
| created_at | TIMESTAMPTZ | Fecha de creación |
| updated_at | TIMESTAMPTZ | Fecha de última modificación |

### Índices
```sql
ON travel_quotes(estado)
ON travel_quotes(created_at DESC)
ON travel_quotes(email)
ON travel_quotes(destino)
ON travel_quotes(dni)
```

## Tabla: `crm_meetings`
Reuniones agendadas con clientes.

### Columnas
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID PK | Identificador |
| quote_id | UUID FK → travel_quotes | Lead asociado |
| titulo | TEXT | Título de la reunión |
| fecha_inicio | TIMESTAMPTZ | Fecha y hora inicio |
| fecha_fin | TIMESTAMPTZ | Fecha y hora fin |
| estado | TEXT | pendiente, confirmada, realizada, cancelada |
| tipo | TEXT | presencial, videollamada, telefonica |
| notas | TEXT | Notas de la reunión |
| creado_por | TEXT | Email del creador |

## Políticas RLS
- **SELECT**: Solo usuarios autenticados (admin/operador)
- **INSERT**: Público (cualquiera puede solicitar presupuesto)
- **UPDATE**: Solo usuarios autenticados
- **DELETE**: Solo usuarios autenticados

## Funciones RPC
- `get_dashboard_stats()` → Devuelve conteos por estado
- `get_advanced_analytics(date_range)` → Datos para charts

## Migraciones
| # | Archivo | Cambio |
|---|---------|--------|
| 001 | `create_tables.sql` | Tabla base + RLS + índices |
| 002 | `fix_rls.sql` | Debug RLS |
| 003 | `update_schema.sql` | Multi-destino, columnas opcionales |
| 004 | `crm_extensions.sql` | CRM columns, nuevo estados pipeline |
| 005 | `crm_meetings.sql` | Tabla meetings + migración datos legacy |
