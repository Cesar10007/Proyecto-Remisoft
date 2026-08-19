# 🍽️ Proyecto-Remisoft

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** el proyecto utiliza un frontend React/Vite y un backend Express + Prisma sobre MariaDB. Laravel ya no forma parte del arranque del entorno activo; la carpeta vigente del backend es `backend/`.

---

## 📋 Tabla de contenido

- [Características](#-características)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Puesta en marcha](#-puesta-en-marcha)
- [Variables de entorno](#-variables-de-entorno)
- [Verificación](#-verificación)
- [Flujo de trabajo](#-flujo-de-trabajo)

---

## ✨ Características

- Gestión de pedidos, productos, proveedores, usuarios, cajas, clientes y domicilios.
- Autenticación mediante JWT y recuperación de contraseña.
- Persistencia en MariaDB mediante Prisma.
- API modular con Express.
- Interfaz web construida con React y Vite.
- Entorno reproducible mediante Dev Container/Codespaces.

---

## 🧰 Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + Vite 6 |
| Backend | Node.js + Express |
| ORM | Prisma |
| Base de datos | MariaDB |
| Autenticación | JWT |
| Gestor de paquetes | pnpm |
| Entorno | Dev Container / GitHub Codespaces |

---

## 📁 Estructura del proyecto

```text
Proyecto-Remisoft/
├── .devcontainer/              # Configuración del entorno reproducible
├── backend/                    # API Express, Prisma y migraciones
│   ├── prisma/                 # Esquema y migraciones de base de datos
│   └── src/                    # Servidor, rutas, controladores y middleware
├── frontend/                   # Aplicación React/Vite
├── database/                   # Recursos auxiliares de base de datos
├── docs/                       # Historias, requisitos y restricciones
└── README.md
```

---

## 🚀 Puesta en marcha

### Requisitos

- Node.js compatible con el proyecto.
- pnpm.
- MariaDB disponible.
- Variables de entorno configuradas.

### Instalación

Desde la raíz del repositorio:

```bash
pnpm install
pnpm --dir backend install
pnpm --dir frontend install
```

### Base de datos y Prisma

```bash
pnpm --dir backend exec prisma generate
pnpm --dir backend exec prisma migrate deploy
```

### Iniciar el entorno

En terminales separadas:

```bash
pnpm --dir backend dev
pnpm --dir frontend dev
```

Servicios principales:

- API Express: `http://localhost:3000`.
- React/Vite: `http://localhost:5173`.
- MariaDB: puerto `3306`.

El puerto `8000` y el arranque de Laravel no forman parte del entorno activo.

---

## 🔐 Variables de entorno

Copia los archivos de ejemplo y completa los valores locales:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configura las variables de MariaDB, JWT, correo y frontend según los ejemplos. Nunca subas archivos `.env`, contraseñas, tokens ni credenciales al repositorio.

---

## ✅ Verificación

Antes de abrir un Pull Request:

```bash
pnpm --dir frontend lint
pnpm --dir frontend build
pnpm --dir backend lint
```

Además:

- Confirma que `prisma migrate deploy` termine correctamente.
- Verifica `/health` y los endpoints activos.
- Prueba autenticación, recuperación de contraseña y permisos.
- Ejecuta las operaciones CRUD con datos controlados.
- Revisa visualmente los flujos principales en el navegador.
- Revisa el diff antes del merge.

---

## 🌿 Flujo de trabajo

1. Actualiza `develop`.
2. Crea una rama `feat/*`, `fix/*` o `docs/*` desde `develop`.
3. Realiza cambios coherentes y prueba con datos reales o controlados.
4. Abre un Pull Request hacia `develop`.
5. Revisa el diff y espera las validaciones antes del merge.
6. No hagas push directo a `main` ni `develop`.

---

## 📚 Documentación

- [Restricciones y stack del proyecto](docs/restricciones.md).
- [Historias de usuario](docs/HUs/).
- [Requisitos funcionales](docs/RFs/).
- [Requisitos no funcionales](docs/RNFs/).
