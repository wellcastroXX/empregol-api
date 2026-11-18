-- Selo verificado: automatico pela completude do perfil, com veto da adm.
--
-- O selo nao e persistido. Ele e derivado em tempo de leitura a partir dos
-- campos preenchidos (ver shared/utils/verification.util.ts), porque guardar
-- um booleano exigiria recalcular a cada escrita em qualquer um dos campos
-- que entram na conta -- e um deles mora em outra tabela (season_stats).
--
-- O que esta coluna guarda e so o veto: quando true, o selo nao aparece
-- mesmo com o perfil completo. Sem ela, a adm tirava o selo e a proxima
-- edicao do proprio atleta o devolvia sozinho.

ALTER TABLE "athletes"
  ADD COLUMN IF NOT EXISTS "verificationBlocked" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "contractors"
  ADD COLUMN IF NOT EXISTS "verificationBlocked" BOOLEAN NOT NULL DEFAULT false;
