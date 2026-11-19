export type Sistema = { sistema_abierto: boolean; version_sistema: number }
export const EVENTO_SISTEMA = 'remisoft:sistema'
export function notificarEstado() { window.dispatchEvent(new Event(EVENTO_SISTEMA)) }
