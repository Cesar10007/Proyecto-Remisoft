# Backend Express + Prisma

Backend en Express.js para la migración progresiva de RemiSoft desde Laravel hacia Node.js con Prisma.

Este backend reemplaza poco a poco al backend Laravel ubicado en `../backend`.

Durante la migración, Laravel y Express conviven en paralelo.

---

## Estado actual de la migración

Actualmente Express maneja los siguientes módulos:

- Cajas
- Ingredientes
- Domicilios
- Proveedores

El resto de módulos siguen funcionando temporalmente en Laravel.

---

## Arquitectura temporal

Durante la migración, el frontend React/Vite consume siempre `/api`.

El proxy de Vite decide si la petición va a Express o a Laravel:

```txt
React/Vite :5173
   ├── /api/cajas        -> Express :3000
   ├── /api/ingredientes -> Express :3000
   ├── /api/domicilios   -> Express :3000
   ├── /api/proveedores  -> Express :3000
   └── resto de /api     -> Laravel :8000
```

Esto permite migrar módulo por módulo sin romper el frontend.

---

## Puertos usados

| Servicio | Puerto |
|---|---:|
| Frontend React/Vite | 5173 |
| Backend Express | 3000 |
| Backend Laravel | 8000 |
| MariaDB | 3306 |

---

## Tecnologías usadas

- Node.js
- Express.js
- Prisma ORM
- MariaDB
- Laravel Sanctum, temporalmente para autenticación
- Vite proxy, para enrutar peticiones entre Laravel y Express

---

## Autenticación actual

Por ahora Express no implementa login propio.

El login sigue funcionando desde Laravel:

```txt
POST /api/login -> Laravel
```

Laravel genera un token de Sanctum.

Express valida ese mismo token leyendo directamente la tabla:

```txt
personal_access_tokens
```

Flujo actual:

```txt
Usuario inicia sesión en Laravel
        ↓
Laravel genera token Sanctum
        ↓
Frontend guarda token
        ↓
Frontend llama rutas migradas
        ↓
Express valida token Sanctum
        ↓
Express responde usando Prisma
```

Esto permite que los módulos migrados sigan usando la misma sesión del usuario.

---

## Variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Ejemplo de `.env`:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=remisoft
DB_USERNAME=remisoft
DB_PASSWORD=remisoft123

DATABASE_URL="mysql://remisoft:remisoft123@127.0.0.1:3306/remisoft"
```

Importante:

- `DATABASE_URL` es usada por Prisma CLI.
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD` son usadas por el backend Express al crear el `PrismaClient`.
- No subas el archivo `.env` al repositorio.

---

## Instalación

Desde la carpeta del backend Express:

```bash
cd backend-express
pnpm install
```

Si no tienes `pnpm`, puedes usar:

```bash
npm install
```

---

## Generar Prisma Client

Después de instalar dependencias:

```bash
pnpm run prisma:generate
```

O con npm:

```bash
npm run prisma:generate
```

---

## Ejecutar Express en desarrollo

```bash
cd backend-express
pnpm dev
```

O con npm:

```bash
npm run dev
```

Express debería iniciar en:

```txt
http://localhost:3000
```

---

## Health check

Para comprobar que Express está funcionando:

```txt
GET /health
```

Respuesta esperada:

```json
{
  "status": "RemiSoft Express online"
}
```

En Codespaces, la URL será similar a:

```txt
https://NOMBRE-CODESPACE-3000.app.github.dev/health
```

---

## Scripts disponibles

```json
{
  "dev": "node --watch src/server.js",
  "start": "node src/server.js",
  "prisma:generate": "prisma generate",
  "prisma:db:pull": "prisma db pull",
  "prisma:migrate:dev": "prisma migrate dev",
  "prisma:migrate:deploy": "prisma migrate deploy",
  "prisma:studio": "prisma studio"
}
```

Uso:

```bash
pnpm dev
pnpm run prisma:generate
pnpm run prisma:db:pull
pnpm run prisma:migrate:dev
pnpm run prisma:migrate:deploy
pnpm run prisma:studio
```

---

## Rutas actuales en Express

### Health check

```txt
GET /health
```

### Cajas

```txt
GET    /api/cajas
POST   /api/cajas
PUT    /api/cajas/:id
DELETE /api/cajas/:id
```

### Ingredientes

```txt
GET    /api/ingredientes
POST   /api/ingredientes
PUT    /api/ingredientes/:id
DELETE /api/ingredientes/:id
```

### Domicilios

```txt
GET    /api/domicilios
POST   /api/domicilios
PUT    /api/domicilios/:id
DELETE /api/domicilios/:id
```

### Proveedores

```txt
GET    /api/proveedores
GET    /api/proveedores/:id
POST   /api/proveedores
PUT    /api/proveedores/:id
DELETE /api/proveedores/:id
```

---

## Probar rutas protegidas

Primero obtén un token desde Laravel:

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"laura.gomez@resto.com","contrasena":"123456"}'
```

Guarda el token:

```bash
TOKEN='TU_TOKEN_AQUI'
```

Prueba una ruta directa de Express:

```bash
curl http://localhost:3000/api/cajas \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

También puedes probar pasando por el proxy del frontend:

```bash
curl http://localhost:5173/api/cajas \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Si todo está bien, debe responder una lista de cajas.

---

## Estructura actual

```txt
backend-express/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── cajas.controller.js
│   │   ├── domicilios.controller.js
│   │   ├── ingredientes.controller.js
│   │   └── proveedor.controller.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── cajas.routes.js
│   │   ├── domicilios.routes.js
│   │   ├── ingredientes.routes.js
│   │   └── proveedor.routes.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

---

## Próximas mejoras recomendadas

El ejemplo del profesor usa una arquitectura más organizada por capas.

Para RemiSoft, la siguiente mejora sería aplicar esa idea gradualmente:

```txt
src/
├── config/
├── controllers/
├── routes/
├── services/
├── validators/
├── middleware/
└── server.js
```

La idea es que:

- Las rutas solo definan endpoints.
- Los controladores manejen `req` y `res`.
- Los servicios tengan la lógica de negocio.
- Prisma quede centralizado.
- Las validaciones no estén mezcladas con la lógica principal.

---

## Pendiente de migración

Todavía falta migrar a Express:

- Clientes
- Productos
- Usuarios
- Pedidos
- Facturación
- Pagos
- Inventario avanzado
- Reportes
- IA
- Autenticación completa

También falta reemplazar progresivamente los archivos SQL manuales:

```txt
database/DBFAMILIAREMI.sql
database/datos.sql
database/vistas/
database/procedimientos/
```

por:

```txt
backend-express/prisma/schema.prisma
backend-express/prisma/migrations/
backend-express/prisma/seed.js
```

---

## Estado validado

En esta fase ya se validó:

```txt
GET /health en Express -> OK
/api/cajas sin token -> No autenticado
/api/cajas con token Sanctum -> Lista de cajas
/api/cajas vía Vite proxy -> Lista de cajas
/api/login vía Vite proxy -> Laravel responde token
```

Por tanto, la convivencia Laravel + Express + Prisma quedó funcionando correctamente.