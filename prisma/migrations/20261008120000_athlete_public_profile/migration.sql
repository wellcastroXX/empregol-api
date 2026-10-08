-- Vitrine pública do atleta: empregol.co/p/<slug>.
-- Fechada por padrão; o slug só é gerado quando o atleta abre a vitrine.
ALTER TABLE "athletes" ADD COLUMN "publicProfile" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "athletes" ADD COLUMN "slug" TEXT;

-- Único entre os preenchidos; vários NULL convivem num índice único no Postgres.
CREATE UNIQUE INDEX "athletes_slug_key" ON "athletes"("slug");
