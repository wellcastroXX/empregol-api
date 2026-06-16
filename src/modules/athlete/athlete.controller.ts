import { Request, Response, NextFunction } from 'express';
import { AthleteService } from './athlete.service';
import { ValidationError } from '../../shared/errors/app-error';

export class AthleteController {
  private readonly service = new AthleteService();

  updateAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) throw new ValidationError('Arquivo é obrigatório', { file: ['Envie uma imagem no campo "file"'] });
      const data = await this.service.updateAvatar(req.user!.id, req.file);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getMyProfile(req.user!.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  getBasicProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getBasicProfile(req.params.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  getFullProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getFullProfile(req.params.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  listAthletes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.listAthletes({
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        position: req.query.position as string,
        level: req.query.level as string,
        availability: req.query.availability as string,
      });
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetUserId = req.params.userId ?? req.user!.id;
      const data = await this.service.updateProfile(targetUserId, req.user!.id, req.user!.role, req.body);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };
}
