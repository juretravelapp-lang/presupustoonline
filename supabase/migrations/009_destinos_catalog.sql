-- =============================================
-- TRAVEL JURE - MIGRATION 009
-- Catálogo CRUD de Destinos Turísticos
-- Seed basado en DESTINOS_POPULARES (src/lib/constants.ts)
-- =============================================

CREATE TABLE IF NOT EXISTS crm_destinos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  emoji TEXT,
  color TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_destinos_slug     ON crm_destinos(slug);
CREATE INDEX IF NOT EXISTS idx_crm_destinos_activo   ON crm_destinos(activo);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE crm_destinos ENABLE ROW LEVEL SECURITY;

-- Authenticated (admin/operador) full CRUD
CREATE POLICY "authenticated full access to destinos" ON crm_destinos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anon can read active destinos only (wizard Step 1 reads this catalog)
CREATE POLICY "anon reads active destinos" ON crm_destinos
  FOR SELECT
  TO anon
  USING (activo = true);

-- =============================================
-- Trigger updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION update_crm_destinos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crm_destinos_updated_at ON crm_destinos;
CREATE TRIGGER trg_crm_destinos_updated_at
  BEFORE UPDATE ON crm_destinos
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_destinos_updated_at();

-- =============================================
-- Seed: destinos populares del wizard (009)
-- =============================================
INSERT INTO crm_destinos (nombre, slug, emoji, color) VALUES
  ('Punta Cana',         'punta_cana',         '🌊', '#CE1126'),
  ('Cancún',             'cancun',             '🏖️', '#006847'),
  ('Playa del Carmen',   'playa_del_carmen',   '🌴', '#006847'),
  ('Aruba',              'aruba',              '🦩', '#0072C6'),
  ('Curazao',            'curazao',            '🐠', '#002B7F'),
  ('Río de Janeiro',     'rio_de_janeiro',     '⛰️', '#009739'),
  ('Norte de Brasil',    'norte_brasil',       '🥥', '#009739'),
  ('USA',                'usa',                '🗽', '#B22234'),
  ('Disney',             'disney',             '✨', '#1E3A5F'),
  ('Europa',             'europa',             '🏰', '#003399'),
  ('Cruceros',           'cruceros',           '🚢', '#0077B6'),
  ('Otros destinos',     'otro',               '🗺️', '#64748B')
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE crm_destinos IS 'Catálogo CRUD de destinos turísticos — alimenta el wizard Step 1 y reportes TTOO';
