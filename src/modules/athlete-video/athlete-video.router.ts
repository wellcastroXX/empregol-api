import { Router } from 'express';
import { AthleteVideoController } from './athlete-video.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createVideoSchema } from './athlete-video.dto';

const router = Router();
const controller = new AthleteVideoController();

router.get('/',        authenticate, authorize('ATHLETE'), controller.list);
router.post('/',       authenticate, authorize('ATHLETE'), validate(createVideoSchema), controller.add);
router.delete('/:id',  authenticate, authorize('ATHLETE'), controller.remove);

export { router as athleteVideoRouter };
