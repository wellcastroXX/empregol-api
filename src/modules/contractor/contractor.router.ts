import { Router } from 'express';
import { ContractorController } from './contractor.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { updateContractorSchema } from './contractor.dto';

const router = Router();
const controller = new ContractorController();

// Perfil básico — acessível com qualquer token
router.get('/:id/basic', authenticate, controller.getBasicProfile);

// Perfil completo — apenas agentes e clubes entre si
router.get('/:id/full', authenticate, authorize('AGENT', 'CLUB'), controller.getFullProfile);

// Meu perfil
router.get('/me', authenticate, authorize('AGENT', 'CLUB'), controller.getMyProfile);

// Atualizar perfil próprio
router.put('/me', authenticate, authorize('AGENT', 'CLUB'), validate(updateContractorSchema), controller.updateProfile);

export { router as contractorRouter };
