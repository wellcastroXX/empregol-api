import { Request, Response, NextFunction } from 'express';
import { AthleteVideoService } from './athlete-video.service';
import { uploadMediaSchema } from './athlete-video.dto';
import { ValidationError } from '../../shared/errors/app-error';

export class AthleteVideoController {
  private readonly service = new AthleteVideoService();

  add = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.add(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) throw new ValidationError('Arquivo é obrigatório', { file: ['Envie um arquivo no campo "file"'] });
      const parsed = uploadMediaSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.issues.reduce<Record<string, string[]>>((acc, i) => {
          const key = i.path.join('.');
          if (!acc[key]) acc[key] = [];
          acc[key].push(i.message);
          return acc;
        }, {});
        throw new ValidationError('Dados inválidos', errors);
      }
      const data = await this.service.addUpload(req.user!.id, req.file, parsed.data);
      res.status(201).json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.list(req.user!.id, req.query.type as string);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.remove(req.user!.id, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}
