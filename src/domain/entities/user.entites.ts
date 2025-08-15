export class User {
  private _id: bigint;
  private _email: string;
  private _name: string;
  private _passwordHash: string;
  private _createdAt: Date;

  constructor(params: {
    id?: bigint;
    email: string;
    name: string;
    passwordHash: string;
    createdAt?: Date;
  }) {
    this._id = params.id ?? BigInt(0);
    this._email = params.email;
    this._name = params.name;
    this._passwordHash = params.passwordHash;
    this._createdAt = params.createdAt ?? new Date();
  }

  static create(email: string, name: string, passwordHash: string): User {
    return new User({ email, name, passwordHash });
  }

  static restore(
    id: bigint,
    email: string,
    name: string,
    passwordHash: string,
    createdAt: Date
  ): User {
    return new User({ id, email, name, passwordHash, createdAt });
  }

  // Getters
  get id(): bigint {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Domain logic
  validateEmail(): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(this._email);
  }

  updateName(newName: string): void {
    if (newName.length < 3) {
      throw new Error('Name must have at least 3 characters');
    }
    this._name = newName;
  }
}
