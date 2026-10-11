export function DashboardLoading() {
	return (
		<div role="status" aria-live="polite" className="space-y-6">
			<span className="sr-only">Loading page…</span>
			<div aria-hidden="true" className="animate-pulse space-y-2">
				<div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
				<div className="h-4 w-64 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
			</div>
			<div aria-hidden="true" className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[0, 1, 2].map((item) => <div key={item} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
			</div>
			<div aria-hidden="true" className="animate-pulse space-y-3">
				{[0, 1, 2, 3].map((item) => <div key={item} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800" />)}
			</div>
		</div>
	);
}
