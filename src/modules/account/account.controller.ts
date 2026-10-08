import { Request, Response, NextFunction } from 'express';
import { AccountService } from './account.service';

export class AccountController {
  private readonly service = new AccountService();

  deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteAccount(req.user!.id);
      res.json({ status: 'success', message: 'Conta excluída com sucesso' });
    } catch (err) {
      next(err);
    }
  };
}
