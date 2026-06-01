import { Request, Response, NextFunction } from 'express';
import { SeasonStatsService } from './season-stats.service';

export class SeasonStatsController {
  private readonly service = new SeasonStatsService();

  upsert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.upsert(req.user!.id, req.body);
      res.status(200).json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.list(req.user!.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  getByYear = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = Number(req.params.year);
      const data = await this.service.getByYear(req.user!.id, year);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };
}
