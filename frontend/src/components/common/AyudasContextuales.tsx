import { useEffect, useId } from 'react'
import { autoUpdate, computePosition, flip, hide, offset, shift, type VirtualElement } from '@floating-ui/dom'
import './AyudasContextuales.css'

function controlDe(origen: EventTarget | null) {
  if (!(origen instanceof Element)) return null
  // Al pasar por la etiqueta, explicar su campo, no el formulario que lo contiene.
  const control = origen.closest<HTMLElement>('label, [aria-description]')
  return control instanceof HTMLLabelElement ? control.control : control
}

/** Una ayuda para toda la aplicación. La descripción vive junto al control y está
 * disponible para lectores de pantalla incluso antes de mostrar la ventanita. */
export default function AyudasContextuales() {
  const id = useId()
  useEffect(() => {
    const globo = document.createElement('div')
    globo.id = id
    globo.className = 'ayuda-contextual'
    globo.setAttribute('role', 'tooltip')
    let actual: HTMLElement | null = null
    let foco: HTMLElement | null = null
    let bajoPuntero: HTMLElement | null = null
    let anclaFormulario: VirtualElement | undefined
    let dejarDeColocar: (() => void) | undefined
    let teclado = true, temporizador = 0
    const cambios = new MutationObserver(colocar)

    function ocultar() {
      window.clearTimeout(temporizador)
      cambios.disconnect()
      dejarDeColocar?.()
      dejarDeColocar = undefined
      // Quitar solo nuestro ID; el campo puede haber recibido una validación entretanto.
      if (actual?.getAttribute('aria-describedby') === id) actual.removeAttribute('aria-describedby')
      actual = null
      anclaFormulario = undefined
      globo.remove()
    }
    function colocar() {
      const control = actual, texto = control?.getAttribute('aria-description')
      if (!control?.getClientRects().length || !texto || control.getAttribute('aria-invalid') === 'true') {
        ocultar(); return
      }
      if (globo.textContent !== texto) globo.textContent = texto
      const dialogo = control.closest('dialog[open]')
      const limite = { boundary: dialogo ?? undefined, padding: 6 }
      if (dialogo) globo.style.setProperty('--ancho-capa', `${dialogo.clientWidth}px`)
      else globo.style.removeProperty('--ancho-capa')
      void computePosition(anclaFormulario ?? control, globo, {
        strategy: 'fixed', placement: 'top', middleware: [offset(6), flip(limite), shift(limite), hide()],
      }).then(({ x, y, middlewareData }) => {
        if (actual !== control) return
        Object.assign(globo.style, { left: `${x}px`, top: `${y}px`, visibility: middlewareData.hide?.referenceHidden ? 'hidden' : 'visible' })
      })
    }
    function mostrar(control: HTMLElement, puntero?: PointerEvent) {
      ocultar()
      if (!control.getClientRects().length || !control.hasAttribute('aria-description') || control.getAttribute('aria-invalid') === 'true') return
      actual = control
      // Un formulario largo puede sobrepasar la ventana. En sus espacios libres,
      // anclar al punto señalado, no a un borde que podría quedar fuera de vista.
      if (control instanceof HTMLFormElement && puntero) {
        const rect = control.getBoundingClientRect(), dx = puntero.clientX - rect.left, dy = puntero.clientY - rect.top
        anclaFormulario = { contextElement: control, getBoundingClientRect: () => {
          const { left, top } = control.getBoundingClientRect()
          return new DOMRect(left + dx, top + dy, 1, 1)
        } }
      }
      globo.style.visibility = 'hidden'
      // Un <dialog> modal está en una capa superior al body. Montar en su propia capa.
      const capa = control.closest('dialog[open]') ?? document.body
      capa.append(globo)
      // La instrucción o el error que ya describe un campo tiene prioridad.
      if (!control.getAttribute('aria-describedby')) control.setAttribute('aria-describedby', id)
      cambios.observe(control, { attributes: true, attributeFilter: ['aria-description', 'aria-invalid'] })
      dejarDeColocar = autoUpdate(control, globo, colocar)
    }
    function pasar(evento: PointerEvent) {
      if (evento.pointerType === 'touch' || evento.buttons) return
      const control = controlDe(evento.target)
      if (actual && actual !== control) {
        // Se puede pasar hasta la ayuda para leerla, pero nunca intercepta el
        // clic en otro control que quede debajo (tampoco sobre una tabla o modal).
        const r = globo.getBoundingClientRect()
        if (evento.clientX >= r.left && evento.clientX <= r.right && evento.clientY >= r.top && evento.clientY <= r.bottom) {
          window.clearTimeout(temporizador); bajoPuntero = actual; return
        }
      }
      if (control === bajoPuntero) return
      bajoPuntero = control
      window.clearTimeout(temporizador)
      if (control && control !== actual) {
        temporizador = window.setTimeout(() => mostrar(control, evento), 450)
      } else if (!control && actual !== foco) {
        temporizador = window.setTimeout(() => foco ? mostrar(foco) : ocultar(), 140)
      }
    }
    function enfocar(evento: FocusEvent) {
      foco = teclado ? controlDe(evento.target) : null
      if (foco) mostrar(foco); else ocultar()
    }
    function cerrar() { foco = null; bajoPuntero = null; ocultar() }
    function pulsar() { teclado = false; cerrar() }
    function tecla(evento: KeyboardEvent) {
      teclado = true
      if (evento.key === 'Escape' && actual && globo.style.visibility === 'visible') {
        // El primer Escape descarta la ayuda, no el diálogo que se está editando.
        evento.preventDefault(); evento.stopPropagation()
      }
      cerrar()
    }
    function salir(evento: PointerEvent) { if (!evento.relatedTarget) cerrar() }
    const eventos = new AbortController()
    const { signal } = eventos
    document.addEventListener('pointerover', pasar, { capture: true, signal })
    document.addEventListener('pointermove', pasar, { passive: true, signal })
    document.addEventListener('pointerout', salir, { capture: true, signal })
    document.addEventListener('pointerdown', pulsar, { capture: true, signal })
    document.addEventListener('focusin', enfocar, { signal })
    document.addEventListener('focusout', cerrar, { signal })
    document.addEventListener('click', cerrar, { capture: true, signal })
    document.addEventListener('keydown', tecla, { capture: true, signal })
    document.addEventListener('close', cerrar, { capture: true, signal })
    window.addEventListener('blur', cerrar, { signal })
    return () => { eventos.abort(); cerrar() }
  }, [id])
  return null
}
