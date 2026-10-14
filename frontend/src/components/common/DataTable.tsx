// src/components/common/DataTable.tsx
import { ReactNode } from 'react'

export interface Column<T> {
  header: string
  accessor?: keyof T
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  title: string
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  actionButton?: ReactNode
}

export function DataTable<T extends { id?: string | number }>({
  title,
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No hay registros disponibles',
  actionButton,
}: DataTableProps<T>) {
  return (
    <section className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-['Syne'] text-lg font-bold text-[var(--texto)]">{title}</h3>
        {actionButton}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--borde)]">
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--texto-muted)]">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-[var(--texto-muted)]">
                  Cargando información...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-[var(--texto-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id ?? rowIdx} className="border-b border-[var(--borde)] hover:bg-[#faf6f2]">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3.5 text-sm text-[var(--texto)]">
                      {col.render ? col.render(row) : String(row[col.accessor as keyof T] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}