---
name: jure-quality-gates
description: Puertas de calidad y trampas conocidas del repo Travel Jure: comandos de verificación, checks de consistencia estados/RLS/migraciones y riesgos de seguridad. Usar SIEMPRE antes de dar una tarea por terminada o al tocar build/types/seguridad.
---

# Control de Calidad Travel Jure

## Comandos de verificación (siempre tras cambios)
```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run build       # tsc -b && vite build (puerta completa)
```

## Trampas conocidas del repo
1. **CHECK estados**: la app usa `no_cotizado|en_cotizacion|cotizado|enviado_cliente|concretado|cancelado`, pero `travel_quotes.estado` tiene DEFAULT `'nuevo'` (inválido). Nunca insertar sin `estado` explícito.
2. **types/admin.ts desactualizado**: sigue listando estados legacy (`nuevo/contactado/cotizado/reservado/cancelado`).
3. **`scripts/migrate.js` desactualizado**: solo cubre migraciones 001–003; no usa `exec_sql` si no existe la RPC.
4. **RLS anon expuesto**: `crm_pagos` y `crm_quote_services` tienen `SELECT USING (true)` para anon → exponen todos los registros. No replicar este patrón.
5. **`get_dashboard_stats()`** es RPC muerta (frontend usa `head:true` counts).
6. **QAUseCasePanel** es herramienta de debug embebida en bundle de producción con bypass de login (`/log` es ruta muerta; la real es `/admin`).
7. **Header.new.tsx** duplicado no usado (solo `Header.tsx` está cableado en App.tsx).

## Checklist antes de cerrar una tarea
- [ ] `typecheck` + `lint` + `build` pasan.
- [ ] Estados de quote coherentes entre app y DB (y `historial[]` actualizado).
- [ ] No se exponen datos anon (RLS acotada a `ticket_id`).
- [ ] No se hardcodean secretos; envs por `import.meta.env`.
- [ ] Sin componentes duplicados/dead-routes introducidos.
- [ ] Migraciones nuevas en `supabase/migrations/` y actualizada la lista en `scripts/migrate.js`.