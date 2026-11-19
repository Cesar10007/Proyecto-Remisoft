-- No se modifican cantidades, lotes, pagos ni documentos históricos.
ALTER TABLE Ingrediente ADD unidad_presentacion VARCHAR(20) NULL,
  ADD factor_unidad DECIMAL(16,6) NOT NULL DEFAULT 1,
  ADD cantidad_base DECIMAL(16,6) NOT NULL DEFAULT 1;
CREATE TABLE actividad_sede (
  id_evento INT NOT NULL AUTO_INCREMENT PRIMARY KEY, id_restaurante INT NOT NULL,
  fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), id_actor INT NULL, actor VARCHAR(150) NOT NULL,
  entidad VARCHAR(40) NOT NULL, registro INT NOT NULL, accion VARCHAR(40) NOT NULL,
  campos VARCHAR(500) NULL, antes VARCHAR(500) NULL, despues VARCHAR(500) NULL, INDEX actividad_sede_cursor(id_restaurante,id_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE contexto_actividad (
  conexion BIGINT UNSIGNED PRIMARY KEY, id_actor INT NOT NULL, actor VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Conservar las lecturas que componían el historial anterior. No inventar el autor de un cierre antiguo.
INSERT INTO actividad_sede(id_restaurante,fecha,id_actor,actor,entidad,registro,accion,despues)
SELECT h.sede,h.fecha,u.id_usuario,COALESCE(NULLIF(TRIM(CONCAT_WS(' ',u.nombre,u.apellido)),''),'Registro anterior'),
       h.entidad,h.registro,h.accion,h.detalle FROM (
  SELECT id_restaurante sede, Fecha_hora fecha,id_mesero persona,'Pedido' entidad,id_pedido registro,'Alta histórica' accion,CONCAT('Mesa ',Mesa_num) detalle FROM pedido
  UNION ALL SELECT id_restaurante,fecha_apertura,NULL,'Turno',id_turno,'Apertura histórica',CONCAT('Caja #',id_caja) FROM turno_caja
  UNION ALL SELECT id_restaurante,fecha_cierre,NULL,'Turno',id_turno,'Cierre histórico',CONCAT('Caja #',id_caja) FROM turno_caja
  UNION ALL SELECT p.id_restaurante,pg.fecha_pago,pg.id_usuario_cajero,'Pago',pg.id_pago,'Pago histórico',CONCAT_WS(' · ',pg.metodo,pg.monto,pg.estado) FROM pago pg JOIN Factura f USING(id_factura) JOIN pedido p USING(id_pedido)
  UNION ALL SELECT id_restaurante,fecha_hora,id_usuario,'Inventario',id_movimiento,'Movimiento histórico',CONCAT_WS(' · ',CONCAT('Ingrediente #',id_ingrediente),tipo_movimiento,cantidad,origen_tipo) FROM inventario_mov
  UNION ALL SELECT t.id_restaurante,m.fecha,pg.id_usuario_cajero,'Movimiento de caja',m.id_flujo,'Movimiento histórico',CONCAT_WS(' · ',CONCAT('Turno #',t.id_turno),m.metodo,CONCAT('Ingreso ',m.ingresos),CONCAT('Egreso ',m.egresos)) FROM flujo_caja m JOIN turno_caja t USING(id_turno) LEFT JOIN pago pg USING(id_pago)
  UNION ALL SELECT id_restaurante,fecha_registro,NULL,'Personal',id_usuario,'Registro histórico',CONCAT_WS(' ',nombre,apellido) FROM usuario
  UNION ALL SELECT id_restaurante,fecha_solicitud,NULL,'Solicitud',id_solicitud,'Solicitud histórica',nombre FROM solicitud_registro
  UNION ALL SELECT id_restaurante,fecha_revision,revisado_por,'Solicitud',id_solicitud,'Revisión histórica',estado FROM solicitud_registro
  UNION ALL SELECT id_restaurante,fecha_orden,id_usuario,'Orden de compra',id_orden_compra,'Registro histórico',CONCAT('Proveedor #',id_proveedor) FROM orden_compra
  UNION ALL SELECT p.id_restaurante,f.Fecha_emision,NULL,'Factura',f.id_factura,'Emisión histórica',f.consecutivo FROM Factura f JOIN pedido p USING(id_pedido)
) h LEFT JOIN usuario u ON u.id_usuario=h.persona AND u.id_restaurante=h.sede
WHERE h.sede IS NOT NULL AND h.fecha IS NOT NULL ORDER BY h.fecha,h.registro;

-- Solo la fila modificada (o su padre) decide la sede. Las columnas copiadas son una lista permitida:
-- nunca se copian tokens, hashes, correos, documentos de identidad, cuerpos HTTP ni datos de pago sensibles.
CREATE PROCEDURE registrar_actividad_sede(IN sede INT, IN entidad_ VARCHAR(40), IN registro_ INT,
  IN accion_ VARCHAR(40), IN antes_ TEXT, IN despues_ TEXT, IN campos_ TEXT)
INSERT INTO actividad_sede(id_restaurante,id_actor,actor,entidad,registro,accion,antes,despues,campos)
SELECT sede,c.id_actor,COALESCE(c.actor,'Sistema'),entidad_,registro_,accion_,LEFT(antes_,500),LEFT(despues_,500),NULLIF(LEFT(campos_,500),'')
FROM (SELECT 1) fila LEFT JOIN contexto_actividad c ON c.conexion=CONNECTION_ID() WHERE sede IS NOT NULL;
CREATE TRIGGER act_restaurante_i AFTER INSERT ON `restaurante` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Establecimiento',NEW.id_restaurante,'Alta',
    NULL, NEW.nombre,NULL);
CREATE TRIGGER act_restaurante_u AFTER UPDATE ON `restaurante` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Establecimiento',NEW.id_restaurante,'Edición',
    OLD.nombre, NEW.nombre,
    CONCAT_WS(', ',
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(BINARY OLD.`nombre` <=> BINARY NEW.`nombre`,NULL,'nombre'),
      IF(BINARY OLD.`direccion` <=> BINARY NEW.`direccion`,NULL,'direccion'),
      IF(BINARY OLD.`telefono` <=> BINARY NEW.`telefono`,NULL,'teléfono'),
      IF(BINARY OLD.`email` <=> BINARY NEW.`email`,NULL,'correo'),
      IF(OLD.`activo` <=> NEW.`activo`,NULL,'activo'),
      IF(OLD.`fecha_creacion` <=> NEW.`fecha_creacion`,NULL,'fecha creacion')));
CREATE TRIGGER act_restaurante_d AFTER DELETE ON `restaurante` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Establecimiento',OLD.id_restaurante,'Retiro',
    OLD.nombre, NULL,NULL);

CREATE TRIGGER act_usuario_i AFTER INSERT ON `usuario` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Personal',NEW.id_usuario,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT_WS(' ',NEW.nombre,NEW.apellido),CONCAT('Rol #',NEW.id_rol),NEW.estado),NULL);
CREATE TRIGGER act_usuario_u AFTER UPDATE ON `usuario` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Personal',NEW.id_usuario,CASE WHEN NEW.estado='ELIMINADO' THEN 'Retiro del listado' WHEN OLD.activo AND NOT NEW.activo THEN 'Desactivación' WHEN NOT OLD.activo AND NEW.activo THEN 'Reactivación' WHEN NOT(OLD.contrasena_hash <=> NEW.contrasena_hash) THEN 'Cambio de contraseña' ELSE 'Edición' END,
    CONCAT_WS(' · ',CONCAT_WS(' ',OLD.nombre,OLD.apellido),CONCAT('Rol #',OLD.id_rol),OLD.estado), CONCAT_WS(' · ',CONCAT_WS(' ',NEW.nombre,NEW.apellido),CONCAT('Rol #',NEW.id_rol),NEW.estado),
    CONCAT_WS(', ',
      IF(OLD.`id_usuario` <=> NEW.`id_usuario`,NULL,'id usuario'),
      IF(OLD.`id_rol` <=> NEW.`id_rol`,NULL,'rol'),
      IF(BINARY OLD.`identificacion` <=> BINARY NEW.`identificacion`,NULL,'identificación'),
      IF(BINARY OLD.`nombre` <=> BINARY NEW.`nombre`,NULL,'nombre'),
      IF(BINARY OLD.`apellido` <=> BINARY NEW.`apellido`,NULL,'apellido'),
      IF(BINARY OLD.`email` <=> BINARY NEW.`email`,NULL,'correo'),
      IF(BINARY OLD.`telefono` <=> BINARY NEW.`telefono`,NULL,'teléfono'),
      IF(BINARY OLD.`contrasena_hash` <=> BINARY NEW.`contrasena_hash`,NULL,'contraseña'),
      IF(OLD.`activo` <=> NEW.`activo`,NULL,'activo'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado'),
      IF(OLD.`fecha_registro` <=> NEW.`fecha_registro`,NULL,'fecha registro'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento')));
CREATE TRIGGER act_usuario_d AFTER DELETE ON `usuario` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Personal',OLD.id_usuario,'Retiro',
    CONCAT_WS(' · ',CONCAT_WS(' ',OLD.nombre,OLD.apellido),CONCAT('Rol #',OLD.id_rol),OLD.estado), NULL,NULL);

CREATE TRIGGER act_usuario_traslado AFTER UPDATE ON usuario FOR EACH ROW CALL registrar_actividad_sede(IF(OLD.id_restaurante <=> NEW.id_restaurante,NULL,OLD.id_restaurante),'Personal',OLD.id_usuario,'Traslado fuera de la sede',OLD.nombre,NULL,NULL);
CREATE TRIGGER act_solicitud_registro_i AFTER INSERT ON `solicitud_registro` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Solicitud',NEW.id_solicitud,'Alta',
    NULL, CONCAT_WS(' · ',NEW.nombre,NEW.estado),NULL);
CREATE TRIGGER act_solicitud_registro_u AFTER UPDATE ON `solicitud_registro` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Solicitud',NEW.id_solicitud,'Edición',
    CONCAT_WS(' · ',OLD.nombre,OLD.estado), CONCAT_WS(' · ',NEW.nombre,NEW.estado),
    CONCAT_WS(', ',
      IF(OLD.`id_solicitud` <=> NEW.`id_solicitud`,NULL,'id solicitud'),
      IF(BINARY OLD.`nombre` <=> BINARY NEW.`nombre`,NULL,'nombre'),
      IF(BINARY OLD.`apellido` <=> BINARY NEW.`apellido`,NULL,'apellido'),
      IF(BINARY OLD.`email` <=> BINARY NEW.`email`,NULL,'correo'),
      IF(BINARY OLD.`telefono` <=> BINARY NEW.`telefono`,NULL,'teléfono'),
      IF(BINARY OLD.`contrasena_hash` <=> BINARY NEW.`contrasena_hash`,NULL,'contraseña'),
      IF(OLD.`id_rol_solicitado` <=> NEW.`id_rol_solicitado`,NULL,'id rol solicitado'),
      IF(BINARY OLD.`nombre_establecimiento` <=> BINARY NEW.`nombre_establecimiento`,NULL,'nombre establecimiento'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado'),
      IF(BINARY OLD.`motivo_rechazo` <=> BINARY NEW.`motivo_rechazo`,NULL,'motivo rechazo'),
      IF(OLD.`fecha_solicitud` <=> NEW.`fecha_solicitud`,NULL,'fecha solicitud'),
      IF(OLD.`fecha_revision` <=> NEW.`fecha_revision`,NULL,'fecha revision'),
      IF(OLD.`revisado_por` <=> NEW.`revisado_por`,NULL,'revisado por')));
CREATE TRIGGER act_solicitud_registro_d AFTER DELETE ON `solicitud_registro` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Solicitud',OLD.id_solicitud,'Retiro',
    CONCAT_WS(' · ',OLD.nombre,OLD.estado), NULL,NULL);

CREATE TRIGGER act_mesa_i AFTER INSERT ON `mesa` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Mesa',NEW.id_mesa,'Alta',
    NULL, CONCAT('Mesa ',NEW.numero,' · capacidad ',COALESCE(NEW.capacidad,0)),NULL);
CREATE TRIGGER act_mesa_u AFTER UPDATE ON `mesa` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Mesa',NEW.id_mesa,'Edición',
    CONCAT('Mesa ',OLD.numero,' · capacidad ',COALESCE(OLD.capacidad,0)), CONCAT('Mesa ',NEW.numero,' · capacidad ',COALESCE(NEW.capacidad,0)),
    CONCAT_WS(', ',
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_mesa` <=> NEW.`id_mesa`,NULL,'id mesa'),
      IF(OLD.`numero` <=> NEW.`numero`,NULL,'número'),
      IF(OLD.`capacidad` <=> NEW.`capacidad`,NULL,'capacidad')));
CREATE TRIGGER act_mesa_d AFTER DELETE ON `mesa` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Mesa',OLD.id_mesa,'Retiro',
    CONCAT('Mesa ',OLD.numero,' · capacidad ',COALESCE(OLD.capacidad,0)), NULL,NULL);

CREATE TRIGGER act_mesa_atencion_i AFTER INSERT ON `mesa_atencion` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Atención de mesa',NEW.id_atencion,'Alta',
    NULL, CONCAT('Mesa ',NEW.numero,' · ',NEW.comensales,' comensales'),NULL);
CREATE TRIGGER act_mesa_atencion_u AFTER UPDATE ON `mesa_atencion` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Atención de mesa',NEW.id_atencion,'Edición',
    CONCAT('Mesa ',OLD.numero,' · ',OLD.comensales,' comensales'), CONCAT('Mesa ',NEW.numero,' · ',NEW.comensales,' comensales'),
    CONCAT_WS(', ',
      IF(OLD.`id_atencion` <=> NEW.`id_atencion`,NULL,'id atencion'),
      IF(OLD.`numero` <=> NEW.`numero`,NULL,'número'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_mesero` <=> NEW.`id_mesero`,NULL,'mesero'),
      IF(OLD.`comensales` <=> NEW.`comensales`,NULL,'comensales'),
      IF(OLD.`desde` <=> NEW.`desde`,NULL,'desde')));
CREATE TRIGGER act_mesa_atencion_d AFTER DELETE ON `mesa_atencion` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Atención de mesa',OLD.id_atencion,'Retiro',
    CONCAT('Mesa ',OLD.numero,' · ',OLD.comensales,' comensales'), NULL,NULL);

CREATE TRIGGER act_ingrediente_i AFTER INSERT ON `Ingrediente` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Ingrediente',NEW.id_ingrediente,'Alta',
    NULL, CONCAT_WS(' · ',NEW.nombre,COALESCE(NEW.unidad_presentacion,NEW.unidad_medida),CONCAT(NEW.cantidad_base, ' ',COALESCE(NEW.unidad_medida,'base'),' = ', NEW.factor_unidad, ' ',COALESCE(NEW.unidad_presentacion,NEW.unidad_medida,'base')),CONCAT('mínimo base ',NEW.stock_minimo),CONCAT('costo base ',NEW.costo_unitario_ref)),NULL);
CREATE TRIGGER act_ingrediente_u AFTER UPDATE ON `Ingrediente` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Ingrediente',NEW.id_ingrediente,'Edición',
    CONCAT_WS(' · ',OLD.nombre,COALESCE(OLD.unidad_presentacion,OLD.unidad_medida),CONCAT(OLD.cantidad_base, ' ',COALESCE(OLD.unidad_medida,'base'),' = ', OLD.factor_unidad, ' ',COALESCE(OLD.unidad_presentacion,OLD.unidad_medida,'base')),CONCAT('mínimo base ',OLD.stock_minimo),CONCAT('costo base ',OLD.costo_unitario_ref)), CONCAT_WS(' · ',NEW.nombre,COALESCE(NEW.unidad_presentacion,NEW.unidad_medida),CONCAT(NEW.cantidad_base, ' ',COALESCE(NEW.unidad_medida,'base'),' = ', NEW.factor_unidad, ' ',COALESCE(NEW.unidad_presentacion,NEW.unidad_medida,'base')),CONCAT('mínimo base ',NEW.stock_minimo),CONCAT('costo base ',NEW.costo_unitario_ref)),
    CONCAT_WS(', ',
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_ingrediente` <=> NEW.`id_ingrediente`,NULL,'id ingrediente'),
      IF(BINARY OLD.`nombre` <=> BINARY NEW.`nombre`,NULL,'nombre'),
      IF(BINARY OLD.`descripcion` <=> BINARY NEW.`descripcion`,NULL,'descripción'),
      IF(BINARY OLD.`unidad_medida` <=> BINARY NEW.`unidad_medida`,NULL,'unidad medida'),
      IF(BINARY OLD.`unidad_presentacion` <=> BINARY NEW.`unidad_presentacion`,NULL,'unidad de trabajo'),
      IF(OLD.`cantidad_base` <=> NEW.`cantidad_base`,NULL,'equivalencia base'),
      IF(OLD.`factor_unidad` <=> NEW.`factor_unidad`,NULL,'equivalencia de trabajo'),
      IF(OLD.`costo_unitario_ref` <=> NEW.`costo_unitario_ref`,NULL,'costo de referencia'),
      IF(OLD.`stock_minimo` <=> NEW.`stock_minimo`,NULL,'stock mínimo')));
CREATE TRIGGER act_ingrediente_d AFTER DELETE ON `Ingrediente` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Ingrediente',OLD.id_ingrediente,'Retiro',
    CONCAT_WS(' · ',OLD.nombre,COALESCE(OLD.unidad_presentacion,OLD.unidad_medida),CONCAT(OLD.cantidad_base, ' ',COALESCE(OLD.unidad_medida,'base'),' = ', OLD.factor_unidad, ' ',COALESCE(OLD.unidad_presentacion,OLD.unidad_medida,'base')),CONCAT('mínimo base ',OLD.stock_minimo),CONCAT('costo base ',OLD.costo_unitario_ref)), NULL,NULL);

CREATE TRIGGER act_inventario_mov_i AFTER INSERT ON `inventario_mov` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Inventario',NEW.id_movimiento,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Ingrediente #',NEW.id_ingrediente),NEW.tipo_movimiento,NEW.cantidad,NEW.origen_tipo,NEW.observaciones),NULL);
CREATE TRIGGER act_inventario_mov_u AFTER UPDATE ON `inventario_mov` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Inventario',NEW.id_movimiento,'Edición',
    CONCAT_WS(' · ',CONCAT('Ingrediente #',OLD.id_ingrediente),OLD.tipo_movimiento,OLD.cantidad,OLD.origen_tipo,OLD.observaciones), CONCAT_WS(' · ',CONCAT('Ingrediente #',NEW.id_ingrediente),NEW.tipo_movimiento,NEW.cantidad,NEW.origen_tipo,NEW.observaciones),
    CONCAT_WS(', ',
      IF(OLD.`id_movimiento` <=> NEW.`id_movimiento`,NULL,'id movimiento'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_ingrediente` <=> NEW.`id_ingrediente`,NULL,'id ingrediente'),
      IF(OLD.`id_usuario` <=> NEW.`id_usuario`,NULL,'id usuario'),
      IF(OLD.`fecha_hora` <=> NEW.`fecha_hora`,NULL,'fecha hora'),
      IF(BINARY OLD.`tipo_movimiento` <=> BINARY NEW.`tipo_movimiento`,NULL,'tipo movimiento'),
      IF(OLD.`cantidad` <=> NEW.`cantidad`,NULL,'cantidad'),
      IF(OLD.`costo_unitario` <=> NEW.`costo_unitario`,NULL,'costo unitario'),
      IF(BINARY OLD.`observaciones` <=> BINARY NEW.`observaciones`,NULL,'observaciones'),
      IF(BINARY OLD.`origen_tipo` <=> BINARY NEW.`origen_tipo`,NULL,'origen tipo'),
      IF(OLD.`origen_id` <=> NEW.`origen_id`,NULL,'origen id'),
      IF(OLD.`id_lote` <=> NEW.`id_lote`,NULL,'id lote')));
CREATE TRIGGER act_inventario_mov_d AFTER DELETE ON `inventario_mov` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Inventario',OLD.id_movimiento,'Retiro',
    CONCAT_WS(' · ',CONCAT('Ingrediente #',OLD.id_ingrediente),OLD.tipo_movimiento,OLD.cantidad,OLD.origen_tipo,OLD.observaciones), NULL,NULL);

CREATE TRIGGER act_lote_ingrediente_i AFTER INSERT ON `lote_ingrediente` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Lote',NEW.id_lote,'Alta',
    NULL, CONCAT_WS(' · ',NEW.numero_lote,CONCAT('Saldo ',NEW.stock_actual)),NULL);
CREATE TRIGGER act_lote_ingrediente_u AFTER UPDATE ON `lote_ingrediente` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Lote',NEW.id_lote,'Edición',
    CONCAT_WS(' · ',OLD.numero_lote,CONCAT('Saldo ',OLD.stock_actual)), CONCAT_WS(' · ',NEW.numero_lote,CONCAT('Saldo ',NEW.stock_actual)),
    CONCAT_WS(', ',
      IF(OLD.`id_lote` <=> NEW.`id_lote`,NULL,'id lote'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_ingrediente` <=> NEW.`id_ingrediente`,NULL,'id ingrediente'),
      IF(BINARY OLD.`numero_lote` <=> BINARY NEW.`numero_lote`,NULL,'numero lote'),
      IF(OLD.`fecha_ingreso` <=> NEW.`fecha_ingreso`,NULL,'fecha ingreso'),
      IF(OLD.`fecha_vencimiento` <=> NEW.`fecha_vencimiento`,NULL,'fecha vencimiento'),
      IF(OLD.`stock_inicial` <=> NEW.`stock_inicial`,NULL,'stock inicial'),
      IF(OLD.`stock_actual` <=> NEW.`stock_actual`,NULL,'stock actual'),
      IF(OLD.`costo_promedio` <=> NEW.`costo_promedio`,NULL,'costo promedio'),
      IF(BINARY OLD.`observaciones` <=> BINARY NEW.`observaciones`,NULL,'observaciones'),
      IF(OLD.`fecha_registro` <=> NEW.`fecha_registro`,NULL,'fecha registro')));
CREATE TRIGGER act_lote_ingrediente_d AFTER DELETE ON `lote_ingrediente` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Lote',OLD.id_lote,'Retiro',
    CONCAT_WS(' · ',OLD.numero_lote,CONCAT('Saldo ',OLD.stock_actual)), NULL,NULL);

CREATE TRIGGER act_producto_i AFTER INSERT ON `Producto` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Producto',NEW.id_producto,'Alta',
    NULL, CONCAT_WS(' · ',NEW.Nombre,CONCAT('$',NEW.precio_venta),IF(NEW.Estado,'Activo','Inactivo')),NULL);
CREATE TRIGGER act_producto_u AFTER UPDATE ON `Producto` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Producto',NEW.id_producto,'Edición',
    CONCAT_WS(' · ',OLD.Nombre,CONCAT('$',OLD.precio_venta),IF(OLD.Estado,'Activo','Inactivo')), CONCAT_WS(' · ',NEW.Nombre,CONCAT('$',NEW.precio_venta),IF(NEW.Estado,'Activo','Inactivo')),
    CONCAT_WS(', ',
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_producto` <=> NEW.`id_producto`,NULL,'id producto'),
      IF(BINARY OLD.`Nombre` <=> BINARY NEW.`Nombre`,NULL,'nombre'),
      IF(BINARY OLD.`Descripcion` <=> BINARY NEW.`Descripcion`,NULL,'descripción'),
      IF(OLD.`precio_venta` <=> NEW.`precio_venta`,NULL,'precio venta'),
      IF(BINARY OLD.`Categoria` <=> BINARY NEW.`Categoria`,NULL,'categoria'),
      IF(OLD.`Tiempo_preparacion` <=> NEW.`Tiempo_preparacion`,NULL,'tiempo preparacion'),
      IF(OLD.`Estado` <=> NEW.`Estado`,NULL,'estado'),
      IF(OLD.`id_categoria` <=> NEW.`id_categoria`,NULL,'id categoria')));
CREATE TRIGGER act_producto_d AFTER DELETE ON `Producto` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Producto',OLD.id_producto,'Retiro',
    CONCAT_WS(' · ',OLD.Nombre,CONCAT('$',OLD.precio_venta),IF(OLD.Estado,'Activo','Inactivo')), NULL,NULL);

CREATE TRIGGER act_receta_i AFTER INSERT ON `Receta` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM Producto WHERE id_producto=NEW.id_producto),'Receta',NEW.id_receta,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Producto #',NEW.id_producto),CONCAT('Ingrediente #',NEW.id_ingrediente),NEW.Cantidad_necesaria,NEW.Unidad),NULL);
CREATE TRIGGER act_receta_u AFTER UPDATE ON `Receta` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM Producto WHERE id_producto=NEW.id_producto),'Receta',NEW.id_receta,'Edición',
    CONCAT_WS(' · ',CONCAT('Producto #',OLD.id_producto),CONCAT('Ingrediente #',OLD.id_ingrediente),OLD.Cantidad_necesaria,OLD.Unidad), CONCAT_WS(' · ',CONCAT('Producto #',NEW.id_producto),CONCAT('Ingrediente #',NEW.id_ingrediente),NEW.Cantidad_necesaria,NEW.Unidad),
    CONCAT_WS(', ',
      IF(OLD.`id_receta` <=> NEW.`id_receta`,NULL,'id receta'),
      IF(OLD.`id_producto` <=> NEW.`id_producto`,NULL,'id producto'),
      IF(OLD.`id_ingrediente` <=> NEW.`id_ingrediente`,NULL,'id ingrediente'),
      IF(OLD.`Cantidad_necesaria` <=> NEW.`Cantidad_necesaria`,NULL,'cantidad necesaria'),
      IF(BINARY OLD.`Unidad` <=> BINARY NEW.`Unidad`,NULL,'unidad')));
CREATE TRIGGER act_receta_d AFTER DELETE ON `Receta` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM Producto WHERE id_producto=OLD.id_producto),'Receta',OLD.id_receta,'Retiro',
    CONCAT_WS(' · ',CONCAT('Producto #',OLD.id_producto),CONCAT('Ingrediente #',OLD.id_ingrediente),OLD.Cantidad_necesaria,OLD.Unidad), NULL,NULL);

CREATE TRIGGER act_categoria_productos_i AFTER INSERT ON `categoria_productos` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Categoría',NEW.id_categoria,'Alta',
    NULL, NEW.nombre,NULL);
CREATE TRIGGER act_categoria_productos_u AFTER UPDATE ON `categoria_productos` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Categoría',NEW.id_categoria,'Edición',
    OLD.nombre, NEW.nombre,
    CONCAT_WS(', ',
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_categoria` <=> NEW.`id_categoria`,NULL,'id categoria'),
      IF(BINARY OLD.`nombre` <=> BINARY NEW.`nombre`,NULL,'nombre'),
      IF(BINARY OLD.`descripcion` <=> BINARY NEW.`descripcion`,NULL,'descripción')));
CREATE TRIGGER act_categoria_productos_d AFTER DELETE ON `categoria_productos` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Categoría',OLD.id_categoria,'Retiro',
    OLD.nombre, NULL,NULL);

CREATE TRIGGER act_cliente_i AFTER INSERT ON `Cliente` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Cliente',NEW.id_cliente,'Alta',
    NULL, CONCAT('Ficha #',NEW.id_cliente),NULL);
CREATE TRIGGER act_cliente_u AFTER UPDATE ON `Cliente` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Cliente',NEW.id_cliente,'Edición',
    CONCAT('Ficha #',OLD.id_cliente), CONCAT('Ficha #',NEW.id_cliente),
    CONCAT_WS(', ',
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_cliente` <=> NEW.`id_cliente`,NULL,'id cliente'),
      IF(BINARY OLD.`Nombre` <=> BINARY NEW.`Nombre`,NULL,'nombre'),
      IF(BINARY OLD.`Apellido` <=> BINARY NEW.`Apellido`,NULL,'apellido'),
      IF(BINARY OLD.`Email` <=> BINARY NEW.`Email`,NULL,'correo'),
      IF(BINARY OLD.`Telefono` <=> BINARY NEW.`Telefono`,NULL,'teléfono'),
      IF(BINARY OLD.`Direccion` <=> BINARY NEW.`Direccion`,NULL,'direccion'),
      IF(BINARY OLD.`coordenadas_gps` <=> BINARY NEW.`coordenadas_gps`,NULL,'coordenadas gps'),
      IF(BINARY OLD.`tipo_documento` <=> BINARY NEW.`tipo_documento`,NULL,'tipo documento'),
      IF(BINARY OLD.`Num_documento` <=> BINARY NEW.`Num_documento`,NULL,'num documento'),
      IF(OLD.`fecha_registro` <=> NEW.`fecha_registro`,NULL,'fecha registro')));
CREATE TRIGGER act_cliente_d AFTER DELETE ON `Cliente` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Cliente',OLD.id_cliente,'Retiro',
    CONCAT('Ficha #',OLD.id_cliente), NULL,NULL);

CREATE TRIGGER act_proveedor_i AFTER INSERT ON `proveedor` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Proveedor',NEW.id_proveedor,'Alta',
    NULL, CONCAT_WS(' · ',NEW.nombre,NEW.estado),NULL);
CREATE TRIGGER act_proveedor_u AFTER UPDATE ON `proveedor` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Proveedor',NEW.id_proveedor,'Edición',
    CONCAT_WS(' · ',OLD.nombre,OLD.estado), CONCAT_WS(' · ',NEW.nombre,NEW.estado),
    CONCAT_WS(', ',
      IF(OLD.`id_proveedor` <=> NEW.`id_proveedor`,NULL,'id proveedor'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(BINARY OLD.`nombre` <=> BINARY NEW.`nombre`,NULL,'nombre'),
      IF(BINARY OLD.`nombre_contacto` <=> BINARY NEW.`nombre_contacto`,NULL,'nombre contacto'),
      IF(BINARY OLD.`telefono` <=> BINARY NEW.`telefono`,NULL,'teléfono'),
      IF(BINARY OLD.`email` <=> BINARY NEW.`email`,NULL,'correo'),
      IF(BINARY OLD.`direccion` <=> BINARY NEW.`direccion`,NULL,'direccion'),
      IF(BINARY OLD.`nit` <=> BINARY NEW.`nit`,NULL,'nit'),
      IF(BINARY OLD.`tipo_proveedor` <=> BINARY NEW.`tipo_proveedor`,NULL,'tipo proveedor'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado'),
      IF(OLD.`fecha_registro` <=> NEW.`fecha_registro`,NULL,'fecha registro')));
CREATE TRIGGER act_proveedor_d AFTER DELETE ON `proveedor` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Proveedor',OLD.id_proveedor,'Retiro',
    CONCAT_WS(' · ',OLD.nombre,OLD.estado), NULL,NULL);

CREATE TRIGGER act_proveedor_ingrediente_i AFTER INSERT ON `proveedor_ingrediente` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM proveedor WHERE id_proveedor=NEW.id_proveedor),'Precio de proveedor',NEW.id_proveedor,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Ingrediente #',NEW.id_ingrediente),NEW.precio_acordado),NULL);
CREATE TRIGGER act_proveedor_ingrediente_u AFTER UPDATE ON `proveedor_ingrediente` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM proveedor WHERE id_proveedor=NEW.id_proveedor),'Precio de proveedor',NEW.id_proveedor,'Edición',
    CONCAT_WS(' · ',CONCAT('Ingrediente #',OLD.id_ingrediente),OLD.precio_acordado), CONCAT_WS(' · ',CONCAT('Ingrediente #',NEW.id_ingrediente),NEW.precio_acordado),
    CONCAT_WS(', ',
      IF(OLD.`id_proveedor` <=> NEW.`id_proveedor`,NULL,'id proveedor'),
      IF(OLD.`id_ingrediente` <=> NEW.`id_ingrediente`,NULL,'id ingrediente'),
      IF(OLD.`precio_acordado` <=> NEW.`precio_acordado`,NULL,'precio acordado'),
      IF(OLD.`tiempo_entrega_dias` <=> NEW.`tiempo_entrega_dias`,NULL,'tiempo entrega dias'),
      IF(OLD.`calidad_rating` <=> NEW.`calidad_rating`,NULL,'calidad rating'),
      IF(OLD.`es_proveedor_principal` <=> NEW.`es_proveedor_principal`,NULL,'es proveedor principal'),
      IF(OLD.`fecha_ultima_compra` <=> NEW.`fecha_ultima_compra`,NULL,'fecha ultima compra')));
CREATE TRIGGER act_proveedor_ingrediente_d AFTER DELETE ON `proveedor_ingrediente` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM proveedor WHERE id_proveedor=OLD.id_proveedor),'Precio de proveedor',OLD.id_proveedor,'Retiro',
    CONCAT_WS(' · ',CONCAT('Ingrediente #',OLD.id_ingrediente),OLD.precio_acordado), NULL,NULL);

CREATE TRIGGER act_orden_compra_i AFTER INSERT ON `orden_compra` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Orden de compra',NEW.id_orden_compra,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Proveedor #',NEW.id_proveedor),NEW.estado),NULL);
CREATE TRIGGER act_orden_compra_u AFTER UPDATE ON `orden_compra` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Orden de compra',NEW.id_orden_compra,'Edición',
    CONCAT_WS(' · ',CONCAT('Proveedor #',OLD.id_proveedor),OLD.estado), CONCAT_WS(' · ',CONCAT('Proveedor #',NEW.id_proveedor),NEW.estado),
    CONCAT_WS(', ',
      IF(OLD.`id_orden_compra` <=> NEW.`id_orden_compra`,NULL,'id orden compra'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_proveedor` <=> NEW.`id_proveedor`,NULL,'id proveedor'),
      IF(OLD.`id_usuario` <=> NEW.`id_usuario`,NULL,'id usuario'),
      IF(OLD.`fecha_orden` <=> NEW.`fecha_orden`,NULL,'fecha orden'),
      IF(OLD.`fecha_entrega_esperada` <=> NEW.`fecha_entrega_esperada`,NULL,'fecha entrega esperada'),
      IF(OLD.`fecha_entrega_real` <=> NEW.`fecha_entrega_real`,NULL,'fecha entrega real'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado'),
      IF(BINARY OLD.`observaciones` <=> BINARY NEW.`observaciones`,NULL,'observaciones')));
CREATE TRIGGER act_orden_compra_d AFTER DELETE ON `orden_compra` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Orden de compra',OLD.id_orden_compra,'Retiro',
    CONCAT_WS(' · ',CONCAT('Proveedor #',OLD.id_proveedor),OLD.estado), NULL,NULL);

CREATE TRIGGER act_detalle_orden_compra_i AFTER INSERT ON `detalle_orden_compra` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM orden_compra WHERE id_orden_compra=NEW.id_orden_compra),'Detalle de compra',NEW.id_detalle_compra,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Orden #',NEW.id_orden_compra),NEW.cantidad_recibida,NEW.precio_unitario),NULL);
CREATE TRIGGER act_detalle_orden_compra_u AFTER UPDATE ON `detalle_orden_compra` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM orden_compra WHERE id_orden_compra=NEW.id_orden_compra),'Detalle de compra',NEW.id_detalle_compra,'Edición',
    CONCAT_WS(' · ',CONCAT('Orden #',OLD.id_orden_compra),OLD.cantidad_recibida,OLD.precio_unitario), CONCAT_WS(' · ',CONCAT('Orden #',NEW.id_orden_compra),NEW.cantidad_recibida,NEW.precio_unitario),
    CONCAT_WS(', ',
      IF(OLD.`id_detalle_compra` <=> NEW.`id_detalle_compra`,NULL,'id detalle compra'),
      IF(OLD.`id_orden_compra` <=> NEW.`id_orden_compra`,NULL,'id orden compra'),
      IF(OLD.`id_ingrediente` <=> NEW.`id_ingrediente`,NULL,'id ingrediente'),
      IF(OLD.`cantidad_solicitada` <=> NEW.`cantidad_solicitada`,NULL,'cantidad solicitada'),
      IF(OLD.`cantidad_recibida` <=> NEW.`cantidad_recibida`,NULL,'cantidad recibida'),
      IF(OLD.`precio_unitario` <=> NEW.`precio_unitario`,NULL,'precio unitario')));
CREATE TRIGGER act_detalle_orden_compra_d AFTER DELETE ON `detalle_orden_compra` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM orden_compra WHERE id_orden_compra=OLD.id_orden_compra),'Detalle de compra',OLD.id_detalle_compra,'Retiro',
    CONCAT_WS(' · ',CONCAT('Orden #',OLD.id_orden_compra),OLD.cantidad_recibida,OLD.precio_unitario), NULL,NULL);

CREATE TRIGGER act_caja_i AFTER INSERT ON `caja` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Caja',NEW.id_caja,'Alta',
    NULL, CONCAT_WS(' · ',NEW.nombre,NEW.estado),NULL);
CREATE TRIGGER act_caja_u AFTER UPDATE ON `caja` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Caja',NEW.id_caja,'Edición',
    CONCAT_WS(' · ',OLD.nombre,OLD.estado), CONCAT_WS(' · ',NEW.nombre,NEW.estado),
    CONCAT_WS(', ',
      IF(OLD.`id_caja` <=> NEW.`id_caja`,NULL,'id caja'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(BINARY OLD.`nombre` <=> BINARY NEW.`nombre`,NULL,'nombre'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado'),
      IF(OLD.`fecha_registro` <=> NEW.`fecha_registro`,NULL,'fecha registro')));
CREATE TRIGGER act_caja_d AFTER DELETE ON `caja` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Caja',OLD.id_caja,'Retiro',
    CONCAT_WS(' · ',OLD.nombre,OLD.estado), NULL,NULL);

CREATE TRIGGER act_turno_caja_i AFTER INSERT ON `turno_caja` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Turno',NEW.id_turno,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Caja #',NEW.id_caja),CONCAT('Cajero #',NEW.id_usuario_cajero),NEW.estado,CONCAT('Fondo ',NEW.efectivo_inicial),CONCAT('Contado ',NEW.efectivo_real)),NULL);
CREATE TRIGGER act_turno_caja_u AFTER UPDATE ON `turno_caja` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Turno',NEW.id_turno,'Edición',
    CONCAT_WS(' · ',CONCAT('Caja #',OLD.id_caja),CONCAT('Cajero #',OLD.id_usuario_cajero),OLD.estado,CONCAT('Fondo ',OLD.efectivo_inicial),CONCAT('Contado ',OLD.efectivo_real)), CONCAT_WS(' · ',CONCAT('Caja #',NEW.id_caja),CONCAT('Cajero #',NEW.id_usuario_cajero),NEW.estado,CONCAT('Fondo ',NEW.efectivo_inicial),CONCAT('Contado ',NEW.efectivo_real)),
    CONCAT_WS(', ',
      IF(OLD.`id_turno` <=> NEW.`id_turno`,NULL,'id turno'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_caja` <=> NEW.`id_caja`,NULL,'id caja'),
      IF(OLD.`id_usuario_cajero` <=> NEW.`id_usuario_cajero`,NULL,'cajero'),
      IF(OLD.`fecha_apertura` <=> NEW.`fecha_apertura`,NULL,'fecha apertura'),
      IF(OLD.`fecha_cierre` <=> NEW.`fecha_cierre`,NULL,'fecha cierre'),
      IF(OLD.`efectivo_inicial` <=> NEW.`efectivo_inicial`,NULL,'efectivo inicial'),
      IF(OLD.`efectivo_esperado` <=> NEW.`efectivo_esperado`,NULL,'efectivo esperado'),
      IF(OLD.`efectivo_real` <=> NEW.`efectivo_real`,NULL,'efectivo real'),
      IF(OLD.`diferencia` <=> NEW.`diferencia`,NULL,'diferencia'),
      IF(BINARY OLD.`notas` <=> BINARY NEW.`notas`,NULL,'notas'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado')));
CREATE TRIGGER act_turno_caja_d AFTER DELETE ON `turno_caja` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Turno',OLD.id_turno,'Retiro',
    CONCAT_WS(' · ',CONCAT('Caja #',OLD.id_caja),CONCAT('Cajero #',OLD.id_usuario_cajero),OLD.estado,CONCAT('Fondo ',OLD.efectivo_inicial),CONCAT('Contado ',OLD.efectivo_real)), NULL,NULL);

CREATE TRIGGER act_flujo_caja_i AFTER INSERT ON `flujo_caja` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM turno_caja WHERE id_turno=NEW.id_turno),'Movimiento de caja',NEW.id_flujo,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Turno #',NEW.id_turno),NEW.metodo,CONCAT('Ingreso ',NEW.ingresos),CONCAT('Egreso ',NEW.egresos)),NULL);
CREATE TRIGGER act_flujo_caja_u AFTER UPDATE ON `flujo_caja` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM turno_caja WHERE id_turno=NEW.id_turno),'Movimiento de caja',NEW.id_flujo,'Edición',
    CONCAT_WS(' · ',CONCAT('Turno #',OLD.id_turno),OLD.metodo,CONCAT('Ingreso ',OLD.ingresos),CONCAT('Egreso ',OLD.egresos)), CONCAT_WS(' · ',CONCAT('Turno #',NEW.id_turno),NEW.metodo,CONCAT('Ingreso ',NEW.ingresos),CONCAT('Egreso ',NEW.egresos)),
    CONCAT_WS(', ',
      IF(OLD.`id_flujo` <=> NEW.`id_flujo`,NULL,'id flujo'),
      IF(OLD.`id_turno` <=> NEW.`id_turno`,NULL,'id turno'),
      IF(OLD.`fecha` <=> NEW.`fecha`,NULL,'fecha'),
      IF(BINARY OLD.`concepto` <=> BINARY NEW.`concepto`,NULL,'concepto'),
      IF(OLD.`ingresos` <=> NEW.`ingresos`,NULL,'ingresos'),
      IF(OLD.`egresos` <=> NEW.`egresos`,NULL,'egresos'),
      IF(OLD.`saldo` <=> NEW.`saldo`,NULL,'saldo'),
      IF(BINARY OLD.`metodo` <=> BINARY NEW.`metodo`,NULL,'metodo'),
      IF(BINARY OLD.`referencia` <=> BINARY NEW.`referencia`,NULL,'referencia'),
      IF(OLD.`id_pago` <=> NEW.`id_pago`,NULL,'id pago')));
CREATE TRIGGER act_flujo_caja_d AFTER DELETE ON `flujo_caja` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM turno_caja WHERE id_turno=OLD.id_turno),'Movimiento de caja',OLD.id_flujo,'Retiro',
    CONCAT_WS(' · ',CONCAT('Turno #',OLD.id_turno),OLD.metodo,CONCAT('Ingreso ',OLD.ingresos),CONCAT('Egreso ',OLD.egresos)), NULL,NULL);

CREATE TRIGGER act_pedido_i AFTER INSERT ON `pedido` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Pedido',NEW.id_pedido,'Alta',
    NULL, CONCAT_WS(' · ',NEW.Tipo_pedido,CONCAT('Mesa ',NEW.Mesa_num),NEW.estado),NULL);
CREATE TRIGGER act_pedido_u AFTER UPDATE ON `pedido` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Pedido',NEW.id_pedido,'Edición',
    CONCAT_WS(' · ',OLD.Tipo_pedido,CONCAT('Mesa ',OLD.Mesa_num),OLD.estado), CONCAT_WS(' · ',NEW.Tipo_pedido,CONCAT('Mesa ',NEW.Mesa_num),NEW.estado),
    CONCAT_WS(', ',
      IF(OLD.`version_salon` <=> NEW.`version_salon`,NULL,'version salon'),
      IF(OLD.`comensales` <=> NEW.`comensales`,NULL,'comensales'),
      IF(OLD.`id_pedido` <=> NEW.`id_pedido`,NULL,'id pedido'),
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_cliente` <=> NEW.`id_cliente`,NULL,'id cliente'),
      IF(OLD.`id_mesero` <=> NEW.`id_mesero`,NULL,'mesero'),
      IF(OLD.`Fecha_hora` <=> NEW.`Fecha_hora`,NULL,'fecha hora'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado'),
      IF(BINARY OLD.`Tipo_pedido` <=> BINARY NEW.`Tipo_pedido`,NULL,'tipo pedido'),
      IF(OLD.`Mesa_num` <=> NEW.`Mesa_num`,NULL,'mesa num'),
      IF(BINARY OLD.`notas` <=> BINARY NEW.`notas`,NULL,'notas')));
CREATE TRIGGER act_pedido_d AFTER DELETE ON `pedido` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Pedido',OLD.id_pedido,'Retiro',
    CONCAT_WS(' · ',OLD.Tipo_pedido,CONCAT('Mesa ',OLD.Mesa_num),OLD.estado), NULL,NULL);

CREATE TRIGGER act_detalle_pedido_i AFTER INSERT ON `Detalle_pedido` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM pedido WHERE id_pedido=NEW.id_pedido),'Detalle de pedido',NEW.id_detalle,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Pedido #',NEW.id_pedido),CONCAT('Producto #',NEW.id_producto),NEW.Cantidad,NEW.estado_item),NULL);
CREATE TRIGGER act_detalle_pedido_u AFTER UPDATE ON `Detalle_pedido` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM pedido WHERE id_pedido=NEW.id_pedido),'Detalle de pedido',NEW.id_detalle,'Edición',
    CONCAT_WS(' · ',CONCAT('Pedido #',OLD.id_pedido),CONCAT('Producto #',OLD.id_producto),OLD.Cantidad,OLD.estado_item), CONCAT_WS(' · ',CONCAT('Pedido #',NEW.id_pedido),CONCAT('Producto #',NEW.id_producto),NEW.Cantidad,NEW.estado_item),
    CONCAT_WS(', ',
      IF(OLD.`id_detalle` <=> NEW.`id_detalle`,NULL,'id detalle'),
      IF(OLD.`id_pedido` <=> NEW.`id_pedido`,NULL,'id pedido'),
      IF(OLD.`id_producto` <=> NEW.`id_producto`,NULL,'id producto'),
      IF(OLD.`Cantidad` <=> NEW.`Cantidad`,NULL,'cantidad'),
      IF(OLD.`Precio_unitario` <=> NEW.`Precio_unitario`,NULL,'precio unitario'),
      IF(BINARY OLD.`nota` <=> BINARY NEW.`nota`,NULL,'nota'),
      IF(BINARY OLD.`estado_item` <=> BINARY NEW.`estado_item`,NULL,'estado item')));
CREATE TRIGGER act_detalle_pedido_d AFTER DELETE ON `Detalle_pedido` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM pedido WHERE id_pedido=OLD.id_pedido),'Detalle de pedido',OLD.id_detalle,'Retiro',
    CONCAT_WS(' · ',CONCAT('Pedido #',OLD.id_pedido),CONCAT('Producto #',OLD.id_producto),OLD.Cantidad,OLD.estado_item), NULL,NULL);

CREATE TRIGGER act_domicilio_i AFTER INSERT ON `domicilio` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM pedido WHERE id_pedido=NEW.id_pedido),'Domicilio',NEW.id_domicilio,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Pedido #',NEW.id_pedido),NEW.estado),NULL);
CREATE TRIGGER act_domicilio_u AFTER UPDATE ON `domicilio` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM pedido WHERE id_pedido=NEW.id_pedido),'Domicilio',NEW.id_domicilio,'Edición',
    CONCAT_WS(' · ',CONCAT('Pedido #',OLD.id_pedido),OLD.estado), CONCAT_WS(' · ',CONCAT('Pedido #',NEW.id_pedido),NEW.estado),
    CONCAT_WS(', ',
      IF(OLD.`id_domicilio` <=> NEW.`id_domicilio`,NULL,'id domicilio'),
      IF(OLD.`id_pedido` <=> NEW.`id_pedido`,NULL,'id pedido'),
      IF(BINARY OLD.`direccion` <=> BINARY NEW.`direccion`,NULL,'direccion'),
      IF(BINARY OLD.`coordenadas_gps` <=> BINARY NEW.`coordenadas_gps`,NULL,'coordenadas gps'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado'),
      IF(OLD.`Fecha_asignacion` <=> NEW.`Fecha_asignacion`,NULL,'fecha asignacion'),
      IF(OLD.`fecha_entrega` <=> NEW.`fecha_entrega`,NULL,'fecha entrega'),
      IF(OLD.`id_repartidor` <=> NEW.`id_repartidor`,NULL,'repartidor')));
CREATE TRIGGER act_domicilio_d AFTER DELETE ON `domicilio` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM pedido WHERE id_pedido=OLD.id_pedido),'Domicilio',OLD.id_domicilio,'Retiro',
    CONCAT_WS(' · ',CONCAT('Pedido #',OLD.id_pedido),OLD.estado), NULL,NULL);

CREATE TRIGGER act_factura_i AFTER INSERT ON `Factura` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM pedido WHERE id_pedido=NEW.id_pedido),'Factura',NEW.id_factura,'Alta',
    NULL, CONCAT_WS(' · ',NEW.consecutivo,NEW.estado,CONCAT('$',NEW.total)),NULL);
CREATE TRIGGER act_factura_u AFTER UPDATE ON `Factura` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM pedido WHERE id_pedido=NEW.id_pedido),'Factura',NEW.id_factura,'Edición',
    CONCAT_WS(' · ',OLD.consecutivo,OLD.estado,CONCAT('$',OLD.total)), CONCAT_WS(' · ',NEW.consecutivo,NEW.estado,CONCAT('$',NEW.total)),
    CONCAT_WS(', ',
      IF(OLD.`id_factura` <=> NEW.`id_factura`,NULL,'id factura'),
      IF(OLD.`id_pedido` <=> NEW.`id_pedido`,NULL,'id pedido'),
      IF(OLD.`Fecha_emision` <=> NEW.`Fecha_emision`,NULL,'fecha emision'),
      IF(BINARY OLD.`consecutivo` <=> BINARY NEW.`consecutivo`,NULL,'consecutivo'),
      IF(BINARY OLD.`CUFE` <=> BINARY NEW.`CUFE`,NULL,'cufe'),
      IF(BINARY OLD.`receptor` <=> BINARY NEW.`receptor`,NULL,'receptor'),
      IF(OLD.`tasa_iva` <=> NEW.`tasa_iva`,NULL,'tasa iva'),
      IF(OLD.`version_edicion` <=> NEW.`version_edicion`,NULL,'version edicion'),
      IF(OLD.`IVA` <=> NEW.`IVA`,NULL,'iva'),
      IF(OLD.`Descuento` <=> NEW.`Descuento`,NULL,'descuento'),
      IF(OLD.`Propina` <=> NEW.`Propina`,NULL,'propina'),
      IF(OLD.`total` <=> NEW.`total`,NULL,'total'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado')));
CREATE TRIGGER act_factura_d AFTER DELETE ON `Factura` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM pedido WHERE id_pedido=OLD.id_pedido),'Factura',OLD.id_factura,'Retiro',
    CONCAT_WS(' · ',OLD.consecutivo,OLD.estado,CONCAT('$',OLD.total)), NULL,NULL);

CREATE TRIGGER act_factura_item_i AFTER INSERT ON `Factura_item` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT p.id_restaurante FROM Factura f JOIN pedido p USING(id_pedido) WHERE f.id_factura=NEW.id_factura),'Detalle de factura',NEW.id_factura,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Renglón #',NEW.id_detalle_pedido),NEW.cantidad_facturada,NEW.precio_unitario),NULL);
CREATE TRIGGER act_factura_item_u AFTER UPDATE ON `Factura_item` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT p.id_restaurante FROM Factura f JOIN pedido p USING(id_pedido) WHERE f.id_factura=NEW.id_factura),'Detalle de factura',NEW.id_factura,'Edición',
    CONCAT_WS(' · ',CONCAT('Renglón #',OLD.id_detalle_pedido),OLD.cantidad_facturada,OLD.precio_unitario), CONCAT_WS(' · ',CONCAT('Renglón #',NEW.id_detalle_pedido),NEW.cantidad_facturada,NEW.precio_unitario),
    CONCAT_WS(', ',
      IF(OLD.`id_factura` <=> NEW.`id_factura`,NULL,'id factura'),
      IF(OLD.`id_detalle_pedido` <=> NEW.`id_detalle_pedido`,NULL,'id detalle pedido'),
      IF(OLD.`cantidad_facturada` <=> NEW.`cantidad_facturada`,NULL,'cantidad facturada'),
      IF(BINARY OLD.`nombre_producto` <=> BINARY NEW.`nombre_producto`,NULL,'nombre producto'),
      IF(OLD.`precio_unitario` <=> NEW.`precio_unitario`,NULL,'precio unitario')));
CREATE TRIGGER act_factura_item_d AFTER DELETE ON `Factura_item` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT p.id_restaurante FROM Factura f JOIN pedido p USING(id_pedido) WHERE f.id_factura=OLD.id_factura),'Detalle de factura',OLD.id_factura,'Retiro',
    CONCAT_WS(' · ',CONCAT('Renglón #',OLD.id_detalle_pedido),OLD.cantidad_facturada,OLD.precio_unitario), NULL,NULL);

CREATE TRIGGER act_pago_i AFTER INSERT ON `pago` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT p.id_restaurante FROM Factura f JOIN pedido p USING(id_pedido) WHERE f.id_factura=NEW.id_factura),'Pago',NEW.id_pago,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Factura #',NEW.id_factura),NEW.estado,NEW.metodo,CONCAT('$',NEW.monto)),NULL);
CREATE TRIGGER act_pago_u AFTER UPDATE ON `pago` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT p.id_restaurante FROM Factura f JOIN pedido p USING(id_pedido) WHERE f.id_factura=NEW.id_factura),'Pago',NEW.id_pago,'Edición',
    CONCAT_WS(' · ',CONCAT('Factura #',OLD.id_factura),OLD.estado,OLD.metodo,CONCAT('$',OLD.monto)), CONCAT_WS(' · ',CONCAT('Factura #',NEW.id_factura),NEW.estado,NEW.metodo,CONCAT('$',NEW.monto)),
    CONCAT_WS(', ',
      IF(OLD.`id_pago` <=> NEW.`id_pago`,NULL,'id pago'),
      IF(OLD.`id_factura` <=> NEW.`id_factura`,NULL,'id factura'),
      IF(OLD.`id_usuario_cajero` <=> NEW.`id_usuario_cajero`,NULL,'cajero'),
      IF(OLD.`fecha_pago` <=> NEW.`fecha_pago`,NULL,'fecha pago'),
      IF(BINARY OLD.`metodo` <=> BINARY NEW.`metodo`,NULL,'metodo'),
      IF(OLD.`monto` <=> NEW.`monto`,NULL,'monto'),
      IF(BINARY OLD.`referencia` <=> BINARY NEW.`referencia`,NULL,'referencia'),
      IF(BINARY OLD.`estado` <=> BINARY NEW.`estado`,NULL,'estado'),
      IF(OLD.`id_turno` <=> NEW.`id_turno`,NULL,'id turno')));
CREATE TRIGGER act_pago_d AFTER DELETE ON `pago` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT p.id_restaurante FROM Factura f JOIN pedido p USING(id_pedido) WHERE f.id_factura=OLD.id_factura),'Pago',OLD.id_pago,'Retiro',
    CONCAT_WS(' · ',CONCAT('Factura #',OLD.id_factura),OLD.estado,OLD.metodo,CONCAT('$',OLD.monto)), NULL,NULL);

CREATE TRIGGER act_ia_i AFTER INSERT ON `IA` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Análisis',NEW.id_IA,'Alta',
    NULL, NEW.Tipo_prediccion,NULL);
CREATE TRIGGER act_ia_u AFTER UPDATE ON `IA` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.id_restaurante,'Análisis',NEW.id_IA,'Edición',
    OLD.Tipo_prediccion, NEW.Tipo_prediccion,
    CONCAT_WS(', ',
      IF(OLD.`id_restaurante` <=> NEW.`id_restaurante`,NULL,'establecimiento'),
      IF(OLD.`id_IA` <=> NEW.`id_IA`,NULL,'id ia'),
      IF(OLD.`Fecha_generacion` <=> NEW.`Fecha_generacion`,NULL,'fecha generacion'),
      IF(BINARY OLD.`Tipo_prediccion` <=> BINARY NEW.`Tipo_prediccion`,NULL,'tipo prediccion'),
      IF(BINARY OLD.`Resultado_generado` <=> BINARY NEW.`Resultado_generado`,NULL,'resultado generado'),
      IF(BINARY OLD.`Recomendaciones_generales` <=> BINARY NEW.`Recomendaciones_generales`,NULL,'recomendaciones generales'),
      IF(OLD.`Nivel_confianza` <=> NEW.`Nivel_confianza`,NULL,'nivel confianza'),
      IF(OLD.`periodo_inicio` <=> NEW.`periodo_inicio`,NULL,'periodo inicio'),
      IF(OLD.`periodo_fin` <=> NEW.`periodo_fin`,NULL,'periodo fin')));
CREATE TRIGGER act_ia_d AFTER DELETE ON `IA` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.id_restaurante,'Análisis',OLD.id_IA,'Retiro',
    OLD.Tipo_prediccion, NULL,NULL);

CREATE TRIGGER act_ia_ingrediente_i AFTER INSERT ON `IA_INGREDIENTE` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM IA WHERE id_IA=NEW.id_IA),'Detalle de análisis',NEW.id_IA_ingrediente,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Análisis #',NEW.id_IA),CONCAT('Ficha #',NEW.id_ingrediente)),NULL);
CREATE TRIGGER act_ia_ingrediente_u AFTER UPDATE ON `IA_INGREDIENTE` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM IA WHERE id_IA=NEW.id_IA),'Detalle de análisis',NEW.id_IA_ingrediente,'Edición',
    CONCAT_WS(' · ',CONCAT('Análisis #',OLD.id_IA),CONCAT('Ficha #',OLD.id_ingrediente)), CONCAT_WS(' · ',CONCAT('Análisis #',NEW.id_IA),CONCAT('Ficha #',NEW.id_ingrediente)),
    CONCAT_WS(', ',
      IF(OLD.`id_IA_ingrediente` <=> NEW.`id_IA_ingrediente`,NULL,'id ia ingrediente'),
      IF(OLD.`id_IA` <=> NEW.`id_IA`,NULL,'id ia'),
      IF(OLD.`id_ingrediente` <=> NEW.`id_ingrediente`,NULL,'id ingrediente'),
      IF(OLD.`Demanda_predicha_ingrediente` <=> NEW.`Demanda_predicha_ingrediente`,NULL,'demanda predicha ingrediente'),
      IF(OLD.`Nivel_confianza` <=> NEW.`Nivel_confianza`,NULL,'nivel confianza'),
      IF(OLD.`Ingrediente_critico` <=> NEW.`Ingrediente_critico`,NULL,'ingrediente critico')));
CREATE TRIGGER act_ia_ingrediente_d AFTER DELETE ON `IA_INGREDIENTE` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM IA WHERE id_IA=OLD.id_IA),'Detalle de análisis',OLD.id_IA_ingrediente,'Retiro',
    CONCAT_WS(' · ',CONCAT('Análisis #',OLD.id_IA),CONCAT('Ficha #',OLD.id_ingrediente)), NULL,NULL);

CREATE TRIGGER act_ia_producto_i AFTER INSERT ON `IA_PRODUCTO` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM IA WHERE id_IA=NEW.id_IA),'Detalle de análisis',NEW.id_IA_producto,'Alta',
    NULL, CONCAT_WS(' · ',CONCAT('Análisis #',NEW.id_IA),CONCAT('Ficha #',NEW.id_producto)),NULL);
CREATE TRIGGER act_ia_producto_u AFTER UPDATE ON `IA_PRODUCTO` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM IA WHERE id_IA=NEW.id_IA),'Detalle de análisis',NEW.id_IA_producto,'Edición',
    CONCAT_WS(' · ',CONCAT('Análisis #',OLD.id_IA),CONCAT('Ficha #',OLD.id_producto)), CONCAT_WS(' · ',CONCAT('Análisis #',NEW.id_IA),CONCAT('Ficha #',NEW.id_producto)),
    CONCAT_WS(', ',
      IF(OLD.`id_IA_producto` <=> NEW.`id_IA_producto`,NULL,'id ia producto'),
      IF(OLD.`id_IA` <=> NEW.`id_IA`,NULL,'id ia'),
      IF(OLD.`id_producto` <=> NEW.`id_producto`,NULL,'id producto'),
      IF(OLD.`demanda_predicho_producto` <=> NEW.`demanda_predicho_producto`,NULL,'demanda predicho producto'),
      IF(OLD.`nivel_confianza_producto` <=> NEW.`nivel_confianza_producto`,NULL,'nivel confianza producto'),
      IF(OLD.`Producto_critico` <=> NEW.`Producto_critico`,NULL,'producto critico'),
      IF(BINARY OLD.`Recomendacion_producto` <=> BINARY NEW.`Recomendacion_producto`,NULL,'recomendacion producto')));
CREATE TRIGGER act_ia_producto_d AFTER DELETE ON `IA_PRODUCTO` FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM IA WHERE id_IA=OLD.id_IA),'Detalle de análisis',OLD.id_IA_producto,'Retiro',
    CONCAT_WS(' · ',CONCAT('Análisis #',OLD.id_IA),CONCAT('Ficha #',OLD.id_producto)), NULL,NULL);
