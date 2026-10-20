#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/16d48236170993c5ba33c36b495b72a3b85bc0be12c45abab8dd7f7187446b6e/contract';
import startContract from '../../snapshots/16d48236170993c5ba33c36b495b72a3b85bc0be12c45abab8dd7f7187446b6e/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/65be09aeeb7ff513a715a5aa9ebca9421d25e0f96e9ce8c73856b602918baa3b/contract';
import endContract from '../../snapshots/65be09aeeb7ff513a715a5aa9ebca9421d25e0f96e9ce8c73856b602918baa3b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'BabyMilkLog',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('drankOz', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('leftoverOz', 'float8', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('loggedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('milkType', 'text', {
            notNull: true,
            default: lit('formula'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('notes', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('preparedOz', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('completed'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BabySleepLog',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('durationMinutes', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('endTime', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('notes', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('sleepType', 'text', {
            notNull: true,
            default: lit('night'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('startTime', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('completed'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabyMilkLog',
        index: 'BabyMilkLog_loggedAt_idx_f4f050f7',
        columns: ['loggedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabyMilkLog',
        index: 'BabyMilkLog_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabySleepLog',
        index: 'BabySleepLog_startTime_idx_d78b7987',
        columns: ['startTime'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabySleepLog',
        index: 'BabySleepLog_status_idx_e98638ab',
        columns: ['status'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
