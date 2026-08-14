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