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

// Sedes a las que puede entrar un usuario. null = cualquiera (solo SUPERADMIN).
// La sede activa siempre cuenta, aunque la membresía se haya perdido al migrar:
// es la sede donde el usuario ya está operando y no se le puede bloquear de golpe.
export function sedesPermitidas(user) {
  if (user?.rol === 'SUPERADMIN') return null;
  const ids = (Array.isArray(user?.sedes) ? user.sedes : [])
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
  const activa = Number(user?.id_restaurante);
  if (Number.isInteger(activa) && activa > 0 && !ids.includes(activa)) ids.push(activa);
  return ids;
}

// La sede ACTIVA (user.id_restaurante) sigue mandando en cada petición; esta
// comprobación solo decide si el usuario puede PASAR a otra sede.
export function puedeEntrarSede(user, idRestaurante) {
  const id = Number(idRestaurante);
  if (!Number.isInteger(id) || id <= 0) return false;
  const permitidas = sedesPermitidas(user);
  return permitidas === null || permitidas.includes(id);
}

export function crearEstablecimiento(tx, nombre) {
  return tx.restaurante.create({ data: { nombre, activo: true }, select: { id_restaurante: true, nombre: true } });
}
