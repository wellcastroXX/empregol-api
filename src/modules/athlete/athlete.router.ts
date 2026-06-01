import { Router } from 'express';
import { AthleteController } from './athlete.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateAthleteSchema } from './athlete.dto';
import { DashboardService } from '../dashboard/dashboard.service';

const router = Router();
const controller = new AthleteController();
const dashboardService = new DashboardService();

// Listagem — qualquer token
router.get('/', authenticate, controller.listAthletes);

// Meu perfil (deve vir antes de /:id para não conflitar)
router.get('/me', authenticate, authorize('ATHLETE'), controller.getMyProfile);
router.put('/me', authenticate, authorize('ATHLETE'), validate(updateAthleteSchema), controller.updateProfile);

// Perfil básico — qualquer token; contratantes registram view automaticamente
router.get('/:id/basic', authenticate, async (req, res, next) => {
  if (req.user!.role !== 'ATHLETE') {
    dashboardService.recordProfileView(req.params.id, req.user!.id).catch(() => null);
  }
  next();
}, controller.getBasicProfile);

// Perfil completo — só AGENT e CLUB; registra view também
router.get('/:id/full', authenticate, authorize('AGENT', 'CLUB'), async (req, res, next) => {
  dashboardService.recordProfileView(req.params.id, req.user!.id).catch(() => null);
  next();
}, controller.getFullProfile);

export { router as athleteRouter };
