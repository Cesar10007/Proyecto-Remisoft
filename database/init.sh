#!/bin/bash
set -euo pipefail
# WORKDIR del contenedor: /app. El SQL versionado se monta en /app/database.
REMISOFT_SQL_DIR=/app/database bash prisma/setup-prisma.sh
exec node src/server.js
