import { Router } from 'express';
import { FavoriteController } from './favorite.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new FavoriteController();

// Lista favoritos do contratante logado
router.get('/',               authenticate, authorize('AGENT', 'CLUB'), controller.list);

// Toggle favorito — POST favorita, POST de novo desfavorita (idempotente)
router.post('/:athleteId',    authenticate, authorize('AGENT', 'CLUB'), controller.toggle);

export { router as favoriteRouter };
