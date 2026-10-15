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

export function FamilyReminderSettings() {
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
		<section data-page-palette-surface className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-4">
			<div className="flex min-w-0 flex-1 items-start gap-3">
				<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
					<Bell size={18} />
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-semibold text-slate-800 dark:text-slate-100 sm:text-sm">Tomorrow’s family reminders</p>
					<p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-xs">{statusMessage}</p>
					{error && <p role="alert" className="mt-1 text-xs text-rose-700 dark:text-rose-300">{error}</p>}
				</div>
			</div>
			{(state === "disabled" || state === "enabled") && (
				<Button
					type="button"
					variant={state === "enabled" ? "outline" : "default"}
					disabled={busy}
					data-page-palette-action={state === "disabled" ? true : undefined}
					data-page-palette-secondary={state === "enabled" ? true : undefined}
					className={state === "enabled"
						? "min-h-9 w-full shrink-0 justify-center rounded-xl border-violet-200 bg-white px-3.5 text-xs text-violet-800 shadow-sm transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-200 dark:hover:border-violet-700 dark:hover:bg-violet-950 sm:w-auto"
						: "min-h-9 w-full shrink-0 justify-center rounded-xl border-0 bg-violet-600 px-3.5 text-xs text-white shadow-sm transition-colors hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 sm:w-auto"}
					onClick={() => void (state === "enabled" ? disable() : enable())}
				>
					{state === "enabled" ? <BellOff size={16} /> : <Bell size={16} />}
					{busy ? "Saving…" : state === "enabled" ? "Disable reminders" : "Enable reminders"}
				</Button>
			)}
		</section>
	);
}
