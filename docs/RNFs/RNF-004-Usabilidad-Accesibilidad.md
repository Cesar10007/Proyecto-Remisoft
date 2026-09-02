# RNF-004 — Usabilidad y Accesibilidad
**Tipo:** Requisito No Funcional de Usabilidad

## Requisitos Específicos
- **RNF-004.1** — La interfaz debe soportar dark mode y light mode con toggle visible.
- **RNF-004.2** — El contraste de color debe cumplir WCAG 2.1 AA (mínimo 4.5:1 para texto normal).
- **RNF-004.3** — Todos los formularios (pedidos, facturación, inventario) deben ser operables completamente con teclado.
- **RNF-004.4** — Los mensajes de error deben anunciarse con `role="alert"` para lectores de pantalla.
- **RNF-004.5** — El diseño debe ser responsive — funcionar correctamente en viewport de 320px a 1920px, dado que meseros y repartidores usarán tablets/celulares.

## Método de medición y trazabilidad
- **Medición:** auditoría manual con lector de pantalla + herramienta automatizada (ej. Lighthouse o axe) para contraste y `role="alert"`; prueba manual de navegación por teclado.
- **Trazabilidad:** resultados de auditoría de accesibilidad documentados por versión del frontend, con capturas o reporte de la herramienta usada.
