import { cantidadConUnidad } from '../../utils/unidadesInventario'
import { useConsulta } from '../../hook/useConsulta'
import type { Caja, IngredienteConStock, MesaGerente, Personal, Producto, Proveedor } from './types'

export const formatoCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 })

// Formas de respuesta de GET /api/facturas y GET /api/inventario (solo los campos que usamos).
interface PagoApi { id_factura?: number; id_turno?: number | null; metodo: string | null; monto: string | number | null; estado: string | null; fecha_pago: string | null }
interface FacturaApi { estado: string; pedido?: { Mesa_num: number | null } | null; pago?: PagoApi[] }
export interface TurnoApi {
  id_turno: number
  id_caja: number
  id_usuario_cajero: number
  fecha_apertura: string | null
  fecha_cierre: string | null
  efectivo_inicial: string | number | null
  efectivo_esperado: string | number | null
  efectivo_real: string | number | null
  diferencia: string | number | null
  estado: string | null
  caja?: { nombre: string | null } | null
  usuario?: { nombre: string | null; apellido: string | null } | null
}
export const etiquetaMetodo = (metodo: string | null) => {
  const etiquetas: Record<string, string> = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia', TARJETA_CREDITO: 'Tarjeta crédito', TARJETA_DEBITO: 'Tarjeta débito', PSE: 'PSE' }
  return metodo ? (etiquetas[metodo] ?? metodo) : 'Sin método'
}

const haceTiempo = (fecha: string | null) => {
  if (!fecha) return '—'
  const minutos = Math.max(0, Math.round((Date.now() - new Date(fecha).getTime()) / 60000))
  if (minutos < 60) return `Hace ${minutos} min`
  if (minutos < 1440) return `Hace ${Math.round(minutos / 60)} h`
  return `Hace ${Math.round(minutos / 1440)} d`
}

// Fecha YYYY-MM-DD del día de Bogotá, desplazada N días.
function fechaBogota(desplazamientoDias = 0): string {
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
  const fecha = new Date(`${hoy}T00:00:00Z`)
  fecha.setUTCDate(fecha.getUTCDate() + desplazamientoDias)
  return fecha.toISOString().slice(0, 10)
}

interface PedidoEnCurso {
  id_pedido: number
  Mesa_num: number | null
  Tipo_pedido: string
  estado: string
  Fecha_hora: string
  nombre_mesero: string | null
}

export interface Lectura { data: unknown; error: string; cargar: () => Promise<void> }
type Lista<T> = { data: T[] }

export function useDatosGerente(seccion: string, fuente: 'sp' | 'vista') {
  const menu = seccion === 'Menú', finanzas = seccion === 'Finanzas'
  const turnos = seccion === 'Turnos', pedidos = seccion === 'Pedidos', mesas = seccion === 'Mesas'
  const hasta = fechaBogota()
  const hoy = useConsulta<{ data: VentasDia }>(menu ? '/reportes/ventas-diarias' : null, 15000)
  const semana = useConsulta<ListaVentas>(menu ? `/reportes/ventas-diarias?desde=${fechaBogota(-6)}&hasta=${hasta}` : null, 15000)
  const activos = useConsulta<{ data: { pedidos_activos: number } }>(menu ? '/reportes/pedidos-activos' : null, 15000)
  const compras = useConsulta<{ data: { gastos_mes: number } }>(finanzas ? '/reportes/gastos-del-mes' : null, 15000)
  const facturas = useConsulta<Lista<FacturaApi>>(menu || finanzas ? '/facturas' : null, 15000)
  const inventario = useConsulta<Lista<IngredienteConStock>>(menu || seccion === 'Inventario' ? '/inventario' : null, 15000)
  const plano = useConsulta<Lista<MesaGerente>>(menu || mesas ? '/mesas' : null, 15000)
  const catalogo = useConsulta<Producto[]>(menu ? `/productos/${fuente}` : null, 15000)
  const ordenes = useConsulta<PedidoEnCurso[]>(pedidos ? '/pedidos' : null, 15000)
  const jornadas = useConsulta<Lista<TurnoApi>>(turnos ? '/turnos' : null, 15000)
  const cajas = useConsulta<Caja[]>(turnos || seccion === 'Flujo de Caja' ? '/cajas' : null, 15000)
  const usuarios = useConsulta<Personal[]>(turnos || seccion === 'Personal' ? '/usuarios' : null, 15000)
  const proveedores = useConsulta<Proveedor[]>(seccion === 'Proveedores' ? '/proveedores' : null, 15000)

  const consultas: Record<string, Lectura[]> = {
    Finanzas: [compras, facturas], Turnos: [jornadas, cajas, usuarios],
    Inventario: [inventario], Proveedores: [proveedores], 'Flujo de Caja': [cajas], Personal: [usuarios],
    Mesas: [plano], Pedidos: [ordenes],
  }
  const lecturas = consultas[seccion] ?? []
  const dias = new Map(semana.data?.data.dias.map(d => [d.fecha, Number(d.ingresos_netos)]))
  const maximo = Math.max(...dias.values(), 1)
  const tendenciaSemanal = dias.size === 0 ? [] : Array.from({ length: 7 }, (_, i) => {
    const fecha = fechaBogota(i - 6)
    return {
      dia: new Date(`${fecha}T12:00:00Z`).toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' }).slice(0, 3).toUpperCase(),
      alto: Math.round(((dias.get(fecha) ?? 0) / maximo) * 100),
    }
  })
  const pagosAprobados = (facturas.data?.data ?? [])
    .filter(f => f.estado === 'PAGADA' || f.estado === 'EMITIDA')
    .flatMap(f => (f.pago ?? []).map(p => ({ ...p, mesa: f.pedido?.Mesa_num })))
    .filter(p => p.estado === 'APROBADO' && p.monto != null && p.fecha_pago)
    .sort((a, b) => new Date(b.fecha_pago ?? 0).getTime() - new Date(a.fecha_pago ?? 0).getTime())
  // El mes de negocio, al igual que el reporte diario, es el de Bogotá.
  const fechaLocal = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' })
  const ingresosDelMes = facturas.data && !facturas.error ? pagosAprobados
    .filter(p => p.fecha_pago && fechaLocal.format(new Date(p.fecha_pago)).slice(0, 7) === hasta.slice(0, 7))
    .reduce((n, p) => n + Math.round(Number(p.monto) * 100), 0) / 100 : null
  return {
    hoy, semana, activos, compras, facturas, inventario, plano, catalogo, ordenes, jornadas, cajas, usuarios, proveedores,
    aviso: lecturas.find(l => l.error) ?? lecturas.find(l => l.data === null),
    ingresosHoy: hoy.data && !hoy.error ? hoy.data.data.total.ingresos_netos : null,
    ingresosDelMes, pagosAprobados, tendenciaSemanal,
    mesas: plano.data?.data ?? [],
    movimientosRecientes: pagosAprobados.slice(0, 4).map(p => ({
      icon: 'shopping_cart', titulo: p.mesa ? `Mesa ${String(p.mesa).padStart(2, '0')} - Pago recibido` : 'Pago recibido',
      sub: `${haceTiempo(p.fecha_pago)} • ${etiquetaMetodo(p.metodo)}`, monto: `+${formatoCOP.format(Number(p.monto))}`, positivo: true,
    })),
    estadoInventario: (inventario.data?.data ?? []).map(i => {
      const minimo = Number(i.stock_minimo), actual = Number(i.stock_actual)
      return { id: i.id_ingrediente, nombre: i.nombre, porcentaje: minimo > 0 ? Math.min(100, Math.max(0, Math.round(actual / minimo * 100))) : 0,
        color: i.stock_bajo ? 'rojo' : 'verde', etiqueta: cantidadConUnidad(actual, i.unidad_medida) }
    }),
  }
}

type ListaVentas = { data: { dias: { fecha: string; ingresos_netos: number }[] } }

export interface VentasDia {
  desde: string; hasta: string
  total: { total_pedidos: number; ingresos_netos: number; total_propinas: number }
  productos_top: { id_producto: number; producto: string; unidades: number; ingresos: number }[]
}
