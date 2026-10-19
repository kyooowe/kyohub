"use client";

import { AlertCircle, X } from "lucide-react";

export function BudgetAlert({
	message,
	onDismiss,
}: {
	message: string;
	onDismiss?: () => void;
}) {
	if (!message) return null;

	return (
		<div
			data-page-palette-preserve
			role="alert"
			className="relative isolate flex items-center gap-3 overflow-hidden rounded-2xl border border-rose-200/90 bg-linear-to-br from-rose-50/90 via-white to-red-50/60 px-4 py-3 shadow-md shadow-rose-950/5 ring-1 ring-inset ring-white/70 transition-all dark:border-rose-900/80 dark:from-rose-950/60 dark:via-slate-900 dark:to-red-950/30 dark:shadow-black/20 dark:ring-white/5"
		>
			{/* Left accent vertical stripe */}
			<span
				aria-hidden="true"
				className="absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-rose-500"
			/>

			{/* Decorative orbit circle */}
			<span
				aria-hidden="true"
				className="pointer-events-none absolute -right-5 -top-10 size-28 rounded-full border border-white/70 bg-white/10 dark:border-white/5 dark:bg-white/[0.02]"
			/>

			{/* Rounded square icon badge */}
			<span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-rose-100 to-red-100 text-rose-700 shadow-sm ring-1 ring-inset ring-white/80 dark:from-rose-950 dark:to-red-950 dark:text-rose-300 dark:ring-white/5">
				<AlertCircle size={18} />
			</span>

			{/* Text content */}
			<div className="relative min-w-0 flex-1">
				<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
					ALERT
				</p>
				<p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
					{message}
				</p>
			</div>

			{/* Close dismiss button */}
			{onDismiss && (
				<button
					type="button"
					onClick={onDismiss}
					aria-label="Close notification"
					className="relative shrink-0 rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
				>
					<X size={16} />
				</button>
			)}
		</div>
	);
}
