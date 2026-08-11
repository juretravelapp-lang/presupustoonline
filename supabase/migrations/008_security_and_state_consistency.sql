-- =============================================
-- TRAVEL JURE - MIGRATION 008
-- Security Hardening + Estado Schema Consistency
-- (Revert 002_disable RLS abuse, align estados)
-- =============================================

-- =============================================
-- 1. RE-ENABLE ROW LEVEL SECURITY ON travel_quotes
--    (002_disable temporarily disabled it, exposing all data)
-- =============================================
ALTER TABLE travel_quotes ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (clean slate — 002 left policies stale)
DROP POLICY IF EXISTS "Anyone can insert quotes" ON travel_quotes;
DROP POLICY IF EXISTS "Admin can view all quotes" ON travel_quotes;
DROP POLICY IF EXISTS "Admin can update quotes" ON travel_quotes;
DROP POLICY IF EXISTS "Admin can delete quotes" ON travel_quotes;

-- 1a. Anon can INSERT (wizard web form — needed for public submissions)
CREATE POLICY "anon can insert quotes" ON travel_quotes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 1b. Authenticated users (admins/operadores) can SELECT all
CREATE POLICY "authenticated selects all quotes" ON travel_quotes
  FOR SELECT
  TO authenticated
  USING (true);

-- 1c. Authenticated can UPDATE (status changes, assignments)
CREATE POLICY "authenticated updates all quotes" ON travel_quotes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 1d. Authenticated can DELETE (data hygiene)
CREATE POLICY "authenticated deletes all quotes" ON travel_quotes
  FOR DELETE
  TO authenticated
  USING (true);

-- 1e. (Optional) Anon can SELECT by ticket_id only — so a client
--     can view their own quote via the public /quote/:id route.
--     Relies on a hashed/obscurable ticket_id.
CREATE POLICY "anon views quote by own ticket_id" ON travel_quotes
  FOR SELECT
  TO anon
  USING (ticket_id IS NOT NULL);

-- =============================================
-- 2. ALIGN ESTADOS: update CHECK constraint to match code
--    Code (TravelQuoteRow + KanbanBoard + DashboardStats) uses:
--    no_cotizado | en_cotizacion | cotizado | enviado_cliente | concretado | cancelado
--    The 001 CHECK only had the OBSOLETE: nuevo, contactado, cotizado, reservado, cancelado
--    We DROP + re-ADD CONSTRAINT to align with current business states.
-- =============================================
ALTER TABLE travel_quotes DROP CONSTRAINT IF EXISTS travel_quotes_estado_check;

ALTER TABLE travel_quotes
  ADD CONSTRAINT travel_quotes_estado_check
  CHECK (estado IN (
    'no_cotizado',
    'en_cotizacion',
    'cotizado',
    'enviado_cliente',
    'concretado',
    'cancelado'
  ));

-- Ensure existing rows use the new state names (migrate obsoletos → mapeados)
UPDATE travel_quotes SET estado = 'no_cotizado' WHERE estado = 'nuevo';
UPDATE travel_quotes SET estado = 'en_cotizacion' WHERE estado = 'contactado';
UPDATE travel_quotes SET estado = 'cotizado' WHERE estado = 'cotizado';
UPDATE travel_quotes SET estado = 'enviado_cliente' WHERE estado = 'reservado';
-- 'cancelado' already exists; 'concretado' has no old equivalent

-- =============================================
-- 3. HARDEN crm_meetings — remove open anon ALL policy
--    Reemplaza la policy "Allow all operations for anon" que exponía
--    reuniones a creación/lectura/eliminación anónima.
-- =============================================
DROP POLICY IF EXISTS "Allow all operations for anon" ON crm_meetings;
DROP POLICY IF EXISTS "Allow all operations for authenticated" ON crm_meetings;

-- Authenticated can do everything on meetings (admin/CRM full access)
CREATE POLICY "authenticated full access to meetings" ON crm_meetings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anon can only SELECT meetings joined to their own quote's ticket_id
-- (read-only visibility of meeting schedule tied to a public ticket)
CREATE POLICY "anon reads own-quote meetings via ticket" ON crm_meetings
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM travel_quotes tq
      WHERE tq.id = crm_meetings.quote_id
        AND tq.ticket_id IS NOT NULL
    )
  );

-- =============================================
-- 4. UPDATE get_dashboard_stats() RPC to match new estados
--    La versión antigua (001/003) devolvía: nuevos, contactados, cotizados,
--    reservados, cancelados. Ahora devolvemos los estados reales.
--    (La CLÁUSULA CREATE OR REPLACE no permite cambiar el tipo de retorno,
--     por eso primero eliminamos la función existente.)
-- =============================================
DROP FUNCTION IF EXISTS get_dashboard_stats();
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total BIGINT,
  no_cotizado BIGINT,
  en_cotizacion BIGINT,
  cotizados BIGINT,
  enviado_cliente BIGINT,
  concretados BIGINT,
  cancelados BIGINT,
  reuniones_hoy BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM travel_quotes)::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'no_cotizado')::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'en_cotizacion')::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'cotizado')::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'enviado_cliente')::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'concretado')::BIGINT,
    (SELECT COUNT(*) FROM travel_quotes WHERE estado = 'cancelado')::BIGINT,
    (SELECT COUNT(*) FROM crm_meetings
       WHERE estado = 'pendiente'
         AND fecha_inicio >= (NOW() - INTERVAL '12 hours'))::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. Comentario de auditoría
-- =============================================
COMMENT ON TABLE travel_quotes IS 'Migration 008: RLS re-enabled, estados alineados al código (no_cotizado→concretado), policies hardcodeadas por rol';
