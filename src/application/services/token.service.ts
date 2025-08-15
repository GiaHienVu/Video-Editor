import jwt from 'jsonwebtoken';
export class TokenService {
  issueAccess(payload: any, ttl = '15m') {
    return jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: ttl });
  }
}