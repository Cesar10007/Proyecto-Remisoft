# Validación de fase 3

## Objetivo

Verificar que Docker, la inicialización de MariaDB y el pipeline de CI puedan ejecutarse de forma reproducible.

## Validación local

Desde la raíz del repositorio:

```bash
docker compose down -v
docker compose config --quiet
docker compose up --build
```

En otra terminal, comprobar los servicios:

```bash
docker compose ps
docker compose logs db
docker compose logs backend
docker compose logs frontend
```

## Criterios

- MariaDB permanece en estado `healthy`.
- Backend inicia después de que la base de datos esté saludable.
- Las migraciones Prisma terminan sin errores.
- El seed, las vistas y los procedimientos se ejecutan de forma idempotente.
- Frontend y backend quedan accesibles mediante los puertos definidos en Compose.
- Una segunda ejecución no duplica estructuras ni falla por objetos existentes.

## CI

El workflow de `.github/workflows/ci.yml` debe pasar instalación con lockfile, auditoría, lint, pruebas, build del frontend y construcción de las imágenes Docker.

Las vulnerabilidades transitivas deben corregirse mediante actualización compatible o quedar documentadas con una justificación y seguimiento en una issue separada.

## Evidencia requerida

Registrar en la issue #188:

- Salida de `docker compose config --quiet`.
- Salida de `docker compose ps` con servicios saludables.
- Resultado de tests, lint y build.
- Resultado de `docker compose down -v && docker compose up --build` desde una instalación limpia.

## Pruebas manuales mínimas

### 1. Arranque limpio

- [ ] Ejecutar `docker compose down -v`.
- [ ] Ejecutar `docker compose config --quiet` sin salida de error.
- [ ] Ejecutar `docker compose up --build`.
- [ ] Confirmar que `db`, `backend` y `frontend` estén activos.
- [ ] Confirmar que MariaDB aparezca como `healthy`.
- [ ] Confirmar que no haya errores rojos en los logs.

### 2. Persistencia e idempotencia

- [ ] Detener los servicios con `docker compose down` sin `-v`.
- [ ] Levantarlos nuevamente con `docker compose up`.
- [ ] Confirmar que no se dupliquen datos de seed.
- [ ] Confirmar que vistas y procedimientos no generen errores por existir previamente.

### 3. Frontend y proxy

- [ ] Abrir `http://localhost` o el puerto definido en Compose.
- [ ] Confirmar que la aplicación cargue sin errores en la consola del navegador.
- [ ] Iniciar sesión con un usuario válido.
- [ ] Confirmar respuesta HTTP 200 en `POST /api/auth/login`.
- [ ] Confirmar que una ruta protegida cargue correctamente después del login.

### 4. Autenticación y autorización

- [ ] Intentar iniciar sesión con contraseña incorrecta y verificar que no se revele si el usuario existe.
- [ ] Intentar acceder a una ruta protegida sin token y confirmar HTTP 401.
- [ ] Probar una ruta con un rol sin permisos y confirmar HTTP 403.
- [ ] Probar una ruta permitida para el rol correspondiente y confirmar HTTP 200.

### 5. API y base de datos

- [ ] Confirmar que `GET /api/usuarios` responda HTTP 200 con un usuario autorizado.
- [ ] Revisar que no aparezcan errores Prisma `P2022`.
- [ ] Confirmar que migraciones y seed terminen antes de que backend acepte tráfico.
- [ ] Revisar que los logs no expongan contraseñas, tokens ni credenciales.

### 6. CI

- [ ] Confirmar que el check `Quality, audit and Docker build` termine en verde.
- [ ] Si falla por `pnpm audit`, guardar el paquete, severidad y ruta de dependencia.
- [ ] Si falla por lint, tests o build, corregir el error antes de cerrar la fase.
- [ ] Confirmar que el Pull Request #251 muestre todos los checks requeridos en verde.

## Criterio de cierre

La fase 3 se puede cerrar cuando Docker Compose arranque desde cero, la prueba de persistencia sea satisfactoria, las rutas básicas respondan correctamente y el check de CI quede en verde o exista una excepción de auditoría documentada con issue y justificación técnica.