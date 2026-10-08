import { Router } from 'express';
import { AthleteController } from './athlete.controller';

const router = Router();
const controller = new AthleteController();

/**
 * GET /public/athletes/:slug
 *
 * Única rota de atleta sem `authenticate`: é a vitrine que o próprio atleta
 * abriu (empregol.co/p/<slug>). Responde 404 — e não 403 — quando a vitrine
 * está fechada, para não confirmar a existência de um perfil privado.
 *
 * Fica num router separado do athleteRouter porque aquele aplica autenticação
 * rota a rota; um esquecimento ali vazaria dado de atleta fechado.
 */
router.get('/athletes/:slug', controller.getPublicProfile);

export { router as publicAthleteRouter };
