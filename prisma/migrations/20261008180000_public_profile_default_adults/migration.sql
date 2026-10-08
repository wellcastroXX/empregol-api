-- Vitrine pública passa a ser o padrão de quem tem 18 anos ou mais.
--
-- Liga `publicProfile` e gera o slug dos atletas que já estavam cadastrados.
-- Menor de 18 não é tocado: continua fechado e sem slug (Termos, 3.2(d)).
--
-- O slug sai do nome: `normalize(..., NFD)` separa o acento da letra e o regex
-- apaga as marcas combinantes (U+0300-U+036F), o que dispensa a extensão
-- `unaccent` e mantém este arquivo em ASCII puro — texto acentuado aqui dentro
-- dependeria da codificação de quem aplica a migration. Depois, tudo que não é
-- letra ou número vira hífen, e homônimos ganham sufixo pela ordem de cadastro.

WITH candidatos AS (
  SELECT
    "id",
    NULLIF(
      TRIM(BOTH '-' FROM regexp_replace(
        regexp_replace(
          normalize(lower("fullName"), NFD),
          E'[\\u0300-\\u036f]', '', 'g'
        ),
        '[^a-z0-9]+', '-', 'g'
      )),
      ''
    ) AS base,
    "createdAt"
  FROM "athletes"
  WHERE "slug" IS NULL
    AND "birthDate" <= (CURRENT_DATE - INTERVAL '18 years')
),
numerados AS (
  SELECT
    "id",
    COALESCE(base, 'atleta') AS base,
    ROW_NUMBER() OVER (PARTITION BY COALESCE(base, 'atleta') ORDER BY "createdAt", "id") AS posicao
  FROM candidatos
),
-- Desloca a numeração quando alguém já abriu a vitrine antes desta migration
-- e levou o slug que seria gerado aqui.
ordenados AS (
  SELECT
    n."id",
    n.base,
    n.posicao + (
      SELECT COUNT(*)
      FROM "athletes" x
      WHERE x."slug" = n.base
         OR x."slug" ~ ('^' || n.base || '-[0-9]+$')
    ) AS indice
  FROM numerados n
)
UPDATE "athletes" a
SET
  "slug" = CASE WHEN o.indice = 1 THEN o.base ELSE o.base || '-' || o.indice END,
  "publicProfile" = true
FROM ordenados o
WHERE a."id" = o."id";
