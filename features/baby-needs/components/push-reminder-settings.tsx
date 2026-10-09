"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

type State = "checking" | "unsupported" | "unconfigured" | "disabled" | "enabled";

function applicationServerKey(value: string) {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
	return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function sendSubscription(method: "POST" | "DELETE", subscription: PushSubscription) {
	const response = await fetch("/api/push-subscriptions", {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(method === "POST" ? subscription.toJSON() : { endpoint: subscription.endpoint }),
	});
	if (!response.ok) {
		const result = await response.json().catch(() => null) as { error?: string } | null;
		throw new Error(result?.error ?? "Could not update push notification settings.");
	}
}

export function PushReminderSettings() {
	const [state, setState] = useState<State>(() => publicKey ? "checking" : "unconfigured");
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!publicKey) return;
		if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
			void Promise.resolve().then(() => setState("unsupported"));
			return;
		}

		let active = true;
		async function checkSubscription() {
			try {
				const registration = await navigator.serviceWorker.register("/service-worker.js");
				const subscription = await registration.pushManager.getSubscription();
				if (subscription) await sendSubscription("POST", subscription);
				if (active) setState(subscription ? "enabled" : "disabled");
			} catch (cause) {
				if (active) {
					setError(cause instanceof Error ? cause.message : "Could not check push notification settings.");
					setState("disabled");
				}
			}
		}
		void checkSubscription();
		return () => { active = false; };
	}, []);

	async function enable() {
		setBusy(true);
		setError("");
		try {
			if (Notification.permission === "denied") {
				throw new Error("Notifications are blocked in this browser's site settings.");
			}
			const permission = await Notification.requestPermission();
			if (permission !== "granted") throw new Error("Allow notifications to receive tomorrow's reminders.");
			const registration = await navigator.serviceWorker.register("/service-worker.js");
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: applicationServerKey(publicKey),
			});
			await sendSubscription("POST", subscription);
			setState("enabled");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not enable push notifications.");
		} finally {
			setBusy(false);
		}
	}

	async function disable() {
		setBusy(true);
		setError("");
		try {
			const registration = await navigator.serviceWorker.getRegistration("/service-worker.js");
			const subscription = await registration?.pushManager.getSubscription();
			if (subscription) {
				await subscription.unsubscribe();
				await sendSubscription("DELETE", subscription);
			}
			setState("disabled");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not disable push notifications.");
		} finally {
			setBusy(false);
		}
	}

	const statusMessage = {
		checking: "Checking this device…",
		unsupported: "Push notifications are not supported by this browser.",
		unconfigured: "Push notifications need VAPID keys configured by the app administrator.",
		disabled: "Enable this device to receive tomorrow’s reminders at 9 PM Philippine time.",
		enabled: "This device is subscribed to the daily 9 PM Philippine-time reminder.",
	}[state];

	return (
		<section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
			<div className="flex min-w-0 items-start gap-3">
				<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Bell size={19} /></span>
				<div>
					<p className="font-semibold text-slate-800">Tomorrow’s baby reminders</p>
					<p className="mt-1 text-sm text-slate-500">{statusMessage}</p>
					{error && <p role="alert" className="mt-1 text-sm text-rose-700">{error}</p>}
				</div>
			</div>
			{(state === "disabled" || state === "enabled") && (
				<Button
					type="button"
					variant={state === "enabled" ? "outline" : "default"}
					disabled={busy}
					className={state === "enabled"
						? "min-h-10 rounded-xl border-teal-200 bg-white text-teal-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900 hover:shadow-md"
						: "min-h-11 rounded-xl border-0 bg-linear-to-r from-teal-600 to-cyan-600 px-5 text-white shadow-lg shadow-teal-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-400/40"}
					onClick={() => void (state === "enabled" ? disable() : enable())}
				>
					{state === "enabled" ? <BellOff size={16} /> : <Bell size={16} />}
					{busy ? "Saving…" : state === "enabled" ? "Disable reminders" : "Enable reminders"}
				</Button>
			)}
		</section>
	);
}
