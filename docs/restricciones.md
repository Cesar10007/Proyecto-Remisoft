# Restricciones del proyecto

## Arquitectura vigente

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + Vite 6 |
| Backend | Node.js + Express |
| ORM | Prisma |
| Base de datos | MariaDB |
| Autenticación | JWT |
| Gestor de paquetes | pnpm |

## Reglas de desarrollo

- `main` y `develop` están protegidas: los cambios se integran mediante Pull Request.
- Crea cada rama `feat/*` desde `develop` actualizado.
- No hagas push directo a `main` ni `develop`.
- Revisa el diff y ejecuta las verificaciones antes del merge.
- No subas archivos `.env`, contraseñas, tokens ni credenciales.
- Usa migraciones versionadas de Prisma para modificar el esquema.
- Prueba los endpoints contra MariaDB y no asumas que compilar implica que el flujo funciona.
- No agregues funcionalidades fuera del alcance solicitado.
- Conserva compatibilidad con los datos existentes durante la migración.

## Puertos

- MariaDB: `3306`.
- Express: `3000`.
- React/Vite: `5173`.

El puerto `8000` y el arranque de Laravel no forman parte del entorno activo.

## Flujo de validación

1. Instala dependencias con pnpm.
2. Ejecuta `prisma generate`.
3. Ejecuta `prisma migrate deploy`.
4. Inicia Express y React/Vite.
5. Prueba autenticación y módulos activos con datos reales o de prueba controlados.
6. Ejecuta lint, build y pruebas disponibles.
7. Revisa el diff y abre un Pull Request.
