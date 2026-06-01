#!/bin/sh
set -e

echo "⏳ Aplicando migrations do Prisma..."
npx prisma migrate deploy

echo "🚀 Iniciando servidor..."
exec node dist/server.js
