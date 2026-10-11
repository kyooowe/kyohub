#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/d4ae680fb7b60ea81231050032e3da0c9db2900aef4eae5c713fcb5d7a85eeb7/contract';
import endContract from '../../snapshots/d4ae680fb7b60ea81231050032e3da0c9db2900aef4eae5c713fcb5d7a85eeb7/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e1c6194fcdeda7572279aa0c4cf8e6d0622ad32882d82943c7b4d088cb6b2c7c/contract';
import startContract from '../../snapshots/e1c6194fcdeda7572279aa0c4cf8e6d0622ad32882d82943c7b4d088cb6b2c7c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'PasswordEntry',
        column: col('favorite', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
