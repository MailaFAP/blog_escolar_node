"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const database_1 = require("./infra/database");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_docs_1 = require("./swagger-docs");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_docs_1.swaggerDocument));
app.use(routes_1.default);
async function bootstrap() {
    try {
        await database_1.database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL,
        permissions JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
        await database_1.database.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);
        await seedDefaultAdmin();
        await database_1.database.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
        await database_1.database.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    `);
        await database_1.database.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS url TEXT
    `);
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Failed to initialize database', error);
        process.exit(1);
    }
}
async function seedDefaultAdmin() {
    const result = await database_1.database.query('SELECT COUNT(*) FROM users');
    const userCount = Number(result.rows[0].count);
    if (userCount > 0) {
        return;
    }
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@escola.com';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const permissions = JSON.stringify(['create_post', 'edit_post', 'view_post', 'manage_users']);
    await database_1.database.query(`INSERT INTO users (name, email, role, permissions, password_hash, created_at)
     VALUES ($1, $2, 'admin', $3, $4, NOW())`, ['Administrador', email, permissions, passwordHash]);
    console.log(`Seeded default admin user: ${email} / ${password} (change this password after first login)`);
}
bootstrap();
