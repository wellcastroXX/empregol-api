-- Push / notificações: tokens de device + log de envios

CREATE TABLE IF NOT EXISTS "device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "device_tokens_token_key" ON "device_tokens"("token");
CREATE INDEX IF NOT EXISTS "device_tokens_userId_idx" ON "device_tokens"("userId");
CREATE INDEX IF NOT EXISTS "notification_logs_userId_sentAt_idx" ON "notification_logs"("userId", "sentAt");
CREATE INDEX IF NOT EXISTS "notification_logs_userId_messageId_idx" ON "notification_logs"("userId", "messageId");

ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
