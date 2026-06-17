-- =============================================
-- TRAVEL JURE - MIGRATION 003
-- Schema: origen opcional, múltiples destinos, tipo de viaje
-- =============================================

-- 1. Ciudad de salida opcional (el cliente puede no saber desde dónde sale)
ALTER TABLE travel_quotes ALTER COLUMN ciudad_salida DROP NOT NULL;

-- 2. Destino único opcional (ahora se usa destinos[] como principal)
ALTER TABLE travel_quotes ALTER COLUMN destino DROP NOT NULL;

-- 3. Nueva columna para múltiples destinos (array JSONB)
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS destinos JSONB DEFAULT '[]'::jsonb;

-- 4. Nueva columna para tipo de viaje / comentarios adicionales
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS tipo_viaje TEXT;

-- 5. Actualizar comentarios existentes para que sea más claro su propósito
COMMENT ON COLUMN travel_quotes.comentarios IS 'Comentarios adicionales del cliente';
COMMENT ON COLUMN travel_quotes.tipo_viaje IS 'Tipo de viaje: vacaciones, luna de miel, negocios, egresados, etc.';
COMMENT ON COLUMN travel_quotes.destinos IS 'Array de destinos seleccionados (soporta múltiple)';
COMMENT ON COLUMN travel_quotes.ciudad_salida IS 'Ciudad de salida (opcional)';

-- 6. Actualizar función de estadísticas (sigue funcionando igual)
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total BIGINT,
  nuevos BIGINT,
  contactados BIGINT,
  cotizados BIGINT,
  reservados BIGINT,
  cancelados BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM travel_quotes)::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'nuevo')::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'contactado')::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'cotizado')::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'reservado')::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'cancelado')::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
