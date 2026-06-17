import { Router } from 'express';
import { ExploreController } from './explore.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new ExploreController();

/**
 * GET /explore/athletes
 *
 * Query params (todos opcionais):
 *   q, positions, level, dominantFoot, availability, agencyStatus, gender,
 *   ageMin, ageMax, heightMin, heightMax, weightMin, weightMax,
 *   state, salaryMin, salaryMax, goalsMin, assistsMin, minutesPlayedMin,
 *   orderBy, orderDir, page, limit
 */
router.get('/athletes', authenticate, authorize('AGENT', 'CLUB'), controller.search);

// GET /explore/contractors — "Mercado": clubes/agentes da plataforma (qualquer token)
router.get('/contractors', authenticate, controller.searchContractors);

export { router as exploreRouter };
