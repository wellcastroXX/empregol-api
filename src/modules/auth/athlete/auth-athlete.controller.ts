import { Request, Response, NextFunction } from 'express';
import { AuthAthleteService } from './auth-athlete.service';

export class AuthAthleteController {
  private readonly service = new AuthAthleteService();

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.verifyEmail(req.body);
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  };

  resendCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.resendCode(req.body);
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.forgotPassword(req.body);
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.resetPassword(req.body);
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  };
}
