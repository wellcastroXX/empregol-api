import { Request, Response, NextFunction } from 'express';
import { ContractorService } from './contractor.service';

export class ContractorController {
  private readonly service = new ContractorService();

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

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateProfile(req.user!.id, req.user!.id, req.body);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };
}
