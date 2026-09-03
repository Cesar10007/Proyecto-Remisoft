/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.18-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: remisoft
-- ------------------------------------------------------
-- Server version	11.4.4-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Cliente`
--

DROP TABLE IF EXISTS `Cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cliente` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) DEFAULT NULL,
  `Apellido` varchar(50) DEFAULT NULL,
  `Email` varchar(60) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Direccion` varchar(120) DEFAULT NULL,
  `coordenadas_gps` varchar(80) DEFAULT NULL,
  `tipo_documento` varchar(30) DEFAULT NULL,
  `Num_documento` varchar(30) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cliente`
--

LOCK TABLES `Cliente` WRITE;
/*!40000 ALTER TABLE `Cliente` DISABLE KEYS */;
INSERT INTO `Cliente` VALUES
(1,'Pedro','Sánchez','pedro.sanchez@gmail.com','3101234567','Calle 45 # 12-30','4.6097,-74.0817','CC','80123456','2026-09-02 20:42:08'),
(2,'Ana','Ruiz','ana.ruiz@gmail.com','3209876543','Carrera 7 # 60-15','4.6200,-74.0700','CC','52654321','2026-09-02 20:42:08'),
(3,'Luis','Peña','luis.pena@gmail.com','3151112223','Av. 68 # 22-10','4.6300,-74.0900','CE','E1234567','2026-09-02 20:42:08'),
(4,'María','Flores','maria.flores@gmail.com','3004445556','Calle 100 # 15-05','4.6800,-74.0500','CC','43876543','2026-09-02 20:42:08'),
(5,'Jorge','Medina','jorge.medina@gmail.com','3157778889','Carrera 15 # 80-25','4.6650,-74.0600','CC','79456789','2026-09-02 20:42:08'),
(6,'Natalia','Reyes','natalia.reyes@gmail.com','3003334445','Calle 72 # 9-40','4.6550,-74.0650','CC','53789012','2026-09-02 20:42:08'),
(7,'Diego','Ortiz','diego.ortiz@gmail.com','3111115556','Kr 19 # 100-20','4.6900,-74.0450','CC','91234567','2026-09-02 20:42:08'),
(8,'Paola','Jiménez','paola.jimenez@gmail.com','3206667778','Calle 26 # 30-55','4.6150,-74.0750','TI','1098765432','2026-09-02 20:42:08'),
(9,'Felipe','Aguilar','felipe.aguilar@gmail.com','3158889990','Carrera 30 # 45-10','4.6400,-74.0800','CC','88345678','2026-09-02 20:42:08'),
(10,'Sandra','Vega','sandra.vega@gmail.com','3002221113','Calle 53 # 20-35','4.6480,-74.0720','CC','64987654','2026-09-02 20:42:08');
/*!40000 ALTER TABLE `Cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Detalle_pedido`
--

DROP TABLE IF EXISTS `Detalle_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Detalle_pedido` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `Cantidad` int(11) DEFAULT NULL,
  `Precio_unitario` decimal(10,2) DEFAULT NULL,
  `estado_item` varchar(20) DEFAULT 'PENDIENTE',
  PRIMARY KEY (`id_detalle`),
  KEY `id_pedido` (`id_pedido`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `Detalle_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  CONSTRAINT `Detalle_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Detalle_pedido`
--

LOCK TABLES `Detalle_pedido` WRITE;
/*!40000 ALTER TABLE `Detalle_pedido` DISABLE KEYS */;
INSERT INTO `Detalle_pedido` VALUES
(1,1,1,2,18000.00,'ENTREGADO'),
(2,1,5,2,7000.00,'ENTREGADO'),
(3,2,2,1,32000.00,'ENTREGADO'),
(4,2,4,2,6000.00,'ENTREGADO'),
(5,3,6,1,22000.00,'ENTREGADO'),
(6,3,10,1,7000.00,'ENTREGADO'),
(7,4,7,2,24000.00,'PREPARANDO'),
(8,5,9,1,9000.00,'PENDIENTE'),
(9,5,3,1,14000.00,'PENDIENTE'),
(10,6,1,3,18000.00,'ENTREGADO');
/*!40000 ALTER TABLE `Detalle_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Factura`
--

DROP TABLE IF EXISTS `Factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Factura` (
  `id_factura` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `Fecha_emision` datetime DEFAULT current_timestamp(),
  `consecutivo` varchar(40) DEFAULT NULL,
  `CUFE` varchar(80) DEFAULT NULL,
  `IVA` decimal(10,2) DEFAULT NULL,
  `Descuento` decimal(10,2) DEFAULT 0.00,
  `Propina` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'EMITIDA',
  PRIMARY KEY (`id_factura`),
  UNIQUE KEY `id_pedido` (`id_pedido`),
  CONSTRAINT `Factura_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Factura`
--

LOCK TABLES `Factura` WRITE;
/*!40000 ALTER TABLE `Factura` DISABLE KEYS */;
INSERT INTO `Factura` VALUES
(1,1,'2026-09-02 20:42:08','FAC-2025-0001','CUFE001abc',8360.00,0.00,5000.00,59360.00,'PAGADA'),
(2,2,'2026-09-02 20:42:08','FAC-2025-0002','CUFE002abc',8360.00,5000.00,0.00,47360.00,'PAGADA'),
(3,3,'2026-09-02 20:42:08','FAC-2025-0003','CUFE003abc',5510.00,0.00,0.00,34510.00,'PAGADA'),
(4,6,'2026-09-02 20:42:08','FAC-2025-0004','CUFE004abc',10240.00,0.00,0.00,64240.00,'PAGADA'),
(5,7,'2026-09-02 20:42:08','FAC-2025-0005','CUFE005abc',6000.00,2000.00,3000.00,39000.00,'PAGADA'),
(6,9,'2026-09-02 20:42:08','FAC-2025-0006','CUFE006abc',6840.00,0.00,0.00,42840.00,'PAGADA'),
(7,4,'2026-09-02 20:42:08','FAC-2025-0007','CUFE007abc',9120.00,0.00,0.00,57120.00,'EMITIDA'),
(8,8,'2026-09-02 20:42:08','FAC-2025-0008','CUFE008abc',5320.00,0.00,2000.00,33320.00,'EMITIDA'),
(9,5,'2026-09-02 20:42:08','FAC-2025-0009','CUFE009abc',3420.00,0.00,0.00,21420.00,'ANULADA'),
(10,10,'2026-09-02 20:42:08','FAC-2025-0010','CUFE010abc',2000.00,0.00,0.00,14000.00,'EMITIDA');
/*!40000 ALTER TABLE `Factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Factura_item`
--

DROP TABLE IF EXISTS `Factura_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Factura_item` (
  `id_factura` int(11) NOT NULL,
  `id_detalle_pedido` int(11) NOT NULL,
  `cantidad_facturada` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_factura`,`id_detalle_pedido`),
  KEY `id_detalle_pedido` (`id_detalle_pedido`),
  CONSTRAINT `Factura_item_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `Factura` (`id_factura`),
  CONSTRAINT `Factura_item_ibfk_2` FOREIGN KEY (`id_detalle_pedido`) REFERENCES `Detalle_pedido` (`id_detalle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Factura_item`
--

LOCK TABLES `Factura_item` WRITE;
/*!40000 ALTER TABLE `Factura_item` DISABLE KEYS */;
INSERT INTO `Factura_item` VALUES
(1,1,2),
(1,2,2),
(2,3,1),
(2,4,2),
(3,5,1),
(3,6,1),
(4,10,3),
(7,7,2),
(8,8,1),
(8,9,1);
/*!40000 ALTER TABLE `Factura_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `IA`
--

DROP TABLE IF EXISTS `IA`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `IA` (
  `id_IA` int(11) NOT NULL AUTO_INCREMENT,
  `Fecha_generacion` datetime DEFAULT current_timestamp(),
  `Tipo_prediccion` varchar(50) DEFAULT NULL,
  `Resultado_generado` varchar(500) DEFAULT NULL,
  `Recomendaciones_generales` varchar(500) DEFAULT NULL,
  `Nivel_confianza` decimal(4,3) DEFAULT NULL,
  `periodo_inicio` date DEFAULT NULL,
  `periodo_fin` date DEFAULT NULL,
  PRIMARY KEY (`id_IA`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `IA`
--

LOCK TABLES `IA` WRITE;
/*!40000 ALTER TABLE `IA` DISABLE KEYS */;
INSERT INTO `IA` VALUES
(1,'2026-09-02 20:42:08','DEMANDA_SEMANAL','Alta demanda proyectada para hamburguesas y pizzas','Aumentar stock de carne y mozzarella',0.872,'2025-01-20','2025-01-26'),
(2,'2026-09-02 20:42:08','DEMANDA_MENSUAL','Incremento esperado del 15% en ventas de bebidas','Revisar stock de limones y jugos',0.831,'2025-02-01','2025-02-28'),
(3,'2026-09-02 20:42:08','STOCK_CRITICO','Riesgo de desabasto en pollo y lechuga','Realizar orden de compra urgente',0.915,'2025-01-15','2025-01-16'),
(4,'2026-09-02 20:42:08','PREDICCION_INGRESOS','Ingresos estimados $4.2M semana siguiente','Mantener turnos completos viernes y sábado',0.768,'2025-01-20','2025-01-26'),
(5,'2026-09-02 20:42:08','TENDENCIA_PRODUCTOS','Ensalada César con crecimiento sostenido','Destacar en menú digital',0.790,'2025-01-01','2025-01-15'),
(6,'2026-09-02 20:42:08','DEMANDA_SEMANAL','Baja demanda proyectada para sopas','Reducir preparación de sopas lunes-martes',0.843,'2025-01-13','2025-01-19'),
(7,'2026-09-02 20:42:08','STOCK_CRITICO','Ingrediente huevo próximo a stock mínimo','Generar orden de compra proveedor 6',0.900,'2025-01-16','2025-01-17'),
(8,'2026-09-02 20:42:08','DEMANDA_FIN_SEMANA','Picos de demanda sábado 12:00-15:00','Asignar mesero adicional en ese horario',0.855,'2025-01-18','2025-01-19'),
(9,'2026-09-02 20:42:08','TENDENCIA_CLIENTES','Fidelización alta en clientes 1, 5 y 8','Ofrecer descuento especial a clientes frecuentes',0.720,'2025-01-01','2025-01-15'),
(10,'2026-09-02 20:42:08','DESPERDICIO','Merma elevada en lechuga y tomate','Ajustar porciones o renegociar cantidad con proveedor',0.810,'2025-01-01','2025-01-15');
/*!40000 ALTER TABLE `IA` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `IA_INGREDIENTE`
--

DROP TABLE IF EXISTS `IA_INGREDIENTE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `IA_INGREDIENTE` (
  `id_IA_ingrediente` int(11) NOT NULL AUTO_INCREMENT,
  `id_IA` int(11) NOT NULL,
  `id_ingrediente` int(11) NOT NULL,
  `Demanda_predicha_ingrediente` decimal(10,2) DEFAULT NULL,
  `Nivel_confianza` decimal(4,3) DEFAULT NULL,
  `Ingrediente_critico` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_IA_ingrediente`),
  KEY `id_IA` (`id_IA`),
  KEY `id_ingrediente` (`id_ingrediente`),
  CONSTRAINT `IA_INGREDIENTE_ibfk_1` FOREIGN KEY (`id_IA`) REFERENCES `IA` (`id_IA`),
  CONSTRAINT `IA_INGREDIENTE_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `IA_INGREDIENTE`
--

LOCK TABLES `IA_INGREDIENTE` WRITE;
/*!40000 ALTER TABLE `IA_INGREDIENTE` DISABLE KEYS */;
INSERT INTO `IA_INGREDIENTE` VALUES
(1,1,1,45.50,0.870,0),
(2,1,3,22.00,0.860,0),
(3,3,6,12.00,0.910,1),
(4,3,4,8.50,0.900,1),
(5,7,8,150.00,0.905,1),
(6,2,9,10.00,0.820,0),
(7,6,4,6.00,0.840,0),
(8,10,5,9.00,0.805,1),
(9,10,4,7.50,0.812,1),
(10,8,1,38.00,0.850,0);
/*!40000 ALTER TABLE `IA_INGREDIENTE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `IA_PRODUCTO`
--

DROP TABLE IF EXISTS `IA_PRODUCTO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `IA_PRODUCTO` (
  `id_IA_producto` int(11) NOT NULL AUTO_INCREMENT,
  `id_IA` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `demanda_predicho_producto` decimal(10,2) DEFAULT NULL,
  `nivel_confianza_producto` decimal(4,3) DEFAULT NULL,
  `Producto_critico` tinyint(1) DEFAULT 0,
  `Recomendacion_producto` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_IA_producto`),
  KEY `id_IA` (`id_IA`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `IA_PRODUCTO_ibfk_1` FOREIGN KEY (`id_IA`) REFERENCES `IA` (`id_IA`),
  CONSTRAINT `IA_PRODUCTO_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `IA_PRODUCTO`
--

LOCK TABLES `IA_PRODUCTO` WRITE;
/*!40000 ALTER TABLE `IA_PRODUCTO` DISABLE KEYS */;
INSERT INTO `IA_PRODUCTO` VALUES
(1,1,1,120.00,0.875,0,'Mantener stock suficiente de ingredientes para hamburguesa'),
(2,1,2,85.00,0.860,0,'Verificar harina y mozzarella disponibles'),
(3,5,3,60.00,0.790,0,'Promover en redes sociales'),
(4,6,9,15.00,0.843,1,'Reducir cantidad preparada lunes y martes'),
(5,4,4,200.00,0.770,0,'Incluir en combos para incrementar venta'),
(6,4,10,180.00,0.765,0,'Buena rotación, mantener stock de frutas'),
(7,8,1,145.00,0.858,0,'Reforzar equipo cocina sábado mediodía'),
(8,2,4,250.00,0.830,0,'Alta rotación, revisar stock limones'),
(9,9,6,90.00,0.720,0,'Ofrecer en menú del día para clientes frecuentes'),
(10,3,6,40.00,0.910,1,'Solicitar pedido urgente al proveedor 9');
/*!40000 ALTER TABLE `IA_PRODUCTO` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ingrediente`
--

DROP TABLE IF EXISTS `Ingrediente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ingrediente` (
  `id_ingrediente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `unidad_medida` varchar(20) DEFAULT NULL,
  `costo_unitario_ref` decimal(10,2) DEFAULT NULL,
  `stock_minimo` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id_ingrediente`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ingrediente`
--

LOCK TABLES `Ingrediente` WRITE;
/*!40000 ALTER TABLE `Ingrediente` DISABLE KEYS */;
INSERT INTO `Ingrediente` VALUES
(1,'Carne de Res Molida','Carne molida especial para hamburguesas','KG',18000.00,5.00),
(2,'Harina de Trigo','Harina especial para masas','KG',2500.00,10.00),
(3,'Queso Mozzarella','Queso para pizza y pastas','KG',22000.00,3.00),
(4,'Lechuga Romana','Lechuga fresca para ensaladas','KG',4000.00,2.00),
(5,'Tomate Chonto','Tomate fresco para salsas y ensaladas','KG',3000.00,3.00),
(6,'Pechuga de Pollo','Pechuga entera sin hueso','KG',14000.00,4.00),
(7,'Espagueti','Pasta seca importada','KG',5500.00,5.00),
(8,'Huevo','Huevo fresco AA','UNIDAD',450.00,30.00),
(9,'Limón Tahití','Limón para bebidas y aderezos','KG',3500.00,2.00),
(10,'Papa Pastusa','Papa para freír y preparaciones','KG',1800.00,8.00);
/*!40000 ALTER TABLE `Ingrediente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Producto`
--

DROP TABLE IF EXISTS `Producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Producto` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) DEFAULT NULL,
  `Descripcion` varchar(500) DEFAULT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `Categoria` varchar(30) DEFAULT NULL,
  `Tiempo_preparacion` time DEFAULT NULL,
  `Estado` int(11) DEFAULT 1,
  `id_categoria` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `Producto_ibfk_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_productos` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Producto`
--

LOCK TABLES `Producto` WRITE;
/*!40000 ALTER TABLE `Producto` DISABLE KEYS */;
INSERT INTO `Producto` VALUES
(1,'Hamburguesa Clásica','Carne de res, lechuga, tomate, queso cheddar',18000.00,'HAMBURGUESAS','00:12:00',1,NULL),
(2,'Pizza Margherita','Salsa de tomate, mozzarella, albahaca fresca',32000.00,'PIZZAS','00:20:00',1,NULL),
(3,'Ensalada César','Lechuga romana, pollo, crutones, aderezo césar',14000.00,'ENSALADAS','00:08:00',1,NULL),
(4,'Limonada Natural','Limón fresco, azúcar, agua, hielo',6000.00,'BEBIDAS','00:03:00',1,NULL),
(5,'Papas Fritas','Papas a la francesa crujientes con sal',7000.00,'ACOMPAÑAMIENTOS','00:10:00',1,NULL),
(6,'Pollo a la Plancha','Pechuga de pollo marinada con especias',22000.00,'PLATOS FUERTES','00:15:00',1,NULL),
(7,'Pasta Carbonara','Espagueti, tocino, huevo, queso parmesano',24000.00,'PASTAS','00:18:00',1,NULL),
(8,'Brownie con Helado','Brownie de chocolate con helado de vainilla',12000.00,'POSTRES','00:05:00',1,NULL),
(9,'Sopa del Día','Varía según disponibilidad',9000.00,'SOPAS','00:10:00',1,NULL),
(10,'Jugo Natural','Frutas de temporada',7000.00,'BEBIDAS','00:04:00',1,NULL);
/*!40000 ALTER TABLE `Producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Receta`
--

DROP TABLE IF EXISTS `Receta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Receta` (
  `id_receta` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `id_ingrediente` int(11) NOT NULL,
  `Cantidad_necesaria` decimal(10,3) DEFAULT NULL,
  `Unidad` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_receta`),
  KEY `id_ingrediente` (`id_ingrediente`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `Receta_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_producto`),
  CONSTRAINT `Receta_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Receta`
--

LOCK TABLES `Receta` WRITE;
/*!40000 ALTER TABLE `Receta` DISABLE KEYS */;
INSERT INTO `Receta` VALUES
(1,1,1,0.200,'KG'),
(2,1,4,0.050,'KG'),
(3,1,5,0.060,'KG'),
(4,1,3,0.040,'KG'),
(5,2,2,0.250,'KG'),
(6,2,3,0.150,'KG'),
(7,2,5,0.100,'KG'),
(8,6,6,0.250,'KG'),
(9,7,7,0.200,'KG'),
(10,7,8,2.000,'UNIDAD');
/*!40000 ALTER TABLE `Receta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('64e9063a-91f5-4a9d-b940-66ab1d5c3e10','8e9fdd2d8cbc2cb616160634b309bf23c0878907a85fa1ae5edc228390c83714','2026-09-02 04:20:45.219','20260817210009_add_product_categories',NULL,NULL,'2026-09-02 04:20:45.163',1),
('7a7186be-a7df-4423-9614-f8f1be15f036','7ec6a9db2f2cb3e1e7dfd2e74a145fd096091e190c3e7697d68bf76223bf9075','2026-09-02 18:37:11.351','20260902183711_agregar_solicitudes_registro',NULL,NULL,'2026-09-02 18:37:11.261',1),
('a03c7e63-13f7-46fc-8ad1-4f0d5ed9b569','4ca09c319485024e7066bc0543461772cf58acf1ce373cbaf80a96c0ff9e01b0','2026-09-02 04:20:45.262','20260822_add_restaurante',NULL,NULL,'2026-09-02 04:20:45.219',1),
('ff1ff3e3-9b7d-4594-a70c-9f50727ca97b','46fa39a04205287762c3ca211df47dbcfd181b564f213726d0c153b8ac7cae45','2026-09-02 04:20:45.162','0_init',NULL,NULL,'2026-09-02 04:20:44.203',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `caja`
--

DROP TABLE IF EXISTS `caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `caja` (
  `id_caja` int(11) NOT NULL AUTO_INCREMENT,
  `id_restaurante` int(11) DEFAULT NULL,
  `nombre` varchar(40) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'ACTIVA',
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_caja`),
  KEY `idx_caja_restaurante` (`id_restaurante`),
  CONSTRAINT `caja_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caja`
--

LOCK TABLES `caja` WRITE;
/*!40000 ALTER TABLE `caja` DISABLE KEYS */;
INSERT INTO `caja` VALUES
(1,1,'Caja Principal','ACTIVA','2026-09-02 20:42:08'),
(2,2,'Caja Secundaria','ACTIVA','2026-09-02 20:42:08'),
(3,2,'Caja Bar','ACTIVA','2026-09-02 20:42:08'),
(4,1,'Caja Domicilios','ACTIVA','2026-09-02 20:42:08'),
(5,1,'Caja Terraza','INACTIVA','2026-09-02 20:42:08'),
(6,2,'Caja Eventos','INACTIVA','2026-09-02 20:42:08'),
(7,2,'Caja Express','ACTIVA','2026-09-02 20:42:08'),
(8,NULL,'Caja VIP','ACTIVA','2026-09-02 20:42:08'),
(9,NULL,'Caja Reserva 1','INACTIVA','2026-09-02 20:42:08'),
(10,NULL,'Caja Reserva 2','INACTIVA','2026-09-02 20:42:08');
/*!40000 ALTER TABLE `caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria_productos`
--

DROP TABLE IF EXISTS `categoria_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria_productos` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `categoria_productos_nombre_key` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria_productos`
--

LOCK TABLES `categoria_productos` WRITE;
/*!40000 ALTER TABLE `categoria_productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `categoria_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_orden_compra`
--

DROP TABLE IF EXISTS `detalle_orden_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_orden_compra` (
  `id_detalle_compra` int(11) NOT NULL AUTO_INCREMENT,
  `id_orden_compra` int(11) NOT NULL,
  `id_ingrediente` int(11) NOT NULL,
  `cantidad_solicitada` decimal(10,2) DEFAULT NULL,
  `cantidad_recibida` decimal(10,2) DEFAULT 0.00,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_detalle_compra`),
  KEY `id_ingrediente` (`id_ingrediente`),
  KEY `id_orden_compra` (`id_orden_compra`),
  CONSTRAINT `detalle_orden_compra_ibfk_1` FOREIGN KEY (`id_orden_compra`) REFERENCES `orden_compra` (`id_orden_compra`),
  CONSTRAINT `detalle_orden_compra_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_orden_compra`
--

LOCK TABLES `detalle_orden_compra` WRITE;
/*!40000 ALTER TABLE `detalle_orden_compra` DISABLE KEYS */;
INSERT INTO `detalle_orden_compra` VALUES
(1,1,1,20.00,20.00,18000.00),
(2,2,3,10.00,0.00,22000.00),
(3,3,4,5.00,5.00,4000.00),
(4,3,5,8.00,8.00,3000.00),
(5,4,7,15.00,0.00,5500.00),
(6,5,2,30.00,0.00,2500.00),
(7,6,1,15.00,15.00,18000.00),
(8,7,4,4.00,4.00,4000.00),
(9,8,8,60.00,0.00,450.00),
(10,9,10,20.00,20.00,1800.00);
/*!40000 ALTER TABLE `detalle_orden_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `domicilio`
--

DROP TABLE IF EXISTS `domicilio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `domicilio` (
  `id_domicilio` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `coordenadas_gps` varchar(80) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'ASIGNADO',
  `Fecha_asignacion` datetime DEFAULT current_timestamp(),
  `fecha_entrega` datetime DEFAULT NULL,
  `id_repartidor` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_domicilio`),
  UNIQUE KEY `id_pedido` (`id_pedido`),
  KEY `id_repartidor` (`id_repartidor`),
  CONSTRAINT `domicilio_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  CONSTRAINT `domicilio_ibfk_2` FOREIGN KEY (`id_repartidor`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `domicilio`
--

LOCK TABLES `domicilio` WRITE;
/*!40000 ALTER TABLE `domicilio` DISABLE KEYS */;
INSERT INTO `domicilio` VALUES
(1,3,'Av. 68 # 22-10','4.6300,-74.0900','ENTREGADO','2026-09-02 20:42:08','2025-01-15 13:45:00',5),
(2,6,'Calle 72 # 9-40','4.6550,-74.0650','ENTREGADO','2026-09-02 20:42:08','2025-01-15 20:30:00',8),
(3,9,'Carrera 30 # 45-10','4.6400,-74.0800','ENTREGADO','2026-09-02 20:42:08','2025-01-14 19:00:00',5);
/*!40000 ALTER TABLE `domicilio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flujo_caja`
--

DROP TABLE IF EXISTS `flujo_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `flujo_caja` (
  `id_flujo` int(11) NOT NULL AUTO_INCREMENT,
  `id_turno` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `concepto` varchar(100) DEFAULT NULL,
  `ingresos` decimal(10,2) DEFAULT 0.00,
  `egresos` decimal(10,2) DEFAULT 0.00,
  `saldo` decimal(10,2) DEFAULT NULL,
  `metodo` varchar(30) DEFAULT NULL,
  `referencia` varchar(80) DEFAULT NULL,
  `id_pago` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_flujo`),
  KEY `id_pago` (`id_pago`),
  KEY `id_turno` (`id_turno`),
  CONSTRAINT `flujo_caja_ibfk_1` FOREIGN KEY (`id_turno`) REFERENCES `turno_caja` (`id_turno`),
  CONSTRAINT `flujo_caja_ibfk_2` FOREIGN KEY (`id_pago`) REFERENCES `pago` (`id_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flujo_caja`
--

LOCK TABLES `flujo_caja` WRITE;
/*!40000 ALTER TABLE `flujo_caja` DISABLE KEYS */;
INSERT INTO `flujo_caja` VALUES
(1,1,'2026-09-02 20:42:08','Apertura de caja',200000.00,0.00,200000.00,'EFECTIVO',NULL,NULL),
(2,1,'2026-09-02 20:42:08','Pago factura FAC-2025-0001',59360.00,0.00,259360.00,'EFECTIVO',NULL,1),
(3,1,'2026-09-02 20:42:08','Pago factura FAC-2025-0002',47360.00,0.00,306720.00,'TARJETA_CREDITO','REF-TC-00234',2),
(4,1,'2026-09-02 20:42:08','Pago factura FAC-2025-0006',42840.00,0.00,349560.00,'TARJETA_DEBITO','REF-TD-00891',6),
(5,2,'2026-09-02 20:42:08','Apertura de caja',150000.00,0.00,150000.00,'EFECTIVO',NULL,NULL),
(6,2,'2026-09-02 20:42:08','Pago factura FAC-2025-0003',34510.00,0.00,184510.00,'NEQUI','NEQ-8845612',3),
(7,2,'2026-09-02 20:42:08','Pago factura FAC-2025-0005',39000.00,0.00,223510.00,'DAVIPLATA','DAV-9923411',5),
(8,3,'2026-09-02 20:42:08','Apertura de caja',200000.00,0.00,200000.00,'EFECTIVO',NULL,NULL),
(9,3,'2026-09-02 20:42:08','Pago factura FAC-2025-0004',64240.00,0.00,264240.00,'EFECTIVO',NULL,4),
(10,3,'2026-09-02 20:42:08','Gasto insumos limpieza',0.00,15000.00,249240.00,'EFECTIVO','COMP-001',NULL);
/*!40000 ALTER TABLE `flujo_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario_mov`
--

DROP TABLE IF EXISTS `inventario_mov`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario_mov` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_restaurante` int(11) DEFAULT NULL,
  `id_ingrediente` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `fecha_hora` datetime DEFAULT current_timestamp(),
  `tipo_movimiento` varchar(20) DEFAULT NULL,
  `cantidad` decimal(10,3) DEFAULT NULL,
  `costo_unitario` decimal(10,2) DEFAULT NULL,
  `observaciones` varchar(1000) DEFAULT NULL,
  `origen_tipo` varchar(30) DEFAULT NULL,
  `origen_id` int(11) DEFAULT NULL,
  `id_lote` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_ingrediente` (`id_ingrediente`),
  KEY `id_lote` (`id_lote`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_inventario_mov_restaurante` (`id_restaurante`),
  CONSTRAINT `inventario_mov_ibfk_1` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`),
  CONSTRAINT `inventario_mov_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `inventario_mov_ibfk_3` FOREIGN KEY (`id_lote`) REFERENCES `lote_ingrediente` (`id_lote`),
  CONSTRAINT `inventario_mov_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario_mov`
--

LOCK TABLES `inventario_mov` WRITE;
/*!40000 ALTER TABLE `inventario_mov` DISABLE KEYS */;
INSERT INTO `inventario_mov` VALUES
(1,2,1,9,'2026-09-02 20:42:08','ENTRADA',20.000,18000.00,'Compra orden #1','ORDEN_COMPRA',1,1),
(2,2,4,9,'2026-09-02 20:42:08','ENTRADA',5.000,4000.00,'Compra orden #3','ORDEN_COMPRA',3,4),
(3,2,5,9,'2026-09-02 20:42:08','ENTRADA',8.000,3000.00,'Compra orden #3','ORDEN_COMPRA',3,5),
(4,1,1,4,'2026-09-02 20:42:08','SALIDA',0.400,18000.00,'Pedido #1 - 2 hamburguesas','PEDIDO',1,11),
(5,2,6,6,'2026-09-02 20:42:08','SALIDA',0.250,14000.00,'Pedido #3 - pollo plancha','PEDIDO',3,6),
(6,2,7,6,'2026-09-02 20:42:08','SALIDA',0.400,5500.00,'Pedido #4 - 2 carbonaras','PEDIDO',4,7),
(7,2,8,6,'2026-09-02 20:42:08','SALIDA',4.000,450.00,'Pedido #4 - 2 carbonaras','PEDIDO',4,8),
(8,2,2,9,'2026-09-02 20:42:08','ENTRADA',50.000,2500.00,'Compra orden #6','ORDEN_COMPRA',6,2),
(9,2,3,9,'2026-09-02 20:42:08','ENTRADA',10.000,22000.00,'Compra orden #2 (parcial)','ORDEN_COMPRA',2,3),
(10,2,10,9,'2026-09-02 20:42:08','ENTRADA',20.000,1800.00,'Compra orden #9','ORDEN_COMPRA',9,10);
/*!40000 ALTER TABLE `inventario_mov` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lote_ingrediente`
--

DROP TABLE IF EXISTS `lote_ingrediente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lote_ingrediente` (
  `id_lote` int(11) NOT NULL AUTO_INCREMENT,
  `id_restaurante` int(11) DEFAULT NULL,
  `id_ingrediente` int(11) NOT NULL,
  `numero_lote` varchar(40) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `stock_inicial` decimal(10,3) DEFAULT NULL,
  `stock_actual` decimal(10,3) DEFAULT NULL,
  `costo_promedio` decimal(10,2) DEFAULT NULL,
  `observaciones` varchar(500) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_lote`),
  UNIQUE KEY `numero_lote` (`numero_lote`),
  KEY `id_ingrediente` (`id_ingrediente`),
  KEY `idx_lote_ingrediente_restaurante` (`id_restaurante`),
  CONSTRAINT `lote_ingrediente_ibfk_1` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`),
  CONSTRAINT `lote_ingrediente_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lote_ingrediente`
--

LOCK TABLES `lote_ingrediente` WRITE;
/*!40000 ALTER TABLE `lote_ingrediente` DISABLE KEYS */;
INSERT INTO `lote_ingrediente` VALUES
(1,2,1,'LOTE-CARNE-001','2025-01-10','2025-01-17',20.000,15.500,18000.00,'Lote fresco frigorífico central','2026-09-02 20:42:08'),
(2,2,2,'LOTE-HARINA-001','2025-01-05','2025-04-05',50.000,42.000,2500.00,'Harina de primera calidad','2026-09-02 20:42:08'),
(3,2,3,'LOTE-MOZZ-001','2025-01-12','2025-01-26',10.000,8.200,22000.00,'Mozzarella bloque','2026-09-02 20:42:08'),
(4,2,4,'LOTE-LECHUGA-001','2025-01-14','2025-01-19',5.000,4.100,4000.00,'Lechuga fresca del día','2026-09-02 20:42:08'),
(5,2,5,'LOTE-TOMATE-001','2025-01-13','2025-01-20',8.000,6.500,3000.00,'Tomate maduro selecto','2026-09-02 20:42:08'),
(6,2,6,'LOTE-POLLO-001','2025-01-12','2025-01-16',15.000,11.000,14000.00,'Pollo refrigerado','2026-09-02 20:42:08'),
(7,2,7,'LOTE-ESPAG-001','2025-01-01','2026-01-01',20.000,18.500,5500.00,'Pasta seca larga vida','2026-09-02 20:42:08'),
(8,2,8,'LOTE-HUEVO-001','2025-01-13','2025-01-27',120.000,98.000,450.00,'Huevos AA bandeja','2026-09-02 20:42:08'),
(9,NULL,9,'LOTE-LIMON-001','2025-01-14','2025-01-21',6.000,5.200,3500.00,'Limón verde fresco','2026-09-02 20:42:08'),
(10,2,10,'LOTE-PAPA-001','2025-01-10','2025-01-24',25.000,20.000,1800.00,'Papa pastusa cosecha nueva','2026-09-02 20:42:08'),
(11,1,1,'LOTE-CARNE-001-R1','2025-01-10','2025-01-17',20.000,15.500,18000.00,'Lote fresco frigorífico central - Restaurante 1','2026-09-02 20:42:08');
/*!40000 ALTER TABLE `lote_ingrediente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orden_compra`
--

DROP TABLE IF EXISTS `orden_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orden_compra` (
  `id_orden_compra` int(11) NOT NULL AUTO_INCREMENT,
  `id_restaurante` int(11) DEFAULT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_orden` datetime DEFAULT current_timestamp(),
  `fecha_entrega_esperada` date DEFAULT NULL,
  `fecha_entrega_real` date DEFAULT NULL,
  `estado` varchar(30) DEFAULT 'PENDIENTE',
  `observaciones` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_orden_compra`),
  KEY `id_proveedor` (`id_proveedor`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_orden_compra_restaurante` (`id_restaurante`),
  CONSTRAINT `orden_compra_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `orden_compra_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `orden_compra_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden_compra`
--

LOCK TABLES `orden_compra` WRITE;
/*!40000 ALTER TABLE `orden_compra` DISABLE KEYS */;
INSERT INTO `orden_compra` VALUES
(1,2,1,9,'2026-09-02 20:42:08','2025-01-17','2025-01-17','RECIBIDA','Pedido urgente de carnes'),
(2,2,2,9,'2026-09-02 20:42:08','2025-01-18',NULL,'PENDIENTE','Reposición lácteos'),
(3,2,3,9,'2026-09-02 20:42:08','2025-01-16','2025-01-16','RECIBIDA','Verduras frescas semana'),
(4,2,4,9,'2026-09-02 20:42:08','2025-01-20',NULL,'APROBADA','Bebidas para el fin de semana'),
(5,2,5,9,'2026-09-02 20:42:08','2025-01-19',NULL,'PENDIENTE','Insumos varios'),
(6,1,11,2,'2026-09-02 20:42:08','2025-01-14','2025-01-14','RECIBIDA','Compra semanal carnes'),
(7,1,12,2,'2026-09-02 20:42:08','2025-01-13','2025-01-13','RECIBIDA','Verduras lunes'),
(8,2,6,9,'2026-09-02 20:42:08','2025-01-21',NULL,'PENDIENTE','Pan artesanal'),
(9,1,9,2,'2026-09-02 20:42:08','2025-01-15','2025-01-15','RECIBIDA','Mariscos frescos'),
(10,2,10,9,'2026-09-02 20:42:08','2025-01-18',NULL,'APROBADA','Frutas tropicales');
/*!40000 ALTER TABLE `orden_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_factura` int(11) NOT NULL,
  `id_usuario_cajero` int(11) NOT NULL,
  `fecha_pago` datetime DEFAULT current_timestamp(),
  `metodo` varchar(30) DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `referencia` varchar(80) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'APROBADO',
  `id_turno` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `id_factura` (`id_factura`),
  KEY `id_turno` (`id_turno`),
  KEY `id_usuario_cajero` (`id_usuario_cajero`),
  CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `Factura` (`id_factura`),
  CONSTRAINT `pago_ibfk_2` FOREIGN KEY (`id_usuario_cajero`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `pago_ibfk_3` FOREIGN KEY (`id_turno`) REFERENCES `turno_caja` (`id_turno`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES
(1,1,3,'2026-09-02 20:42:08','EFECTIVO',59360.00,NULL,'APROBADO',1),
(2,2,3,'2026-09-02 20:42:08','TARJETA_CREDITO',47360.00,'REF-TC-00234','APROBADO',1),
(3,3,7,'2026-09-02 20:42:08','NEQUI',34510.00,'NEQ-8845612','APROBADO',2),
(4,4,3,'2026-09-02 20:42:08','EFECTIVO',64240.00,NULL,'APROBADO',3),
(5,5,7,'2026-09-02 20:42:08','DAVIPLATA',39000.00,'DAV-9923411','APROBADO',2),
(6,6,3,'2026-09-02 20:42:08','TARJETA_DEBITO',42840.00,'REF-TD-00891','APROBADO',1),
(7,7,7,'2026-09-02 20:42:08','EFECTIVO',57120.00,NULL,'APROBADO',4),
(8,8,3,'2026-09-02 20:42:08','TARJETA_CREDITO',33320.00,'REF-TC-00567','APROBADO',5),
(9,9,7,'2026-09-02 20:42:08','EFECTIVO',21420.00,NULL,'RECHAZADO',2),
(10,10,3,'2026-09-02 20:42:08','PSE',14000.00,'PSE-441231','APROBADO',3);
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL AUTO_INCREMENT,
  `id_restaurante` int(11) DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_mesero` int(11) DEFAULT NULL,
  `Fecha_hora` datetime DEFAULT current_timestamp(),
  `estado` varchar(20) DEFAULT 'ABIERTO',
  `Tipo_pedido` varchar(20) DEFAULT NULL,
  `Mesa_num` int(11) DEFAULT NULL,
  `notas` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_mesero` (`id_mesero`),
  KEY `idx_pedido_restaurante` (`id_restaurante`),
  CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente` (`id_cliente`),
  CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_mesero`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `pedido_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES
(1,1,1,4,'2026-09-02 20:42:08','CERRADO','MESA',3,'Sin cebolla por favor'),
(2,2,2,6,'2026-09-02 20:42:08','CERRADO','MESA',7,NULL),
(3,1,3,4,'2026-09-02 20:42:08','CERRADO','DOMICILIO',NULL,'Entregar en portería'),
(4,2,4,6,'2026-09-02 20:42:08','EN_PREPARACION','MESA',1,'Alergia al gluten - informar cocina'),
(5,1,5,4,'2026-09-02 20:42:08','ABIERTO','MESA',5,NULL),
(6,2,6,6,'2026-09-02 20:42:08','CERRADO','DOMICILIO',NULL,'Llamar antes de llegar'),
(7,1,7,4,'2026-09-02 20:42:08','CERRADO','MESA',2,NULL),
(8,2,8,6,'2026-09-02 20:42:08','LISTO','MESA',4,'Extra salsa BBQ'),
(9,1,9,4,'2026-09-02 20:42:08','CERRADO','DOMICILIO',NULL,NULL),
(10,2,10,6,'2026-09-02 20:42:08','ABIERTO','MESA',8,'Mesa de cumpleaños');
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT,
  `id_restaurante` int(11) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `nombre_contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `nit` varchar(30) DEFAULT NULL,
  `tipo_proveedor` varchar(50) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'ACTIVO',
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_proveedor`),
  KEY `idx_proveedor_restaurante` (`id_restaurante`),
  CONSTRAINT `proveedor_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES
(1,2,'Frigorífico Central S.A.','Roberto Muñoz','6012345678','ventas@frigocentral.com','Zona Industrial Km 5','900123456-1','CARNES','ACTIVO','2026-09-02 20:42:08'),
(2,2,'Distribuidora Lácteos del Valle','Carmen Pedraza','6029876543','pedidos@lacteosvalle.com','Carrera 80 # 20-15','800234567-2','LACTEOS','ACTIVO','2026-09-02 20:42:08'),
(3,2,'Verduras Express Ltda.','Hernando Gil','3101234000','contacto@verdurasexpress.com','Plaza de Mercado Local 45','700345678-3','VERDURAS','ACTIVO','2026-09-02 20:42:08'),
(4,2,'Bebidas y Licores El Barril','Sandra Uribe','3209870000','compras@elbarril.com','Calle 13 # 45-20','600456789-4','BEBIDAS','ACTIVO','2026-09-02 20:42:08'),
(5,2,'Insumos de Cocina Pro','Felipe Arango','3151110000','ventas@insumospro.com','Av. Boyacá # 60-30','500567890-5','INSUMOS','ACTIVO','2026-09-02 20:42:08'),
(6,2,'Panadería Industrial Norte','Gloria Niño','3004440000','pedidos@panorte.com','Transversal 93 # 80-10','400678901-6','PANADERIA','ACTIVO','2026-09-02 20:42:08'),
(7,NULL,'Salsas y Condimentos S.A.S.','Mauricio Salinas','3157770000','info@salsasycond.com','Parque Industrial Sur','300789012-7','CONDIMENTOS','ACTIVO','2026-09-02 20:42:08'),
(8,NULL,'Aceites y Grasas Naturales','Luz Marina Cano','3003330000','ventas@aceitesnat.com','Zona Franca Bod. 12','200890123-8','ACEITES','ACTIVO','2026-09-02 20:42:08'),
(9,1,'Mariscos del Pacífico','Armando Pino','3111118000','pedidos@mariscospac.com','Central Mayorista B-20','100901234-9','MARISCOS','ACTIVO','2026-09-02 20:42:08'),
(10,2,'Frutas Tropicales S.A.','Esperanza Luna','3206660000','frutas@tropicales.com','Carrera 50 # 12-88','900012345-0','FRUTAS','ACTIVO','2026-09-02 20:42:08'),
(11,1,'Frigorífico Central S.A. - Restaurante 1','Roberto Muñoz','6012345678','ventas@frigocentral.com','Zona Industrial Km 5','900123456-1-R1','CARNES','ACTIVO','2026-09-02 20:42:08'),
(12,1,'Verduras Express Ltda. - Restaurante 1','Hernando Gil','3101234000','contacto@verdurasexpress.com','Plaza de Mercado Local 45','700345678-3-R1','VERDURAS','ACTIVO','2026-09-02 20:42:08');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor_ingrediente`
--

DROP TABLE IF EXISTS `proveedor_ingrediente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor_ingrediente` (
  `id_proveedor` int(11) NOT NULL,
  `id_ingrediente` int(11) NOT NULL,
  `precio_acordado` decimal(10,2) DEFAULT NULL,
  `tiempo_entrega_dias` int(11) DEFAULT NULL,
  `calidad_rating` decimal(2,1) DEFAULT NULL,
  `es_proveedor_principal` tinyint(1) DEFAULT 0,
  `fecha_ultima_compra` datetime DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`,`id_ingrediente`),
  KEY `id_ingrediente` (`id_ingrediente`),
  CONSTRAINT `proveedor_ingrediente_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  CONSTRAINT `proveedor_ingrediente_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor_ingrediente`
--

LOCK TABLES `proveedor_ingrediente` WRITE;
/*!40000 ALTER TABLE `proveedor_ingrediente` DISABLE KEYS */;
INSERT INTO `proveedor_ingrediente` VALUES
(1,1,18000.00,1,4.8,1,'2025-01-14 09:00:00'),
(2,3,22000.00,2,4.5,1,'2025-01-12 10:00:00'),
(3,4,4000.00,1,4.7,1,'2025-01-13 08:00:00'),
(3,5,3000.00,1,4.6,1,'2025-01-13 08:00:00'),
(4,7,5500.00,3,4.2,1,'2025-01-08 09:00:00'),
(5,2,2500.00,2,4.3,1,'2025-01-10 11:00:00'),
(6,8,450.00,1,4.9,1,'2025-01-10 08:00:00'),
(9,6,14000.00,1,4.7,1,'2025-01-12 09:00:00'),
(10,9,3500.00,1,4.5,1,'2025-01-11 10:00:00'),
(10,10,1800.00,1,4.4,1,'2025-01-10 10:00:00');
/*!40000 ALTER TABLE `proveedor_ingrediente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurante`
--

DROP TABLE IF EXISTS `restaurante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurante` (
  `id_restaurante` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id_restaurante`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurante`
--

LOCK TABLES `restaurante` WRITE;
/*!40000 ALTER TABLE `restaurante` DISABLE KEYS */;
INSERT INTO `restaurante` VALUES
(1,'Restaurante Principal','Calle 123','3001234567','contacto@restaurante.com',1,'2026-09-02 20:42:08.568'),
(2,'Restaurante Norte','Carrera 45 #10-20','3007654321','norte@restaurante.com',1,'2026-09-02 20:42:08.568'),
(3,'Restaurante AB',NULL,NULL,NULL,1,'2026-09-03 01:23:30.801');
/*!40000 ALTER TABLE `restaurante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) DEFAULT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES
(1,'SUPERADMIN','Acceso total al sistema'),
(2,'GERENTE','Administrador del restaurante'),
(3,'CAJERO','Gestión de caja y pagos'),
(4,'MESERO','Toma y gestión de pedidos en mesa'),
(5,'REPARTIDOR','Entrega de pedidos a domicilio');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_last_activity_index` (`last_activity`),
  KEY `sessions_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitud_registro`
--

DROP TABLE IF EXISTS `solicitud_registro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_registro` (
  `id_solicitud` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  `apellido` varchar(60) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `id_rol_solicitado` int(11) NOT NULL,
  `id_restaurante` int(11) DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'PENDIENTE',
  `motivo_rechazo` varchar(500) DEFAULT NULL,
  `fecha_solicitud` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_revision` datetime DEFAULT NULL,
  `revisado_por` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_solicitud`),
  UNIQUE KEY `solicitud_registro_email_unique` (`email`),
  KEY `id_rol_solicitado` (`id_rol_solicitado`),
  KEY `id_restaurante` (`id_restaurante`),
  KEY `revisado_por` (`revisado_por`),
  KEY `estado` (`estado`),
  CONSTRAINT `solicitud_registro_ibfk_revisor` FOREIGN KEY (`revisado_por`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `solicitud_registro_ibfk_rol` FOREIGN KEY (`id_rol_solicitado`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitud_registro`
--

LOCK TABLES `solicitud_registro` WRITE;
/*!40000 ALTER TABLE `solicitud_registro` DISABLE KEYS */;
INSERT INTO `solicitud_registro` VALUES
(1,'Prueba','Gerente','solicitud.gerente.prueba@example.com','3002001001','$2a$12$mlrAoHVaVpBZHNEagDhuB.fnYyqR3JpWmFpYhb/WRG7tqw9a04pZO',2,1,'APROBADA',NULL,'2026-09-02 20:42:08','2026-09-02 20:42:26',1),
(2,'Prueba','Cajero','solicitud.cajero.prueba@example.com','3002001002','$2a$12$mlrAoHVaVpBZHNEagDhuB.fnYyqR3JpWmFpYhb/WRG7tqw9a04pZO',3,1,'PENDIENTE',NULL,'2026-09-02 20:42:08',NULL,NULL),
(3,'Prueba','Mesero','solicitud.mesero.prueba@example.com','3002001003','$2a$12$mlrAoHVaVpBZHNEagDhuB.fnYyqR3JpWmFpYhb/WRG7tqw9a04pZO',4,2,'PENDIENTE',NULL,'2026-09-02 20:42:08',NULL,NULL),
(4,'Prueba','Repartidor','solicitud.repartidor.prueba@example.com','3002001004','$2a$12$mlrAoHVaVpBZHNEagDhuB.fnYyqR3JpWmFpYhb/WRG7tqw9a04pZO',5,2,'PENDIENTE',NULL,'2026-09-02 20:42:08',NULL,NULL);
/*!40000 ALTER TABLE `solicitud_registro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turno_caja`
--

DROP TABLE IF EXISTS `turno_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `turno_caja` (
  `id_turno` int(11) NOT NULL AUTO_INCREMENT,
  `id_restaurante` int(11) DEFAULT NULL,
  `id_caja` int(11) NOT NULL,
  `id_usuario_cajero` int(11) NOT NULL,
  `fecha_apertura` datetime DEFAULT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `efectivo_inicial` decimal(10,2) DEFAULT NULL,
  `efectivo_esperado` decimal(10,2) DEFAULT NULL,
  `efectivo_real` decimal(10,2) DEFAULT NULL,
  `diferencia` decimal(10,2) DEFAULT NULL,
  `notas` varchar(500) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'ABIERTA',
  PRIMARY KEY (`id_turno`),
  KEY `id_caja` (`id_caja`),
  KEY `id_usuario_cajero` (`id_usuario_cajero`),
  KEY `idx_turno_caja_restaurante` (`id_restaurante`),
  CONSTRAINT `turno_caja_ibfk_1` FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`),
  CONSTRAINT `turno_caja_ibfk_2` FOREIGN KEY (`id_usuario_cajero`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `turno_caja_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turno_caja`
--

LOCK TABLES `turno_caja` WRITE;
/*!40000 ALTER TABLE `turno_caja` DISABLE KEYS */;
INSERT INTO `turno_caja` VALUES
(1,1,1,3,'2025-01-15 08:00:00','2025-01-15 16:00:00',200000.00,850000.00,845000.00,-5000.00,'Turno mañana normal','CERRADA'),
(2,2,2,7,'2025-01-15 08:00:00','2025-01-15 16:00:00',150000.00,620000.00,620000.00,0.00,'Sin novedades','CERRADA'),
(3,1,1,3,'2025-01-15 16:00:00','2025-01-15 23:59:00',200000.00,970000.00,972000.00,2000.00,'Turno noche OK','CERRADA'),
(4,2,3,7,'2025-01-16 08:00:00',NULL,100000.00,NULL,NULL,NULL,'Turno activo bar','ABIERTA'),
(5,1,5,3,'2025-01-16 08:00:00',NULL,150000.00,NULL,NULL,NULL,'Turno activo caja 2','ABIERTA'),
(6,2,6,7,'2025-01-14 08:00:00','2025-01-14 16:00:00',200000.00,730000.00,728000.00,-2000.00,'Diferencia mínima','CERRADA'),
(7,1,4,3,'2025-01-14 08:00:00','2025-01-14 20:00:00',50000.00,480000.00,480000.00,0.00,'Domicilios normales','CERRADA'),
(8,2,6,7,'2025-01-13 08:00:00','2025-01-13 16:00:00',200000.00,910000.00,915000.00,5000.00,'Sobrante pequeño','CERRADA'),
(9,1,5,3,'2025-01-13 16:00:00','2025-01-13 23:59:00',150000.00,540000.00,540000.00,0.00,'Todo cuadrado','CERRADA'),
(10,2,7,7,'2025-01-16 10:00:00',NULL,80000.00,NULL,NULL,NULL,'Turno express activo','ABIERTA');
/*!40000 ALTER TABLE `turno_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_rol` int(11) NOT NULL,
  `identificacion` varchar(20) DEFAULT NULL,
  `nombre` varchar(60) DEFAULT NULL,
  `apellido` varchar(60) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contrasena_hash` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `id_restaurante` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `id_rol` (`id_rol`),
  KEY `id_restaurante` (`id_restaurante`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  CONSTRAINT `usuario_ibfk_restaurante` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES
(1,1,'1001','Carlos','Ramírez','carlos.ramirez@resto.com','3001234567','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',NULL),
(2,2,'1002','Laura','Gómez','laura.gomez@resto.com','3009876543','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',1),
(3,3,'1003','Andrés','Torres','andres.torres@resto.com','3101112223','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',1),
(4,4,'1004','Sofía','Martínez','sofia.martinez@resto.com','3154445556','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',1),
(5,5,'1005','Juan','López','juan.lopez@resto.com','3207778889','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',1),
(6,4,'1006','Valentina','Herrera','valentina.herrera@resto.com','3001239876','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',2),
(7,3,'1007','Miguel','Castro','miguel.castro@resto.com','3109998887','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',2),
(8,5,'1008','Isabella','Vargas','isabella.vargas@resto.com','3156667778','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',2),
(9,2,'1009','Sebastián','Díaz','sebastian.diaz@resto.com','3203334445','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',2),
(10,4,'1010','Camila','Moreno','camila.moreno@resto.com','3001115556','$2y$12$NbBh9iRrnzVgmwp8oqHCz.1YuDlCnWqSmlqYEGTh/u8pnVkkZzbKe',1,'2026-09-02 20:42:08',2),
(11,2,NULL,'Prueba','Gerente','solicitud.gerente.prueba@example.com','3002001001','$2a$12$mlrAoHVaVpBZHNEagDhuB.fnYyqR3JpWmFpYhb/WRG7tqw9a04pZO',1,'2026-09-02 20:42:26',1),
(12,2,'1014662818','Prueba A','Prueba B','pruebaab@gmail.com','3009096664','$2a$12$Upv1o0sWqDAH4nBKzU.WXeW9h2KPGXaEbCzFBPoY.Catc5YRrpPpa',1,'2026-09-03 01:23:30',3);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `vista_domicilios_pendientes`
--

DROP TABLE IF EXISTS `vista_domicilios_pendientes`;
/*!50001 DROP VIEW IF EXISTS `vista_domicilios_pendientes`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vista_domicilios_pendientes` AS SELECT
 NULL AS `id_domicilio`,
 NULL AS `estado`,
 NULL AS `Fecha_asignacion`,
 NULL AS `direccion_entrega`,
 NULL AS `coordenadas_gps`,
 NULL AS `nombre_cliente`,
 NULL AS `telefono_cliente`,
 NULL AS `nombre_repartidor`,
 NULL AS `telefono_repartidor` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vista_inventario_bajo_minimo`
--

DROP TABLE IF EXISTS `vista_inventario_bajo_minimo`;
/*!50001 DROP VIEW IF EXISTS `vista_inventario_bajo_minimo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vista_inventario_bajo_minimo` AS SELECT
 NULL AS `id_ingrediente`,
 NULL AS `ingrediente`,
 NULL AS `unidad_medida`,
 NULL AS `stock_minimo`,
 NULL AS `stock_total_actual`,
 NULL AS `alerta` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vista_listado_productos`
--

DROP TABLE IF EXISTS `vista_listado_productos`;
/*!50001 DROP VIEW IF EXISTS `vista_listado_productos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vista_listado_productos` AS SELECT
 NULL AS `id_producto`,
 NULL AS `Nombre`,
 NULL AS `Descripcion`,
 NULL AS `precio_venta`,
 NULL AS `Categoria`,
 NULL AS `Tiempo_preparacion`,
 NULL AS `Estado` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vista_pedidos_activos`
--

DROP TABLE IF EXISTS `vista_pedidos_activos`;
/*!50001 DROP VIEW IF EXISTS `vista_pedidos_activos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vista_pedidos_activos` AS SELECT
 NULL AS `id_pedido`,
 NULL AS `Fecha_hora`,
 NULL AS `estado`,
 NULL AS `Tipo_pedido`,
 NULL AS `Mesa_num`,
 NULL AS `notas`,
 NULL AS `nombre_cliente`,
 NULL AS `telefono_cliente`,
 NULL AS `nombre_mesero` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vista_productos_mas_vendidos`
--

DROP TABLE IF EXISTS `vista_productos_mas_vendidos`;
/*!50001 DROP VIEW IF EXISTS `vista_productos_mas_vendidos`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vista_productos_mas_vendidos` AS SELECT
 NULL AS `id_producto`,
 NULL AS `producto`,
 NULL AS `Categoria`,
 NULL AS `unidades_vendidas`,
 NULL AS `ingreso_total` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vista_resumen_ventas_diarias`
--

DROP TABLE IF EXISTS `vista_resumen_ventas_diarias`;
/*!50001 DROP VIEW IF EXISTS `vista_resumen_ventas_diarias`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vista_resumen_ventas_diarias` AS SELECT
 NULL AS `fecha`,
 NULL AS `total_pedidos`,
 NULL AS `ingresos_brutos`,
 NULL AS `total_iva`,
 NULL AS `total_descuentos`,
 NULL AS `total_propinas`,
 NULL AS `ingresos_netos` */;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vista_domicilios_pendientes`
--

/*!50001 DROP VIEW IF EXISTS `vista_domicilios_pendientes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`remisoft`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_domicilios_pendientes` AS select `d`.`id_domicilio` AS `id_domicilio`,`d`.`estado` AS `estado`,`d`.`Fecha_asignacion` AS `Fecha_asignacion`,`d`.`direccion` AS `direccion_entrega`,`d`.`coordenadas_gps` AS `coordenadas_gps`,concat(`c`.`Nombre`,' ',`c`.`Apellido`) AS `nombre_cliente`,`c`.`Telefono` AS `telefono_cliente`,concat(`u`.`nombre`,' ',`u`.`apellido`) AS `nombre_repartidor`,`u`.`telefono` AS `telefono_repartidor` from (((`domicilio` `d` join `pedido` `pe` on(`d`.`id_pedido` = `pe`.`id_pedido`)) left join `Cliente` `c` on(`pe`.`id_cliente` = `c`.`id_cliente`)) left join `usuario` `u` on(`d`.`id_repartidor` = `u`.`id_usuario`)) where `d`.`estado` in ('ASIGNADO','EN_CAMINO') order by `d`.`Fecha_asignacion` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_inventario_bajo_minimo`
--

/*!50001 DROP VIEW IF EXISTS `vista_inventario_bajo_minimo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`remisoft`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_inventario_bajo_minimo` AS select `i`.`id_ingrediente` AS `id_ingrediente`,`i`.`nombre` AS `ingrediente`,`i`.`unidad_medida` AS `unidad_medida`,`i`.`stock_minimo` AS `stock_minimo`,coalesce(sum(`l`.`stock_actual`),0) AS `stock_total_actual`,case when coalesce(sum(`l`.`stock_actual`),0) = 0 then 'SIN STOCK' else 'BAJO MÍNIMO' end AS `alerta` from (`Ingrediente` `i` left join `lote_ingrediente` `l` on(`i`.`id_ingrediente` = `l`.`id_ingrediente` and `l`.`stock_actual` > 0)) group by `i`.`id_ingrediente`,`i`.`nombre`,`i`.`unidad_medida`,`i`.`stock_minimo` having coalesce(sum(`l`.`stock_actual`),0) <= `i`.`stock_minimo` order by coalesce(sum(`l`.`stock_actual`),0) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_listado_productos`
--

/*!50001 DROP VIEW IF EXISTS `vista_listado_productos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`remisoft`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_listado_productos` AS select `Producto`.`id_producto` AS `id_producto`,`Producto`.`Nombre` AS `Nombre`,`Producto`.`Descripcion` AS `Descripcion`,`Producto`.`precio_venta` AS `precio_venta`,`Producto`.`Categoria` AS `Categoria`,`Producto`.`Tiempo_preparacion` AS `Tiempo_preparacion`,`Producto`.`Estado` AS `Estado` from `Producto` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_pedidos_activos`
--

/*!50001 DROP VIEW IF EXISTS `vista_pedidos_activos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`remisoft`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_pedidos_activos` AS select `p`.`id_pedido` AS `id_pedido`,`p`.`Fecha_hora` AS `Fecha_hora`,`p`.`estado` AS `estado`,`p`.`Tipo_pedido` AS `Tipo_pedido`,`p`.`Mesa_num` AS `Mesa_num`,`p`.`notas` AS `notas`,concat(`c`.`Nombre`,' ',`c`.`Apellido`) AS `nombre_cliente`,`c`.`Telefono` AS `telefono_cliente`,concat(`u`.`nombre`,' ',`u`.`apellido`) AS `nombre_mesero` from ((`pedido` `p` left join `Cliente` `c` on(`p`.`id_cliente` = `c`.`id_cliente`)) left join `usuario` `u` on(`p`.`id_mesero` = `u`.`id_usuario`)) where `p`.`estado` in ('ABIERTO','EN_PROCESO') order by `p`.`Fecha_hora` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_productos_mas_vendidos`
--

/*!50001 DROP VIEW IF EXISTS `vista_productos_mas_vendidos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`remisoft`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_productos_mas_vendidos` AS select `p`.`id_producto` AS `id_producto`,`p`.`Nombre` AS `producto`,`p`.`Categoria` AS `Categoria`,sum(`dp`.`Cantidad`) AS `unidades_vendidas`,sum(`dp`.`Cantidad` * `dp`.`Precio_unitario`) AS `ingreso_total` from ((`Producto` `p` join `Detalle_pedido` `dp` on(`p`.`id_producto` = `dp`.`id_producto`)) join `pedido` `pe` on(`dp`.`id_pedido` = `pe`.`id_pedido`)) where `pe`.`estado` not in ('CANCELADO','ABIERTO') group by `p`.`id_producto`,`p`.`Nombre`,`p`.`Categoria` order by sum(`dp`.`Cantidad`) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_resumen_ventas_diarias`
--

/*!50001 DROP VIEW IF EXISTS `vista_resumen_ventas_diarias`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`remisoft`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_resumen_ventas_diarias` AS select cast(`f`.`Fecha_emision` as date) AS `fecha`,count(`f`.`id_factura`) AS `total_pedidos`,sum(`f`.`total`) AS `ingresos_brutos`,sum(`f`.`IVA`) AS `total_iva`,sum(`f`.`Descuento`) AS `total_descuentos`,sum(`f`.`Propina`) AS `total_propinas`,sum(`f`.`total` - `f`.`Descuento`) AS `ingresos_netos` from `Factura` `f` where `f`.`estado` = 'EMITIDA' group by cast(`f`.`Fecha_emision` as date) order by cast(`f`.`Fecha_emision` as date) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-03  2:05:41
