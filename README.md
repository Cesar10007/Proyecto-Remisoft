![Banner RemiSoft](./docs/banner-remisoft.png)

# RemiSoft — Sistema Web Inteligente para Restaurantes

![Estado](https://img.shields.io/badge/estado-migración%20activa-e67e22)
![Versión](https://img.shields.io/badge/versión-0.1.9-2f80ed)
![Licencia](https://img.shields.io/badge/licencia-proyecto%20académico-27ae60)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)
![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Prisma-6c5ce7)
![Base de datos](https://img.shields.io/badge/base%20de%20datos-MariaDB-c0392b)
![Docker](https://img.shields.io/badge/entorno-Docker%20Compose-2496ED)

---

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** el stack se ejecuta con Docker Compose mediante tres servicios: MariaDB, backend Express + Prisma y frontend React compilado y servido por nginx. La autenticación JWT y los módulos administrativos funcionan sobre datos de desarrollo inicializados automáticamente.

> **Alcance:** el proyecto es académico y se encuentra en migración/refactorización. Algunas reglas de autorización, flujos funcionales y filtros multi-restaurante todavía requieren verificación módulo por módulo.

---

## Tabla de contenido

1. [Equipo de desarrollo](#equipo-de-desarrollo)
2. [Stack y arquitectura](#stack-y-arquitectura)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Levantar con Docker](#levantar-con-docker)
5. [Desarrollo local sin Docker](#desarrollo-local-sin-docker)
6. [Variables de entorno](#variables-de-entorno)
7. [Integración continua](#integración-continua)
8. [Correo y recuperación de contraseña](#correo-y-recuperación-de-contraseña)
9. [Autenticación y roles](#autenticación-y-roles)
10. [Modelo multi-restaurante](#modelo-multi-restaurante)
11. [Endpoints del backend](#endpoints-del-backend)
12. [Flujo de trabajo Git](#flujo-de-trabajo-git)
13. [Diseño y UI](#diseño-y-ui)
14. [Notas técnicas y pendientes](#notas-técnicas-y-pendientes)

---

## Equipo de desarrollo

| Nombre | Rol en el equipo | Rama principal |
|--------|------------------|----------------|
| César David Rueda Daza | Líder / Full Stack | Ramas por funcionalidad o nueva implementación |
| Juan Felipe Bello Pérez | Frontend / IA | `feat/ia-modulo` |
| Kevin Duvan Bueno Melo | Tester / QA | `feat/testing` |

---

## Stack y arquitectura

| Capa | Tecnología | Puerto publicado | Puerto interno |
|------|------------|------------------|----------------|
| Frontend producción | React 19.1.1 + Vite 7.0.6 + TypeScript 5.8.3 + nginx | 80 | 80 |
| Frontend desarrollo | Vite dev server | 5173 | 5173 |
| Backend | Node.js v20.19.4 + Express 5.1.0 | 3000 | 3000 |
| Base de datos | MariaDB 11.4.4 | No publicado por defecto | 3306 |
| ORM y migraciones | Prisma 7.9.1 | — | — |
| Orquestación | Docker Compose | — | — |
| Entorno recomendado | GitHub Codespaces | — | — |
| Auth | JWT | — | — |
| Estado global | Redux Toolkit 2 | — | — |

En el modo Docker, nginx es la entrada pública del frontend. El navegador consume la API mediante rutas relativas como `/api/auth/login`; nginx reenvía esas rutas al servicio interno `backend:3000`.

React no se comunica directamente con MariaDB. Todas las operaciones pasan por la API REST de Express.

### Dependencias principales

#### Frontend

| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.1.1 | Framework principal de UI |
| Vite | 7.0.6 | Servidor de desarrollo y build |
| TypeScript | 5.8.3 | Tipado estático |
| react-router-dom | 7.x | Rutas y navegación por rol |
| Axios | 1.x | Cliente HTTP para consumir la API |
| Redux Toolkit | 2.x | Estado global |
| react-redux | 9.x | Integración de Redux con React |

#### Backend

| Librería | Versión | Uso |
|----------|---------|-----|
| Node.js | v20.19.4 | Runtime del backend |
| Express | 5.1.0 | Framework backend y API REST |
| Prisma | 7.9.1 | ORM, cliente tipado y migraciones |
| mysql2 | 3.x | Conexión auxiliar con MariaDB |
| jsonwebtoken | 9.x | Emisión y validación de JWT |
| bcryptjs | 2.x | Hash y verificación de contraseñas |
| Nodemailer | 7.x | Recuperación de contraseña por correo |

### Base de datos

| Campo | Valor |
|-------|-------|
| Motor | MariaDB 11.4.4 |
| Base de datos | `remisoft` |
| Usuario por defecto | `remisoft` |
| Contraseña por defecto en Compose | `remisoft_pass` |
| Puerto interno | 3306 |

Los valores por defecto son únicamente para desarrollo. En un despliegue real deben reemplazarse mediante secretos o variables seguras.

---

## Estructura del proyecto

```text
Proyecto-Remisoft/
├── .devcontainer/
│   ├── devcontainer.json
│   ├── setup.sh
│   └── start.sh
├── .github/
│   └── workflows/
│       └── ci.yml
├── database/
│   ├── datos.sql
│   ├── init.sh
│   ├── legacy/
│   ├── vistas/
│   └── procedimientos/
├── docs/
│   ├── HUs/
│   ├── RFs/
│   ├── RNFs/
│   └── restricciones.md
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── api/
│       ├── store/
│       └── context/
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── prisma.config.ts
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   └── tests/
│       └── health.test.js
├── docker-compose.yml
└── README.md
```

---

## Levantar con Docker

### Requisitos

- Docker Engine o Docker Desktop.
- Docker Compose v2.
- Git.
- En GitHub Codespaces, Docker habilitado en el entorno.

### Arranque normal

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

Comprobar servicios:

```bash
docker compose ps
```

Estado esperado:

```text
db       Up (healthy)
backend  Up
frontend Up
```

Abrir frontend:

- Localmente: `http://localhost`.
- En Codespaces: abrir el puerto 80 desde la pestaña **Ports** de VS Code.

### Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Para detener servicios sin borrar datos:

```bash
docker compose down
```

### Instalación limpia

Para comprobar que el proyecto puede inicializarse desde cero:

```bash
docker compose down -v
docker compose up --build
```

> `-v` elimina el volumen `db_data` y borra los datos persistentes de MariaDB. Úsalo solo cuando quieras probar una instalación limpia.

Durante el arranque del backend, `database/init.sh` ejecuta migraciones, genera el cliente Prisma, carga datos iniciales si la base está vacía y luego carga vistas y procedimientos.

### Validaciones rápidas

```bash
curl -i http://localhost:3000/health
curl -I http://localhost
curl -i http://localhost/api/health
```

Sin token, algunas rutas protegidas responderán `401 Unauthorized`. Esto indica que el backend recibió la petición y aplicó autenticación; no es un fallo del proxy.

### Prueba de login

```bash
curl -i -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos.ramirez@resto.com","contrasena":"123456"}'
```

Las credenciales son datos de desarrollo. No deben reutilizarse en producción.

---

## Desarrollo local sin Docker

Para ejecutar Vite directamente:

```bash
pnpm --dir frontend dev
```

El frontend estará en `http://localhost:5173` y usará `VITE_API_URL=/api`. El proxy de Vite apunta por defecto a `http://localhost:3000`.

Para ejecutar el backend directamente:

```bash
pnpm --dir backend dev
```

Si el backend necesita MariaDB local, debes tener disponibles las variables de `backend/.env` y una instancia compatible de MariaDB.

---

## Variables de entorno

Los archivos `.env` reales no deben subirse al repositorio. Usa los archivos `.env.example` como referencia.

### Backend

| Variable | Descripción |
|----------|-------------|
| `DB_HOST` | Host de MariaDB; en Compose es `db` |
| `DB_PORT` | Puerto interno de MariaDB, normalmente `3306` |
| `DB_DATABASE` | Base de datos `remisoft` |
| `DB_USERNAME` | Usuario de MariaDB |
| `DB_PASSWORD` | Contraseña de MariaDB |
| `DATABASE_URL` | URL usada por Prisma CLI |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT |
| `FRONTEND_URL` | Origen permitido por CORS |
| Variables SMTP | Configuración de correo |

### Frontend

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API; en Docker producción es `/api` |
| `VITE_PROXY_TARGET` | Target del proxy de Vite en desarrollo; por defecto `http://localhost:3000` |
| `VITE_PORT` | Puerto opcional del servidor de desarrollo de Vite; por defecto `5173` |

Las variables `VITE_*` se incorporan al bundle durante `pnpm build`; cambiar una variable después de construir la imagen no modifica el JavaScript ya compilado.

---

## Integración continua
> La auditoría de dependencias se ejecuta en CI con severidad alta. Actualmente no bloquea el resto del pipeline porque existen vulnerabilidades transitivas provenientes de Prisma (`deepmerge-ts`, `mariadb` y `mysql2`). La corrección de estas dependencias queda como una tarea independiente y debe hacerse con pruebas de compatibilidad.

El proyecto utiliza GitHub Actions mediante el workflow `.github/workflows/ci.yml`.

El pipeline se ejecuta cuando:

- Se crea o actualiza un pull request hacia `develop` o `main`.
- Se hace push a `develop` o `main`.

Las validaciones ejecutadas son:

- Instalación reproducible de dependencias con `pnpm install --frozen-lockfile`.
- Auditoría de dependencias backend y frontend, reportada sin bloquear temporalmente el resto del pipeline.
- Lint del backend.
- Tests automatizados del backend.
- Lint del frontend.
- Build de producción del frontend.
- Validación de la configuración de Docker Compose.
- Construcción de las imágenes Docker.

### Ejecutar las validaciones localmente

Desde la raíz del proyecto:

```bash
pnpm --dir backend run test
pnpm --dir backend run lint
pnpm --dir frontend run lint
pnpm --dir frontend run build
docker compose config
docker compose build
```

El test actual verifica que `GET /health` responda con:

```json
{
  "status": "RemiSoft Express online"
}
```

### Estado de cobertura

Actualmente existe una prueba de humo para el endpoint `/health`. Las pruebas de integración para Docker, autenticación, autorización y persistencia siguen pendientes.

---

## Correo y recuperación de contraseña

El proyecto usa Nodemailer/SMTP para enviar correos de recuperación en desarrollo.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/forgot-password` | Envía enlace de recuperación |
| `POST` | `/api/auth/reset-password` | Restablece contraseña con token válido |

Flujo:

1. El usuario ingresa su email.
2. Express genera un token temporal.
3. Nodemailer envía el correo.
4. El enlace apunta a la ruta de recuperación del frontend.
5. El usuario registra la nueva contraseña.

Las credenciales SMTP deben permanecer únicamente en archivos `.env` locales o en secretos del entorno.

---

## Autenticación y roles

Todas las rutas protegidas requieren:

```text
Authorization: Bearer <token>
```

### Catálogo de roles

El rol `CLIENTE` ya no es un usuario autenticable. La entidad `Cliente` se conserva para contacto, pedidos, domicilios y búsqueda por teléfono.

| id_rol | Nombre | Ruta frontend | Descripción |
|--------|--------|---------------|-------------|
| 1 | `SUPERADMIN` | `/superadmin` | Acceso total esperado |
| 2 | `GERENTE` | `/gerente` | Administración del restaurante |
| 3 | `CAJERO` | — | Gestión de caja y pagos |
| 4 | `MESERO` | `/mesero` | Toma y gestión de pedidos |
| 5 | `REPARTIDOR` | `/repartidor` | Entrega de pedidos |

> El acceso efectivo por endpoint debe validarse con la matriz rol-permiso. No se debe asumir que la existencia de una ruta frontend equivale a autorización backend completa.

### Flujo de autenticación

1. Login: Express valida credenciales y devuelve token, rol y usuario.
2. El frontend guarda el token en Redux/localStorage.
3. `axios.ts` adjunta el token mediante interceptor.
4. `PrivateRoute` controla el acceso visual a dashboards.
5. El backend valida el token y, cuando está configurado, el rol requerido.
6. Logout elimina la sesión local.

---

## Modelo multi-restaurante

El sistema soporta múltiples sedes mediante `restaurante`. Cada usuario puede tener un `id_restaurante` opcional.

- `SUPERADMIN`: puede operar globalmente.
- Roles operativos: deberían limitarse a su sede asignada.

> **Estado pendiente:** que `id_restaurante` exista en el JWT no garantiza aislamiento de datos. El filtrado debe verificarse en cada controlador y endpoint antes de considerarlo completo.

El middleware de autenticación soporta JWT estándar y tokens estilo Sanctum heredados, cuando corresponda.

### Comandos Prisma

```bash
pnpm --dir backend exec prisma generate
pnpm --dir backend exec prisma migrate deploy
pnpm --dir backend exec prisma migrate status
```

En Docker, estos comandos se ejecutan desde `database/init.sh` durante el arranque del backend.

---

## Endpoints del backend

Todas las rutas protegidas requieren `Authorization: Bearer <token>`.

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login con email y contraseña |
| `POST` | `/api/auth/forgot-password` | Solicita recuperación |
| `POST` | `/api/auth/reset-password` | Restablece contraseña |
| `GET` | `/api/auth/me` | Consulta sesión autenticada |

### Módulos principales

| Módulo | Endpoint base |
|--------|---------------|
| Usuarios | `/api/usuarios` |
| Productos | `/api/productos` |
| Clientes | `/api/clientes` |
| Proveedores | `/api/proveedores` |
| Ingredientes | `/api/ingredientes` |
| Cajas | `/api/cajas` |
| Pedidos | `/api/pedidos` |
| Domicilios | `/api/domicilios` |
| Compras | `/api/compras` |
| Inventario | `/api/inventario` |
| Facturas | `/api/facturas` |
| Configuración | `/api/configuracion` |

También existen endpoints para categorías, detalles, gastos, turnos, permisos, notificaciones, estados, roles y tipos auxiliares. La lista completa debe mantenerse sincronizada con `backend/src/server.js` y `backend/src/routes/`.

---

## Flujo de trabajo Git

```text
main       ← código estable
 ↑
develop    ← integración
 ↑
feat/* / fix/* / docs/*
```

Flujo correcto:

```text
rama de trabajo → commit → push → PR a develop → merge → PR de develop a main
```

Convención de commits:

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Reorganización sin cambiar comportamiento |
| `chore:` | Configuración o mantenimiento |
| `docs:` | Documentación |
| `style:` | Formato o estilos |

Reglas:

- No hacer push directo a `main` o `develop`.
- Actualizar la rama base antes de crear una rama de trabajo.
- Verificar comandos reales antes de afirmar que algo funciona.
- Revisar `git diff` antes del commit y del merge.
- No subir `.env`, tokens, contraseñas ni credenciales SMTP.

---

## Diseño y UI

### Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--rojo` | `#D85A30` | Acciones primarias |
| `--rojo-light` | `#FAECE7` | Fondos de hover y badges |
| `--amarillo` | `#EF9F27` | Advertencias |
| `--verde` | `#1D9E75` | Confirmaciones |
| `--texto` | `#1A1A1A` | Tipografía principal |
| `--texto-muted` | `#5F5E5A` | Texto secundario |
| `--bg` | `#FDFAF7` | Fondo base |
| `--bg-card` | `#ffffff` | Tarjetas |
| `--borde` | `rgba(0,0,0,0.09)` | Bordes |

### Navegación por rol

| Rol | Ruta |
|-----|------|
| `SUPERADMIN` | `/superadmin` |
| `GERENTE` | `/gerente` |
| `MESERO` | `/mesero` |
| `REPARTIDOR` | `/repartidor` |
| Público | `/`, `/forgot-password`, `/reset-password` |

---

## Notas técnicas y pendientes

### Hecho y validado

- Docker Compose ejecuta MariaDB, backend y frontend.
- El frontend se compila en una etapa Node y se sirve con nginx.
- nginx resuelve rutas de React Router mediante fallback a `index.html`.
- nginx reenvía `/api/` al servicio interno `backend:3000`.
- Prisma se genera dentro del build del backend y se copia al runtime.
- `database/init.sh` se ejecuta antes de iniciar Express.
- `DATABASE_URL` está disponible para Prisma CLI dentro de Compose.
- Una instalación limpia puede crear la base, ejecutar migraciones y cargar datos, vistas y procedimientos.
- El endpoint `/health` tiene una prueba automatizada ejecutada por Node Test Runner.
- El lint de backend y frontend pasa correctamente.
- El build de producción del frontend pasa correctamente.
- La configuración de Docker Compose es válida.
- Las imágenes Docker de backend y frontend se construyen correctamente.

### Pendientes reales

- Formalizar la matriz rol → permiso.
- Aplicar y probar `requireRole` en todos los routers que lo necesitan.
- Implementar RF-002: pedidos transaccionales, máquina de estados y descuento de inventario.
- Consumir `vista_pedidos_activos` mediante `/api/pedidos/activos`.
- Revisar los procedimientos y vistas SQL todavía no utilizados.
- Fijar CVEs y dependencias con rangos abiertos.
- Añadir pruebas automatizadas de integración para Docker, autenticación y autorización.
- Separar configuración Docker de desarrollo y producción si el despliegue real lo requiere.
- Eliminar valores por defecto inseguros antes de cualquier despliegue público.

### Limitaciones de producción

La configuración actual es adecuada para reproducibilidad académica y validación del stack. Para producción real todavía faltaría, como mínimo:

- TLS/HTTPS delante de nginx.
- Secretos gestionados fuera de `docker-compose.yml`.
- Backups y política de persistencia de MariaDB.
- Observabilidad y logs centralizados.
- Healthchecks explícitos para backend/frontend.
- No publicar el puerto 3000 del backend si nginx es la única entrada pública.
- Revisión de aislamiento por restaurante y autorización por endpoint.

---

## Licencia

Proyecto académico desarrollado para la gestión del restaurante Familia Remi.