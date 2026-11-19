// Un id ausente nunca es un comodín para un empleado. Solo el superadmin
// puede consultar varias sedes; toda escritura operativa exige una concreta.
export function filtroRestaurante(user) {
  const id = user?.id_restaurante;
  if (Number.isInteger(id) && id > 0) return { id_restaurante: id };
  if (user?.rol === 'SUPERADMIN') return {};
  throw Object.assign(new Error('Tu usuario no tiene un establecimiento asignado.'), { status: 403 });
}

// Una relación histórica puede apuntar a un catálogo antes global o a personal
// trasladado. Conservar la operación del padre, no exponer la ficha de otra sede.
export function relacionDeSede(registro, idRestaurante) {
  return registro && idRestaurante != null && registro.id_restaurante === idRestaurante ? registro : null;
}

export function crearEstablecimiento(tx, nombre) {
  return tx.restaurante.create({ data: { nombre, activo: true }, select: { id_restaurante: true, nombre: true } });
}
