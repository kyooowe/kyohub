import { config as loadEnv } from 'dotenv';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

loadEnv({ path: ['.env.local', '.env'] });

export default definePrismaConfig({
  skills: {
    agents: ['claude', 'cursor', 'agents', 'devin'],
  },
  orm: ormConfig({
    contract: "./prisma/schema.prisma",
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
});
