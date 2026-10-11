// Modo oscuro: la preferencia se guarda en el navegador y se mantiene en cada recarga
// hasta que el usuario la desactiva. Se aplica como data-theme="dark" en <html>.
export type Tema = 'light' | 'dark'

export const CLAVE_TEMA = 'remisoft-tema'
const EVENTO_TEMA = 'remisoft-tema-cambio'

export function temaGuardado(): Tema {
  return localStorage.getItem(CLAVE_TEMA) === 'dark' ? 'dark' : 'light'
}

export function aplicarTema(tema: Tema) {
  if (tema === 'dark') document.documentElement.dataset.theme = 'dark'
  else delete document.documentElement.dataset.theme
}

export function cambiarTema(tema: Tema) {
  localStorage.setItem(CLAVE_TEMA, tema)
  aplicarTema(tema)
  window.dispatchEvent(new CustomEvent<Tema>(EVENTO_TEMA, { detail: tema }))
}

export function escucharTema(callback: (tema: Tema) => void) {
  const handler = (e: Event) => callback((e as CustomEvent<Tema>).detail)
  window.addEventListener(EVENTO_TEMA, handler)
  return () => window.removeEventListener(EVENTO_TEMA, handler)
}
