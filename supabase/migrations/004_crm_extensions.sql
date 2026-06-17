-- =============================================
-- TRAVEL JURE - MIGRATION 004
-- CRM: Operadores, Agenda, Notas y Calculadora de Precios
-- =============================================

-- 1. Agregar columnas para el CRM (Operadores, Agenda y Notas)
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS creador_email TEXT;
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS operador_nombre TEXT;
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS reunion_fecha TIMESTAMPTZ;
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS reunion_estado TEXT CHECK (reunion_estado IN ('pendiente', 'realizada', 'cancelada'));
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS notas_crm TEXT;

-- 2. Agregar columnas para cálculo de precios segmentados por proveedor y markup
-- Default JSON schema:
-- {
--   "moneda": "USD",
--   "markup_tipo": "porcentaje",
--   "markup_valor": 10,
--   "proveedor_seleccionado": null,
--   "proveedores": [
--     { "nombre": "Proveedor A", "hotel_costo": 0, "vuelos_costo": 0, "otros_costo": 0, "markup_aplicado": 0, "precio_final": 0 },
--     { "nombre": "Proveedor B", "hotel_costo": 0, "vuelos_costo": 0, "otros_costo": 0, "markup_aplicado": 0, "precio_final": 0 },
--     { "nombre": "Proveedor C", "hotel_costo": 0, "vuelos_costo": 0, "otros_costo": 0, "markup_aplicado": 0, "precio_final": 0 },
--     { "nombre": "Proveedor D", "hotel_costo": 0, "vuelos_costo": 0, "otros_costo": 0, "markup_aplicado": 0, "precio_final": 0 }
--   ]
-- }
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS pricing_detalles JSONB DEFAULT '{"moneda": "USD", "markup_tipo": "porcentaje", "markup_valor": 10, "proveedores": []}'::jsonb;

-- 3. Agregar columna para historial de cambios de estado
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS historial JSONB DEFAULT '[]'::jsonb;

-- 4. Modificar el check de estados para soportar los nuevos estados del Kanban
-- Buscamos y eliminamos cualquier restricción CHECK existente sobre la columna "estado"
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT constraint_name 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'travel_quotes' AND column_name = 'estado'
    LOOP
        EXECUTE 'ALTER TABLE travel_quotes DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 5. Actualizar los registros existentes que tengan estados viejos a los nuevos antes de validar la restricción
-- Esto asegura que todas las filas tengan estados válidos bajo la nueva definición,
-- evitando errores de violación de restricción (CHECK constraint violation) al agregar la nueva restricción.
UPDATE travel_quotes SET estado = 'no_cotizado' WHERE estado = 'nuevo' OR estado IS NULL;
UPDATE travel_quotes SET estado = 'en_cotizacion' WHERE estado = 'contactado';
UPDATE travel_quotes SET estado = 'concretado' WHERE estado = 'reservado';
UPDATE travel_quotes SET estado = 'no_cotizado' WHERE estado NOT IN (
  'no_cotizado', 'en_cotizacion', 'cotizado', 'enviado_cliente', 'concretado', 'cancelado'
);

-- 6. Aplicamos la nueva restricción con los nuevos estados
ALTER TABLE travel_quotes ADD CONSTRAINT travel_quotes_estado_check CHECK (estado IN (
  'no_cotizado', 'en_cotizacion', 'cotizado', 'enviado_cliente', 'concretado', 'cancelado'
));

-- 6. Comentarios aclaratorios
COMMENT ON COLUMN travel_quotes.creador_email IS 'Email del usuario que creó la cotización (ej: admin u operador)';
COMMENT ON COLUMN travel_quotes.operador_nombre IS 'Nombre del operador que ingresó la solicitud (ej: Juan Pérez)';
COMMENT ON COLUMN travel_quotes.reunion_fecha IS 'Fecha y hora agendada para la reunión con el cliente';
COMMENT ON COLUMN travel_quotes.reunion_estado IS 'Estado de la reunión: pendiente, realizada o cancelada';
COMMENT ON COLUMN travel_quotes.notas_crm IS 'Notas tomadas durante la reunión o el proceso de cotización';
COMMENT ON COLUMN travel_quotes.pricing_detalles IS 'Precios de los 4 proveedores, markup, moneda y precio final calculado';
COMMENT ON COLUMN travel_quotes.historial IS 'Historial de cambios de estado del lead';
