
# Plan General de Pruebas — RemiSoft

## Información del documento



---

## 1. Introducción

RemiSoft es un sistema web orientado a la gestión y automatización de procesos administrativos y operativos de restaurantes, incluyendo la administración de usuarios, establecimientos, pedidos, inventario, facturación, caja, domicilios y reportes.

El presente plan establece las actividades, herramientas, procedimientos y criterios necesarios para evaluar la calidad del software, identificar defectos y comprobar el cumplimiento de los requisitos establecidos en la documentación del proyecto.

Las pruebas se realizarán sobre un ambiente controlado e independiente, evitando afectar los datos y servicios utilizados por los demás integrantes del equipo.

Los resultados obtenidos serán registrados mediante informes de ejecución, evidencias y una matriz de defectos.

## 2. Objetivo general

Evaluar la calidad del sistema RemiSoft mediante la planificación, diseño y ejecución de pruebas de software que permitan verificar su funcionamiento, seguridad, rendimiento, mantenibilidad y cumplimiento de los requisitos definidos.

## 3. Objetivos específicos

- Verificar el cumplimiento de los siete requisitos funcionales y los cinco requisitos no funcionales del proyecto.
- Relacionar las historias de usuario con los casos de prueba correspondientes.
- Identificar errores de funcionamiento en el frontend, backend y base de datos.
- Comprobar la correcta comunicación entre los componentes del sistema.
- Validar los permisos y restricciones de acceso correspondientes a cada rol.
- Verificar el aislamiento de información entre establecimientos.
- Ejecutar y documentar un mínimo de 20 casos de pruebas unitarias.
- Evaluar los flujos de negocio mediante pruebas de integración y pruebas de extremo a extremo.
- Registrar los defectos identificados según su severidad, prioridad y estado.
- Verificar las correcciones mediante pruebas de regresión.
- Recopilar evidencias verificables de las actividades realizadas.

## 4. Alcance de las pruebas

El alcance comprende los componentes funcionales y técnicos de RemiSoft identificados en el código fuente, los requisitos, las historias de usuario y la documentación de la API.

### 4.1. Módulos funcionales

| ID | Módulo | Aspectos que se evaluarán |
| --- | --- | --- |
| MOD-001 | Autenticación | Inicio y cierre de sesión, recuperación de contraseña, expiración de tokens y credenciales inválidas. |
| MOD-002 | Usuarios y roles | Registro, modificación, desactivación, asignación de roles y permisos. |
| MOD-003 | Solicitudes de registro | Creación, consulta, aprobación y rechazo de solicitudes. |
| MOD-004 | Restaurantes | Administración de establecimientos y asignación de usuarios. |
| MOD-005 | Gestión multisede | Cambio de sede activa y aislamiento de información entre establecimientos. |
| MOD-006 | Mesas | Disponibilidad, ocupación, capacidad y liberación. |
| MOD-007 | Pedidos y salón | Registro de comandas, modificación, cancelación, rondas adicionales y estados de pedidos. |
| MOD-008 | Cocina | Recepción de comandas, preparación y actualización de estados. |
| MOD-009 | Facturación | Generación, edición de facturas pendientes, consulta, totales, descuentos y propinas. |
| MOD-010 | Cobros | Registro de pagos, cálculo de cambio y prevención de cobros duplicados. |
| MOD-011 | División de cuentas | Distribución por partes iguales o productos, consistencia de importes y pagos por partes. |
| MOD-012 | Cajas y turnos | Apertura, cierre, movimientos, arqueos y registro de ingresos y egresos. |
| MOD-013 | Inventario | Entradas, salidas, ajustes, alertas, conteos y disponibilidad de stock. |
| MOD-014 | Productos y categorías | Registro, consulta, modificación, disponibilidad y clasificación. |
| MOD-015 | Ingredientes y recetas | Cantidades, unidades de medida, equivalencias y consumo automático. |
| MOD-016 | Proveedores | Registro, consulta, modificación y relaciones con establecimientos. |
| MOD-017 | Clientes | Registro, consulta, modificación y asociación con pedidos. |
| MOD-018 | Domicilios | Asignación, seguimiento y actualización de estados. |
| MOD-019 | Reportes | Consulta de información administrativa, financiera y operativa. |
| MOD-020 | Inteligencia artificial | Consulta y registro de resultados analíticos; verificación de las funciones de predicción cuando estén implementadas. |
| MOD-021 | Cierre operativo | Restricciones de operación durante el cierre del establecimiento. |
| MOD-022 | Historial y auditoría | Registro de actividades y trazabilidad de operaciones. |
| MOD-023 | Interfaz de usuario | Navegación, formularios, ventanas modales, accesibilidad, diseño responsive y temas visuales. |

### 4.2. Componentes técnicos

- Frontend desarrollado con React, TypeScript y Vite.
- Gestión del estado mediante Redux Toolkit.
- Backend desarrollado con Node.js y Express.
- API REST y mecanismos de autenticación JWT.
- Base de datos MariaDB.
- ORM Prisma y migraciones de base de datos.
- Procedimientos almacenados y vistas SQL.
- Servicios administrados mediante Docker Compose.
- Servidor nginx y comunicación entre frontend y backend.
- Integración continua mediante GitHub Actions.
- Servicio SMTP para recuperación de contraseñas.

Las versiones exactas de las dependencias se registrarán a partir de los archivos package.json, archivos de bloqueo y configuración de contenedores de la versión evaluada.

### 4.3. Exclusiones y limitaciones

- No se realizarán pruebas sobre establecimientos reales ni datos personales reales.
- No se utilizarán credenciales de producción.
- No se ejecutarán pruebas destructivas sobre ambientes compartidos.
- Las funcionalidades no implementadas se registrarán como pendientes de implementación, indicando el requisito afectado.
- Las pruebas de cumplimiento legal de facturación electrónica no constituirán una certificación oficial de la DIAN.
- La integración IoT no forma parte del alcance obligatorio de este plan, salvo que posteriormente sea incorporada al proyecto.

## 5. Trazabilidad de requisitos funcionales

Los casos de prueba se diseñarán tomando como referencia los requisitos funcionales y las historias de usuario existentes.

| Requisito | Historias de usuario | Aspectos principales por validar |
| --- | --- | --- |
| RF-001 — Gestión de usuarios | HU-001 a HU-005 | Registro, autenticación, permisos, desactivación y recuperación de contraseña. |
| RF-002 — Gestión de pedidos en salón | HU-006 a HU-010 | Registro de pedidos, modificaciones, estados, cierre de cuentas y pedidos activos. |
| RF-003 — Facturación automatizada | HU-011 a HU-014 | Generación de facturas, métodos de pago, historial y requisitos de facturación electrónica. |
| RF-004 — Control de inventario | HU-015 a HU-018 | Descuento automático, entradas, alertas e historial de movimientos. |
| RF-005 — Gestión de pedidos a domicilio | HU-019 a HU-022 | Registro, seguimiento, asignación y actualización de domicilios. |
| RF-006 — Gestión de menú | HU-023 a HU-026 | Registro, edición, disponibilidad y categorías de productos. |
| RF-007 — Reportes e inteligencia artificial | HU-027 a HU-030 | Reportes de ventas, sugerencias de compra, desempeño del personal y análisis de demanda. |

Las funcionalidades incorporadas posteriormente, como la gestión multisede, la división de cuentas y el cierre operativo, tendrán casos de prueba adicionales.

Cuando una funcionalidad no cuente con un requisito o historia de usuario formalmente asignada, se registrará esta situación como una observación de trazabilidad.

## 6. Requisitos no funcionales y criterios de evaluación

### 6.1. RNF-001 — Seguridad

| ID | Criterio de aceptación | Método de verificación |
| --- | --- | --- |
| RNF-001.1 | Contraseñas almacenadas mediante bcrypt con factor de costo mínimo de 12. | Revisión de código y registros de prueba. |
| RNF-001.2 | Secreto JWT aleatorio de mínimo 32 caracteres, definido mediante variables de entorno y no versionado. | Revisión segura de configuración. |
| RNF-001.3 | Máximo 10 solicitudes de autenticación por IP durante 15 minutos. | Prueba controlada de rate limiting. |
| RNF-001.4 | Uso de HTTPS con TLS 1.2 o superior en producción. | Verificación del despliegue correspondiente. |
| RNF-001.5 | Configuración de cabeceras CSP, HSTS y X-Frame-Options. | Inspección de respuestas HTTP. |
| RNF-001.6 | CORS limitado a orígenes autorizados. | Revisión de configuración y pruebas HTTP. |
| RNF-001.7 | Consultas mediante Prisma Client, sin interpolación insegura de SQL. | Revisión estática del acceso a datos. |
| RNF-001.8 | Registro estructurado de eventos de seguridad. | Inspección de logs y auditoría. |

Se tomarán como referencia los controles de seguridad establecidos en el requisito RNF-001 y OWASP Top 10 2021.

Los eventos de auditoría que deberán verificarse son:

- LOGIN_SUCCESS.
- LOGIN_FAILED.
- PASSWORD_CHANGED.
- PASSWORD_RESET_REQUESTED.
- RATE_LIMIT_HIT.
- INVENTARIO_AJUSTE_MANUAL.

También se comprobará que un usuario no pueda acceder a funcionalidades restringidas ni consultar información de establecimientos no autorizados.

Las pruebas de seguridad se limitarán al ambiente de pruebas autorizado.

### 6.2. RNF-002 — Rendimiento

| ID | Criterio de aceptación | Método de verificación |
| --- | --- | --- |
| RNF-002.1 | Inicio de sesión en menos de 500 ms en condiciones normales. | Medición del endpoint de autenticación. |
| RNF-002.2 | Pool de conexiones MariaDB entre 2 y 10 conexiones concurrentes. | Revisión de configuración y monitoreo. |
| RNF-002.3 | Carga inicial del frontend inferior a 3 segundos con una conexión de 10 Mbps. | Herramientas de rendimiento del navegador. |
| RNF-002.4 | Predicciones de demanda en menos de 2 segundos por consulta. | Medición del servicio de predicción cuando esté disponible. |

Las mediciones deberán registrar:

- Fecha de ejecución.
- Versión del sistema.
- Configuración del ambiente.
- Condiciones de red.
- Número de solicitudes.
- Tiempos de respuesta obtenidos.
- Resultado frente al criterio establecido.

Las pruebas de autenticación deberán considerar las restricciones del rate limiter para no confundir respuestas HTTP 429 con mediciones válidas del inicio de sesión.

### 6.3. RNF-003 — Mantenibilidad

| ID | Criterio de aceptación | Método de verificación |
| --- | --- | --- |
| RNF-003.1 | Cobertura mínima del 80 % en la lógica de negocio crítica. | Reporte de cobertura de controladores y servicios. |
| RNF-003.2 | ESLint sin errores en frontend y backend. | Ejecución de los comandos lint. |
| RNF-003.3 | Tipado explícito en TypeScript cuando corresponda. | Revisión estática del frontend. |
| RNF-003.4 | Documentación de los archivos y módulos relevantes. | Inspección del código fuente. |

La cantidad de pruebas existentes no se considerará equivalente al porcentaje de cobertura.

La cobertura deberá obtenerse mediante una herramienta compatible con el entorno de pruebas del proyecto.

### 6.4. RNF-004 — Usabilidad y accesibilidad

| ID | Criterio de aceptación | Método de verificación |
| --- | --- | --- |
| RNF-004.1 | Disponibilidad de modo claro y oscuro mediante un selector visible. | Prueba manual de interfaz. |
| RNF-004.2 | Contraste mínimo de 4.5:1 para texto normal, conforme a WCAG 2.1 AA. | Lighthouse, axe o herramienta equivalente. |
| RNF-004.3 | Formularios operables completamente mediante teclado. | Navegación manual sin ratón. |
| RNF-004.4 | Mensajes de error anunciados mediante role="alert". | Inspección HTML y lector de pantalla. |
| RNF-004.5 | Funcionamiento responsive entre 320 y 1920 píxeles. | Pruebas mediante tamaños de pantalla controlados. |

Se evaluarán adicionalmente la consistencia visual, legibilidad, alineación de componentes y funcionamiento de ventanas modales.

### 6.5. RNF-005 — Cumplimiento legal y facturación

| ID | Criterio de aceptación | Método de verificación |
| --- | --- | --- |
| RNF-005.1 | Generación del CUFE conforme al requisito de facturación electrónica. | Revisión de la implementación y validación del identificador. |
| RNF-005.2 | Almacenamiento de facturas en formato XML. | Verificación de archivos y registros asociados. |
| RNF-005.3 | Presentación de importes en COP con formato correcto. | Inspección de facturas e interfaz. |
| RNF-005.4 | Registro trazable de los métodos de pago mixtos establecidos en el requisito. | Pruebas de cobro y consulta de registros. |

Se verificará la existencia de las funcionalidades exigidas por el requisito, sin asumir que se encuentran completamente implementadas.

Las diferencias entre los métodos de pago disponibles y los establecidos en el RNF deberán documentarse.

## 7. Estrategia y niveles de pruebas

### 7.1. Pruebas unitarias

Permiten comprobar funciones individuales y reglas de negocio de manera aislada.

Se evaluarán principalmente:

- Validación de campos.
- Cálculos de facturación.
- Validación de identificadores.
- Reglas de autorización.
- Filtros de establecimientos.
- Reglas del servicio de salón.
- Conversión y validación de cantidades.

Se ejecutarán y documentarán al menos 20 casos unitarios, diferenciándolos de las pruebas de integración.

### 7.2. Pruebas de integración

Evalúan la comunicación entre los componentes del backend, la API y la base de datos.

Se comprobarán:

- Persistencia de registros.
- Integridad referencial.
- Aplicación de migraciones.
- Transacciones de negocio.
- Aislamiento entre sedes.
- Consistencia del inventario.
- Operaciones de caja y facturación.
- Flujos de cocina y salón.

### 7.3. Pruebas funcionales

Verifican el comportamiento del sistema frente a los requisitos funcionales e historias de usuario.

Cada caso deberá contar con condiciones iniciales, datos de entrada, pasos de ejecución y resultados esperados.

### 7.4. Pruebas de sistema y E2E

Evalúan flujos completos desde la interfaz hasta la base de datos.

Ejemplo de flujo principal:

1. Iniciar sesión como mesero.
2. Seleccionar una mesa disponible.
3. Registrar una comanda.
4. Enviar los productos a cocina.
5. Actualizar los estados de preparación.
6. Marcar los productos como servidos.
7. Enviar la cuenta a caja.
8. Registrar el pago.
9. Verificar la factura y los movimientos correspondientes.
10. Comprobar el estado final de la mesa y del inventario.

### 7.5. Pruebas negativas

Comprueban que el sistema controle correctamente entradas inválidas y operaciones no permitidas.

Se incluirán escenarios como:

- Credenciales incorrectas.
- Campos obligatorios vacíos.
- Identificadores inválidos.
- Cantidades negativas.
- Stock insuficiente.
- Acceso sin permisos.
- Operaciones sobre establecimientos ajenos.
- Pagos inferiores al importe requerido.
- Intentos de duplicar registros.
- Modificación de facturas pagadas.

### 7.6. Pruebas de regresión

Se ejecutarán después de aplicar correcciones o incorporar nuevas funcionalidades.

Su finalidad será verificar que los cambios no afecten procesos que funcionaban correctamente.

Se incluirá una verificación específica de los endpoints afectados por el issue #248, relacionado con diferencias entre el esquema Prisma y las columnas de la base de datos.

La documentación existente del cierre de dicho issue será utilizada como referencia, pero su comprobación independiente dependerá de los resultados de las pruebas.

### 7.7. Pruebas no funcionales

Comprenden las pruebas de seguridad, rendimiento, mantenibilidad, accesibilidad y cumplimiento de los criterios de facturación definidos en la sección 6.

## 8. Inventario de pruebas existentes

El repositorio contiene pruebas automatizadas del backend y pruebas de interfaz mediante Playwright.

### 8.1. Backend

| Archivo | Área de evaluación |
| --- | --- |
| aislamiento-rutas.test.js | Aislamiento y control de rutas. |
| aislamiento-sedes.integration.test.js | Integración y aislamiento entre sedes. |
| cierre-total.integration.test.js | Cierre operativo del establecimiento. |
| cocina-caja.integration.test.js | Integración de cocina y caja. |
| conteo-inventario.integration.test.js | Conteos y ajustes de inventario. |
| correo.integration.test.js | Validación de correo electrónico. |
| establecimiento.integration.test.js | Integración de establecimientos. |
| establecimiento.test.js | Reglas de establecimientos. |
| facturacion.test.js | Reglas y cálculos de facturación. |
| health.test.js | Disponibilidad del servicio. |
| jornada.integration.test.js | Jornada operativa. |
| multisede.test.js | Gestión multisede. |
| panel-gerente.integration.test.js | Operaciones del gerente. |
| salon.integration.test.js | Integración del servicio de salón. |
| salon.test.js | Reglas del servicio de salón. |
| unidades-inventario.integration.test.js | Unidades de inventario. |
| validation.test.js | Validaciones generales. |

La clasificación definitiva de los casos se realizará revisando su implementación y dependencias.

La existencia de un archivo de pruebas no implica que sus casos hayan sido ejecutados o aprobados.

### 8.2. Frontend

| Archivo | Área de evaluación |
| --- | --- |
| consistencia-visual.spec.ts | Consistencia visual. |
| establecimiento.spec.ts | Gestión de establecimientos. |
| jornada.spec.ts | Jornada operativa. |
| salon.spec.ts | Servicio de salón. |

Las pruebas se encuentran en la carpeta frontend/e2e.

### 8.3. Control de ejecución

Durante la ejecución se distinguirán:

- Casos ejecutados y aprobados.
- Casos ejecutados y fallidos.
- Casos omitidos por configuración.
- Casos bloqueados por dependencias.
- Casos pendientes de ejecución.

Las pruebas omitidas no se contabilizarán como aprobadas.

## 9. Ambiente de pruebas

Las pruebas deberán ejecutarse en un ambiente independiente del entorno de desarrollo utilizado por los integrantes del equipo.

| Componente | Configuración prevista |
| --- | --- |
| Código fuente | Versión identificada mediante rama y commit. |
| Ambiente de trabajo | GitHub Codespaces o entorno local autorizado. |
| Backend | Instancia exclusiva para pruebas. |
| Frontend | Instancia conectada al backend de pruebas. |
| Base de datos | MariaDB con base y volumen exclusivos para pruebas. |
| Variables de entorno | Configuración independiente del ambiente de desarrollo. |
| Usuarios | Cuentas ficticias con los roles correspondientes. |
| Datos | Productos, pedidos y establecimientos de prueba. |
| Correo | Servicio SMTP de pruebas o mecanismo controlado. |
| Evidencias | Registros y capturas asociados a cada ejecución. |

Se comprobará el aislamiento efectivo de servicios, redes, puertos, bases de datos y volúmenes antes de realizar pruebas de integración.

No se eliminarán bases de datos ni volúmenes compartidos.

La configuración definitiva se registrará en el documento 02-ambiente-pruebas.md.

## 10. Herramientas

| Herramienta | Finalidad | Estado |
| --- | --- | --- |
| GitHub | Control de versiones y gestión de defectos. | Existente. |
| GitHub Codespaces | Ambiente de trabajo. | Existente. |
| Node.js Test Runner | Ejecución de pruebas automatizadas del backend. | Existente. |
| Playwright | Pruebas E2E y visuales. | Existente. |
| ESLint | Análisis estático del código. | Existente. |
| Prisma | Verificación de modelos y migraciones. | Existente. |
| MariaDB | Pruebas de persistencia e integridad de datos. | Existente. |
| Docker Compose | Administración de servicios y ambientes. | Existente. |
| GitHub Actions | Integración continua. | Existente. |
| Herramientas de desarrollo del navegador | Inspección de solicitudes, errores y rendimiento. | Prevista. |
| Postman o cliente HTTP equivalente | Pruebas manuales de endpoints. | Propuesta. |
| Lighthouse o axe | Auditoría de accesibilidad. | Propuesta. |
| k6 o herramienta equivalente | Pruebas de rendimiento controladas. | Propuesta. |

Las herramientas propuestas se utilizarán únicamente si son necesarias y están disponibles en el ambiente de pruebas.

## 11. Procedimiento de ejecución

| Fase | Actividad | Resultado esperado |
| --- | --- | --- |
| Fase 1 | Revisión de requisitos, historias de usuario y documentación técnica. | Alcance y criterios identificados. |
| Fase 2 | Diseño y clasificación de casos de prueba. | Casos documentados. |
| Fase 3 | Configuración del ambiente independiente. | Ambiente verificado. |
| Fase 4 | Ejecución de pruebas unitarias. | Informe de mínimo 20 casos. |
| Fase 5 | Ejecución de pruebas de integración. | Resultados de API y base de datos. |
| Fase 6 | Ejecución de pruebas funcionales y E2E. | Resultados de los flujos de negocio. |
| Fase 7 | Ejecución de pruebas no funcionales. | Mediciones y observaciones. |
| Fase 8 | Registro de defectos y evidencias. | Matriz de defectos actualizada. |
| Fase 9 | Verificación de correcciones y regresión. | Resultados de reevaluación. |
| Fase 10 | Elaboración del informe final. | Consolidación del estado de calidad. |

La planificación se realizará por fases, sin establecer fechas de ejecución definitivas hasta confirmar la disponibilidad del ambiente y del equipo.

## 12. Priorización de pruebas

| Prioridad | Módulos o escenarios |
| --- | --- |
| Alta | Autenticación, permisos, aislamiento multisede, pedidos, facturación, división de cuentas, caja e inventario. |
| Media | Cocina, proveedores, clientes, domicilios, reportes y cierre operativo. |
| Baja | Ajustes visuales menores y funcionalidades opcionales que no comprometan procesos críticos. |

La prioridad podrá modificarse según el impacto de los defectos identificados y las necesidades del proyecto.

## 13. Criterios de entrada

Para iniciar la ejecución de pruebas se requiere:

- Disponer del código fuente de la versión evaluada.
- Identificar la rama y el commit correspondiente.
- Contar con los requisitos e historias de usuario disponibles.
- Tener configurado un ambiente independiente de pruebas.
- Verificar la disponibilidad del frontend, backend y base de datos.
- Contar con usuarios y datos ficticios.
- Identificar los casos de prueba que serán ejecutados.
- Disponer de autorización para las pruebas que involucren seguridad o modificaciones de datos.

## 14. Criterios de salida

El proceso de pruebas podrá considerarse finalizado cuando:

- Se hayan ejecutado y documentado al menos 20 casos unitarios.
- Los casos críticos hayan sido evaluados.
- Se hayan registrado los resultados aprobados, fallidos, bloqueados y omitidos.
- Se disponga de evidencias verificables.
- No existan defectos críticos abiertos que impidan la entrega.
- Los defectos restantes se encuentren documentados y priorizados.
- Se hayan verificado las correcciones disponibles.
- Se hayan registrado los requisitos no evaluados o incumplidos.
- Se haya elaborado el informe final de ejecución.

La finalización del proceso de pruebas no implica automáticamente que todos los requisitos se encuentren cumplidos.

## 15. Formato de casos de prueba

Cada caso de prueba deberá contener los siguientes campos:

| Campo | Descripción |
| --- | --- |
| ID | Identificador único del caso. |
| Título | Nombre de la funcionalidad evaluada. |
| Módulo | Componente del sistema asociado. |
| Requisito | RF, RNF o historia de usuario relacionada. |
| Tipo de prueba | Unitaria, integración, funcional, E2E u otra. |
| Prioridad | Alta, media o baja. |
| Precondiciones | Condiciones necesarias para ejecutar la prueba. |
| Datos de entrada | Información utilizada durante la ejecución. |
| Pasos | Procedimiento de ejecución. |
| Resultado esperado | Comportamiento correcto del sistema. |
| Resultado obtenido | Comportamiento observado durante la ejecución. |
| Estado | Resultado de la evaluación. |
| Evidencia | Captura, registro o reporte asociado. |
| Fecha | Fecha de ejecución. |
| Versión | Rama y commit evaluados. |
| Responsable | Persona encargada de ejecutar la prueba. |

Se utilizarán identificadores como:

- CP-UNIT-001: prueba unitaria.
- CP-INT-001: prueba de integración.
- CP-FUN-001: prueba funcional.
- CP-E2E-001: prueba de extremo a extremo.
- CP-SEG-001: prueba de seguridad.
- CP-REN-001: prueba de rendimiento.
- CP-ACC-001: prueba de accesibilidad.

## 16. Estados de los casos de prueba

| Estado | Descripción |
| --- | --- |
| Pendiente | El caso todavía no ha sido ejecutado. |
| Aprobado | El resultado obtenido coincide con el esperado. |
| Fallido | El resultado obtenido no coincide con el esperado. |
| Bloqueado | Una condición externa impide ejecutar la prueba. |
| Omitido | El ejecutor de pruebas no ejecutó el caso debido a su configuración. |
| No aplica | El caso no corresponde al alcance aprobado de la versión evaluada. |

Los requisitos obligatorios pendientes de implementación no se considerarán automáticamente como no aplicables.

## 17. Gestión y clasificación de defectos

### 17.1. Severidad

| Severidad | Descripción |
| --- | --- |
| Crítica | Impide la operación del sistema, compromete gravemente los datos o genera pérdidas económicas importantes. |
| Alta | Afecta una funcionalidad esencial sin una alternativa operativa adecuada. |
| Media | Afecta parcialmente una funcionalidad, pero permite continuar operando. |
| Baja | Corresponde a problemas menores o visuales que no impiden el funcionamiento. |

### 17.2. Prioridad

| Prioridad | Descripción |
| --- | --- |
| Alta | Requiere atención prioritaria antes de la entrega. |
| Media | Debe corregirse dentro de una iteración planificada. |
| Baja | Puede programarse para una versión posterior. |

La severidad representa el impacto del defecto, mientras que la prioridad determina el orden de atención.

### 17.3. Estados de los defectos

- Pendiente de validación.
- Abierto.
- Asignado.
- En corrección.
- Pendiente de nueva prueba.
- Cerrado.
- Reabierto.
- Rechazado o no reproducible.
- Diferido.

### 17.4. Formato de registro

| Campo | Descripción |
| --- | --- |
| ID | Identificador único del defecto. |
| Título | Descripción breve del problema. |
| Módulo | Componente afectado. |
| Caso de prueba | Caso que permitió identificar el defecto. |
| Descripción | Explicación del comportamiento observado. |
| Pasos de reproducción | Procedimiento para reproducir el problema. |
| Resultado esperado | Comportamiento correcto. |
| Resultado obtenido | Comportamiento incorrecto observado. |
| Severidad | Impacto del defecto. |
| Prioridad | Orden de atención. |
| Estado | Situación actual del defecto. |
| Evidencia | Captura, log o registro correspondiente. |
| Commit | Versión en la que fue identificado. |
| Responsable | Integrante encargado de la corrección. |
| Issue | Enlace al registro correspondiente en GitHub. |

Los hallazgos identificados mediante revisión estática se diferenciarán de los defectos reproducidos durante la ejecución.

## 18. Gestión de evidencias

Las evidencias deberán permitir comprobar los resultados registrados en los informes.

Se recopilarán:

- Capturas de la interfaz.
- Resultados de terminal.
- Reportes de pruebas automatizadas.
- Respuestas de la API.
- Registros de errores.
- Reportes de cobertura.
- Resultados de accesibilidad.
- Mediciones de rendimiento.
- Evidencias de pruebas de regresión.

Se propone almacenar las evidencias dentro de:

docs/testing/04-evidencias-pruebas/

La nomenclatura será:

ID-CASO_FECHA_DESCRIPCION.extension

Ejemplo:

CP-UNIT-001_2026-11-25_validacion-campos.png

No se incluirán contraseñas, tokens de sesión, secretos JWT, credenciales SMTP ni datos personales reales en las evidencias.

## 19. Métricas de calidad

| Métrica | Método de cálculo |
| --- | --- |
| Casos planificados | Total de casos definidos para la ejecución. |
| Casos ejecutados | Casos aprobados más casos fallidos. |
| Porcentaje de aprobación | Casos aprobados / casos ejecutados × 100. |
| Porcentaje de ejecución | Casos ejecutados / casos planificados × 100. |
| Casos bloqueados | Total de casos que no pudieron ejecutarse por una condición externa. |
| Casos omitidos | Total de casos excluidos por la configuración del ejecutor. |
| Defectos abiertos | Total de defectos confirmados que continúan pendientes. |
| Defectos cerrados | Total de defectos corregidos y verificados. |
| Cobertura de código | Porcentaje obtenido mediante una herramienta de cobertura. |

Cuando el denominador sea cero, la métrica correspondiente se registrará como no calculable.

No se registrarán porcentajes de aprobación ni cobertura sin evidencia de ejecución.

## 20. Riesgos y medidas de mitigación

| Riesgo | Impacto | Medida de mitigación |
| --- | --- | --- |
| Uso accidental de una base de datos compartida. | Alto | Verificar el aislamiento antes de ejecutar pruebas. |
| Cambios frecuentes en el código fuente. | Alto | Registrar el commit evaluado. |
| Diferencias entre el esquema Prisma y MariaDB. | Alto | Verificar migraciones y ejecutar pruebas de integración. |
| Inconsistencias en facturación y división de cuentas. | Alto | Priorizar pruebas de importes, pagos y transacciones. |
| Fallos de aislamiento entre establecimientos. | Alto | Ejecutar pruebas con usuarios y sedes diferentes. |
| Pruebas de integración omitidas por configuración. | Alto | Revisar variables y registrar casos omitidos. |
| Documentación desactualizada. | Medio | Comparar requisitos, código fuente y documentación de la API. |
| Dependencia de servicios externos. | Medio | Utilizar servicios controlados de pruebas. |
| Datos insuficientes para evaluar escenarios. | Medio | Preparar registros ficticios representativos. |
| Tiempo limitado para la entrega. | Alto | Priorizar los casos relacionados con procesos críticos. |

## 21. Responsabilidades del equipo

| Integrante | Rol | Responsabilidades |
| --- | --- | --- |
| César David Rueda Daza | Líder / Full Stack | Soporte técnico, revisión del backend, base de datos y corrección de defectos asignados. |
| Juan Felipe Bello Pérez | Frontend / IA | Revisión de interfaz, experiencia de usuario y corrección de defectos de los módulos asignados. |
| Kevin Duvan Bueno Melo | Tester / QA | Planificación, diseño, ejecución de pruebas, gestión de evidencias, registro de defectos y verificación de correcciones. |

Los resultados serán comunicados al equipo mediante GitHub Issues, informes de pruebas y revisiones de los cambios correspondientes.

## 22. Entregables del proceso QA

| Entregable | Ubicación prevista | Estado |
| --- | --- | --- |
| Plan general de pruebas | docs/testing/01-plan-general-pruebas.md | Elaborado, pendiente de revisión. |
| Ambiente de pruebas | docs/testing/02-ambiente-pruebas.md | Pendiente. |
| Informe de pruebas unitarias | docs/testing/03-informe-pruebas-unitarias.md | Pendiente. |
| Evidencias de ejecución | docs/testing/04-evidencias-pruebas/ | Pendiente. |
| Reporte de ejecución | docs/testing/05-reporte-ejecucion.md | Pendiente. |
| Matriz de defectos | docs/testing/06-matriz-defectos.md | Pendiente. |
| Actualización de documentación de pruebas | README.md | Pendiente. |

## 23. Documentos de referencia

- [README del proyecto](../../README.md).
- [Requisitos funcionales](../RFs/).
- [Requisitos no funcionales](../RNFs/).
- [Historias de usuario](../HUs/).
- [Documentación de la API](../api.md).
- [Modelo de datos](../modelo-de-datos.md).
- [Diagrama de clases](../diagrama-clases.md).
- [Diagrama de arquitectura](../diagrama-arquitectura.md).
- [Justificación de cierre del issue #248](../issue-248-cierre.md).
- [Plan de pruebas multisede](../plan-pruebas-multisede.md).
- [Servicio de salón](../servicio-de-salon.md).
- [Aislamiento de sedes](../aislamiento-sedes.md).
- [Documentación de inventario](../fase-4-inventario.md).
- [Esquema Prisma](../../backend/prisma/schema.prisma).
- [Migraciones de base de datos](../../backend/prisma/migrations/).
- [Pruebas del backend](../../backend/tests/).
- [Pruebas E2E del frontend](../../frontend/e2e/).
- [Configuración de integración continua](../../.github/workflows/ci.yml).
- [Configuración Docker Compose](../../docker-compose.yml).

## 24. Control de versiones

| Versión | Fecha | Responsable | Descripción |
| --- | --- | --- | --- |
| 1.0 | 25/11/2026 | Kevin Duvan Bueno Melo | Elaboración inicial del plan general de pruebas a partir del código fuente, requisitos y documentación técnica del proyecto. |

---

**RemiSoft — Aseguramiento de Calidad del Software (QA)**

Servicio Nacional de Aprendizaje — SENA

Análisis y Desarrollo de Software — Ficha 3311987
