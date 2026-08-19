# Restricciones y stack tecnológico

Este documento conserva las restricciones generales del proyecto y describe el stack vigente después de la migración a Express + Prisma.

## Stack vigente

| Capa | Tecnología | Uso en el proyecto |
| --- | --- | --- |
| Frontend | React 19 + Vite 6 | Interfaz web y proxy de la API |
| Backend | Node.js + Express | API HTTP y lógica de negocio |
| ORM | Prisma | Acceso tipado a MariaDB y migraciones |
| Base de datos | MariaDB | Persistencia compartida |
| Autenticación | JWT | Login y protección de endpoints |
| Correo | Nodemailer | Recuperación de contraseña |
| Gestor de paquetes | pnpm | Instalación y scripts |
| Entorno | Dev Container / Codespaces | Desarrollo reproducible |

## Estructura y puertos

- `backend/`: API Express, controladores, rutas, middleware y Prisma.
- `frontend/`: aplicación React/Vite.
- `database/`: recursos auxiliares de base de datos.
- `docs/`: documentación funcional y técnica.
- MariaDB: `3306`.
- Express: `3000`.
- React/Vite: `5173`.

El puerto `8000`, Composer, `php artisan` y el arranque de Laravel no forman parte del entorno activo.

## Reglas de desarrollo

- `main` y `develop` están protegidas; los cambios se integran mediante Pull Request.
- Crea cada rama `feat/*`, `fix/*` o `docs/*` desde `develop` actualizado.
- No hagas push directo a `main` ni `develop`.
- Mantén los cambios agrupados por objetivo y revisa el diff antes del merge.
- Usa migraciones versionadas de Prisma para modificar el esquema.
- Prueba los endpoints contra MariaDB; compilar no sustituye las pruebas funcionales.
- No subas archivos `.env`, contraseñas, tokens ni credenciales.
- No agregues funcionalidades fuera del alcance solicitado.
- Conserva compatibilidad con los datos existentes cuando el cambio lo requiera.

## Flujo de entorno

1. Instala las dependencias con pnpm.
2. Configura los archivos `.env` a partir de los ejemplos.
3. Ejecuta `prisma generate`.
4. Ejecuta `prisma migrate deploy`.
5. Inicia MariaDB, Express y React/Vite.
6. Verifica salud, autenticación y módulos activos.
7. Ejecuta lint, build y pruebas CRUD.
8. Revisa el diff y abre el Pull Request hacia `develop`.

## Criterios de validación

- El backend responde en el puerto `3000`.
- El frontend responde en el puerto `5173`.
- MariaDB está disponible y las migraciones terminan sin errores.
- Las rutas protegidas rechazan solicitudes sin autenticación.
- Los roles y pantallas permitidas coinciden con la matriz del proyecto.
- Los módulos activos funcionan con datos reales o controlados.
- El entorno no depende del arranque de Laravel ni del puerto `8000`.
