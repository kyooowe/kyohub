#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/46a4e17fcde7ae9561b32518e49269089765d4ddd74a32f5e8d43c00429e6a24/contract';
import endContract from '../../snapshots/46a4e17fcde7ae9561b32518e49269089765d4ddd74a32f5e8d43c00429e6a24/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/65be09aeeb7ff513a715a5aa9ebca9421d25e0f96e9ce8c73856b602918baa3b/contract';
import startContract from '../../snapshots/65be09aeeb7ff513a715a5aa9ebca9421d25e0f96e9ce8c73856b602918baa3b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'BabyMedicalNote',
        column: col('imagePathname', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'BabyMedicalNote',
        column: col('imageSize', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'BabyMedicalNote',
        column: col('imageUrl', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'BabyMedicalNote',
        column: col('notes', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'BabyMedicalNote',
        column: 'doctorAdvice',
        defaultSql: "DEFAULT ''",
      }),
      this.setDefault({
        schema: 'public',
        table: 'BabyMedicalNote',
        column: 'symptoms',
        defaultSql: "DEFAULT ''",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
