import { escritura } from '../services/actividad.service.js';
import prisma from '../config/prisma.js';
import { conciliarConteo, crearAjusteManual, leerIngredientesConBloqueo } from '../services/inventario.service.js';
import { cantidadInventarioValida } from '../utils/validation.js';
import { auditarAjusteInventario } from '../utils/auditoria.js';
import { referenciasDeUnidad, unidadEnUso, unidadParaAlta, cambioDeUnidad, verificarPresentacion, cantidadVisible, cantidadBase } from '../utils/unidadesInventario.js';
import { entero, ErrorSalon } from '../utils/salon.js';

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
    const unidad = unidadParaAlta(unidad_medida);
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
    const { id_ingrediente, movimiento } = await escritura(req.user, async tx => {
      const { id_ingrediente } = await tx.ingrediente.create({
        data: {
          ...req.sede, nombre, descripcion: descripcion ?? null, unidad_medida: unidad,
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
    const { nombre, descripcion, costo_unitario_ref, stock_minimo } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 50) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 50 caracteres)' });
    }
    if (descripcion && (typeof descripcion !== 'string' || descripcion.length > 500)) {
      return res.status(422).json({ message: 'El campo descripcion no puede superar 500 caracteres' });
    }
    if (costo_unitario_ref !== undefined && costo_unitario_ref !== null && !Number.isFinite(Number(costo_unitario_ref))) {
      return res.status(422).json({ message: 'El campo costo_unitario_ref debe ser numérico' });
    }
    if (stock_minimo !== undefined && stock_minimo !== null && !Number.isFinite(Number(stock_minimo))) {
      return res.status(422).json({ message: 'El campo stock_minimo debe ser numérico' });
    }

    const { stock_actual, stock_esperado, motivo } = req.body;
    const hayConteo = stock_actual !== undefined;
    if (hayConteo && !Number.isFinite(stock_esperado)) {
      return res.status(422).json({ message: 'Indica el stock actual entre 0 y 9999999.999 (hasta tres decimales) y el saldo que viste al abrir la ficha.' });
    }
    const razon = typeof motivo === 'string' ? motivo.trim() : '';
    if (hayConteo && Number(stock_actual) !== stock_esperado && (razon.length < 5 || razon.length > 1000)) {
      return res.status(422).json({ message: 'El motivo del ajuste debe tener entre 5 y 1000 caracteres.' });
    }

    const resultado = await escritura(req.user, async tx => {
      // Serializar la elección de unidad con la primera receta, movimiento o conteo.
      const where = { id_ingrediente, ...req.sede };
      const [previo] = await leerIngredientesConBloqueo(tx, [id_ingrediente], req.sede.id_restaurante);
      if (!previo) throw new ErrorSalon(404, 'Ingrediente no encontrado');
      verificarPresentacion(previo, req.body);
      const anterior = await tx.ingrediente.findUniqueOrThrow({ where, include: { _count: referenciasDeUnidad } });
      const unidades = cambioDeUnidad(previo, unidadEnUso(anterior._count), req.body);
      await tx.ingrediente.update({ where, data: {
        nombre, descripcion: descripcion ?? null, ...unidades,
        ...(costo_unitario_ref !== undefined && { costo_unitario_ref: costo_unitario_ref == null || costo_unitario_ref === '' ? null :
          cantidadBase(costo_unitario_ref, previo, { cero: true, escala: 2, costo: true }) }),
        ...(stock_minimo !== undefined && { stock_minimo: cantidadBase(stock_minimo || 0, previo, { cero: true, escala: 2 }) }),
      } });
      if (!hayConteo) return {};
      const esperado = Math.sign(stock_esperado) * cantidadBase(Math.abs(stock_esperado), previo, { cero: true });
      const contado = cantidadBase(stock_actual, previo, { cero: true });
      const movimiento = await conciliarConteo(tx, { ...req.sede, id_ingrediente, id_usuario: req.user.id_usuario }, esperado, contado, razon);
      return { movimiento, stock_actual: cantidadVisible(contado, { ...previo, ...unidades }) };
    }, { isolationLevel: 'ReadCommitted' });
    if (resultado.movimiento) auditarAjusteInventario(req, resultado.movimiento, nombre);
    res.json({ message: 'Ingrediente actualizado', ...(hayConteo && { stock_actual: resultado.stock_actual, conteo_confirmado: Number(stock_actual) }) });
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
    await escritura(req.user, tx => tx.ingrediente.delete({ where: { id_ingrediente: Number(id), ...req.sede } }));
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
