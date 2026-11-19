import prisma from '../config/prisma.js';
import { conciliarConteo, crearAjusteManual } from '../services/inventario.service.js';
import { cantidadInventarioValida } from '../utils/validation.js';
import { auditarAjusteInventario } from '../utils/auditoria.js';
import { entero } from '../utils/salon.js';

export async function index(req, res, next) {
  try {
    const ingredientes = await prisma.ingrediente.findMany({ where: req.sede });
    res.json(ingredientes);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const { nombre, descripcion, unidad_medida, costo_unitario_ref, stock_minimo, stock_actual = 0 } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 50) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 50 caracteres)' });
    }
    if (descripcion && (typeof descripcion !== 'string' || descripcion.length > 500)) {
      return res.status(422).json({ message: 'El campo descripcion no puede superar 500 caracteres' });
    }
    if (unidad_medida && (typeof unidad_medida !== 'string' || unidad_medida.length > 20)) {
      return res.status(422).json({ message: 'El campo unidad_medida no puede superar 20 caracteres' });
    }
    if (costo_unitario_ref !== undefined && costo_unitario_ref !== null && !Number.isFinite(Number(costo_unitario_ref))) {
      return res.status(422).json({ message: 'El campo costo_unitario_ref debe ser numérico' });
    }
    if (stock_minimo !== undefined && stock_minimo !== null && !Number.isFinite(Number(stock_minimo))) {
      return res.status(422).json({ message: 'El campo stock_minimo debe ser numérico' });
    }

    if (!cantidadInventarioValida(stock_actual, { permitirCero: true })) {
      return res.status(422).json({ message: 'El stock actual debe estar entre 0 y 9999999.999, con hasta tres decimales.' });
    }

    // El saldo nace del primer movimiento, no de una segunda columna ni de otra petición.
    const inicial = Number(stock_actual);
    const { id_ingrediente, movimiento } = await prisma.$transaction(async tx => {
      const { id_ingrediente } = await tx.ingrediente.create({
        data: {
          ...req.sede, nombre, descripcion: descripcion ?? null, unidad_medida: unidad_medida ?? null,
          costo_unitario_ref: costo_unitario_ref == null || costo_unitario_ref === '' ? null : Number(costo_unitario_ref),
          stock_minimo: Number(stock_minimo ?? 0),
        },
        select: { id_ingrediente: true },
      });
      const movimiento = inicial > 0 ? await crearAjusteManual(tx, {
        ...req.sede, id_ingrediente, id_usuario: req.user.id_usuario,
      }, 'ENTRADA', inicial, 'Stock inicial') : null;
      return { id_ingrediente, movimiento };
    });
    if (movimiento) auditarAjusteInventario(req, movimiento, nombre);
    res.status(201).json({ message: 'Ingrediente creado', id_ingrediente, stock_actual: inicial });
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const id_ingrediente = entero(Number(req.params.id), 'El ingrediente');
    const { nombre, descripcion, unidad_medida, costo_unitario_ref, stock_minimo } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 50) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 50 caracteres)' });
    }
    if (descripcion && (typeof descripcion !== 'string' || descripcion.length > 500)) {
      return res.status(422).json({ message: 'El campo descripcion no puede superar 500 caracteres' });
    }
    if (unidad_medida && (typeof unidad_medida !== 'string' || unidad_medida.length > 20)) {
      return res.status(422).json({ message: 'El campo unidad_medida no puede superar 20 caracteres' });
    }
    if (costo_unitario_ref !== undefined && costo_unitario_ref !== null && !Number.isFinite(Number(costo_unitario_ref))) {
      return res.status(422).json({ message: 'El campo costo_unitario_ref debe ser numérico' });
    }
    if (stock_minimo !== undefined && stock_minimo !== null && !Number.isFinite(Number(stock_minimo))) {
      return res.status(422).json({ message: 'El campo stock_minimo debe ser numérico' });
    }

    const { stock_actual, stock_esperado, motivo } = req.body;
    const hayConteo = stock_actual !== undefined;
    if (hayConteo && (!cantidadInventarioValida(stock_actual, { permitirCero: true }) || !Number.isFinite(stock_esperado))) {
      return res.status(422).json({ message: 'Indica el stock actual entre 0 y 9999999.999 (hasta tres decimales) y el saldo que viste al abrir la ficha.' });
    }
    const razon = typeof motivo === 'string' ? motivo.trim() : '';
    if (hayConteo && Number(stock_actual) !== stock_esperado && (razon.length < 5 || razon.length > 1000)) {
      return res.status(422).json({ message: 'El motivo del ajuste debe tener entre 5 y 1000 caracteres.' });
    }

    const movimiento = await prisma.$transaction(async tx => {
      // Este UPDATE toma el mismo bloqueo de fila que pedidos y ajustes manuales.
      // Ante un conteo obsoleto también se revierte la edición de los demás campos.
      await tx.ingrediente.update({
        where: { id_ingrediente, ...req.sede },
        data: {
          nombre, descripcion: descripcion ?? null, unidad_medida: unidad_medida ?? null,
          costo_unitario_ref: costo_unitario_ref == null || costo_unitario_ref === '' ? null : Number(costo_unitario_ref),
          stock_minimo: Number(stock_minimo ?? 0),
        },
      });
      if (!hayConteo) return null;
      return conciliarConteo(tx, { ...req.sede, id_ingrediente, id_usuario: req.user.id_usuario }, stock_esperado, Number(stock_actual), razon);
    }, { isolationLevel: 'ReadCommitted' });
    if (movimiento) auditarAjusteInventario(req, movimiento, nombre);
    res.json({ message: 'Ingrediente actualizado', ...(hayConteo && { stock_actual: Number(stock_actual) }) });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.ingrediente.delete({ where: { id_ingrediente: Number(id), ...req.sede } });
    res.json({ message: 'Ingrediente eliminado' });
  } catch (err) {
    if (err.code === 'P2003' || err.code === 'P2014') {
      return res.status(409).json({
        message: 'No se puede eliminar: este ingrediente está en uso (inventario, recetas, órdenes de compra o lotes).',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
    next(err);
  }
}
