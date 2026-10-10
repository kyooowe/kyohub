#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/be5c75b55190313f55c70c64ab37fa3243e6e404ef65ad7bcc505de3da2fcde2/contract';
import startContract from '../../snapshots/be5c75b55190313f55c70c64ab37fa3243e6e404ef65ad7bcc505de3da2fcde2/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e1c6194fcdeda7572279aa0c4cf8e6d0622ad32882d82943c7b4d088cb6b2c7c/contract';
import endContract from '../../snapshots/e1c6194fcdeda7572279aa0c4cf8e6d0622ad32882d82943c7b4d088cb6b2c7c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'BudgetBill',
        column: col('paidMonthKeys', 'text[]', {
          notNull: true,
          default: lit([]),
          codecRef: { codecId: 'pg/text@1', many: true },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'BudgetBill',
        constraint: 'BudgetBill_paidMonthKeys_elem_not_null_caa3a6d9',
        expression: 'array_position("paidMonthKeys", NULL) IS NULL',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
