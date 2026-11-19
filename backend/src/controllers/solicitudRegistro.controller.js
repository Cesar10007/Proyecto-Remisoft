import { escritura } from '../services/actividad.service.js';
import { crearEstablecimiento } from '../utils/restaurante.js';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { CORREO_INVALIDO, esConflictoCorreo, validateEmail } from '../utils/validation.js';

function texto(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function obtenerRol(req) {
  return texto(req.user?.rol).toUpperCase();
}

function obtenerIdUsuario(req) {
  const id = Number(req.user?.id_usuario);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function obtenerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function puedeGestionarSolicitud(usuario, solicitud) {
  const rol = texto(usuario?.rol).toUpperCase();

  if (rol === 'SUPERADMIN') {
    return solicitud.id_rol_solicitado === 2;
  }

  if (rol === 'GERENTE') {
    return (
      [3, 4, 5].includes(solicitud.id_rol_solicitado) &&
      solicitud.id_restaurante === usuario.id_restaurante
    );
  }

  return false;
}

function solicitudInvalida(res, errors) {
  return res.status(422).json({
    success: false,
    message: errors.email?.[0],
    errors,
  });
}

export async function crearSolicitud(req, res, next) {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      contrasena,
      id_rol_solicitado,
      id_restaurante,
    } = req.body;

    const errores = {};

    if (!texto(nombre)) errores.nombre = ['El nombre es requerido.'];
    if (!texto(apellido)) errores.apellido = ['El apellido es requerido.'];

    const emailNormalizado = texto(email).toLowerCase();

    const errorCorreo = validateEmail(emailNormalizado, { required: true });
    if (errorCorreo) errores.email = [errorCorreo];

    if (typeof contrasena !== 'string' || contrasena.length < 8) {
      errores.contrasena = [
        'La contraseña debe tener mínimo 8 caracteres.',
      ];
    }

    const idRol = Number(id_rol_solicitado);

    if (!Number.isInteger(idRol) || idRol <= 0) {
      errores.id_rol_solicitado = ['El rol solicitado no es válido.'];
    }

    const idRestaurante =
      id_restaurante === undefined ||
      id_restaurante === null ||
      id_restaurante === ''
        ? null
        : Number(id_restaurante);

    if (
      idRestaurante !== null &&
      (!Number.isInteger(idRestaurante) || idRestaurante <= 0)
    ) {
      errores.id_restaurante = ['El restaurante no es válido.'];
    }

    const nombreEstablecimiento = texto(req.body.nombre_establecimiento);
    if (nombreEstablecimiento.length > 100) errores.nombre_establecimiento = ['Máximo 100 caracteres.'];
    if (![2, 3, 4, 5].includes(idRol)) errores.id_rol_solicitado = ['El rol no se puede solicitar.'];
    if (idRol !== 2 && !idRestaurante) errores.id_restaurante = ['Indica el restaurante para el personal operativo.'];
    if (idRol === 2 && idRestaurante !== null) errores.id_restaurante = ['Al aprobar un gerente se crea un establecimiento nuevo.'];

    if (Object.keys(errores).length > 0) {
      return solicitudInvalida(res, errores);
    }

    const rol = await prisma.rol.findUnique({
      where: { id_rol: idRol },
      select: { id_rol: true },
    });

    if (!rol) {
      return res.status(422).json({
        success: false,
        message: 'El rol solicitado no existe.',
        code: 'INVALID_ROLE',
      });
    }

    if (idRestaurante !== null) {
      const restaurante = await prisma.restaurante.findUnique({
        where: { id_restaurante: idRestaurante },
        select: { id_restaurante: true },
      });

      if (!restaurante) {
        return res.status(422).json({
          success: false,
          message: 'El restaurante no existe.',
          code: 'INVALID_RESTAURANT',
        });
      }
    }

    const cuenta = await prisma.usuario.findUnique({ where: { email: emailNormalizado }, select: { id_usuario: true } });
    if (cuenta) return solicitudInvalida(res, { email: [CORREO_INVALIDO] });

    const hash = await bcrypt.hash(contrasena, 12);
    const solicitud = await escritura(req.user, tx => tx.solicitud_registro.create({
      data: {
        nombre: texto(nombre),
        apellido: texto(apellido),
        email: emailNormalizado,
        telefono: texto(telefono) || null,
        contrasena_hash: hash,
        nombre_establecimiento: idRol === 2 ? nombreEstablecimiento || null : null,
        id_rol_solicitado: idRol,
        id_restaurante: idRestaurante,
      },
      select: {
        id_solicitud: true,
        nombre: true,
        apellido: true,
        email: true,
        estado: true,
        fecha_solicitud: true,
      },
    }));

    return res.status(201).json({
      success: true,
      message: 'Solicitud enviada correctamente.',
      data: solicitud,
    });
  } catch (err) {
    if (esConflictoCorreo(err)) return solicitudInvalida(res, { email: [CORREO_INVALIDO] });

    next(err);
  }
}

export async function listarSolicitudes(req, res, next) {
  try {
    const rolUsuario = obtenerRol(req);
    const idRestaurante = Number(req.user?.id_restaurante);

    const where =
      rolUsuario === 'GERENTE'
        ? {
            estado: 'PENDIENTE',
            id_restaurante: idRestaurante,
            id_rol_solicitado: { in: [3, 4, 5] },
          }
        : {
            estado: 'PENDIENTE',
            id_rol_solicitado: 2,
          };

    const solicitudes = await prisma.solicitud_registro.findMany({
      where,
      orderBy: { fecha_solicitud: 'asc' },
      select: {
        id_solicitud: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        id_rol_solicitado: true,
        id_restaurante: true,
        estado: true,
        fecha_solicitud: true,
        rol: {
          select: {
            nombre: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: solicitudes,
    });
  } catch (err) {
    next(err);
  }
}

export async function historialSolicitudes(req, res, next) {
  try {
    const rolUsuario = obtenerRol(req);
    const idRestaurante = Number(req.user?.id_restaurante);
    const estado = texto(req.query.estado).toUpperCase();

    const estadosPermitidos = ['APROBADA', 'RECHAZADA'];

    if (!['SUPERADMIN', 'GERENTE'].includes(rolUsuario)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para consultar el historial.',
      });
    }

    if (
      rolUsuario === 'GERENTE' &&
      (!Number.isInteger(idRestaurante) || idRestaurante <= 0)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Tu usuario no tiene un restaurante asignado.',
      });
    }

    const where = {
      estado: estadosPermitidos.includes(estado)
        ? estado
        : { in: estadosPermitidos },
      ...(rolUsuario === 'GERENTE'
        ? { id_restaurante: idRestaurante }
        : {}),
    };

    const solicitudes = await prisma.solicitud_registro.findMany({
      where,
      orderBy: { fecha_revision: 'desc' },
      select: {
        id_solicitud: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        id_rol_solicitado: true,
        id_restaurante: true,
        estado: true,
        motivo_rechazo: true,
        fecha_solicitud: true,
        fecha_revision: true,
        revisado_por: true,
        rol: {
          select: {
            nombre: true,
          },
        },
        revisor: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: solicitudes,
    });
  } catch (err) {
    next(err);
  }
}

export async function aprobarSolicitud(req, res, next) {
  try {
    const idSolicitud = obtenerId(req);
    const idRevisor = obtenerIdUsuario(req);

    if (!idSolicitud) {
      return res.status(422).json({
        success: false,
        message: 'El id de la solicitud no es válido.',
      });
    }

    if (!idRevisor) {
      return res.status(401).json({
        success: false,
        message: 'Usuario revisor no válido.',
      });
    }

    const resultado = await escritura(req.user, async (tx) => {
      const solicitud = await tx.solicitud_registro.findUnique({
        where: { id_solicitud: idSolicitud },
      });

      if (!solicitud) {
        const error = new Error('Solicitud no encontrada.');
        error.status = 404;
        throw error;
      }

      if (solicitud.estado !== 'PENDIENTE') {
        const error = new Error('La solicitud ya fue revisada.');
        error.status = 409;
        throw error;
      }

      if (!puedeGestionarSolicitud(req.user, solicitud)) {
        const error = new Error(
          'No tienes permisos para aprobar esta solicitud.',
        );
        error.status = 403;
        throw error;
      }

      // Tampoco una solicitud antigua puede adjudicar al gerente una sede ajena.
      const idRestaurante = solicitud.id_rol_solicitado === 2
        ? (await crearEstablecimiento(tx, solicitud.nombre_establecimiento || `Restaurante de ${solicitud.nombre}`)).id_restaurante
        : req.user.id_restaurante;
      // Si el correo ya no es válido al aprobar, el índice rechaza el alta y se revierte la transacción.
      const usuario = await tx.usuario.create({
        data: {
          id_rol: solicitud.id_rol_solicitado,
          id_restaurante: idRestaurante,
          nombre: solicitud.nombre,
          apellido: solicitud.apellido,
          email: solicitud.email,
          telefono: solicitud.telefono,
          contrasena_hash: solicitud.contrasena_hash,
          activo: true,
        },
        select: {
          id_usuario: true,
          nombre: true,
          apellido: true,
          email: true,
        },
      });

      const solicitudActualizada = await tx.solicitud_registro.update({
        where: { id_solicitud: idSolicitud },
        data: {
          id_restaurante: idRestaurante,
          estado: 'APROBADA',
          fecha_revision: new Date(),
          revisado_por: idRevisor,
        },
        select: {
          id_solicitud: true,
          estado: true,
          fecha_revision: true,
        },
      });

      return {
        usuario,
        solicitud: solicitudActualizada,
      };
    });

    return res.json({
      success: true,
      message: 'Solicitud aprobada y usuario creado correctamente.',
      data: resultado,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    }

    if (esConflictoCorreo(err)) return solicitudInvalida(res, { email: [CORREO_INVALIDO] });

    next(err);
  }
}

export async function rechazarSolicitud(req, res, next) {
  try {
    const idSolicitud = obtenerId(req);
    const idRevisor = obtenerIdUsuario(req);
    const motivo = texto(req.body?.motivo_rechazo);

    if (!idSolicitud) {
      return res.status(422).json({
        success: false,
        message: 'El id de la solicitud no es válido.',
      });
    }

    if (!idRevisor) {
      return res.status(401).json({
        success: false,
        message: 'Usuario revisor no válido.',
      });
    }

    if (!motivo) {
      return res.status(422).json({
        success: false,
        message: 'El motivo de rechazo es requerido.',
      });
    }

    const solicitud = await prisma.solicitud_registro.findUnique({
      where: { id_solicitud: idSolicitud },
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada.',
      });
    }

    if (solicitud.estado !== 'PENDIENTE') {
      return res.status(409).json({
        success: false,
        message: 'La solicitud ya fue revisada.',
      });
    }

    if (!puedeGestionarSolicitud(req.user, solicitud)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para rechazar esta solicitud.',
      });
    }

    const actualizada = await escritura(req.user, tx => tx.solicitud_registro.update({
      where: { id_solicitud: idSolicitud },
      data: {
        estado: 'RECHAZADA',
        motivo_rechazo: motivo,
        fecha_revision: new Date(),
        revisado_por: idRevisor,
      },
      select: {
        id_solicitud: true,
        estado: true,
        motivo_rechazo: true,
        fecha_revision: true,
      },
    }));

    return res.json({
      success: true,
      message: 'Solicitud rechazada correctamente.',
      data: actualizada,
    });
  } catch (err) {
    next(err);
  }
}