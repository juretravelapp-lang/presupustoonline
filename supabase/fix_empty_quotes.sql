-- =========================================================================
-- SCRIPT DE REPARACIÓN DIRECTO PARA SUPABASE (SOLO TRAVEL_QUOTES)
-- Copiar y pegar en el SQL Editor de Supabase y hacer click en "Run"
-- =========================================================================

-- ==========================================================
-- 1. Ticket: #JT-2026-740248
-- ==========================================================
UPDATE travel_quotes
SET nombre = 'Roberto', 
    apellido = 'Nuñez', 
    dni = '14676299', 
    email = 'whatsappferchufe@gmail.com', 
    celular = '2234396566'
WHERE ticket_id = 'JT-2026-740248';

-- ==========================================================
-- 2. Ticket: #JT-2026-683158
-- ==========================================================
UPDATE travel_quotes
SET nombre = 'Mariana', 
    apellido = 'Garcia', 
    dni = '28543383', 
    email = 'maguige02@gmail.com', 
    celular = '3886039495'
WHERE ticket_id = 'JT-2026-683158';

-- ==========================================================
-- 3. Ticket: #JT-2026-701871
-- ==========================================================
UPDATE travel_quotes
SET nombre = 'Karina', 
    apellido = 'Ayunta', 
    dni = '23041840', 
    email = 'karinaayunta4@gmail.com', 
    celular = '3815152826'
WHERE ticket_id = 'JT-2026-701871';

-- ==========================================================
-- 4. Ticket: #JT-2026-599947
-- ==========================================================
UPDATE travel_quotes
SET nombre = 'Hugo Martin', 
    apellido = 'Schwab', 
    dni = '48284714', 
    email = '', 
    celular = '3815072684'
WHERE ticket_id = 'JT-2026-599947';

-- ==========================================================
-- 5. Ticket: #JT-2026-519525
-- ==========================================================
UPDATE travel_quotes
SET nombre = 'Andrea', 
    apellido = 'Guenin', 
    dni = '18602132', 
    email = 'andugenu@gmail.com', 
    celular = '01130785667'
WHERE ticket_id = 'JT-2026-519525';

-- ==========================================================
-- 6. Ticket: #JT-2026-511622
-- ==========================================================
UPDATE travel_quotes
SET nombre = 'Nazarena', 
    apellido = 'Brites', 
    dni = '39204783', 
    email = 'nazabrites@hotmail.com', 
    celular = '2966469728'
WHERE ticket_id = 'JT-2026-511622';

-- ==========================================================
-- 7. Ticket: #JT-2026-410218
-- ==========================================================
UPDATE travel_quotes
SET nombre = 'Cynthia', 
    apellido = 'Larrahona', 
    dni = '35517820', 
    email = 'cyn_normal@hotmail.com', 
    celular = '3812227721'
WHERE ticket_id = 'JT-2026-410218';
