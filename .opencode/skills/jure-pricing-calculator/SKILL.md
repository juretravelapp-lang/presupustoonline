---
name: jure-pricing-calculator
description: Modelo de precios y cotización de Travel Jure: pricing_detalles (proveedores/markup), crm_quote_services y cotizacion_detalles (pasajeros). Usar para tareas de calculadora de precios, márgenes, vencimientos TTOO o cotización detallada.
---

# Calculadora de Precios y Cotización

## 1. Pricing legado (JSONB `travel_quotes.pricing_detalles`)

- Hasta **4 proveedores** mayoristas por cotización. Por cada uno: `nombre`, `hotel_costo`, `vuelos_costo`, `otros_costo`.
- Subtotal = hotel + vuelos + otros. `markup_tipo` = `porcentaje` | `fijo`; `markup_valor` = % o monto.
- `margen_monto` = subtotal * (markup/100) o markup_valor; `precio_final` = subtotal + margen.
- `proveedor_seleccionado` define qué precio ve el cliente (`ClientQuoteView`).
- Servicios de pricing: `{id, tipo, ttoo, descripcion, costo, fecha_vto_ttoo, estado_pago}`. `TTOOVencimientosBoard` agrega por `fecha_vto_ttoo` (USD/ARS) para controlar pagos a mayoristas.
- Guardar pricing normalmente avanza el estado a `cotizado`.

## 2. Servicios por cotización (tabla nueva `crm_quote_services`)

Arquitectura nueva, una fila por servicio: `nombre`, `proveedor`, `precio_total`, `moneda` (ARS/USD), `fecha_desde/hasta`, `estado` (`cotizado|reservado|confirmado|emitido|cancelado|finalizado`), `detalles_operativos` JSONB (esquemas de vuelo/hotel/alquiler en `src/lib/supabase.ts`). Editado en `QuoteBuilderTab` / `QuoteServiceEditor`; pagos por servicio via `crm_pagos.quote_service_id`.

## 3. Detalle de pasajeros (JSONB `travel_quotes.cotizacion_detalles`)

`{observaciones, pasajeros[{nombre,apellido,dni,pasaporte,fecha_nacimiento,edad,observaciones,pedidos_especiales}]}` — editado en `QuoteCotizacionTab`.

## Reglas

- Coherencia monetaria: no mezclar ARS/USD sin indicar ambas en `crm_pagos`.
- Al cambiar precios, comparar con proveedores alternativos antes de elegir `proveedor_seleccionado`.
- Las cuotas (`es_cuota`, `cuota_numero`, `cuota_total`) viven en `crm_pagos`.
- Cifras con `NUMERIC(14,2)`; formatear en el cliente con `formatCurrency` (es-AR, USD si `moneda==='USD'`).