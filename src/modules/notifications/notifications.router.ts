import { Router, Request, Response, NextFunction } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new NotificationsController();

/** Protege rotas admin com o header x-admin-key (== env ADMIN_KEY). */
function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const key = process.env.ADMIN_KEY;
  if (!key || req.header('x-admin-key') !== key) {
    res.status(403).json({ status: 'error', message: 'Acesso negado' });
    return;
  }
  next();
}

// Registro/remoção do token de push (qualquer usuário autenticado)
router.post('/devices', authenticate, controller.register);
router.delete('/devices/:token', authenticate, controller.unregister);

// Disparo avulso / broadcast (admin — header x-admin-key)
router.post('/send', requireAdminKey, controller.send);
router.post('/broadcast', requireAdminKey, controller.broadcast);

export { router as notificationsRouter };
