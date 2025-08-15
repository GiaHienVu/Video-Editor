import bcrypt from 'bcryptjs';
export class PasswordService {
  compare(plain: string, hash: string) { return bcrypt.compare(plain, hash); }
}