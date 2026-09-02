# syntax=docker/dockerfile:1

# ---- Stage: base ----
FROM node:20.19.4-bookworm-slim AS base
LABEL stage=base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && \
    corepack use pnpm@10.15.0 && \
    pnpm config set store-dir /pnpm/store

# ---- Stage: build ----
FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---- Stage: runtime ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]