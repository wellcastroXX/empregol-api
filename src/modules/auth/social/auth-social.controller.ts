import { Request, Response, NextFunction } from 'express';
import { AuthSocialService } from './auth-social.service';

export class AuthSocialController {
  private readonly service = new AuthSocialService();

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  };
}
