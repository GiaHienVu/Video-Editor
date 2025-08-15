import { Request, Response } from 'express';
import { RegisterUseCase } from '@application/use-cases/auth/register.usecase';
import { LoginUseCase } from '@application/use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/refresh-token.usecase';


export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body;
      const useCase = new RegisterUseCase();
      const result = await useCase.execute(email, name, password);
      return res.json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const useCase = new LoginUseCase();
      const result = await useCase.execute(email, password);
      return res.json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const useCase = new RefreshTokenUseCase();
      const result = await useCase.execute(refreshToken);
      return res.json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }
}
