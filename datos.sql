-- ============================================================
-- DATOS DE PRUEBA - RemiSoft
-- Compatible con PostgreSQL
-- ============================================================

-- LIMPIEZA DE TABLAS (CASCADE maneja las FKs en PostgreSQL)
TRUNCATE TABLE IA_PRODUCTO        CASCADE;
TRUNCATE TABLE IA_INGREDIENTE     CASCADE;
TRUNCATE TABLE IA                 CASCADE;
TRUNCATE TABLE inventario_mov     CASCADE;
TRUNCATE TABLE Factura_item       CASCADE;
TRUNCATE TABLE domicilio          CASCADE;
TRUNCATE TABLE flujo_caja         CASCADE;
TRUNCATE TABLE pago               CASCADE;
TRUNCATE TABLE Factura            CASCADE;
TRUNCATE TABLE Detalle_pedido     CASCADE;
TRUNCATE TABLE pedido             CASCADE;
TRUNCATE TABLE detalle_orden_compra CASCADE;
TRUNCATE TABLE orden_compra       CASCADE;
TRUNCATE TABLE proveedor_ingrediente CASCADE;
TRUNCATE TABLE Receta             CASCADE;
TRUNCATE TABLE lote_ingrediente   CASCADE;
TRUNCATE TABLE Ingrediente        CASCADE;
TRUNCATE TABLE Producto           CASCADE;
TRUNCATE TABLE proveedor          CASCADE;
TRUNCATE TABLE turno_caja         CASCADE;
TRUNCATE TABLE caja               CASCADE;
TRUNCATE TABLE Cliente            CASCADE;
TRUNCATE TABLE usuario            CASCADE;
TRUNCATE TABLE rol                CASCADE;

-- 1. ROL
INSERT INTO rol (nombre, descripcion) VALUES
('SUPERADMIN',  'Acceso total al sistema'),
('ADMIN',       'Administrador del restaurante'),
('CAJERO',      'Gestión de caja y pagos'),
('MESERO',      'Toma y gestión de pedidos en mesa'),
('REPARTIDOR',  'Entrega de pedidos a domicilio'),
('COCINERO',    'Preparación de pedidos en cocina'),
('INVENTARIO',  'Gestión de inventario y proveedores'),
('SUPERVISOR',  'Supervisión de operaciones'),
('SOPORTE',     'Soporte técnico del sistema'),
('AUDITOR',     'Revisión de caja y reportes');

-- 2. USUARIO
-- NOTA: activo usa true/false en PostgreSQL, no 1/0
INSERT INTO usuario (id_rol, identificacion, nombre, apellido, email, telefono, contrasena_hash, activo) VALUES
(1, '1001', 'Carlos',     'Ramírez',  'carlos.ramirez@resto.com',   '3001234567', '$2b$12$abc123hash1',  true),
(2, '1002', 'Laura',      'Gómez',    'laura.gomez@resto.com',       '3009876543', '$2b$12$abc123hash2',  true),
(3, '1003', 'Andrés',     'Torres',   'andres.torres@resto.com',     '3101112223', '$2b$12$abc123hash3',  true),
(4, '1004', 'Sofía',      'Martínez', 'sofia.martinez@resto.com',    '3154445556', '$2b$12$abc123hash4',  true),
(5, '1005', 'Juan',       'López',    'juan.lopez@resto.com',        '3207778889', '$2b$12$abc123hash5',  true),
(4, '1006', 'Valentina',  'Herrera',  'valentina.herrera@resto.com', '3001239876', '$2b$12$abc123hash6',  true),
(3, '1007', 'Miguel',     'Castro',   'miguel.castro@resto.com',     '3109998887', '$2b$12$abc123hash7',  true),
(5, '1008', 'Isabella',   'Vargas',   'isabella.vargas@resto.com',   '3156667778', '$2b$12$abc123hash8',  true),
(2, '1009', 'Sebastián',  'Díaz',     'sebastian.diaz@resto.com',    '3203334445', '$2b$12$abc123hash9',  true),
(6, '1010', 'Camila',     'Moreno',   'camila.moreno@resto.com',     '3001115556', '$2b$12$abc123hash10', true);

-- 3. CLIENTE
INSERT INTO Cliente (Nombre, Apellido, Email, Telefono, Direccion, coordenadas_gps, tipo_documento, Num_documento) VALUES
('Pedro',    'Sánchez',  'pedro.sanchez@gmail.com',  '3101234567', 'Calle 45 # 12-30',   '4.6097,-74.0817', 'CC', '80123456'),
('Ana',      'Ruiz',     'ana.ruiz@gmail.com',        '3209876543', 'Carrera 7 # 60-15',  '4.6200,-74.0700', 'CC', '52654321'),
('Luis',     'Peña',     'luis.pena@gmail.com',       '3151112223', 'Av. 68 # 22-10',     '4.6300,-74.0900', 'CE', 'E1234567'),
('María',    'Flores',   'maria.flores@gmail.com',    '3004445556', 'Calle 100 # 15-05',  '4.6800,-74.0500', 'CC', '43876543'),
('Jorge',    'Medina',   'jorge.medina@gmail.com',    '3157778889', 'Carrera 15 # 80-25', '4.6650,-74.0600', 'CC', '79456789'),
('Natalia',  'Reyes',    'natalia.reyes@gmail.com',   '3003334445', 'Calle 72 # 9-40',    '4.6550,-74.0650', 'CC', '53789012'),
('Diego',    'Ortiz',    'diego.ortiz@gmail.com',     '3111115556', 'Kr 19 # 100-20',     '4.6900,-74.0450', 'CC', '91234567'),
('Paola',    'Jiménez',  'paola.jimenez@gmail.com',   '3206667778', 'Calle 26 # 30-55',   '4.6150,-74.0750', 'TI', '1098765432'),
('Felipe',   'Aguilar',  'felipe.aguilar@gmail.com',  '3158889990', 'Carrera 30 # 45-10', '4.6400,-74.0800', 'CC', '88345678'),
('Sandra',   'Vega',     'sandra.vega@gmail.com',     '3002221113', 'Calle 53 # 20-35',   '4.6480,-74.0720', 'CC', '64987654');

-- 4. CAJA
INSERT INTO caja (nombre, estado) VALUES
('Caja Principal',  'ACTIVA'),
('Caja Secundaria', 'ACTIVA'),
('Caja Bar',        'ACTIVA'),
('Caja Domicilios', 'ACTIVA'),
('Caja Terraza',    'INACTIVA'),
('Caja Eventos',    'INACTIVA'),
('Caja Express',    'ACTIVA'),
('Caja VIP',        'ACTIVA'),
('Caja Reserva 1',  'INACTIVA'),
('Caja Reserva 2',  'INACTIVA');

-- 5. TURNO_CAJA
INSERT INTO turno_caja (id_caja, id_usuario_cajero, fecha_apertura, fecha_cierre, efectivo_inicial, efectivo_esperado, efectivo_real, diferencia, notas, estado) VALUES
(1, 3, '2025-01-15 08:00:00', '2025-01-15 16:00:00', 200000.00, 850000.00, 845000.00, -5000.00, 'Turno mañana normal',   'CERRADA'),
(2, 7, '2025-01-15 08:00:00', '2025-01-15 16:00:00', 150000.00, 620000.00, 620000.00,     0.00, 'Sin novedades',         'CERRADA'),
(1, 3, '2025-01-15 16:00:00', '2025-01-15 23:59:00', 200000.00, 970000.00, 972000.00,  2000.00, 'Turno noche OK',        'CERRADA'),
(3, 7, '2025-01-16 08:00:00', NULL,                  100000.00, NULL,       NULL,        NULL,   'Turno activo bar',      'ABIERTA'),
(2, 3, '2025-01-16 08:00:00', NULL,                  150000.00, NULL,       NULL,        NULL,   'Turno activo caja 2',   'ABIERTA'),
(1, 7, '2025-01-14 08:00:00', '2025-01-14 16:00:00', 200000.00, 730000.00, 728000.00, -2000.00, 'Diferencia mínima',     'CERRADA'),
(4, 3, '2025-01-14 08:00:00', '2025-01-14 20:00:00',  50000.00, 480000.00, 480000.00,     0.00, 'Domicilios normales',   'CERRADA'),
(1, 7, '2025-01-13 08:00:00', '2025-01-13 16:00:00', 200000.00, 910000.00, 915000.00,  5000.00, 'Sobrante pequeño',      'CERRADA'),
(2, 3, '2025-01-13 16:00:00', '2025-01-13 23:59:00', 150000.00, 540000.00, 540000.00,     0.00, 'Todo cuadrado',         'CERRADA'),
(7, 7, '2025-01-16 10:00:00', NULL,                   80000.00, NULL,       NULL,        NULL,   'Turno express activo',  'ABIERTA');

-- 6. PROVEEDOR
INSERT INTO proveedor (nombre, nombre_contacto, telefono, email, direccion, nit, tipo_proveedor, estado) VALUES
('Frigorífico Central S.A.',        'Roberto Muñoz',    '6012345678', 'ventas@frigocentral.com',     'Zona Industrial Km 5',      '900123456-1', 'CARNES',      'ACTIVO'),
('Distribuidora Lácteos del Valle', 'Carmen Pedraza',   '6029876543', 'pedidos@lacteosvalle.com',    'Carrera 80 # 20-15',        '800234567-2', 'LACTEOS',     'ACTIVO'),
('Verduras Express Ltda.',          'Hernando Gil',     '3101234000', 'contacto@verdurasexpress.com','Plaza de Mercado Local 45', '700345678-3', 'VERDURAS',    'ACTIVO'),
('Bebidas y Licores El Barril',     'Sandra Uribe',     '3209870000', 'compras@elbarril.com',        'Calle 13 # 45-20',          '600456789-4', 'BEBIDAS',     'ACTIVO'),
('Insumos de Cocina Pro',           'Felipe Arango',    '3151110000', 'ventas@insumospro.com',       'Av. Boyacá # 60-30',        '500567890-5', 'INSUMOS',     'ACTIVO'),
('Panadería Industrial Norte',      'Gloria Niño',      '3004440000', 'pedidos@panorte.com',         'Transversal 93 # 80-10',    '400678901-6', 'PANADERIA',   'ACTIVO'),
('Salsas y Condimentos S.A.S.',     'Mauricio Salinas', '3157770000', 'info@salsasycond.com',        'Parque Industrial Sur',     '300789012-7', 'CONDIMENTOS', 'ACTIVO'),
('Aceites y Grasas Naturales',      'Luz Marina Cano',  '3003330000', 'ventas@aceitesnat.com',       'Zona Franca Bod. 12',       '200890123-8', 'ACEITES',     'ACTIVO'),
('Mariscos del Pacífico',           'Armando Pino',     '3111118000', 'pedidos@mariscospac.com',     'Central Mayorista B-20',    '100901234-9', 'MARISCOS',    'ACTIVO'),
('Frutas Tropicales S.A.',          'Esperanza Luna',   '3206660000', 'frutas@tropicales.com',       'Carrera 50 # 12-88',        '900012345-0', 'FRUTAS',      'ACTIVO');

-- 7. PRODUCTO
INSERT INTO Producto (Nombre, Descripcion, precio_venta, Categoria, Tiempo_preparacion, Estado) VALUES
('Hamburguesa Clásica', 'Carne de res, lechuga, tomate, queso cheddar',     18000.00, 'HAMBURGUESAS',    '00:12:00', 1),
('Pizza Margherita',    'Salsa de tomate, mozzarella, albahaca fresca',      32000.00, 'PIZZAS',          '00:20:00', 1),
('Ensalada César',      'Lechuga romana, pollo, crutones, aderezo césar',    14000.00, 'ENSALADAS',       '00:08:00', 1),
('Limonada Natural',    'Limón fresco, azúcar, agua, hielo',                  6000.00, 'BEBIDAS',         '00:03:00', 1),
('Papas Fritas',        'Papas a la francesa crujientes con sal',              7000.00, 'ACOMPAÑAMIENTOS', '00:10:00', 1),
('Pollo a la Plancha',  'Pechuga de pollo marinada con especias',            22000.00, 'PLATOS FUERTES',  '00:15:00', 1),
('Pasta Carbonara',     'Espagueti, tocino, huevo, queso parmesano',         24000.00, 'PASTAS',          '00:18:00', 1),
('Brownie con Helado',  'Brownie de chocolate con helado de vainilla',       12000.00, 'POSTRES',         '00:05:00', 1),
('Sopa del Día',        'Varía según disponibilidad',                          9000.00, 'SOPAS',           '00:10:00', 1),
('Jugo Natural',        'Frutas de temporada',                                 7000.00, 'BEBIDAS',         '00:04:00', 1);

-- 8. INGREDIENTE
INSERT INTO Ingrediente (nombre, descripcion, unidad_medida, costo_unitario_ref, stock_minimo) VALUES
('Carne de Res Molida', 'Carne molida especial para hamburguesas', 'KG',      18000.00,  5.00),
('Harina de Trigo',     'Harina especial para masas',              'KG',       2500.00, 10.00),
('Queso Mozzarella',    'Queso para pizza y pastas',               'KG',      22000.00,  3.00),
('Lechuga Romana',      'Lechuga fresca para ensaladas',           'KG',       4000.00,  2.00),
('Tomate Chonto',       'Tomate fresco para salsas y ensaladas',   'KG',       3000.00,  3.00),
('Pechuga de Pollo',    'Pechuga entera sin hueso',                'KG',      14000.00,  4.00),
('Espagueti',           'Pasta seca importada',                    'KG',       5500.00,  5.00),
('Huevo',               'Huevo fresco AA',                         'UNIDAD',    450.00, 30.00),
('Limón Tahití',        'Limón para bebidas y aderezos',           'KG',       3500.00,  2.00),
('Papa Pastusa',        'Papa para freír y preparaciones',         'KG',       1800.00,  8.00);

-- 9. LOTE_INGREDIENTE
INSERT INTO lote_ingrediente (id_ingrediente, numero_lote, fecha_ingreso, fecha_vencimiento, stock_inicial, stock_actual, costo_promedio, observaciones) VALUES
( 1, 'LOTE-CARNE-001',   '2025-01-10', '2025-01-17', 20.000, 15.500, 18000.00, 'Lote fresco frigorífico central'),
( 2, 'LOTE-HARINA-001',  '2025-01-05', '2025-04-05', 50.000, 42.000,  2500.00, 'Harina de primera calidad'),
( 3, 'LOTE-MOZZ-001',    '2025-01-12', '2025-01-26', 10.000,  8.200, 22000.00, 'Mozzarella bloque'),
( 4, 'LOTE-LECHUGA-001', '2025-01-14', '2025-01-19',  5.000,  4.100,  4000.00, 'Lechuga fresca del día'),
( 5, 'LOTE-TOMATE-001',  '2025-01-13', '2025-01-20',  8.000,  6.500,  3000.00, 'Tomate maduro selecto'),
( 6, 'LOTE-POLLO-001',   '2025-01-12', '2025-01-16', 15.000, 11.000, 14000.00, 'Pollo refrigerado'),
( 7, 'LOTE-ESPAG-001',   '2025-01-01', '2026-01-01', 20.000, 18.500,  5500.00, 'Pasta seca larga vida'),
( 8, 'LOTE-HUEVO-001',   '2025-01-13', '2025-01-27',120.000, 98.000,   450.00, 'Huevos AA bandeja'),
( 9, 'LOTE-LIMON-001',   '2025-01-14', '2025-01-21',  6.000,  5.200,  3500.00, 'Limón verde fresco'),
(10, 'LOTE-PAPA-001',    '2025-01-10', '2025-01-24', 25.000, 20.000,  1800.00, 'Papa pastusa cosecha nueva');

-- 10. RECETA
INSERT INTO Receta (id_producto, id_ingrediente, Cantidad_necesaria, Unidad) VALUES
(1, 1, 0.200, 'KG'),
(1, 4, 0.050, 'KG'),
(1, 5, 0.060, 'KG'),
(1, 3, 0.040, 'KG'),
(2, 2, 0.250, 'KG'),
(2, 3, 0.150, 'KG'),
(2, 5, 0.100, 'KG'),
(6, 6, 0.250, 'KG'),
(7, 7, 0.200, 'KG'),
(7, 8, 2.000, 'UNIDAD');

-- 11. PEDIDO
-- NOTA: solo pedidos DOMICILIO tienen registro en tabla domicilio
INSERT INTO pedido (id_cliente, id_mesero, estado, Tipo_pedido, Mesa_num, notas) VALUES
(1, 4, 'CERRADO',        'MESA',      3,    'Sin cebolla por favor'),
(2, 6, 'CERRADO',        'MESA',      7,    NULL),
(3, 4, 'CERRADO',        'DOMICILIO', NULL, 'Entregar en portería'),
(4, 6, 'EN_PREPARACION', 'MESA',      1,    'Alergia al gluten - informar cocina'),
(5, 4, 'ABIERTO',        'MESA',      5,    NULL),
(6, 6, 'CERRADO',        'DOMICILIO', NULL, 'Llamar antes de llegar'),
(7, 4, 'CERRADO',        'MESA',      2,    NULL),
(8, 6, 'LISTO',          'MESA',      4,    'Extra salsa BBQ'),
(9, 4, 'CERRADO',        'DOMICILIO', NULL, NULL),
(10,6, 'ABIERTO',        'MESA',      8,    'Mesa de cumpleaños');

-- 12. DETALLE_PEDIDO
INSERT INTO Detalle_pedido (id_pedido, id_producto, Cantidad, Precio_unitario, estado_item) VALUES
(1,  1, 2, 18000.00, 'ENTREGADO'),
(1,  5, 2,  7000.00, 'ENTREGADO'),
(2,  2, 1, 32000.00, 'ENTREGADO'),
(2,  4, 2,  6000.00, 'ENTREGADO'),
(3,  6, 1, 22000.00, 'ENTREGADO'),
(3, 10, 1,  7000.00, 'ENTREGADO'),
(4,  7, 2, 24000.00, 'PREPARANDO'),
(5,  9, 1,  9000.00, 'PENDIENTE'),
(5,  3, 1, 14000.00, 'PENDIENTE'),
(6,  1, 3, 18000.00, 'ENTREGADO');

-- 13. FACTURA
INSERT INTO Factura (id_pedido, consecutivo, CUFE, IVA, Descuento, Propina, total, estado) VALUES
(1, 'FAC-2025-0001', 'CUFE001abc',  8360.00,    0.00, 5000.00, 59360.00, 'PAGADA'),
(2, 'FAC-2025-0002', 'CUFE002abc',  8360.00, 5000.00,    0.00, 47360.00, 'PAGADA'),
(3, 'FAC-2025-0003', 'CUFE003abc',  5510.00,    0.00,    0.00, 34510.00, 'PAGADA'),
(6, 'FAC-2025-0004', 'CUFE004abc', 10240.00,    0.00,    0.00, 64240.00, 'PAGADA'),
(7, 'FAC-2025-0005', 'CUFE005abc',  6000.00, 2000.00, 3000.00, 39000.00, 'PAGADA'),
(9, 'FAC-2025-0006', 'CUFE006abc',  6840.00,    0.00,    0.00, 42840.00, 'PAGADA'),
(4, 'FAC-2025-0007', 'CUFE007abc',  9120.00,    0.00,    0.00, 57120.00, 'EMITIDA'),
(8, 'FAC-2025-0008', 'CUFE008abc',  5320.00,    0.00, 2000.00, 33320.00, 'EMITIDA'),
(5, 'FAC-2025-0009', 'CUFE009abc',  3420.00,    0.00,    0.00, 21420.00, 'ANULADA'),
(10,'FAC-2025-0010', 'CUFE010abc',  2000.00,    0.00,    0.00, 14000.00, 'EMITIDA');

-- 14. PAGO
INSERT INTO pago (id_factura, id_usuario_cajero, metodo, monto, referencia, estado, id_turno) VALUES
(1, 3, 'EFECTIVO',        59360.00, NULL,           'APROBADO',  1),
(2, 3, 'TARJETA_CREDITO', 47360.00, 'REF-TC-00234', 'APROBADO',  1),
(3, 7, 'NEQUI',           34510.00, 'NEQ-8845612',  'APROBADO',  2),
(4, 3, 'EFECTIVO',        64240.00, NULL,           'APROBADO',  3),
(5, 7, 'DAVIPLATA',       39000.00, 'DAV-9923411',  'APROBADO',  2),
(6, 3, 'TARJETA_DEBITO',  42840.00, 'REF-TD-00891', 'APROBADO',  1),
(7, 7, 'EFECTIVO',        57120.00, NULL,           'APROBADO',  4),
(8, 3, 'TARJETA_CREDITO', 33320.00, 'REF-TC-00567', 'APROBADO',  5),
(9, 7, 'EFECTIVO',        21420.00, NULL,           'RECHAZADO', 2),
(10,3, 'PSE',             14000.00, 'PSE-441231',   'APROBADO',  3);

-- 15. FLUJO_CAJA
INSERT INTO flujo_caja (id_turno, concepto, ingresos, egresos, saldo, metodo, referencia, id_pago) VALUES
(1, 'Apertura de caja',           200000.00,     0.00, 200000.00, 'EFECTIVO',        NULL,           NULL),
(1, 'Pago factura FAC-2025-0001',  59360.00,     0.00, 259360.00, 'EFECTIVO',        NULL,           1),
(1, 'Pago factura FAC-2025-0002',  47360.00,     0.00, 306720.00, 'TARJETA_CREDITO', 'REF-TC-00234', 2),
(1, 'Pago factura FAC-2025-0006',  42840.00,     0.00, 349560.00, 'TARJETA_DEBITO',  'REF-TD-00891', 6),
(2, 'Apertura de caja',           150000.00,     0.00, 150000.00, 'EFECTIVO',        NULL,           NULL),
(2, 'Pago factura FAC-2025-0003',  34510.00,     0.00, 184510.00, 'NEQUI',           'NEQ-8845612',  3),
(2, 'Pago factura FAC-2025-0005',  39000.00,     0.00, 223510.00, 'DAVIPLATA',       'DAV-9923411',  5),
(3, 'Apertura de caja',           200000.00,     0.00, 200000.00, 'EFECTIVO',        NULL,           NULL),
(3, 'Pago factura FAC-2025-0004',  64240.00,     0.00, 264240.00, 'EFECTIVO',        NULL,           4),
(3, 'Gasto insumos limpieza',           0.00, 15000.00, 249240.00, 'EFECTIVO',       'COMP-001',     NULL);

-- 16. FACTURA_ITEM
INSERT INTO Factura_item (id_factura, id_detalle_pedido, cantidad_facturada) VALUES
(1, 1, 2),
(1, 2, 2),
(2, 3, 1),
(2, 4, 2),
(3, 5, 1),
(3, 6, 1),
(4, 10, 3),
(7, 7, 2),
(8, 8, 1),
(8, 9, 1);

-- 17. DOMICILIO
-- NOTA: solo se insertan pedidos cuyo Tipo_pedido = 'DOMICILIO' (ids 3, 6, 9)
INSERT INTO domicilio (id_pedido, direccion, coordenadas_gps, estado, fecha_entrega, id_repartidor) VALUES
(3, 'Av. 68 # 22-10',    '4.6300,-74.0900', 'ENTREGADO', '2025-01-15 13:45:00', 5),
(6, 'Calle 72 # 9-40',   '4.6550,-74.0650', 'ENTREGADO', '2025-01-15 20:30:00', 8),
(9, 'Carrera 30 # 45-10','4.6400,-74.0800', 'ENTREGADO', '2025-01-14 19:00:00', 5);

-- 18. ORDEN_COMPRA
INSERT INTO orden_compra (id_proveedor, id_usuario, fecha_entrega_esperada, fecha_entrega_real, estado, observaciones) VALUES
(1, 9, '2025-01-17', '2025-01-17', 'RECIBIDA',  'Pedido urgente de carnes'),
(2, 9, '2025-01-18', NULL,         'PENDIENTE', 'Reposición lácteos'),
(3, 9, '2025-01-16', '2025-01-16', 'RECIBIDA',  'Verduras frescas semana'),
(4, 9, '2025-01-20', NULL,         'APROBADA',  'Bebidas para el fin de semana'),
(5, 9, '2025-01-19', NULL,         'PENDIENTE', 'Insumos varios'),
(1, 2, '2025-01-14', '2025-01-14', 'RECIBIDA',  'Compra semanal carnes'),
(3, 2, '2025-01-13', '2025-01-13', 'RECIBIDA',  'Verduras lunes'),
(6, 9, '2025-01-21', NULL,         'PENDIENTE', 'Pan artesanal'),
(9, 2, '2025-01-15', '2025-01-15', 'RECIBIDA',  'Mariscos frescos'),
(10,9, '2025-01-18', NULL,         'APROBADA',  'Frutas tropicales');

-- 19. DETALLE_ORDEN_COMPRA
INSERT INTO detalle_orden_compra (id_orden_compra, id_ingrediente, cantidad_solicitada, cantidad_recibida, precio_unitario) VALUES
(1,  1, 20.00, 20.00, 18000.00),
(2,  3, 10.00,  0.00, 22000.00),
(3,  4,  5.00,  5.00,  4000.00),
(3,  5,  8.00,  8.00,  3000.00),
(4,  7, 15.00,  0.00,  5500.00),
(5,  2, 30.00,  0.00,  2500.00),
(6,  1, 15.00, 15.00, 18000.00),
(7,  4,  4.00,  4.00,  4000.00),
(8,  8, 60.00,  0.00,   450.00),
(9, 10, 20.00, 20.00,  1800.00);

-- 20. PROVEEDOR_INGREDIENTE
-- NOTA: es_proveedor_principal usa true/false en PostgreSQL
INSERT INTO proveedor_ingrediente (id_proveedor, id_ingrediente, precio_acordado, tiempo_entrega_dias, calidad_rating, es_proveedor_principal, fecha_ultima_compra) VALUES
(1,  1, 18000.00, 1, 4.8, true,  '2025-01-14 09:00:00'),
(2,  3, 22000.00, 2, 4.5, true,  '2025-01-12 10:00:00'),
(3,  4,  4000.00, 1, 4.7, true,  '2025-01-13 08:00:00'),
(3,  5,  3000.00, 1, 4.6, true,  '2025-01-13 08:00:00'),
(5,  2,  2500.00, 2, 4.3, true,  '2025-01-10 11:00:00'),
(4,  7,  5500.00, 3, 4.2, true,  '2025-01-08 09:00:00'),
(6,  8,   450.00, 1, 4.9, true,  '2025-01-10 08:00:00'),
(9,  6, 14000.00, 1, 4.7, true,  '2025-01-12 09:00:00'),
(10, 9,  3500.00, 1, 4.5, true,  '2025-01-11 10:00:00'),
(10,10,  1800.00, 1, 4.4, true,  '2025-01-10 10:00:00');

-- 21. INVENTARIO_MOV
INSERT INTO inventario_mov (id_ingrediente, id_usuario, tipo_movimiento, cantidad, costo_unitario, observaciones, origen_tipo, origen_id, id_lote) VALUES
( 1, 9, 'ENTRADA', 20.000, 18000.00, 'Compra orden #1',            'ORDEN_COMPRA', 1,  1),
( 4, 9, 'ENTRADA',  5.000,  4000.00, 'Compra orden #3',            'ORDEN_COMPRA', 3,  4),
( 5, 9, 'ENTRADA',  8.000,  3000.00, 'Compra orden #3',            'ORDEN_COMPRA', 3,  5),
( 1, 4, 'SALIDA',   0.400, 18000.00, 'Pedido #1 - 2 hamburguesas', 'PEDIDO',       1,  1),
( 6, 6, 'SALIDA',   0.250, 14000.00, 'Pedido #3 - pollo plancha',  'PEDIDO',       3,  6),
( 7, 6, 'SALIDA',   0.400,  5500.00, 'Pedido #4 - 2 carbonaras',   'PEDIDO',       4,  7),
( 8, 6, 'SALIDA',   4.000,   450.00, 'Pedido #4 - 2 carbonaras',   'PEDIDO',       4,  8),
( 2, 9, 'ENTRADA', 50.000,  2500.00, 'Compra orden #6',            'ORDEN_COMPRA', 6,  2),
( 3, 9, 'ENTRADA', 10.000, 22000.00, 'Compra orden #2 (parcial)',  'ORDEN_COMPRA', 2,  3),
(10, 9, 'ENTRADA', 20.000,  1800.00, 'Compra orden #9',            'ORDEN_COMPRA', 9, 10);

-- 22. IA
INSERT INTO IA (Tipo_prediccion, Resultado_generado, Recomendaciones_generales, Nivel_confianza, periodo_inicio, periodo_fin) VALUES
('DEMANDA_SEMANAL',     'Alta demanda proyectada para hamburguesas y pizzas',  'Aumentar stock de carne y mozzarella',                  0.872, '2025-01-20', '2025-01-26'),
('DEMANDA_MENSUAL',     'Incremento esperado del 15% en ventas de bebidas',    'Revisar stock de limones y jugos',                      0.831, '2025-02-01', '2025-02-28'),
('STOCK_CRITICO',       'Riesgo de desabasto en pollo y lechuga',              'Realizar orden de compra urgente',                      0.915, '2025-01-15', '2025-01-16'),
('PREDICCION_INGRESOS', 'Ingresos estimados $4.2M semana siguiente',           'Mantener turnos completos viernes y sábado',            0.768, '2025-01-20', '2025-01-26'),
('TENDENCIA_PRODUCTOS', 'Ensalada César con crecimiento sostenido',            'Destacar en menú digital',                              0.790, '2025-01-01', '2025-01-15'),
('DEMANDA_SEMANAL',     'Baja demanda proyectada para sopas',                  'Reducir preparación de sopas lunes-martes',             0.843, '2025-01-13', '2025-01-19'),
('STOCK_CRITICO',       'Ingrediente huevo próximo a stock mínimo',            'Generar orden de compra proveedor 6',                   0.900, '2025-01-16', '2025-01-17'),
('DEMANDA_FIN_SEMANA',  'Picos de demanda sábado 12:00-15:00',                 'Asignar mesero adicional en ese horario',               0.855, '2025-01-18', '2025-01-19'),
('TENDENCIA_CLIENTES',  'Fidelización alta en clientes 1, 5 y 8',             'Ofrecer descuento especial a clientes frecuentes',      0.720, '2025-01-01', '2025-01-15'),
('DESPERDICIO',         'Merma elevada en lechuga y tomate',                   'Ajustar porciones o renegociar cantidad con proveedor', 0.810, '2025-01-01', '2025-01-15');

-- 23. IA_INGREDIENTE
-- NOTA: Ingrediente_critico usa true/false en PostgreSQL
INSERT INTO IA_INGREDIENTE (id_IA, id_ingrediente, Demanda_predicha_ingrediente, Nivel_confianza, Ingrediente_critico) VALUES
( 1,  1,  45.50, 0.870, false),
( 1,  3,  22.00, 0.860, false),
( 3,  6,  12.00, 0.910, true),
( 3,  4,   8.50, 0.900, true),
( 7,  8, 150.00, 0.905, true),
( 2,  9,  10.00, 0.820, false),
( 6,  4,   6.00, 0.840, false),
(10,  5,   9.00, 0.805, true),
(10,  4,   7.50, 0.812, true),
( 8,  1,  38.00, 0.850, false);

-- 24. IA_PRODUCTO
-- NOTA: Producto_critico usa true/false en PostgreSQL
INSERT INTO IA_PRODUCTO (id_IA, id_producto, demanda_predicho_producto, nivel_confianza_producto, Producto_critico, Recomendacion_producto) VALUES
(1, 1, 120.00, 0.875, false, 'Mantener stock suficiente de ingredientes para hamburguesa'),
(1, 2,  85.00, 0.860, false, 'Verificar harina y mozzarella disponibles'),
(5, 3,  60.00, 0.790, false, 'Promover en redes sociales'),
(6, 9,  15.00, 0.843, true,  'Reducir cantidad preparada lunes y martes'),
(4, 4, 200.00, 0.770, false, 'Incluir en combos para incrementar venta'),
(4,10, 180.00, 0.765, false, 'Buena rotación, mantener stock de frutas'),
(8, 1, 145.00, 0.858, false, 'Reforzar equipo cocina sábado mediodía'),
(2, 4, 250.00, 0.830, false, 'Alta rotación, revisar stock limones'),
(9, 6,  90.00, 0.720, false, 'Ofrecer en menú del día para clientes frecuentes'),
(3, 6,  40.00, 0.910, true,  'Solicitar pedido urgente al proveedor 9');