---
name: seguridad-datos
description: Seguridad de datos, protección de información personal y cumplimiento normativo
category: calidad-seguridad
tags: [seguridad, datos, proteccion, rls, compliance, privacidad]
---

# Seguridad de Datos

## Protección de Datos Personales

### Datos Recolectados en el Wizard
- Nombre, apellido, DNI, email, celular
- Preferencias de viaje (destinos, fechas, servicios)
- NO se recolectan: datos financieros, contraseñas, ubicación GPS

### Almacenamiento
- Base de datos: Supabase PostgreSQL (encriptado en reposo)
- localStorage: Solo datos del wizard (sin DNI ni email sensibles tras submit)
- Backups: Gestionados por Supabase (automáticos)

### Acceso a Datos (RLS)
- **Público**: Solo puede INSERTAR (enviar formulario)
- **Autenticado**: Admin/operadores pueden SELECT, UPDATE, DELETE
- **Row Level Security**: Cada política definida en migraciones SQL

### Cumplimiento Legal (Argentina)
- Ley 25.326 de Protección de Datos Personales
- Consentimiento del titular al enviar el formulario
- Finalidad específica: preparar presupuesto de viaje
- Derecho de acceso, rectificación y supresión (ARCO)
- Datos no transferidos a terceros sin consentimiento

## Seguridad en la App

### Frontend
- No exponer secrets en cliente (usar `VITE_` prefix, solo anon key)
- Sanitizar inputs (Zod validation antes de enviar)
- Content Security Policy (headers Netlify)
- XSS prevention: React escapa HTML por defecto

### Backend (Supabase)
- Row Level Security obligatorio
- Service role key solo en scripts de migración (nunca en cliente)
- Anon key con permisos mínimos (INSERT público, nada más)
- Rate limiting en tablas públicas (evitar spam de formularios)

### Infraestructura (Netlify)
- HTTPS forzado
- Headers de seguridad:
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` configurada

### Buenas Prácticas
- No loguear datos personales en consola
- No almacenar tokens sensibles en localStorage
- Sesión de admin expira después de inactividad
- Contraseñas de admin: mínimo 8 caracteres, complejas
- Auditoría de accesos (logs de Supabase Auth)
