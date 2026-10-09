import { Bell, CalendarDays, Syringe } from "lucide-react";
import type { BabyNeed } from "@/features/baby-needs/types";
import { dateLabel } from "@/features/grocery/lib/grocery-utils";

type UpcomingNeedKind = "vaccine" | "important";

export function UpcomingNeeds({ need, kind }: { need: (BabyNeed & { dateKey: string }) | undefined; kind: UpcomingNeedKind }) {
	const isVaccine = kind === "vaccine";
	const hasNeed = Boolean(need);
	const accent = isVaccine
		? hasNeed ? "border-amber-200 bg-amber-50" : "border-teal-100 bg-white"
		: hasNeed ? "border-rose-200 bg-rose-50" : "border-teal-100 bg-white";
	const iconStyle = isVaccine
		? hasNeed ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"
		: hasNeed ? "bg-rose-100 text-rose-700" : "bg-teal-100 text-teal-700";
	const labelStyle = isVaccine
		? hasNeed ? "text-amber-700" : "text-teal-700"
		: hasNeed ? "text-rose-700" : "text-teal-700";
	const dateStyle = isVaccine ? "text-amber-800" : "text-rose-800";
	const label = isVaccine ? (hasNeed ? "Next vaccine" : "Vaccine reminder") : (hasNeed ? "Next important date" : "Important date reminder");
	const emptyMessage = isVaccine ? "No upcoming vaccines scheduled" : "No upcoming important dates scheduled";
	return <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${accent}`}><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconStyle}`}>{hasNeed ? (isVaccine ? <Syringe size={19} /> : <CalendarDays size={19} />) : <Bell size={19} />}</span><div className="min-w-0"><p className={`text-xs font-semibold uppercase tracking-wide ${labelStyle}`}>{label}</p><p className="truncate text-sm font-semibold text-slate-800">{need?.title ?? emptyMessage}</p></div>{need && <span className={`ml-auto shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold ${dateStyle}`}>{dateLabel(new Date(`${need.dateKey}T00:00:00`), { month: "short", day: "numeric", year: "numeric" })}</span>}</div>;
}
