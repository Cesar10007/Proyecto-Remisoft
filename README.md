# RemiSoft — Sistema Web Inteligente para Restaurantes

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** La autenticación ya está conectada al backend real con Laravel Sanctum. El login y el registro funcionan en la API; varias vistas del frontend siguen siendo prototipos visuales mientras se implementa la lógica completa.[1][2][3][4]

***

## Tabla de contenido

1. [Equipo](#equipo-de-desarrollo)
2. [Stack y arquitectura](#stack-y-arquitectura)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Levantar el entorno](#levantar-el-entorno)
5. [Autenticación y roles](#autenticación-y-roles)
6. [Flujo de trabajo Git](#flujo-de-trabajo-git)
7. [Funcionalidades implementadas](#funcionalidades-implementadas)
8. [Diseño y UI por rol](#diseño-y-ui-por-rol)
9. [Notas técnicas importantes](#notas-técnicas-importantes)

***

## Equipo de desarrollo

| Nombre | Rol en el equipo | Rama principal |
|--------|------------------|----------------|
| César David Rueda Daza | Líder / Full Stack | `feat/frontend-landing-components` |
| Juan Felipe Bello Perez | IA / Data Scientist | `feat/ia-modulo` |
| Kevin Duvan Bueno Melo | Tester / QA | `feat/testing` |

***

## Stack y arquitectura

| Capa | Tecnología | Puerto |
|------|------------|--------|
| Frontend | React 19 + Vite 6 | 5173 |
| Backend | PHP 8.2 + Laravel 11 | 8000 |
| Base de datos | MariaDB | 3306 |
| Entorno | GitHub Codespaces | — |

React no se comunica directamente con MariaDB. Todo pasa por la API REST de Laravel en `http://localhost:8000/api/`.[1]

### Dependencias principales

#### Frontend

| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.x | Framework principal de UI |
| Vite | 6.x | Servidor de desarrollo y build |
| react-router-dom | 7.14.0 | Rutas y navegación por rol |
| Axios | Confirmar en `package.json` | Cliente HTTP para consumir la API |

#### Backend

| Librería | Versión | Uso |
|----------|---------|-----|
| Laravel | 11.x | Framework backend y API REST |
| PHP | 8.2 | Lenguaje del backend |
| Laravel Sanctum | 4.3.x | Autenticación por token |

> Cada vez que se instale una librería nueva con `npm install` o `composer require`, actualizar esta sección con versión y propósito.[5][6]

### Base de datos

| Campo | Valor |
|-------|-------|
| Motor | MariaDB |
| Base de datos | `remisoft` |
| Usuario | `remisoft` |
| Contraseña | `remisoft123` |
| Puerto | 3306 |

> Estas credenciales son solo para desarrollo local o Codespaces. No deben reutilizarse en producción.[7]

***

## Estructura del proyecto

```bash
Proyecto-Remisoft/
├── .devcontainer/            # Configuración del entorno Codespaces
│   ├── devcontainer.json     # Imagen, puertos y extensiones
│   ├── setup.sh              # Instalación inicial
│   └── start.sh              # Arranque automático de servicios
├── frontend/                 # Proyecto React + Vite
│   └── src/
│       ├── pages/            # Vistas principales
│       │   ├── auth/         # Landing, login, registro
│       │   ├── admin/        # Panel administrativo
│       │   ├── mesero/       # Toma de pedidos
│       │   ├── repartidor/   # Gestión de domicilios
│       │   └── cliente/      # Menú y pedidos
│       ├── components/       # Componentes reutilizables
│       ├── api/              # Configuración Axios / cliente HTTP
│       ├── hooks/            # Hooks personalizados
│       └── context/          # Estado global de autenticación y usuario
├── backend/                  # Proyecto Laravel
│   └── app/
│       ├── Http/Controllers/ # Controladores HTTP
│       ├── Http/Requests/    # Validaciones tipo FormRequest
│       ├── Models/           # Modelos Eloquent
│       └── Services/         # Lógica de negocio si aplica
├── DBFAMILIAREMI.sql         # Estructura base de datos heredada
└── datos.sql                 # Datos semilla / prueba
```

> La estructura real del repositorio debe prevalecer sobre este esquema. Si una carpeta cambia, esta sección también debe actualizarse.[8]

***

## Levantar el entorno

### Primera vez

Al crear el Codespace, `setup.sh` deja listo el entorno:

- instala MariaDB,
- crea la base de datos `remisoft`,
- carga `DBFAMILIAREMI.sql` y `datos.sql`,
- configura el `.env` de Laravel,
- corre `composer install` y `npm install`.

### Cada vez que abres el Codespace

`start.sh` arranca los servicios automáticamente. Verifica:

```bash
React   → http://localhost:5173
Laravel → http://localhost:8000
```

Si no se levantan solos, correr manualmente:

```bash
# Terminal 1
cd backend && php artisan serve

# Terminal 2
cd frontend && npm run dev
```

### Configuración del entorno

| Archivo | Cuándo corre | Qué hace |
|---------|-------------|----------|
| `devcontainer.json` | Al crear el Codespace | Define imagen, puertos y extensiones |
| `setup.sh` | Una sola vez | Instala dependencias y configura el proyecto |
| `start.sh` | Cada vez que abres | Arranca MariaDB, Laravel y React |

***

## Autenticación y roles

### Endpoints principales

| Método | Endpoint | Estado | Descripción |
|--------|----------|--------|-------------|
| `POST` | `/api/login` | Implementado | Valida credenciales, genera token y retorna usuario autenticado.[4] |
| `POST` | `/api/register` | Implementado | Registra un nuevo usuario con validación de datos y unicidad.[2][3] |
| `POST` | `/api/logout` | Revisar implementación | Debe invalidar el token actual si ya está conectado a Sanctum.[1] |

### Requests de referencia

#### Login

```json
{
  "email": "prueba.usuario@resto.com",
  "contrasena": "12345678"
}
```

#### Register

```json
{
  "id_rol": 4,
  "identificacion": "2001",
  "nombre": "Prueba",
  "apellido": "Usuario",
  "email": "prueba.usuario@resto.com",
  "telefono": "3005554444",
  "contrasena": "12345678",
  "contrasena_confirmation": "12345678"
}
```

### Respuesta confirmada de login

El login ya fue probado con Postman y devuelve `token`, `rol` y `user` cuando las credenciales son correctas.[4]

### Regla crítica sobre roles

El frontend debe navegar usando **exactamente** el valor de `rol` que devuelve el backend, no el nombre que alguien suponga mentalmente.[4][9] Este punto ya generó un bug real: el backend devolvía `ADMIN`, pero el frontend esperaba otros nombres de rol y por eso parecía que el login "no hacía nada".[4][9]

### Modelo de permisos por rol

> Esta jerarquía define qué puede crear, ver y gestionar cada rol. Debe mantenerse sincronizada con las políticas de autorización del backend (Gates / Policies en Laravel) y con las rutas protegidas del frontend.

| Rol | Puede crear / gestionar | Visibilidad |
|-----|------------------------|-------------|
| `SUPERADMIN` | Crea y gestiona Gerentes; configura el sistema | No ve Meseros ni Repartidores |
| `GERENTE` | Crea y gestiona Meseros, Repartidores y Cajeros de su restaurante | Ve la operación completa de su restaurante |
| `MESERO` | Toma pedidos, gestiona mesas | Vista de salón |
| `REPARTIDOR` | Ve y gestiona sus propias entregas | Vista de domicilios asignados |
| `CAJERO` | Gestiona caja y pagos | Vista de caja |

**Reglas de jerarquía:**
- Un `SUPERADMIN` **no** puede crear ni ver Meseros o Repartidores directamente; esa responsabilidad recae en el `GERENTE`.
- Un `GERENTE` solo administra los usuarios de **su propio restaurante**, no los de otros.
- `MESERO`, `REPARTIDOR` y `CAJERO` no tienen permisos de gestión de usuarios.

### Catálogo actual de roles

> **Importante:** esta tabla debe validarse contra la base de datos y mantenerse sincronizada con frontend y backend. Si cambia en BD, debe cambiar aquí y en las rutas del frontend.[10][11]

| Valor esperado en frontend | Observación |
|----------------------------|-------------|
| `ADMIN` | Confirmado en respuesta real de login.[4] |
| `MESERO` | Debe mapear a rutas del módulo de salón. |
| `REPARTIDOR` | Debe mapear a rutas de domicilios. |
| `GERENTE` / `SUPERADMIN` | Solo usar si realmente existen y el backend los devuelve. No asumir nombres por costumbre.[4] |

***

## Flujo de trabajo Git

### Estructura de ramas

```text
main        ← código estable y aprobado
develop     ← rama de integración
├── feat/frontend-landing-components
├── feat/ia-modulo
└── feat/testing
```

### Flujo correcto

```text
feat/tu-rama → commit → push → Pull Request a develop → revisión → merge a develop
                                                           ↓
                                                   cuando esté estable
                                                           ↓
                                                          main
```

### Rutina diaria recomendada

Antes de empezar a trabajar:

```bash
git checkout main && git pull origin main
git checkout develop && git pull origin develop
git checkout feat/tu-rama-asignada && git pull origin feat/tu-rama-asignada
```

Subir cambios:

```bash
git add .
git commit -m "feat: descripción de lo que hiciste"
git push origin feat/tu-rama-asignada
```

### Reglas del equipo

- Nunca hacer push directo a `main` o `develop`.
- Cada tarea debe salir desde una rama `feat/*` creada a partir de `develop`.[12][13]
- Probar en la rama de trabajo antes de integrar a `develop`.[14][15]
- Hacer `pull` antes de tocar archivos para evitar conflictos innecesarios.[16][17]

### Convención de commits

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Reorganización sin cambiar comportamiento |
| `chore:` | Configuración o mantenimiento |
| `docs:` | Documentación |
| `test:` | Pruebas |
| `style:` | Formato / estilos sin cambiar lógica |

***

## Funcionalidades implementadas

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| Autenticación (login) | Implementado | Login real con Sanctum. Laravel valida credenciales, genera token y retorna usuario autenticado.[4] |
| Registro de usuarios | Implementado | Endpoint funcional con validación y persistencia en base de datos.[2] |
| Validación de duplicados | Implementado | Register responde `422` cuando identificación o correo ya existen.[3] |
| Hash de contraseñas | Implementado | El login compara contraseña ingresada contra hash almacenado con `Hash::check()`.[1][4] |
| Redirección por rol | Parcial | Funciona, pero depende de que frontend y backend compartan exactamente los mismos nombres de rol.[4][9] |
| Logout | Sin confirmar | Falta verificar revocación de token desde frontend y backend.[1] |
| Gestión de pedidos | Prototipo visual | Sin integración real al backend. |
| Facturación | Prototipo visual | Sin persistencia real. |
| Inventario | Prototipo visual | Sin lógica de descuento automático. |
| Domicilios | Prototipo visual | Sin flujo real de estados. |
| Módulo IA | No iniciado | Definido funcionalmente, sin implementación visible. |

***

## Diseño y UI por rol

### Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| Rojo principal | `#D85A30` | Botones y acciones primarias |
| Amarillo | `#EF9F27` | Advertencias |
| Verde | `#1D9E75` | Confirmaciones |
| Texto | `#1A1A1A` | Tipografía principal |
| Fondo | `#FDFAF7` | Fondo base |

### Navegación por rol

| Rol | Ruta base esperada |
|-----|-------------------|
| `ADMIN` | `/admin/dashboard` |
| `MESERO` | `/mesero/pedidos` |
| `REPARTIDOR` | `/repartidor` |
| Cliente | `/cliente/menu` |
| Público | `/`, `/login`, `/registro` |

> Esta tabla debe coincidir con el valor real de `rol` que devuelve el backend. Si backend responde `ADMIN`, el frontend no debe esperar `GERENTE` salvo que exista un mapeo explícito.[4][9]

### Secciones por rol

- **Administrador:** usuarios, configuración, panel principal.
- **Mesero:** registrar venta, generar factura, ver pedidos por mesa.
- **Repartidor:** ver pedidos asignados, dirección, método de pago y confirmar entrega.
- **Cliente:** menú, pedidos y seguimiento básico.

***

## Notas técnicas importantes

- El proyecto usa una base heredada con tabla `usuario`, no la convención estándar `users` de Laravel.[1][18]
- El modelo `Usuario` requiere configuración explícita de tabla primaria y timestamps. Si la tabla no tiene `created_at` y `updated_at`, el modelo debe usar `public $timestamps = false;` para evitar errores SQL como el ya detectado.[18][19][20]
- No asumir nombres de roles "por costumbre". El contrato correcto es el que devuelve la API en tiempo real.[4][9]
- Cada cambio de contrato entre frontend y backend debe reflejarse en este README el mismo día que se mergea a `develop`.[5][7]
