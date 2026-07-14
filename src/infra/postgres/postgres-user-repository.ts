import { Pool } from 'pg';
import { CreateUserInput, User, UserRole } from '../../domain/user';
import { UserRepository } from '../../domain/user-repository';

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: CreateUserInput): Promise<User> {
    const permissions = JSON.stringify(input.permissions ?? []);
    const result = await this.pool.query(
      `INSERT INTO users (name, email, role, permissions, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, name, email, role, permissions, created_at`,
      [input.name, input.email, input.role, permissions]
    );

    return this.mapRowToUser(result.rows[0]);
  }

  async list(): Promise<User[]> {
    const result = await this.pool.query(
      `SELECT id, name, email, role, permissions, created_at FROM users ORDER BY created_at DESC`
    );

    return result.rows.map((row: Record<string, unknown>) => this.mapRowToUser(row));
  }

  async getById(id: number): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT id, name, email, role, permissions, created_at FROM users WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  private mapRowToUser(row: any): User {
    return new User(
      row.id,
      row.name,
      row.email,
      row.role as UserRole,
      this.parsePermissions(row.permissions),
      row.created_at
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
