import { useConsulta } from '../../hook/useConsulta'
import type { Caja, Ingrediente, Personal, Producto, Proveedor } from './types'

export const formatoCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

// Formas de respuesta de GET /api/facturas y GET /api/inventario (solo los campos que usamos).
interface PagoApi { id_factura?: number; id_turno?: number | null; metodo: string | null; monto: string | number | null; estado: string | null; fecha_pago: string | null }
interface FacturaApi { pedido?: { Mesa_num: number | null } | null; pago?: PagoApi[] }
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
interface PedidoApi {
  id_pedido: number
  Mesa_num: number | null
  Tipo_pedido: string | null
  Fecha_hora: string | null
  nombre_mesero: string | null
}
interface EventoHistorial { fecha: string | null; usuario: string; accion: string }
interface InventarioApi { id_ingrediente: number; nombre: string; unidad_medida: string | null; stock_minimo: string | number | null; stock_actual: number | string | null; stock_bajo: boolean }

export const etiquetaMetodo = (metodo: string | null) => {
  const etiquetas: Record<string, string> = { EFECTIVO: 'Efectivo', TARJETA_CREDITO: 'Tarjeta crédito', TARJETA_DEBITO: 'Tarjeta débito', PSE: 'PSE' }
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

function crearHistorial(pedidos: PedidoApi[], turnosLista: TurnoApi[], facturasLista: FacturaApi[]) {
  const cajeroDeTurno = new Map<number, string>(turnosLista.map(t => [
    t.id_turno,
    `${t.usuario?.nombre ?? ''} ${t.usuario?.apellido ?? ''}`.trim() || '—',
  ]))
  const eventos: EventoHistorial[] = [
    ...pedidos.map(p => ({
      fecha: p.Fecha_hora,
      usuario: p.nombre_mesero ?? '—',
      accion: `Creó el pedido #${p.id_pedido} · ${p.Mesa_num ? `Mesa ${p.Mesa_num}` : (p.Tipo_pedido ?? 'Sin mesa')}`,
    })),
    ...turnosLista.flatMap(t => {
      const caja = t.caja?.nombre ?? `caja ${t.id_caja}`
      const cajero = cajeroDeTurno.get(t.id_turno) ?? '—'
      const movimientos: EventoHistorial[] = [{ fecha: t.fecha_apertura, usuario: cajero, accion: `Abrió turno en ${caja}` }]
      if (t.fecha_cierre) movimientos.push({ fecha: t.fecha_cierre, usuario: cajero, accion: `Cerró turno en ${caja}` })
      return movimientos
    }),
    ...facturasLista.flatMap(f => (f.pago ?? []).map(p => ({
      fecha: p.fecha_pago,
      usuario: p.id_turno != null ? (cajeroDeTurno.get(p.id_turno) ?? '—') : '—',
      accion: `Registró pago de ${formatoCOP.format(Number(p.monto ?? 0))} (${etiquetaMetodo(p.metodo)}) · factura #${p.id_factura ?? '—'}`,
    }))),
  ]
  return eventos.sort((a, b) => new Date(b.fecha ?? 0).getTime() - new Date(a.fecha ?? 0).getTime()).slice(0, 50)
}

export interface Lectura { data: unknown; error: string; cargar: () => Promise<void> }
type Lista<T> = { data: T[] }

export function useDatosGerente(seccion: string, fuente: 'sp' | 'vista') {
  const menu = seccion === 'Menú', finanzas = seccion === 'Finanzas', historial = seccion === 'Historial'
  const turnos = seccion === 'Turnos', pedidos = seccion === 'Pedidos', mesas = seccion === 'Mesas'
  const hasta = fechaBogota()
  const semana = useConsulta<ListaVentas>(menu ? `/reportes/ventas-diarias?desde=${fechaBogota(-6)}&hasta=${hasta}` : null)
  const activos = useConsulta<{ data: { pedidos_activos: number } }>(menu ? '/reportes/pedidos-activos' : null)
  const compras = useConsulta<{ data: { gastos_mes: number } }>(finanzas ? '/reportes/gastos-del-mes' : null)
  const facturas = useConsulta<Lista<FacturaApi>>(menu || finanzas || historial ? '/facturas' : null)
  const inventario = useConsulta<Lista<InventarioApi>>(menu ? '/inventario' : null)
  const plano = useConsulta<Lista<{ numero: number; ocupada: boolean }>>(menu || mesas ? '/mesas' : null, 15000)
  const catalogo = useConsulta<Producto[]>(menu ? `/productos/${fuente}` : null)
  const ordenes = useConsulta<PedidoEnCurso[]>(pedidos || historial ? '/pedidos' : null)
  const jornadas = useConsulta<Lista<TurnoApi>>(turnos || historial ? '/turnos' : null)
  const cajas = useConsulta<Caja[]>(turnos || seccion === 'Flujo de Caja' ? '/cajas' : null)
  const usuarios = useConsulta<Personal[]>(turnos || seccion === 'Personal' ? '/usuarios' : null)
  const ingredientes = useConsulta<Ingrediente[]>(seccion === 'Inventario' ? '/ingredientes' : null)
  const proveedores = useConsulta<Proveedor[]>(seccion === 'Proveedores' ? '/proveedores' : null)

  const consultas: Record<string, Lectura[]> = {
    Finanzas: [compras, facturas], Historial: [ordenes, jornadas, facturas], Turnos: [jornadas, cajas, usuarios],
    Inventario: [ingredientes], Proveedores: [proveedores], 'Flujo de Caja': [cajas], Personal: [usuarios],
    Mesas: [plano], Pedidos: [ordenes],
  }
  const lecturas = consultas[seccion] ?? []
  const dias = new Map(semana.data?.data.dias.map(d => [d.fecha, Number(d.ingresos_brutos)]))
  const maximo = Math.max(...dias.values(), 1)
  const tendenciaSemanal = dias.size === 0 ? [] : Array.from({ length: 7 }, (_, i) => {
    const fecha = fechaBogota(i - 6)
    return {
      dia: new Date(`${fecha}T12:00:00Z`).toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' }).slice(0, 3).toUpperCase(),
      alto: Math.round(((dias.get(fecha) ?? 0) / maximo) * 100),
    }
  })
  const pagosAprobados = (facturas.data?.data ?? [])
    .flatMap(f => (f.pago ?? []).map(p => ({ ...p, mesa: f.pedido?.Mesa_num })))
    .filter(p => p.estado === 'APROBADO')
    .sort((a, b) => new Date(b.fecha_pago ?? 0).getTime() - new Date(a.fecha_pago ?? 0).getTime())
  // El mes de negocio, al igual que el reporte diario, es el de Bogotá.
  const fechaLocal = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' })
  const ingresosDelMes = facturas.data && !facturas.error ? pagosAprobados
    .filter(p => p.fecha_pago && fechaLocal.format(new Date(p.fecha_pago)).slice(0, 7) === hasta.slice(0, 7))
    .reduce((n, p) => n + Number(p.monto), 0) : null
  return {
    semana, activos, compras, facturas, inventario, plano, catalogo, ordenes, jornadas, cajas, usuarios, ingredientes, proveedores,
    aviso: lecturas.find(l => l.error) ?? lecturas.find(l => l.data === null),
    ingresosHoy: semana.data && !semana.error ? dias.get(hasta) ?? 0 : null,
    ingresosDelMes, pagosAprobados, tendenciaSemanal,
    historial: historial ? crearHistorial(ordenes.data ?? [], jornadas.data?.data ?? [], facturas.data?.data ?? []) : [],
    mesas: (plano.data?.data ?? []).map(m => ({ id: `T-${String(m.numero).padStart(2, '0')}`, ocupada: m.ocupada })),
    movimientosRecientes: pagosAprobados.slice(0, 4).map(p => ({
      icon: 'shopping_cart', titulo: p.mesa ? `Mesa ${String(p.mesa).padStart(2, '0')} - Pago recibido` : 'Pago recibido',
      sub: `${haceTiempo(p.fecha_pago)} • ${etiquetaMetodo(p.metodo)}`, monto: `+${formatoCOP.format(Number(p.monto))}`, positivo: true,
    })),
    estadoInventario: (inventario.data?.data ?? []).map(i => {
      const minimo = Number(i.stock_minimo), actual = Number(i.stock_actual)
      return { id: i.id_ingrediente, nombre: i.nombre, porcentaje: minimo > 0 ? Math.min(100, Math.max(0, Math.round(actual / minimo * 100))) : 0,
        color: i.stock_bajo ? 'rojo' : 'verde', etiqueta: `${actual} ${i.unidad_medida ?? ''}`.trim() }
    }),
  }
}

type ListaVentas = { data: { dias: { fecha: string; ingresos_brutos: number }[] } }
