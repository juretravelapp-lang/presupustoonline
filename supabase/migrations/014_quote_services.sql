-- =============================================
-- TRAVEL JURE - MIGRATION 014
-- Nueva Arquitectura: crm_quote_services
-- =============================================

-- =============================================
-- 1. Crear tabla crm_quote_services
-- =============================================
CREATE TABLE IF NOT EXISTS crm_quote_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES travel_quotes(id) ON DELETE CASCADE,
    servicio_id UUID REFERENCES crm_servicios(id) ON DELETE RESTRICT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    proveedor TEXT,
    precio_total NUMERIC(14,2) NOT NULL DEFAULT 0,
    moneda TEXT NOT NULL DEFAULT 'USD' CHECK (moneda IN ('ARS','USD')),
    fecha_desde DATE,
    fecha_hasta DATE,
    estado TEXT NOT NULL DEFAULT 'cotizado' CHECK (estado IN ('cotizado', 'reservado', 'confirmado', 'emitido', 'cancelado', 'finalizado')),
    orden INTEGER DEFAULT 0,
    notas TEXT,
    detalles_operativos JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_quote_srv_quote ON crm_quote_services (quote_id);
CREATE INDEX IF NOT EXISTS idx_crm_quote_srv_servicio ON crm_quote_services (servicio_id);
CREATE INDEX IF NOT EXISTS idx_crm_quote_srv_estado ON crm_quote_services (estado);

-- =============================================
-- 2. Modificar crm_pagos para enlazar a crm_quote_services
-- =============================================
ALTER TABLE crm_pagos ADD COLUMN IF NOT EXISTS quote_service_id UUID REFERENCES crm_quote_services(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_crm_pagos_service ON crm_pagos (quote_service_id);

-- =============================================
-- 3. RLS para crm_quote_services
-- =============================================
ALTER TABLE crm_quote_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated full access to quote_services" ON crm_quote_services
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Anon access para visualizar (ej: presupuesto online para el cliente)
CREATE POLICY "anon reads quote_services" ON crm_quote_services
    FOR SELECT
    TO anon
    USING (true);

-- =============================================
-- 4. Trigger updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION update_crm_quote_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crm_quote_services_updated_at ON crm_quote_services;
CREATE TRIGGER trg_crm_quote_services_updated_at
    BEFORE UPDATE ON crm_quote_services
    FOR EACH ROW
    EXECUTE FUNCTION update_crm_quote_services_updated_at();

COMMENT ON TABLE crm_quote_services IS 'Servicios independientes vinculados a una cotización, con sus propios precios y detalles operativos.';
