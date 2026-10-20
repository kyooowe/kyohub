"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createSession, destroySession, getSessionUser, isValidPin } from "@/features/auth/lib/session";

const APP_CACHE_TAGS = [
	"password-entries",
	"budget-planner",
	"grocery-items",
	"family-calendar",
	"baby-tracker",
] as const;

export async function login(pin: string): Promise<{ error?: string }> {
	if (typeof pin !== "string" || !/^\d{6}$/.test(pin)) return { error: "Enter your 6-digit PIN." };
	if (!isValidPin(pin)) {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return { error: "Incorrect PIN. Please try again." };
	}
	await createSession(pin);
	return {};
}

export async function getCurrentUser() {
	return getSessionUser();
}

export async function logout() {
	await destroySession();

	// Invalidate all feature data cache tags
	for (const tag of APP_CACHE_TAGS) {
		try {
			updateTag(tag);
		} catch {
			// ignore if outside action context
		}
	}

	// Purge all component caches and layouts across all routes
	try {
		revalidatePath("/", "layout");
		revalidatePath("/", "page");
		revalidatePath("/baby-tracker", "page");
		revalidatePath("/budget", "page");
		revalidatePath("/grocery", "page");
		revalidatePath("/passwords", "page");
		revalidatePath("/family-calendar", "page");
	} catch {
		// ignore
	}
}
