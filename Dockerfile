# ─── Stage 1: build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Prisma precisa de openssl
RUN apk add --no-cache openssl

WORKDIR /app

# Instala TODAS as deps (inclui dev: typescript, prisma CLI)
COPY package*.json ./
RUN npm ci

# Gera o Prisma Client e compila o TypeScript
COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─── Stage 2: runtime ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

ENV NODE_ENV=production
WORKDIR /app

# Copia node_modules (com Prisma Client e CLI já gerados) e o build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

# Aplica migrations e sobe o servidor
ENTRYPOINT ["./docker-entrypoint.sh"]
