-- =============================================
-- TRAVEL JURE - MIGRATION 005
-- CRM Meetings: Tabla dedicada de reuniones
-- =============================================

-- 1. Crear tabla crm_meetings
CREATE TABLE IF NOT EXISTS crm_meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID NOT NULL REFERENCES travel_quotes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL DEFAULT 'Reunión comercial',
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'realizada', 'cancelada', 'reprogramada')),
    tipo TEXT NOT NULL DEFAULT 'presencial'
        CHECK (tipo IN ('presencial', 'videollamada', 'telefonica')),
    notas TEXT,
    creado_por TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índices para consultas rápidas de calendario y por lead
CREATE INDEX IF NOT EXISTS idx_crm_meetings_fecha ON crm_meetings (fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_crm_meetings_quote ON crm_meetings (quote_id);
CREATE INDEX IF NOT EXISTS idx_crm_meetings_estado ON crm_meetings (estado);

-- 3. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_crm_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crm_meetings_updated_at ON crm_meetings;
CREATE TRIGGER trg_crm_meetings_updated_at
    BEFORE UPDATE ON crm_meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_crm_meetings_updated_at();

-- 4. RLS Policies (consistente con travel_quotes)
ALTER TABLE crm_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" ON crm_meetings
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated" ON crm_meetings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Migrar reuniones existentes de travel_quotes a crm_meetings
-- Si hay quotes con reunion_fecha no nula, creamos registros en la nueva tabla
INSERT INTO crm_meetings (quote_id, titulo, fecha_inicio, estado, tipo, notas, creado_por)
SELECT
    id,
    'Reunión comercial (migrada)',
    reunion_fecha,
    COALESCE(reunion_estado, 'pendiente'),
    'presencial',
    notas_crm,
    creador_email
FROM travel_quotes
WHERE reunion_fecha IS NOT NULL
ON CONFLICT DO NOTHING;

-- 6. Comentarios
COMMENT ON TABLE crm_meetings IS 'Reuniones del CRM asociadas a cotizaciones/leads';
COMMENT ON COLUMN crm_meetings.quote_id IS 'FK a travel_quotes — el lead asociado a la reunión';
COMMENT ON COLUMN crm_meetings.titulo IS 'Título/asunto de la reunión';
COMMENT ON COLUMN crm_meetings.fecha_inicio IS 'Fecha y hora de inicio de la reunión';
COMMENT ON COLUMN crm_meetings.fecha_fin IS 'Fecha y hora de fin de la reunión (opcional)';
COMMENT ON COLUMN crm_meetings.estado IS 'Estado: pendiente, realizada, cancelada, reprogramada';
COMMENT ON COLUMN crm_meetings.tipo IS 'Tipo: presencial, videollamada, telefonica';
COMMENT ON COLUMN crm_meetings.notas IS 'Notas/minutas de la reunión';
COMMENT ON COLUMN crm_meetings.creado_por IS 'Email/nombre del agente que creó la reunión';
