-- =============================================
-- FIX: Políticas RLS para travel_quotes
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Verificar si RLS está habledo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'travel_quotes';

-- Deshabilitar RLS temporalmente para permitir inserciones
ALTER TABLE travel_quotes DISABLE ROW LEVEL SECURITY;

-- O si preferís mantener RLS habilitado, crear política correcta:
-- ALTER TABLE travel_quotes ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Anyone can insert quotes" ON travel_quotes;
-- CREATE POLICY "allow_anonymous_insert" ON travel_quotes
--   FOR INSERT
--   WITH CHECK (true);

-- Verificar que la tabla existe y tiene datos
SELECT COUNT(*) FROM travel_quotes;
