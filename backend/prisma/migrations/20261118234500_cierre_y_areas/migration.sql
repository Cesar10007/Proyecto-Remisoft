-- El cierre diario no desactiva la cuenta ni el establecimiento administrativo.
ALTER TABLE restaurante ADD sistema_abierto BOOLEAN NOT NULL DEFAULT TRUE, ADD version_sistema INT NOT NULL DEFAULT 0;
ALTER TABLE contexto_actividad ADD area VARCHAR(20) NULL;
ALTER TABLE actividad_sede ADD grupo VARCHAR(20) NOT NULL DEFAULT 'OTROS', ADD movimiento JSON NULL,
  ADD id_ingrediente_mov INT NULL,
  ADD INDEX actividad_por_grupo(id_restaurante,grupo,id_evento),
  ADD INDEX actividad_por_insumo(id_restaurante,id_ingrediente_mov,id_evento);

CREATE FUNCTION grupo_actividad(ent VARCHAR(40), campos_ VARCHAR(500), detalle VARCHAR(500), area_ VARCHAR(20))
RETURNS VARCHAR(20) DETERMINISTIC NO SQL RETURN CASE
  WHEN area_='COCINA' THEN 'COCINA'
  WHEN ent IN ('Caja','Movimiento de caja','Pago','Turno','Factura','Detalle de factura') THEN 'CAJA'
  WHEN ent IN ('Inventario','Ingrediente','Receta','Lote','Orden de compra','Detalle de compra','Precio de proveedor') THEN 'INVENTARIO'
  WHEN area_='CAJA' AND ent IN ('Pedido','Detalle de pedido') THEN 'CAJA'
  WHEN area_ IS NULL AND ((ent='Detalle de pedido' AND campos_='estado item' AND detalle REGEXP '(PREPARANDO|LISTO)$')
    OR (ent='Pedido' AND campos_='estado' AND detalle REGEXP '(EN_PREPARACION|LISTO)$')) THEN 'COCINA'
  WHEN ent IN ('Pedido','Detalle de pedido','Atención de mesa') THEN 'MESEROS'
  WHEN ent='Sistema' THEN 'SISTEMA' ELSE 'OTROS' END;

-- Instantánea del asiento (no de la unidad de presentación que se pueda elegir mañana).
CREATE VIEW vista_asiento_inventario AS
SELECT m.id_restaurante,m.id_movimiento,m.id_ingrediente,
  JSON_OBJECT('id_ingrediente',m.id_ingrediente,'ingrediente',i.nombre,'unidad',i.unidad_medida,
    'tipo',m.tipo_movimiento,'cantidad',m.cantidad,'origen',m.origen_tipo,'origen_id',m.origen_id,
    'motivo',m.observaciones,'fecha',DATE_FORMAT(m.fecha_hora,'%Y-%m-%dT%H:%i:%sZ')) AS detalle
FROM inventario_mov m LEFT JOIN Ingrediente i ON i.id_ingrediente=m.id_ingrediente AND i.id_restaurante=m.id_restaurante;
UPDATE actividad_sede a LEFT JOIN vista_asiento_inventario m ON a.entidad='Inventario' AND a.accion IN ('Alta','Movimiento histórico')
  AND m.id_restaurante=a.id_restaurante AND m.id_movimiento=a.registro
SET a.grupo=grupo_actividad(a.entidad,a.campos,a.despues,NULL), a.movimiento=IF(m.id_movimiento IS NULL,NULL,m.detalle), a.id_ingrediente_mov=m.id_ingrediente;
CREATE TRIGGER clasificar_actividad BEFORE INSERT ON actividad_sede FOR EACH ROW SET
  NEW.grupo=grupo_actividad(NEW.entidad,NEW.campos,NEW.despues,(SELECT area FROM contexto_actividad WHERE conexion=CONNECTION_ID())),
  NEW.movimiento=IF(NEW.entidad='Inventario' AND NEW.accion='Alta',
    (SELECT detalle FROM vista_asiento_inventario WHERE id_restaurante=NEW.id_restaurante AND id_movimiento=NEW.registro),NULL),
  NEW.id_ingrediente_mov=JSON_VALUE(NEW.movimiento,'$.id_ingrediente');

-- Un único evento para el cambio de estado; mantener las ediciones administrativas del restaurante.
DROP TRIGGER act_restaurante_u;
CREATE TRIGGER act_restaurante_u AFTER UPDATE ON restaurante FOR EACH ROW CALL registrar_actividad_sede(NEW.id_restaurante,
  IF(OLD.sistema_abierto=NEW.sistema_abierto,'Establecimiento','Sistema'),NEW.id_restaurante,
  IF(OLD.sistema_abierto=NEW.sistema_abierto,'Edición',IF(NEW.sistema_abierto,'Apertura del sistema','Cierre total')),
  IF(OLD.sistema_abierto=NEW.sistema_abierto,OLD.nombre,IF(OLD.sistema_abierto,'Abierto','Cerrado')),
  IF(OLD.sistema_abierto=NEW.sistema_abierto,NEW.nombre,IF(NEW.sistema_abierto,'Abierto','Cerrado')),
  CONCAT_WS(', ',IF(OLD.sistema_abierto=NEW.sistema_abierto,NULL,'estado del sistema'),
    IF(OLD.id_restaurante <=> NEW.id_restaurante,NULL,'establecimiento'), IF(BINARY OLD.nombre <=> BINARY NEW.nombre,NULL,'nombre'),
    IF(BINARY OLD.direccion <=> BINARY NEW.direccion,NULL,'dirección'), IF(BINARY OLD.telefono <=> BINARY NEW.telefono,NULL,'teléfono'),
    IF(BINARY OLD.email <=> BINARY NEW.email,NULL,'correo'), IF(OLD.activo <=> NEW.activo,NULL,'activo'),
    IF(OLD.fecha_creacion <=> NEW.fecha_creacion,NULL,'fecha creación')));
