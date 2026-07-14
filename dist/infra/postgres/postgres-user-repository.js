"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresUserRepository = void 0;
const user_1 = require("../../domain/user");
class PostgresUserRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async create(input) {
        const permissions = JSON.stringify(input.permissions ?? []);
        const result = await this.pool.query(`INSERT INTO users (name, email, role, permissions, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, name, email, role, permissions, created_at`, [input.name, input.email, input.role, permissions]);
        return this.mapRowToUser(result.rows[0]);
    }
    async list() {
        const result = await this.pool.query(`SELECT id, name, email, role, permissions, created_at FROM users ORDER BY created_at DESC`);
        return result.rows.map((row) => this.mapRowToUser(row));
    }
    async getById(id) {
        const result = await this.pool.query(`SELECT id, name, email, role, permissions, created_at FROM users WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return null;
        }
        return this.mapRowToUser(result.rows[0]);
    }
    mapRowToUser(row) {
        return new user_1.User(row.id, row.name, row.email, row.role, this.parsePermissions(row.permissions), row.created_at);
    }
    parsePermissions(value) {
        if (Array.isArray(value)) {
            return value.filter((item) => typeof item === 'string');
        }
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed)
                    ? parsed.filter((item) => typeof item === 'string')
                    : [];
            }
            catch {
                return [];
            }
        }
        return [];
    }
}
exports.PostgresUserRepository = PostgresUserRepository;
