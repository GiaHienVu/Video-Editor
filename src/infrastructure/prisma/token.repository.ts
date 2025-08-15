import prisma from './client';
import { RefreshToken } from '../../domain/entities/token.entities';
import { IAuthTokenRepo } from '@domain/interfaces/IAuthTokenRepository';

export class TokenRepository implements IAuthTokenRepo {
  async save(token: RefreshToken): Promise<void> {
    await prisma.auth_Tokens.create({
      data: {
        user_id: token.userId,
        refresh_token: token.token,
        expires_at: token.expiresAt,
        created_at: token.createdAt
      }
    });
  }

  async findByToken(tokenStr: string): Promise<RefreshToken | null> {
    const record = await prisma.auth_Tokens.findFirst({
      where: { refresh_token: tokenStr }
    });
    if (!record) return null;

    return  RefreshToken.restore(
  record.token_id,
  record.refresh_token,
  record.user_id,
  record.expires_at,
  record.created_at
);


  }

  async deleteByToken(tokenStr: string): Promise<void> {
    await prisma.auth_Tokens.deleteMany({ where: { refresh_token: tokenStr } });
  }
  
  
}
