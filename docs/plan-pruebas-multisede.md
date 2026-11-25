# Plan de pruebas: aislamiento por sede + gerente multisede

Commit de referencia: `c86380a` (rama `arena/9b76df34-proyecto-remisoft`).
Nombre sugerido para la rama: **`feat/aislamiento-multisede`**.

El plan va de lo que no necesita nada a lo que necesita base de datos, para que
puedas parar en cualquier fase y seguir teniendo evidencia.

| Fase | Necesita | Duración | Qué demuestra |
| --- | --- | --- | --- |
| 1. Estática | Node 22 | 2 min | Ninguna ruta quedó sin rol ni sin filtro de sede |
| 2. Unitaria | Node 22 | 1 min | La regla del multisede es correcta sin BD |
| 3. Migración | MySQL de pruebas | 10 min | Tabla, backfill y triggers funcionan |
| 4. Integración | MySQL + `pnpm generate` | 15 min | Aislamiento A/B real por HTTP |
| 5. Manual / UI | Backend + frontend | 20 min | El gerente cambia de sede desde la pantalla |
| 6. Regresión | Backend + frontend | 15 min | Nada del flujo anterior se rompió |

---

## Fase 1 — Verificación estática (sin BD)

```bash
cd backend
pnpm install
pnpm auditar:rutas
```

**Esperado:** `OK: todas las rutas montadas tienen rol y filtro de sede.` (exit 0).

Si falla, el mensaje dice exactamente qué ruta y por qué: sin `requireRole`, sin
filtro de sede, huérfana en `src/routes/` o modelo Prisma inexistente.

```bash
pnpm exec eslint src tests scripts     # exit 0, sin salida
```

## Fase 2 — Pruebas unitarias (sin BD)

```bash
cd backend
node --test tests/multisede.test.js tests/aislamiento-rutas.test.js \
             tests/establecimiento.test.js tests/validation.test.js \
             tests/facturacion.test.js tests/salon.test.js
```

**Esperado:** `# pass 27`, `# fail 0`.

Las 8 de `multisede.test.js` son las que importan para este cambio:

| Prueba | Qué garantiza |
| --- | --- |
| superadmin no está limitado | El rol global sigue funcionando |
| gerente de una sola sede | El comportamiento anterior no cambió |
| gerente multisede entra a cada una | La membresía habilita el cambio |
| sede ajena da `false` | La membresía no da acceso a cualquier sede |
| la sede activa siempre cuenta | Datos migrados no dejan al usuario sin acceso |
| ids inválidos se descartan | `'abc'`, `0`, `-1`, `null` no abren nada |
| **el filtro usa la sede ACTIVA** | Pertenecer a A y B **no** filtra por A y B |
| sin sede activa → 403 | No se degrada a comodín |

Esa penúltima es la prueba central: si alguien "mejora" `filtroRestaurante` para
que devuelva un conjunto, esta prueba falla antes de que llegue a producción.

---

## Fase 3 — Migración y base de datos

> Nunca sobre la base de producción. Usa `remisoft_test`.

```bash
cd backend
# 1. Aplicar
pnpm exec prisma migrate deploy

# 2. Regenerar el cliente (aquí sí hace falta red: descarga el engine)
pnpm exec prisma generate
```

Si `generate` falla por red, la migración **sí** se aplicó; solo no podrás
correr la fase 4 en esa máquina.

### 3.1 La tabla existe y el backfill cuadra

```sql
-- Debe existir usuario_restaurante con PK compuesta y 1 índice
SHOW CREATE TABLE usuario_restaurante;

-- Ambos números deben coincidir: cada usuario con sede activa tiene membresía
SELECT (SELECT COUNT(*) FROM usuario WHERE id_restaurante IS NOT NULL) AS con_sede,
       (SELECT COUNT(*) FROM usuario_restaurante)                     AS membresias;

-- Debe devolver 0 filas: ninguna sede activa quedó huérfana
SELECT u.id_usuario, u.id_restaurante
FROM usuario u
LEFT JOIN usuario_restaurante m
       ON m.id_usuario = u.id_usuario AND m.id_restaurante = u.id_restaurante
WHERE u.id_restaurante IS NOT NULL AND m.id_usuario IS NULL;
```

### 3.2 Los triggers existen

```sql
SHOW TRIGGERS WHERE `Table` IN ('usuario', 'usuario_restaurante');
```

**Esperado:** 4 triggers → `miembro_sede_ai`, `miembro_sede_au` (en `usuario`) y
`act_usuario_restaurante_i`, `act_usuario_restaurante_d` (en `usuario_restaurante`).

### 3.3 El invariante se cumple incluso por SQL directo

```sql
-- Elegir un usuario de prueba con sede 1 y una sede 2 existente
SET @u = <id_usuario_de_prueba>, @s2 = <id_restaurante_2>;

DELETE FROM usuario_restaurante WHERE id_usuario = @u;
UPDATE usuario SET id_restaurante = @s2 WHERE id_usuario = @u;

-- Debe devolver la fila (@u, @s2): el trigger la recreó
SELECT * FROM usuario_restaurante WHERE id_usuario = @u;
```

Este es el punto que hace que el modelo sea robusto: aunque un `INSERT`/`UPDATE`
llegue por SQL, la sede activa nunca queda fuera de las permitidas.

### 3.4 Cada alta de personal crea su membresía

Aprobar una solicitud de gerente (o crear gerente desde el panel) y luego:

```sql
SELECT u.id_usuario, u.id_restaurante, m.id_restaurante AS membresia
FROM usuario u LEFT JOIN usuario_restaurante m ON m.id_usuario = u.id_usuario
ORDER BY u.id_usuario DESC LIMIT 5;
```

**Esperado:** el gerente nuevo aparece con su sede como membresía.

---

## Fase 4 — Integración por HTTP (matriz A/B)

```bash
cd backend
ESTABLECIMIENTO_DB_TEST=1 pnpm test
```

**Esperado:** verde, incluidos los dos bloques de
`tests/aislamiento-sedes.integration.test.js`: el clásico (A/B) y el de
`multisede: el gerente cambia de sede sin perder el aislamiento`.

Si prefieres verlo caso por caso, ese archivo contiene los 7 escenarios del
multisede; los esenciales son:

| Escenario | Resultado esperado |
| --- | --- |
| Sin membresía, `GET /usuarios/mis-sedes` | Solo su sede |
| Sin membresía, `PATCH /usuarios/me/sede` a sede ajena | **404** |
| Gerente intenta `PUT /usuarios/:id/sedes` | **403** |
| Superadmin asigna dos sedes | 200; la sede activa **no** cambia sola |
| Gerente cambia a la segunda sede | 200; `GET /productos` devuelve los de esa sede |
| `GET /productos?id_restaurante=<su otra sede>` | Sin efecto: manda la sede activa |
| Se retira la sede activa | La activa pasa a una sede válida del conjunto |
| Superadmin en `me/sede` | **409** (usa el selector global) |

### 4.1 Casos negativos (a mano, con `curl`)

```bash
export API=http://localhost:3000/api
export TOKEN_GERENTE="..."     # gerente con 2 sedes
export TOKEN_ADMIN="..."       # superadmin
export ID_GERENTE="<id>"
```

| Caso | Petición | Esperado |
| --- | --- | --- |
| Sin token | `PATCH /usuarios/me/sede` | 401 |
| Rol operativo (mesero/cajero) | `PATCH /usuarios/me/sede` | 403 |
| Id inválido | `-d '{"id_restaurante":"abc"}'` | 422 |
| Id inexistente | `-d '{"id_restaurante":999999}'` | 404 |
| Sede inactiva | `-d '{"id_restaurante":<sede_activo_false>}'` | 404 |
| Conjunto vacío | `PUT /usuarios/:id/sedes -d '{"sedes":[]}'` | 422 |
| Sede inexistente en el conjunto | `-d '{"sedes":[999999]}'` | 422 |
| Más de 50 sedes | `-d '{"sedes":[1..51]}'` | 422 |
| Superadmin como objetivo | `PUT /usuarios/<id_superadmin>/sedes` | 409 |
| Usuario eliminado | `PUT /usuarios/<id_eliminado>/sedes` | 404 |

El script `backend/scripts/prueba-aislamiento.sh` ya trae los casos 7–10
(multisede) listos; si exportas `TOKEN_ADMIN`, `ID_A_SEDE`, `ID_B` e
`ID_GERENTE_B`, los corre de seguido.

---

## Fase 5 — Manual en la interfaz

**A. Como superadmin**

1. **Gestión de Gerentes** → cada fila debe tener el botón nuevo **Sedes**.
2. Al abrirlo: lista de establecimientos con casillas y la etiqueta *Sede activa*
   en la del gerente.
3. Marcar una segunda sede → **Guardar establecimientos** → el modal cierra y la
   tabla se recarga sin errores.
4. Desmarcar todas → debe mostrar *"Asigna al menos un establecimiento."* y no
   guardar.

**B. Como gerente con dos sedes**

5. En el encabezado aparece el **selector de establecimiento**.
6. Cambiarlo → la página se recarga y el nombre bajo el título cambia.
7. Verificar que **todo** el panel corresponde a la sede nueva: dashboard,
   productos, inventario, cajas, historial. No debe aparecer nada de la anterior.
8. Recargar con F5 → sigue en la sede nueva (el cambio es persistente).
9. Cambiar de vuelta → vuelve a ver lo suyo.

**C. Como gerente con una sola sede**

10. **No** debe aparecer ningún selector: la interfaz queda idéntica a la de
    antes del cambio.

**D. Con el sistema cerrado**

11. Cerrar el sistema en la sede A (con el gerente activo en A) y, desde la
    pantalla de "Sistema cerrado", cambiar a la sede B: debe permitir el cambio y
    dejar operar en B. (Es el motivo de `permiteSedeCerrada`.)

---

## Fase 6 — Regresión

Nada de esto debería cambiar; si algo falla, el multisede rompió algo que no
debía tocar:

```bash
cd backend
pnpm test                    # unitarias (las de BD requieren su entorno)
pnpm exec eslint src tests scripts
cd ../frontend
pnpm exec tsc --noEmit
pnpm exec eslint src
pnpm build
```

Lista corta de humo con dos gerentes (A y B), como antes:

1. B no ve productos, cajas, pedidos ni personal de A.
2. B recibe 404 en cada `/:id` de A.
3. `?id_restaurante` y `id_restaurante` en el body se ignoran.
4. Referencias cruzadas (producto de A en pedido de B) → 422.
5. Un gerente de una sola sede sigue viendo y operando exactamente igual.
6. Cierre total de jornada sin pendientes funciona igual que antes.

---

## Criterio de aceptación

El cambio se acepta cuando:

- Fases 1, 2 y 6 en verde en cualquier máquina.
- Fase 3: `usuario_restaurante` con backfill completo, 4 triggers y 0 huérfanos.
- Fase 4: los dos bloques de integración en verde.
- Fase 5: selector visible solo con más de una sede y datos coherentes tras el cambio.
- Y, sobre todo: **ninguna consulta devuelve datos de dos sedes a la vez** en
  ningún paso.
