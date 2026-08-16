---
name: jure-admin-crm
description: Mapa del panel admin/CRM de Travel Jure: auth por email, vistas del dashboard, estados del kanban y tabs del detalle de cotización. Usar para tareas de CRM, kanban, dashboard, métricas, meetings o tablas admin.
---

# Panel Admin / CRM de Travel Jure

## Acceso
Ruta `/admin`. Si no hay sesión → `Login` (Supabase Auth email/password). Rol por email: `admin@juretravel.com` → admin (ve Métricas); resto → operador. Login de debug: `bypassLogin(role)` en `authStore`.

## Vistas (Dashboard, `AdminView`)
`metrics` (solo admin) · `kanban` · `meetings` · `operator_wizard` · `ttoo` · `servicios_cat` · `destinos_cat` · `vencimientos_ttoo` · `clientes` · `message_templates` · `message_generator` · `pagos`.

## Kanban y estados (ciclo de vida de travel_quotes)
`no_cotizado 📋 → en_cotizacion ⚙️ → cotizado 💰 → enviado_cliente 📨 → concretado ✅ | cancelado ❌`.
Cada movimiento debe registrar en `historial[]` (JSONB). Drag & drop con @dnd-kit; en mobile se apila vertical con agregados financieros.

## Detalle de cotización (QuoteDetailModal)
Tabs: `general | agenda | cotizacion | pagos | pricing`.
- `general`: datos del lead, notas_crm, operador, crear reunión.
- `agenda`: meetings del quote.
- `cotizacion`: `cotizacion_detalles` (pasajeros + observaciones) y `crm_quote_services`.
- `pagos`: `crm_pagos` (arrastre de vencimientos, cuotas).
- `pricing`: calculadora legada (`pricing_detalles`) + selección de proveedor.
PDF de cotización: `PDFDownloadLink → QuotePDF` (@react-pdf). Botón "Copiar Link" genera `${origin}/quote/<id>`.

## Otras vistas clave
- `MeetingsBoard` + `MeetingFormModal`: calendario día/semana/mes, colores por estado, default "JURE TRAVEL REUNION" 10:00–11:00.
- `PagosBoard`: filtros estado/moneda/range/fecha/search + sort; `money()` es-AR 2 decimales.
- `ClientesBoard`/`ClienteDetail`/`ClienteFormModal`: ficha cliente, relación pareja/familia/amigo/otro, pestañas datos|relaciones|viajes.
- `LeadsDataTable` (métricas): 15 filas/página, search (nombre/email/dni), filtro estado.
- `AnalyticsCharts`: funnel por estado + pie destinos (recharts).
- `MessageGenerator`: motor de plantillas (ver skill `jure-whatsapp-templates`).

## Nota
No existe export a Excel/CSV todavía (PLAN lo lista como pendiente).