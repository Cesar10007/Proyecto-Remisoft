import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
} = process.env;

if (!DB_USERNAME || !DB_PASSWORD || !DB_DATABASE) {
  throw new Error(
    'Configuración de MariaDB incompleta: define DB_USERNAME, DB_PASSWORD y DB_DATABASE en backend/.env',
  );
}

const adapter = new PrismaMariaDb({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

const prisma = new PrismaClient({ adapter });

export default prisma;