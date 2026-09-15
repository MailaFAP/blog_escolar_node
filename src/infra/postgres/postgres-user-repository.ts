import { Pool } from 'pg';
import { CreateUserInput, User, UserRole } from '../../domain/user';
import { UserRepository } from '../../domain/user-repository';

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: Omit<CreateUserInput, 'password'> & { passwordHash: string }): Promise<User> {
    const permissions = JSON.stringify(input.permissions ?? []);
    const result = await this.pool.query(
      `INSERT INTO users (name, email, role, permissions, password_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, name, email, role, permissions, password_hash, created_at`,
      [input.name, input.email, input.role, permissions, input.passwordHash]
    );

    return this.mapRowToUser(result.rows[0]);
  }

  async list(): Promise<User[]> {
    const result = await this.pool.query(
      `SELECT id, name, email, role, permissions, password_hash, created_at FROM users ORDER BY created_at DESC`
    );

    return result.rows.map((row: Record<string, unknown>) => this.mapRowToUser(row));
  }

  async getById(id: number): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT id, name, email, role, permissions, password_hash, created_at FROM users WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT id, name, email, role, permissions, password_hash, created_at FROM users WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, id]);
  }

  private mapRowToUser(row: any): User {
    return new User(
      row.id,
      row.name,
      row.email,
      row.role as UserRole,
      this.parsePermissions(row.permissions),
      row.created_at,
      row.password_hash
    );
  }

  private parsePermissions(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === 'string')
          : [];
      } catch {
        return [];
      }
    }

    return [];
  }
}
