import { RefreshToken } from '../entities/token.entities';

export interface IAuthTokenRepo {
  save(token: RefreshToken): Promise<void>;

  findByToken(token: string): Promise<RefreshToken | null>;

  deleteByToken(token: string): Promise<void>;

  deleteByToken(tokenStr: string): Promise<void>; // tuỳ chọn nếu bạn muốn logout tất cả thiết bị
}
