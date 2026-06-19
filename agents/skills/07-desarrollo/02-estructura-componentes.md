---
name: estructura-componentes
description: Arquitectura de componentes React, patrones y organización del código
category: desarrollo
tags: [componentes, arquitectura, patrones, react, estructura]
---

# Estructura y Arquitectura de Componentes

## Organización de Carpetas (`src/`)
```
src/
├── components/
│   ├── ui/             # Componentes base (shadcn/ui style)
│   ├── layout/         # Header, Footer, Layout wrappers
│   ├── banner/         # Carrusel promocional
│   ├── wizard/         # Wizard steps + shell
│   │   └── steps/      # Step1 through Step6
│   ├── success-modal/  # Modal post-submit
│   ├── client/         # Vista pública de cotización
│   └── admin/
│       ├── metrics/    # Charts + Data table
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── KanbanBoard.tsx
│       ├── QuoteDetailModal.tsx
│       ├── MeetingsBoard.tsx
│       ├── MeetingFormModal.tsx
│       └── QuotePDF.tsx
├── hooks/              # Custom hooks
├── stores/             # Zustand stores
├── lib/                # Utilidades, supabase client, constants
├── types/              # TypeScript interfaces
└── styles/             # CSS global + Tailwind theme
```

## Patrones de Componentes

### UI Components (shadcn/ui style)
- Componentes base, puros, sin lógica de negocio
- Props de estilo (variant, size, className)
- Soportan `asChild` con Radix Slot
- Ej: `Button`, `Input`, `Badge`, `Checkbox`

### Container Components (con lógica)
- Se conectan a stores/hooks
- Orquestan datos y estados
- Ej: `WizardShell`, `KanbanBoard`, `MeetingsBoard`

### Presentational Components
- Reciben props, renderizan UI
- Sin lógica de negocio
- Ej: `StepWrapper`, `PromoCarousel`, `StatsCounter`

## Custom Hooks

### Hooks de Estado
- `useWizardStore` → Estado del wizard (Zustand + persist)
- `useAuthStore` → Autenticación
- `useUiStore` → UI global (modals, toasts)

### Hooks de Datos
- `useQuotesQuery` → React Query wrappers (CRUD quotes + meetings)
- `useSupabase` → Conexión a Supabase

### Hooks de Utilidad
- `useAutoSaveDraft` → localStorage auto-save con debounce
- `useMediaQuery` → Responsive breakpoints
- `useWhatsApp` → Generar mensaje/link de WhatsApp

## Routing (hash-free)
- Sin React Router
- `window.location.pathname` determina la vista
- `/admin` → `AdminPanel`
- `/quote/:id` → `ClientQuoteView`
- `/` → Wizard + Landing
- Admin cambia vistas internas con `useState<AdminView>`
