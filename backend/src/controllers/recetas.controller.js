import { escritura } from '../services/actividad.service.js';
import prisma from '../config/prisma.js';
import { leerIngredientesConBloqueo } from '../services/inventario.service.js';
import { verificarPresentacion, medidaTrabajo, cantidadVisible, cantidadBase } from '../utils/unidadesInventario.js';
import { entero, ErrorSalon } from '../utils/salon.js';

// El editor trabaja sobre la misma Receta que usa salón para descontar ingredientes.
// Los catálogos heredados pueden tener enlaces aún sin atribuir: no ocultarlos al
// editor y luego sobrescribirlos como si la receta hubiera estado vacía.
async function verificarEnlaces(tx, id_producto, id_restaurante) {
  const ajeno = await tx.receta.findFirst({
    where: { id_producto, Ingrediente: { OR: [{ id_restaurante: null }, { id_restaurante: { not: id_restaurante } }] } },
    select: { id_receta: true },
  });
  if (ajeno) throw new ErrorSalon(409, 'La receta contiene ingredientes sin asignar a esta sede. Revisa las referencias históricas.');
}

// Devuelve los ingredientes elegibles de la sede y lo que se consume por unidad (0 = no se usa).
export async function consultarReceta(req, res, next) {
  try {
    const id_producto = entero(Number(req.params.id), 'El producto');
    const data = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id_producto, ...req.sede }, select: { id_restaurante: true } });
      if (!producto) throw new ErrorSalon(404, 'Producto no encontrado.');
      if (!producto.id_restaurante) throw new ErrorSalon(409, 'El producto no tiene establecimiento asignado.');
      await verificarEnlaces(tx, id_producto, producto.id_restaurante);
      const ingredientes = await tx.ingrediente.findMany({
        where: { id_restaurante: producto.id_restaurante }, orderBy: [{ nombre: 'asc' }, { id_ingrediente: 'asc' }],
        select: { id_ingrediente: true, nombre: true, unidad_medida: true, unidad_presentacion: true, factor_unidad: true, cantidad_base: true,
          Receta: { where: { id_producto }, select: { Cantidad_necesaria: true } } },
      });
      return ingredientes.map(({ Receta, ...i }) => ({ id_ingrediente: i.id_ingrediente, nombre: i.nombre, unidad_medida: medidaTrabajo(i), factor_unidad: Number(i.factor_unidad), cantidad_base: Number(i.cantidad_base),
        cantidad: cantidadVisible(Receta.reduce((n, r) => n + Math.round(Number(r.Cantidad_necesaria) * 1000), 0) / 1000, i),
      }));
    }, { isolationLevel: 'RepeatableRead' });
    res.json({ data });
  } catch (err) { next(err); }
}

export async function guardarReceta(req, res, next) {
  try {
    const id_producto = entero(Number(req.params.id), 'El producto');
    const lineas = req.body?.ingredientes;
    if (!Array.isArray(lineas) || lineas.length > 1000) {
      throw new ErrorSalon(422, 'Envía una lista de hasta 1000 ingredientes.');
    }
    for (const linea of lineas) {
      entero(linea?.id_ingrediente, 'El ingrediente');
    }
    const ids = lineas.map(l => l.id_ingrediente);
    if (new Set(ids).size !== ids.length) throw new ErrorSalon(422, 'No repitas ingredientes en la receta.');
    const { id_restaurante } = req.sede;
    await escritura(req.user, async (tx) => {
      const [producto] = await tx.$queryRaw`SELECT id_producto FROM Producto WHERE id_producto = ${id_producto} AND id_restaurante = ${id_restaurante} FOR UPDATE`;
      if (!producto) throw new ErrorSalon(404, 'Producto no encontrado.');
      await verificarEnlaces(tx, id_producto, id_restaurante);
      const propios = await leerIngredientesConBloqueo(tx, ids, id_restaurante);
      if (propios.length !== ids.length) throw new ErrorSalon(422, 'Selecciona solo ingredientes de este establecimiento.');
      const porId = new Map(propios.map(i => [i.id_ingrediente, i]));
      const receta = lineas.map(l => {
        const i = porId.get(l.id_ingrediente);
        verificarPresentacion(i, l);
        return { id_producto, id_ingrediente: i.id_ingrediente, Cantidad_necesaria: cantidadBase(l.cantidad, i), Unidad: i.unidad_medida };
      });
      await tx.receta.deleteMany({ where: { id_producto } });
      if (receta.length) await tx.receta.createMany({ data: receta });
    });
    res.json({ message: 'Receta guardada.' });
  } catch (err) { next(err); }
}
