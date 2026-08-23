import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

const ROL_SUPERADMIN = 1;
const ROL_GERENTE = 2;
const ROLES_OPERATIVOS = [3, 4, 5];
const ROLES_GESTIONABLES_POR_GERENTE = [
  ROL_GERENTE,
  ...ROLES_OPERATIVOS,
];

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

function validateIdRestaurante(value, required = false) {
  if (isEmpty(value)) {
    return required
      ? 'El campo id_restaurante es requerido y debe ser un número entero válido'
      : null;
  }

  const idRestaurante = Number(value);

  if (!Number.isInteger(idRestaurante) || idRestaurante <= 0) {
    return 'El campo id_restaurante debe ser un número entero válido';
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

  if (value.length < 8) {
    return 'La contraseña debe tener mínimo 8 caracteres';
  }

  if (value.length > 255) {
    return 'La contraseña no puede superar 255 caracteres';
  }

  if (!/[a-z]/.test(value)) {
    return 'La contraseña debe incluir al menos una letra minúscula';
  }

  if (!/[A-Z]/.test(value)) {
    return 'La contraseña debe incluir al menos una letra mayúscula';
  }

  if (!/\d/.test(value)) {
    return 'La contraseña debe incluir al menos un número';
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'La contraseña debe incluir al menos un carácter especial';
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

function esRolOperativo(idRol) {
  return ROLES_OPERATIVOS.includes(idRol);
}

function esRolGestionablePorGerente(idRol) {
  return ROLES_GESTIONABLES_POR_GERENTE.includes(idRol);
}

function formatUsuario(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    id_rol: usuario.id_rol,
    id_restaurante: usuario.id_restaurante ?? null,
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

function validarUsuario(
  body,
  { requirePassword = false, requireRestaurante = false } = {},
) {
  const validations = [
    validateIdRol(body.id_rol),
    validateIdRestaurante(body.id_restaurante, requireRestaurante),
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
      id_restaurante: isEmpty(body.id_restaurante)
        ? null
        : Number(body.id_restaurante),
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

async function restauranteExiste(idRestaurante) {
  if (!idRestaurante) {
    return false;
  }

  const restaurante = await prisma.restaurante.findUnique({
    where: { id_restaurante: idRestaurante },
    select: { id_restaurante: true },
  });

  return Boolean(restaurante);
}

function puedeVerUsuario(actor, usuario) {
  const rolActor = actor?.rol?.toUpperCase();

  if (rolActor === 'SUPERADMIN') {
    return usuario.id_rol === ROL_GERENTE;
  }

  if (rolActor === 'GERENTE') {
    return (
      usuario.id_usuario === actor.id_usuario ||
      (
        usuario.id_restaurante === actor.id_restaurante &&
        esRolGestionablePorGerente(usuario.id_rol)
      )
    );
  }

  return false;
}

function puedeGestionarUsuario(actor, usuario) {
  const rolActor = actor?.rol?.toUpperCase();

  if (rolActor === 'SUPERADMIN') {
    return usuario.id_rol === ROL_GERENTE;
  }

  if (rolActor === 'GERENTE') {
    return (
      usuario.id_restaurante === actor.id_restaurante &&
      esRolGestionablePorGerente(usuario.id_rol)
    );
  }

  return false;
}

// GET /api/usuarios
export async function index(req, res, next) {
  try {
    const rolUsuario = req.user?.rol?.toUpperCase();
    const idRestaurante = req.user?.id_restaurante;
    const idUsuario = req.user?.id_usuario;

    let where = {};

    if (rolUsuario === 'SUPERADMIN') {
      where = { id_rol: ROL_GERENTE };
    } else if (rolUsuario === 'GERENTE') {
      if (!idRestaurante) {
        return res.status(403).json({
          message: 'Tu usuario no tiene un restaurante asignado.',
        });
      }

      where = {
        id_restaurante: idRestaurante,
        OR: [
          { id_rol: { in: ROLES_GESTIONABLES_POR_GERENTE } },
          { id_usuario: idUsuario },
        ],
      };
    } else {
      return res.status(403).json({
        message: 'No tienes permisos para realizar esta acción.',
      });
    }

    const usuarios = await prisma.usuario.findMany({
      where,
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

    if (!usuario || !puedeVerUsuario(req.user, usuario)) {
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
    const rolUsuario = req.user?.rol?.toUpperCase();
    const idRestauranteActor = req.user?.id_restaurante;

    const { error, data, contrasena } = validarUsuario(req.body, {
      requirePassword: true,
      requireRestaurante: rolUsuario === 'SUPERADMIN',
    });

    if (error) {
      return res.status(422).json({ message: error });
    }

    if (rolUsuario === 'SUPERADMIN') {
      if (data.id_rol !== ROL_GERENTE) {
        return res.status(403).json({
          message: 'Solo puedes crear usuarios con rol GERENTE.',
        });
      }
    } else if (rolUsuario === 'GERENTE') {
      if (!idRestauranteActor) {
        return res.status(403).json({
          message: 'Tu usuario no tiene un restaurante asignado.',
        });
      }

      if (!esRolGestionablePorGerente(data.id_rol)) {
        return res.status(403).json({
          message: 'Solo puedes crear usuarios con roles permitidos para tu restaurante.',
        });
      }

      data.id_restaurante = idRestauranteActor;
    } else {
      return res.status(403).json({
        message: 'No tienes permisos para crear usuarios.',
      });
    }

    if (!(await restauranteExiste(data.id_restaurante))) {
      return res.status(422).json({
        message: 'El restaurante indicado no existe.',
      });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 12);

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
        message: 'El rol o restaurante indicado no existe',
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

    const usuarioObjetivo = await prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    if (!usuarioObjetivo) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const rolUsuario = req.user?.rol?.toUpperCase();
    const esPropio = usuarioObjetivo.id_usuario === req.user?.id_usuario;

    const { error, data, contrasena } = validarUsuario(req.body, {
      requirePassword: false,
      requireRestaurante: rolUsuario === 'SUPERADMIN',
    });

    if (error) {
      return res.status(422).json({ message: error });
    }

    if (rolUsuario === 'SUPERADMIN') {
      if (
        usuarioObjetivo.id_rol !== ROL_GERENTE ||
        data.id_rol !== ROL_GERENTE
      ) {
        return res.status(403).json({
          message: 'Solo puedes editar usuarios con rol GERENTE.',
        });
      }
    } else if (rolUsuario === 'GERENTE') {
      if (esPropio) {
        data.id_rol = usuarioObjetivo.id_rol;
        data.id_restaurante = usuarioObjetivo.id_restaurante;
      } else {
        if (!puedeGestionarUsuario(req.user, usuarioObjetivo)) {
          return res.status(403).json({
            message: 'No tienes permisos para editar este usuario.',
          });
        }

        if (!esRolGestionablePorGerente(data.id_rol)) {
          return res.status(403).json({
            message: 'Solo puedes asignar roles permitidos para tu restaurante.',
          });
        }

        data.id_restaurante = req.user.id_restaurante;
      }
    } else {
      return res.status(403).json({
        message: 'No tienes permisos para editar usuarios.',
      });
    }

    if (!(await restauranteExiste(data.id_restaurante))) {
      return res.status(422).json({
        message: 'El restaurante indicado no existe.',
      });
    }

    const updateData = { ...data };

    if (!isEmpty(contrasena)) {
      updateData.contrasena_hash = await bcrypt.hash(contrasena, 12);
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
        message: 'El rol o restaurante indicado no existe',
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    next(err);
  }
}

// DELETE /api/usuarios/:id
// No se elimina físicamente: alterna el estado activo/inactivo.
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

    const rolUsuario = req.user?.rol?.toUpperCase();

    if (rolUsuario === 'SUPERADMIN') {
      if (usuario.id_rol !== ROL_GERENTE) {
        return res.status(403).json({
          message: 'No tienes permisos para modificar este usuario.',
        });
      }
    } else if (rolUsuario === 'GERENTE') {
      if (!puedeGestionarUsuario(req.user, usuario)) {
        return res.status(403).json({
          message: 'No tienes permisos para modificar este usuario.',
        });
      }
    } else {
      return res.status(403).json({
        message: 'No tienes permisos para modificar usuarios.',
      });
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