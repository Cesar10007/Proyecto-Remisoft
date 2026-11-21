import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ChefHat, Plus, RefreshCw, X, Table2, ReceiptText, Wallet, FileText } from 'lucide-react'
import { useAuth } from '../../store/hooks'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import Mesas from './Mesas/Mesas'
import Pedidos from './Pedidos/Pedidos'
import EditorComanda from './Pedidos/EditorComanda'
import FichaMesa from './Mesas/FichaMesa'
import Caja from './Caja/Caja'
import Facturas from './Facturas/Facturas'
import { Buscador, Dialogo, ErrorCarga } from './Elementos'
import { useConsulta } from './useConsulta'
import { admitePedido, type Editor, type Salon } from './modelo'
import './Mesero.css'

const secciones = { mesas: 'Mesas', pedidos: 'Pedidos', caja: 'Caja', facturas: 'Facturas' } as const
type Vista = keyof typeof secciones
const navItems = [
  { icon: <Table2 size={20} />, label: 'Mesas' },
  { icon: <ReceiptText size={20} />, label: 'Pedidos' },
  { icon: <Wallet size={20} />, label: 'Caja' },
  { icon: <FileText size={20} />, label: 'Facturas' },
]
export default function Mesero() {
  const [params, setParams] = useSearchParams()
  const clave = params.get('vista') ?? 'mesas'
  const vista: Vista = Object.prototype.hasOwnProperty.call(secciones, clave) ? (clave as Vista) : 'mesas'
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nombre = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'Mesero'
  const { data, error: errorRed, cargando, hora, cargar } = useConsulta<Salon>('/salon', 8000)
  const salon = data?.mesas?.every((m) => Array.isArray(m.cuentas)) ? data : null
  const error =
    errorRed ||
    (data && !salon
      ? 'El backend no incluye los pedidos por mesa. Actualiza también el backend y vuelve a cargar el salón.'
      : '')
  const [buscar, setBuscar] = useState('')
  const [editor, setEditor] = useState<Editor | null>(null)
  const [seleccion, setSeleccion] = useState<{ mesa: number; pedido?: number } | null>(null)
  const [aviso, setAviso] = useState('')
  useEffect(() => {
    if (aviso) {
      const t = setTimeout(() => setAviso(''), 6500)
      return () => clearTimeout(t)
    }
  }, [aviso])
  function cambiar(v: Vista) {
    setAviso('')
    setParams(v === 'mesas' ? {} : { vista: v })
  }
  function abrirMesa(mesa: number, pedido?: number) {
    setAviso('')
    setSeleccion({ mesa, pedido })
    // Abre con la última lectura y comprueba enseguida si cambió el servicio.
    if (seleccion?.mesa !== mesa) void cargar()
  }
  function abrir(id: number) {
    const p = salon?.pedidos.find((p) => p.id_pedido === id)
    if (p) abrirMesa(p.mesa, id)
  }
  function venta() {
    setAviso('')
    setSeleccion(null)
    setEditor({ modo: 'nuevo', mesa: null })
  }
  const permiteVenta = Boolean(!error && salon?.mesas.some(admitePedido))
  const cuentas = salon?.pedidos.filter((p) => p.mesa === seleccion?.mesa) ?? []
  // Una cuenta histórica puede referenciar un número que ya no esté en el plano.
  const mesa =
    salon?.mesas.find((m) => m.numero === seleccion?.mesa) ??
    (cuentas.length
      ? {
          numero: cuentas[0].mesa,
          ocupada: true,
          capacidad: null,
          atencion: null,
          mesero: nombre,
          fecha_hora: cuentas[0].fecha_hora,
          comensales: cuentas[0].comensales,
          cuentas,
        }
      : null)
  return (
    <div className="sl-app wa-wrapper">
      <Sidebar
        subtitulo="Mesero"
        colapsable
        menuItems={[...navItems, { icon: <ChefHat size={20} />, label: 'Cocina' }]}
        vistaActual={vista}
        onNavigate={(v) => {
          if (v === 'cocina') { navigate('/cocina'); return }
          if (v in secciones) cambiar(v as Vista)
        }}
        onLogout={() => {
          logout()
          navigate('/', { replace: true })
        }}
        footer={
          <button aria-description="Abre la lista de pedidos del salón." className="wa-accion-rapida" onClick={() => cambiar('pedidos')}>
            <Plus size={17} /> Acción Rápida
          </button>
        }
      />
      <main className="sl-main">
        <div className="wa-encabezado">
          <Header
            seccionActiva={secciones[vista]}
            nombreUsuario={nombre}
            acciones={
              <>
                <button aria-description="Muestra el plano y la disponibilidad de las mesas." className="wa-enlace-cabecera" onClick={() => cambiar('mesas')}>
                  Plano del Piso
                </button>
                <button aria-description="Abre el resumen y las consultas de caja." className="wa-enlace-cabecera" onClick={() => cambiar('caja')}>
                  Pago Rápido
                </button>
                {vista === 'mesas' && (
                  <Buscador valor={buscar} cambiar={setBuscar} titulo="Buscar mesas o artículos..." />
                )}
                {vista === 'pedidos' && (
                  <button aria-description="Abre el formulario de una nueva comanda." className="sl-btn primary" onClick={venta} disabled={!permiteVenta}>
                    <Plus size={16} />
                    Nuevo pedido
                  </button>
                )}
              </>
            }
          />
        </div>
        <div className="sl-content">
          {error && (
            <ErrorCarga
              texto={`${error}${salon ? ' Se muestran los últimos datos recibidos.' : ''}`}
              reintentar={cargar}
            />
          )}
          {vista === 'facturas' ? (
            <Facturas
              pedidos={salon?.pedidos ?? null}
              tasa={salon?.tasa_iva ?? 0}
              errorSalon={error}
              cargarSalon={cargar}
            />
          ) : !salon ? (
            !error && (
              <div className="sl-empty sl-panel" role="status">
                Cargando salón…
              </div>
            )
          ) : vista === 'mesas' ? (
            <Mesas
              salon={salon}
              buscar={buscar}
              abrir={abrirMesa}
              venta={venta}
              permiteVenta={permiteVenta}
            />
          ) : vista === 'pedidos' ? (
            <Pedidos pedidos={salon.pedidos} abrir={abrir} />
          ) : (
            <>
              <Pedidos enCaja pedidos={salon.pedidos} abrir={abrir} />
              <Caja />
            </>
          )}
          {vista !== 'facturas' && salon && (
            <div className="sl-sync">
              <span>
                {salon.sede} <b>·</b>{' '}
                {hora &&
                  `Última lectura ${hora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })}`}
              </span>
              <button aria-description="Vuelve a consultar las mesas y los pedidos." onClick={cargar} disabled={cargando}>
                <RefreshCw size={13} /> Actualizar salón
              </button>
            </div>
          )}
        </div>
      </main>
      <div id="sl-dialog-layer" />
      {seleccion &&
        !editor &&
        salon &&
        (mesa ? (
          <FichaMesa
            key={mesa.numero}
            mesa={mesa}
            sede={salon.sede}
            pedidos={cuentas}
            pedidoId={seleccion.pedido}
            seleccionar={(id) => abrirMesa(mesa.numero, id)}
            facturar={(p) => {
              setSeleccion(null)
              setParams(
                p.id_factura != null
                  ? { vista: 'facturas', factura: String(p.id_factura) }
                  : { vista: 'facturas', generar: '1', pedido: String(p.id_pedido) },
              )
            }}
            editar={setEditor}
            cerrar={() => setSeleccion(null)}
            aviso={aviso}
            avisar={setAviso}
            errorLectura={error}
            actualizar={cargar}
          />
        ) : (
          <Dialogo titulo="Mesa no disponible" kicker="Salón" onClose={() => setSeleccion(null)}>
            <p className="sl-detail">La mesa ya no figura en el salón.</p>
          </Dialogo>
        ))}
      {editor && salon && (
        <EditorComanda
          editor={editor}
          salon={salon}
          cerrar={() => setEditor(null)}
          actualizar={cargar}
          guardado={(id, numero, msg) => {
            setEditor(null)
            setSeleccion({ mesa: numero, pedido: id })
            setAviso(msg)
          }}
        />
      )}
      {aviso && !seleccion && !editor && (
        <div className="sl-toast" role="status">
          <CheckCircle2 size={18} /> {aviso}
          <button aria-description="Retira este aviso de la pantalla." aria-label="Ocultar aviso" onClick={() => setAviso('')}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
