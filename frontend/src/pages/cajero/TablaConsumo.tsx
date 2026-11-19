import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { usePaginaFilas } from '../../hook/usePaginaFilas'
import Paginacion from '../../components/common/Paginacion'

type Linea = { id_detalle?: number; nombre: string; cantidad: number; precio_unitario: number; subtotal?: number }
export default function TablaConsumo({ items, moneda, comprobante }: { items: Linea[]; moneda: (n: number) => string; comprobante?: boolean }) {
  const pag = usePaginaFilas(items), [imprimiendo, setImprimiendo] = useState(false)
  useEffect(() => {
    if (!comprobante) return
    const antes = () => flushSync(() => setImprimiendo(true)), despues = () => setImprimiendo(false)
    window.addEventListener('beforeprint', antes); window.addEventListener('afterprint', despues)
    return () => { window.removeEventListener('beforeprint', antes); window.removeEventListener('afterprint', despues) }
  }, [comprobante])
  return <><div className="tabla-scroll"><table className="cajero__tabla" aria-label="Detalle de productos">
    <thead><tr>{['Producto','Cant.','Precio','Subtotal'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
    <tbody>{(imprimiendo ? items : pag.filas).map((it, i) => <tr key={it.id_detalle ?? i}>
      <td>{it.nombre}</td><td>{it.cantidad}</td><td>{moneda(it.precio_unitario)}</td><td>{moneda(it.subtotal ?? it.cantidad * it.precio_unitario)}</td>
    </tr>)}</tbody>
  </table></div><Paginacion {...pag} titulo="productos" /></>
}
