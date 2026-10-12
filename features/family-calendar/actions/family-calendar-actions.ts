"use server";

import { db } from "@/prisma/db";
import { updateTag, unstable_cache } from "next/cache";
import { requireAuth } from "@/features/auth/lib/session";
import { isFamilyAppointmentType, type FamilyAppointment, type FamilyAppointmentType } from "@/features/family-calendar/family-calendar-types";

export type FamilyAppointmentRecord = FamilyAppointment & { dateKey: string };

const getCachedFamilyAppointments = unstable_cache(
	async () => {
		const needs = await db.orm.public.BabyNeed
			.select("id", "dateKey", "title", "type", "notes", "done")
			.orderBy([(appointment) => appointment.createdAt.asc(), (appointment) => appointment.id.asc()])
			.all();
		return needs.map(validateAppointment);
	},
	["family-calendar"],
	{ tags: ["family-calendar"], revalidate: 60 },
);

function validateType(value: unknown): FamilyAppointmentType {
	if (isFamilyAppointmentType(value)) return value;
	throw new Error("Invalid appointment type.");
}

function isDateKey(value: unknown): value is string {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validateAppointment(value: unknown): FamilyAppointmentRecord {
	if (!value || typeof value !== "object") throw new Error("Invalid family appointment.");
	const need = value as Record<string, unknown>;
	const type = validateType(need.type);
	if (
		typeof need.id !== "string" || !need.id || need.id.length > 128
		|| !isDateKey(need.dateKey)
		|| typeof need.title !== "string" || !need.title.trim() || need.title.length > 300
		|| typeof need.notes !== "string" || need.notes.length > 2000
		|| typeof need.done !== "boolean"
	) {
		throw new Error("Enter a valid appointment title, type, and date.");
	}
	return {
		id: need.id,
		dateKey: need.dateKey,
		title: need.title.trim(),
		type,
		notes: need.notes.trim(),
		done: need.done,
	};
}

export async function getFamilyAppointments(): Promise<FamilyAppointmentRecord[]> {
	await requireAuth();
	return getCachedFamilyAppointments();
}

export async function createFamilyAppointment(value: unknown): Promise<void> {
	await requireAuth();
	const need = validateAppointment(value);
	await db.orm.public.BabyNeed.create(need);
	updateTag("family-calendar");
}

export async function updateFamilyAppointment(id: string, value: unknown): Promise<void> {
	await requireAuth();
	if (typeof id !== "string" || !id || id.length > 128 || !value || typeof value !== "object") {
		throw new Error("Invalid family appointment.");
	}
	const update = value as Record<string, unknown>;
	if (!["title", "type", "notes", "done"].some((field) => Object.hasOwn(update, field))) {
		throw new Error("No family appointment changes were provided.");
	}
	const existing = await db.orm.public.BabyNeed.first({ id });
	if (!existing) throw new Error("Family appointment was not found.");
	const validated = validateAppointment({
		id,
		dateKey: existing.dateKey,
		title: Object.hasOwn(update, "title") ? update.title : existing.title,
		type: Object.hasOwn(update, "type") ? update.type : existing.type,
		notes: Object.hasOwn(update, "notes") ? update.notes : existing.notes,
		done: Object.hasOwn(update, "done") ? update.done : existing.done,
	});
	await db.orm.public.BabyNeed.where({ id }).update({
		title: validated.title,
		type: validated.type,
		notes: validated.notes,
		done: validated.done,
	});
	updateTag("family-calendar");
}

export async function deleteFamilyAppointment(id: string): Promise<void> {
	await requireAuth();
	if (typeof id !== "string" || !id || id.length > 128) throw new Error("Invalid family appointment ID.");
	const existing = await db.orm.public.BabyNeed.first({ id });
	if (!existing) throw new Error("Family appointment was not found.");
	await db.orm.public.BabyNeed.where({ id }).delete();
	updateTag("family-calendar");
}
