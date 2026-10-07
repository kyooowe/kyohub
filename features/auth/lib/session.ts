import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "kyohub_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60;

function getSecret() {
	const secret = process.env.AUTH_SECRET;
	if (!secret) throw new Error("AUTH_SECRET is not set.");
	return secret;
}

function sign(value: string) {
	return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	return left.length === right.length && timingSafeEqual(left, right);
}

export function isValidPin(pin: string) {
	const pins = (process.env.AUTH_PINS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
	// Compare against every PIN so timing doesn't reveal which one matched.
	return pins.reduce((matched, valid) => safeEqual(pin, valid) || matched, false);
}

export async function createSession() {
	const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
	const payload = String(expiresAt);
	(await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_MAX_AGE_SECONDS,
	});
}

export async function destroySession() {
	(await cookies()).delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
	const token = (await cookies()).get(SESSION_COOKIE)?.value;
	if (!token) return false;
	const [payload, signature] = token.split(".");
	if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
	return Number(payload) > Date.now();
}

export async function requireAuth() {
	if (!(await isAuthenticated())) throw new Error("Unauthorized.");
}
