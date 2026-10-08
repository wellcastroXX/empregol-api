import { Request, Response, NextFunction } from 'express';
import { ModerationService } from './moderation.service';

export class ModerationController {
  private readonly service = new ModerationService();

  createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createReport(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.blockUser(req.user!.id, req.body.userId);
      res.status(201).json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  };

  unblockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.unblockUser(req.user!.id, req.params.userId);
      res.json({ status: 'success' });
    } catch (err) {
      next(err);
    }
  };

  listBlocks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.listBlocks(req.user!.id);
      res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  };
}
