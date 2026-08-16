// =============================================
// Fachada de la capa de datos (Supabase).
// La implementación vive en módulos separados en ./db:
//   client.ts (cliente), types.ts, quotes.ts, meetings.ts,
//   templates.ts, clientes.ts, pagos.ts, quoteServices.ts
// Este archivo se mantiene para compatibilidad con los imports
// existentes (import ... from '@/lib/supabase').
// =============================================
export * from './db/index'