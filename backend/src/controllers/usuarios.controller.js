import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

function parseId(id) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function validateString(value, field, max, required = false) {
  const cleaned = cleanString(value);

  if (required && isEmpty(cleaned)) {
    return `El campo ${field} es requerido`;
  }

  if (!isEmpty(cleaned) && typeof cleaned !== 'string') {
    return `El campo ${field} debe ser texto`;
  }

  if (!isEmpty(cleaned) && cleaned.length > max) {
    return `El campo ${field} no puede superar ${max} caracteres`;
  }

  return null;
}

function validateEmail(value) {
  const cleaned = cleanString(value);

  if (isEmpty(cleaned)) {
    return 'El campo email es requerido';
  }

  if (typeof cleaned !== 'string') {
    return 'El campo email debe ser texto';
  }

  if (cleaned.length > 100) {
    return 'El campo email no puede superar 100 caracteres';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleaned)) {
    return 'El campo email debe ser un correo válido';
  }

  return null;
}

function validateIdRol(value) {
  const idRol = Number(value);

  if (!Number.isInteger(idRol) || idRol <= 0) {
    return 'El campo id_rol es requerido y debe ser un número entero válido';
  }

  return null;
}

function validatePassword(value, required = false) {
  if (required && isEmpty(value)) {
    return 'El campo contrasena es requerido';
  }

  if (isEmpty(value)) {
    return null;
  }

  if (typeof value !== 'string') {
    return 'El campo contrasena debe ser texto';
  }

  if (value.length < 6) {
    return 'El campo contrasena debe tener mínimo 6 caracteres';
  }

  if (value.length > 255) {
    return 'El campo contrasena no puede superar 255 caracteres';
  }

  return null;
}

function parseActivo(value, defaultValue = true) {
  if (isEmpty(value)) return defaultValue;

  if (typeof value === 'boolean') return value;

  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;

  return defaultValue;
}

function formatUsuario(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    id_rol: usuario.id_rol,
    identificacion: usuario.identificacion ?? '',
    nombre: usuario.nombre ?? '',
    apellido: usuario.apellido ?? '',
    email: usuario.email ?? '',
    telefono: usuario.telefono ?? '',
    activo: usuario.activo ? 1 : 0,
    fecha_registro: usuario.fecha_registro,
    rol: usuario.rol?.nombre ?? null,
  };
}

function validarUsuario(body, { requirePassword = false } = {}) {
  const validations = [
    validateIdRol(body.id_rol),
    validateString(body.identificacion, 'identificacion', 20),
    validateString(body.nombre, 'nombre', 60, true),
    validateString(body.apellido, 'apellido', 60),
    validateEmail(body.email),
    validateString(body.telefono, 'telefono', 20),
    validatePassword(body.contrasena, requirePassword),
  ];

  const error = validations.find(Boolean);

  if (error) {
    return { error };
  }

  return {
    data: {
      id_rol: Number(body.id_rol),
      identificacion: cleanString(body.identificacion) || null,
      nombre: cleanString(body.nombre),
      apellido: cleanString(body.apellido) || null,
      email: cleanString(body.email),
      telefono: cleanString(body.telefono) || null,
      activo: parseActivo(body.activo, true),
    },
    contrasena: body.contrasena,
  };
}

// GET /api/usuarios
export async function index(req, res, next) {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { rol: true },
      orderBy: { id_usuario: 'asc' },
    });

    res.json(usuarios.map(formatUsuario));
  } catch (err) {
    next(err);
  }
}

// GET /api/usuarios/:id
export async function show(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del usuario debe ser un número entero válido',
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { rol: true },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(formatUsuario(usuario));
  } catch (err) {
    next(err);
  }
}

// POST /api/usuarios
export async function crear(req, res, next) {
  try {
    const { error, data, contrasena } = validarUsuario(req.body, {
      requirePassword: true,
    });

    if (error) {
      return res.status(422).json({ message: error });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    await prisma.usuario.create({
      data: {
        ...data,
        contrasena_hash,
      },
    });

    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'El email del usuario ya está registrado',
      });
    }

    if (err.code === 'P2003') {
      return res.status(422).json({
        message: 'El rol indicado no existe',
      });
    }

    next(err);
  }
}

// PUT /api/usuarios/:id
export async function actualizar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del usuario debe ser un número entero válido',
      });
    }

    const { error, data, contrasena } = validarUsuario(req.body, {
      requirePassword: false,
    });

    if (error) {
      return res.status(422).json({ message: error });
    }

    const updateData = { ...data };

    if (!isEmpty(contrasena)) {
      updateData.contrasena_hash = await bcrypt.hash(contrasena, 10);
    }

    await prisma.usuario.update({
      where: { id_usuario: id },
      data: updateData,
    });

    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'El email del usuario ya está registrado',
      });
    }

    if (err.code === 'P2003') {
      return res.status(422).json({
        message: 'El rol indicado no existe',
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    next(err);
  }
}

// DELETE /api/usuarios/:id
//
// No se elimina físicamente.
// Se alterna activo/inactivo porque el frontend usa esta ruta como botón
// de activar/desactivar.
export async function eliminar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del usuario debe ser un número entero válido',
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const nuevoEstado = !usuario.activo;

    if (req.user?.id_usuario === id && nuevoEstado === false) {
      return res.status(409).json({
        message: 'No puedes desactivar tu propio usuario autenticado',
      });
    }

    await prisma.usuario.update({
      where: { id_usuario: id },
      data: { activo: nuevoEstado },
    });

    res.json({
      message: nuevoEstado ? 'Usuario activado' : 'Usuario desactivado',
    });
  } catch (err) {
    next(err);
  }
}
