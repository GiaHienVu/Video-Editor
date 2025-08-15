import { User } from '../entities/user.entites';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  createUser(email: string, name: string, passwordHash: string): Promise<User>;
  findById(id: bigint): Promise<User | null>;
}
