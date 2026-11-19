import { useConsulta } from '../../../hook/useConsulta'

type Analisis = {
  id_IA: number
  Tipo_prediccion: string | null
  Resultado_generado: string | null
  Recomendaciones_generales: string | null
}

export default function IASection() {
  const { data, error, cargar } = useConsulta<{ data: Analisis[] }>('/ia')
  return (
    <section className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-[var(--sombra)]">
      <h3 className="mb-4 font-['Syne'] text-lg font-bold">Análisis del establecimiento</h3>
      {error ? <p role="alert">No se pudieron cargar los análisis. <button aria-description="Vuelve a consultar los análisis de la sede." onClick={cargar}>Reintentar</button></p>
        : !data ? <p>Cargando análisis…</p>
        : data.data.length === 0 ? <p>No hay análisis de IA registrados para este establecimiento.</p>
        : <ul className="grid gap-4 md:grid-cols-2">
          {data.data.map(a => (
            <li key={a.id_IA} className="rounded-xl border border-[var(--borde)] p-4">
              <h4 className="font-['Syne'] text-[0.95rem] font-bold text-[var(--texto)]">{a.Tipo_prediccion || 'Análisis'}</h4>
              {a.Resultado_generado && <p>{a.Resultado_generado}</p>}
              {a.Recomendaciones_generales && <p className="mt-2 text-[var(--texto-muted)]">{a.Recomendaciones_generales}</p>}
            </li>
          ))}
        </ul>}
    </section>
  )
}
