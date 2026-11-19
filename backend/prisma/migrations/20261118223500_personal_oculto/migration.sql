-- La baja de acceso es global para la cuenta; retirar la ficha de la lista es por gestor.
CREATE TABLE personal_oculto (
  id_actor INT NOT NULL, id_usuario INT NOT NULL, PRIMARY KEY(id_actor,id_usuario), INDEX oculto_usuario(id_usuario),
  CONSTRAINT personal_oculto_usuario FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT personal_oculto_actor FOREIGN KEY(id_actor) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TRIGGER act_personal_oculto_i AFTER INSERT ON personal_oculto FOR EACH ROW
  CALL registrar_actividad_sede((SELECT id_restaurante FROM usuario WHERE id_usuario=NEW.id_usuario),'Personal',NEW.id_usuario,'Retiro de mi lista',NULL,CONCAT('Omitido del listado del gestor #',NEW.id_actor),NULL);
