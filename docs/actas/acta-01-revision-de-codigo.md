# Acta 01 — Revisión de código

| Campo | Detalle |
|---|---|
| **Fecha** | 19 de noviembre de 2026 |
| **Duración** | 2 h (16:00 – 18:00) |
| **Modalidad** | Revisión asíncrona en GitHub + sesión de cierre en videollamada |
| **Participantes** | César David Rueda Daza (`Cesar10007`), Juan Felipe Bello Pérez (`jfbellop`), Kevin Duvan Bueno Melo (`alucard592`) |
| **Alcance** | Pull Requests de la última semana de desarrollo, antes del cierre del sprint S7 |
| **Insumos** | `docs/04-reporte-ejecucion-pruebas.md`, salida de CI, `pnpm run lint`, `pnpm run test` |

## 1. Pull Requests revisados

| PR | Tema | Autor | Revisor | Resultado |
|---|---|---|---|---|
| #248 | Drift de esquema: `id_restaurante` faltante en 7 tablas (`P2022` rompía pedidos, domicilios, proveedores, cajas y turnos) | `Cesar10007` | `alucard592` | Aprobado con cambios aplicados |
| #271 – #277 | JSX duplicado en el panel de Gerente, uno por módulo | `jfbellop` | `Cesar10007` | Aprobado; se unificó en un componente |
| #282 | Módulo de cocina: flujo `PENDIENTE → PREPARANDO → LISTO → ENTREGADO` | `Cesar10007` | `jfbellop` | Aprobado |
| #246 | Columna `estado` faltante en `detalle_pedido` | `Cesar10007` | `alucard592` | Aprobado |
| #249 | Control de acceso por rol en los routers de cocina | `Cesar10007` | `alucard592` | Aprobado |
| #228 / #229 | `factura.routes.js` existía pero no se montaba en `app.js` | `jfbellop` | `Cesar10007` | Aprobado; se montó y se probó el endpoint |

## 2. Observaciones y decisiones

1. **Routers huérfanos.** Se detectaron 18 routers en `backend/src/routes` que no se montan en
   `app.js` (~100 endpoints muertos). **Decisión:** no borrarlos en la semana de cierre; se registra
   como deuda en `docs/reflexion-backends.md` (M5) y se mueven a `src/legacy/` en la siguiente
   iteración. Borrar código sin ventana de pruebas a tres días de la entrega es peor que documentarlo.
2. **Validación en el borde.** Se acordó que toda ruta nueva valide en el controlador con
   `utils/validation.js` antes de tocar Prisma, y que el filtro de sede se aplique en `index`, `show`
   y `update` (ya se cumplía en los routers montados).
3. **Mensajes de error.** `errorHandler` no debe devolver `error.message` de Prisma en producción. Se
   verificó que hoy devuelve genéricos y que los códigos `P2002`, `P2003` y `P2025` están mapeados.
4. **Nomenclatura de ramas.** Se confirma `feat/*`, `fix/*`, `docs/*` y `check/*` desde `develop`, y
   que ningún commit va directo a `develop`: la regla del repositorio rechaza el push (error `GH013`)
   y obliga a Pull Request con dos checks en verde.
5. **Duplicación de estilos.** Los PR #271-#277 repetían el mismo bloque de JSX en el panel de
   Gerente. **Decisión:** un componente por tarjeta, con las props mínimas, y sin tocar el diseño
   aprobado (se comparó contra `consistencia-visual.spec.ts`, 17 comprobaciones).

## 3. Acciones acordadas

| # | Acción | Responsable | Fecha compromiso | Estado |
|---|---|---|---|---|
| 1 | Cerrar el drift de `id_restaurante` y añadir la migración que lo corrige | `Cesar10007` | 25 nov 2026 | Hecho |
| 2 | Montar `factura.routes.js` y cubrirlo con una prueba de integración | `jfbellop` | 25 nov 2026 | Hecho |
| 3 | Documentar la deuda de los 18 routers sin montar | `Cesar10007` | 25 nov 2026 | Hecho (`docs/reflexion-backends.md`, M5) |
| 4 | Revisar que ningún issue quede sin responsable ni milestone | `alucard592` | 25 nov 2026 | Hecho (`docs/actas/README.md`) |
| 5 | Mover los routers sin montar a `src/legacy/` | `Cesar10007` | Sprint siguiente | Pendiente |

## 4. Retroalimentación recibida

- **Del revisor de QA:** "las pruebas de integración existen pero no corrían en CI porque nadie
  levantaba MariaDB en el pipeline". Consecuencia: se añadió el servicio de MariaDB al workflow y la
  variable `ESTABLECIMIENTO_DB_TEST=1`. Antes del cambio corrían 28 casos unitarios; después, 61.
- **Del revisor de frontend:** "el panel de Gerente tiene cuatro copias del mismo bloque". Consecuencia:
  unificación en un componente y eliminación de ~180 líneas duplicadas.
- **Del líder al revisor de QA:** "los defectos se están contando en el informe pero no se clasifican
  por severidad". Consecuencia: `docs/04-reporte-ejecucion-pruebas.md` clasifica 27 defectos por
  severidad, sprint y origen.

## 5. Cierre

Se aprueban los PR de la lista. Queda una acción abierta (mover los routers a `src/legacy/`), que pasa
al backlog con milestone del sprint siguiente. Sin bloqueos para el cierre del proyecto.

**Firmas:** `Cesar10007` · `jfbellop` · `alucard592`
