"use server";

import { db } from "@/prisma/db";
import type { GroceryItem } from "@/features/grocery/types";

export type GroceryRecord = GroceryItem & { dateKey: string };

function isDateKey(value: unknown): value is string {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validateItem(value: unknown): GroceryRecord {
	if (!value || typeof value !== "object") throw new Error("Invalid grocery item.");
	const item = value as Record<string, unknown>;
	if (
		typeof item.id !== "string" || !item.id || item.id.length > 128
		|| !isDateKey(item.dateKey)
		|| typeof item.name !== "string" || !item.name.trim() || item.name.length > 300
		|| typeof item.done !== "boolean"
	) {
		throw new Error("Enter a valid grocery item and date.");
	}
	return { id: item.id, dateKey: item.dateKey, name: item.name.trim(), done: item.done };
}

export async function getGroceryItems(): Promise<GroceryRecord[]> {
	return db.orm.public.GroceryItem
		.select("id", "dateKey", "name", "done")
		.orderBy([(item) => item.createdAt.asc(), (item) => item.id.asc()])
		.all();
}

export async function createGroceryItem(value: unknown): Promise<void> {
	const item = validateItem(value);
	await db.orm.public.GroceryItem.create(item);
}

export async function updateGroceryItem(id: string, value: unknown): Promise<void> {
	if (typeof id !== "string" || !id || id.length > 128 || !value || typeof value !== "object") {
		throw new Error("Invalid grocery item.");
	}
	const update = value as Record<string, unknown>;
	const fields: { name?: string; done?: boolean } = {};
	if (Object.hasOwn(update, "name")) {
		if (typeof update.name !== "string" || !update.name.trim() || update.name.length > 300) throw new Error("Enter a valid grocery item name.");
		fields.name = update.name.trim();
	}
	if (Object.hasOwn(update, "done")) {
		if (typeof update.done !== "boolean") throw new Error("Invalid grocery item completion state.");
		fields.done = update.done;
	}
	if (Object.keys(fields).length === 0) throw new Error("No grocery item changes were provided.");
	const existing = await db.orm.public.GroceryItem.first({ id });
	if (!existing) throw new Error("Grocery item was not found.");
	await db.orm.public.GroceryItem.where({ id }).update(fields);
}

export async function deleteGroceryItem(id: string): Promise<void> {
	if (typeof id !== "string" || !id || id.length > 128) throw new Error("Invalid grocery item ID.");
	const existing = await db.orm.public.GroceryItem.first({ id });
	if (!existing) throw new Error("Grocery item was not found.");
	await db.orm.public.GroceryItem.where({ id }).delete();
}

export async function importLegacyGroceryItems(values: unknown): Promise<void> {
	if (!Array.isArray(values) || values.length > 10000) throw new Error("Invalid saved grocery data.");
	for (const value of values) {
		const item = validateItem(value);
		const existing = await db.orm.public.GroceryItem.first({ id: item.id });
		if (!existing) await db.orm.public.GroceryItem.create(item);
	}
}