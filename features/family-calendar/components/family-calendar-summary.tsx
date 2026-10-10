import { CheckCircle, Syringe } from "lucide-react";
import type { FamilyAppointment } from "@/features/family-calendar/family-calendar-types";

export function FamilyCalendarSummary({ needs }: { needs: FamilyAppointment[] }) {
	const complete = needs.filter((need) => need.done).length;
	return <div className="mb-3 flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-800 dark:bg-teal-950/60 dark:text-teal-200"><span className="flex items-center gap-2"><Syringe size={14} />{needs.length} reminder{needs.length === 1 ? "" : "s"}</span><span className="flex items-center gap-1"><CheckCircle size={14} />{complete} completed</span></div>;
}
