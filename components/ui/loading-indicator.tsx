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
		<div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6">
			<div className="flex animate-in items-center gap-2.5 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg shadow-slate-400/30 backdrop-blur-md duration-300 fade-in slide-in-from-bottom-4">
				<Loader2 size={16} className="animate-spin text-blue-600" />
				<span>{label}…</span>
			</div>
		</div>
	);
}
