"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function LoadingIndicator({ label = "Loading your items" }: { label?: string }) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const timeout = window.setTimeout(() => setVisible(true), 350);
		return () => window.clearTimeout(timeout);
	}, []);

	if (!visible) return null;

	return (
		<div role="status" aria-live="polite" className="fixed inset-0 z-[100] grid place-items-center bg-white px-6 dark:bg-slate-950">
			<div className="flex animate-in flex-col items-center text-center duration-300 fade-in">
				<div className="flex items-center gap-2.5">
					<span className="grid size-9 grid-cols-2 gap-1 rounded-xl bg-linear-to-br from-fuchsia-400 to-violet-500 p-1.5 shadow-md shadow-violet-500/20">
						<i className="rounded-sm bg-white" />
						<i className="rounded-sm bg-white/65" />
						<i className="rounded-sm bg-white/65" />
						<i className="rounded-sm bg-white" />
					</span>
					<strong className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Kyohub.</strong>
				</div>
				<p className="mt-1 text-xs text-slate-400">Your family space</p>
				<span className="sr-only">{label}…</span>
				<Loader2 size={15} className="mt-5 animate-spin text-violet-400" aria-hidden="true" />
			</div>
		</div>
	);
}
