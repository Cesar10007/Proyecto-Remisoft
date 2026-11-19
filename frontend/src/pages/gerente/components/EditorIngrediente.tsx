import { useId, useState } from 'react'
import api from '../../../api/axios'
import { InputField } from '../../../components/common/InputField'
import { TextAreaField } from '../../../components/common/TextAreaField'
import { mensajeError } from '../../../utils/mensajeError'
import type { CrearIngrediente, IngredienteConStock } from '../types'
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
    unidad_medida: ingrediente?.unidad_medida ?? '', costo_unitario_ref: String(ingrediente?.costo_unitario_ref ?? ''),
    stock_minimo: String(ingrediente?.stock_minimo ?? 0),
  }))
  const [stock, setStock] = useState(String(ingrediente?.stock_actual ?? 0))
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ayudaStock = useId()
  const total = Number(stock)
  const cambiaStock = ingrediente !== null && stock !== '' && total !== ingrediente.stock_actual
  function campo(clave: keyof CrearIngrediente, valor: string) {
    setFicha(previa => ({ ...previa, [clave]: valor }))
  }

  async function guardar() {
    if (guardando) return
    if (!ficha.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (cambiaStock && motivo.trim().length < 5) { setError('Indica el motivo del ajuste (mínimo 5 caracteres).'); return }
    setGuardando(true); setError(null)
    try {
      let aviso: string | undefined
      if (ingrediente) {
        const { data } = await api.put<{ stock_actual?: number }>(`/ingredientes/${ingrediente.id_ingrediente}`, {
          ...ficha,
          ...(cambiaStock && { stock_actual: total, stock_esperado: ingrediente.stock_actual, motivo: motivo.trim() }),
        })
        // Un backend anterior ignoraba stock_actual y devolvía 200 solo por la ficha.
        if (cambiaStock && data?.stock_actual !== total) {
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
      <InputField label="Unidad de medida" placeholder="Ej: Kg, Litro, Unidad" maxLength={20}
        value={ficha.unidad_medida} onChange={e => campo('unidad_medida', e.target.value)} />
      <InputField label="Costo unitario de referencia" type="number" step="0.01" placeholder="0"
        value={ficha.costo_unitario_ref} onChange={e => campo('costo_unitario_ref', e.target.value)} />
      <InputField label="Stock mínimo" type="number" min="0" step="0.01" placeholder="0"
        value={ficha.stock_minimo} onChange={e => campo('stock_minimo', e.target.value)} />
      <div>
        <InputField label="Stock actual" type="number" inputMode="decimal" min="0" max="9999999.999" step="0.001" required
          aria-describedby={ayudaStock} value={stock} onChange={e => setStock(e.target.value)} />
        <p id={ayudaStock} className="mt-1 text-xs leading-relaxed text-[var(--texto-muted)]">
          {ingrediente ? <>Saldo al abrir: {ingrediente.stock_actual.toLocaleString('es-CO', { maximumFractionDigits: 3 })} {ingrediente.unidad_medida}.
            Escribe el total contado; solo la diferencia quedará en Movimientos.</> :
            'Si ya tienes existencias, indica la cantidad. Quedará una entrada «Stock inicial» en Movimientos. Si no tienes, deja 0.'}
        </p>
      </div>
      {cambiaStock && <InputField label="Motivo del ajuste" required minLength={5} maxLength={1000} placeholder="Ej.: conteo físico de bodega"
        value={motivo} onChange={e => setMotivo(e.target.value)} />}
    </FormularioCatalogo>
  )
}
