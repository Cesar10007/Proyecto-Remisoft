-- Gerente multisede: membresía usuario <-> sede. usuario.id_restaurante pasa a
-- ser la sede ACTIVA; esta tabla guarda a qué sedes puede entrar cada usuario.
-- Solo el SUPERADMIN asigna o retira sedes. El gerente cambia entre las suyas
-- con PATCH /api/usuarios/me/sede (ver docs/aislamiento-sedes.md).
CREATE TABLE `usuario_restaurante` (
  `id_usuario` INT NOT NULL,
  `id_restaurante` INT NOT NULL,
  `fecha_asignacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id_usuario`, `id_restaurante`),
  INDEX `usuario_restaurante_sede_idx` (`id_restaurante`),
  CONSTRAINT `usuario_restaurante_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `usuario_restaurante_sede` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- Backfill: cada usuario con sede activa obtiene su membresía. El superadmin
-- (id_rol = 1, sin sede) no necesita membresía: su acceso es global por rol.
INSERT INTO `usuario_restaurante` (`id_usuario`, `id_restaurante`)
SELECT `id_usuario`, `id_restaurante` FROM `usuario` WHERE `id_restaurante` IS NOT NULL;

-- Invariante: la sede activa SIEMPRE pertenece al conjunto de membresías.
-- Se hace en la base para cubrir también aprobaciones de solicitudes, semillas
-- y altas por SQL: ningún camino de código puede dejar la sede activa huérfana.
CREATE TRIGGER miembro_sede_ai AFTER INSERT ON `usuario` FOR EACH ROW
  INSERT IGNORE INTO `usuario_restaurante` (`id_usuario`, `id_restaurante`)
  SELECT NEW.`id_usuario`, `id_restaurante` FROM `restaurante` WHERE `id_restaurante` = NEW.`id_restaurante`;
CREATE TRIGGER miembro_sede_au AFTER UPDATE ON `usuario` FOR EACH ROW
  INSERT IGNORE INTO `usuario_restaurante` (`id_usuario`, `id_restaurante`)
  SELECT NEW.`id_usuario`, `id_restaurante` FROM `restaurante` WHERE `id_restaurante` = NEW.`id_restaurante`;

-- Trazabilidad: asignar o retirar una sede es un evento del personal de esa sede
-- y del actor real (contexto_actividad), no un cambio silencioso.
CREATE TRIGGER act_usuario_restaurante_i AFTER INSERT ON `usuario_restaurante` FOR EACH ROW
  CALL registrar_actividad_sede(NEW.`id_restaurante`, 'Personal', NEW.`id_usuario`, 'Establecimiento asignado',
    NULL, CONCAT('Usuario #', NEW.`id_usuario`, ' · Sede #', NEW.`id_restaurante`), NULL);
CREATE TRIGGER act_usuario_restaurante_d AFTER DELETE ON `usuario_restaurante` FOR EACH ROW
  CALL registrar_actividad_sede(OLD.`id_restaurante`, 'Personal', OLD.`id_usuario`, 'Establecimiento retirado',
    CONCAT('Usuario #', OLD.`id_usuario`, ' · Sede #', OLD.`id_restaurante`), NULL, NULL);
