import { Bell, CalendarDays, Syringe } from "lucide-react";
import type { FamilyAppointment } from "@/features/family-calendar/family-calendar-types";
import { dateLabel } from "@/features/grocery/lib/grocery-utils";

type UpcomingNeedKind = "vaccine" | "important";

export function UpcomingFamilyAppointment({ need, kind }: { need: (FamilyAppointment & { dateKey: string }) | undefined; kind: UpcomingNeedKind }) {
	const isVaccine = kind === "vaccine";
	const hasNeed = Boolean(need);
	const accent = isVaccine
		? hasNeed ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40" : "border-teal-100 bg-white dark:border-slate-800 dark:bg-slate-900"
		: hasNeed ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40" : "border-teal-100 bg-white dark:border-slate-800 dark:bg-slate-900";
	const iconStyle = isVaccine
		? hasNeed ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
		: hasNeed ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300";
	const labelStyle = isVaccine
		? hasNeed ? "text-amber-700 dark:text-amber-300" : "text-teal-700 dark:text-teal-300"
		: hasNeed ? "text-rose-700 dark:text-rose-300" : "text-teal-700 dark:text-teal-300";
	const dateStyle = isVaccine ? "text-amber-800 dark:text-amber-200" : "text-rose-800 dark:text-rose-200";
	const label = isVaccine ? (hasNeed ? "Next vaccine" : "Vaccine reminder") : (hasNeed ? "Next important date" : "Important date reminder");
	const emptyMessage = isVaccine ? "No upcoming vaccines scheduled" : "No upcoming important dates scheduled";
	return <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${accent}`}><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconStyle}`}>{hasNeed ? (isVaccine ? <Syringe size={19} /> : <CalendarDays size={19} />) : <Bell size={19} />}</span><div className="min-w-0"><p className={`text-xs font-semibold uppercase tracking-wide ${labelStyle}`}>{label}</p><p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{need?.title ?? emptyMessage}</p></div>{need && <span className={`ml-auto shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold dark:bg-slate-900 ${dateStyle}`}>{dateLabel(new Date(`${need.dateKey}T00:00:00`), { month: "short", day: "numeric", year: "numeric" })}</span>}</div>;
}
