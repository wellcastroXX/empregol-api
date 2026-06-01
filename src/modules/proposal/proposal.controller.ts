import { Request, Response, NextFunction } from 'express';
import { ProposalService } from './proposal.service';

export class ProposalController {
  private readonly service = new ProposalService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.create(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  respond = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.respond(req.params.id, req.user!.id, req.body);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, id } = req.user!;
      const status = req.query.status as string | undefined;

      const data = role === 'ATHLETE'
        ? await this.service.listForAthlete(id, status)
        : await this.service.listForContractor(id, status);

      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };
}
