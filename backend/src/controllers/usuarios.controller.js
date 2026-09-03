import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

const ROL_SUPERADMIN = 1;
const ROL_GERENTE = 2;

const ROLES_OPERATIVOS = [3, 4, 5];

const ROLES_GESTIONABLES_POR_GERENTE = [
  ROL_GERENTE,
  ...ROLES_OPERATIVOS,
];

const ESTADOS_USUARIO = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  ELIMINADO: 'ELIMINADO',
};

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
  if (isEmpty(value)) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 1 || value === '1' || value === 'true') {
    return true;
  }

  if (value === 0 || value === '0' || value === 'false') {
    return false;
  }

  return defaultValue;
}

function esRolGestionablePorGerente(idRol) {
  return ROLES_GESTIONABLES_POR_GERENTE.includes(idRol);
}

function formatUsuario(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    id_rol: usuario.id_rol,
    id_restaurante: usuario.id_restaurante ?? null,
    restaurante: usuario.restaurante?.nombre ?? null,
    identificacion: usuario.identificacion ?? '',
    nombre: usuario.nombre ?? '',
    apellido: usuario.apellido ?? '',
    email: usuario.email ?? '',
    telefono: usuario.telefono ?? '',
    activo: usuario.activo ? 1 : 0,
    estado: usuario.estado ?? (
      usuario.activo
        ? ESTADOS_USUARIO.ACTIVO
        : ESTADOS_USUARIO.INACTIVO
    ),
    fecha_registro: usuario.fecha_registro,
    rol: usuario.rol?.nombre ?? null,
  };
}

function validarUsuario(
  body,
  {
    requirePassword = false,
    requireRestaurante = false,
  } = {},
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

  const activo = parseActivo(body.activo, true);

  return {
    data: {
      id_rol: Number(body.id_rol),
      id_restaurante: isEmpty(body.id_restaurante)
        ? null
        : Number(body.id_restaurante),
      identificacion: cleanString(body.identificacion) || null,
      nombre: cleanString(body.nombre),
      apellido: cleanString(body.apellido) || null,
      email: cleanString(body.email).toLowerCase(),
      telefono: cleanString(body.telefono) || null,
      activo,
      estado: activo
        ? ESTADOS_USUARIO.ACTIVO
        : ESTADOS_USUARIO.INACTIVO,
    },
    contrasena: body.contrasena,
  };
}

async function restauranteExiste(idRestaurante) {
  if (!idRestaurante) {
    return false;
  }

  const restaurante = await prisma.restaurante.findUnique({
    where: {
      id_restaurante: idRestaurante,
    },
    select: {
      id_restaurante: true,
    },
  });

  return Boolean(restaurante);
}

function puedeVerUsuario(actor, usuario) {
  const rolActor = actor?.rol?.toUpperCase();

  if (rolActor === 'SUPERADMIN') {
    return (
      usuario.id_rol === ROL_GERENTE &&
      usuario.estado !== ESTADOS_USUARIO.ELIMINADO
    );
  }

  if (rolActor === 'GERENTE') {
    return (
      usuario.estado !== ESTADOS_USUARIO.ELIMINADO &&
      (
        usuario.id_usuario === actor.id_usuario ||
        (
          usuario.id_restaurante === actor.id_restaurante &&
          esRolGestionablePorGerente(usuario.id_rol)
        )
      )
    );
  }

  return false;
}

function puedeGestionarUsuario(actor, usuario) {
  const rolActor = actor?.rol?.toUpperCase();

  if (rolActor === 'SUPERADMIN') {
    return (
      usuario.id_rol === ROL_GERENTE &&
      usuario.estado !== ESTADOS_USUARIO.ELIMINADO
    );
  }

  if (rolActor === 'GERENTE') {
    return (
      usuario.estado !== ESTADOS_USUARIO.ELIMINADO &&
      usuario.id_restaurante === actor.id_restaurante &&
      esRolGestionablePorGerente(usuario.id_rol)
    );
  }

  return false;
}

export async function index(req, res, next) {
  try {
    const rolUsuario = req.user?.rol?.toUpperCase();
    const idRestaurante = req.user?.id_restaurante;
    const idUsuario = req.user?.id_usuario;

    let where = {
      estado: {
        not: ESTADOS_USUARIO.ELIMINADO,
      },
    };

    if (rolUsuario === 'SUPERADMIN') {
      where = {
        ...where,
        id_rol: ROL_GERENTE,
      };
    } else if (rolUsuario === 'GERENTE') {
      if (!idRestaurante) {
        return res.status(403).json({
          message: 'Tu usuario no tiene un restaurante asignado.',
        });
      }

      where = {
        ...where,
        id_restaurante: idRestaurante,
        OR: [
          {
            id_rol: {
              in: ROLES_GESTIONABLES_POR_GERENTE,
            },
          },
          {
            id_usuario: idUsuario,
          },
        ],
      };
    } else {
      return res.status(403).json({
        message: 'No tienes permisos para realizar esta acción.',
      });
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      include: {
        rol: true,
        restaurante: true,
      },
      orderBy: {
        id_usuario: 'asc',
      },
    });

    return res.json(usuarios.map(formatUsuario));
  } catch (err) {
    next(err);
  }
}

export async function show(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del usuario debe ser un número entero válido',
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_usuario: id,
      },
      include: {
        rol: true,
        restaurante: true,
      },
    });

    if (!usuario || !puedeVerUsuario(req.user, usuario)) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    return res.json(formatUsuario(usuario));
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const rolUsuario = req.user?.rol?.toUpperCase();

    if (rolUsuario !== 'SUPERADMIN') {
      return res.status(403).json({
        message: 'Solo el SUPERADMIN puede crear gerentes.',
      });
    }

    const nombreEstablecimiento = cleanString(
      req.body?.nombre_establecimiento,
    );

    const errorNombreEstablecimiento = validateString(
      nombreEstablecimiento,
      'nombre_establecimiento',
      100,
      true,
    );

    if (errorNombreEstablecimiento) {
      return res.status(422).json({
        message: errorNombreEstablecimiento,
      });
    }

    const {
      error,
      data,
      contrasena,
    } = validarUsuario(req.body, {
      requirePassword: true,
      requireRestaurante: false,
    });

    if (error) {
      return res.status(422).json({
        message: error,
      });
    }

    if (data.id_rol !== ROL_GERENTE) {
      return res.status(403).json({
        message: 'Solo puedes crear usuarios con rol GERENTE.',
      });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 12);

    const resultado = await prisma.$transaction(async (tx) => {
      const restaurante = await tx.restaurante.create({
        data: {
          nombre: nombreEstablecimiento,
          activo: true,
        },
        select: {
          id_restaurante: true,
          nombre: true,
        },
      });

      const usuario = await tx.usuario.create({
        data: {
          ...data,
          id_restaurante: restaurante.id_restaurante,
          contrasena_hash,
          estado: ESTADOS_USUARIO.ACTIVO,
        },
        select: {
          id_usuario: true,
          nombre: true,
          apellido: true,
          email: true,
          id_restaurante: true,
          activo: true,
          estado: true,
        },
      });

      return {
        restaurante,
        usuario,
      };
    });

    return res.status(201).json({
      message: 'Gerente y establecimiento creados correctamente.',
      data: resultado,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'El email del usuario ya está registrado.',
      });
    }

    if (err.code === 'P2003') {
      return res.status(422).json({
        message: 'No fue posible asociar el gerente al establecimiento.',
      });
    }

    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del usuario debe ser un número entero válido',
      });
    }

    const usuarioObjetivo = await prisma.usuario.findUnique({
      where: {
        id_usuario: id,
      },
    });

    if (
      !usuarioObjetivo ||
      usuarioObjetivo.estado === ESTADOS_USUARIO.ELIMINADO
    ) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    const rolUsuario = req.user?.rol?.toUpperCase();
    const esPropio = usuarioObjetivo.id_usuario === req.user?.id_usuario;

    const {
      error,
      data,
      contrasena,
    } = validarUsuario(req.body, {
      requirePassword: false,
      requireRestaurante: rolUsuario === 'SUPERADMIN',
    });

    if (error) {
      return res.status(422).json({
        message: error,
      });
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
        data.activo = usuarioObjetivo.activo;
        data.estado = usuarioObjetivo.estado;
      } else {
        if (!puedeGestionarUsuario(req.user, usuarioObjetivo)) {
          return res.status(403).json({
            message: 'No tienes permisos para editar este usuario.',
          });
        }

        if (!esRolGestionablePorGerente(data.id_rol)) {
          return res.status(403).json({
            message:
              'Solo puedes asignar roles permitidos para tu restaurante.',
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

    const updateData = {
      ...data,
    };

    if (!isEmpty(contrasena)) {
      updateData.contrasena_hash = await bcrypt.hash(contrasena, 12);
    }

    await prisma.usuario.update({
      where: {
        id_usuario: id,
      },
      data: updateData,
    });

    return res.json({
      message: 'Usuario actualizado',
    });
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
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del usuario debe ser un número entero válido',
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_usuario: id,
      },
    });

    if (
      !usuario ||
      usuario.estado === ESTADOS_USUARIO.ELIMINADO
    ) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
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

    if (req.user?.id_usuario === id) {
      return res.status(409).json({
        message: 'No puedes eliminar tu propio usuario autenticado',
      });
    }

    await prisma.usuario.update({
      where: {
        id_usuario: id,
      },
      data: {
        activo: false,
        estado: ESTADOS_USUARIO.ELIMINADO,
      },
    });

    return res.json({
      message: 'Usuario eliminado correctamente',
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    next(err);
  }
}

export async function cambiarEstado(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del usuario debe ser un número entero válido',
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_usuario: id,
      },
    });

    if (
      !usuario ||
      usuario.estado === ESTADOS_USUARIO.ELIMINADO
    ) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    if (!puedeGestionarUsuario(req.user, usuario)) {
      return res.status(403).json({
        message: 'No tienes permisos para modificar este usuario.',
      });
    }

    if (req.user?.id_usuario === id && usuario.activo) {
      return res.status(409).json({
        message: 'No puedes desactivar tu propio usuario autenticado',
      });
    }

    const activar = !usuario.activo;

    await prisma.usuario.update({
      where: {
        id_usuario: id,
      },
      data: {
        activo: activar,
        estado: activar
          ? ESTADOS_USUARIO.ACTIVO
          : ESTADOS_USUARIO.INACTIVO,
      },
    });

    return res.json({
      message: activar
        ? 'Usuario activado'
        : 'Usuario desactivado',
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      });
    }

    next(err);
  }
}