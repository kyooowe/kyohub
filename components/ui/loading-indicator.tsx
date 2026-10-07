import { Loader2 } from "lucide-react";

export function LoadingIndicator({ label = "Syncing your items" }: { label?: string }) {
	return (
		<div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
			<div className="flex animate-in items-center gap-2.5 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg shadow-slate-400/30 backdrop-blur-md duration-300 fade-in slide-in-from-bottom-4">
				<Loader2 size={16} className="animate-spin text-blue-600" />
				<span>{label}…</span>
			</div>
		</div>
	);
}
