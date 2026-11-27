
# Reporte de ejecución de pruebas — RemiSoft

## 1. Introducción

El presente documento consolida los resultados obtenidos durante las actividades de ejecución, revisión y aseguramiento de calidad del sistema RemiSoft.

Se incluyen los resultados de las pruebas unitarias ejecutadas en GitHub Codespaces, las ejecuciones verificadas de integración continua, los hallazgos técnicos y las verificaciones pendientes.

El reporte complementa la documentación histórica de pruebas existente en el repositorio y diferencia los resultados observados de los criterios que todavía requieren evaluación.

## 2. Objetivo general

Consolidar los resultados de las pruebas realizadas sobre RemiSoft, identificando el estado de las funcionalidades evaluadas, los defectos encontrados, las medidas correctivas y las limitaciones del proceso de aseguramiento de calidad.

### 2.1. Objetivos específicos

- Registrar los resultados reales de ejecución.
- Identificar las versiones del software evaluadas.
- Diferenciar las pruebas unitarias de las pruebas de integración.
- Verificar los resultados de integración continua.
- Identificar defectos y medidas correctivas.
- Registrar requisitos pendientes de comprobación.
- Facilitar las actividades de regresión.
- Mantener la trazabilidad de las evidencias.

## 3. Documentación relacionada

El presente reporte complementa:

- [Plan General de Pruebas](01-plan-general-pruebas.md).
- [Ambiente independiente de pruebas](02-ambiente-pruebas.md).
- [Informe de pruebas unitarias](03-informe-pruebas-unitarias.md).
- [Índice de evidencias](04-evidencias-pruebas/README.md).

También se considera la documentación histórica del equipo:

- [Plan e informe de pruebas](https://github.com/Cesar10007/Proyecto-Remisoft/blob/develop/docs/informe-pruebas.md).
- [Reporte histórico de ejecución y defectos](https://github.com/Cesar10007/Proyecto-Remisoft/blob/develop/docs/04-reporte-ejecucion-pruebas.md).

Los resultados históricos deberán interpretarse considerando la fecha y versión del sistema en que fueron obtenidos.

## 4. Alcance de la ejecución

| Nivel o actividad | Estado |
|---|---|
| Pruebas unitarias independientes | Ejecutadas |
| Pruebas automatizadas del backend mediante CI | Ejecutadas |
| Pruebas de integración mediante CI | Ejecutadas según la configuración del flujo |
| Validación estructural de Docker Compose QA | Realizada |
| Análisis estático mediante ESLint en CI | Ejecutado |
| Compilación del frontend mediante CI | Ejecutada |
| Construcción de imágenes Docker mediante CI | Ejecutada |
| Pruebas funcionales manuales independientes | Pendientes de consolidación |
| Pruebas E2E mediante Playwright | Pendientes de consolidación |
| Pruebas de rendimiento | Pendientes |
| Medición de cobertura de código | Pendiente |
| Evaluación integral de accesibilidad | Pendiente |
| Validación operativa independiente de Docker QA | Pendiente de confirmación |

Los resultados de integración continua corresponden a las ejecuciones específicas consultadas y no certifican automáticamente todas las funcionalidades del sistema.

## 5. Identificación de versiones evaluadas

| Identificador | Rama o referencia | Commit | Actividad |
|---|---|---|---|
| EJ-UNIT-001 | docs/testing-qa | f248e66 | Primera ejecución unitaria |
| EJ-UNIT-002 | docs/testing-qa | 7bba9a3 | Segunda ejecución unitaria |
| EJ-ENV-001 | chore/qa-environment | f26013b | Preparación y validación estructural del ambiente QA |
| EJ-CI-001 | PR #286 | 3d7476c | Integración continua |
| EJ-CI-002 | PR #290 | c0a468e | Integración continua con ejecución secuencial |
| REV-001 | develop | 29e54d8 | Revisión documental y técnica de cambios recientes |

Fecha local de consolidación: 26 de noviembre de 2026.

Los registros de GitHub Actions y Codespaces pueden mostrar fechas UTC correspondientes al 27 de noviembre de 2026.

Cada resultado deberá interpretarse en relación con el commit evaluado.

## 6. Resultados de pruebas unitarias

### 6.1. Ambiente utilizado

| Elemento | Configuración |
|---|---|
| Ambiente | GitHub Codespaces |
| Node.js | v26.13.1 |
| Herramienta | Node.js Test Runner |
| Biblioteca de aserciones | node:assert/strict |
| Base de datos | No requerida |
| Contenedores Docker | No requeridos |
| Archivos unitarios seleccionados | 5 |
| Casos unitarios distintos | 23 |

### 6.2. Primera ejecución

| Indicador | Resultado |
|---|---:|
| Casos ejecutados | 23 |
| Casos aprobados | 23 |
| Casos fallidos | 0 |
| Casos omitidos | 0 |
| Casos cancelados | 0 |
| Porcentaje de aprobación | 100 % |
| Duración total | 317.095116 ms |

Commit evaluado: `f248e66`.

### 6.3. Segunda ejecución

| Indicador | Resultado |
|---|---:|
| Casos ejecutados | 23 |
| Casos aprobados | 23 |
| Casos fallidos | 0 |
| Casos omitidos | 0 |
| Casos cancelados | 0 |
| Porcentaje de aprobación | 100 % |
| Duración total | 173.409375 ms |

Commit evaluado:

`7bba9a3d05b6bbb40d85d8f8630759eb2c71c9d0`

Fecha del registro:

`2026-11-27T03:42:27+00:00`

Correspondiente al 26 de noviembre de 2026, a las 22:42:27 en Colombia.

### 6.4. Resultados por área

| Área | Casos | Primera ejecución | Segunda ejecución |
|---|---:|---:|---:|
| Validación de datos | 6 | 6 aprobados | 6 aprobados |
| Facturación | 4 | 4 aprobados | 4 aprobados |
| Gestión multisede | 8 | 8 aprobados | 8 aprobados |
| Servicio de salón | 3 | 3 aprobados | 3 aprobados |
| Establecimientos | 2 | 2 aprobados | 2 aprobados |
| **Total** | **23** | **23 aprobados** | **23 aprobados** |

### 6.5. Interpretación

Las dos ejecuciones presentan resultados satisfactorios sobre el mismo conjunto de pruebas.

No se contabilizan como 46 casos unitarios diferentes.

Entre los commits evaluados únicamente se incorporó el informe de pruebas unitarias, sin modificaciones al código fuente.

Los resultados permiten comprobar la consistencia de las funciones evaluadas en ambas ejecuciones.

### 6.6. Evidencias

- [Informe detallado de los 23 casos](03-informe-pruebas-unitarias.md).
- [Registro textual de ejecución](04-evidencias-pruebas/EV-UNIT-003_2026-11-26_ejecucion.txt).
- [Captura de pantalla](04-evidencias-pruebas/EV-UNIT-002_2026-11-26_pruebas-unitarias.png).
- [Comparación de commits evaluados](https://github.com/Cesar10007/Proyecto-Remisoft/compare/f248e66...7bba9a3).

## 7. Resultados de integración continua

### 7.1. Configuración del ambiente CI

El flujo de integración continua utiliza:

- GitHub Actions.
- Node.js 20.19.4.
- pnpm 10.15.0.
- MariaDB 11.4.4.
- Base de datos temporal remisoft_test.
- Migraciones de Prisma.
- Vistas y procedimientos almacenados.
- Variables de prueba de integración habilitadas.

El servicio de base de datos de CI es independiente del ambiente Docker QA utilizado para pruebas locales.

### 7.2. Ejecución asociada al Pull Request #286

Identificador de ejecución: `45930257166`.

| Indicador | Resultado |
|---|---:|
| Pruebas contabilizadas por Node.js | 88 |
| Aprobadas | 88 |
| Fallidas | 0 |
| Omitidas | 0 |
| Canceladas | 0 |
| Pendientes según el ejecutor | 0 |
| Porcentaje de aprobación | 100 % |
| Duración | 24958.176741 ms |
| Estado del flujo | Exitoso |

Comando registrado:

```bash
node --test
```

Referencia:

[GitHub Actions — Ejecución CI del PR #286](https://github.com/Cesar10007/Proyecto-Remisoft/actions/runs/45930257166)

### 7.3. Ejecución asociada al Pull Request #290

Identificador de ejecución: `45935608011`.

| Indicador | Resultado |
|---|---:|
| Pruebas contabilizadas por Node.js | 88 |
| Aprobadas | 88 |
| Fallidas | 0 |
| Omitidas | 0 |
| Canceladas | 0 |
| Pendientes según el ejecutor | 0 |
| Porcentaje de aprobación | 100 % |
| Duración | 48731.497501 ms |
| Estado del flujo | Exitoso |

Comando registrado:

```bash
node --test --test-concurrency=1
```

Referencia:

[GitHub Actions — Ejecución CI del PR #290](https://github.com/Cesar10007/Proyecto-Remisoft/actions/runs/45935608011)

Al momento de la revisión, el PR #290 permanecía abierto, aunque sus validaciones CI y Branch flow habían finalizado satisfactoriamente.

### 7.4. Comparación de ejecuciones CI

| Indicador | PR #286 | PR #290 |
|---|---:|---:|
| Pruebas contabilizadas | 88 | 88 |
| Aprobadas | 88 | 88 |
| Fallidas | 0 | 0 |
| Omitidas | 0 | 0 |
| Duración aproximada | 24.96 s | 48.73 s |
| Estrategia | Concurrencia predeterminada | Concurrencia entre archivos limitada a 1 |

La ejecución secuencial constituye una medida para reducir los conflictos entre archivos de pruebas que utilizan recursos compartidos.

Las diferencias de duración no permiten establecer por sí solas una comparación definitiva de rendimiento, debido a que las ejecuciones corresponden a versiones y condiciones distintas.

### 7.5. Otros flujos verificados

| Pull Request | Ejecución CI | Resultado |
|---|---|---|
| #286 | 45930257166 | Exitoso |
| #288 | 45932108183 | Exitoso |
| #289 | 45933607480 | Exitoso |
| #290 | 45935608011 | Exitoso |

Referencias adicionales:

- [CI del PR #288](https://github.com/Cesar10007/Proyecto-Remisoft/actions/runs/45932108183).
- [CI del PR #289](https://github.com/Cesar10007/Proyecto-Remisoft/actions/runs/45933607480).

### 7.6. Controles automatizados

En los flujos CI consultados se comprobaron los siguientes pasos:

| Control | Resultado |
|---|---|
| Preparación de MariaDB | Exitoso |
| Preparación de base de datos de pruebas | Exitoso |
| Pruebas automatizadas del backend | Exitoso |
| Validación de Docker Compose principal | Exitoso |
| Construcción de imágenes Docker | Exitoso |

Adicionalmente, el flujo CI del PR #286 registró como exitosos los pasos de lint del backend, lint del frontend y compilación del frontend.

La auditoría de dependencias es informativa cuando está configurada con continue-on-error. El éxito del flujo no implica necesariamente ausencia de vulnerabilidades.

### 7.7. Clasificación de los resultados

El total de 88 corresponde al conteo informado por Node.js Test Runner para la ejecución general del backend.

Este conjunto comprende pruebas unitarias, controles adicionales y pruebas de integración, incluidos los subcasos contabilizados por el ejecutor.

No corresponde a 88 pruebas unitarias independientes.

Tampoco deberá sumarse directamente a los 23 casos unitarios para determinar la cantidad de casos distintos, debido a la superposición entre ambos conjuntos.

## 8. Validación del ambiente independiente QA

| Control | Estado |
|---|---|
| Creación de Docker Compose QA | Completado |
| Creación de plantilla de variables | Completado |
| Separación de base de datos | Verificada en configuración |
| Separación de puertos | Verificada en configuración |
| Separación de volúmenes | Verificada en configuración |
| Separación de redes | Verificada en configuración |
| Protección local de credenciales | Verificada |
| Validación estructural de Docker Compose QA | Realizada |
| Publicación de configuración | Completada |
| Integración con develop | Confirmada |
| Inicio y funcionamiento de servicios QA | Pendiente de confirmación |
| Generación de reportes JUnit en Docker QA | Pendiente |
| Aislamiento efectivo durante la ejecución | Pendiente |

La configuración fue incorporada a develop mediante el Pull Request #286.

Las pruebas unitarias realizadas directamente en Codespaces no requirieron iniciar el ambiente Docker QA.

El flujo CI utiliza su propia infraestructura, por lo cual sus resultados no sustituyen las pruebas operativas del archivo docker-compose.qa.yml.

## 9. Hallazgos técnicos

### 9.1. Conflicto de transacciones

Durante una ejecución de integración continua se observó el siguiente error:

```text
Transaction failed due to a write conflict or a deadlock.
Please retry your transaction.
```

| Elemento | Información |
|---|---|
| Componente | Pruebas de integración del backend |
| Archivo señalado | backend/tests/fixtures/establecimiento.js |
| Línea señalada | 21 |
| Tipo de hallazgo | Conflicto de escritura o bloqueo mutuo |
| Procedencia | Captura compartida durante la revisión del equipo |
| Causa raíz | Pendiente de confirmación definitiva |

El problema se presentó durante una ejecución distinta de las pruebas unitarias independientes.

### 9.2. Medida correctiva identificada

La configuración actual del backend contiene:

```json
"test": "node --test --test-concurrency=1"
```

Esta modificación limita la concurrencia entre archivos durante la ejecución general de pruebas.

La ejecución consultada del PR #290 registró 88 pruebas aprobadas, sin fallos ni omisiones.

El resultado constituye evidencia favorable posterior a la modificación, pero no permite garantizar que el conflicto no vuelva a presentarse.

Se recomienda mantener el seguimiento mediante ejecuciones de regresión.

Referencia:

[Configuración actual de package.json](https://github.com/Cesar10007/Proyecto-Remisoft/blob/29e54d864b9a5fc804c11d07089bf9dc2efc8db7/backend/package.json)

### 9.3. Diferencia en el ejecutor Docker QA

El archivo docker-compose.qa.yml utiliza directamente Node.js Test Runner para generar los reportes de pruebas.

Por lo tanto, la modificación del script test en package.json no implica automáticamente que el ejecutor Docker QA utilice la misma configuración de concurrencia.

Se recomienda verificar este comportamiento durante la validación operativa del ambiente independiente y evaluar una eventual alineación mediante revisión técnica.

Esta observación corresponde a un riesgo identificado mediante inspección estática, no a un fallo reproducido dentro de Docker QA.

## 10. Seguimiento de defectos anteriores

Durante actividades anteriores de QA se reportaron hallazgos relacionados con reportes, vistas SQL, datos de prueba e inicialización de la base de datos.

| Hallazgo | Cambio identificado | Estado de seguimiento |
|---|---|---|
| Variable esMesero indefinida en reportes | Modificación del controlador de reportes | Pendiente de nueva prueba |
| Vista de ventas diarias sin id_restaurante | Incorporación del identificador en la vista SQL | Pendiente de nueva prueba |
| Diferencia en la estructura de respuesta de ingredientes | Ajustes en pruebas de aislamiento | Pendiente de nueva prueba |
| Correo inválido generado por datos de prueba | Modificación del generador de correos de prueba | Pendiente de nueva prueba |
| CI sin carga de vistas y procedimientos | Incorporación de la preparación SQL en CI | Medida correctiva verificada en CI |
| Conflicto de transacciones en CI | Ejecución secuencial del conjunto de pruebas | Evidencia favorable; seguimiento pendiente |

Los cambios relacionados con los primeros hallazgos pueden consultarse en:

[Pull Request #285](https://github.com/Cesar10007/Proyecto-Remisoft/pull/285)

Los resultados históricos cuyos registros originales no se encuentren disponibles deberán conservarse como antecedentes reportados, sin incorporarlos a las métricas de ejecución verificadas del presente documento.

## 11. Seguimiento del issue #248

El issue #248 documentó diferencias entre el esquema Prisma y la estructura de siete tablas de la base de datos.

| Elemento | Resultado |
|---|---|
| Identificador | #248 |
| Tipo de problema | Desalineación del esquema de datos |
| Error histórico | P2022 |
| Estado actual en GitHub | Cerrado |
| Motivo de cierre | Completado |
| Fecha de cierre | 25/11/2026 |
| Prueba de regresión específica en esta sesión | Pendiente |

Referencia:

[Issue #248 — Drift de esquema](https://github.com/Cesar10007/Proyecto-Remisoft/issues/248)

El estado cerrado se verificó directamente en GitHub.

No deberá presentarse como una nueva ejecución de regresión realizada durante la sesión actual.

La documentación histórica que todavía presenta el issue como abierto debe interpretarse considerando su fecha de elaboración.

## 12. Evaluación de requisitos no funcionales

Durante la revisión técnica se identificaron criterios que requieren verificación adicional.

| Criterio | Observación | Estado |
|---|---|---|
| RNF-005.1 | No se identificó lógica completa de generación del CUFE durante la revisión del equipo | Posible funcionalidad no implementada; pendiente de confirmación |
| RNF-005.2 | No se identificó almacenamiento de facturas XML durante la revisión del equipo | Posible funcionalidad no implementada; pendiente de confirmación |
| RNF-002.2 | No se dispone de evidencia suficiente sobre los límites efectivos del pool de conexiones | Pendiente de validación |
| RNF-003.1 | No se dispone de un reporte actualizado de cobertura de lógica crítica | Pendiente de medición |
| RNF-002.1 | Tiempo de inicio de sesión inferior a 500 ms | Pendiente de medición |
| RNF-002.3 | Carga del frontend inferior a 3 segundos | Pendiente de medición |
| RNF-002.4 | Tiempo de respuesta de predicciones inferior a 2 segundos | Pendiente de verificar implementación y medir |
| RNF-004.2 | Contraste mínimo de 4.5:1 | Pendiente de medición |

Los criterios se conservan en el Plan General de Pruebas porque representan condiciones que el sistema debe satisfacer según sus requisitos.

La falta de evidencia no equivale automáticamente a incumplimiento confirmado.

Las funcionalidades no implementadas que correspondan a requisitos obligatorios deberán registrarse como hallazgos una vez comprobadas.

## 13. Métricas consolidadas

### 13.1. Pruebas unitarias independientes

| Métrica | Resultado |
|---|---:|
| Casos distintos | 23 |
| Ejecuciones realizadas | 2 |
| Casos aprobados por ejecución | 23 |
| Casos fallidos por ejecución | 0 |
| Porcentaje de aprobación | 100 % |
| Cobertura de código | No medida |

### 13.2. Integración continua

| Métrica | Resultado |
|---|---:|
| Ejecuciones con conteos detallados consultados | 2 |
| Pruebas contabilizadas por ejecución | 88 |
| Aprobadas por ejecución | 88 |
| Fallidas por ejecución | 0 |
| Omitidas por ejecución | 0 |
| Porcentaje de aprobación | 100 % |

### 13.3. Interpretación de métricas

El porcentaje de aprobación se calcula mediante:

Porcentaje de aprobación = (Casos aprobados / Casos ejecutados) x 100

El porcentaje de aprobación no equivale al porcentaje de cobertura de código.

No se establece un porcentaje global de cumplimiento del sistema debido a que existen requisitos y niveles de pruebas pendientes de evaluación.

## 14. Evidencias de ejecución

| Identificador | Evidencia | Disponibilidad |
|---|---|---|
| EV-UNIT-001 | Primera ejecución de pruebas unitarias | Documentada |
| EV-UNIT-002 | Captura del registro de segunda ejecución | Disponible |
| EV-UNIT-003 | Registro textual de segunda ejecución | Disponible |
| EV-ENV-002 | Commit de configuración QA | Disponible |
| EV-ENV-003 | Integración mediante PR #286 | Disponible |
| EV-CI-001 | Ejecución CI del PR #286 | Disponible |
| EV-CI-002 | Validación Branch flow del PR #286 | Disponible |
| EV-CI-003 | Ejecución CI del PR #290 | Disponible mediante GitHub Actions |
| EV-DEF-001 | Conflicto de transacciones en CI | Observado; captura pendiente de incorporar al repositorio |

Las evidencias locales están organizadas en:

[04-evidencias-pruebas](04-evidencias-pruebas/README.md)

## 15. Riesgos identificados

| Riesgo | Impacto potencial | Medida recomendada |
|---|---|---|
| Conflictos entre pruebas de integración | Inestabilidad de ejecución | Mantener seguimiento de la ejecución secuencial |
| Diferencias de versión de Node.js | Resultados no completamente equivalentes entre ambientes | Reproducir las pruebas bajo la versión definida en CI |
| Ausencia de cobertura medida | Desconocimiento del alcance real de las pruebas | Generar reporte de cobertura |
| Cambios frecuentes en develop | Desactualización de resultados | Registrar commits y realizar regresión |
| Ambiente Docker QA pendiente de ejecución | Infraestructura sin validación operativa completa | Realizar ejecución controlada y autorizada |
| Diferencias de concurrencia entre CI y Docker QA | Posibles conflictos en pruebas locales | Verificar y evaluar alineación del ejecutor |
| Requisitos no funcionales pendientes | Incumplimientos no identificados | Ejecutar las verificaciones correspondientes |

## 16. Criterios de salida

| Criterio | Estado |
|---|---|
| Ejecutar al menos 20 pruebas unitarias | Cumplido |
| Documentar individualmente las pruebas unitarias | Cumplido |
| Conservar evidencias de ejecución unitaria | Cumplido |
| Registrar resultados de integración continua | Cumplido |
| Identificar hallazgos y medidas correctivas | Cumplido parcialmente |
| Consolidar la matriz de defectos | Pendiente |
| Verificar todos los flujos funcionales críticos | Pendiente de consolidación |
| Confirmar el funcionamiento operativo de Docker QA | Pendiente |
| Verificar todos los requisitos no funcionales | Pendiente |
| Confirmar las correcciones mediante regresión específica | Pendiente |

El proceso de aseguramiento de calidad no se considera completamente finalizado mientras existan verificaciones obligatorias pendientes.

## 17. Recomendaciones

- Conservar la separación del ambiente de pruebas.
- Mantener los registros asociados a sus commits.
- Ejecutar periódicamente las pruebas de regresión.
- Revisar la estabilidad de las pruebas de integración.
- Completar las verificaciones operativas de Docker QA.
- Generar reportes de cobertura.
- Validar los criterios de rendimiento y accesibilidad.
- Confirmar el estado de implementación de facturación electrónica.
- Actualizar la matriz de defectos según los resultados obtenidos.
- Mantener actualizada la documentación técnica del proyecto.

## 18. Limitaciones

- Las ejecuciones unitarias independientes utilizaron Node.js 26.13.1.
- Los flujos CI utilizan Node.js 20.19.4.
- Los resultados corresponden a commits específicos.
- No se realizó una auditoría integral de seguridad en esta sesión.
- No se obtuvo un reporte actualizado de cobertura de código.
- No se ejecutó directamente el ambiente Docker QA.
- No se consolidaron resultados actuales completos de Playwright.
- No se verificaron individualmente todos los requisitos funcionales y no funcionales.
- Los resultados satisfactorios de CI no garantizan la ausencia de defectos en el sistema.
- Los antecedentes sin registros originales disponibles no se contabilizan como ejecuciones verificadas.

## 19. Conclusión

Las actividades de aseguramiento de calidad permitieron ejecutar y documentar 23 pruebas unitarias independientes en dos ocasiones, obteniendo resultados satisfactorios en todos los casos.

Los registros de integración continua consultados presentaron 88 pruebas contabilizadas y aprobadas por ejecución, sin fallos ni omisiones.

Se identificaron cambios relacionados con defectos previamente reportados y medidas para mejorar la estabilidad de las pruebas de integración.

La configuración independiente de QA fue incorporada a develop y proporciona una base técnica para futuras ejecuciones controladas.

Los resultados obtenidos son favorables dentro del alcance evaluado. Sin embargo, permanecen pendientes la validación operativa del ambiente Docker QA, las mediciones de cobertura, rendimiento y accesibilidad, así como la confirmación específica de determinados defectos y requisitos.

El proceso deberá continuar mediante actividades de seguimiento, regresión y actualización de evidencias.
