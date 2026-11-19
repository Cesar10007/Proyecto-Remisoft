import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import prisma from '../config/prisma.js';

const cambios = new EventEmitter();
cambios.setMaxListeners(0);
const versiones = new Map();
const inicio = randomUUID();

function notificarSede(id) {
  const sede = String(id), version = randomUUID();
  versiones.set(sede, version);
  cambios.emit(sede, version);
}

// Contexto transaccional, no variables de sesión del pool. Un rollback descarta tanto el cambio
// como sus eventos y el contexto. Los triggers determinan la sede a partir de las filas reales.
export async function escritura(actor, tarea, opciones) {
  const resultado = await prisma.$transaction(async tx => {
    if (actor) {
      const nombre = [actor.nombre, actor.apellido].filter(Boolean).join(' ') || `Usuario #${actor.id_usuario}`;
      await tx.$executeRaw`INSERT INTO contexto_actividad(conexion,id_actor,actor) VALUES(CONNECTION_ID(),${actor.id_usuario},${nombre})`;
    }
    const r = await tarea(tx);
    if (actor) await tx.$executeRaw`DELETE FROM contexto_actividad WHERE conexion=CONNECTION_ID()`;
    return r;
  }, opciones);
  if (actor?.id_restaurante) notificarSede(actor.id_restaurante);
  return resultado;
}

// Long polling autenticado: no se envían filas, nombres ni tokens a otras pestañas/sedes.
// Tras el aviso el navegador vuelve a leer el recurso con sus permisos normales.
export function esperarCambio(req, res) {
  const sede = String(req.sede.id_restaurante), version = versiones.get(sede) ?? inicio;
  res.set('Cache-Control', 'no-store');
  if (req.query.version !== version) return res.json({ version });
  const responder = v => { limpiar(); res.json({ version: v }); };
  const timer = setTimeout(() => responder(version), 20000);
  function limpiar() { clearTimeout(timer); cambios.off(sede, responder); res.off('close', limpiar); }
  cambios.on(sede, responder); res.on('close', limpiar);
}

// Los JWT no generan una fila de sesión. Registrar la acción, no la credencial.
export async function actividadSesion(usuario, accion) {
  if (!usuario.id_restaurante) return;
  await prisma.actividad_sede.create({ data: { id_restaurante: usuario.id_restaurante, id_actor: usuario.id_usuario,
    actor: [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || `Usuario #${usuario.id_usuario}`,
    entidad: 'Sesión', registro: usuario.id_usuario, accion } });
  notificarSede(usuario.id_restaurante);
}
