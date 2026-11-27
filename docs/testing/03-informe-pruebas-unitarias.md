
# Informe de pruebas unitarias — RemiSoft

## 1. Introducción

El presente informe documenta los resultados obtenidos durante la ejecución de pruebas unitarias del backend del sistema RemiSoft.

Las pruebas evalúan funciones individuales relacionadas con la validación de datos, facturación, gestión multisede, servicio de salón y control de establecimientos.

Este documento complementa:

- [Plan General de Pruebas](01-plan-general-pruebas.md).
- [Ambiente independiente de pruebas](02-ambiente-pruebas.md).

## 2. Objetivo general

Verificar el comportamiento de las funciones y reglas de negocio del backend mediante pruebas unitarias automatizadas, identificando posibles inconsistencias y registrando resultados verificables.

### 2.1. Objetivos específicos

- Ejecutar y documentar un mínimo de 20 casos unitarios.
- Verificar las reglas de validación de datos.
- Comprobar los cálculos de facturación.
- Evaluar las restricciones de acceso entre establecimientos.
- Validar las reglas de negocio del servicio de salón.
- Registrar los resultados esperados y obtenidos.
- Conservar la trazabilidad de la ejecución.
- Identificar limitaciones y verificaciones pendientes.

## 3. Alcance

Las pruebas seleccionadas evalúan funciones aisladas del backend sin requerir conexiones a la base de datos, servicios externos o contenedores Docker.

| Área | Archivo | Casos |
|---|---|---:|
| Validación de datos | validation.test.js | 6 |
| Facturación | facturacion.test.js | 4 |
| Gestión multisede | multisede.test.js | 8 |
| Servicio de salón | salon.test.js | 3 |
| Establecimientos | establecimiento.test.js | 2 |
| **Total** | **5 archivos** | **23** |

Las pruebas de integración, disponibilidad HTTP, auditoría estática, interfaz, seguridad y rendimiento no se incluyen en el total de casos unitarios de este informe.

## 4. Ambiente de ejecución

| Elemento | Configuración |
|---|---|
| Fecha | 26/11/2026 |
| Repositorio | Cesar10007/Proyecto-Remisoft |
| Rama evaluada | docs/testing-qa |
| Commit evaluado | f248e66 |
| Ambiente | GitHub Codespaces |
| Node.js | v26.13.1 |
| Ejecutor | Node.js Test Runner |
| Biblioteca de aserciones | node:assert/strict |
| Formato de reporte | spec |
| Conexión a MariaDB | No requerida |
| Contenedores Docker | No requeridos |
| Datos utilizados | Entradas sintéticas definidas en las pruebas |

La ejecución se realizó directamente mediante Node.js.

La versión utilizada en Codespaces difiere de Node.js 20.19.4, definido en la configuración Docker y CI del proyecto.

La reproducción de los resultados bajo dicha versión permanece como una verificación adicional.

## 5. Metodología

Para cada caso se identificaron:

- Función o regla de negocio evaluada.
- Datos de entrada.
- Resultado esperado.
- Resultado obtenido.
- Estado de ejecución.
- Duración individual.

Se utilizaron las funciones de aserción proporcionadas por Node.js:

- assert.equal.
- assert.deepEqual.
- assert.throws.
- assert.doesNotThrow.

Los casos se consideran aprobados cuando todas sus aserciones finalizan satisfactoriamente.

## 6. Procedimiento de ejecución

Desde la raíz del repositorio se ejecutó el siguiente comando:

```bash
git rev-parse --short HEAD && (
  cd backend &&
  node --version &&
  node --test --test-reporter=spec \
    tests/validation.test.js \
    tests/facturacion.test.js \
    tests/multisede.test.js \
    tests/salon.test.js \
    tests/establecimiento.test.js
)
```

El comando permite identificar el commit evaluado, consultar la versión de Node.js y ejecutar exclusivamente los archivos unitarios seleccionados.

No se ejecutaron las pruebas de integración ni se iniciaron servicios adicionales.

## 7. Casos de prueba unitarios

Los identificadores CP-UNIT corresponden a la clasificación documental de los casos existentes en el repositorio.

### 7.1. Validación de datos

Archivo: `backend/tests/validation.test.js`.

Módulo evaluado: `backend/src/utils/validation.js`.

| ID | Funcionalidad | Datos o escenario | Resultado esperado | Resultado obtenido | Estado | Duración (ms) |
|---|---|---|---|---|---|---:|
| CP-UNIT-001 | Correo obligatorio | Valor undefined con required=true | Retornar mensaje de campo requerido | Coincide con lo esperado | Aprobado | 1.029590 |
| CP-UNIT-002 | Longitud máxima del correo | Correos de 60 y 61 caracteres | Aceptar 60 caracteres y rechazar 61 | Coincide con lo esperado | Aprobado | 0.237723 |
| CP-UNIT-003 | Validación de espacios externos | Correo válido con espacios al inicio y al final | Validar correctamente el correo | Coincide con lo esperado | Aprobado | 0.212396 |
| CP-UNIT-004 | Identificación de conflictos de correo | Errores sintéticos P2002 y P2003 | Distinguir conflictos de correo de otras restricciones | Coincide con lo esperado | Aprobado | 0.391029 |
| CP-UNIT-005 | Cantidades de inventario | Cantidades positivas, negativas, cero y valores fuera de rango | Aceptar únicamente cantidades positivas representables en DECIMAL(10,3) | Coincide con lo esperado | Aprobado | 0.328183 |
| CP-UNIT-006 | Conteo absoluto de inventario | Cero, cantidades válidas y entradas inválidas | Permitir cero exclusivamente cuando esté habilitado y rechazar entradas inválidas | Coincide con lo esperado | Aprobado | 0.270955 |

Funciones evaluadas:

- validateEmail.
- esConflictoCorreo.
- cantidadInventarioValida.

Resultado: 6 casos ejecutados y 6 aprobados.

### 7.2. Facturación

Archivo: `backend/tests/facturacion.test.js`.

Módulos evaluados:

- `backend/src/utils/facturacion.js`.
- `backend/src/utils/salon.js`.

| ID | Funcionalidad | Datos o escenario | Resultado esperado | Resultado obtenido | Estado | Duración (ms) |
|---|---|---|---|---|---|---:|
| CP-UNIT-007 | Cálculo de importes | Dos productos a 1000.50, descuento de 201, propina de 100.25 e IVA del 19 % | IVA de 342 y total de 2242.25; aplicar correctamente los casos de redondeo | Coincide con lo esperado | Aprobado | 3.342416 |
| CP-UNIT-008 | Rechazo de importes inválidos | Valores negativos, ambiguos, fuera de rango, descuentos excesivos y factura sin artículos | Generar errores con estado 422 | Coincide con lo esperado | Aprobado | 0.956213 |
| CP-UNIT-009 | Conservación del consumo facturado | Renglones propios y ajenos al pedido, producto con precio cero | Conservar únicamente el renglón propio y sus valores históricos | Coincide con lo esperado | Aprobado | 0.336297 |
| CP-UNIT-010 | Identificación de pagos efectivos | Factura pagada, factura emitida con pago aprobado y pago rechazado | Reconocer pagos efectivos y excluir intentos rechazados | Coincide con lo esperado | Aprobado | 0.209200 |

Funciones evaluadas:

- importesFactura.
- consumoFacturado.
- conPago.

Resultado: 4 casos ejecutados y 4 aprobados.

Estos casos verifican reglas de cálculo y lectura de facturación. No certifican la generación de CUFE, documentos XML ni el cumplimiento integral de los requisitos de facturación electrónica.

### 7.3. Gestión multisede

Archivo: `backend/tests/multisede.test.js`.

Módulo evaluado: `backend/src/utils/restaurante.js`.

| ID | Funcionalidad | Datos o escenario | Resultado esperado | Resultado obtenido | Estado | Duración (ms) |
|---|---|---|---|---|---|---:|
| CP-UNIT-011 | Acceso de superadministrador | Usuario SUPERADMIN sin sede específica | Permitir el acceso a establecimientos sin restricción de membresía | Coincide con lo esperado | Aprobado | 1.526478 |
| CP-UNIT-012 | Gerente de una sede | Gerente asignado a la sede 3 | Permitir sede 3 y rechazar sede 4 | Coincide con lo esperado | Aprobado | 5.381319 |
| CP-UNIT-013 | Gerente multisede | Membresías en sedes 3 y 7 | Permitir las sedes asignadas y rechazar sede 8 | Coincide con lo esperado | Aprobado | 0.345745 |
| CP-UNIT-014 | Conservación de sede activa | Sede activa 5 sin membresías registradas | Mantener acceso a sede 5 y rechazar sede 6 | Coincide con lo esperado | Aprobado | 0.297836 |
| CP-UNIT-015 | Identificadores inválidos | Membresías con números válidos, negativos, decimales y cadenas inválidas | Conservar únicamente identificadores válidos | Coincide con lo esperado | Aprobado | 0.262299 |
| CP-UNIT-016 | Usuario sin establecimiento | MESERO sin sede ni membresías | Rechazar acceso a establecimientos | Coincide con lo esperado | Aprobado | 0.245768 |
| CP-UNIT-017 | Filtro por sede activa | Gerente con sedes 3 y 7, sede activa 7 | Filtrar consultas exclusivamente por sede 7 | Coincide con lo esperado | Aprobado | 0.499061 |
| CP-UNIT-018 | Multisede sin sede activa | Gerente con membresías y sede activa nula | Generar error con estado 403 | Coincide con lo esperado | Aprobado | 0.989536 |

Funciones evaluadas:

- sedesPermitidas.
- puedeEntrarSede.
- filtroRestaurante.

Resultado: 8 casos ejecutados y 8 aprobados.

Los resultados comprueban las reglas unitarias de acceso y filtrado. La verificación integral del aislamiento entre establecimientos requiere pruebas adicionales de API y base de datos.

### 7.4. Servicio de salón

Archivo: `backend/tests/salon.test.js`.

Módulo evaluado: `backend/src/utils/salon.js`.

| ID | Funcionalidad | Datos o escenario | Resultado esperado | Resultado obtenido | Estado | Duración (ms) |
|---|---|---|---|---|---|---:|
| CP-UNIT-019 | Validación de comandas | Comandas vacías, cantidades inválidas, identificadores incorrectos y renglones duplicados | Rechazar entradas inválidas con estado 422 y normalizar una comanda válida | Coincide con lo esperado | Aprobado | 2.180138 |
| CP-UNIT-020 | Estados de pedidos | Combinaciones de productos pendientes, listos y entregados | Determinar el estado correspondiente; marcar entregado cuando todos los productos estén servidos | Coincide con lo esperado | Aprobado | 1.122024 |
| CP-UNIT-021 | Cálculo de precuenta | Productos facturables y productos cancelados | Excluir los cancelados, obtener subtotal de 2001 y calcular el total con IVA | Coincide con lo esperado | Aprobado | 0.341697 |

Funciones evaluadas:

- leerLineas.
- estadoSegunItems.
- calcularTotales.
- itemsFacturables.

Resultado: 3 casos ejecutados y 3 aprobados.

### 7.5. Establecimientos

Archivo: `backend/tests/establecimiento.test.js`.

Módulos evaluados:

- `backend/src/utils/restaurante.js`.
- `backend/src/utils/salon.js`.

| ID | Funcionalidad | Datos o escenario | Resultado esperado | Resultado obtenido | Estado | Duración (ms) |
|---|---|---|---|---|---|---:|
| CP-UNIT-022 | Restricciones de usuarios sin sede | Gerentes con sede nula o inválida y usuarios SUPERADMIN | Rechazar accesos indebidos mediante estado 403 y aplicar el filtro correspondiente al SUPERADMIN | Coincide con lo esperado | Aprobado | 2.783242 |
| CP-UNIT-023 | Alcance de cuentas del mesero | Gerente y mesero pertenecientes a la sede 8 | Mantener filtro de establecimiento y restringir al mesero mediante id_mesero | Coincide con lo esperado | Aprobado | 0.350864 |

Funciones evaluadas:

- filtroRestaurante.
- alcanceMesero.

Resultado: 2 casos ejecutados y 2 aprobados.

## 8. Consolidación de resultados

| Módulo | Ejecutadas | Aprobadas | Fallidas | Omitidas | Aprobación |
|---|---:|---:|---:|---:|---:|
| Validación de datos | 6 | 6 | 0 | 0 | 100 % |
| Facturación | 4 | 4 | 0 | 0 | 100 % |
| Gestión multisede | 8 | 8 | 0 | 0 | 100 % |
| Servicio de salón | 3 | 3 | 0 | 0 | 100 % |
| Establecimientos | 2 | 2 | 0 | 0 | 100 % |
| **Total** | **23** | **23** | **0** | **0** | **100 %** |

### 8.1. Resumen obtenido del ejecutor

```text
tests 23
suites 0
pass 23
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 317.095116
```

La duración total de ejecución fue de aproximadamente 317.10 milisegundos.

El valor suites 0 corresponde a la clasificación informada por el ejecutor. Los casos se encuentran definidos mediante funciones test individuales, sin agrupaciones de suite contabilizadas.

## 9. Métricas

| Indicador | Resultado |
|---|---:|
| Casos mínimos requeridos | 20 |
| Casos seleccionados | 23 |
| Casos ejecutados | 23 |
| Casos aprobados | 23 |
| Casos fallidos | 0 |
| Casos omitidos | 0 |
| Casos cancelados | 0 |
| Casos bloqueados | 0 |
| Porcentaje de ejecución | 100 % |
| Porcentaje de aprobación | 100 % |
| Cobertura de código | No medida en esta ejecución |
| Duración total | 317.095116 ms |

El porcentaje de aprobación se obtiene dividiendo los casos aprobados entre los casos ejecutados.

El resultado de aprobación del 100 % no representa un porcentaje de cobertura del código ni demuestra el cumplimiento integral de todos los requisitos del sistema.

## 10. Relación con los requisitos

| Área evaluada | Requisitos relacionados |
|---|---|
| Validación de correos | RF-001 |
| Validación de cantidades | RF-004 |
| Cálculos y validaciones de facturación | RF-003 |
| Restricciones de acceso multisede | RF-001 y RNF-001 |
| Reglas de comandas y pedidos | RF-002 |
| Alcance de operaciones del mesero | RF-001, RF-002 y RNF-001 |
| Automatización de pruebas | RNF-003 |

Esta relación identifica las áreas de requisitos cubiertas parcialmente por los casos seleccionados.

No implica que todos los criterios asociados a dichos requisitos hayan sido evaluados.

## 11. Defectos identificados durante la ejecución

Durante la ejecución de los 23 casos unitarios seleccionados no se registraron fallos.

| Tipo de resultado | Cantidad |
|---|---:|
| Fallos unitarios detectados | 0 |
| Casos bloqueados | 0 |
| Casos omitidos | 0 |

Este resultado se limita a los casos incluidos en el presente informe.

Los defectos identificados durante pruebas de integración, revisiones estáticas y otras actividades de QA deberán registrarse en el reporte general de ejecución y la matriz de defectos.

## 12. Evidencias

La ejecución produjo resultados individuales mediante el reporte spec de Node.js Test Runner.

Las evidencias deberán conservarse dentro de:

`docs/testing/04-evidencias-pruebas/`

| ID | Evidencia | Estado |
|---|---|---|
| EV-UNIT-001 | Resultado de terminal de los 23 casos | Obtenido; pendiente de incorporar al repositorio |
| EV-UNIT-002 | Captura de pantalla de la ejecución | Pendiente de incorporar |
| EV-UNIT-003 | Registro textual completo de ejecución | Pendiente de incorporar |

Los registros deberán conservar la fecha, rama, commit y versión de Node.js utilizados.

## 13. Limitaciones

- Los resultados corresponden al commit f248e66 de la rama docs/testing-qa.
- La ejecución se realizó mediante Node.js 26.13.1.
- La reproducción bajo Node.js 20.19.4 permanece pendiente.
- No se ejecutaron pruebas de integración en esta sesión.
- No se evaluaron servicios externos ni conexiones a MariaDB.
- No se realizaron mediciones de cobertura de código.
- La duración total de las pruebas no representa el rendimiento de los endpoints ni del frontend.
- No se verificó el cumplimiento integral de los requisitos no funcionales.
- No se certificó el funcionamiento completo del ambiente Docker QA.
- Los resultados no permiten descartar defectos en funcionalidades no evaluadas.

## 14. Criterios de aceptación

| Criterio | Resultado |
|---|---|
| Ejecutar al menos 20 pruebas unitarias | Cumplido |
| Documentar individualmente los casos | Cumplido |
| Identificar la versión evaluada | Cumplido |
| Registrar resultados obtenidos | Cumplido |
| Diferenciar pruebas unitarias de integración | Cumplido |
| Registrar casos fallidos y omitidos | Cumplido |
| Incorporar evidencias al repositorio | Pendiente |
| Verificar cobertura mínima del 80 % | Pendiente de medición |
| Reproducir bajo Node.js 20.19.4 | Pendiente |

## 15. Referencias

- [Versión evaluada](https://github.com/Cesar10007/Proyecto-Remisoft/commit/f248e66).
- [Pruebas de validación](https://github.com/Cesar10007/Proyecto-Remisoft/blob/f248e66/backend/tests/validation.test.js).
- [Pruebas de facturación](https://github.com/Cesar10007/Proyecto-Remisoft/blob/f248e66/backend/tests/facturacion.test.js).
- [Pruebas multisede](https://github.com/Cesar10007/Proyecto-Remisoft/blob/f248e66/backend/tests/multisede.test.js).
- [Pruebas de salón](https://github.com/Cesar10007/Proyecto-Remisoft/blob/f248e66/backend/tests/salon.test.js).
- [Pruebas de establecimientos](https://github.com/Cesar10007/Proyecto-Remisoft/blob/f248e66/backend/tests/establecimiento.test.js).
- [Plan General de Pruebas](01-plan-general-pruebas.md).
- [Ambiente independiente de pruebas](02-ambiente-pruebas.md).

## 16. Conclusión

La ejecución de pruebas unitarias del backend de RemiSoft permitió evaluar 23 casos distribuidos en cinco áreas funcionales.

Todos los casos seleccionados finalizaron satisfactoriamente, obteniendo un porcentaje de aprobación del 100 %, sin fallos, cancelaciones ni omisiones.

Se cumplió el requisito de ejecutar y documentar un mínimo de 20 pruebas unitarias.

Los resultados aportan evidencia favorable sobre las funciones y reglas de negocio evaluadas.

Sin embargo, no constituyen una certificación integral de la calidad del sistema. Las pruebas de integración, cobertura, rendimiento, accesibilidad, seguridad y funcionamiento operativo del ambiente Docker QA deberán evaluarse mediante sus procedimientos correspondientes.
