import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import router from './routes';
import { database } from './infra/database';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger-docs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(router);

async function bootstrap() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL,
        permissions JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await database.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);

    await seedDefaultAdmin();

    await database.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await database.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    `);

    await database.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS url TEXT
    `);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database', error);
    process.exit(1);
  }
}

async function seedDefaultAdmin(): Promise<void> {
  const result = await database.query('SELECT COUNT(*) FROM users');
  const userCount = Number(result.rows[0].count);

  if (userCount > 0) {
    return;
  }

  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@escola.com';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
  const passwordHash = await bcrypt.hash(password, 10);
  const permissions = JSON.stringify(['create_post', 'edit_post', 'view_post', 'manage_users']);

  await database.query(
    `INSERT INTO users (name, email, role, permissions, password_hash, created_at)
     VALUES ($1, $2, 'admin', $3, $4, NOW())`,
    ['Administrador', email, permissions, passwordHash]
  );

  console.log(`Seeded default admin user: ${email} / ${password} (change this password after first login)`);
}

bootstrap();
