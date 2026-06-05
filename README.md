# RemiSoft — Sistema Web Inteligente para Restaurantes

Sistema web con IA para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** El login está conectado al backend real (Laravel Sanctum). Las demás secciones usan datos hardcodeados como referencia visual mientras se implementa la lógica completa.

***

## Tabla de contenido

1. [Equipo](#equipo-de-desarrollo)
2. [Stack y arquitectura](#stack-y-arquitectura)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Levantar el entorno](#levantar-el-entorno)
5. [Flujo de trabajo Git](#flujo-de-trabajo-git)
6. [Funcionalidades implementadas](#funcionalidades-implementadas)
7. [Diseño y UI por rol](#diseño-y-ui-por-rol)

***

## Equipo de desarrollo

| Nombre | Rol | Rama asignada |
|--------|-----|---------------|
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

React **nunca** se comunica directamente con MariaDB. Todo pasa por la API REST de Laravel en `localhost:8000/api/`.

### Dependencias principales

**Frontend**

| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.x | Framework principal de UI |
| Vite | 6.x | Servidor de desarrollo y compilador |
| react-router-dom | 7.14.0 | Rutas y navegación por rol |

**Backend**

| Librería | Versión | Uso |
|----------|---------|-----|
| Laravel | 11.x | Framework backend y API REST |
| PHP | 8.2 | Lenguaje del backend |
| Laravel Sanctum | 4.3.x | Autenticación por tokens |

> Cada vez que se instale una librería nueva con `npm install` o `composer require`, agregarla aquí con versión exacta y propósito.

### Base de datos

| Campo | Valor |
|-------|-------|
| Motor | MariaDB |
| Base de datos | remisoft |
| Usuario | remisoft |
| Contraseña | remisoft123 |
| Puerto | 3306 |
| Tablas | 24 |

> Estas credenciales son solo para el entorno de desarrollo en Codespaces.

***

## Estructura del proyecto

```bash
Proyecto-Remisoft/
├── .devcontainer/            # Configuración del entorno Codespaces
│   ├── devcontainer.json     # Define imagen, puertos y extensiones
│   ├── setup.sh              # Instalación inicial (corre una vez)
│   └── start.sh              # Arranque automático de servicios
├── frontend/                 # Proyecto React + Vite
│   └── src/
│       ├── pages/            # Vistas por rol
│       │   ├── auth/         # Landing, Login, Register — acceso público
│       │   ├── admin/        # Panel administrador
│       │   ├── mesero/       # Toma de pedidos
│       │   ├── repartidor/   # Gestión de domicilios
│       │   └── cliente/      # Menú y pedidos
│       ├── components/       # Componentes reutilizables
│       │   ├── common/       # Modal, botones, inputs
│       │   └── layout/       # Navbar, Footer
│       ├── services/         # Llamadas HTTP al backend (Axios)
│       ├── hooks/            # Hooks personalizados de React
│       └── context/          # Estado global: usuario autenticado y rol
├── backend/                  # Proyecto Laravel
│   └── app/
│       ├── Http/Controllers/ # Reciben peticiones HTTP de React
│       ├── Services/         # Lógica de negocio
│       ├── Repositories/     # Acceso a base de datos
│       └── Models/           # Entidades Eloquent
├── DBFAMILIAREMI.sql         # Estructura de la base de datos
└── datos.sql                 # Datos de prueba
```

***

## Levantar el entorno

### Primera vez (automático)

Al crear el Codespace, `setup.sh` corre solo y deja todo listo:
- Instala MariaDB y crea la base de datos `remisoft`
- Carga `DBFAMILIAREMI.sql` y `datos.sql`
- Configura el `.env` de Laravel
- Corre `composer install` y `npm install`

### Cada vez que abres el Codespace

`start.sh` arranca los tres servicios automáticamente. Verifica en terminal que ves:

```bash
React  →  http://localhost:5173
Laravel →  http://localhost:8000
```

Si no aparecen, córrelos manualmente en dos terminales separadas:

```bash
# Terminal 1
cd backend && php artisan serve

# Terminal 2
cd frontend && npm run dev
```

Para ver la base de datos visualmente, usar **SQLTools** en el panel izquierdo de VS Code. La conexión `remisoft` ya está configurada.

### Archivos de configuración del entorno

| Archivo | Cuándo corre | Qué hace |
|---------|-------------|----------|
| `devcontainer.json` | Al crear el Codespace | Define imagen, puertos y extensiones de VS Code |
| `setup.sh` | Una sola vez | Instala todo y deja el entorno listo |
| `start.sh` | Cada vez que abres | Arranca MariaDB, Laravel y React |

***

## Flujo de trabajo Git

### Estructura de ramas

```
main        ← código estable y aprobado. Nadie pushea directo aquí.
develop     ← rama de integración. Aquí se unen todos los cambios.
 ├── feat/frontend-landing     ← César Rueda
 ├── feat/frontend-components  ← César Rueda
 ├── feat/ia-modulo            ← Juan Felipe Bello
 └── feat/testing              ← Kevin Bueno
```

```
feat/tu-rama → Push → Pull Request a develop → Revisión → Aprobado → develop
                                                                          ↓
                                                               (cuando esté estable)
                                                                          ↓
                                                                        main
```

### Rutina diaria

**Al abrir el Codespace — sincronizar antes de tocar cualquier archivo:**

```bash
git checkout main && git pull origin main
git checkout develop && git pull origin develop
git checkout feat/tu-rama-asignada && git pull origin feat/tu-rama-asignada
```

**Subir tus cambios:**

```bash
git add .
git commit -m "feat: descripción de lo que hiciste"
git push origin feat/tu-rama-asignada
```

**Abrir un Pull Request:**

1. Ve a [github.com/Cesar10007/Proyecto-Remisoft](https://github.com/Cesar10007/Proyecto-Remisoft)
2. Clic en **Pull requests** → **New pull request**
3. Base: `develop` ← Compare: `feat/tu-rama`
4. Escribe un título claro y asigna a César como revisor
5. Clic en **Create pull request**

### Reglas del equipo

- **Nunca** pushear directo a `main` o `develop`
- Cada PR debe ser revisado por César antes de aprobarse
- Una rama por tarea, no acumular cambios de varias tareas en una sola rama
- Siempre hacer `git pull` antes de empezar a trabajar

### Convención de commits

| Prefijo | Cuándo usarlo |
|---------|--------------|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Reorganización sin cambiar comportamiento |
| `chore:` | Configuración o mantenimiento |
| `docs:` | Cambios en documentación |
| `test:` | Agregar o modificar pruebas |
| `style:` | Cambios de formato sin afectar lógica |

```bash
# Ejemplos
git commit -m "feat: agregar módulo de autenticación por roles"
git commit -m "fix: corregir descuento de inventario al registrar pedido"
git commit -m "docs: actualizar README con instrucciones de inicio"
```

***

## Funcionalidades implementadas

Qué está **conectado al backend real** vs qué es todavía un **prototipo visual**. Actualizar con cada PR aprobado a `develop`.

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| 🟢 Autenticación (login) | **Implementado** | Login real con Sanctum. Laravel valida credenciales, genera token y lo retorna al frontend. |
| 🟢 Hash de contraseñas | **Implementado** | Contraseñas en `datos.sql` con hash bcrypt válido. Login usa `Hash::check()`. |
| 🟢 Redirección por rol | **Implementado** | React redirige al usuario según el rol recibido del backend. |
| 🟡 Guards de rutas (backend) | **Parcial** | Rutas en `routes/api.php`. Falta verificar que todas las rutas privadas exijan `auth:sanctum`. |
| 🟡 Logout | **Sin confirmar** | No hay commit de endpoint `POST /api/logout` ni revocación de token en frontend. |
| 🔴 Gestión de pedidos (salón) | **Prototipo visual** | UI del mesero hardcodeada. Sin conexión a backend. |
| 🔴 Facturación automática | **Prototipo visual** | Vista existe. No genera ni guarda facturas reales. |
| 🔴 Control de inventario | **Prototipo visual** | Pantallas diseñadas. Sin descuento automático al vender. |
| 🔴 Gestión de domicilios | **Prototipo visual** | Vista del repartidor diseñada. Sin estado de entrega real. |
| 🔴 Módulo de IA | **No iniciado** | Definido en el SRS. Sin código en `feat/ia-modulo`. |
| 🔴 Reportes y estadísticas | **No iniciado** | Mencionado en el panel del Gerente. Sin implementación. |

> 🟢 Implementado — funciona con datos reales del backend  
> 🟡 Parcial — código existe pero incompleto o sin verificar  
> 🔴 Prototipo / No iniciado — solo UI visual o no existe aún

### Historial de avances recientes

| Fecha | Commit | Qué se hizo |
|-------|--------|-------------|
| 2026-05-01 | `feat: implementar login funcional con laravel` | Login conectado al backend real con Sanctum |
| 2026-05-01 | `refactor: mover CSS junto a sus componentes react` | Reorganización de estilos CSS por componente |
| 2026-05-01 | `fix: reemplazar hashes falsos por hash bcrypt válido` | Credenciales de prueba funcionan en el login real |
| 2026-04-30 | Limpieza de carpetas de ejercicio | Eliminación de archivos que no pertenecían al proyecto |

***

## Diseño y UI por rol

### Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| Rojo principal | `#D85A30` | Acciones primarias, botones CTA |
| Amarillo | `#EF9F27` | Alertas, estados de advertencia |
| Verde | `#1D9E75` | Confirmaciones, estados exitosos |
| Texto | `#1a1a1a` | Tipografía principal |
| Fondo | `#FDFAF7` | Fondo base de la aplicación |

### Navegación por rol

| Rol | URL base | Rutas públicas |
|-----|----------|----------------|
| Administrador | `/admin/dashboard` | — |
| Mesero | `/mesero/pedidos` | — |
| Repartidor | `/repartidor` | — |
| Cliente | `/cliente/menu` | — |
| — | `/` | Landing, `/login`, `/registro` |

Cualquier URL no reconocida redirige al inicio automáticamente.

### Secciones por rol

- **Superadmin:** Ver usuarios · Peticiones de usuarios · Configuración del sistema

- **Gerente:** Control de menú · Control de inventario · Control de ingresos y egresos · Registro y control de pedidos · Control de meseros y mesas · Informes de IA · Información de proveedores · Historial de movimientos · Flujo de caja · Historial de pedidos · Historial de turnos

- **Mesero:** Registrar venta · Generar factura · Ver pedidos por mesa

- **Repartidor:** Ver pedidos asignados · Ver dirección de domicilio · Registrar método de pago · Confirmar entrega

### Criterio de consistencia visual

Todas las interfaces deben mantener: mismo sidebar y navegación lateral, misma lógica de topbar, misma paleta y jerarquía tipográfica, mismos estilos de cards y botones. Solo cambia el contenido específico de cada rol.