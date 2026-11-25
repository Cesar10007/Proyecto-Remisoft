#!/usr/bin/env bash
# Prueba manual de aislamiento entre sedes con curl (una línea por comando).
# Requiere backend corriendo y dos gerentes de sedes distintas.
#
# Uso:
#   export API=http://localhost:3000/api
#   export TOKEN_A="..."   # gerente de la sede A (POST /api/auth/login)
#   export TOKEN_B="..."   # gerente de la sede B
#   export ID_A="123"      # id de un producto de la sede A
#   bash scripts/prueba-aislamiento.sh
set -u
API="${API:-http://localhost:3000/api}"
: "${TOKEN_A:?Falta TOKEN_A}" "${TOKEN_B:?Falta TOKEN_B}" "${ID_A:?Falta ID_A}"

echo "== 1. B lista productos: debe ser [] =="
curl -s -H "Authorization: Bearer $TOKEN_B" "$API/productos"

echo; echo "== 2. B pide el producto de A por ID: debe ser 404 =="
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOKEN_B" "$API/productos/$ID_A"

echo "== 3. B intenta ?id_restaurante de A: debe seguir [] =="
curl -s -H "Authorization: Bearer $TOKEN_B" "$API/productos?id_restaurante=1"

echo; echo "== 4. B crea con id_restaurante ajeno en el body: queda en B =="
curl -s -X POST -H "Authorization: Bearer $TOKEN_B" -H "Content-Type: application/json" \
  -d '{"Nombre":"Tamal","precio_venta":1000,"id_restaurante":1}' "$API/productos"

echo; echo "== 5. A sigue viendo solo lo suyo =="
curl -s -H "Authorization: Bearer $TOKEN_A" "$API/productos"

echo; echo "== 6. Sin token: 401 =="
curl -s -o /dev/null -w "%{http_code}\n" "$API/productos"

# ---------------------------------------------------------------------------
# Gerente multisede (opcional). Requiere además un superadmin y los ids de sede.
#   export TOKEN_ADMIN="..."  ID_A_SEDE="1"  ID_B="456"  ID_GERENTE_B="78"
# ---------------------------------------------------------------------------
if [ -n "${TOKEN_ADMIN:-}" ] && [ -n "${ID_A_SEDE:-}" ] && [ -n "${ID_B:-}" ] && [ -n "${ID_GERENTE_B:-}" ]; then
  echo; echo "== 7. B, sin membresía, intenta pasar a la sede A: debe ser 404 =="
  curl -s -o /dev/null -w "%{http_code}\n" -X PATCH -H "Authorization: Bearer $TOKEN_B" \
    -H "Content-Type: application/json" -d "{\"id_restaurante\":$ID_A_SEDE}" "$API/usuarios/me/sede"

  echo "== 8. El superadmin le asigna A y B: 200 =="
  curl -s -X PUT -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
    -d "{\"sedes\":[$ID_A_SEDE,$ID_B]}" "$API/usuarios/$ID_GERENTE_B/sedes"

  echo; echo "== 9. B cambia su sede activa a A: ahora ve la sede A =="
  curl -s -X PATCH -H "Authorization: Bearer $TOKEN_B" -H "Content-Type: application/json" \
    -d "{\"id_restaurante\":$ID_A_SEDE}" "$API/usuarios/me/sede"
  echo; curl -s -H "Authorization: Bearer $TOKEN_B" "$API/productos"

  echo; echo "== 10. Aun siendo miembro, ?id_restaurante no cambia la sede activa =="
  curl -s -H "Authorization: Bearer $TOKEN_B" "$API/productos?id_restaurante=$ID_B"
fi
