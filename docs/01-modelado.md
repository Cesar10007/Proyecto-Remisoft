# Modelado del sistema — RemiSoft

> Documento de modelado: arquitectura, modelo entidad-relación, modelo de clases,
> diagrama de casos de uso y máquinas de estado.
> Cubre los criterios **1 (diagramas y modelos)** y **5 (diagrama de arquitectura)** de la checklist.
> Complementa a `02-casos-de-uso.md` (detalle de cada caso) y `03-diagramas-de-secuencia.md` (interacción entre capas).

## Cómo leer este documento

| Sección | Qué responde | Diagrama |
|---|---|---|
| 1 | ¿Cómo está desplegado el sistema? | Arquitectura de despliegue |
| 2 | ¿Cómo se organiza el backend por dentro? | Arquitectura de capas |
| 3 | ¿Cómo se guardan los datos? | MER por dominio (6 diagramas) + diccionario |
| 4 | ¿Cuáles son las clases del dominio? | Modelo de clases UML |
| 5 | ¿Quién puede hacer qué? | Casos de uso por actor |
| 6 | ¿Qué estados tiene un pedido? | Máquinas de estado del pedido y del ítem |

**Trazabilidad.** Todos los diagramas se construyeron leyendo el código de la rama `develop`:

- Entidades y claves: `backend/prisma/schema.prisma` (**46 modelos: 36 tablas de negocio + 10 tablas de infraestructura heredadas de Laravel**), `backend/prisma/migrations/` (16 migraciones) y `database/`.
- Capas y dependencias: `backend/src/{app.js,server.js,routes,controllers,services,middleware,utils}`.
- Estados: `backend/src/utils/salon.js` (`ESTADOS_EN_COCINA`, `ESTADOS_EN_MESA`, `CUENTA_ABIERTA`, `estadoSegunItems`) y `backend/src/controllers/cocina.controller.js`.
- Despliegue: `docker-compose.yml` (servicios `db`, `backend`, `frontend`) y los `Dockerfile` de cada carpeta.

Los diagramas se validaron con el renderizador de Mermaid antes de publicarse: si un diagrama tiene un error de sintaxis, el documento no se entrega.

---

## 1. Arquitectura de despliegue

```mermaid
flowchart LR
  subgraph USUARIO["Navegador del usuario"]
    SPA["SPA React 19 + Vite<br/>Redux Toolkit · React Router · axios"]
  end

  subgraph COMPOSE["docker compose"]
    NGX["Contenedor frontend<br/>Nginx sirviendo el build<br/>y redirigiendo /api al backend"]
    subgraph BE["Contenedor backend (Node 20)"]
      MW["middleware<br/>helmet · cors · rate-limit · JWT"]
      RT["routes<br/>29 grupos bajo /api"]
      CT["controllers"]
      SV["services"]
      PR["Prisma Client 7<br/>adapter-mariadb"]
    end
    DB[("MariaDB 11.4.4<br/>base remisoft<br/>volumen db_data")]
  end

  SMTP["SMTP Mailtrap<br/>nodemailer"]
  CI["GitHub Actions<br/>lint · tsc · build · pruebas"]

  SPA -->|"HTTP :80"| NGX
  NGX -->|"/api/* :3000"| MW
  MW --> RT --> CT --> SV --> PR --> DB
  SV -.->|"correos de registro y avisos"| SMTP
  CI -.->|"valida cada push y PR"| BE
```

**Decisiones que muestra el diagrama**

- El navegador habla con **un solo origen**: Nginx entrega el SPA y hace de proxy hacia el backend, por lo que no hay CORS en producción y no se expone la API directamente.
- El backend **no guarda estado de sesión**: el JWT viaja en la petición y `requireAuth` lo valida en cada ruta.
- El único servicio con volumen persistente es la base de datos; los contenedores de aplicación son desechables.
- El correo sale por SMTP externo (Mailtrap en desarrollo). Si el SMTP falla, el registro de usuarios se degrada, pero el resto del sistema sigue operando.

---

## 2. Arquitectura de capas del backend

```mermaid
flowchart TD
  R["routes/*.routes.js<br/>verbo + ruta + roles permitidos"]
  M["middleware<br/>requireAuth · requireRole · manejo de errores"]
  C["controllers/*.controller.js<br/>lee la petición, valida y arma la respuesta"]
  S["services/*.service.js<br/>reglas de negocio y transacciones"]
  U["utils/*.js<br/>reglas compartidas: IVA, estados,<br/>alcance por sede, redondeo"]
  P["Prisma Client"]
  V["prisma/migrations<br/>16 migraciones versionadas"]

  R --> M --> C --> S --> P
  C --> U
  S --> U
  V -.->|"define el esquema"| P
```

**Regla de dependencia:** las flechas apuntan siempre hacia dentro. `routes` no conoce Prisma; `controllers` no escriben SQL; `services` no leen `req` ni `res`. Esto es lo que permite que las pruebas de `services` corran sin levantar el servidor HTTP.

Distribución real de los 29 grupos de rutas por dominio:

| Dominio | Prefijo | Responsabilidad |
|---|---|---|
| Identidad | `/api/auth` | login, solicitud de registro, `me`, logout |
| Personal | `/api/usuarios` | alta y edición de empleados, roles, ocultamiento |
| Salón | `/api/salon` | mesas, carta, pedidos, rondas, cuenta |
| Cocina | `/api/cocina` | comandas, historial, avance de ítems |
| Cobro | `/api/cobro` | pendientes, cerrar y dividir cuenta, pagar partes |
| Domicilios | `/api/domicilios` | reparto y resumen del día |
| Inventario | `/api/inventario` | stock, alertas, ajustes |
| Compras | `/api/proveedores`, `/api/ordenes-compra` | proveedores y órdenes de compra |
| Analítica | `/api/reportes`, `/api/finanzas` | indicadores, exportación a Excel |
| Soporte | `/api/ia`, `/api/health`, `/api/monitoreo` | sugerencias, salud del servicio |

---

## 3. Modelo entidad-relación

El esquema completo son **36 tablas de negocio**. Para que el MER sea legible se divide en seis
dominios; las líneas punteadas indican relaciones que cruzan de un diagrama a otro.

### 3.1 Núcleo multisede: usuarios, roles y sedes

```mermaid
erDiagram
  restaurante ||--o{ usuario : "sede donde trabaja"
  restaurante ||--o{ usuario_restaurante : "sedes habilitadas"
  usuario ||--o{ usuario_restaurante : "puede operar en"
  rol ||--o{ usuario : "perfil del empleado"
  rol ||--o{ solicitud_registro : "rol solicitado"
  usuario ||--o{ solicitud_registro : "revisada por"
  usuario ||--o{ personal_oculto : "oculta a"
  usuario ||--o{ personal_oculto : "es ocultado por"
  restaurante ||--o{ actividad_sede : "registra actividad"

  restaurante {
    int id_restaurante PK
    string nombre
    string ciudad
    boolean activo
  }
  rol {
    int id_rol PK
    string nombre UK
  }
  usuario {
    int id_usuario PK
    string email UK
    string password_hash
    int id_rol FK
    int id_restaurante FK
    boolean activo
  }
  usuario_restaurante {
    int id_usuario PK
    int id_restaurante PK
  }
  solicitud_registro {
    int id_solicitud PK
    string email UK
    int id_rol_solicitado FK
    int revisado_por FK
    string estado
  }
  personal_oculto {
    int id_actor PK
    int id_usuario PK
  }
  actividad_sede {
    int id_evento PK
    int id_restaurante FK
    string area
    string accion
    datetime fecha
  }
```

Los seis roles del sistema viven en la tabla `rol`: `SUPERADMIN`, `GERENTE`, `CAJERO`,
`MESERO`, `COCINERO` y `REPARTIDOR` (el rol 6 se agregó en la migración
`20261121120000_rol_cocinero`). `usuario_restaurante` es la tabla puente que habilita a un
empleado en varias sedes; `usuario.id_restaurante` es su sede por defecto.

### 3.2 Salón, pedidos y detalle

```mermaid
erDiagram
  restaurante ||--o{ mesa : "tiene mesas"
  mesa ||--o| mesa_atencion : "atención abierta"
  usuario ||--o{ mesa_atencion : "atiende como mesero"
  usuario ||--o{ pedido : "toma como mesero"
  Cliente ||--o{ pedido : "pide"
  mesa_atencion ||--o{ pedido : "acumula pedidos"
  pedido ||--o{ Detalle_pedido : "contiene"
  Producto ||--o{ Detalle_pedido : "se pide en"

  mesa {
    int id_mesa PK
    int numero
    int id_restaurante FK
    string estado
    int capacidad
  }
  mesa_atencion {
    int id_atencion PK
    int numero FK
    int id_restaurante FK
    int id_mesero FK
    string estado
    datetime apertura
  }
  pedido {
    int id_pedido PK
    int id_restaurante FK
    int id_cliente FK
    int id_mesero FK
    string estado
    string tipo
    decimal total
    datetime creado_en
  }
  Detalle_pedido {
    int id_detalle PK
    int id_pedido FK
    int id_producto FK
    int cantidad
    decimal precio_unitario
    string estado_item
    string notas
  }
  Cliente {
    int id_cliente PK
    int id_restaurante FK
    string Email UK
    string nombre
    string telefono
  }
```

Notas de diseño:

- `mesa` se identifica por la pareja `(numero, id_restaurante)`, así que el número de mesa
  puede repetirse entre sedes. `mesa_atencion` reutiliza esa llave compuesta.
- El estado del pedido **no se edita a mano**: se deriva de los estados de sus ítems
  (`estadoSegunItems` en `backend/src/utils/salon.js`). Ver la máquina de estados en la sección 6.
- `Detalle_pedido.estado_item` es el estado del plato, el que ve la cocina.

### 3.3 Cobro, facturación y caja

```mermaid
erDiagram
  pedido ||--o| Factura : "genera"
  pedido ||--o| division_cuenta : "se divide en"
  division_cuenta ||--o{ parte_cuenta : "tiene partes"
  parte_cuenta ||--o{ detalle_parte_cuenta : "agrupa ítems"
  Detalle_pedido ||--o{ detalle_parte_cuenta : "se cobra en"
  Factura ||--o{ Factura_item : "detalla"
  Detalle_pedido ||--o{ Factura_item : "respalda"
  Factura ||--o{ pago : "se paga con"
  parte_cuenta ||--o{ pago : "se paga con"
  caja ||--o{ turno_caja : "abre turnos"
  turno_caja ||--o{ pago : "registra"
  turno_caja ||--o{ flujo_caja : "mueve efectivo"
  pago ||--o| flujo_caja : "genera movimiento"

  Factura {
    int id_factura PK
    int id_pedido FK
    decimal subtotal
    decimal iva
    decimal total
    decimal tasa_iva
    string estado
  }
  Factura_item {
    int id_factura PK
    int id_detalle_pedido PK
    decimal valor
  }
  division_cuenta {
    int id_division PK
    int id_pedido FK
    datetime creada_en
  }
  parte_cuenta {
    int id_parte PK
    int id_division FK
    int numero
    decimal total
    string estado
  }
  detalle_parte_cuenta {
    int id_parte PK
    int id_detalle PK
  }
  pago {
    int id_pago PK
    int id_factura FK
    int id_parte FK
    int id_usuario_cajero FK
    int id_turno FK
    string metodo
    decimal monto
    string estado
  }
  caja {
    int id_caja PK
    int id_restaurante FK
    string nombre
  }
  turno_caja {
    int id_turno PK
    int id_caja FK
    int id_usuario_cajero FK
    datetime apertura
    datetime cierre
    decimal saldo_inicial
    decimal saldo_final
  }
  flujo_caja {
    int id_flujo PK
    int id_turno FK
    int id_pago FK
    string tipo
    decimal monto
    datetime fecha
  }
```

Reglas que el MER hace evidentes:

- Una cuenta se cierra de dos maneras excluyentes: **factura completa** (`Factura` 1:1 con `pedido`)
  o **dividida en partes** (`division_cuenta` 1:1 con `pedido`, con N `parte_cuenta`).
- Un `pago` cuelga de la factura y, si la cuenta se dividió, también de una parte. El índice
  `pago_ibfk_parte` permite saber qué parte quedó saldada.
- `Factura.tasa_iva` guarda la tasa aplicada en el momento del cobro (hoy 19 %), de modo que un
  cambio futuro de IVA no reescribe el histórico.

### 3.4 Inventario, recetas y compras

```mermaid
erDiagram
  restaurante ||--o{ Ingrediente : "almacena"
  restaurante ||--o{ lote_ingrediente : "lotes por sede"
  Ingrediente ||--o{ lote_ingrediente : "se compra en lotes"
  Ingrediente ||--o{ inventario_mov : "mueve stock"
  lote_ingrediente ||--o{ inventario_mov : "afecta lote"
  usuario ||--o{ inventario_mov : "registra"
  Ingrediente ||--o{ Receta : "compone"
  Producto ||--o{ Receta : "usa"
  restaurante ||--o{ categoria_productos : "agrupa"
  categoria_productos ||--o{ Producto : "clasifica"
  restaurante ||--o{ Producto : "ofrece"
  proveedor ||--o{ proveedor_ingrediente : "surte"
  Ingrediente ||--o{ proveedor_ingrediente : "es surtido por"
  proveedor ||--o{ orden_compra : "recibe"
  usuario ||--o{ orden_compra : "autoriza"
  orden_compra ||--o{ detalle_orden_compra : "contiene"
  Ingrediente ||--o{ detalle_orden_compra : "se pide"

  Ingrediente {
    int id_ingrediente PK
    int id_restaurante FK
    string nombre
    string unidad
    decimal stock_actual
    decimal stock_minimo
  }
  Producto {
    int id_producto PK
    int id_restaurante FK
    int id_categoria FK
    string Nombre
    decimal Precio
    boolean activo
  }
  categoria_productos {
    int id_categoria PK
    int id_restaurante FK
    string nombre
  }
  Receta {
    int id_receta PK
    int id_producto FK
    int id_ingrediente FK
    decimal cantidad
  }
  lote_ingrediente {
    int id_lote PK
    int id_restaurante FK
    int id_ingrediente FK
    string numero_lote
    decimal cantidad
    date vence_en
  }
  inventario_mov {
    int id_movimiento PK
    int id_ingrediente FK
    int id_usuario FK
    int id_lote FK
    string tipo
    decimal cantidad
    datetime fecha
  }
  proveedor {
    int id_proveedor PK
    int id_restaurante FK
    string nombre
    string contacto
  }
  proveedor_ingrediente {
    int id_proveedor PK
    int id_ingrediente PK
    decimal precio
  }
  orden_compra {
    int id_orden_compra PK
    int id_restaurante FK
    int id_proveedor FK
    int id_usuario FK
    string estado
    datetime creada_en
  }
  detalle_orden_compra {
    int id_detalle_compra PK
    int id_orden_compra FK
    int id_ingrediente FK
    decimal cantidad
    decimal precio_unitario
  }
```

El descuento de stock ocurre **dentro de la transacción del pedido**: `salon.service.js` llama a
`calcularRequerimientos` y `bloquearIngredientes` antes de confirmar, y al anular un pedido devuelve
exactamente lo descontado comparando con los movimientos reales, no con una receta reconstruida.

### 3.5 Domicilios

```mermaid
erDiagram
  pedido ||--o| domicilio : "se despacha como"
  usuario ||--o{ domicilio : "reparte"
  Cliente ||--o{ pedido : "pide a domicilio"

  domicilio {
    int id_domicilio PK
    int id_pedido FK
    int id_repartidor FK
    string direccion
    string telefono
    string estado
    decimal tarifa
    datetime asignado_en
    datetime entregado_en
  }
```

`id_repartidor` apunta a `usuario.id_usuario`: el reparto lo hace personal con rol `REPARTIDOR`,
no una entidad aparte.

### 3.6 Módulo de sugerencias (IA)

```mermaid
erDiagram
  restaurante ||--o{ IA : "consulta"
  IA ||--o{ IA_PRODUCTO : "sugiere"
  Producto ||--o{ IA_PRODUCTO : "es sugerido"
  IA ||--o{ IA_INGREDIENTE : "considera"
  Ingrediente ||--o{ IA_INGREDIENTE : "se considera"

  IA {
    int id_IA PK
    int id_restaurante FK
    string tipo
    string pregunta
    text respuesta
    datetime creada_en
  }
  IA_PRODUCTO {
    int id_IA_producto PK
    int id_IA FK
    int id_producto FK
    decimal puntaje
  }
  IA_INGREDIENTE {
    int id_IA_ingrediente PK
    int id_IA FK
    int id_ingrediente FK
    decimal puntaje
  }
```

### 3.7 Tablas de infraestructura (fuera del dominio)

No son parte del negocio y no se modelan como entidades: `cache`, `cache_locks`, `sessions`,
`jobs`, `job_batches`, `failed_jobs`, `migrations`, `password_reset_tokens`, `users` y
`personal_access_tokens`. Se conservan por compatibilidad con la primera versión del proyecto
escrita en Laravel; el backend actual usa Prisma y JWT, por lo que `sessions`,
`personal_access_tokens` y `users` están en desuso.

### 3.8 Diccionario de tablas

| # | Tabla | Módulo | Propósito |
|---|---|---|---|
| 1 | `restaurante` | Núcleo | Sede o sucursal; raíz del aislamiento multisede |
| 2 | `rol` | Núcleo | Los seis perfiles del sistema |
| 3 | `usuario` | Núcleo | Empleado o administrador, con rol y sede |
| 4 | `usuario_restaurante` | Núcleo | Puente de acceso a varias sedes |
| 5 | `solicitud_registro` | Núcleo | Alta de personal pendiente de aprobación |
| 6 | `personal_oculto` | Núcleo | Ocultamiento de un empleado por otro (moderación) |
| 7 | `actividad_sede` | Auditoría | Bitácora de eventos por sede |
| 8 | `contexto_actividad` | Auditoría | Contexto técnico del evento (conexión, área) |
| 9 | `Cliente` | Salón | Cliente de la sede, único por correo |
| 10 | `mesa` | Salón | Mesa física de la sede |
| 11 | `mesa_atencion` | Salón | Atención abierta de una mesa y su mesero |
| 12 | `pedido` | Salón | Pedido con su estado derivado y total |
| 13 | `Detalle_pedido` | Salón | Ítem del pedido con estado de cocina |
| 14 | `categoria_productos` | Carta | Agrupación del menú por sede |
| 15 | `Producto` | Carta | Plato o bebida que se vende |
| 16 | `Ingrediente` | Inventario | Insumo con stock y mínimo |
| 17 | `lote_ingrediente` | Inventario | Lote con vencimiento |
| 18 | `inventario_mov` | Inventario | Entrada, salida, ajuste o merma |
| 19 | `Receta` | Inventario | Insumos que consume cada producto |
| 20 | `proveedor` | Compras | Proveedor de la sede |
| 21 | `proveedor_ingrediente` | Compras | Catálogo de precios por proveedor |
| 22 | `orden_compra` | Compras | Orden emitida a un proveedor |
| 23 | `detalle_orden_compra` | Compras | Líneas de la orden |
| 24 | `Factura` | Cobro | Documento de venta del pedido |
| 25 | `Factura_item` | Cobro | Respaldo del ítem facturado |
| 26 | `division_cuenta` | Cobro | Cabecera de cuenta dividida |
| 27 | `parte_cuenta` | Cobro | Cada parte que paga un comensal |
| 28 | `detalle_parte_cuenta` | Cobro | Ítems asignados a cada parte |
| 29 | `pago` | Caja | Movimiento de cobro con método y cajero |
| 30 | `caja` | Caja | Caja física de la sede |
| 31 | `turno_caja` | Caja | Turno abierto por un cajero |
| 32 | `flujo_caja` | Caja | Ingresos y egresos del turno |
| 33 | `domicilio` | Domicilios | Despacho con repartidor y tarifa |
| 34 | `IA` | Sugerencias | Consulta registrada al módulo de sugerencias |
| 35 | `IA_PRODUCTO` | Sugerencias | Productos sugeridos por consulta |
| 36 | `IA_INGREDIENTE` | Sugerencias | Insumos considerados por consulta |

Además, la base incluye **7 vistas y 5 procedimientos almacenados** en `database/` para reportes
consolidados; se consultan desde `reportes` y `finanzas` y no se modelan aquí porque no aportan
reglas nuevas.

---

## 4. Modelo de clases del dominio

Vista de objetos del negocio, independiente del motor de base de datos. Las multiplicidades
describen lo que el sistema realmente permite.

```mermaid
classDiagram
  class Restaurante {
    +int id_restaurante
    +String nombre
    +String ciudad
    +boolean activo
    +empleados() Usuario[]
    +carta() Producto[]
  }

  class Rol {
    +int id_rol
    +String nombre
    +permisos() String[]
  }

  class Usuario {
    +int id_usuario
    +String email
    +String passwordHash
    +boolean activo
    +Rol rol
    +Restaurante sede
    +iniciarSesion(password) Token
    +sedesHabilitadas() Restaurante[]
  }

  class Mesa {
    +int numero
    +String estado
    +int capacidad
    +atencionAbierta() MesaAtencion
  }

  class MesaAtencion {
    +int id_atencion
    +Date apertura
    +String estado
    +pedidos() Pedido[]
    +cerrar()
  }

  class Pedido {
    +int id_pedido
    +String tipo
    +String estado
    +Decimal total
    +Date creadoEn
    +agregarItem(Producto, int) DetallePedido
    +estadoSegunItems() String
    +anular()
    +pasarACobro()
  }

  class DetallePedido {
    +int id_detalle
    +int cantidad
    +Decimal precioUnitario
    +String estadoItem
    +String notas
    +avanzar() String
    +cancelar()
  }

  class Producto {
    +int id_producto
    +String nombre
    +Decimal precio
    +boolean activo
    +receta() Receta[]
  }

  class Ingrediente {
    +int id_ingrediente
    +String nombre
    +String unidad
    +Decimal stockActual
    +Decimal stockMinimo
    +descontar(Decimal)
    +reponer(Decimal)
  }

  class Factura {
    +int id_factura
    +Decimal subtotal
    +Decimal iva
    +Decimal total
    +Decimal tasaIva
    +String estado
    +calcularTotales()
  }

  class ParteCuenta {
    +int id_parte
    +int numero
    +Decimal total
    +String estado
    +pagar(metodo) Pago
  }

  class DivisionCuenta {
    +int id_division
    +Date creadaEn
    +partes() ParteCuenta[]
    +saldoPendiente() Decimal
  }

  class Pago {
    +int id_pago
    +String metodo
    +Decimal monto
    +String estado
    +aprobar()
  }

  class Domicilio {
    +int id_domicilio
    +String direccion
    +Decimal tarifa
    +String estado
    +asignar(Usuario)
    +marcarEntregado()
  }

  Restaurante "1" --> "*" Usuario : emplea
  Restaurante "1" --> "*" Mesa : tiene
  Restaurante "1" --> "*" Producto : ofrece
  Rol "1" --> "*" Usuario : define
  Mesa "1" --> "0..1" MesaAtencion : atencionAbierta
  MesaAtencion "1" --> "*" Pedido : acumula
  Usuario "1" --> "*" Pedido : toma como mesero
  Pedido "1" --> "1..*" DetallePedido : contiene
  Producto "1" --> "*" DetallePedido : se pide en
  Producto "1" --> "*" Receta : compone
  Receta "*" --> "1" Ingrediente : consume
  Pedido "1" --> "0..1" Factura : genera
  Pedido "1" --> "0..1" DivisionCuenta : divide
  DivisionCuenta "1" --> "1..*" ParteCuenta : contiene
  ParteCuenta "1" --> "0..*" Pago : salda
  Factura "1" --> "1..*" Pago : salda
  Pedido "1" --> "0..1" Domicilio : despacha
  Usuario "1" --> "*" Domicilio : reparte
```

**Por qué estas clases y no las 36 tablas.** Las tablas de infraestructura no son objetos del
negocio; las de auditoría (`actividad_sede`, `inventario_mov`) son registros inmutables, no
entidades con comportamiento. Quedan como eventos, no como clases.

---

## 5. Casos de uso

### 5.1 Mapa general por actor

```mermaid
flowchart LR
  MES(["Mesero"])
  COC(["Cocinero"])
  CAJ(["Cajero"])
  GER(["Gerente"])
  SUP(["Superadmin"])
  REP(["Repartidor"])

  subgraph IDENT["Identidad"]
    CU01("CU-01 Iniciar sesion")
    CU02("CU-02 Solicitar registro")
    CU03("CU-03 Aprobar solicitud")
  end

  subgraph SALON["Salon"]
    CU04("CU-04 Abrir mesa")
    CU05("CU-05 Tomar pedido")
    CU06("CU-06 Agregar ronda")
    CU07("CU-07 Anular pedido")
    CU08("CU-08 Pedir la cuenta")
  end

  subgraph COZ["Cocina"]
    CU09("CU-09 Ver comandas")
    CU10("CU-10 Avanzar plato")
    CU11("CU-11 Consultar historial")
  end

  subgraph CAJA["Cobro y caja"]
    CU12("CU-12 Cerrar cuenta")
    CU13("CU-13 Dividir cuenta")
    CU14("CU-14 Registrar pago")
    CU15("CU-15 Abrir y cerrar turno")
  end

  subgraph ADMIN["Administracion"]
    CU16("CU-16 Gestionar personal")
    CU17("CU-17 Gestionar carta e inventario")
    CU18("CU-18 Ver finanzas y exportar Excel")
    CU19("CU-19 Consultar reportes")
  end

  subgraph DOM["Domicilios"]
    CU20("CU-20 Asignar domicilio")
    CU21("CU-21 Entregar pedido")
  end

  MES --- CU01
  MES --- CU04
  MES --- CU05
  MES --- CU06
  MES --- CU07
  MES --- CU08
  COC --- CU01
  COC --- CU09
  COC --- CU10
  COC --- CU11
  CAJ --- CU01
  CAJ --- CU12
  CAJ --- CU13
  CAJ --- CU14
  CAJ --- CU15
  REP --- CU01
  REP --- CU21
  GER --- CU01
  GER --- CU02
  GER --- CU03
  GER --- CU16
  GER --- CU17
  GER --- CU18
  GER --- CU19
  GER --- CU20
  SUP --- CU01
  SUP --- CU03
  SUP --- CU16
  SUP --- CU18
```

### 5.2 Caso de uso detallado: dividir la cuenta (el de mayor riesgo)

```mermaid
flowchart TD
  INI(["El cajero abre la cuenta pendiente"])
  A["Sistema lista los items facturables del pedido"]
  B{"Hay items ya cobrados?"}
  C["Sistema rechaza la division"]
  D["Cajero define numero de partes y reparte items"]
  E{"Cada item quedo en una sola parte?"}
  F["Sistema rechaza el reparto"]
  G["Sistema crea division_cuenta y sus parte_cuenta en una transaccion"]
  H["Cada parte se cobra por separado"]
  I{"Todas las partes pagadas?"}
  J["Pedido pasa a PAGADA y se libera la mesa"]
  K["Pedido queda en POR_COBRAR"]

  INI --> A --> B
  B -- "Si" --> C
  B -- "No" --> D --> E
  E -- "No" --> F
  E -- "Si" --> G --> H --> I
  I -- "Si" --> J
  I -- "No" --> K
```

---

## 6. Máquinas de estado

### 6.1 Estado del pedido

El estado del pedido es **derivado**: lo calcula `estadoSegunItems` a partir de los ítems, salvo en
el cobro (`POR_COBRAR`, `PAGADA`) y en la anulación (`CANCELADO`), que se fijan explícitamente.

```mermaid
stateDiagram-v2
  [*] --> ABIERTO : se toma el pedido
  ABIERTO --> EN_PREPARACION : algun item sale de PENDIENTE
  EN_PREPARACION --> LISTO : todos los items en LISTO o ENTREGADO
  LISTO --> ENTREGADO : todos los items ENTREGADO
  ABIERTO --> POR_COBRAR : el mesero la pide
  EN_PREPARACION --> POR_COBRAR
  LISTO --> POR_COBRAR
  ENTREGADO --> POR_COBRAR
  POR_COBRAR --> PAGADA : pago aprobado
  ABIERTO --> CANCELADO : anulacion sin consumo
  EN_PREPARACION --> CANCELADO : anulacion
  LISTO --> CANCELADO : anulacion
  ENTREGADO --> CANCELADO : anulacion
  PAGADA --> [*]
  CANCELADO --> [*]
```

Reglas asociadas a la máquina:

1. Solo se modifica un pedido cuyo estado esté en `ESTADOS_EN_MESA`
   (`ABIERTO`, `EN_PROCESO`, `EN_PREPARACION`, `LISTO`, `ENTREGADO`, `POR_COBRAR`).
2. Un pedido en `POR_COBRAR` ya no admite cambios de ítems; ahí empieza el cobro.
3. Si la factura está sellada (`consumoSellado`), el pedido no se toca.
4. La anulación solo procede si ningún ítem salió de `PENDIENTE` o si el consumo aún se puede revertir.

### 6.2 Estado del ítem (lo que ve la cocina)

```mermaid
stateDiagram-v2
  [*] --> PENDIENTE : se agrega al pedido
  PENDIENTE --> PREPARANDO : el cocinero lo toma
  PREPARANDO --> LISTO : termina la preparacion
  LISTO --> ENTREGADO : se entrega en mesa
  PENDIENTE --> CANCELADO : se anula antes de cocinar
  PREPARANDO --> CANCELADO : se anula durante la preparacion
  ENTREGADO --> [*]
  CANCELADO --> [*]
```

El avance es estrictamente secuencial: `PATCH /api/cocina/items/:id/avanzar` solo acepta el estado
inmediatamente siguiente. Si el plato cambió mientras el cocinero tenía la pantalla abierta, la API
responde **409** con el mensaje *"El plato cambió de estado. Actualiza la comanda."* y obliga a
refrescar. Es la protección contra dos cocineros avanzando el mismo plato.

### 6.3 Estado de la atención de mesa

```mermaid
stateDiagram-v2
  [*] --> ABIERTO : se ocupa la mesa
  ABIERTO --> ABIERTO : se agregan rondas
  ABIERTO --> CERRADO : se cobra y se libera
  ABIERTO --> CANCELADO : se anula la atencion
  CERRADO --> [*]
  CANCELADO --> [*]
```

---

## 7. Qué falta y qué queda fuera

| Tema | Estado | Motivo |
|---|---|---|
| MER físico con tipos SQL exactos | Fuera | Se genera con `prisma migrate` y vive en `backend/prisma/migrations/`; duplicarlo aquí lo desincronizaría |
| Diagrama de componentes por contenedor | Incluido (§1) | Cubre el criterio 5 |
| Diagrama de clases del frontend | Fuera | El frontend es funcional (componentes y `slices` de Redux); el modelado de dominio vive en el backend |
| Prototipo IoT | Pendiente | Criterio 6 de la checklist; no existe implementación que modelar |
| Modelo de datos del módulo IA | Incluido (§3.6) | Refleja las tres tablas reales, sin inventar un servicio externo |

**Convención de nombres.** Las tablas conservan los nombres originales del esquema
(`Detalle_pedido`, `Factura_item`, `categoria_productos`), que mezclan mayúsculas y minúsculas
porque provienen de la primera versión del proyecto. No se renombraron para no romper las
migraciones ni las consultas existentes; en el código se accede a ellas a través de Prisma, que
respeta esos nombres.
