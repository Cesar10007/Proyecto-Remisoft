import prisma from '../config/db.js';

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

function validateEmail(value) {
  if (isEmpty(value)) return null;

  if (typeof value !== 'string') {
    return 'El campo email debe ser texto';
  }

  if (value.length > 100) {
    return 'El campo email no puede superar 100 caracteres';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return 'El campo email debe ser un correo válido';
  }

  return null;
}

function validarProveedor(body) {
  const validations = [
    validateString(body.nombre, 'nombre', 100, true),
    validateString(body.nombre_contacto, 'nombre_contacto', 100),
    validateString(body.telefono, 'telefono', 20),
    validateEmail(body.email),
    validateString(body.direccion, 'direccion', 200),
    validateString(body.nit, 'nit', 30),
    validateString(body.tipo_proveedor, 'tipo_proveedor', 50),
    validateString(body.estado, 'estado', 20),
  ];

  const error = validations.find(Boolean);

  if (error) {
    return { error };
  }

  return {
    data: {
      nombre: body.nombre,
      nombre_contacto: body.nombre_contacto || null,
      telefono: body.telefono || null,
      email: body.email || null,
      direccion: body.direccion || null,
      nit: body.nit || null,
      tipo_proveedor: body.tipo_proveedor || null,
      estado: body.estado || 'ACTIVO',
    },
  };
}

// GET /api/proveedores
export async function index(req, res, next) {
  try {
    const proveedores = await prisma.proveedor.findMany({
      orderBy: { id_proveedor: 'asc' },
    });

    res.json(proveedores);
  } catch (err) {
    next(err);
  }
}

// GET /api/proveedores/:id
export async function show(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del proveedor debe ser un número entero válido',
      });
    }

    const proveedor = await prisma.proveedor.findUnique({
      where: { id_proveedor: id },
    });

    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.json(proveedor);
  } catch (err) {
    next(err);
  }
}

// POST /api/proveedores
export async function store(req, res, next) {
  try {
    const { error, data } = validarProveedor(req.body);

    if (error) {
      return res.status(422).json({ message: error });
    }

    await prisma.proveedor.create({ data });

    res.status(201).json({ message: 'Proveedor creado' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/proveedores/:id
export async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del proveedor debe ser un número entero válido',
      });
    }

    const { error, data } = validarProveedor(req.body);

    if (error) {
      return res.status(422).json({ message: error });
    }

    await prisma.proveedor.update({
      where: { id_proveedor: id },
      data,
    });

    res.json({ message: 'Proveedor actualizado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Proveedor no encontrado para actualizar',
      });
    }

    next(err);
  }
}

// DELETE /api/proveedores/:id
//
// No se elimina físicamente.
// Se alterna el estado ACTIVO/INACTIVO porque el frontend actual usa esta ruta
// como botón de activar/desactivar.
export async function destroy(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del proveedor debe ser un número entero válido',
      });
    }

    const proveedor = await prisma.proveedor.findUnique({
      where: { id_proveedor: id },
    });

    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    const nuevoEstado = proveedor.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    await prisma.proveedor.update({
      where: { id_proveedor: id },
      data: { estado: nuevoEstado },
    });

    res.json({
      message: nuevoEstado === 'ACTIVO' ? 'Proveedor activado' : 'Proveedor desactivado',
    });
  } catch (err) {
    next(err);
  }
}