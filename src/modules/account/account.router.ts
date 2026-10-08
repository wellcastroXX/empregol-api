import { Router } from 'express';
import { AccountController } from './account.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new AccountController();

// DELETE /account — exclui a conta do usuário autenticado (qualquer papel)
router.delete('/', authenticate, controller.deleteAccount);

export { router as accountRouter };
