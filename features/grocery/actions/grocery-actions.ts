"use server";

import { db } from "@/prisma/db";
import { updateTag, revalidatePath, unstable_cache } from "next/cache";
import { requireAuth } from "@/features/auth/lib/session";
import type { GroceryItem } from "@/features/grocery/types";

export type GroceryRecord = GroceryItem & { dateKey: string };

const grocerySyncSettingId = "grocery_budget_sync";

export type GroceryBudgetSyncData = {
	autoAddDates: Record<string, boolean>;
	itemMeta: Record<string, { priceCents?: number; paid?: boolean }>;
};

async function getStoredSyncData(): Promise<GroceryBudgetSyncData> {
	const row = await db.orm.public.AppSetting.first({ id: grocerySyncSettingId });
	if (!row) return { autoAddDates: {}, itemMeta: {} };
	try {
		const parsed = JSON.parse(row.value) as Partial<GroceryBudgetSyncData>;
		return {
			autoAddDates: typeof parsed.autoAddDates === "object" && parsed.autoAddDates !== null ? parsed.autoAddDates : {},
			itemMeta: typeof parsed.itemMeta === "object" && parsed.itemMeta !== null ? parsed.itemMeta : {},
		};
	} catch {
		return { autoAddDates: {}, itemMeta: {} };
	}
}

async function saveStoredSyncData(data: GroceryBudgetSyncData): Promise<void> {
	const serialized = JSON.stringify(data);
	await db.orm.public.AppSetting.upsert({
		create: { id: grocerySyncSettingId, value: serialized },
		update: { value: serialized },
	});
}

const getCachedRawGroceryItems = unstable_cache(
	async () => {
		return db.orm.public.GroceryItem
			.select("id", "dateKey", "name", "done")
			.orderBy([(item) => item.createdAt.asc(), (item) => item.id.asc()])
			.all();
	},
	["grocery-items"],
	{ tags: ["grocery-items"], revalidate: 60 },
);

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
	const priceCents = typeof item.priceCents === "number" && Number.isSafeInteger(item.priceCents) && item.priceCents >= 0
		? item.priceCents
		: undefined;
	const paid = typeof item.paid === "boolean" ? item.paid : undefined;
	return { id: item.id, dateKey: item.dateKey, name: item.name.trim(), done: item.done, priceCents, paid };
}

export async function syncGroceryDateToBudgetBill(dateKey: string, providedSyncData?: GroceryBudgetSyncData): Promise<void> {
	if (!isDateKey(dateKey)) return;
	const syncData = providedSyncData ?? await getStoredSyncData();
	const isAutoAdd = Boolean(syncData.autoAddDates[dateKey]);
	const billId = `grocery-${dateKey}`;

	if (!isAutoAdd) {
		const existingBill = await db.orm.public.BudgetBill.first({ id: billId });
		if (existingBill) {
			await db.orm.public.BudgetBill.where({ id: billId }).delete();
			updateTag("budget-planner");
			revalidatePath("/budget");
		}
		return;
	}

	const rawItems = await db.orm.public.GroceryItem
		.select("id", "dateKey", "name", "done")
		.where({ dateKey })
		.all();

	const totalCents = rawItems.reduce((sum, item) => sum + (syncData.itemMeta[item.id]?.priceCents ?? 0), 0);
	const payableItems = rawItems.filter((item) => (syncData.itemMeta[item.id]?.priceCents ?? 0) > 0);
	const isAllPaid = payableItems.length > 0 && payableItems.every((item) => syncData.itemMeta[item.id]?.paid === true);

	const [year, month, day] = dateKey.split("-").map(Number);
	const monthKey = `${year}-${String(month).padStart(2, "0")}`;
	const dateObj = new Date(year, month - 1, day);
	const monthShort = dateObj.toLocaleDateString("en-US", { month: "short" });
	const title = `Grocery on ${monthShort} ${day}`;
	const paidMonthKeys = isAllPaid ? [monthKey] : [];

	// Map day to cutoff day: 1-5 -> 5, 6-15 -> 15, 16-20 -> 20, 21-31 -> 30
	const cutoffDueDay = day <= 5 ? 5 : day <= 15 ? 15 : day <= 20 ? 20 : 30;

	const existingBill = await db.orm.public.BudgetBill.first({ id: billId });
	if (existingBill) {
		await db.orm.public.BudgetBill.where({ id: billId }).update({
			title,
			category: "grocery",
			amountCents: totalCents,
			frequency: "one-time",
			monthKey,
			dueDay: cutoffDueDay,
			paidMonthKeys,
		});
	} else {
		await db.orm.public.BudgetBill.create({
			id: billId,
			title,
			category: "grocery",
			amountCents: totalCents,
			frequency: "one-time",
			monthKey,
			dueDay: cutoffDueDay,
			paidMonthKeys,
		});
	}
	updateTag("budget-planner");
	revalidatePath("/budget");
}

export async function getGroceryItems(): Promise<GroceryRecord[]> {
	await requireAuth();
	const [rawItems, syncData] = await Promise.all([
		getCachedRawGroceryItems(),
		getStoredSyncData(),
	]);

	return rawItems.map((item) => {
		const meta = syncData.itemMeta[item.id];
		return {
			...item,
			priceCents: meta?.priceCents ?? 0,
			paid: meta?.paid ?? false,
		};
	});
}

export async function getGroceryBudgetSyncDates(): Promise<Record<string, boolean>> {
	await requireAuth();
	const syncData = await getStoredSyncData();
	return syncData.autoAddDates;
}

export async function setGroceryAutoAddToBudget(dateKey: string, enabled: boolean): Promise<void> {
	await requireAuth();
	if (!isDateKey(dateKey)) throw new Error("Invalid grocery date.");
	const [rawItems, syncData] = await Promise.all([
		db.orm.public.GroceryItem.select("id").where({ dateKey }).all(),
		getStoredSyncData(),
	]);
	syncData.autoAddDates[dateKey] = enabled;
	if (!enabled) {
		for (const item of rawItems) {
			if (syncData.itemMeta[item.id]) {
				syncData.itemMeta[item.id].paid = false;
			}
		}
	}
	await saveStoredSyncData(syncData);
	await syncGroceryDateToBudgetBill(dateKey, syncData);
	updateTag("grocery-items");
	revalidatePath("/grocery");
	revalidatePath("/budget");
}

export async function createGroceryItem(value: unknown): Promise<void> {
	await requireAuth();
	const item = validateItem(value);
	await db.orm.public.GroceryItem.create({
		id: item.id,
		dateKey: item.dateKey,
		name: item.name,
		done: item.done,
	});

	if (typeof item.priceCents === "number") {
		const syncData = await getStoredSyncData();
		syncData.itemMeta[item.id] = { priceCents: item.priceCents, paid: false };
		await saveStoredSyncData(syncData);
		if (syncData.autoAddDates[item.dateKey]) {
			await syncGroceryDateToBudgetBill(item.dateKey, syncData);
		}
	} else {
		const syncData = await getStoredSyncData();
		if (syncData.autoAddDates[item.dateKey]) {
			await syncGroceryDateToBudgetBill(item.dateKey, syncData);
		}
	}

	updateTag("grocery-items");
	revalidatePath("/grocery");
	revalidatePath("/budget");
}

export async function updateGroceryItem(id: string, value: unknown): Promise<void> {
	await requireAuth();
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

	let syncDataModified = false;
	const syncData = await getStoredSyncData();

	if (Object.hasOwn(update, "paid") && typeof update.paid === "boolean") {
		const existingMeta = syncData.itemMeta[id] ?? {};
		const currentPriceCents = (Object.hasOwn(update, "priceCents") && typeof update.priceCents === "number")
			? update.priceCents
			: (existingMeta.priceCents ?? 0);
		const targetPaid = currentPriceCents > 0 ? update.paid : false;
		syncData.itemMeta[id] = { ...existingMeta, paid: targetPaid };
		syncDataModified = true;
		if (Object.hasOwn(update, "done")) {
			fields.done = Boolean(update.done);
		} else {
			fields.done = targetPaid;
		}
	}

	const existing = await db.orm.public.GroceryItem.first({ id });
	if (!existing) throw new Error("Grocery item was not found.");

	if (Object.keys(fields).length > 0) {
		await db.orm.public.GroceryItem.where({ id }).update(fields);
	}

	if (Object.hasOwn(update, "priceCents") && typeof update.priceCents === "number") {
		const existingMeta = syncData.itemMeta[id] ?? {};
		const newPriceCents = Math.max(0, Math.round(update.priceCents));
		const paid = newPriceCents <= 0 ? false : (existingMeta.paid ?? false);
		syncData.itemMeta[id] = { ...existingMeta, priceCents: newPriceCents, paid };
		if (newPriceCents <= 0 && existingMeta.paid) {
			fields.done = false;
		}
		syncDataModified = true;
	}

	if (syncDataModified) {
		await saveStoredSyncData(syncData);
	}

	if (syncData.autoAddDates[existing.dateKey]) {
		await syncGroceryDateToBudgetBill(existing.dateKey, syncData);
	}

	updateTag("grocery-items");
	revalidatePath("/grocery");
	revalidatePath("/budget");
}

export async function deleteGroceryItem(id: string): Promise<void> {
	await requireAuth();
	if (typeof id !== "string" || !id || id.length > 128) throw new Error("Invalid grocery item ID.");
	const existing = await db.orm.public.GroceryItem.first({ id });
	if (!existing) throw new Error("Grocery item was not found.");

	await db.orm.public.GroceryItem.where({ id }).delete();

	const syncData = await getStoredSyncData();
	if (syncData.itemMeta[id]) {
		delete syncData.itemMeta[id];
		await saveStoredSyncData(syncData);
	}

	if (syncData.autoAddDates[existing.dateKey]) {
		await syncGroceryDateToBudgetBill(existing.dateKey, syncData);
	}

	updateTag("grocery-items");
	revalidatePath("/grocery");
	revalidatePath("/budget");
}

export async function getGroceryDayDetails(dateKey: string) {
	await requireAuth();
	if (!isDateKey(dateKey)) throw new Error("Invalid grocery date.");
	const [rawItems, syncData] = await Promise.all([
		db.orm.public.GroceryItem
			.select("id", "dateKey", "name", "done")
			.where({ dateKey })
			.orderBy([(item) => item.createdAt.asc(), (item) => item.id.asc()])
			.all(),
		getStoredSyncData(),
	]);

	const items = rawItems.map((item) => ({
		...item,
		priceCents: syncData.itemMeta[item.id]?.priceCents ?? 0,
		paid: syncData.itemMeta[item.id]?.paid ?? false,
	}));

	const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);
	const payableItems = items.filter((item) => item.priceCents > 0);
	const isAllPaid = payableItems.length > 0 && payableItems.every((item) => item.paid);

	const [year, month, day] = dateKey.split("-").map(Number);
	const dateObj = new Date(year, month - 1, day);
	const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	const shortTitle = `Grocery on ${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

	return {
		dateKey,
		formattedDate,
		shortTitle,
		items,
		totalCents,
		isAllPaid,
		autoAddToBudget: Boolean(syncData.autoAddDates[dateKey]),
	};
}

export async function setGroceryDayAllPaid(dateKey: string, paid: boolean): Promise<void> {
	await requireAuth();
	if (!isDateKey(dateKey)) throw new Error("Invalid grocery date.");
	const [rawItems, syncData] = await Promise.all([
		db.orm.public.GroceryItem
			.select("id")
			.where({ dateKey })
			.all(),
		getStoredSyncData(),
	]);

	const payableIds: string[] = [];
	for (const item of rawItems) {
		const existingMeta = syncData.itemMeta[item.id] ?? {};
		const hasPrice = (existingMeta.priceCents ?? 0) > 0;
		if (paid) {
			if (hasPrice) {
				syncData.itemMeta[item.id] = { ...existingMeta, paid: true };
				payableIds.push(item.id);
			} else {
				syncData.itemMeta[item.id] = { ...existingMeta, paid: false };
			}
		} else {
			syncData.itemMeta[item.id] = { ...existingMeta, paid: false };
			payableIds.push(item.id);
		}
	}

	if (paid) {
		if (payableIds.length > 0) {
			await Promise.all(payableIds.map((id) => db.orm.public.GroceryItem.where({ id }).update({ done: true })));
		}
	} else {
		await db.orm.public.GroceryItem.where({ dateKey }).update({ done: false });
	}

	await saveStoredSyncData(syncData);

	if (syncData.autoAddDates[dateKey]) {
		await syncGroceryDateToBudgetBill(dateKey, syncData);
	}

	updateTag("grocery-items");
	updateTag("budget-planner");
	revalidatePath("/grocery");
	revalidatePath("/budget");
}
