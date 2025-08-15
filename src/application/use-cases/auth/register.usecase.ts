import bcrypt from 'bcryptjs';
import { UserRepository } from '../../../infrastructure/prisma/user.repository';
import { User } from '../../../domain/entities/user.entites'; // ✅ Import đúng nơi

export class RegisterUseCase {
  private repo = new UserRepository();

  async execute(email: string, name: string, password: string) {
    // Kiểm tra email tồn tại
    const exists = await this.repo.findByEmail(email);
    if (exists) throw new Error('Email already exists');

    // Mã hóa mật khẩu
    const hashed = await bcrypt.hash(password, 10);

    // Tạo user
    const user: User = await this.repo.createUser(email, name, hashed);

    // Trả về response
    return {
  id: Number(user.id),
  email: user.email,
  name: user.name
};

  }
}
