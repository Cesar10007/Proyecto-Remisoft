// Bootstrap local para instalaciones sin demo. No es un endpoint público ni un paso del arranque.
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';
import { validateEmail } from '../src/utils/validation.js';

async function crearPrimero() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (validateEmail(email, { required: true })) throw new Error('Define un ADMIN_EMAIL válido.');
  if (process.stdin.isTTY) throw new Error('Pasa la contraseña por entrada estándar, no como argumento.');
  const clave = readFileSync(0, 'utf8').replace(/\r?\n$/, '');
  if (clave.length < 12 || Buffer.byteLength(clave) > 72) throw new Error('Usa al menos 12 caracteres y como máximo 72 bytes para la contraseña.');
  const contrasena_hash = await bcrypt.hash(clave, 12);
  await prisma.$transaction(async tx => {
    // Serializa dos intentos de bootstrap y nunca reemplaza una cuenta existente.
    const roles = await tx.$queryRaw`SELECT id_rol FROM rol WHERE id_rol = 1 AND nombre = 'SUPERADMIN' FOR UPDATE`;
    if (!roles.length) throw new Error('Verifica las migraciones y el catálogo de roles antes de continuar.');
    if (await tx.usuario.count({ where: { id_rol: 1 } })) throw new Error('Ya hay un superadministrador; no se ha cambiado ninguna cuenta.');
    await tx.usuario.create({ data: { id_rol: 1, nombre: 'Superadministrador', email, contrasena_hash } });
  });
  console.log('Superadministrador creado. No se generaron establecimientos ni datos de negocio.');
}

try { await crearPrimero(); }
catch (e) {
  // Los errores del ORM pueden incluir argumentos de la operación; no registrar credenciales ni hashes.
  console.error(e.code === 'P2002' ? 'El correo ya está en uso.' : e.constructor === Error ? e.message : 'No se pudo completar el alta. Revisa la conexión y las migraciones.');
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
