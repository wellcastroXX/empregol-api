-- Moderação: denúncias (reports) e bloqueios (blocks) de usuários.

CREATE TABLE IF NOT EXISTS "reports" (
  "id"         TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reportedId" TEXT NOT NULL,
  "reason"     TEXT NOT NULL,
  "details"    TEXT,
  "context"    TEXT,
  "resolved"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "reports_reportedId_idx" ON "reports"("reportedId");
CREATE INDEX IF NOT EXISTS "reports_resolved_idx" ON "reports"("resolved");

CREATE TABLE IF NOT EXISTS "blocks" (
  "id"        TEXT NOT NULL,
  "blockerId" TEXT NOT NULL,
  "blockedId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "blocks_blockerId_blockedId_key" ON "blocks"("blockerId", "blockedId");
CREATE INDEX IF NOT EXISTS "blocks_blockerId_idx" ON "blocks"("blockerId");
CREATE INDEX IF NOT EXISTS "blocks_blockedId_idx" ON "blocks"("blockedId");

ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blocks"  ADD CONSTRAINT "blocks_blockerId_fkey"  FOREIGN KEY ("blockerId")  REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blocks"  ADD CONSTRAINT "blocks_blockedId_fkey"  FOREIGN KEY ("blockedId")  REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
