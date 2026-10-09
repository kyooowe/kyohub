"use server";

import { db } from "@/prisma/db";
import { updateTag, unstable_cache } from "next/cache";
import { requireAuth } from "@/features/auth/lib/session";
import { categories } from "@/features/passwords/lib/password-utils";
import type { PasswordEntry } from "@/features/passwords/types";

const getCachedPasswordEntries = unstable_cache(
	async () => {
		const entries = await db.orm.public.PasswordEntry
			.select("id", "website", "url", "category", "username", "password")
			.orderBy([(entry) => entry.createdAt.desc(), (entry) => entry.id.desc()])
			.all();
		return entries.map(validateEntry);
	},
	["password-entries"],
	{ tags: ["password-entries"], revalidate: 60 },
);

function validateEntry(value: unknown): PasswordEntry {
	if (!value || typeof value !== "object") throw new Error("Invalid password entry.");
	const entry = value as Record<string, unknown>;
	const category = categories.find((item) => item === entry.category);
	if (
		typeof entry.id !== "string" || entry.id.length === 0 || entry.id.length > 128
		|| typeof entry.website !== "string" || !entry.website.trim() || entry.website.length > 200
		|| typeof entry.url !== "string" || !entry.url.trim() || entry.url.length > 2048
		|| !category
		|| typeof entry.username !== "string" || !entry.username.trim() || entry.username.length > 320
		|| typeof entry.password !== "string" || !entry.password || entry.password.length > 4096
	) {
		throw new Error("Enter a valid website, URL, category, username, and password.");
	}
	return {
		id: entry.id,
		website: entry.website.trim(),
		url: entry.url.trim(),
		category,
		username: entry.username.trim(),
		password: entry.password,
	};
}

export async function getPasswordEntries(): Promise<PasswordEntry[]> {
	await requireAuth();
	return getCachedPasswordEntries();
}

export async function createPasswordEntry(value: unknown): Promise<void> {
	await requireAuth();
	const entry = validateEntry(value);
	await db.orm.public.PasswordEntry.create(entry);
	updateTag("password-entries");
}

export async function updatePasswordEntry(id: string, value: unknown): Promise<void> {
	await requireAuth();
	if (typeof id !== "string" || !id || id.length > 128 || !value || typeof value !== "object") {
		throw new Error("Invalid password entry.");
	}
	const entry = validateEntry({ ...value, id });
	const existing = await db.orm.public.PasswordEntry.first({ id });
	if (!existing) throw new Error("Password entry was not found.");
	await db.orm.public.PasswordEntry.where({ id }).update({
		website: entry.website,
		url: entry.url,
		category: entry.category,
		username: entry.username,
		password: entry.password,
	});
	updateTag("password-entries");
}

export async function deletePasswordEntry(id: string): Promise<void> {
	await requireAuth();
	if (typeof id !== "string" || !id || id.length > 128) throw new Error("Invalid password entry ID.");
	const existing = await db.orm.public.PasswordEntry.first({ id });
	if (!existing) throw new Error("Password entry was not found.");
	await db.orm.public.PasswordEntry.where({ id }).delete();
	updateTag("password-entries");
}
