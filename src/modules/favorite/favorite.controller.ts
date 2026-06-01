import { Request, Response, NextFunction } from 'express';
import { FavoriteService } from './favorite.service';

export class FavoriteController {
  private readonly service = new FavoriteService();

  // POST /favorites/:athleteId  → toggle (adiciona ou remove)
  toggle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.toggle(req.user!.id, req.params.athleteId);
      res.json({ status: 'success', data: result });
    } catch (err) { next(err); }
  };

  // GET /favorites  → lista atletas favoritos do contratante
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.list(req.user!.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };
}
