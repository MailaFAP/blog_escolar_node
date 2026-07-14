"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresPostRepository = void 0;
const post_1 = require("../../domain/post");
class PostgresPostRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async create(input) {
        const result = await this.pool.query(`INSERT INTO posts (title, content, author, url, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, title, content, author, url, created_by, created_at, updated_at`, [input.title, input.content, input.author, input.url ?? null, input.createdBy ?? null]);
        return this.mapRowToPost(result.rows[0]);
    }
    async update(id, input) {
        const fields = [];
        const values = [];
        let index = 1;
        if (input.title !== undefined) {
            fields.push(`title = $${index++}`);
            values.push(input.title);
        }
        if (input.content !== undefined) {
            fields.push(`content = $${index++}`);
            values.push(input.content);
        }
        if (input.author !== undefined) {
            fields.push(`author = $${index++}`);
            values.push(input.author);
        }
        fields.push(`updated_at = NOW()`);
        values.push(id);
        const result = await this.pool.query(`UPDATE posts SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, title, content, author, url, created_by, created_at, updated_at`, values);
        if (result.rowCount === 0) {
            return null;
        }
        return this.mapRowToPost(result.rows[0]);
    }
    async delete(id) {
        const result = await this.pool.query('DELETE FROM posts WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    async list(userId, role) {
        const whereClause = role === 'teacher' && userId ? 'WHERE created_by = $1' : '';
        const values = role === 'teacher' && userId ? [userId] : [];
        const result = await this.pool.query(`SELECT id, title, content, author, url, created_by, created_at, updated_at FROM posts ${whereClause} ORDER BY created_at DESC`, values);
        return Promise.all(result.rows.map((row) => this.mapRowToPost(row)));
    }
    async getById(id, userId, role) {
        const whereClause = role === 'teacher' && userId ? 'AND created_by = $2' : '';
        const values = [id];
        if (role === 'teacher' && userId) {
            values.push(userId);
        }
        const result = await this.pool.query(`SELECT id, title, content, author, url, created_by, created_at, updated_at FROM posts WHERE id = $1 ${whereClause}`, values);
        if (result.rowCount === 0) {
            return null;
        }
        return this.mapRowToPost(result.rows[0]);
    }
    async search(query, userId, role) {
        const whereClause = role === 'teacher' && userId ? 'AND created_by = $2' : '';
        const values = [`%${query.toLowerCase()}%`];
        if (role === 'teacher' && userId) {
            values.push(userId);
        }
        const result = await this.pool.query(`SELECT id, title, content, author, url, created_by, created_at, updated_at
       FROM posts
       WHERE (LOWER(title) LIKE $1 OR LOWER(content) LIKE $1) ${whereClause}
       ORDER BY created_at DESC`, values);
        return Promise.all(result.rows.map((row) => this.mapRowToPost(row)));
    }
    async mapRowToPost(row) {
        const author = row.author?.trim() ? row.author : await this.getAuthorName(row.created_by);
        return new post_1.Post(row.id, row.title, row.content, author, row.created_at, row.updated_at, row.created_by ?? null, row.url ?? null);
    }
    async getAuthorName(userId) {
        if (!userId) {
            return '';
        }
        const result = await this.pool.query('SELECT name FROM users WHERE id = $1', [userId]);
        return result.rows[0]?.name ?? '';
    }
}
exports.PostgresPostRepository = PostgresPostRepository;
