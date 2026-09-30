import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { notifications } from './notifications.service';

const registerSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']).optional(),
});

export class NotificationsController {
  // POST /notifications/devices  → regista o token de push do usuário logado
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, platform } = registerSchema.parse(req.body);
      await notifications.registerDevice(req.user!.id, token, platform);
      res.json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /notifications/devices/:token  → remove o token (logout / opt-out)
  unregister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await notifications.unregisterDevice(req.params.token);
      res.json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  };
}
