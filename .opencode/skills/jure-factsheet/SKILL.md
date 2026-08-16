---
name: jure-factsheet
description: Ficha técnica autoritativa del código Travel Jure (stack real, rutas, stores, hooks, capa de datos, scripts). Usar SIEMPRE antes de implementar o refactorizar algo en este repo para conocer la arquitectura real, no la del PLAN.md.
---

# Ficha Técnica Travel Jure (estado real del repo)

## Stack real
React 19 + Vite 6 + TypeScript 5.7 + Tailwind 4 (`@import "tailwindcss"`). Estado: Zustand (3 stores). Data: `@supabase/ssr` + supabase-js + `@tanstack/react-query`. PDF: `@react-pdf/renderer`. Kanban: `@dnd-kit`. Animaciones: `motion`. Charts: `recharts`. Forms: RHF + zod.

## Routing (NO hay react-router)
`src/App.tsx` usa `window.history.pushState` + listener `popstate`. Rutas: `/` (landing + wizard), `/admin` (AdminPanel lazy), `/quote/{id}` (ClientQuoteView lazy).

## Stores
- `wizardStore.ts` (persist) — datos del wizard, `generatedTicket`, pasos completados.
- `authStore.ts` — `login/logout/bypassLogin(role)`; rol por email: `admin@juretravel.com` = admin, resto operador.
- `uiStore.ts` — menú mobile, modal activo, toast.

## Hooks de datos (src/hooks/)
`useQuotesQuery`, `useCatalogQuery` (TTOO+Servicios+Destinos), `useClientesQuery`, `usePagosQuery`, `useMessageTemplatesQuery`, `useAutoSaveDraft` (1 s debounce, 7 días), `useWhatsApp`, `useMediaQuery`.

## Capa de datos
`src/lib/supabase.ts` (~1086 líneas) es UN solo cliente + TODA la capa de datos (CRUD quotes, clientes, relaciones, meetings, pagos, quote_services, templates, stats). Incluye interfaces de pricing, pasajeros, historial y helpers de normalización. Si los env de Supabase faltan, cae a modo demo (`https://demo.supabase.co`).

## Reglas de convención
- NO traer react-router ni bibliotecas nuevas sin justificar.
- Seguir la estructura por carpetas existente (`components/admin`, `components/wizard`, `components/client`, `components/ui`).
- Los cambios de estado de quote deben tocar también `historial[]` (JSONB).
- Preservar la identidad visual: azul `#041224`, accent `#FF6B00`, gold `#F26122`, fuentes Inter/Poppins/Playfair.