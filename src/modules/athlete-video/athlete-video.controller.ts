import { Request, Response, NextFunction } from 'express';
import { AthleteVideoService } from './athlete-video.service';

export class AthleteVideoController {
  private readonly service = new AthleteVideoService();

  add = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.add(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.list(req.user!.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.remove(req.user!.id, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}
