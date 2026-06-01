import { Router } from 'express';
import { AuthAthleteController } from './auth-athlete.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import {
  registerAthleteSchema,
  loginSchema,
  verifyEmailSchema,
  resendCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth-athlete.dto';

const router = Router();
const controller = new AuthAthleteController();

router.post('/register', validate(registerAthleteSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post('/resend-code', validate(resendCodeSchema), controller.resendCode);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

export { router as authAthleteRouter };
