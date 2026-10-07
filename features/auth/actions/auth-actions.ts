"use server";

import { createSession, destroySession, isValidPin } from "@/features/auth/lib/session";

export async function login(pin: string): Promise<{ error?: string }> {
	if (typeof pin !== "string" || !/^\d{6}$/.test(pin)) return { error: "Enter your 6-digit PIN." };
	if (!isValidPin(pin)) {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return { error: "Incorrect PIN. Please try again." };
	}
	await createSession();
	return {};
}

export async function logout() {
	await destroySession();
}
