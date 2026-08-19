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

function validatePrecio(value) {
  if (isEmpty(value)) {
    return 'El campo precio_venta es requerido';
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue) || numberValue < 0) {
    return 'El campo precio_venta debe ser numérico y mayor o igual a 0';
  }

  return null;
}

function validateEstado(value) {
  if (isEmpty(value)) return null;

  const estado = Number(value);

  if (!Number.isInteger(estado) || ![0, 1].includes(estado)) {
    return 'El campo Estado debe ser 0 o 1';
  }

  return null;
}

function validateCategoriaId(value) {
  if (isEmpty(value)) return null;

  const idCategoria = Number(value);

  if (!Number.isInteger(idCategoria) || idCategoria <= 0) {
    return 'El campo id_categoria debe ser un entero positivo';
  }

  return null;
}

function parseTimeToDate(value) {
  if (isEmpty(value)) {
    return { value: null };
  }

  if (typeof value !== 'string') {
    return {
      error: 'El campo Tiempo_preparacion debe ser texto con formato HH:MM:SS',
    };
  }

  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);

  if (!match) {
    return {
      error: 'El campo Tiempo_preparacion debe tener formato HH:MM:SS',
    };
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] || 0);

  return {
    value: new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds)),
  };
}

function pad(number) {
  return String(number).padStart(2, '0');
}

function formatTime(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    const match = value.match(/(\d{2}):(\d{2}):(\d{2})/);
    return match ? match[0] : value;
  }

  if (value instanceof Date) {
    return `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(
      value.getUTCSeconds(),
    )}`;
  }

  return '';
}

function formatProducto(producto) {
  return {
    id_producto: Number(producto.id_producto),
    Nombre: producto.Nombre ?? '',
    Descripcion: producto.Descripcion ?? '',
    precio_venta: producto.precio_venta?.toString() ?? '0.00',

    // Campo antiguo conservado por compatibilidad.
    Categoria: producto.Categoria ?? '',

    // Nueva relación normalizada.
    id_categoria: producto.id_categoria ?? null,
    categoria: producto.categoria
      ? {
          id_categoria: Number(producto.categoria.id_categoria),
          nombre: producto.categoria.nombre,
          descripcion: producto.categoria.descripcion ?? null,
        }
      : null,

    Tiempo_preparacion: formatTime(producto.Tiempo_preparacion),
    Estado: Number(producto.Estado ?? 1),
  };
}

async function categoriaExiste(idCategoria) {
  if (idCategoria === null || idCategoria === undefined) {
    return true;
  }

  const categoria = await prisma.categoria_productos.findUnique({
    where: { id_categoria: idCategoria },
    select: { id_categoria: true },
  });

  return Boolean(categoria);
}

async function validarProducto(body) {
  const timeResult = parseTimeToDate(body.Tiempo_preparacion);

  if (timeResult.error) {
    return { error: timeResult.error };
  }

  const validations = [
    validateString(body.Nombre, 'Nombre', 50, true),
    validateString(body.Descripcion, 'Descripcion', 500),
    validatePrecio(body.precio_venta),
    validateString(body.Categoria, 'Categoria', 30),
    validateCategoriaId(body.id_categoria),
    validateEstado(body.Estado),
  ];

  const error = validations.find(Boolean);

  if (error) {
    return { error };
  }

  const idCategoria = isEmpty(body.id_categoria)
    ? null
    : Number(body.id_categoria);

  if (!(await categoriaExiste(idCategoria))) {
    return { error: 'La categoría indicada no existe' };
  }

  return {
    data: {
      Nombre: body.Nombre,
      Descripcion: body.Descripcion || null,
      precio_venta: Number(body.precio_venta),

      // Campo antiguo conservado por compatibilidad.
      Categoria: body.Categoria || null,

      // Nueva clave foránea.
      id_categoria: idCategoria,

      Tiempo_preparacion: timeResult.value,
      Estado: isEmpty(body.Estado) ? 1 : Number(body.Estado),
    },
  };
}

async function listarProductos() {
  const productos = await prisma.producto.findMany({
    include: {
      categoria: {
        select: {
          id_categoria: true,
          nombre: true,
          descripcion: true,
        },
      },
    },
    orderBy: { id_producto: 'asc' },
  });

  return productos.map(formatProducto);
}

function obtenerPrimerResultSet(resultados) {
  if (!Array.isArray(resultados)) {
    return resultados;
  }

  if (Array.isArray(resultados[0])) {
    return resultados[0];
  }

  return resultados;
}

// GET /api/productos
export async function index(req, res, next) {
  try {
    const productos = await listarProductos();
    res.json(productos);
  } catch (err) {
    next(err);
  }
}

// GET /api/productos/vista
// Consulta la vista SQL real: vista_listado_productos.
export async function listarVista(req, res, next) {
  try {
    const productos = await prisma.$queryRaw`
      SELECT
        id_producto,
        Nombre,
        Descripcion,
        precio_venta,
        Categoria,
        Tiempo_preparacion,
        Estado
      FROM vista_listado_productos
      ORDER BY id_producto ASC
    `;

    res.json(productos.map(formatProducto));
  } catch (err) {
    next(err);
  }
}

// GET /api/productos/sp
// Ejecuta el procedimiento almacenado real: sp_listar_productos.
export async function listarProcedimiento(req, res, next) {
  try {
    const resultados = await prisma.$queryRaw`
      CALL sp_listar_productos()
    `;

    const productos = obtenerPrimerResultSet(resultados);

    res.json(productos.map(formatProducto));
  } catch (err) {
    next(err);
  }
}

// GET /api/productos/:id
export async function show(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del producto debe ser un número entero válido',
      });
    }

    const producto = await prisma.producto.findUnique({
      where: { id_producto: id },
      include: {
        categoria: {
          select: {
            id_categoria: true,
            nombre: true,
            descripcion: true,
          },
        },
      },
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(formatProducto(producto));
  } catch (err) {
    next(err);
  }
}

// POST /api/productos
export async function crear(req, res, next) {
  try {
    const { error, data } = await validarProducto(req.body);

    if (error) {
      return res.status(422).json({ message: error });
    }

    await prisma.producto.create({ data });

    res.status(201).json({ message: 'Producto creado' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/productos/:id
export async function actualizar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del producto debe ser un número entero válido',
      });
    }

    const { error, data } = await validarProducto(req.body);

    if (error) {
      return res.status(422).json({ message: error });
    }

    await prisma.producto.update({
      where: { id_producto: id },
      data,
    });

    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    next(err);
  }
}

// DELETE /api/productos/:id
// Igual que Laravel: no borra físicamente; alterna Estado 1/0.
export async function eliminar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del producto debe ser un número entero válido',
      });
    }

    const producto = await prisma.producto.findUnique({
      where: { id_producto: id },
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const nuevoEstado = producto.Estado ? 0 : 1;

    await prisma.producto.update({
      where: { id_producto: id },
      data: { Estado: nuevoEstado },
    });

    res.json({
      message: nuevoEstado ? 'Producto activado' : 'Producto desactivado',
    });
  } catch (err) {
    next(err);
  }
}