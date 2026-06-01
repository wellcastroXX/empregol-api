import { Router } from 'express';
import { AthleteVideoController } from './athlete-video.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createMediaSchema } from './athlete-video.dto';

const router = Router();
const controller = new AthleteVideoController();

// GET  /athletes/me/media?type=VIDEO|PHOTO|EXTERNAL_LINK
router.get('/',       authenticate, authorize('ATHLETE'), controller.list);
// POST /athletes/me/media  (Nova Mídia — imagem 3)
router.post('/',      authenticate, authorize('ATHLETE'), validate(createMediaSchema), controller.add);
// DELETE /athletes/me/media/:id
router.delete('/:id', authenticate, authorize('ATHLETE'), controller.remove);

export { router as athleteVideoRouter };
