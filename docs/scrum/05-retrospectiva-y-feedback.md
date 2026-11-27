# Retrospectivas y feedback consolidado — RemiSoft

**Formato usado:** Start / Stop / Continue (qué empezamos a hacer, qué dejamos de hacer, qué seguimos
haciendo), cerrando con **acciones con responsable y fecha**, que entran al sprint siguiente.
**Duración:** 30 minutos después del Sprint Review. **Participantes:** CD (líder), JB (frontend), KB (QA).

---

## Retrospectiva S1 — Acceso, usuarios y roles (28 jun)

**Continue**
- Preguntar antes de implementar: la validación de contraseñas se acordó con el QA y evitó retrabajo.
- Usar `$transaction` desde el primer endpoint que toca dos tablas.

**Start**
- Probar cada endpoint con los seis roles antes de cerrar el PR.
- Documentar las variables de entorno nuevas en el mismo PR.

**Stop**
- Subir cambios directamente a `develop`: se rompió CI dos veces en la primera semana.

**Acciones**

| Acción | Responsable | Fecha |
|---|---|---|
| Activar la plantilla de PR como obligatoria en las revisiones | CD | 5 jul |
| Crear `.env.example` y referenciarlo desde el README | JB | 5 jul |

---

## Retrospectiva S2 — Salón y comandas (26 jul)

**Continue**
- Demo con datos reales al final del sprint (mesa, plato, pedido completo).
- Revisar en pareja las transiciones de estado del pedido.

**Start**
- Escribir el criterio de aceptación del flujo "pedido → cocina → servido" antes de programarlo.
- Revisar el comportamiento de la UI con el rol que la va a usar (el aviso de la campanita lo detectó el QA).

**Stop**
- Asumir que un usuario "sin sede" es un caso imposible: la app devolvía 403 sin explicación.

**Acciones**

| Acción | Responsable | Fecha |
|---|---|---|
| Revisar la campanita con rol MESERO y COCINERO en la demo | KB | 2 ago |
| Filtrar cerrado por defecto los endpoints sin sede | CD | 2 ago |

---

## Retrospectiva S3 — Facturación, pagos y caja (23 ago)

**Continue**
- Escribir pruebas de los cálculos de dinero (centavos, descuento antes de IVA, propina no gravada).
- Sacar del sprint lo que depende de un tercero: HU-014 no se comprometió y el sprint cerró al 100 %.

**Start**
- Medir la capacidad real antes de aceptar un spike: se comprometieron 34 puntos y el equipo terminó agotado.
- Separar la interfaz de "dividir cuenta" del flujo de pago.

**Stop**
- Estimar historias sin desglosarlas en tareas el mismo día del Planning.

**Acciones**

| Acción | Responsable | Fecha |
|---|---|---|
| Volver a la capacidad de 26 puntos y no comprometer spikes | CD | 30 ago |
| Documentar los métodos de pago soportados en el README | JB | 30 ago |

---

## Retrospectiva S4 — Inventario (20 sep)

**Continue**
- Pruebas de integración para todo lo que toca cantidades y stock.
- Pedir al QA los casos borde el primer día del sprint.

**Start**
- Validar los tipos `DECIMAL(10,3)` con datos reales antes de la demo.
- Dejar la unidad de medida explícita en la interfaz (fue la confusión más repetida).

**Stop**
- Corregir redondeos "a ojo" en el código en lugar de probarlos.

**Acciones**

| Acción | Responsable | Fecha |
|---|---|---|
| Prueba automatizada de conteo absoluto y cantidades | KB | 27 sep |
| Documentar unidades de inventario en `docs/fase-4-inventario.md` | JB | 27 sep |

---

## Retrospectiva S5 — Domicilios y menú (18 oct)

**Continue**
- Reutilizar los componentes comunes (`DataTable`, `Button`, `MetricCard`) en vez de crear pantallas nuevas.
- Integrar el nuevo rol REPARTIDOR con el mismo middleware de permisos.

**Start**
- Probar el flujo completo desde la web pública, no solo desde el panel.
- Medir cuántas pantallas nuevas aparecen por sprint (fueron 6).

**Stop**
- Duplicar estilos en las pantallas nuevas: se creó `Cocina.css` en lugar de variables comunes.

**Acciones**

| Acción | Responsable | Fecha |
|---|---|---|
| Unificar estilos con variables CSS del tema | JB | 25 oct |
| Checklist de permisos por rol en cada PR | CD | 25 oct |

---

## Retrospectiva S6 — Reportes, multi-sede y roles (15 nov)

**Continue**
- Auditar el aislamiento por sede con dos establecimientos en pruebas (así se encontró el defecto #248).
- Cerrar el sprint con la demo en Docker, no en local.

**Start**
- Revisar el esquema de Prisma contra la base real al inicio de cada sprint (evita el drift).
- Etiquetar los issues con severidad, no solo con `bug`.

**Stop**
- Dejar issues sin responsable ni milestone.

**Acciones**

| Acción | Responsable | Fecha |
|---|---|---|
| Migración que agrega `id_restaurante` a las 7 tablas | CD | 22 nov |
| Etiquetar los issues abiertos con severidad | KB | 22 nov |

---

## Retrospectiva S7 — Cierre (25 nov)

**Continue**
- Sacar del sprint lo que no se puede terminar y declararlo como deuda, con puntos y motivo.
- Validar con `tsc`, `eslint` y `vite build` antes de empujar (evitó romper `develop`).

**Start**
- Estimar el último sprint en función del calendario real (10 días, no 20).
- Pedir revisión externa de las historias de IA antes de comprometerlas.

**Stop**
- Comprometer historias de IA sin modelo de datos ni datos históricos suficientes.

**Acciones abiertas (pasan al siguiente ciclo)**

| Acción | Responsable | Estado |
|---|---|---|
| Cambiar los defaults inseguros del compose (`JWT_SECRET`, `CARGAR_DEMO`) | CD | Abierta |
| Alinear `.env.example` con las variables que lee el compose | JB | Abierta |
| Activar los tests de integración en CI con MariaDB de servicio | KB | Abierta |
| Terminar HU-028 (sugerencia de compra) con histórico de ventas | JB | Abierta |
| Investigar CUFE/DIAN con un proveedor autorizado | CD | Abierta |

---

## Feedback consolidado

### Del proceso técnico (CI y revisiones de PR)

| Fuente | Feedback recibido | Cómo se atendió |
|---|---|---|
| CI `audit` | Vulnerabilidades transitivas de Prisma (`deepmerge-ts`, `mariadb`, `mysql2`) | Documentadas en `docs/auditoria-dependencias.md`; el paso no bloquea el pipeline a propósito |
| CI `lint` | Imports sin usar y variables muertas | Regla aplicada; hoy `eslint` pasa en backend y frontend |
| Revisión de PR | "Una rama por tema" | Se separaron ramas `feat/*` y `check/*`; se agregó `branch-flow.yml` para bloquear PR que no van a `develop` |
| Revisión de PR | "Los secretos no van al repositorio" | `.env.example` sin credenciales reales + checklist de seguridad en la plantilla |
| Auditoría UX | Contraste, foco visible y textos de ayuda en formularios | Se ajustaron tipografías y mensajes (ver `docs/HUs` criterios de aceptación 003 y 004) |

### Del equipo (entre integrantes)

- **CD → equipo:** "Hay que cerrar el diseño antes de la primera semana; el primer tercio del sprint siempre
  se nos va en eso."
- **JB → equipo:** "Los componentes comunes ahorran más tiempo del que cuesta crearlos. Usemos `DataTable`
  siempre antes de escribir una tabla nueva."
- **KB → equipo:** "Si el criterio de aceptación no dice qué pasa cuando falla, no está listo para el sprint."

### De la retroalimentación externa (sustentaciones y revisión académica)

| Observación | Acción tomada / pendiente |
|---|---|
| "Falta la documentación gráfica (diagramas UML, MER, casos de uso)" | **Hecho:** `docs/02-casos-de-uso.md` y `docs/03-diagramas-de-secuencia.md` |
| "Falta evidenciar el proceso Scrum" | **Hecho:** esta carpeta `docs/scrum/` (backlog con puntos, sprints, planning/poker, informe y retrospectivas) |
| "Las pruebas deben correr en un ambiente separado del desarrollo" | **Pendiente:** MariaDB como servicio en CI + `ESTABLECIMIENTO_DB_TEST=1` |
| "Documentar el despliegue y las variables de entorno" | **Parcial:** README y `.env.example`; falta alinear nombres con el compose |

---

## Resumen de acciones abiertas al cierre

1. Defaults inseguros en `docker-compose.yml` (`JWT_SECRET`, `CARGAR_DEMO=1`).
2. `.env.example` desalineado (`MAILTRAP_USER/PASS/FROM` vs `MAILTRAP_USERNAME/PASSWORD/FROM`).
3. Tests de integración fuera de CI (35 subcasos sin evidencia en el pipeline).
4. HU-028, HU-029 y HU-030 (IA) en el backlog con puntos y motivo declarados.
5. HU-014 (CUFE/DIAN) a la espera de un proveedor autorizado.
6. README: sección "Estado de cobertura" desactualizada (dice que solo existe la prueba de `/health`).
