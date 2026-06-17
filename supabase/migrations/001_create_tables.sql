-- =============================================
-- TRAVEL JURE - MIGRATION 001
-- Presupuestador Online Premium
-- =============================================

-- Tabla principal de solicitudes de viaje
CREATE TABLE IF NOT EXISTS travel_quotes (
  -- Identificación
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Datos personales (Paso 1)
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT NOT NULL,
  email TEXT NOT NULL,
  celular TEXT NOT NULL,
  
  -- Origen (Paso 2)
  ciudad_salida TEXT NOT NULL,
  aeropuerto_salida TEXT,
  
  -- Destino (Paso 3)
  destino TEXT NOT NULL,
  destino_personalizado TEXT,
  
  -- Fechas (Paso 4)
  tipo_fecha TEXT NOT NULL CHECK (tipo_fecha IN ('exacta', 'flexible', 'mes')),
  fecha_salida DATE,
  fecha_regreso DATE,
  rango_fecha_inicio DATE,
  rango_fecha_fin DATE,
  mes_preferido TEXT,
  
  -- Pasajeros (Paso 5)
  adultos INTEGER NOT NULL DEFAULT 1 CHECK (adultos > 0),
  ninos_2_12 INTEGER DEFAULT 0 CHECK (ninos_2_12 >= 0),
  bebes_0_2 INTEGER DEFAULT 0 CHECK (bebes_0_2 >= 0),
  
  -- Preferencias (Paso 6)
  preferencias JSONB DEFAULT '[]'::jsonb,
  
  -- Comentarios (Paso 7)
  comentarios TEXT,
  
  -- Metadata
  ip_address TEXT,
  origen_consulta TEXT DEFAULT 'web',
  estado TEXT DEFAULT 'nuevo' CHECK (estado IN (
    'nuevo', 'contactado', 'cotizado', 'reservado', 'cancelado'
  )),
  
  -- WhatsApp
  whatsapp_enviado BOOLEAN DEFAULT FALSE,
  whatsapp_mensaje TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA BÚSQUEDAS RÁPIDAS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_travel_quotes_estado ON travel_quotes(estado);
CREATE INDEX IF NOT EXISTS idx_travel_quotes_created_at ON travel_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_quotes_email ON travel_quotes(email);
CREATE INDEX IF NOT EXISTS idx_travel_quotes_destino ON travel_quotes(destino);
CREATE INDEX IF NOT EXISTS idx_travel_quotes_dni ON travel_quotes(dni);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE travel_quotes ENABLE ROW LEVEL SECURITY;

-- Política para inserción anónima (cualquiera puede enviar formularios)
CREATE POLICY "Anyone can insert quotes" ON travel_quotes
  FOR INSERT WITH CHECK (true);

-- Política para lectura solo admin autenticado
CREATE POLICY "Admin can view all quotes" ON travel_quotes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para actualización solo admin
CREATE POLICY "Admin can update quotes" ON travel_quotes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- =============================================
-- TRIGGER PARA UPDATED_AT AUTOMÁTICO
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_updated_at ON travel_quotes;
CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON travel_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- FUNCIÓN RPC PARA ESTADÍSTICAS DEL DASHBOARD
-- =============================================
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

-- =============================================
-- POLÍTICA DE ELIMINACIÓN (solo admin)
-- =============================================
CREATE POLICY "Admin can delete quotes" ON travel_quotes
  FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- COMENTARIOS EN TABLA
-- =============================================
COMMENT ON TABLE travel_quotes IS 'Solicitudes de presupuesto de viaje del wizard online';
COMMENT ON COLUMN travel_quotes.preferencias IS 'Array JSON con servicios seleccionados: solo_vuelos, vuelo_hotel, all_inclusive, crucero, asistencia_viajero, traslados, excursiones';
COMMENT ON COLUMN travel_quotes.estado IS 'Estado del lead: nuevo, contactado, cotizado, reservado, cancelado';
COMMENT ON COLUMN travel_quotes.tipo_fecha IS 'Tipo de fecha: exacta, flexible o mes';
