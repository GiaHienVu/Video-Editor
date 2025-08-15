import jwt from 'jsonwebtoken';
import { UserRepository } from '../../../infrastructure/prisma/user.repository';
import {TokenRepository} from '../../../infrastructure/prisma/token.repository';
import { RefreshToken } from '../../../domain/entities/token.entities';
import { TokenService } from '@application/services/token.service';

export class RefreshTokenUseCase {
  private userRepo = new UserRepository();
  private tokenRepo = new TokenRepository();
  private tokenService = new TokenService();

  async execute(refreshToken: string) {
    // Lấy refresh token từ DB kèm user info
    const tokenRecord = await this.tokenRepo.findByToken(refreshToken);
    if (!tokenRecord) throw new Error('Invalid refresh token');


    if(tokenRecord.isExpired) throw new Error('Refresh token expired');

    // Tạo Access Token mới
    const user = await this.userRepo.findById(tokenRecord.userId);
    if (!user) throw new Error('User not found');

        const newAccessToken = this.tokenService.issueAccess({ userId: Number(user.id) }, '15m');


    return { accessToken: newAccessToken };
  }
}
