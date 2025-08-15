import prisma from './client';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/user.entites';

export class UserRepository implements IUserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return null;

    return User.restore(
    user.user_id,
    user.email,
    user.name,
    user.password_hash,
    user.created_at
  );
    
  }

  async findById(userId: bigint): Promise<User | null> {
  const user = await prisma.users.findUnique({
    where: { user_id: userId }
  });

  if (!user) return null;

  return User.restore(
    user.user_id,
    user.email,
    user.name,
    user.password_hash,
    user.created_at
  );
}


  async createUser(email: string, name: string, passwordHash: string): Promise<User> {
  try {
    const usr = User.create(email, name, passwordHash);

    const saved = await prisma.users.create({
      data: {
        email: usr.email,
        name: usr.name,
        password_hash: usr.passwordHash,
        created_at: usr.createdAt
      }
    });

    return User.restore(
      saved.user_id,
      saved.email,
      saved.name,
      saved.password_hash,
      saved.created_at
    );
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

}


 
  

