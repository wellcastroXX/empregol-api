import { Request, Response, NextFunction } from 'express';
import { MessageService } from './message.service';

export class MessageController {
  private readonly service = new MessageService();

  // GET /conversations/:id/messages?cursor=<messageId>
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.list(
        req.user!.id,
        req.user!.role,
        req.params.id,
        req.query.cursor as string,
      );
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  // POST /conversations/:id/messages
  send = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.send(req.user!.id, req.user!.role, req.params.id, req.body);
      res.status(201).json({ status: 'success', data });
    } catch (err) { next(err); }
  };
}
