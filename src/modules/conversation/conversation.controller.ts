import { Request, Response, NextFunction } from 'express';
import { ConversationService } from './conversation.service';

export class ConversationController {
  private readonly service = new ConversationService();

  // GET /conversations?filter=unread|agents|clubs
  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.listMine(req.user!.id, req.user!.role, {
        filter: req.query.filter as string,
      });
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  // POST /conversations  { athleteId } — contratante abre conversa
  open = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { athleteId } = req.body;
      const result = await this.service.openOrGet(req.user!.id, athleteId);
      res.status(result.created ? 201 : 200).json({ status: 'success', data: result.conversation });
    } catch (err) { next(err); }
  };

  // PATCH /conversations/:id/read
  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.markRead(req.user!.id, req.user!.role, req.params.id);
      res.json({ status: 'success', message: 'Conversa marcada como lida' });
    } catch (err) { next(err); }
  };
}
