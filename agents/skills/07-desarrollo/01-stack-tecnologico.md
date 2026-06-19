---
name: stack-tecnologico
description: Stack tecnológico del proyecto, dependencias, herramientas y configuración
category: desarrollo
tags: [stack, tecnologia, dependencias, configuracion, setup]
---

# Stack Tecnológico - Travel Jure

## Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19 | UI Library |
| TypeScript | 5.7 | Type safety |
| Vite | 6 | Build tool |
| Tailwind CSS | 4 | Estilos utility-first |
| Motion (Framer Motion) | 12 | Animaciones |
| Zustand | 5 | Estado global |
| React Query (TanStack) | 5 | Server state / fetching |
| React Hook Form | 7 | Formularios performantes |
| Zod | 3 | Validación de esquemas |
| Recharts | 3 | Gráficos (admin dashboard) |
| @react-pdf/renderer | 4 | PDF generation |
| @dnd-kit | 6/10 | Drag & drop (Kanban) |
| Lucide React | 0.46 | Iconos |

## Backend / DB
| Tecnología | Propósito |
|------------|-----------|
| Supabase | PostgreSQL + Auth + RLS |
| Supabase SSR | Auth con cookies |
| PostgreSQL | Base de datos relacional |
| Row Level Security | Seguridad a nivel fila |

## Infraestructura
| Servicio | Propósito |
|----------|-----------|
| Netlify | Hosting + deploy |
| GitHub | Repositorio + control versiones |
| Netlify Redirects | SPA routing (/_redirects) |

## Configuración Clave
- **Vite**: `vite.config.ts` con plugin de React + Tailwind
- **Tailwind**: `@theme` personalizado con colores de marca
- **TypeScript**: Strict mode, `tsconfig.app.json` + `tsconfig.node.json`
- **ESLint**: Flat config con reglas de TypeScript
- **Netlify**: `netlify.toml` con build command + redirects + security headers
- **Envs**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`, etc.

## Scripts Disponibles
```bash
npm run dev          # Desarrollo local
npm run build        # Build producción
npm run preview      # Preview local del build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run migrate      # Migraciones Supabase
npm run seed         # Seed datos de prueba
npm run optimize:images # Optimizar imágenes banner
npm run audit:lighthouse # Performance audit
```
