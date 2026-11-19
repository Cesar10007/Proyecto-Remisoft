import { useId, useState } from 'react'
import api from '../../../api/axios'
import { InputField } from '../../../components/common/InputField'
import { TextAreaField } from '../../../components/common/TextAreaField'
import { mensajeError } from '../../../utils/mensajeError'
import type { CrearIngrediente, IngredienteConStock } from '../types'
import { codigoUnidad, unidadDeCantidad } from '../../../utils/unidadesInventario'
import SelectorUnidadIngrediente from './SelectorUnidadIngrediente'
import FormularioCatalogo from './FormularioCatalogo'

interface Props {
  ingrediente: IngredienteConStock | null
  actualizar: () => Promise<void>
  cerrar: (aviso?: string) => void
}

export default function EditorIngrediente({ ingrediente, actualizar, cerrar }: Props) {
  // Guardar el saldo de la fila al abrir, no recalcularlo a partir del mínimo
  // ni reemplazarlo si se refresca la tabla mientras el gerente está contando.
  const [ficha, setFicha] = useState<CrearIngrediente>(() => ({
    nombre: ingrediente?.nombre ?? '', descripcion: ingrediente?.descripcion ?? '',
    unidad_medida: codigoUnidad(ingrediente?.unidad_medida), costo_unitario_ref: String(ingrediente?.costo_unitario_ref ?? ''),
    stock_minimo: String(ingrediente?.stock_minimo ?? 0),
  }))
  const [stock, setStock] = useState(String(ingrediente?.stock_actual ?? 0))
  const [cantidadBase, setCantidadBase] = useState('1')
  const [equivalente, setEquivalente] = useState('')
  const convertir = ingrediente !== null && (ingrediente.requiere_equivalencia ?? ingrediente.unidad_bloqueada) && ficha.unidad_medida !== codigoUnidad(ingrediente.unidad_medida)
  const unidadBase = codigoUnidad(ingrediente?.unidad_base === undefined ? ingrediente?.unidad_medida : ingrediente.unidad_base) || 'unidad histórica'
  const unidadCampos = convertir ? codigoUnidad(ingrediente.unidad_medida) : ficha.unidad_medida
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ayudaStock = useId()
  const sufijoStock = unidadCampos ? ` (${unidadDeCantidad(unidadCampos)})` : ''
  const total = Number(stock)
  const cambiaStock = ingrediente !== null && stock !== '' && total !== ingrediente.stock_actual
  function campo(clave: keyof CrearIngrediente, valor: string) {
    setFicha(previa => ({ ...previa, [clave]: valor }))
  }

  function seleccionarUnidad(v: string) {
    campo('unidad_medida', v)
    const metricas: Record<string, [string, string]> = { 'kg:g': ['1','1000'], 'g:kg': ['1000','1'], 'L:ml': ['1','1000'], 'ml:L': ['1000','1'] }
    const [historica, nueva] = metricas[`${unidadBase}:${v}`] ?? ['1', v === unidadBase ? '1' : '']
    setCantidadBase(historica); setEquivalente(nueva)
  }

  async function guardar() {
    if (guardando) return
    if (ingrediente && ficha.unidad_medida !== codigoUnidad(ingrediente.unidad_medida) && ingrediente.requiere_equivalencia === undefined && ingrediente.unidad_bloqueada !== false) {
      setError('Actualiza también la API antes de convertir un ingrediente con historial.'); return
    }
    if (!ficha.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (cambiaStock && motivo.trim().length < 5) { setError('Indica el motivo del ajuste (mínimo 5 caracteres).'); return }
    setGuardando(true); setError(null)
    try {
      let aviso: string | undefined
      if (ingrediente) {
        const { data } = await api.put<{ stock_actual?: number; conteo_confirmado?: number }>(`/ingredientes/${ingrediente.id_ingrediente}`, {
          ...ficha,
          // Enviar el valor original cuando solo se editan otros campos, incluso con una API anterior.
          unidad_medida: ficha.unidad_medida === codigoUnidad(ingrediente.unidad_medida) ? ingrediente.unidad_medida : ficha.unidad_medida,
          unidad_esperada: ingrediente.unidad_medida, factor_esperado: ingrediente.factor_unidad, base_esperada: ingrediente.cantidad_base,
          ...(convertir && { factor_unidad: Number(equivalente), cantidad_base: Number(cantidadBase) }),
          ...(cambiaStock && { stock_actual: total, stock_esperado: ingrediente.stock_actual, motivo: motivo.trim() }),
        })
        // Un backend anterior ignoraba stock_actual y devolvía 200 solo por la ficha.
        if (cambiaStock && (data?.conteo_confirmado ?? data?.stock_actual) !== total) {
          setError('La API no confirmó el stock. Actualiza también el backend y revisa la ficha antes de reintentar.')
          void actualizar()
          return
        }
      } else {
        const { data } = await api.post<{ stock_actual?: number }>('/ingredientes', { ...ficha, stock_actual: total })
        if (total > 0 && data?.stock_actual !== total) {
          // Una API anterior pudo crear la ficha sin el saldo. No ofrecer otro POST.
          aviso = `Se creó «${ficha.nombre}», pero la API no confirmó el stock inicial. Actualiza el backend y revisa el saldo en Editar; no vuelvas a crear el ingrediente.`
        }
      }
      cerrar(aviso)
      void actualizar()
    } catch (e) {
      setError(mensajeError(e))
      // Mantener el borrador. Al cancelar y reabrir se verá el saldo vigente.
      if (ingrediente) void actualizar()
    } finally { setGuardando(false) }
  }

  return (
    <FormularioCatalogo title={ingrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'} edit={ingrediente !== null}
      saving={guardando} error={error} submit={guardar} close={() => cerrar()}>
      <InputField label="Nombre" placeholder="Nombre *" required maxLength={50}
        value={ficha.nombre} onChange={e => campo('nombre', e.target.value)} />
      <TextAreaField label="Descripción" placeholder="Descripción" rows={2} maxLength={500}
        value={ficha.descripcion} onChange={e => campo('descripcion', e.target.value)} />
      <SelectorUnidadIngrediente ingrediente={ingrediente} valor={ficha.unidad_medida} cambiar={seleccionarUnidad} />
      {convertir && <fieldset className="grid gap-2 rounded-lg border border-[var(--borde)] p-3">
        <legend className="px-1 text-sm font-bold">Equivalencia para este ingrediente</legend>
        <InputField label={`Cantidad histórica (${unidadBase})`} value={cantidadBase} onChange={e => setCantidadBase(e.target.value)} type="number" min="0.000001" step="0.000001" max="1000000" required />
        <InputField label={`Equivale a (${ficha.unidad_medida})`} value={equivalente} onChange={e => setEquivalente(e.target.value)} type="number" min="0.000001" step="0.000001" max="1000000" required />
        <p className="text-xs">Por ejemplo: 1 kg equivale a 1000 g. Para empaques usa su contenido real. El costo, el mínimo y el conteo de abajo están en la unidad que abriste; se convertirán al guardar.</p>
        {Number(cantidadBase) > 0 && Number(equivalente) > 0 && <p className="text-sm font-semibold">Saldo tras el cambio: {((Number(stock) * (ingrediente.cantidad_base ?? 1) / (ingrediente.factor_unidad ?? 1)) * Number(equivalente) / Number(cantidadBase)).toLocaleString('es-CO', { maximumFractionDigits: 9 })} {unidadDeCantidad(ficha.unidad_medida)}</p>}
      </fieldset>}
      <InputField label={`Costo de referencia (COP${unidadCampos ? ` por ${unidadCampos}` : ''})`} type="number" step={ingrediente?.factor_unidad ? "any" : "0.01"} placeholder="0"
        value={ficha.costo_unitario_ref} onChange={e => campo('costo_unitario_ref', e.target.value)} />
      <InputField label={`Stock mínimo${sufijoStock}`} type="number" min="0" step={ingrediente?.factor_unidad ? "any" : "0.01"} placeholder="0"
        value={ficha.stock_minimo} onChange={e => campo('stock_minimo', e.target.value)} />
      <div>
        <InputField label={`Stock actual${sufijoStock}`} type="number" inputMode="decimal" min="0" max={ingrediente?.factor_unidad ? undefined : 9999999.999} step={ingrediente?.factor_unidad ? "any" : "0.001"} required
          aria-describedby={ayudaStock} value={stock} onChange={e => setStock(e.target.value)} />
        <p id={ayudaStock} className="mt-1 text-xs leading-relaxed text-[var(--texto-muted)]">
          {ingrediente ? <>Saldo al abrir: {ingrediente.stock_actual.toLocaleString('es-CO', { maximumFractionDigits: 3 })} {unidadDeCantidad(ingrediente.unidad_medida, ingrediente.stock_actual)}.
            Escribe el total contado; solo la diferencia quedará en Movimientos.</> :
            'Si ya tienes existencias, indica la cantidad. Quedará una entrada «Stock inicial» en Movimientos. Si no tienes, deja 0.'}
        </p>
      </div>
      {cambiaStock && <InputField label="Motivo del ajuste" required minLength={5} maxLength={1000} placeholder="Ej.: conteo físico de bodega"
        value={motivo} onChange={e => setMotivo(e.target.value)} />}
    </FormularioCatalogo>
  )
}
