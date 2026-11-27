# Actas y gestión de tareas — RemiSoft

> Cubre el criterio **13**: registro de revisiones y retroalimentación, más la asignación de
> responsables y el tablero. Esta carpeta guarda las actas; el estado operativo del tablero vive en
> GitHub Projects y se documenta aquí para que quede en el repositorio.

## Actas

| Acta | Fecha | Tipo | Archivo |
|---|---|---|---|
| 01 | 19 nov 2026 | Revisión de código (PRs de cierre) | [acta-01-revision-de-codigo.md](acta-01-revision-de-codigo.md) |
| 02 | 25 nov 2026 | Retrospectiva del sprint S7 | [acta-02-retrospectiva-s7.md](acta-02-retrospectiva-s7.md) |

## Equipo y responsabilidad

| Persona | Rol | Usuario de GitHub | Alcance de revisión |
|---|---|---|---|
| César David Rueda Daza | Líder / Full Stack | `Cesar10007` | Backend, esquema, CI, integración |
| Juan Felipe Bello Pérez | Frontend / IA | `jfbellop` | UI, componentes, flujos de pantalla |
| Kevin Duvan Bueno Melo | Tester / QA | `alucard592` | Pruebas, criterios de aceptación, documentación de QA |

**Regla de asignación:** ningún issue queda sin responsable. Si un issue toca backend y frontend se
asigna a quien hace la mayor parte del trabajo y se menciona al otro en la descripción. Los issues
cerrados se asignaron de forma retrospectiva a partir del autor de los commits y de los PR que los
resolvieron.

## Tablero (GitHub Projects)

Proyecto: **RemiSoft — Tablero de entrega** (tipo *Board*), con estas cuatro columnas y regla de paso:

| Columna | Qué contiene | Regla para entrar |
|---|---|---|
| **Backlog** | Issues abiertos sin trabajo empezado | Issue creado, con criterio de aceptación y milestone |
| **En curso** | Trabajo activo | Rama `feat/*`, `fix/*` o `docs/*` creada desde `develop` |
| **En revisión** | Pull Request abierto contra `develop` | PR con la plantilla completa y CI en verde |
| **Hecho** | Fusionado en `develop` y verificado | PR fusionado; el issue se cierra con el número de PR |

Los 29 issues del repositorio están en el tablero. Como todos están cerrados y verificados, el estado
real hoy es **Hecho = 29, resto = 0**: el tablero queda como registro histórico del proceso, no como
lista de trabajo pendiente.

## Milestones (= sprints)

Cada milestone usa el calendario de [los sprints](../scrum/02-sprints.md) y agrupa los issues por la
fecha en que se cerraron.

| Milestone | Fechas | Issues cerrados en la ventana |
|---|---|---|
| S0 — Inicio, alcance y arquitectura | 12 mar – 31 may 2026 | 0 |
| S1 — Acceso, usuarios y roles | 1 jun – 28 jun 2026 | 0 |
| S2 — Salón: pedidos por mesa y comandas | 29 jun – 26 jul 2026 | 0 |
| S3 — Facturación, pagos y caja | 27 jul – 23 ago 2026 | 19 |
| S4 — Inventario y stock | 24 ago – 20 sep 2026 | 1 |
| S5 — Domicilios y menú | 21 sep – 18 oct 2026 | 2 |
| S6 — Reportes, multi-sede y roles finos | 19 oct – 15 nov 2026 | 0 |
| S7 — IA y exportación (cierre) | 16 nov – 25 nov 2026 | 7 |
| **Total** | | **29** |

Las milestones S0, S1, S2 y S6 quedan sin issues porque en esas fechas el trabajo se siguió en ramas y
PRs sin abrir issue: el repositorio no empezó a usar issues como unidad de trabajo hasta el 14 de
agosto de 2026 (issues #125 a #131). Es un dato del proceso, y decirlo es más útil que rellenarlas con
asignaciones inventadas.

## Asignación: antes y después

Al revisar el repositorio, **19 de los 29 issues tenían responsable** y **10 no**. Los 10 restantes se
asignaron retrospectivamente el 25 de noviembre de 2026:

| Issue | Título | Responsable asignado | Criterio |
|---|---|---|---|
| #125 | [HU] Historias de usuario | `Cesar10007` | Documentación de requisitos, autoría del líder |
| #126 | Documentos de elaboración | `Cesar10007` | Documentación |
| #127 | QA y revisión de documentación de requisitos | `alucard592` | Rol Tester/QA |
| #128 | Definición de roles y estructura inicial | `Cesar10007` | Decisión de arquitectura y equipo |
| #129 | Migración | `Cesar10007` | Migración Laravel → Express + Prisma |
| #130 | Middlewares y conexión a base de datos | `Cesar10007` | Backend |
| #131 | Reorganización del proyecto | `Cesar10007` | Estructura del repositorio |
| #244 | Seguridad de acceso y autenticación | `Cesar10007` | Backend (JWT, `requireRole`, bcrypt) |
| #245 | RF-002: Módulo de pedidos | `jfbellop` | Mayor volumen de trabajo en pantallas de pedidos |
| #248 | Drift de esquema: `id_restaurante` en 7 tablas | `Cesar10007` | Autor de la rama `fix/esquema-id-restaurante-faltante` |

Con esto, la cobertura de asignación queda en **29 de 29 (100 %)** y cada issue tiene milestone.
