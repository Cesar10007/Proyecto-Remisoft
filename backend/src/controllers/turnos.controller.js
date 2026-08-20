import prisma from '../config/prisma.js';

const turnoInclude = {
  caja: true,
  usuario: true,
};

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

export async function index(req, res, next) {
  try {
    const turnos = await prisma.turno_caja.findMany({
      include: turnoInclude,
      orderBy: {
        fecha_apertura: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: turnos,
      count: turnos.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function show(req, res, next) {
  try {
    const idTurno = parseId(req.params.id);

    if (idTurno === null) {
      return res.status(400).json({
        success: false,
        message: 'ID de turno inválido',
        code: 'INVALID_ID',
      });
    }

    const turno = await prisma.turno_caja.findUnique({
      where: {
        id_turno: idTurno,
      },
      include: turnoInclude,
    });

    if (!turno) {
      return res.status(404).json({
        success: false,
        message: 'No encontrado',
        code: 'NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: turno,
    });
  } catch (error) {
    next(error);
  }
}

export async function store(req, res, next) {
  try {
    const {
      id_caja,
      id_usuario_cajero,
      fecha_apertura,
      fecha_cierre,
      efectivo_inicial,
      efectivo_esperado,
      efectivo_real,
      diferencia,
      notas,
      estado,
    } = req.body;

    if (!id_caja) {
      return res.status(400).json({
        success: false,
        message: 'Caja requerida',
        code: 'MISSING_CAJA',
      });
    }

    if (!id_usuario_cajero) {
      return res.status(400).json({
        success: false,
        message: 'Usuario cajero requerido',
        code: 'MISSING_USER',
      });
    }

    const fechaApertura = fecha_apertura
      ? new Date(fecha_apertura)
      : new Date();

    if (Number.isNaN(fechaApertura.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de apertura inválida',
        code: 'INVALID_OPEN_DATE',
      });
    }

    const turno = await prisma.turno_caja.create({
      data: {
        id_caja: Number.parseInt(id_caja, 10),
        id_usuario_cajero: Number.parseInt(id_usuario_cajero, 10),
        fecha_apertura: fechaApertura,
        fecha_cierre: fecha_cierre ? new Date(fecha_cierre) : null,
        efectivo_inicial:
          efectivo_inicial !== undefined
            ? Number(efectivo_inicial)
            : 0,
        efectivo_esperado:
          efectivo_esperado !== undefined
            ? Number(efectivo_esperado)
            : null,
        efectivo_real:
          efectivo_real !== undefined
            ? Number(efectivo_real)
            : null,
        diferencia:
          diferencia !== undefined
            ? Number(diferencia)
            : null,
        notas: notas || null,
        estado: estado || 'ABIERTA',
      },
      include: turnoInclude,
    });

    res.status(201).json({
      success: true,
      message: 'Turno creado',
      data: turno,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const idTurno = parseId(req.params.id);

    if (idTurno === null) {
      return res.status(400).json({
        success: false,
        message: 'ID de turno inválido',
        code: 'INVALID_ID',
      });
    }

    const {
      id_caja,
      id_usuario_cajero,
      fecha_apertura,
      fecha_cierre,
      efectivo_inicial,
      efectivo_esperado,
      efectivo_real,
      diferencia,
      notas,
      estado,
    } = req.body;

    const data = {};

    if (id_caja !== undefined) {
      data.id_caja = Number.parseInt(id_caja, 10);
    }

    if (id_usuario_cajero !== undefined) {
      data.id_usuario_cajero = Number.parseInt(id_usuario_cajero, 10);
    }

    if (fecha_apertura !== undefined) {
      const fecha = new Date(fecha_apertura);

      if (Number.isNaN(fecha.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fecha de apertura inválida',
          code: 'INVALID_OPEN_DATE',
        });
      }

      data.fecha_apertura = fecha;
    }

    if (fecha_cierre !== undefined) {
      data.fecha_cierre = fecha_cierre
        ? new Date(fecha_cierre)
        : null;
    }

    if (efectivo_inicial !== undefined) {
      data.efectivo_inicial = Number(efectivo_inicial);
    }

    if (efectivo_esperado !== undefined) {
      data.efectivo_esperado =
        efectivo_esperado === null
          ? null
          : Number(efectivo_esperado);
    }

    if (efectivo_real !== undefined) {
      data.efectivo_real =
        efectivo_real === null
          ? null
          : Number(efectivo_real);
    }

    if (diferencia !== undefined) {
      data.diferencia =
        diferencia === null
          ? null
          : Number(diferencia);
    }

    if (notas !== undefined) {
      data.notas = notas || null;
    }

    if (estado !== undefined) {
      data.estado = estado;
    }

    const turno = await prisma.turno_caja.update({
      where: {
        id_turno: idTurno,
      },
      data,
      include: turnoInclude,
    });

    res.status(200).json({
      success: true,
      message: 'Actualizado',
      data: turno,
    });
  } catch (error) {
    next(error);
  }
}

export async function destroy(req, res, next) {
  try {
    const idTurno = parseId(req.params.id);

    if (idTurno === null) {
      return res.status(400).json({
        success: false,
        message: 'ID de turno inválido',
        code: 'INVALID_ID',
      });
    }

    await prisma.turno_caja.delete({
      where: {
        id_turno: idTurno,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Eliminado',
    });
  } catch (error) {
    next(error);
  }
}