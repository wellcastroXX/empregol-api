import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new NotificationsController();

// Registro/remoção do token de push (qualquer usuário autenticado)
router.post('/devices', authenticate, controller.register);
router.delete('/devices/:token', authenticate, controller.unregister);

export { router as notificationsRouter };
