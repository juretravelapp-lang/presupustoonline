-- =============================================
-- TRAVEL JURE - SEED DATA
-- 20 registros de prueba para travel_quotes
-- =============================================

INSERT INTO travel_quotes (nombre, apellido, dni, email, celular, ciudad_salida, aeropuerto_salida, destino, destinos, destino_personalizado, tipo_fecha, fecha_salida, fecha_regreso, rango_fecha_inicio, rango_fecha_fin, mes_preferido, adultos, ninos_2_12, bebes_0_2, preferencias, comentarios, tipo_viaje, estado, created_at, updated_at) VALUES
('María', 'González', '30123456', 'maria.gonzalez@gmail.com', '3815551001', 'tucuman', 'TUC - Teniente General Benjamín Matienzo', 'brasil', '["brasil"]', NULL, 'exacta', '2026-07-15', '2026-07-25', NULL, NULL, NULL, 2, 1, 0, '["vuelo_hotel", "all_inclusive", "traslados"]', 'Preferimos hotel frente al mar en Florianópolis', 'vacaciones', 'nuevo', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('Carlos', 'López', '27123456', 'carlos.lopez@hotmail.com', '3815551002', 'tucuman', 'TUC - Teniente General Benjamín Matienzo', 'caribe', '["caribe"]', NULL, 'flexible', NULL, NULL, '2026-08-01', '2026-08-15', NULL, 2, 0, 0, '["vuelo_hotel", "all_inclusive"]', 'Buscamos todo incluido en Punta Cana', 'luna_de_miel', 'nuevo', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('Ana', 'Martínez', '33456789', 'ana.martinez@outlook.com', '3815551003', 'buenos_aires', 'EZE - Ministro Pistarini', 'europa', '["europa"]', NULL, 'exacta', '2026-09-10', '2026-09-24', NULL, NULL, NULL, 1, 0, 0, '["solo_vuelos", "asistencia_viajero"]', 'Viaje solo a Madrid y París, necesito vuelos', 'vacaciones', 'nuevo', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),

('Pedro', 'Sosa', '28987654', 'pedro.sosa@yahoo.com', '3815551004', 'cordoba', 'COR - Ingeniero Ambrosio Taravella', 'estados_unidos', '["estados_unidos", "disney"]', NULL, 'mes', NULL, NULL, NULL, NULL, 'Octubre', 2, 2, 0, '["vuelo_hotel", "excursiones", "traslados"]', 'Familia con dos hijos, queremos Orlando y Disney', 'familia', 'nuevo', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

('Laura', 'Fernández', '31234567', 'laura.fernandez@gmail.com', '3815551005', 'salta', 'SLA - Martín Miguel de Güemes', 'mexico', '["mexico"]', NULL, 'exacta', '2026-11-20', '2026-11-30', NULL, NULL, NULL, 2, 0, 0, '["vuelo_hotel", "all_inclusive"]', 'Todo incluido en Cancún para luna de miel', 'luna_de_miel', 'contactado', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'),

('Jorge', 'Ramírez', '25789123', 'jorge.ramirez@gmail.com', '3815551006', 'rosario', 'ROS - Islas Malvinas', 'disney', '["disney"]', NULL, 'flexible', NULL, NULL, '2027-01-05', '2027-01-20', NULL, 2, 3, 1, '["vuelo_hotel", "excursiones", "asistencia_viajero"]', 'Viaje familiar con 3 niños, presupuesto para 7-10 días', 'familia', 'contactado', NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days'),

('Sofía', 'Díaz', '34567890', 'sofia.diaz@hotmail.com', '3815551007', 'mendoza', 'MDZ - El Plumerillo', 'cruceros', '["cruceros"]', NULL, 'exacta', '2026-12-05', '2026-12-15', NULL, NULL, NULL, 2, 0, 0, '["crucero", "all_inclusive", "excursiones"]', 'Crucero por el Mediterráneo, cabina con balcón', 'vacaciones', 'cotizado', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),

('Diego', 'Torres', '28123456', 'diego.torres@gmail.com', '3815551008', NULL, NULL, 'brasil', '["brasil"]', 'Río de Janeiro', 'mes', NULL, NULL, NULL, NULL, 'Febrero', 4, 0, 0, '["vuelo_hotel", "excursiones"]', 'Grupo de 4 amigos para carnaval de Río', 'aventura', 'cotizado', NOW() - INTERVAL '25 days', NOW() - INTERVAL '22 days'),

('Valentina', 'Castillo', '36123456', 'valentina.castillo@gmail.com', '3815551009', 'buenos_aires', 'EZE - Ministro Pistarini', 'europa', '["europa"]', NULL, 'exacta', '2026-07-01', '2026-07-15', NULL, NULL, NULL, 1, 0, 0, '["solo_vuelos", "asistencia_viajero"]', 'Backpacking por Italia, solo vuelos', 'aventura', 'nuevo', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

('Roberto', 'Mendoza', '30456789', 'roberto.mendoza@yahoo.com', '3815551010', 'cordoba', 'COR - Ingeniero Ambrosio Taravella', 'punta_cana', '["punta_cana"]', NULL, 'flexible', NULL, NULL, '2026-10-10', '2026-10-20', NULL, 2, 1, 0, '["all_inclusive", "traslados", "excursiones"]', 'Todo incluido preferiblemente en Bahía Príncipe', 'familia', 'nuevo', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

('Florencia', 'Paz', '33123456', 'florencia.paz@hotmail.com', '3815551011', NULL, NULL, 'caribe', '["caribe"]', NULL, 'exacta', '2026-08-20', '2026-08-27', NULL, NULL, NULL, 2, 0, 0, '["vuelo_hotel", "all_inclusive"]', 'Semana en Jamaica, todo incluido', 'romantico', 'reservado', NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days'),

('Gustavo', 'Acosta', '26678901', 'gustavo.acosta@gmail.com', '3815551012', 'rosario', 'ROS - Islas Malvinas', 'mexico', '["mexico"]', NULL, 'exacta', '2026-11-01', '2026-11-08', NULL, NULL, NULL, 2, 0, 1, '["all_inclusive"]', NULL, 'vacaciones', 'reservado', NOW() - INTERVAL '35 days', NOW() - INTERVAL '33 days'),

('Camila', 'Vega', '35123456', 'camila.vega@outlook.com', '3815551013', 'tucuman', 'TUC - Teniente General Benjamín Matienzo', 'disney', '["disney"]', NULL, 'flexible', NULL, NULL, '2027-03-15', '2027-03-30', NULL, 2, 2, 0, '["vuelo_hotel", "excursiones", "asistencia_viajero", "traslados"]', 'Paquete completo Disney Orlando con parques', 'familia', 'contactado', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days'),

('Luciano', 'Rivas', '29456789', 'luciano.rivas@gmail.com', '3815551014', 'buenos_aires', 'EZE - Ministro Pistarini', 'otro', '["otro"]', 'Tailandia', 'exacta', '2026-12-10', '2027-01-05', NULL, NULL, NULL, 1, 0, 0, '["solo_vuelos", "asistencia_viajero"]', 'Viaje de mochilero por Tailandia y Camboya', 'aventura', 'nuevo', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('Elena', 'Suárez', '32123456', 'elena.suarez@hotmail.com', '3815551015', 'mendoza', 'MDZ - El Plumerillo', 'brasil', '["brasil"]', NULL, 'mes', NULL, NULL, NULL, NULL, 'Enero', 2, 0, 0, '["vuelo_hotel", "excursiones"]', 'Queremos conocer Salvador de Bahía', 'vacaciones', 'cancelado', NOW() - INTERVAL '40 days', NOW() - INTERVAL '38 days'),

('Federico', 'Luna', '27890123', 'federico.luna@gmail.com', '3815551016', 'tucuman', 'TUC - Teniente General Benjamín Matienzo', 'europa', '["europa"]', NULL, 'flexible', NULL, NULL, '2026-09-01', '2026-09-20', NULL, 2, 0, 0, '["vuelo_hotel", "asistencia_viajero"]', 'Recorrido por varias ciudades europeas, presupuesto moderado', 'vacaciones', 'cotizado', NOW() - INTERVAL '22 days', NOW() - INTERVAL '20 days'),

('Martina', 'Peralta', '37234567', 'martina.peralta@gmail.com', '3815551017', 'cordoba', 'COR - Ingeniero Ambrosio Taravella', 'punta_cana', '["punta_cana"]', NULL, 'exacta', '2026-10-25', '2026-11-01', NULL, NULL, NULL, 2, 0, 0, '["all_inclusive", "excursiones"]', 'Viaje de egresados, grupo de 15 personas', 'egresados', 'nuevo', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('Hernán', 'Cáceres', '26123456', 'hernan.caceres@yahoo.com', '3815551018', 'salta', 'SLA - Martín Miguel de Güemes', 'estados_unidos', '["estados_unidos"]', NULL, 'exacta', '2026-12-20', '2026-12-30', NULL, NULL, NULL, 3, 0, 0, '["vuelo_hotel", "traslados"]', 'Año nuevo en Nueva York, presupuesto para 3 adultos', 'vacaciones', 'reservado', NOW() - INTERVAL '45 days', NOW() - INTERVAL '43 days'),

('Gabriela', 'Moreno', '31678901', 'gabriela.moreno@hotmail.com', '3815551019', 'rosario', 'ROS - Islas Malvinas', 'caribe', '["caribe"]', NULL, 'mes', NULL, NULL, NULL, NULL, 'Mayo', 2, 0, 0, '["all_inclusive"]', 'Aniversario de bodas, buscamos algo romántico', 'romantico', 'nuevo', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

('Santiago', 'Roldán', '28901234', 'santiago.roldan@gmail.com', '3815551020', 'buenos_aires', 'EZE - Ministro Pistarini', 'mexico', '["mexico"]', NULL, 'flexible', NULL, NULL, '2027-02-01', '2027-02-15', NULL, 2, 0, 0, '["solo_vuelos", "asistencia_viajero"]', 'Buscamos vuelos baratos a Ciudad de México', 'negocios', 'cancelado', NOW() - INTERVAL '50 days', NOW() - INTERVAL '48 days');
