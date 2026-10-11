import { config as loadEnv } from 'dotenv';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './schema.d';
import contractJson from './schema.json' with { type: 'json' };
import { getDatabaseUrl } from './database-url';

loadEnv({ path: ['.env.local', '.env'] });

export const db = postgres<Contract>({
  contractJson,
  url: getDatabaseUrl(),
});
