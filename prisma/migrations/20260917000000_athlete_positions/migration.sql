-- athletes: até 3 posições. `position` continua sendo a principal (positions[0]).
ALTER TABLE "athletes" ADD COLUMN IF NOT EXISTS "positions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill: registros existentes recebem a posição atual como única do array.
UPDATE "athletes" SET "positions" = ARRAY["position"] WHERE cardinality("positions") = 0;
