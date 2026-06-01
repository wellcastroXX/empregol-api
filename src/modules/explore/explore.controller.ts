import { Request, Response, NextFunction } from 'express';
import { ExploreService } from './explore.service';
import { exploreQuerySchema } from './explore.dto';

export class ExploreController {
  private readonly service = new ExploreService();

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = exploreQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(422).json({ status: 'error', code: 'VALIDATION_ERROR', errors: parsed.error.flatten().fieldErrors });
        return;
      }
      const data = await this.service.search(req.user!.id, parsed.data);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };
}
