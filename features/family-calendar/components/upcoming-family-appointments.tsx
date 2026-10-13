import { Bell, CalendarDays, Syringe } from "lucide-react";
import type { FamilyAppointment } from "@/features/family-calendar/family-calendar-types";
import { dateLabel } from "@/features/grocery/lib/grocery-utils";

type UpcomingNeedKind = "vaccine" | "important";

export function UpcomingFamilyAppointment({ need, kind }: { need: (FamilyAppointment & { dateKey: string }) | undefined; kind: UpcomingNeedKind }) {
	const isVaccine = kind === "vaccine";
	const hasNeed = Boolean(need);
	const accent = isVaccine
		? hasNeed
			? "border-amber-200/80 bg-linear-to-br from-amber-50 via-white to-orange-50/70 dark:border-amber-900/80 dark:from-amber-950/70 dark:via-slate-900 dark:to-orange-950/30"
			: "border-teal-200/70 bg-linear-to-br from-teal-50/80 via-white to-emerald-50/60 dark:border-teal-900/70 dark:from-teal-950/50 dark:via-slate-900 dark:to-emerald-950/30"
		: hasNeed
			? "border-rose-200/80 bg-linear-to-br from-rose-50 via-white to-pink-50/70 dark:border-rose-900/80 dark:from-rose-950/70 dark:via-slate-900 dark:to-pink-950/30"
			: "border-teal-200/70 bg-linear-to-br from-teal-50/80 via-white to-emerald-50/60 dark:border-teal-900/70 dark:from-teal-950/50 dark:via-slate-900 dark:to-emerald-950/30";
	const iconStyle = isVaccine
		? hasNeed
			? "bg-linear-to-br from-amber-100 to-orange-100 text-amber-800 ring-1 ring-inset ring-white/80 dark:from-amber-950 dark:to-orange-950 dark:text-amber-200 dark:ring-white/5"
			: "bg-linear-to-br from-teal-100 to-emerald-100 text-teal-800 ring-1 ring-inset ring-white/80 dark:from-teal-950 dark:to-emerald-950 dark:text-teal-200 dark:ring-white/5"
		: hasNeed
			? "bg-linear-to-br from-rose-100 to-pink-100 text-rose-800 ring-1 ring-inset ring-white/80 dark:from-rose-950 dark:to-pink-950 dark:text-rose-200 dark:ring-white/5"
			: "bg-linear-to-br from-teal-100 to-emerald-100 text-teal-800 ring-1 ring-inset ring-white/80 dark:from-teal-950 dark:to-emerald-950 dark:text-teal-200 dark:ring-white/5";
	const labelStyle = isVaccine
		? hasNeed ? "text-amber-700 dark:text-amber-300" : "text-teal-700 dark:text-teal-300"
		: hasNeed ? "text-rose-700 dark:text-rose-300" : "text-teal-700 dark:text-teal-300";
	const dateStyle = isVaccine
		? "border-amber-200/70 text-amber-800 dark:border-amber-900/70 dark:text-amber-200"
		: "border-rose-200/70 text-rose-800 dark:border-rose-900/70 dark:text-rose-200";
	const stripeStyle = isVaccine
		? hasNeed ? "bg-amber-400" : "bg-teal-400"
		: hasNeed ? "bg-rose-400" : "bg-teal-400";
	const label = isVaccine ? (hasNeed ? "Next vaccine" : "Vaccine reminder") : (hasNeed ? "Next important date" : "Important date reminder");
	const emptyMessage = isVaccine ? "No upcoming vaccines scheduled" : "No upcoming important dates scheduled";
	return (
		<div data-page-palette-preserve className={`relative isolate flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-md shadow-slate-900/5 ring-1 ring-inset ring-white/70 transition-shadow hover:shadow-lg dark:shadow-black/20 dark:ring-white/5 ${accent}`}>
			<span aria-hidden="true" className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${stripeStyle}`} />
			<span aria-hidden="true" className="pointer-events-none absolute -right-5 -top-10 size-28 rounded-full border border-white/70 bg-white/10 dark:border-white/5 dark:bg-white/[0.02]" />
			<span className={`relative grid size-10 shrink-0 place-items-center rounded-xl shadow-sm ${iconStyle}`}>{hasNeed ? (isVaccine ? <Syringe size={18} /> : <CalendarDays size={18} />) : <Bell size={18} />}</span>
			<div className="relative min-w-0 flex-1">
				<p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${labelStyle}`}>{label}</p>
				<p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{need?.title ?? emptyMessage}</p>
			</div>
			{need && <span className={`relative ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-white/75 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm dark:bg-slate-900/75 ${dateStyle}`}><CalendarDays size={12} aria-hidden="true" />{dateLabel(new Date(`${need.dateKey}T00:00:00`), { month: "short", day: "numeric", year: "numeric" })}</span>}
		</div>
	);
}
