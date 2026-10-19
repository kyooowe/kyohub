#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/16d48236170993c5ba33c36b495b72a3b85bc0be12c45abab8dd7f7187446b6e/contract';
import endContract from '../../snapshots/16d48236170993c5ba33c36b495b72a3b85bc0be12c45abab8dd7f7187446b6e/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/7dbcd05686575a5fbedbda8d3edd0268f58b5e8d791124b54dc58032a2504741/contract';
import startContract from '../../snapshots/7dbcd05686575a5fbedbda8d3edd0268f58b5e8d791124b54dc58032a2504741/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'BabyGrowth',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('headCircumferenceCm', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('heightCm', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('monthAge', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('notes', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('recordedDate', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('weightKg', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BabyMedicalNote',
        columns: [
          col('category', 'text', {
            notNull: true,
            default: lit('general'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('clinicName', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('doctorAdvice', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('doctorName', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('noteDate', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('symptoms', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BabyMedicine',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('dosage', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('endDate', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('frequency', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('instructions', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('notes', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('startDate', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('active'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BabyProfile',
        columns: [
          col('allergies', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('birthDate', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('birthHeight', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('birthWeight', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('bloodType', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('gender', 'text', {
            notNull: true,
            default: lit('unspecified'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('notes', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('pediatrician', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('pediatricianPhone', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BabyStoolLog',
        columns: [
          col('amount', 'text', {
            notNull: true,
            default: lit('medium'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('color', 'text', {
            notNull: true,
            default: lit('yellow'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('consistency', 'text', {
            notNull: true,
            default: lit('soft'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('loggedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('notes', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('type', 'text', {
            notNull: true,
            default: lit('stool'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BabyVaccine',
        columns: [
          col('administeredBy', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('dose', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('notes', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('upcoming'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('vaccineDate', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('vaccineName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabyGrowth',
        index: 'BabyGrowth_monthAge_idx_1b7d5f6d',
        columns: ['monthAge'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabyGrowth',
        index: 'BabyGrowth_recordedDate_idx_be6072a0',
        columns: ['recordedDate'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabyMedicalNote',
        index: 'BabyMedicalNote_noteDate_idx_1ee0108a',
        columns: ['noteDate'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabyMedicine',
        index: 'BabyMedicine_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabyStoolLog',
        index: 'BabyStoolLog_type_idx_b6b604ea',
        columns: ['type'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabyVaccine',
        index: 'BabyVaccine_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BabyVaccine',
        index: 'BabyVaccine_vaccineDate_idx_28a615a0',
        columns: ['vaccineDate'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
