// src/hook/useNotificaciones.ts
// Avisos de pedidos para la campanita del encabezado.
// No guarda nada en la base: se calculan desde GET /cocina/comandas, que ya existe.
// Por eso un aviso desaparece solo cuando la cocina entrega el plato.
import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

export type TipoAviso = 'preparar' | 'servir'

export interface Aviso {
  id: string
  tipo: TipoAviso
  titulo: string
  detalle: string
  fecha: string
}

interface ItemComanda {
  id_detalle: number
  nombre: string
  cantidad: number
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO'
}

interface Comanda {
  id_pedido: number
  mesa: number | null
  tipo_pedido: string
  fecha_hora: string
  items: ItemComanda[]
}

const INTERVALO_MS = 15000
const MAXIMO_VISTOS = 300

function claveVistos(idUsuario?: number | string | null) {
  return `remisoft-avisos-vistos-${idUsuario ?? 'anon'}`
}

function leerVistos(clave: string): string[] {
  try {
    const crudo = localStorage.getItem(clave)
    const lista = crudo ? JSON.parse(crudo) : []
    return Array.isArray(lista) ? lista.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function nombrePedido(comanda: Comanda) {
  return comanda.mesa ? `Mesa ${comanda.mesa}` : comanda.tipo_pedido || 'Pedido'
}

// "2× Hamburguesa BBQ" o "2× Hamburguesa BBQ +1 más"
function resumir(items: ItemComanda[]) {
  const primero = items[0]
  const resto = items.length - 1
  return `${primero.cantidad}× ${primero.nombre}${resto > 0 ? ` +${resto} más` : ''}`
}

function contarPlatos(items: ItemComanda[]) {
  return items.reduce((suma, item) => suma + item.cantidad, 0)
}

// Arma la lista de avisos agrupando por pedido.
// El id incluye la cantidad: si entra un plato nuevo al mismo pedido, vuelve a avisar.
function construirAvisos(comandas: Comanda[]): Aviso[] {
  const avisos: Aviso[] = []

  for (const comanda of comandas) {
    const porPreparar = comanda.items.filter((i) => i.estado === 'PENDIENTE' || i.estado === 'PREPARANDO')
    const listos = comanda.items.filter((i) => i.estado === 'LISTO')

    if (porPreparar.length > 0) {
      const platos = contarPlatos(porPreparar)
      avisos.push({
        id: `preparar-${comanda.id_pedido}-${platos}`,
        tipo: 'preparar',
        titulo: `${nombrePedido(comanda)} · Pedido #${comanda.id_pedido}`,
        detalle: resumir(porPreparar),
        fecha: comanda.fecha_hora,
      })
    }

    if (listos.length > 0) {
      const platos = contarPlatos(listos)
      avisos.push({
        id: `servir-${comanda.id_pedido}-${platos}`,
        tipo: 'servir',
        titulo: `${nombrePedido(comanda)} · Pedido #${comanda.id_pedido}`,
        detalle: resumir(listos),
        fecha: comanda.fecha_hora,
      })
    }
  }

  // Los más viejos primero: lo que lleva más tiempo esperando va arriba.
  return avisos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
}

export function useNotificaciones(activo: boolean, idUsuario?: number | string | null) {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [cargando, setCargando] = useState(activo)
  const [error, setError] = useState<string | null>(null)
  const [vistos, setVistos] = useState<string[]>(() => leerVistos(claveVistos(idUsuario)))

  const recargar = useCallback(async () => {
    try {
      const { data } = await api.get<Comanda[]>('/cocina/comandas')
      setComandas(Array.isArray(data) ? data : [])
      setError(null)
    } catch {
      setError('No se pudieron cargar los pedidos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (!activo) return
    recargar()
    const intervalo = setInterval(recargar, INTERVALO_MS)
    return () => clearInterval(intervalo)
  }, [activo, recargar])

  // Al cambiar de usuario se vuelve a leer lo visto de ese usuario.
  useEffect(() => {
    setVistos(leerVistos(claveVistos(idUsuario)))
  }, [idUsuario])

  const avisos = useMemo(() => construirAvisos(comandas), [comandas])

  const noLeidos = useMemo(() => {
    const conjunto = new Set(vistos)
    return avisos.filter((aviso) => !conjunto.has(aviso.id)).length
  }, [avisos, vistos])

  // Se llama al abrir el panel: todo lo que hay en ese momento queda como leído.
  const marcarTodoVisto = useCallback(() => {
    const clave = claveVistos(idUsuario)
    const combinados = Array.from(new Set([...leerVistos(clave), ...avisos.map((a) => a.id)])).slice(-MAXIMO_VISTOS)
    try {
      localStorage.setItem(clave, JSON.stringify(combinados))
    } catch {
      // Si el navegador bloquea localStorage, el contador igual funciona en memoria.
    }
    setVistos(combinados)
  }, [avisos, idUsuario])

  return { avisos, noLeidos, marcarTodoVisto, recargar, cargando, error }
}
