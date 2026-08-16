---
name: jure-backend-supabase
description: Esquema autoritativo de Supabase de Travel Jure (14 migraciones), tablas, RLS, funciones y trampas de consistencia. Usar para cualquier tarea de base de datos, migración, RLS, seed o consulta SQL.
---

# Base de Datos Supabase de Travel Jure

Son 14 migraciones en `supabase/migrations/`. Orden: 001 create, 002 *desactiva RLS (anti-patrón, revertido en 008)*, 003 schema+seed, 004 CRM extensions, 005 meetings, 006 ticket, 007 ttoo/servicios, 008 RLS final+CHECK estados, 009 destinos, 010 templates, 011 clientes, 012 backfill clientes, 013 cotizacion_detalles+pagos, 014 quote_services.

## Tablas
- `travel_quotes` — lead/cotización central. `estado` **CHECK final**: `no_cotizado`, `en_cotizacion`, `cotizado`, `enviado_cliente`, `concretado`, `cancelado`. ⚠️ el DEFAULT de columna sigue siendo `'nuevo'` (de 001) e **invalida el CHECK**: los INSERT que omitan `estado` fallan.
- `crm_ttoo` (mayoristas), `crm_servicios` (tipos de servicio), `crm_destinos` (catálogo destinos, `activo`).
- `crm_meetings` (reuniones, estado `pendiente|realizada|cancelada|reprogramada`, tipo `presencial|videollamada|telefonica`).
- `clientes` + `clientes_relaciones` (tipo `pareja|familia|amigo|otro`).
- `crm_pagos` (ARS/USD, cuotas, forma_pago, estado `pendiente|pagado|cancelado`).
- `crm_quote_services` (servicios por cotización, estado `cotizado|reservado|confirmado|emitido|cancelado|finalizado`).
- `crm_message_templates` (plantillas, categoría `cotizacion|recibo_pago|confirmacion|recordatorio|factura`).

## JSONB clave en travel_quotes
- `destinos[]` (multi-destino), `preferencias[]`.
- `pricing_detalles`: `{moneda, markup_tipo (porcentaje|fijo), markup_valor, servicios[{id,tipo,ttoo,descripcion,costo,fecha_vto_ttoo,estado_pago}], proveedores[{nombre,hotel_costo,vuelos_costo,otros_costo,markup_aplicado,precio_final}], proveedor_seleccionado}`.
- `cotizacion_detalles`: `{observaciones, pasajeros[{nombre,apellido,dni,pasaporte,fecha_nacimiento,edad,observaciones,pedidos_especiales}]}`.
- `historial[]`: historial de cambios de estado.

## RLS (estado final, migración 008)
- `travel_quotes`: anon INSERT (form web) + anon SELECT por `ticket_id IS NOT NULL`; authenticated SELECT/UPDATE/DELETE.
- `crm_meetings`: anon SELECT solo si su quote tiene `ticket_id`; authenticated full.
- `clientes`/`clientes_relaciones`/`crm_destinos`(activos)/`crm_message_templates`(activos): authenticated full, anon select acotado.
- ⚠️ **Vulnerabilidades anon**: `crm_pagos` y `crm_quote_services` tienen `SELECT USING (true)` para anon → TODOS los registros son legibles públicamente.

## Funciones
- `get_dashboard_stats()` — RPC existe pero NO se usa (frontend hace counts con `head:true`).
- `get_cliente_viajes(p_cliente_id)` — usada por `getClientesViajes()` en `src/lib/supabase.ts:774`.
- `exec_sql` — usada por `scripts/migrate.js` pero NO está definida en ninguna migración (crearla a mano en SQL editor).

## Trampas de consistencia (verificar antes de tocar DB)
1. `scripts/migrate.js` solo migra hasta 003 (lista desactualizada) y requiere RPC `exec_sql`.
2. Seeds (003, seed.js, seed_ttoo.js) insertan estados legacy `nuevo/contactado/reservado` que **violan** el CHECK de 008.
3. `types/admin.ts` describe los estados viejos — desactualizado.
4. No hay separación admin/operador en RLS (todo `authenticated` es full CRUD; el rol es heurística de email en el cliente).