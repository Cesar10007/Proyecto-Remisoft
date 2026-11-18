import prisma from '../config/prisma.js';
import { validateString } from '../utils/validation.js';

export async function index(req, res, next) {
  try {
    const data = await prisma.iA.findMany({
      where: req.sede,
      orderBy: [{ Fecha_generacion: 'desc' }, { id_IA: 'desc' }],
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// Registrar un resultado ya generado; consultar el panel nunca genera predicciones.
export async function crear(req, res, next) {
  try {
    const { Tipo_prediccion, Resultado_generado, Recomendaciones_generales } = req.body;
    const error = validateString(Tipo_prediccion, 'Tipo_prediccion', 50, true)
      || validateString(Resultado_generado, 'Resultado_generado', 500, true)
      || validateString(Recomendaciones_generales, 'Recomendaciones_generales', 500);
    if (error) return res.status(422).json({ message: error });
    const data = await prisma.iA.create({ data: {
      ...req.sede, Tipo_prediccion: Tipo_prediccion.trim(), Resultado_generado: Resultado_generado.trim(),
      Recomendaciones_generales: Recomendaciones_generales?.trim() || null,
    } });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}
