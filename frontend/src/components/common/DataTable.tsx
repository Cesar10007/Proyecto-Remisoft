import Paginacion from './Paginacion'
import { usePaginaFilas } from '../../hook/usePaginaFilas'
import type { ReactNode } from 'react'

export interface Column<T> {
  header: string
  accessor?: keyof T
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  title?: string
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  actionButton?: ReactNode
  keyExtractor?: (row: T, index: number) => string | number
  className?: string
}

const rowKeyCandidates = ['id', 'id_usuario', 'id_ingrediente', 'id_proveedor', 'id_caja'] as const

function getDefaultRowKey(row: object, index: number): string | number {
  for (const candidateKey of rowKeyCandidates) {
    const candidate: unknown = Reflect.get(row, candidateKey)
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return candidate
    }
  }

  return index
}

export function DataTable<T extends object>({
  title,
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No hay registros disponibles',
  actionButton,
  keyExtractor,
  className = '',
}: DataTableProps<T>) {
  const pag = usePaginaFilas(data)
  return (
    <section className={`min-w-0 max-w-full rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-sm ${className}`}>
      {(title || actionButton) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && <h3 className="font-['Syne'] text-lg font-bold text-[var(--texto)]">{title}</h3>}
          {actionButton}
        </div>
      )}

      <div className="tabla-scroll">
        <table aria-label={title} className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--borde)]">
              {columns.map((col) => (
                <th key={String(col.accessor ?? col.header)} scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--texto-muted)]">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr className="table-status-row">
                <td colSpan={columns.length} className="py-8 text-center text-sm text-[var(--texto-muted)]">
                  Cargando información...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr className="table-status-row">
                <td colSpan={columns.length} className="py-8 text-center text-sm text-[var(--texto-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pag.filas.map((row, i) => {
                const rowIdx = pag.inicio + i
                const rowKey = keyExtractor ? keyExtractor(row, rowIdx) : getDefaultRowKey(row, rowIdx)
                return (
                  <tr key={rowKey} className="border-b border-[var(--borde)] hover:bg-[var(--fila-hover)]">
                    {columns.map((col) => (
                      <td key={String(col.accessor ?? col.header)} className="px-4 py-3.5 text-sm text-[var(--texto)]">
                        {col.render ? col.render(row) : col.accessor ? String(row[col.accessor] ?? '—') : '—'}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && <Paginacion {...pag} titulo={title} />}
    </section>
  )
}
