# Acta 02 — Retrospectiva del sprint S7

| Campo | Detalle |
|---|---|
| **Fecha** | 25 de noviembre de 2026 |
| **Duración** | 1 h 30 min |
| **Sprint revisado** | S7 — IA y exportación (cierre), 16 – 25 nov 2026 (10 días) |
| **Participantes** | César David Rueda Daza (`Cesar10007`), Juan Felipe Bello Pérez (`jfbellop`), Kevin Duvan Bueno Melo (`alucard592`) |
| **Facilitador** | `alucard592` (rol Tester / QA) |

## 1. Números del sprint

| Métrica | Valor |
|---|---|
| Puntos comprometidos | 13 |
| Puntos aceptados | 5 |
| Cumplimiento | 38 % |
| Velocidad media del proyecto (S1–S6) | 26,2 puntos por sprint |
| Defectos cerrados en el sprint | 27 (26 verificados, 1 en corrección) |
| Issues del proyecto cerrados | 29 de 29 |

El 38 % es el número incómodo de la retrospectiva y por eso encabeza el acta: **no se cumplió el
compromiso del sprint**. La explicación no es una excusa, es una decisión consciente que se documenta
abajo.

## 2. Qué salió bien

1. **El sistema quedó funcionando de punta a punta.** Docker Compose levanta MariaDB, backend y
   frontend; una instalación limpia crea la base, migra y (si se pide) carga datos demo.
2. **La batería de pruebas creció y por fin corre en CI.** De 28 casos unitarios a 61 casos con
   integración real contra MariaDB como servicio del workflow.
3. **El drift de esquema se cerró con migración, no con un parche manual.** La issue #248 dejó de ser
   un `P2022` intermitente y quedó una migración versionada que lo impide.
4. **La documentación alcanzó al código.** Modelo de datos, clases, arquitectura, casos de uso,
   secuencias, Scrum completo, informes de prueba y reflexión de backends están en `docs/`.
5. **El flujo de ramas protegidas funcionó.** Ningún cambio llegó a `develop` sin Pull Request: la
   regla del repositorio rechazó el intento de push directo, que es exactamente lo que debía pasar.

## 3. Qué no salió bien

1. **Se comprometió de más para 10 días.** El sprint de cierre mezcló tres cosas que compiten por el
   mismo tiempo: cerrar funcionalidad (IA y exportación), levantar la integración en CI y producir la
   documentación de sustentación. Se eligió documentación y CI porque sin eso no había entrega; la IA
   quedó fuera.
2. **La deuda de los routers sin montar sigue ahí** (~100 endpoints en 18 archivos que no se ejecutan).
   Se decidió no tocarla en la semana de cierre para no abrir un frente nuevo.
3. **Se detectaron tarde los defectos de esquema.** El drift de `id_restaurante` estaba en la base
   desde hacía semanas y solo se vio cuando una consulta empezó a fallar en cinco módulos.
4. **La cobertura de pruebas no se mide.** Hay 61 casos, pero no se genera informe de cobertura
   (`--experimental-test-coverage`): se sabe qué se prueba, no qué porcentaje del código.

## 4. Acciones de mejora (Start / Stop / Continue)

| Tipo | Acción | Responsable | Cuándo |
|---|---|---|---|
| **Start** | Medir cobertura en CI con `node --test --experimental-test-coverage` y publicar el resumen en el job | `Cesar10007` | Siguiente iteración |
| **Start** | Revisar el esquema al inicio de cada sprint con `prisma migrate status` contra la base de desarrollo | `Cesar10007` | Siguiente iteración |
| **Start** | Un issue por tarea técnica, abierto al empezar y cerrado con el PR (no al final) | `alucard592` | Siguiente iteración |
| **Stop** | Comprometer sprints de cierre con trabajo de funcionalidad nueva y de documentación a la vez | Todo el equipo | Inmediato |
| **Stop** | Dejar issues sin responsable ni milestone | `alucard592` | Inmediato (hecho: 29 de 29) |
| **Continue** | Revisar cada PR con la plantilla y esperar los dos checks en verde antes de fusionar | Todo el equipo | Permanente |
| **Continue** | Documentar la deuda con criterio de cierre en vez de dejarla implícita | `Cesar10007` | Permanente |

## 5. Compromiso para la siguiente iteración

1. Cerrar la deuda P0 y P1 de `docs/reflexion-backends.md`: secretos, límite global de peticiones,
   cabeceras de seguridad y revocación de sesión (estimado: 1 día entre los cuatro puntos de mayor
   impacto).
2. Mover los 18 routers sin montar a `src/legacy/` con un README que explique por qué están ahí.
3. Publicar el porcentaje de cobertura en el README y en el job de CI.

## 6. Cierre

No hay bloqueos para la entrega. La deuda queda escrita, priorizada y con dueño, que es la única forma
de que una deuda sea gestionable.

**Firmas:** `Cesar10007` · `jfbellop` · `alucard592`
