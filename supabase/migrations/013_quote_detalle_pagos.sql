-- =============================================
-- TRAVEL JURE - MIGRATION 013
-- Detalle profesional de la cotización + módulo de pagos
--  1. columna cotizacion_detalles (JSONB) en travel_quotes:
--     { observaciones, pasajeros: [ {nombre, apellido, dni, pasaporte,
--       fecha_nacimiento, edad, observaciones, pedidos_especiales} ] }
--  2. tabla crm_pagos: historial de pagos por cotización
--     (moneda ARS/USD, cuotas, vencimientos, formas de pago)
-- =============================================

-- =============================================
-- 1. Detalle fino de la cotización (JSONB sobre travel_quotes)
-- =============================================
ALTER TABLE travel_quotes ADD COLUMN IF NOT EXISTS cotizacion_detalles JSONB DEFAULT '{}'::jsonb;

-- =============================================
-- 2. Tabla crm_pagos
-- =============================================
CREATE TABLE IF NOT EXISTS crm_pagos (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id          UUID NOT NULL REFERENCES travel_quotes(id) ON DELETE CASCADE,
    cliente_id        UUID REFERENCES clientes(id) ON DELETE SET NULL,
    ticket_id         TEXT,                              -- denormalizado: JT-YYYY-###### (para listados rápidos)
    cliente_nombre    TEXT,                              -- denormalizado: "Juan Pérez"
    concepto          TEXT NOT NULL,
    moneda            TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS','USD')),
    monto             NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (monto >= 0),
    forma_pago        TEXT,                              -- transferencia | efectivo | tarjeta_credito | tarjeta_debito | mercado_pago | otro
    fecha_pago        DATE,                              -- cuándo se acreditó (null mientras está pendiente)
    fecha_vencimiento DATE,                              -- vencimiento de la cuota (para alertas)
    estado            TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','pagado','cancelado')),
    es_cuota          BOOLEAN NOT NULL DEFAULT FALSE,
    cuota_numero      INTEGER,                           -- N° de cuota (si es cuota)
    cuota_total       INTEGER,                           -- total de cuotas del plan
    notas             TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_pagos_quote      ON crm_pagos (quote_id);
CREATE INDEX IF NOT EXISTS idx_crm_pagos_cliente    ON crm_pagos (cliente_id);
CREATE INDEX IF NOT EXISTS idx_crm_pagos_estado     ON crm_pagos (estado);
CREATE INDEX IF NOT EXISTS idx_crm_pagos_moneda     ON crm_pagos (moneda);
CREATE INDEX IF NOT EXISTS idx_crm_pagos_vencim     ON crm_pagos (fecha_vencimiento);

-- =============================================
-- 3. RLS
-- =============================================
ALTER TABLE crm_pagos ENABLE ROW LEVEL SECURITY;

-- Administración completa para usuarios logueados
CREATE POLICY "authenticated full access to pagos" ON crm_pagos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Anon (public): solo lectura, para que la página del cliente (link /quote/:id)
-- pueda consultar el estado de pagos sin autenticarse.
CREATE POLICY "anon reads pagos" ON crm_pagos
    FOR SELECT
    TO anon
    USING (true);

-- =============================================
-- 4. Trigger updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION update_crm_pagos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crm_pagos_updated_at ON crm_pagos;
CREATE TRIGGER trg_crm_pagos_updated_at
    BEFORE UPDATE ON crm_pagos
    FOR EACH ROW
    EXECUTE FUNCTION update_crm_pagos_updated_at();

COMMENT ON TABLE crm_pagos IS 'Historial de pagos y cuotas por cotización (ARS/USD)';
