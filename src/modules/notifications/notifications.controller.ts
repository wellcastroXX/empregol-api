import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { notifications } from './notifications.service';

const registerSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']).optional(),
});

const sendSchema = z.object({
  userId: z.string().min(1),
  messageId: z.string().min(1),
  vars: z.record(z.union([z.string(), z.number()])).optional(),
});

const broadcastSchema = z.object({
  messageId: z.string().min(1),
  vars: z.record(z.union([z.string(), z.number()])).optional(),
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

  // POST /notifications/send  → dispara uma mensagem a um usuário (admin/teste)
  send = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, messageId, vars } = sendSchema.parse(req.body);
      const data = await notifications.dispatch(userId, messageId, vars ?? {});
      res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  };

  // POST /notifications/broadcast  → dispara a todos do público da mensagem (admin)
  broadcast = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { messageId, vars } = broadcastSchema.parse(req.body);
      const data = await notifications.broadcast(messageId, vars ?? {});
      res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  };
}
