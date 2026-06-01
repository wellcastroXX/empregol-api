import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new DashboardController();

// Home do atleta — stats + carrossel + convite recente + quem te viu
router.get('/athlete', authenticate, authorize('ATHLETE'), controller.getAthleteDashboard);

// Perfil completo % (imagem 2) — seções e campos preenchidos
router.get('/athlete/completion', authenticate, authorize('ATHLETE'), controller.getProfileCompletion);

export { router as dashboardRouter };
