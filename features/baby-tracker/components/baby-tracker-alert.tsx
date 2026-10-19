"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export interface BabyTrackerAlertData {
	eyebrow: string;
	message: string;
	timestamp?: string;
}

export function useBabyTrackerAlert(timeoutMs = 3000) {
	const [alert, setAlert] = useState<BabyTrackerAlertData | null>(null);

	useEffect(() => {
		if (!alert) return;
		const timer = setTimeout(() => {
			setAlert(null);
		}, timeoutMs);
		return () => clearTimeout(timer);
	}, [alert, timeoutMs]);

	const showAlert = (eyebrow: string, message: string) => {
		setAlert({ eyebrow, message, timestamp: "Just now" });
	};

	const clearAlert = () => setAlert(null);

	return { alert, showAlert, clearAlert };
}

export function BabyTrackerAlert({
	alert,
	onDismiss,
}: {
	alert: BabyTrackerAlertData | null;
	onDismiss: () => void;
}) {
	if (!alert) return null;

	return (
		<div
			data-page-palette-preserve
			role="status"
			className="relative isolate flex items-center gap-3 overflow-hidden rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50 via-white to-teal-50/70 px-4 py-3 shadow-md shadow-emerald-950/5 ring-1 ring-inset ring-white/70 transition-all dark:border-emerald-900/80 dark:from-emerald-950/70 dark:via-slate-900 dark:to-teal-950/30 dark:shadow-black/20 dark:ring-white/5"
		>
			{/* Left accent vertical stripe */}
			<span
				aria-hidden="true"
				className="absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-emerald-500"
			/>

			{/* Decorative orbit circle */}
			<span
				aria-hidden="true"
				className="pointer-events-none absolute -right-5 -top-10 size-28 rounded-full border border-white/70 bg-white/10 dark:border-white/5 dark:bg-white/[0.02]"
			/>

			{/* Rounded square icon badge */}
			<span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 text-emerald-800 shadow-sm ring-1 ring-inset ring-white/80 dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 dark:ring-white/5">
				<CheckCircle2 size={18} />
			</span>

			{/* Text content */}
			<div className="relative min-w-0 flex-1">
				<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
					{alert.eyebrow}
				</p>
				<p className="mt-0.5 truncate text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
					{alert.message}
				</p>
			</div>

			{/* Right-side badge */}
			<span className="relative hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/70 bg-white/75 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur-sm sm:inline-flex dark:border-emerald-900/70 dark:bg-slate-900/75 dark:text-emerald-200">
				<CheckCircle2 size={12} aria-hidden="true" />
				{alert.timestamp || "Just now"}
			</span>

			{/* Close dismiss button */}
			<button
				type="button"
				onClick={onDismiss}
				aria-label="Close notification"
				className="relative shrink-0 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
			>
				<X size={16} />
			</button>
		</div>
	);
}
