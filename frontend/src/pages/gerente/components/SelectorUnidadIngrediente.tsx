import { useId } from 'react'
import { SelectField } from '../../../components/common/SelectField'
import { codigoUnidad, esEmpaque, gruposUnidades, unidadConocida } from '../../../utils/unidadesInventario'
import type { IngredienteConStock } from '../types'

interface Props {
  ingrediente: IngredienteConStock | null
  valor: string
  cambiar: (valor: string) => void
}

export default function SelectorUnidadIngrediente({ ingrediente, valor, cambiar }: Props) {
  const ayudaId = useId()
  const anterior = codigoUnidad(ingrediente?.unidad_medida)
  const base = ingrediente?.unidad_base
  const sinUnidadAnterior = ingrediente !== null && !anterior
  let ayuda = 'Usa la misma unidad en el stock y en las recetas.'
  if (ingrediente?.requiere_equivalencia ?? ingrediente?.unidad_bloqueada) {
    ayuda = 'Puedes cambiar la unidad de trabajo. Los movimientos anteriores conservan su unidad histórica.'
  } else if (ingrediente && valor !== anterior) {
    ayuda = 'Revisa el costo y el stock mínimo en la nueva unidad. La ficha aún no tiene movimientos ni recetas.'
  } else if (esEmpaque(valor)) {
    ayuda = 'Cuenta empaques del mismo tamaño. Si compras por empaque pero consumes piezas sueltas, elige «Pieza».'
  }

  return <div>
    <SelectField label="Unidad de medida" name="unidad_medida" value={valor}
      required={!sinUnidadAnterior} aria-describedby={ayudaId} onChange={e => cambiar(e.target.value)}>
      <option value="" disabled={!sinUnidadAnterior}>{sinUnidadAnterior ? 'Sin unidad (registro anterior)' : 'Selecciona una unidad'}</option>
      {anterior && !unidadConocida(anterior) && <option value={anterior}>{anterior} (unidad anterior)</option>}
      {base && base !== anterior && !unidadConocida(base) && <option value={base}>{base} (unidad histórica)</option>}
      {gruposUnidades.map(({ nombre, opciones }) => <optgroup key={nombre} label={nombre}>
        {opciones.map(u => <option key={u.codigo} value={u.codigo}>{esEmpaque(u.codigo) ? u.nombre : `${u.nombre} (${u.codigo})`}</option>)}
      </optgroup>)}
    </SelectField>
    <p id={ayudaId} className="mt-1 text-xs leading-relaxed text-[var(--texto-muted)]">{ayuda}</p>
  </div>
}
