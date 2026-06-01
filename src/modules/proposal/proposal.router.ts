import { Router } from 'express';
import { ProposalController } from './proposal.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createProposalSchema, respondProposalSchema } from './proposal.dto';

const router = Router();
const controller = new ProposalController();

// Contratante envia convite para atleta
router.post('/', authenticate, authorize('AGENT', 'CLUB'), validate(createProposalSchema), controller.create);

// Atleta responde (aceita / recusa / remarca)
router.patch('/:id/respond', authenticate, authorize('ATHLETE'), validate(respondProposalSchema), controller.respond);

// Lista convites — atleta vê os recebidos, contratante vê os enviados
router.get('/mine', authenticate, controller.listMine);

export { router as proposalRouter };
