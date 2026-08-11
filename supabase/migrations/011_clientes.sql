-- =============================================
-- TRAVEL JURE - MIGRATION 011
-- Módulo Clientes: ficha maestra por persona + relaciones (familias/parejas/amigos)
-- + enlace automático con el histórico de viajes (travel_quotes)
-- =============================================

-- =============================================
-- 1. Tabla clientes (ficha maestra individual)
-- =============================================
CREATE TABLE IF NOT EXISTS clientes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT NOT NULL,
    apellido        TEXT NOT NULL DEFAULT '',
    dni             TEXT,
    email           TEXT,
    celular         TEXT,
    fecha_nacimiento DATE,
    pasaporte       TEXT,
    direccion       TEXT,
    notas           TEXT,
    preferencias    JSONB DEFAULT '{}'::jsonb,
    creado_por      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes (lower(nombre), lower(apellido));
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes (dni);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes (lower(email));
CREATE INDEX IF NOT EXISTS idx_clientes_celular ON clientes (celular);

-- =============================================
-- 2. Relaciones entre clientes (muchos-a-muchos sobre si misma tabla)
--    tipo: pareja | familia | amigo | otro
-- =============================================
CREATE TABLE IF NOT EXISTS clientes_relaciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id      UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    relacionado_id  UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo            TEXT NOT NULL DEFAULT 'otro',
    nota            TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (cliente_id, relacionado_id),
    CHECK (cliente_id <> relacionado_id)
);

CREATE INDEX IF NOT EXISTS idx_cr_cliente      ON clientes_relaciones (cliente_id);
CREATE INDEX IF NOT EXISTS idx_cr_relacionado  ON clientes_relaciones (relacionado_id);

-- =============================================
-- 3. Enlazar presupuestos/viajes a un cliente
-- =============================================
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_cliente  ON travel_quotes (cliente_id);

-- =============================================
-- 4. RLS
-- =============================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_relaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clientes_all ON clientes;
CREATE POLICY clientes_all ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS clientes_relaciones_all ON clientes_relaciones;
CREATE POLICY clientes_relaciones_all ON clientes_relaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- 5. Trigger updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION update_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clientes_updated_at ON clientes;
CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_clientes_updated_at();

-- =============================================
-- 6. Histórico de viajes de un cliente
--    Trae los viajes enlazados por cliente_id O, si no está enlazado
--    explícitamente, los detecta match por dni/email/celular para que
--    los presupuestos anteriores también aparezcan en el historial.
-- =============================================
CREATE OR REPLACE FUNCTION get_cliente_viajes(p_cliente_id UUID)
RETURNS TABLE (
    id             UUID,
    cliente_id     UUID,
    nombre         TEXT,
    apellido       TEXT,
    destino        TEXT,
    fecha_salida   TIMESTAMPTZ,
    fecha_regreso  TIMESTAMPTZ,
    estado         TEXT,
    ticket_id      TEXT,
    created_at     TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tq.id,
        tq.cliente_id,
        tq.nombre,
        tq.apellido,
        COALESCE(tq.destino_personalizado, tq.destino),
        tq.fecha_salida,
        tq.fecha_regreso,
        tq.estado::TEXT,
        tq.ticket_id,
        tq.created_at
    FROM travel_quotes tq
    JOIN clientes c ON c.id = p_cliente_id
    WHERE tq.cliente_id = p_cliente_id
       OR (
            (c.dni IS NOT NULL AND tq.dni IS NOT NULL AND lower(trim(tq.dni)) = lower(trim(c.dni)))
            OR (c.email IS NOT NULL AND tq.email IS NOT NULL AND lower(trim(tq.email)) = lower(trim(c.email)))
            OR (c.celular IS NOT NULL AND tq.celular IS NOT NULL AND trim(tq.celular) = trim(c.celular))
          )
    ORDER BY tq.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;