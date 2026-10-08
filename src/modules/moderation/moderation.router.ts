import { Router } from 'express';
import { ModerationController } from './moderation.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createReportSchema, blockSchema } from './moderation.dto';

const router = Router();
const controller = new ModerationController();

// Denúncias
router.post('/reports', authenticate, validate(createReportSchema), controller.createReport);

// Bloqueios
router.get('/blocks', authenticate, controller.listBlocks);
router.post('/blocks', authenticate, validate(blockSchema), controller.blockUser);
router.delete('/blocks/:userId', authenticate, controller.unblockUser);

export { router as moderationRouter };
