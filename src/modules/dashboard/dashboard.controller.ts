import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  private readonly service = new DashboardService();

  getAthleteDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getAthleteDashboard(req.user!.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  getProfileCompletion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getProfileCompletion(req.user!.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };
}
