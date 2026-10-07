import { Bell, Syringe } from "lucide-react";
import type { BabyNeed } from "@/features/baby-needs/types";
import { dateLabel } from "@/features/grocery/lib/grocery-utils";

export function UpcomingNeeds({ need }: { need: (BabyNeed & { dateKey: string }) | undefined }) {
	return <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${need ? "border-amber-200 bg-amber-50" : "border-teal-100 bg-white"}`}><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${need ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>{need ? <Syringe size={19} /> : <Bell size={19} />}</span><div className="min-w-0"><p className={`text-xs font-semibold uppercase tracking-wide ${need ? "text-amber-700" : "text-teal-700"}`}>{need ? "Next vaccine" : "Vaccine reminder"}</p><p className="truncate text-sm font-semibold text-slate-800">{need?.title ?? "No upcoming vaccines scheduled"}</p></div>{need && <span className="ml-auto shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-800">{dateLabel(new Date(`${need.dateKey}T00:00:00`), { month: "short", day: "numeric", year: "numeric" })}</span>}</div>;
}
