import { timingSafeEqual } from "node:crypto";
import { db } from "@/prisma/db";
import webpush from "web-push";

export const runtime = "nodejs";

function matchesSecret(provided: string | null, expected: string) {
	if (!provided) return false;
	const providedBytes = Buffer.from(provided);
	const expectedBytes = Buffer.from(`Bearer ${expected}`);
	return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes);
}

function manilaDateKey(date: Date) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Manila",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
	return `${values.year}-${values.month}-${values.day}`;
}

function getTomorrowKey(now = new Date()) {
	const [year, month, day] = manilaDateKey(now).split("-").map(Number);
	const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));
	return tomorrow.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
	const cronSecret = process.env.CRON_SECRET;
	if (!cronSecret) {
		console.error("CRON_SECRET is not configured.");
		return Response.json({ error: "Cron authorization is not configured." }, { status: 500 });
	}
	if (!matchesSecret(request.headers.get("authorization"), cronSecret)) {
		return Response.json({ error: "Unauthorized." }, { status: 401 });
	}

	const publicKey = process.env.VAPID_PUBLIC_KEY;
	const privateKey = process.env.VAPID_PRIVATE_KEY;
	const subject = process.env.VAPID_SUBJECT;
	if (!publicKey || !privateKey || !subject) {
		console.error("Web Push VAPID configuration is incomplete.");
		return Response.json({ error: "Web Push is not configured." }, { status: 500 });
	}
	webpush.setVapidDetails(subject, publicKey, privateKey);

	const tomorrowKey = getTomorrowKey();
	const needs = await db.orm.public.BabyNeed
		.select("title", "type", "dateKey", "done")
		.where({ dateKey: tomorrowKey, done: false })
		.all();
	const reminders = needs
		.filter((need) => need.type === "Important date" || need.type === "Vaccination")
		.map((need) => `${need.type}: ${need.title}`);
	const payload = JSON.stringify({
		title: "Family reminders for tomorrow",
		body: reminders.length ? reminders.join("\n") : "No family appointments scheduled tomorrow",
		url: "/baby-needs",
	});
	const subscriptions = await db.orm.public.PushSubscription
		.select("id", "endpoint", "p256dh", "auth")
		.all();
	let delivered = 0;
	let removed = 0;
	let failed = 0;

	await Promise.all(subscriptions.map(async (subscription) => {
		try {
			await webpush.sendNotification({
				endpoint: subscription.endpoint,
				keys: { p256dh: subscription.p256dh, auth: subscription.auth },
			}, payload, { TTL: 60 * 60 });
			delivered += 1;
		} catch (error) {
			const statusCode = typeof error === "object" && error !== null && "statusCode" in error
				? error.statusCode
				: undefined;
			if (statusCode === 404 || statusCode === 410) {
				await db.orm.public.PushSubscription.where({ id: subscription.id }).delete();
				removed += 1;
				return;
			}
			failed += 1;
			console.error("Could not deliver a baby reminder push notification.", { statusCode });
		}
	}));

	if (failed > 0) {
		return Response.json({ delivered, removed, failed }, { status: 502 });
	}
	return Response.json({ delivered, removed, failed });
}
