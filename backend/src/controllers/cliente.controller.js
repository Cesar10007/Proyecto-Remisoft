import prisma from '../config/prisma.js';

function parseId(id) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

function validateString(value, field, max, required = false) {
  if (required && isEmpty(value)) {
    return `El campo ${field} es requerido`;
  }

  if (!isEmpty(value) && typeof value !== 'string') {
    return `El campo ${field} debe ser texto`;
  }

  if (!isEmpty(value) && value.length > max) {
    return `El campo ${field} no puede superar ${max} caracteres`;
  }

  return null;
}

function validateEmail(value, required = false) {
  if (required && isEmpty(value)) {
    return 'El campo Email es requerido';
  }

  if (isEmpty(value)) {
    return null;
  }

  if (typeof value !== 'string') {
    return 'El campo Email debe ser texto';
  }

  if (value.length > 60) {
    return 'El campo Email no puede superar 60 caracteres';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return 'El campo Email debe ser un correo válido';
  }

  return null;
}

function validarCliente(body) {
  const validations = [
    validateString(body.Nombre, 'Nombre', 50, true),
    validateString(body.Apellido, 'Apellido', 50),
    validateEmail(body.Email, true),
    validateString(body.Telefono, 'Telefono', 20),
    validateString(body.Direccion, 'Direccion', 120),
    validateString(body.coordenadas_gps, 'coordenadas_gps', 80),
    validateString(body.tipo_documento, 'tipo_documento', 30),
    validateString(body.Num_documento, 'Num_documento', 30),
  ];

  const error = validations.find(Boolean);

  if (error) {
    return { error };
  }

  return {
    data: {
      Nombre: body.Nombre,
      Apellido: body.Apellido || null,
      Email: body.Email,
      Telefono: body.Telefono || null,
      Direccion: body.Direccion || null,
      coordenadas_gps: body.coordenadas_gps || null,
      tipo_documento: body.tipo_documento || null,
      Num_documento: body.Num_documento || null,
    },
  };
}

// GET /api/clientes
export async function index(req, res, next) {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        id_cliente: 'asc',
      },
    });

    res.json(clientes);
  } catch (err) {
    next(err);
  }
}

// GET /api/clientes/buscar?telefono=...
export async function buscarPorTelefono(req, res, next) {
  try {
    const { telefono } = req.query;

    if (typeof telefono !== 'string' || telefono.trim() === '') {
      return res.status(422).json({
        message: 'El parámetro telefono es requerido',
      });
    }

    const clientes = await prisma.cliente.findMany({
      where: {
        Telefono: telefono.trim(),
      },
      orderBy: {
        id_cliente: 'asc',
      },
    });

    res.json(clientes);
  } catch (err) {
    next(err);
  }
}

// GET /api/clientes/:id
export async function show(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del cliente debe ser un número entero válido',
      });
    }

    const cliente = await prisma.cliente.findUnique({
      where: {
        id_cliente: id,
      },
    });

    if (!cliente) {
      return res.status(404).json({
        message: 'Cliente no encontrado',
      });
    }

    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

// POST /api/clientes
export async function crear(req, res, next) {
  try {
    const { error, data } = validarCliente(req.body);

    if (error) {
      return res.status(422).json({
        message: error,
      });
    }

    await prisma.cliente.create({
      data,
    });

    res.status(201).json({
      message: 'Cliente creado',
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'El email del cliente ya está registrado',
      });
    }

    next(err);
  }
}

// PUT /api/clientes/:id
export async function actualizar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del cliente debe ser un número entero válido',
      });
    }

    const { error, data } = validarCliente(req.body);

    if (error) {
      return res.status(422).json({
        message: error,
      });
    }

    await prisma.cliente.update({
      where: {
        id_cliente: id,
      },
      data,
    });

    res.json({
      message: 'Cliente actualizado',
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'El email del cliente ya está registrado',
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Cliente no encontrado',
      });
    }

    next(err);
  }
}

// DELETE /api/clientes/:id
export async function eliminar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del cliente debe ser un número entero válido',
      });
    }

    await prisma.cliente.delete({
      where: {
        id_cliente: id,
      },
    });

    res.json({
      message: 'Cliente eliminado',
    });
  } catch (err) {
    if (err.code === 'P2003' || err.code === 'P2014') {
      return res.status(409).json({
        message: 'No se puede eliminar: este cliente tiene pedidos asociados.',
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Cliente no encontrado',
      });
    }

    next(err);
  }
}