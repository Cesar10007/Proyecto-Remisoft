import Button from './Button'

type Props = { pagina: number; paginas: number; cambiar: (pagina: number) => void; titulo?: string }
export default function Paginacion({ pagina, paginas, cambiar, titulo }: Props) {
  if (paginas < 2) return null
  return <nav aria-label={`Paginación${titulo ? ` de ${titulo}` : ''}`} className="tabla-paginacion mt-3 flex flex-wrap items-center justify-end gap-2">
    <Button variant="outline" size="small" disabled={pagina <= 1} onClick={() => cambiar(pagina - 1)}>Anterior</Button>
    <span className="text-sm" aria-live="polite">Página {pagina} de {paginas}</span>
    <Button variant="outline" size="small" disabled={pagina >= paginas} onClick={() => cambiar(pagina + 1)}>Siguiente</Button>
  </nav>
}
