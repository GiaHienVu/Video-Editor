import crypto from 'crypto';
export class RefreshToken {
  private _id: bigint;
    private _token: string;
    private _userId: bigint;
    private _expiresAt: Date;
    private _createdAt: Date;

  private constructor(
    id: bigint,
    token: string,
    userId: bigint,
    expiresAt: Date,
    createdAt: Date
  ) {
    this._token = token;
    this._userId = userId;
    this._expiresAt = expiresAt;
    this._createdAt = createdAt;
  }

  // Static factory method
 
    static generate(userId: bigint): RefreshToken {
    const token = crypto.randomBytes(40).toString('hex');
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
    return new RefreshToken(0n, token, userId, expiresAt, createdAt); // 0n đại diện cho id chưa có
  }


  // Constructor phụ - dùng khi khôi phục từ DB (clone)
  static restore(
    id: bigint,
    token: string,
    userId: bigint,
    expiresAt: Date,
    createdAt: Date
  ): RefreshToken {
    return new RefreshToken(id, token, userId, expiresAt, createdAt);
  }

  get token(): string {
    return this._token;
  }

  get userId(): bigint {
    return this._userId;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

}
