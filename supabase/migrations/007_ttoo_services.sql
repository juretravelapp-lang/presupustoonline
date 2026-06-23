CREATE TABLE IF NOT EXISTS crm_ttoo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    contacto TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE crm_ttoo ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON crm_ttoo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON crm_ttoo FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read for authenticated users" ON crm_servicios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON crm_servicios FOR ALL TO authenticated USING (true);

-- Populate defaults for servicios
INSERT INTO crm_servicios (nombre, descripcion) VALUES
('Hotel', 'Alojamiento'),
('Vuelo', 'Aéreo'),
('Excursión', 'Paseos y actividades'),
('Traslado', 'Transporte terrestre'),
('Asistencia', 'Seguro de viaje'),
('Otro', 'Servicio misceláneo');
