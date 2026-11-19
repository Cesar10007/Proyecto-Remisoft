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
  const sinUnidadAnterior = ingrediente !== null && !anterior
  // Ante una API anterior, que no conoce las referencias, no ofrecer un cambio inseguro.
  const bloqueada = ingrediente !== null && ingrediente.unidad_bloqueada !== false
  let ayuda = 'Usa la misma unidad en el stock y en las recetas. Se fija al primer uso.'
  if (bloqueada) {
    ayuda = ingrediente.unidad_bloqueada
      ? 'La unidad ya está en uso. Para usar otra sin alterar los registros anteriores, crea un ingrediente nuevo.'
      : 'Actualiza la API para comprobar si se puede cambiar esta unidad.'
  } else if (ingrediente && valor !== anterior) {
    ayuda = 'Revisa el costo y el stock mínimo en la nueva unidad. Los valores no se convierten.'
  } else if (esEmpaque(valor)) {
    ayuda = 'Cuenta empaques del mismo tamaño. Si compras por empaque pero consumes piezas sueltas, elige «Pieza».'
  }

  return <div>
    <SelectField label="Unidad de medida" name="unidad_medida" value={valor} disabled={bloqueada}
      required={!sinUnidadAnterior} aria-describedby={ayudaId} onChange={e => cambiar(e.target.value)}>
      <option value="" disabled={!sinUnidadAnterior}>{sinUnidadAnterior ? 'Sin unidad (registro anterior)' : 'Selecciona una unidad'}</option>
      {anterior && !unidadConocida(anterior) && <option value={anterior}>{anterior} (unidad anterior)</option>}
      {gruposUnidades.map(({ nombre, opciones }) => <optgroup key={nombre} label={nombre}>
        {opciones.map(u => <option key={u.codigo} value={u.codigo}>{esEmpaque(u.codigo) ? u.nombre : `${u.nombre} (${u.codigo})`}</option>)}
      </optgroup>)}
    </SelectField>
    <p id={ayudaId} className="mt-1 text-xs leading-relaxed text-[var(--texto-muted)]">{ayuda}</p>
  </div>
}
