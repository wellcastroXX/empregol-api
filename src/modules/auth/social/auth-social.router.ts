import { Router } from 'express';
import { AuthSocialController } from './auth-social.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import { socialLoginSchema } from './auth-social.dto';

const router = Router();
const controller = new AuthSocialController();

// POST /auth/social/login  { provider, idToken }
router.post('/login', validate(socialLoginSchema), controller.login);

export { router as authSocialRouter };
