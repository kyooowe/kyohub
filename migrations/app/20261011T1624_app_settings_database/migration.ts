#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/7dbcd05686575a5fbedbda8d3edd0268f58b5e8d791124b54dc58032a2504741/contract';
import endContract from '../../snapshots/7dbcd05686575a5fbedbda8d3edd0268f58b5e8d791124b54dc58032a2504741/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/867b3c0c126fffa428a5f864e689370e7fdc51ed71ec7a878a103fd3a77c0f96/contract';
import startContract from '../../snapshots/867b3c0c126fffa428a5f864e689370e7fdc51ed71ec7a878a103fd3a77c0f96/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'AppSetting',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('value', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
