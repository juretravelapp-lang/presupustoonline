---
name: jure-client-wizard
description: Flujo público de cliente de Travel Jure: landing, wizard multi-paso (validación zod, autosave), modal éxito estilo boarding pass y vista pública /quote/:id. Usar para tareas del embudo de captación web o la experiencia de cliente.
---

# Wizard Cliente y Experiencia Pública (Travel Jure)

## Landing (`/`)
Header + `PromoCarousel` (autoplay 6 s, lazy via `requestIdleCallback`, webp) + `SplashIntro` + `WizardShell` + `Footer`. Hay un `ThemeToggle` (dark default) y `QAUseCasePanel` (debug, botón Beaker abajo-derecha).

## Wizard (WizardShell + pasos)
Pasos: `destination → dates → passengers → preferences → contact → summary`.
- `Step1Destination`: destinos populares + destinos de catálogo (`crm_destinos` activos), multi-selección.
- `Step2Dates`: `tipo_fecha` exacta|flexible, min hoy, max +365 días, `fechas_por_destino`.
- `Step3Passengers`: contador adultos (default 2)/niños/bebés.
- `Step4Preferences`: ≥1 servicio obligatorio.
- `Step5Contact`: RHF + zod. dni regex `/^[\d\\.\\s\\-]+$/`, email opcional-or-vacío, celular `/^[\\d\\s\\-\\+]+$/`.
- `Step6Summary`: `tipo_viaje` (vaciones|luna_de_miel|familia|egresados|negocios|aventura|romantico|otro).
- Submit (`WizardShell.handleSubmit`): `insertQuote` (estado `no_cotizado`, `origen_consulta='web'|'operador'`, `ticket_id = JT-YYYY-######`) → `syncClienteFromQuote` → `updateQuoteCliente`.
- Autosave: `useAutoSaveDraft` 1 s debounce, expira en 7 días.

## SuccessModal (boarding pass)
Tarjeta estilo pase de abordar: códigos origen/destino, N° de ticket (generatedTicket), clase PREMIUM, estado RECIBIDO, perforación punteada, confetti, botón WhatsApp "Confirmar Envío" (`useWhatsApp`), código de barras decorativo.

## Vista pública `/quote/{id}`
`ClientQuoteView`: hero + GlassCards (destinos/fechas/pasajeros/origen), servicios y comentarios, "Inversión Total" desde `pricing_detalles.proveedores.find(nombre===proveedor_seleccionado)`, trust badges, PDF (`QuotePDF`), link wa.me asesor, footer "Legajo Nº 12345".

## Reglas UX
- Preservar look premium: fondo `#041224`, accent `#FF6B00`, gold `#F26122`, glass-cards, animaciones motion suaves, dark por defecto.
- Validar siempre con zod adherido a RHF; feedback visual por campo.
- No romper el flujo de autosave persistido.