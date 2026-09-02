# ---- Stage: base ----
FROM node:20.19.4-bookworm-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

# ---- Stage: deps ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Stage: generate ----
FROM deps AS generate
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm exec prisma generate

# ---- Stage: runtime ----
FROM base AS runtime
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends mariadb-client \
    && rm -rf /var/lib/apt/lists/*

COPY --from=generate /app/node_modules ./node_modules
COPY --from=generate /app/prisma ./prisma
COPY --from=generate /app/prisma.config.ts ./

# Copia el código fuente. backend/.dockerignore excluye src/generated.
COPY . .

# Copia el cliente Prisma generado dentro de una etapa limpia.
COPY --from=generate /app/src/generated ./src/generated

EXPOSE 3000
CMD ["bash", "/app/database/init.sh"]