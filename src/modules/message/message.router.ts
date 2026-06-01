import { Router } from 'express';
import { MessageController } from './message.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { sendMessageSchema } from './message.dto';

const router = Router({ mergeParams: true });
const controller = new MessageController();

// GET  /conversations/:id/messages?cursor=<id>   (histórico paginado)
router.get('/',  authenticate, controller.list);

// POST /conversations/:id/messages               (envia mensagem via REST)
router.post('/', authenticate, validate(sendMessageSchema), controller.send);

export { router as messageRouter };
