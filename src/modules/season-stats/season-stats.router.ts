import { Router } from 'express';
import { SeasonStatsController } from './season-stats.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { upsertSeasonStatsSchema } from './season-stats.dto';

const router = Router();
const controller = new SeasonStatsController();

// Cria ou atualiza atributos técnicos de um ano (imagem 3 — sliders)
router.put('/', authenticate, authorize('ATHLETE'), validate(upsertSeasonStatsSchema), controller.upsert);

// Lista todos os anos
router.get('/', authenticate, authorize('ATHLETE'), controller.list);

// Busca por ano específico
router.get('/:year', authenticate, authorize('ATHLETE'), controller.getByYear);

// Remove a temporada de um ano
router.delete('/:year', authenticate, authorize('ATHLETE'), controller.remove);

export { router as seasonStatsRouter };
