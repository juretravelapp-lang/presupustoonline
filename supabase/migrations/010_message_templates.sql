-- =============================================
-- TRAVEL JURE - MIGRATION 010
-- Generador de Templates de Mensajes CRUD
-- Tablas: crm_message_templates
-- Permite dar de alta formularios de cotización,
-- recibo de pago, confirmación, etc. con salida
-- de mensaje identado con emojis listo para WhatsApp
-- =============================================

CREATE TABLE IF NOT EXISTS crm_message_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    categoria       TEXT NOT NULL,                       -- cotizacion | recibo_pago | confirmacion | recordatorio | factura
    emoji           TEXT,                                -- emoji decorativo del template
    descripcion     TEXT,                                -- texto descriptivo
    is_active       BOOLEAN DEFAULT TRUE,                -- soft-delete / toggle
    fields          JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array de definiciones de campos del formulario
    mensaje_template TEXT NOT NULL,                      -- template con placeholders {{key}}
    orden           INTEGER DEFAULT 0,                   -- orden de aparición
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_mt_categoria ON crm_message_templates(categoria);
CREATE INDEX IF NOT EXISTS idx_crm_mt_activo    ON crm_message_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_crm_mt_orden     ON crm_message_templates(orden);
CREATE INDEX IF NOT EXISTS idx_crm_mt_slug      ON crm_message_templates(slug);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE crm_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access to message_templates" ON crm_message_templates
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Anon (public) can read active templates only (consumed by the client wizard if needed)
CREATE POLICY "anon reads active message_templates" ON crm_message_templates
    FOR SELECT
    TO anon
    USING (is_active = TRUE);

-- =============================================
-- Trigger updated_at automatico
-- =============================================
CREATE OR REPLACE FUNCTION update_crm_message_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crm_message_templates_updated_at ON crm_message_templates;
CREATE TRIGGER trg_crm_message_templates_updated_at
    BEFORE UPDATE ON crm_message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_crm_message_templates_updated_at();

-- =============================================
-- Seed: templates por defecto
-- Cada template define:
--   - fields: array de {key, label, type, placeholder, required, emoji, options?, width?}
--   - mensaje_template: texto con placeholders {{key}} → mensaje indentado con emojis
-- =============================================

-- 1. COTIZACIÓN / PRESUPUESTO
INSERT INTO crm_message_templates (nombre, slug, categoria, emoji, descripcion, is_active, orden, fields, mensaje_template) VALUES
('Cotización de Viaje', 'cotizacion', 'cotizacion', '💰',
 'Plantilla para enviar presupuestos de viaje al cliente',
 TRUE, 10,
 '[
   {"key":"nombre","label":"Nombre","type":"text","placeholder":"Ej: Juan","required":true,"emoji":"👤","width":"half"},
   {"key":"apellido","label":"Apellido","type":"text","placeholder":"Ej: Pérez","required":true,"emoji":"👤","width":"half"},
   {"key":"dni","label":"DNI","type":"text","placeholder":"12345678","required":true,"emoji":"🆔","width":"half"},
   {"key":"email","label":"Email","type":"email","placeholder":"cliente@email.com","required":false,"emoji":"📧","width":"half"},
   {"key":"celular","label":"Celular","type":"tel","placeholder":"54 9 381 1234567","required":true,"emoji":"📱","width":"full"},
   {"key":"origen","label":"Ciudad de Salida","type":"text","placeholder":"Tucumán","required":true,"emoji":"✈️","width":"half"},
   {"key":"destino","label":"Destino","type":"text","placeholder":"Punta Cana, República Dominicana","required":true,"emoji":"🗺️","width":"half"},
   {"key":"fechas","label":"Fechas","type":"text","placeholder":"15/11 al 22/11","required":true,"emoji":"📅","width":"full"},
   {"key":"adultos","label":"Adultos","type":"number","placeholder":"2","required":true,"emoji":"👥","width":"third"},
   {"key":"ninos","label":"Niños (2-11)","type":"number","placeholder":"0","required":false,"emoji":"👶","width":"third"},
   {"key":"bebes","label":"Bebés (0-2)","type":"number","placeholder":"0","required":false,"emoji":"👶","width":"third"},
   {"key":"servicios","label":"Servicios Incluidos","type":"textarea","placeholder":"• Hotel 7 noches\n• Vuelo ida y vuelta\n• Traslados","required":true,"emoji":"✨","width":"full"},
   {"key":"total","label":"Total","type":"currency","placeholder":"1299","required":true,"emoji":"💵","width":"half"},
   {"key":"moneda","label":"Moneda","type":"select","placeholder":"Seleccionar moneda","required":true,"emoji":"💱","options":["ARS","USD","EUR"],"width":"half"},
   {"key":"observaciones","label":"Observaciones","type":"textarea","placeholder":"Notas adicionales...","required":false,"emoji":"💬","width":"full"}
 ]'::jsonb,
 '*COTIZACIÓN DE VIAJE*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hola *{{nombre}} {{apellido}}*,

👤 *DATOS DEL CLIENTE*
  • DNI: {{dni}}
  • Email: {{email}}
  • Celular: {{celular}}

✈️ *DETALLE DEL VIAJE*
  • Origen: {{origen}}
  • Destino: {{destino}}
  • Fechas: {{fechas}}
  • Pasajeros: {{adultos}} adultos, {{ninos}} niños, {{bebes}} bebés

✨ *SERVICIOS INCLUIDOS*
{{servicios}}

💰 *TOTAL: {{moneda}} ${{total}}*

💬 *OBSERVACIONES*
{{observaciones}}

¡Quedo atento para cualquier consulta!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  categoria = EXCLUDED.categoria,
  emoji = EXCLUDED.emoji,
  descripcion = EXCLUDED.descripcion,
  is_active = EXCLUDED.is_active,
  fields = EXCLUDED.fields,
  mensaje_template = EXCLUDED.mensaje_template,
  orden = EXCLUDED.orden,
  updated_at = NOW();

-- 2. RECIBO DE PAGO
INSERT INTO crm_message_templates (nombre, slug, categoria, emoji, descripcion, is_active, orden, fields, mensaje_template) VALUES
('Recibo de Pago', 'recibo_pago', 'recibo_pago', '💵',
 'Plantilla para confirmar recepción de un pago del cliente',
 TRUE, 20,
 '[
   {"key":"nombre","label":"Nombre","type":"text","placeholder":"Ej: Juan","required":true,"emoji":"👤","width":"half"},
   {"key":"apellido","label":"Apellido","type":"text","placeholder":"Ej: Pérez","required":true,"emoji":"👤","width":"half"},
   {"key":"dni","label":"DNI","type":"text","placeholder":"12345678","required":true,"emoji":"🆔","width":"half"},
   {"key":"celular","label":"Celular","type":"tel","placeholder":"54 9 381 1234567","required":true,"emoji":"📱","width":"half"},
   {"key":"total","label":"Total Pagado","type":"currency","placeholder":"1299","required":true,"emoji":"💵","width":"half"},
   {"key":"moneda","label":"Moneda","type":"select","placeholder":"Seleccionar","required":true,"emoji":"💱","options":["ARS","USD","EUR"],"width":"half"},
   {"key":"forma_pago","label":"Forma de Pago","type":"select","placeholder":"Seleccionar","required":true,"emoji":"💳","options":["Transferencia","Efectivo","Tarjeta de Crédito","Tarjeta de Débito","Mercado Pago"],"width":"full"},
   {"key":"fecha_pago","label":"Fecha del Pago","type":"date","placeholder":"","required":true,"emoji":"📅","width":"half"},
   {"key":"concepto","label":"Concepto / Reserva","type":"text","placeholder":"Presupuesto #001","required":true,"emoji":"📄","width":"half"},
   {"key":"operador","label":"Operador","type":"text","placeholder":"Jure Travel","required":false,"emoji":"👤","width":"full"}
 ]'::jsonb,
 '*RECIBO DE PAGO*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cliente: *{{nombre}} {{apellido}}*
DNI: {{dni}}
Celular: {{celular}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💵 *DETALLE DEL PAGO*
  • Concepto: {{concepto}}
  • Monto abonado: {{moneda}} ${{total}}
  • Forma de pago: {{forma_pago}}
  • Fecha: {{fecha_pago}}

✅ *Confirmación:*
Hemos recibido tu pago correctamente.
Gracias por confiar en {{operador}}.

📅 Fecha de emisión: {{_hoy}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  categoria = EXCLUDED.categoria,
  emoji = EXCLUDED.emoji,
  descripcion = EXCLUDED.descripcion,
  is_active = EXCLUDED.is_active,
  fields = EXCLUDED.fields,
  mensaje_template = EXCLUDED.mensaje_template,
  orden = EXCLUDED.orden,
  updated_at = NOW();

-- 3. CONFIRMACIÓN DE RESERVA
INSERT INTO crm_message_templates (nombre, slug, categoria, emoji, descripcion, is_active, orden, fields, mensaje_template) VALUES
('Confirmación de Reserva', 'confirmacion_reserva', 'confirmacion', '✅',
 'Plantilla para confirmar la reserva al cliente',
 TRUE, 30,
 '[
   {"key":"nombre","label":"Nombre","type":"text","placeholder":"Ej: Juan","required":true,"emoji":"👤","width":"half"},
   {"key":"apellido","label":"Apellido","type":"text","placeholder":"Ej: Pérez","required":true,"emoji":"👤","width":"half"},
   {"key":"celular","label":"Celular","type":"tel","placeholder":"54 9 381 1234567","required":true,"emoji":"📱","width":"full"},
   {"key":"destino","label":"Destino","type":"text","placeholder":"Punta Cana","required":true,"emoji":"🗺️","width":"half"},
   {"key":"fechas","label":"Fechas del Viaje","type":"text","placeholder":"15/11 al 22/11","required":true,"emoji":"📅","width":"half"},
   {"key":"hotel","label":"Hotel","type":"text","placeholder":"Hotel Ejemplo - 7 noches","required":true,"emoji":"🏨","width":"full"},
   {"key":"vuelo","label":"Vuelo","type":"text","placeholder":"Vuelo AR123 EZE-SDQ","required":true,"emoji":"✈️","width":"full"},
   {"key":"precio_final","label":"Precio Final","type":"currency","placeholder":"1299","required":true,"emoji":"💰","width":"half"},
   {"key":"moneda","label":"Moneda","type":"select","placeholder":"USD","required":true,"emoji":"💱","options":["ARS","USD","EUR"],"width":"half"},
   {"key":"incluir","label":"Que Incluye","type":"textarea","placeholder":"• Todo incluido\n• Traslados\n• Excursiones","required":false,"emoji":"🎁","width":"full"},
   {"key":"no_incluir","label":"No Incluye","type":"textarea","placeholder":"• Alimentos extra\n• Propinas","required":false,"emoji":"📝","width":"full"}
 ]'::jsonb,
 '*✅ RESERVA CONFIRMADA*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
¡Hola *{{nombre}} {{apellido}}*!

Tu viaje está confirmado. Estos son los detalles:

🗺️ *DESTINO*
  • {{destino}}
  • Fechas: {{fechas}}

🏨 *ALOJAMIENTO*
  • {{hotel}}

✈️ *TRANSPORTE*
  • {{vuelo}}

🎁 *QUE INCLUYE*
{{incluir}}

📝 *QUE NO INCLUYE*
{{no_incluir}}

💰 *PRECIO FINAL: {{moneda}} ${{precio_final}}*

¡Te esperamos! Cualquier duda, avísame.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  categoria = EXCLUDED.categoria,
  emoji = EXCLUDED.emoji,
  descripcion = EXCLUDED.descripcion,
  is_active = EXCLUDED.is_active,
  fields = EXCLUDED.fields,
  mensaje_template = EXCLUDED.mensaje_template,
  orden = EXCLUDED.orden,
  updated_at = NOW();

-- 4. RECORDATORIO DE VIAJE
INSERT INTO crm_message_templates (nombre, slug, categoria, emoji, descripcion, is_active, orden, fields, mensaje_template) VALUES
('Recordatorio de Viaje', 'recordatorio_viaje', 'recordatorio', '📅',
 'Plantilla para recordar al cliente los detalles de su viaje próximo',
 TRUE, 40,
 '[
   {"key":"nombre","label":"Nombre","type":"text","placeholder":"Ej: Juan","required":true,"emoji":"👤","width":"half"},
   {"key":"apellido","label":"Apellido","type":"text","placeholder":"Ej: Pérez","required":true,"emoji":"👤","width":"half"},
   {"key":"celular","label":"Celular","type":"tel","placeholder":"54 9 381 1234567","required":true,"emoji":"📱","width":"full"},
   {"key":"destino","label":"Destino","type":"text","placeholder":"Punta Cana","required":true,"emoji":"🗺️","width":"half"},
   {"key":"fecha_salida","label":"Fecha de Salida","type":"date","placeholder":"","required":true,"emoji":"📅","width":"half"},
   {"key":"fecha_regreso","label":"Fecha de Regreso","type":"date","placeholder":"","required":true,"emoji":"📅","width":"half"},
   {"key":"aerolinea","label":"Aerolínea","type":"text","placeholder":"Aerolíneas Argentinas","required":true,"emoji":"✈️","width":"half"},
   {"key":"vuelo_num","label":"Número de Vuelo","type":"text","placeholder":"AR123","required":true,"emoji":"🔢","width":"half"},
   {"key":"hotel","label":"Hotel","type":"text","placeholder":"Hotel Ejemplo","required":true,"emoji":"🏨","width":"full"},
   {"key":"documentos","label":"Documentos a Llevar","type":"textarea","placeholder":"• Pasaporte vigente\n• DNI\n• Seguro de viaje","required":true,"emoji":"📋","width":"full"},
   {"key":"checkin","label":"Check-in","type":"text","placeholder":"48h antes. www.aerolinea.com/checkin","required":false,"emoji":"💻","width":"full"}
 ]'::jsonb,
 '*📅 RECORDATORIO DE VIAJE*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
¡Hola *{{nombre}} {{apellido}}*!

Tu viaje a *{{destino}}* está próximo. Aquí tienes todo lo que necesitás:

✈️ *VUELO*
  • Aerolínea: {{aerolinea}}
  • Número de vuelo: {{vuelo_num}}
  • Salida: {{fecha_salida}}
  • Regreso: {{fecha_regreso}}

🏨 *ALOJAMIENTO*
  • {{hotel}}

📋 *DOCUMENTOS A LLEVAR*
{{documentos}}

💻 *CHECK-IN*
  {{checkin}}

¡Buen viaje! 🧳
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  categoria = EXCLUDED.categoria,
  emoji = EXCLUDED.emoji,
  descripcion = EXCLUDED.descripcion,
  is_active = EXCLUDED.is_active,
  fields = EXCLUDED.fields,
  mensaje_template = EXCLUDED.mensaje_template,
  orden = EXCLUDED.orden,
  updated_at = NOW();

-- 5. FACTURA
INSERT INTO crm_message_templates (nombre, slug, categoria, emoji, descripcion, is_active, orden, fields, mensaje_template) VALUES
('Factura', 'factura', 'factura', '🧾',
 'Plantilla para enviar factura al cliente',
 TRUE, 50,
 '[
   {"key":"nombre","label":"Nombre","type":"text","placeholder":"Ej: Juan","required":true,"emoji":"👤","width":"half"},
   {"key":"apellido","label":"Apellido","type":"text","placeholder":"Ej: Pérez","required":true,"emoji":"👤","width":"half"},
   {"key":"dni","label":"DNI / CUIT","type":"text","placeholder":"12345678","required":true,"emoji":"🆔","width":"half"},
   {"key":"email","label":"Email","type":"email","placeholder":"cliente@email.com","required":true,"emoji":"📧","width":"half"},
   {"key":"concepto","label":"Concepto","type":"text","placeholder":"Servicio de viaje a Punta Cana","required":true,"emoji":"📄","width":"full"},
   {"key":"subtotal","label":"Subtotal","type":"number","placeholder":"1000","required":true,"emoji":"💵","width":"third"},
   {"key":"iva","label":"IVA","type":"number","placeholder":"21","required":true,"emoji":"💵","width":"third"},
   {"key":"total","label":"Total","type":"number","placeholder":"1210","required":true,"emoji":"💵","width":"third"},
   {"key":"moneda","label":"Moneda","type":"select","placeholder":"ARS","required":true,"emoji":"💱","options":["ARS","USD","EUR"],"width":"half"}
 ]'::jsonb,
 '*🧾 FACTURA*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACTURA N°: {{_factura_num}}

👤 *DATOS DEL CLIENTE*
  • Nombre: {{nombre}} {{apellido}}
  • DNI/CUIT: {{dni}}
  • Email: {{email}}

📄 *DETALLE*
  • Concepto: {{concepto}}

💵 *RESUMEN*
  • Subtotal ({{moneda}}): ${{subtotal}}
  • IVA: {{iva}}%
  • {{moneda}} TOTAL: ${{total}}

💳 *FORMA DE PAGO*
  • Transferencia bancaria

¡Gracias por su preferencia!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  categoria = EXCLUDED.categoria,
  emoji = EXCLUDED.emoji,
  descripcion = EXCLUDED.descripcion,
  is_active = EXCLUDED.is_active,
  fields = EXCLUDED.fields,
  mensaje_template = EXCLUDED.mensaje_template,
  orden = EXCLUDED.orden,
  updated_at = NOW();

-- =============================================
-- Trigger para ordenar por defecto
-- =============================================
COMMENT ON TABLE crm_message_templates IS 'Plantillas CRUD de mensajes para WhatsApp — formularios de cotización, recibo de pago, confirmación, recordatorio, factura, etc.';
