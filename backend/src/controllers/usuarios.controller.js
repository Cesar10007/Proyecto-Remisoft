import { escritura } from '../services/actividad.service.js';
import { crearEstablecimiento, puedeEntrarSede } from '../utils/restaurante.js';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { parseId, validateString, validateEmail } from '../utils/validation.js';

const ROL_SUPERADMIN = 1;
const ROL_GERENTE = 2;

const ROLES_OPERATIVOS = [3, 4, 5, 6];

const ROLES_GESTIONABLES_POR_GERENTE = [
  ROL_GERENTE,
  ...ROLES_OPERATIVOS,
];

const ESTADOS_USUARIO = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  ELIMINADO: 'ELIMINADO',
};

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value;
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
    ...(Array.isArray(usuario.sedes) && {
      sedes: usuario.sedes
        .map((s) => s.restaurante ?? s)
        .filter(Boolean)
        .map((r) => ({ id_restaurante: r.id_restaurante, nombre: r.nombre })),
    }),
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
    validateEmail(body.email, { required: true }),
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

function sedeDelGerente(req) {
  return { oculto_para: { none: { id_actor: req.user.id_usuario } },
    ...(req.user.rol === 'GERENTE' && { id_restaurante: req.user.id_restaurante }) };
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
      ...sedeDelGerente(req),
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
        ...sedeDelGerente(req),
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

    if (rolUsuario === 'GERENTE') {
      if (req.body.id_restaurante != null && Number(req.body.id_restaurante) !== req.user.id_restaurante) {
        return res.status(403).json({ message: 'Solo puedes crear personal en tu restaurante.' });
      }
      const { error, data, contrasena } = validarUsuario({ ...req.body, id_restaurante: req.user.id_restaurante }, {
        requirePassword: true,
        requireRestaurante: true,
      });

      if (error) return res.status(422).json({ message: error });
      if (!esRolGestionablePorGerente(data.id_rol)) {
        return res.status(403).json({ message: 'Solo puedes crear personal operativo.' });
      }

      const contrasena_hash = await bcrypt.hash(contrasena, 12);
      const usuario = await escritura(req.user, tx => tx.usuario.create({
        data: { ...data, contrasena_hash },
        include: { rol: true, restaurante: true },
      }));

      return res.status(201).json({
        message: 'Personal creado correctamente.',
        data: formatUsuario(usuario),
      });
    }

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

    const resultado = await escritura(req.user, async (tx) => {
      const restaurante = await crearEstablecimiento(tx, nombreEstablecimiento);

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

      // La sede activa nace como membresía: sin esto el gerente no podría
      // volver a su sede después de pasar a otra.
      await tx.usuario_restaurante.createMany({
        data: [{ id_usuario: usuario.id_usuario, id_restaurante: restaurante.id_restaurante }],
        skipDuplicates: true,
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
        ...sedeDelGerente(req),
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

    const updateData = { ...data };
    // Editar el nombre/rol nunca reactiva una cuenta inactiva de forma implícita.
    if (req.body.activo === undefined) { delete updateData.activo; delete updateData.estado; }

    if (!isEmpty(contrasena)) {
      updateData.contrasena_hash = await bcrypt.hash(contrasena, 12);
    }

    // Multisede: pasar a una sede que el usuario ya tenía es un cambio de sede
    // activa; pasar a una sede nueva es un traslado y deja de ver la anterior.
    const yaEraMiembro = data.id_restaurante === usuarioObjetivo.id_restaurante
      || Boolean(await prisma.usuario_restaurante.findUnique({
        where: {
          id_usuario_id_restaurante: {
            id_usuario: id,
            id_restaurante: data.id_restaurante,
          },
        },
        select: { id_usuario: true },
      }));

    await escritura(req.user, async (tx) => {
      const actualizado = await tx.usuario.update({
        where: {
          ...sedeDelGerente(req),
          id_usuario: id,
        },
        data: updateData,
      });

      if (data.id_restaurante !== usuarioObjetivo.id_restaurante) {
        if (!yaEraMiembro) {
          await tx.usuario_restaurante.deleteMany({ where: { id_usuario: id } });
        }
        await tx.usuario_restaurante.createMany({
          data: [{ id_usuario: id, id_restaurante: data.id_restaurante }],
          skipDuplicates: true,
        });
      }

      return actualizado;
    }, { sedes: [usuarioObjetivo.id_restaurante, data.id_restaurante] });

    return res.json({
      message: 'Usuario actualizado',
    });
  } catch (err) {
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
        ...sedeDelGerente(req),
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

    await escritura(req.user, async tx => {
      await tx.usuario.update({ where: { ...sedeDelGerente(req), id_usuario: id }, data: { activo: false, estado: ESTADOS_USUARIO.INACTIVO } });
      await tx.personal_oculto.create({ data: { id_actor: req.user.id_usuario, id_usuario: id } });
    }, { sedes: [usuario.id_restaurante] });
    return res.json({ message: 'Usuario desactivado y retirado de tu lista. Se conserva su historial.' });
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
        ...sedeDelGerente(req),
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

    if (req.body?.activo !== undefined && typeof req.body.activo !== 'boolean') return res.status(422).json({ message: 'El estado activo debe ser booleano.' });
    const activar = req.body?.activo ?? !usuario.activo;

    await escritura(req.user, tx => tx.usuario.update({
      where: {
        ...sedeDelGerente(req),
        id_usuario: id,
      },
      data: {
        activo: activar,
        estado: activar
          ? ESTADOS_USUARIO.ACTIVO
          : ESTADOS_USUARIO.INACTIVO,
      },
    }), { sedes: [usuario.id_restaurante] });

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
// ---------------------------------------------------------------------------
// Gerente multisede
//
// usuario.id_restaurante es la sede ACTIVA de la sesión; usuario_restaurante es
// el conjunto de sedes a las que el usuario puede entrar. El SUPERADMIN asigna
// sedes; el gerente solo cambia entre las suyas. El cambio es persistente:
// así req.user.id_restaurante (y todo lo que depende de él) sigue coincidiendo
// en cada petición, sin que el cliente elija la sede por query o cabecera.
// Ver docs/aislamiento-sedes.md.
// ---------------------------------------------------------------------------

const MAX_SEDES_POR_USUARIO = 50;

// Lista de sedes con el nombre y cuál está activa. Alimenta el selector del
// gerente y no revela sedes a las que no pertenece.
export async function misSedes(req, res, next) {
  try {
    if (req.user?.rol === 'SUPERADMIN') {
      const sedes = await prisma.restaurante.findMany({
        where: { activo: true },
        select: { id_restaurante: true, nombre: true },
        orderBy: { id_restaurante: 'asc' },
      });
      return res.json({
        id_restaurante: req.user.id_restaurante ?? null,
        data: sedes,
      });
    }

    const filas = await prisma.usuario_restaurante.findMany({
      where: { id_usuario: req.user.id_usuario },
      select: {
        restaurante: { select: { id_restaurante: true, nombre: true, activo: true } },
      },
    });

    const data = filas
      .map((f) => f.restaurante)
      .filter((r) => r && r.activo)
      .sort((a, b) => a.id_restaurante - b.id_restaurante)
      .map((r) => ({ id_restaurante: r.id_restaurante, nombre: r.nombre }));

    return res.json({ id_restaurante: req.user.id_restaurante ?? null, data });
  } catch (err) {
    next(err);
  }
}

// Cambia la sede activa del propio usuario. 404 (no 403) si la sede no está
// entre las suyas: no se confirma la existencia de otras sedes.
export async function cambiarSede(req, res, next) {
  try {
    if (req.user?.rol === 'SUPERADMIN') {
      return res.status(409).json({
        message: 'Tu usuario es global. Usa el selector de establecimiento (?id_restaurante=).',
      });
    }

    const id = parseId(req.body?.id_restaurante);

    if (!id) {
      return res.status(422).json({
        message: 'El campo id_restaurante debe ser un número entero válido',
      });
    }

    if (!puedeEntrarSede(req.user, id)) {
      return res.status(404).json({ message: 'Establecimiento no disponible.' });
    }

    if (id === req.user.id_restaurante) {
      return res.json({
        message: 'Ya operas en ese establecimiento.',
        id_restaurante: id,
        nombre_establecimiento: req.user.nombre_establecimiento ?? null,
      });
    }

    const sede = await prisma.restaurante.findFirst({
      where: { id_restaurante: id, activo: true },
      select: { id_restaurante: true, nombre: true },
    });

    // Inactiva o inexistente: mismo 404, sin distinguir cuál de las dos es.
    if (!sede) {
      return res.status(404).json({ message: 'Establecimiento no disponible.' });
    }

    // permiteSedeCerrada: poder salir de una sede cerrada y entrar a una abierta
    // es justamente lo que necesita el gerente. El cambio queda en actividad_sede
    // (trigger act_usuario_traslado) con el actor real de la petición.
    await escritura(
      req.user,
      (tx) => tx.usuario.update({
        where: { id_usuario: req.user.id_usuario },
        data: { id_restaurante: id },
        select: { id_usuario: true },
      }),
      { permiteSedeCerrada: true, sedes: [req.user.id_restaurante, id] },
    );

    return res.json({
      message: `Ahora operas en ${sede.nombre}.`,
      id_restaurante: sede.id_restaurante,
      nombre_establecimiento: sede.nombre,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    next(err);
  }
}

// Sedes asignadas a un usuario (solo SUPERADMIN).
export async function sedesDeUsuario(req, res, next) {
  try {
    if (req.user?.rol?.toUpperCase() !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'No tienes permisos para ver esta información.' });
    }

    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({ message: 'El id del usuario debe ser un número entero válido' });
    }

    const usuario = await prisma.usuario.findFirst({
      where: { id_usuario: id, estado: { not: ESTADOS_USUARIO.ELIMINADO } },
      select: {
        id_usuario: true,
        id_restaurante: true,
        sedes: {
          select: { restaurante: { select: { id_restaurante: true, nombre: true } } },
        },
      },
    });

    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.json({
      id_usuario: usuario.id_usuario,
      id_restaurante: usuario.id_restaurante ?? null,
      data: usuario.sedes
        .map((s) => s.restaurante)
        .filter(Boolean)
        .sort((a, b) => a.id_restaurante - b.id_restaurante),
    });
  } catch (err) {
    next(err);
  }
}

function parseSedes(value) {
  if (!Array.isArray(value)) return { error: 'El campo sedes debe ser una lista de ids.' };
  const ids = [...new Set(value.map(Number))];
  if (ids.length === 0) return { error: 'Asigna al menos un establecimiento.' };
  if (ids.length > MAX_SEDES_POR_USUARIO) {
    return { error: `Un usuario no puede tener más de ${MAX_SEDES_POR_USUARIO} establecimientos.` };
  }
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    return { error: 'Cada establecimiento debe ser un número entero válido.' };
  }
  return { ids };
}

// Reemplaza el conjunto de sedes de un usuario (solo SUPERADMIN). La sede
// activa debe seguir perteneciendo al conjunto: si se retira, pasa a la primera.
export async function asignarSedes(req, res, next) {
  try {
    if (req.user?.rol?.toUpperCase() !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Solo el SUPERADMIN puede asignar establecimientos.' });
    }

    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({ message: 'El id del usuario debe ser un número entero válido' });
    }

    const { ids, error } = parseSedes(req.body?.sedes);

    if (error) return res.status(422).json({ message: error });

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true, id_rol: true, id_restaurante: true, estado: true },
    });

    if (!usuario || usuario.estado === ESTADOS_USUARIO.ELIMINADO) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (usuario.id_rol === ROL_SUPERADMIN) {
      return res.status(409).json({ message: 'El superadmin ya opera en todas las sedes.' });
    }

    const existentes = await prisma.restaurante.findMany({
      where: { id_restaurante: { in: ids } },
      select: { id_restaurante: true, nombre: true },
      orderBy: { id_restaurante: 'asc' },
    });

    if (existentes.length !== ids.length) {
      return res.status(422).json({ message: 'Alguno de los establecimientos indicados no existe.' });
    }

    const activa = ids.includes(usuario.id_restaurante) ? usuario.id_restaurante : existentes[0].id_restaurante;

    await escritura(req.user, async (tx) => {
      await tx.usuario_restaurante.deleteMany({
        where: { id_usuario: id, id_restaurante: { notIn: ids } },
      });
      await tx.usuario_restaurante.createMany({
        data: ids.map((idRestaurante) => ({ id_usuario: id, id_restaurante: idRestaurante })),
        skipDuplicates: true,
      });
      if (activa !== usuario.id_restaurante) {
        await tx.usuario.update({ where: { id_usuario: id }, data: { id_restaurante: activa } });
      }
    }, { permiteSedeCerrada: true, sedes: [...ids, usuario.id_restaurante] });

    return res.json({
      message: 'Establecimientos actualizados.',
      id_usuario: id,
      id_restaurante: activa,
      data: existentes,
    });
  } catch (err) {
    if (err.code === 'P2003' || err.code === 'P2025') {
      return res.status(422).json({ message: 'No fue posible asociar los establecimientos.' });
    }

    next(err);
  }
}
