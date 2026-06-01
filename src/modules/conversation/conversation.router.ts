import { Router } from 'express';
import { ConversationController } from './conversation.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new ConversationController();

// Lista conversas do usuário logado (atleta ou contratante)
// ?filter=unread | agents | clubs
router.get('/',              authenticate, controller.listMine);

// Contratante inicia uma conversa com um atleta
router.post('/',             authenticate, authorize('AGENT', 'CLUB'), controller.open);

// Marca conversa como lida
router.patch('/:id/read',    authenticate, controller.markRead);

export { router as conversationRouter };
