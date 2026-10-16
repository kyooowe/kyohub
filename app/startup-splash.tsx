"use client";

import { useEffect, useState } from "react";

export function StartupSplash() {
	const [mounted, setMounted] = useState(true);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const fadeTimer = window.setTimeout(() => setVisible(false), 700);
		const removeTimer = window.setTimeout(() => setMounted(false), 1000);
		return () => {
			window.clearTimeout(fadeTimer);
			window.clearTimeout(removeTimer);
		};
	}, []);

	if (!mounted) return null;

	return (
		<div aria-hidden="true" className={`pointer-events-none fixed inset-0 z-[100] grid place-items-center bg-white transition-opacity duration-300 dark:bg-slate-950 ${visible ? "opacity-100" : "opacity-0"}`}>
			<div className="flex animate-in flex-col items-center text-center duration-500 fade-in">
				<div className="flex items-center gap-2.5">
					<span className="grid size-9 grid-cols-2 gap-1 rounded-xl bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 p-1.5 shadow-md shadow-emerald-500/20">
						<i className="rounded-sm bg-white" />
						<i className="rounded-sm bg-white/65" />
						<i className="rounded-sm bg-white/65" />
						<i className="rounded-sm bg-white" />
					</span>
					<strong className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Kyohub.</strong>
				</div>
				<p className="mt-1 text-xs text-slate-400">Your family space</p>
			</div>
		</div>
	);
}
