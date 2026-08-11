-- =============================================
-- TRAVEL JURE - MIGRATION 012
-- Backfill: crear fichas de clientes desde los presupuestos existentes
-- que aún no tienen cliente_id, vinculando cada presupuesto a su cliente.
-- Match normalizado por dni / email / celular para agrupar duplicados.
-- =============================================

-- Helpers de normalización (se eliminan al final)
CREATE OR REPLACE FUNCTION _jure_norm_dni(x TEXT) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT REGEXP_REPLACE(COALESCE(x, ''), '[^0-9]', '', 'g')
$$;

CREATE OR REPLACE FUNCTION _jure_norm_cel(x TEXT) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN length(d) >= 12 AND d LIKE '54%' THEN substr(d, 3)   -- +54 / 54...
    WHEN length(d) = 11 AND d LIKE '9%'  THEN substr(d, 2)    -- 9 3815...
    ELSE d
  END
  FROM (SELECT REGEXP_REPLACE(COALESCE(x, ''), '[^0-9]', '', 'g') AS d) t
$$;

DO $$
DECLARE
    q RECORD;
    v_id UUID;
BEGIN
    FOR q IN
        SELECT *
        FROM travel_quotes
        WHERE cliente_id IS NULL
          AND (
               NULLIF(TRIM(dni), '')    IS NOT NULL
            OR NULLIF(TRIM(email), '')  IS NOT NULL
            OR NULLIF(TRIM(celular), '') IS NOT NULL
          )
        ORDER BY created_at ASC
    LOOP
        -- 1. Buscar cliente existente con match normalizado
        SELECT c.id INTO v_id
        FROM clientes c
        WHERE
            (q.dni IS NOT NULL AND c.dni IS NOT NULL
             AND _jure_norm_dni(c.dni) = _jure_norm_dni(q.dni))
          OR (q.email IS NOT NULL AND c.email IS NOT NULL
             AND LOWER(TRIM(c.email)) = LOWER(TRIM(q.email)))
          OR (q.celular IS NOT NULL AND c.celular IS NOT NULL
             AND _jure_norm_cel(c.celular) = _jure_norm_cel(q.celular))
        LIMIT 1;

        -- 2. Si no existe, crear la ficha
        IF v_id IS NULL THEN
            INSERT INTO clientes (nombre, apellido, dni, email, celular, notas)
            VALUES (
                TRIM(q.nombre),
                COALESCE(NULLIF(TRIM(q.apellido), ''), ''),
                q.dni,
                q.email,
                q.celular,
                'Creado automáticamente desde el presupuesto ' || COALESCE(q.ticket_id, q.id::text)
            )
            RETURNING id INTO v_id;
        END IF;

        -- 3. Vincular el presupuesto al cliente
        UPDATE travel_quotes
        SET cliente_id = v_id, updated_at = NOW()
        WHERE id = q.id;
    END LOOP;
END $$;

DROP FUNCTION IF EXISTS _jure_norm_dni(TEXT);
DROP FUNCTION IF EXISTS _jure_norm_cel(TEXT);

COMMENT ON TABLE clientes IS 'Ficha maestra de clientes — alimentada automáticamente desde travel_quotes (modo cliente, operador y backfill 012)';
