"use server";

import { db } from "@/prisma/db";
import { updateTag, unstable_cache } from "next/cache";
import { requireAuth } from "@/features/auth/lib/session";
import type { BillFrequency, BudgetBill, MonthlyBudget } from "@/features/budget/types";

const budgetTag = "budget-planner";

function validateMonthKey(value: unknown): string {
	if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) throw new Error("Choose a valid month.");
	const [year, month] = value.split("-").map(Number);
	if (month < 1 || month > 12) throw new Error("Choose a valid month.");
	return `${year}-${String(month).padStart(2, "0")}`;
}

function validateAmountCents(value: unknown): number {
	if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > 2_000_000_000) {
		throw new Error("Enter a valid budget amount.");
	}
	return value;
}

function validateTitle(value: unknown): string {
	if (typeof value !== "string" || !value.trim() || value.trim().length > 200) throw new Error("Enter a bill name.");
	return value.trim();
}

function normalizedTitle(value: string): string {
	return value.trim().toLowerCase();
}

async function ensureUniqueBillTitle(title: string, excludedId?: string): Promise<void> {
	const existingBills = await db.orm.public.BudgetBill.select("id", "title").all();
	if (existingBills.some((bill) => bill.id !== excludedId && normalizedTitle(bill.title) === normalizedTitle(title))) {
		throw new Error("A bill with this name already exists.");
	}
}

function validateFrequency(value: unknown): BillFrequency {
	if (value !== "recurring" && value !== "one-time") throw new Error("Choose a valid bill type.");
	return value;
}

function validateDueDay(value: unknown): number | null {
	if (value === null) return null;
	if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1 || value > 31) throw new Error("Choose a due day from 1 to 31.");
	return value;
}

function validateMonthlyDueDay(value: unknown): number {
	if (value !== 5 && value !== 15 && value !== 20 && value !== 30) {
		throw new Error("Choose a due day: 5th, 15th, 20th, or 30th.");
	}
	return value;
}

const getCachedBudgetData = unstable_cache(
	async () => {
		const [budgets, bills] = await Promise.all([
			db.orm.public.MonthlyBudget.select("id", "monthKey", "amountCents").all(),
			db.orm.public.BudgetBill.select("id", "title", "amountCents", "frequency", "monthKey", "dueDay", "paidMonthKeys", "createdAt")
				.orderBy([(bill) => bill.createdAt.asc(), (bill) => bill.id.asc()])
				.all(),
		]);
		return {
			budgets: budgets as MonthlyBudget[],
			bills: bills.map((bill) => ({
				...bill,
				frequency: validateFrequency(bill.frequency),
			})) as BudgetBill[],
		};
	},
	[budgetTag],
	{ tags: [budgetTag], revalidate: 60 },
);

export async function getBudgetData() {
	await requireAuth();
	return getCachedBudgetData();
}

export async function saveMonthlyBudget(monthKey: unknown, amountCents: unknown): Promise<void> {
	await requireAuth();
	const month = validateMonthKey(monthKey);
	const amount = validateAmountCents(amountCents);
	const existing = await db.orm.public.MonthlyBudget.first({ monthKey: month });
	if (existing) {
		await db.orm.public.MonthlyBudget.where({ id: existing.id }).update({ amountCents: amount });
	} else {
		await db.orm.public.MonthlyBudget.create({ monthKey: month, amountCents: amount });
	}
	updateTag(budgetTag);
}

export async function createBudgetBill(value: unknown): Promise<void> {
	await requireAuth();
	if (!value || typeof value !== "object") throw new Error("Invalid bill.");
	const bill = value as Record<string, unknown>;
	const frequency = validateFrequency(bill.frequency);
	const monthKey = frequency === "one-time" ? validateMonthKey(bill.monthKey) : null;
	const dueDay = validateMonthlyDueDay(bill.dueDay);
	const title = validateTitle(bill.title);
	await ensureUniqueBillTitle(title);
	await db.orm.public.BudgetBill.create({
		title,
		amountCents: validateAmountCents(bill.amountCents),
		frequency,
		monthKey,
		dueDay,
	});
	updateTag(budgetTag);
}

export async function updateBudgetBill(id: unknown, value: unknown): Promise<void> {
	await requireAuth();
	if (typeof id !== "string" || !id || id.length > 128 || !value || typeof value !== "object") throw new Error("Invalid bill.");
	const bill = value as Record<string, unknown>;
	const frequency = validateFrequency(bill.frequency);
	const monthKey = frequency === "one-time" ? validateMonthKey(bill.monthKey) : null;
	const dueDay = validateDueDay(bill.dueDay);
	const existing = await db.orm.public.BudgetBill.first({ id });
	if (!existing) throw new Error("Bill was not found.");
	const title = validateTitle(bill.title);
	await ensureUniqueBillTitle(title, id);
	await db.orm.public.BudgetBill.where({ id }).update({
		title,
		amountCents: validateAmountCents(bill.amountCents),
		frequency,
		monthKey,
		dueDay,
	});
	updateTag(budgetTag);
}

export async function deleteBudgetBill(id: unknown): Promise<void> {
	await requireAuth();
	if (typeof id !== "string" || !id || id.length > 128) throw new Error("Invalid bill ID.");
	const existing = await db.orm.public.BudgetBill.first({ id });
	if (!existing) throw new Error("Bill was not found.");
	await db.orm.public.BudgetBill.where({ id }).delete();
	updateTag(budgetTag);
}

export async function setBudgetBillPaid(id: unknown, monthKey: unknown, paid: unknown): Promise<void> {
	await requireAuth();
	if (typeof id !== "string" || !id || id.length > 128) throw new Error("Invalid bill ID.");
	const month = validateMonthKey(monthKey);
	if (typeof paid !== "boolean") throw new Error("Invalid bill payment status.");

	const existing = await db.orm.public.BudgetBill.first({ id });
	if (!existing) throw new Error("Bill was not found.");
	const frequency = validateFrequency(existing.frequency);
	if (frequency === "one-time" && existing.monthKey !== month) {
		throw new Error("This bill is not scheduled for the selected month.");
	}

	const paidMonthKeys = paid
		? Array.from(new Set([...existing.paidMonthKeys, month]))
		: existing.paidMonthKeys.filter((paidMonth) => paidMonth !== month);
	await db.orm.public.BudgetBill.where({ id }).update({ paidMonthKeys });
	updateTag(budgetTag);
}
