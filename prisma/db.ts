import { config as loadEnv } from 'dotenv';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './schema.d';
import contractJson from './schema.json' with { type: 'json' };

loadEnv({ path: ['.env.local', '.env'] });

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
