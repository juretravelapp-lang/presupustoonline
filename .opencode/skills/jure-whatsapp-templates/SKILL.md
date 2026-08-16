---
name: jure-whatsapp-templates
description: Motor de plantillas WhatsApp de Travel Jure: sistema de placeholders, categorías, generación y envío wa.me. Usar para tareas de mensajería, plantillas, recordatorios, recibo de pago o generador de mensajes.
---

# Plantillas de Mensaje WhatsApp (Travel Jure)

## Archivos clave
- `src/lib/messageTemplates.ts` — motor de plantillas.
- `src/lib/whatsapp.ts` — `generateWhatsAppMessage` (wizard) + link wa.me.
- `src/components/admin/MessageTemplatesBoard.tsx`, `TemplateFormModal.tsx`, `MessageGenerator.tsx`.
- Tabla `crm_message_templates`.

## Sistema placeholders
Plantilla con `{{key}}` reemplazados por el generador. Placeholders de sistema:
- `_today`, `_hora`, `_timestamp`, `_factura_num` (= YYMMDD-####).
- Campo requerido vacío → `⏳ pendiente`; opcional vacío → `—`.
- `resolveFieldDefaults` + `renderMessage`. El generador cae a `DEFAULT_TEMPLATES` si no hay plantillas DB activas.

## Categorías
`cotizacion | recibo_pago | confirmacion | recordatorio | factura`.

## Estructura de tabla
`fields` JSONB: `[{key,label,type,placeholder,required,emoji,options,width}]`; `mensaje_template` con `{{key}}`; `is_active`, `orden`, `categoria`, `slug` único.

## Flujo de envío
El mensaje renderizado incluye link https de WhatsApp (`wa.me/5493812061066`) + botón copiar, abriendo el chat con el texto pre-cargado.

## Reglas
- Emojis permitidos (negocio turístico, estilo argentino cálido).
- Añadir templates en DB con `ON CONFLICT (slug) DO UPDATE`.
- No hardcodear textos de campaña en componentes; ir a plantillas/categoría.