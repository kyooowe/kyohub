import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "kyohub_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60;

export type AuthUser = {
	name: string;
	initials: string;
};

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

function getUserForPin(pin: string): AuthUser | null {
	const entry = (process.env.AUTH_USERS ?? "")
		.split(",")
		.map((value) => value.trim())
		.map((value) => {
			const separator = value.indexOf(":");
			return separator === -1
				? null
				: { pin: value.slice(0, separator).trim(), name: value.slice(separator + 1).trim() };
		})
		.find((value) => value?.pin === pin);

	if (!entry?.name) return null;
	const initials = entry.name
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
	return { name: entry.name, initials };
}

export function isValidPin(pin: string) {
	const pins = (process.env.AUTH_PINS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
	// Compare against every PIN so timing doesn't reveal which one matched.
	return pins.reduce((matched, valid) => safeEqual(pin, valid) || matched, false);
}

export async function createSession(pin: string) {
	const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
	const user = getUserForPin(pin);
	if (!user) throw new Error("No profile is configured for this PIN.");
	const payload = `${expiresAt}|${encodeURIComponent(user.name)}`;
	(await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
	});
}

export async function destroySession() {
	(await cookies()).delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
	return (await getSessionUser()) !== null;
}

export async function getSessionUser(): Promise<AuthUser | null> {
	const token = (await cookies()).get(SESSION_COOKIE)?.value;
	if (!token) return null;
	const [payload, signature] = token.split(".");
	if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
	const [expiresAt, encodedName] = payload.split("|");
	if (!expiresAt || !encodedName || Number(expiresAt) <= Date.now()) return null;
	const name = decodeURIComponent(encodedName);
	const initials = name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
	return { name, initials };
}

export async function requireAuth() {
	if (!(await isAuthenticated())) throw new Error("Unauthorized.");
}
