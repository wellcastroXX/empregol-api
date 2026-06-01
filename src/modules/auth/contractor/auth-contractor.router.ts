import { Router } from 'express';
import { AuthContractorController } from './auth-contractor.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import {
  registerContractorSchema,
  loginSchema,
  verifyEmailSchema,
  resendCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth-contractor.dto';

const router = Router();
const controller = new AuthContractorController();

router.post('/register', validate(registerContractorSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post('/resend-code', validate(resendCodeSchema), controller.resendCode);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

export { router as authContractorRouter };
