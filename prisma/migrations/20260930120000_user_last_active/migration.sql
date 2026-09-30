-- lastActiveAt para gatilhos de inatividade. Backfill = agora (todos "ativos"
-- no deploy, pra não disparar reativação em massa nos usuários existentes).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "users" SET "lastActiveAt" = CURRENT_TIMESTAMP WHERE "lastActiveAt" IS NULL;
CREATE INDEX IF NOT EXISTS "users_lastActiveAt_idx" ON "users"("lastActiveAt");
