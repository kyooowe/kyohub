import { isAuthenticated } from "@/features/auth/lib/session";
import { db } from "@/prisma/db";

export const runtime = "nodejs";

type SubscriptionInput = {
	endpoint: string;
	p256dh: string;
	auth: string;
};

function isSupportedPushHost(hostname: string) {
	return hostname === "fcm.googleapis.com"
		|| hostname === "updates.push.services.mozilla.com"
		|| hostname === "web.push.apple.com"
		|| hostname === "notify.windows.com"
		|| hostname.endsWith(".notify.windows.com");
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function validateSubscription(value: unknown): SubscriptionInput | null {
	if (!isRecord(value) || typeof value.endpoint !== "string" || value.endpoint.length > 4096) return null;
	let endpoint: URL;
	try {
		endpoint = new URL(value.endpoint);
	} catch {
		return null;
	}
	if (endpoint.protocol !== "https:" || !isSupportedPushHost(endpoint.hostname) || !isRecord(value.keys)) return null;
	const { p256dh, auth } = value.keys;
	if (
		typeof p256dh !== "string" || !/^[A-Za-z0-9_-]{40,200}$/.test(p256dh)
		|| typeof auth !== "string" || !/^[A-Za-z0-9_-]{16,100}$/.test(auth)
	) {
		return null;
	}
	return { endpoint: endpoint.toString(), p256dh, auth };
}

export async function POST(request: Request) {
	if (!(await isAuthenticated())) return Response.json({ error: "Unauthorized." }, { status: 401 });

	let value: unknown;
	try {
		value = await request.json();
	} catch {
		return Response.json({ error: "Invalid subscription data." }, { status: 400 });
	}
	const subscription = validateSubscription(value);
	if (!subscription) return Response.json({ error: "Invalid subscription data." }, { status: 400 });

	const existing = await db.orm.public.PushSubscription.first({ endpoint: subscription.endpoint });
	if (existing) {
		await db.orm.public.PushSubscription.where({ id: existing.id }).update({
			p256dh: subscription.p256dh,
			auth: subscription.auth,
		});
	} else {
		await db.orm.public.PushSubscription.create(subscription);
	}
	return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
	if (!(await isAuthenticated())) return Response.json({ error: "Unauthorized." }, { status: 401 });

	let value: unknown;
	try {
		value = await request.json();
	} catch {
		return Response.json({ error: "Invalid subscription data." }, { status: 400 });
	}
	if (!isRecord(value) || typeof value.endpoint !== "string" || value.endpoint.length > 4096) {
		return Response.json({ error: "Invalid subscription data." }, { status: 400 });
	}
	let endpoint: URL;
	try {
		endpoint = new URL(value.endpoint);
	} catch {
		return Response.json({ error: "Invalid subscription data." }, { status: 400 });
	}
	if (endpoint.protocol !== "https:") return Response.json({ error: "Invalid subscription data." }, { status: 400 });

	const existing = await db.orm.public.PushSubscription.first({ endpoint: endpoint.toString() });
	if (existing) await db.orm.public.PushSubscription.where({ id: existing.id }).delete();
	return new Response(null, { status: 204 });
}
