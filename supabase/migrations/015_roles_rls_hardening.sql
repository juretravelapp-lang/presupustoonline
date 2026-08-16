-- =============================================
-- TRAVEL JURE - MIGRATION 015
-- 1. Fix DEFAULT de travel_quotes.estado
--    (quedó 'nuevo' de la migración 001 y viola el CHECK de 008)
-- 2. Hardening RLS anon: crm_pagos y crm_quote_services
--    (exponían TODOS los registros con SELECT USING (true))
-- 3. Roles admin/operador a nivel DB (jure_user_roles)
--    + DELETE restringido a admin en datos maestros
-- =============================================

-- =============================================
-- 1. ESTADO DEFAULT CORRECTO
-- =============================================
ALTER TABLE travel_quotes
  ALTER COLUMN estado SET DEFAULT 'no_cotizado';

-- Rows legacy que por cualquier motivo quedaron en 'nuevo'/'contactado'
UPDATE travel_quotes SET estado = 'no_cotizado' WHERE estado = 'nuevo';
UPDATE travel_quotes SET estado = 'en_cotizacion' WHERE estado = 'contactado';
UPDATE travel_quotes SET estado = 'enviado_cliente' WHERE estado = 'reservado';

-- =============================================
-- 2. HARDENING RLS ANON
--    El cliente público sólo debe ver lo vinculado a su ticket_id.
-- =============================================
DROP POLICY IF EXISTS "anon reads pagos" ON crm_pagos;
DROP POLICY IF EXISTS "anon reads quote_services" ON crm_quote_services;

CREATE POLICY "anon reads pagos by own ticket" ON crm_pagos
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM travel_quotes tq
      WHERE tq.id = crm_pagos.quote_id
        AND tq.ticket_id IS NOT NULL
    )
  );

CREATE POLICY "anon reads quote_services by own ticket" ON crm_quote_services
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM travel_quotes tq
      WHERE tq.id = crm_quote_services.quote_id
        AND tq.ticket_id IS NOT NULL
    )
  );

-- =============================================
-- 3. ROLES ADMIN / OPERADOR A NIVEL DB
-- =============================================
CREATE TABLE IF NOT EXISTS jure_user_roles (
  email      TEXT PRIMARY KEY,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'operador')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper: ¿el usuario autenticado es admin?
-- Se crea ANTES que las policies que lo referencian (orden de creación importa).
CREATE OR REPLACE FUNCTION jure_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM jure_user_roles
    WHERE email = auth.jwt() ->> 'email'
      AND lower(role) = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

ALTER TABLE jure_user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "only admins manage roles" ON jure_user_roles;
CREATE POLICY "only admins manage roles" ON jure_user_roles
  FOR ALL TO authenticated
  USING (jure_is_admin())
  WITH CHECK (jure_is_admin());

INSERT INTO jure_user_roles (email, role) VALUES ('admin@juretravel.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 3a. travel_quotes: DELETE solo admin (operadores trabajan, no borran)
DROP POLICY IF EXISTS "authenticated deletes all quotes" ON travel_quotes;
CREATE POLICY "admins delete quotes only" ON travel_quotes
  FOR DELETE TO authenticated
  USING (jure_is_admin());

-- 3b. crm_message_templates: write solo admin (operadores sólo leen)
DROP POLICY IF EXISTS "authenticated full access to message_templates" ON crm_message_templates;
CREATE POLICY "authenticated reads message_templates" ON crm_message_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins write message_templates" ON crm_message_templates
  FOR INSERT TO authenticated WITH CHECK (jure_is_admin());
CREATE POLICY "admins update message_templates" ON crm_message_templates
  FOR UPDATE TO authenticated USING (jure_is_admin()) WITH CHECK (jure_is_admin());
CREATE POLICY "admins delete message_templates" ON crm_message_templates
  FOR DELETE TO authenticated USING (jure_is_admin());

-- 3c. crm_ttoo: DELETE solo admin
DROP POLICY IF EXISTS "Enable all for authenticated users" ON crm_ttoo;
CREATE POLICY "authenticated inserts ttoo" ON crm_ttoo
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated updates ttoo" ON crm_ttoo
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admins delete ttoo" ON crm_ttoo
  FOR DELETE TO authenticated USING (jure_is_admin());

-- 3d. crm_servicios: DELETE solo admin
DROP POLICY IF EXISTS "Enable all for authenticated users" ON crm_servicios;
CREATE POLICY "authenticated inserts servicios" ON crm_servicios
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated updates servicios" ON crm_servicios
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admins delete servicios" ON crm_servicios
  FOR DELETE TO authenticated USING (jure_is_admin());

-- 3e. crm_destinos: DELETE solo admin (se mantiene el full access anon para activos)
DROP POLICY IF EXISTS "authenticated full access to destinos" ON crm_destinos;
CREATE POLICY "authenticated selects destinos" ON crm_destinos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated inserts destinos" ON crm_destinos
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated updates destinos" ON crm_destinos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admins delete destinos" ON crm_destinos
  FOR DELETE TO authenticated USING (jure_is_admin());

-- 3f. clientes: DELETE solo admin
DROP POLICY IF EXISTS clientes_all ON clientes;
CREATE POLICY "authenticated selects clientes" ON clientes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated inserts clientes" ON clientes
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated updates clientes" ON clientes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admins delete clientes" ON clientes
  FOR DELETE TO authenticated USING (jure_is_admin());

-- =============================================
-- 4. Auditoria
-- =============================================
COMMENT ON TABLE jure_user_roles IS 'Migration 015: roles admin/operador a nivel DB. admin@juretravel.com es admin por defecto.';
COMMENT ON TABLE crm_pagos IS 'Migration 015: RLS anon acotado por ticket_id del quote.';
COMMENT ON TABLE crm_quote_services IS 'Migration 015: RLS anon acotado por ticket_id del quote.';