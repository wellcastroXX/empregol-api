import { Router } from 'express';
import { AthleteVideoController } from './athlete-video.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { uploadMedia } from '../../shared/upload/upload';
import { createMediaSchema, updateMediaSchema } from './athlete-video.dto';

const router = Router();
const controller = new AthleteVideoController();

// GET  /athletes/me/media?type=VIDEO|PHOTO|EXTERNAL_LINK
router.get('/',        authenticate, authorize('ATHLETE'), controller.list);
// POST /athletes/me/media         — link externo / URL já hospedada (JSON)
router.post('/',       authenticate, authorize('ATHLETE'), validate(createMediaSchema), controller.add);
// POST /athletes/me/media/upload  — upload de arquivo de vídeo/foto (multipart `file`)
router.post('/upload', authenticate, authorize('ATHLETE'), uploadMedia, controller.upload);
// PATCH /athletes/me/media/:id    — edita metadados (título, categoria, etc.)
router.patch('/:id',   authenticate, authorize('ATHLETE'), validate(updateMediaSchema), controller.update);
// DELETE /athletes/me/media/:id
router.delete('/:id',  authenticate, authorize('ATHLETE'), controller.remove);

export { router as athleteVideoRouter };
