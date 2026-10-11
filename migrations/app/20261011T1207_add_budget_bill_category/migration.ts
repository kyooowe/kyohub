#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/867b3c0c126fffa428a5f864e689370e7fdc51ed71ec7a878a103fd3a77c0f96/contract';
import endContract from '../../snapshots/867b3c0c126fffa428a5f864e689370e7fdc51ed71ec7a878a103fd3a77c0f96/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d4ae680fb7b60ea81231050032e3da0c9db2900aef4eae5c713fcb5d7a85eeb7/contract';
import startContract from '../../snapshots/d4ae680fb7b60ea81231050032e3da0c9db2900aef4eae5c713fcb5d7a85eeb7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'BudgetBill',
        column: col('category', 'text', {
          notNull: true,
          default: lit('utility'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
