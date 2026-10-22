import { db } from './prisma/db.js';

async function main() {
  const notes = await db.orm.public.BabyMedicalNote.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
  });
  console.log('NOTES:', JSON.stringify(notes, null, 2));
}

main().catch(console.error);
