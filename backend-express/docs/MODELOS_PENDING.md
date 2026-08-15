# Modelos del Schema vs Controllers Implementados

**Schema de Prisma:** 34 modelos (generados por introspeccin de la BD real)  
**Controllers implementados:** 9 módulos con CRUD completo

---

## ✅ Controllers Implementados (9)

| Modelo | Controller | Rutas | Estado |
|--------|-----------|-------|--------|
| `usuarios` | ✅ `usuarios.controller.js` | `/api/usuarios` | CRUD completo |
| `auth` (login/register) | ✅ `auth.controller.js` | `/api/auth` | Login, register, me |
| `cliente` | ✅ `cliente.controller.js` | `/api/clientes` | CRUD completo |
| `productos` | ✅ `productos.controller.js` | `/api/productos` | CRUD completo |
| `pedidos` | ✅ `pedidos.controller.js` | `/api/pedidos` | CRUD completo |
| `cajas` | ✅ `cajas.controller.js` | `/api/cajas` | CRUD completo |
| `ingredientes` | ✅ `ingredientes.controller.js` | `/api/ingredientes` | CRUD completo |
| `domicilios` | ✅ `domicilios.controller.js` | `/api/domicilios` | CRUD completo |
| `proveedor` | ✅ `proveedor.controller.js` | `/api/proveedores` | CRUD completo |
| `password_reset_tokens` | ✅ `passwordReset.controller.js` | `/api/auth/send-reset-link`, `/api/auth/reset-password` | Reset password |

---

## ❌ Modelos Sin Controller (24+)

| Modelo | Descripcin | Prioridad | Notas |
|--------|-----------|---------|-------|
| `Factura` | Facturacin de pedidos | **Alta** | Relacionado con pedidos, necesario para reporting |
| `flujo_caja` | Movimientos de caja por turno | **Alta** | Esencial para cierre de caja y contabilidad |
| `turnos` | Turnos de cajeros | Media | Relacionado con flujo_caja |
| `roles` | Roles de usuarios | Media | Ya hay campo `rol` en usuarios, pero podra normalizarse |
| `permisos` | Permisos por rol | Baja | Depende de si se implementa sistema de permisos granular |
| `categoria_productos` | Categoras de productos | Media | Útil para filtrado y organizacin |
| `unidad_medida` | Unidades de medida (kg, lb, etc.) | Baja | Podra ser catlogo simple |
| `tipo_documento` | Tipos de documento (CC, TI, NIT) | Baja | Catlogo |
| `tipo_usuario` | Tipos de usuario | Baja | Ya hay campo en usuarios |
| `estado_pedido` | Estados de pedido | Baja | Podra ser enum o catlogo |
| `proveedor_ingrediente` | Relacin N:M proveedor-ingrediente | Media | Tabla intermedia, necesita endpoints especficos |
| `producto_ingrediente` | Recetas de productos | **Alta** | Necesario para costo de produccin |
| `detalle_pedido` | Items de un pedido | **Alta** | Ya existe en pedidos? Verificar |
| `detalle_factura` | Items de una factura | Media | Depende de Factura |
| `inventario` | Stock de ingredientes | **Alta** | Control de stock esencial |
| `ajuste_inventario` | Ajustes de inventario | Media | Para correcciones y merma |
| `compra` | Compras a proveedores | Media | Para trazabilidad |
| `detalle_compra` | Items de compra | Media | Depende de compra |
| `gasto` | Gastos operativos | Baja | Contabilidad |
| `reporte_cierre` | Reportes de cierre de turno | Baja | Depende de flujo_caja |
| `configuracion` | Configuracin del sistema | Baja | Podra ser tabla simple de key-value |
| `log_actividad` | Auditora de actividades | Baja | Para tracking de cambios |
| `notificacion` | Notificaciones del sistema | Baja | Para alertas |
| `plantilla_email` | Plantillas de emails | Baja | Para envos automatizados |

---

## Recomendacin de Implementacin

### Fase 1 (Prioridad Alta) - Esenciales para operacin
1. `Factura` - Facturacin
2. `flujo_caja` - Control de caja
3. `producto_ingrediente` - Recetas/costos
4. `inventario` - Stock

### Fase 2 (Prioridad Media) - Mejoras operativas
5. `turnos` - Gestin de turnos
6. `categoria_productos` - Organizacin
7. `proveedor_ingrediente` - Relacin proveedores
8. `detalle_pedido` - Si no est en pedidos.controller

### Fase 3 (Prioridad Baja) - Catlogos y reporting
9. `roles`, `permisos` - Si se necesita RBAC avanzado
10. `tipo_documento`, `unidad_medida` - Catlogos
11. `gasto`, `reporte_cierre` - Contabilidad
12. `log_actividad`, `notificacion` - Auditora

---

## Notas

- Los 34 modelos vienen de introspeccin real (`prisma db pull`)
- Prisma no gestiona vistas ni stored procedures (siguen en SQL crudo)
- Algunos modelos pueden ser catlogos simples que no requieren CRUD complejo
- Verificar si `detalle_pedido` ya est manejado dentro de `pedidos.controller.js`
