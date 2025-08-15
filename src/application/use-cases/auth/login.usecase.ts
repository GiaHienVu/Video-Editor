import bcrypt from 'bcryptjs';
import { UserRepository } from '../../../infrastructure/prisma/user.repository';
import { TokenRepository } from '../../../infrastructure/prisma/token.repository';
import { RefreshToken } from '../../../domain/entities/token.entities';
import { TokenService } from '../../services/token.service';
import { User } from '../../../domain/entities/user.entites';

export class LoginUseCase {
  private repoUser = new UserRepository();
  private repoToken = new TokenRepository();
  private tokenService = new TokenService();

  async execute(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user: User = await this.repoUser.findByEmail(email);
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    // Tạo Access Token bằng TokenService
    const accessToken = this.tokenService.issueAccess({ userId: Number(user.id) }, '15m');

    // Tạo Refresh Token và lưu DB
    const refresh = RefreshToken.generate(user.id);
    await this.repoToken.save(refresh);

    return {
      accessToken,
      refreshToken: refresh.token,
    };
  }
}