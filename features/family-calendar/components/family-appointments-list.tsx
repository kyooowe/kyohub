import { CalendarDays, Plus } from "lucide-react";
import { FamilyAppointmentItem } from "@/features/family-calendar/components/family-appointment-item";
import { Button } from "@/components/ui/button";
import type { FamilyAppointment } from "@/features/family-calendar/family-calendar-types";

export function FamilyAppointmentsList({ needs, onUpdate, onEdit, onAdd, submitting = false }: { needs: FamilyAppointment[]; onUpdate: (id: string, update: (item: FamilyAppointment) => FamilyAppointment | null) => void; onEdit: (need: FamilyAppointment) => void; onAdd: () => void; submitting?: boolean }) {
	return <>
		<p className="mb-3 text-xs text-slate-500">{needs.length} saved {needs.length === 1 ? "item" : "items"} · {needs.filter((need) => need.done).length} completed</p>
		<div className="min-h-44 divide-y divide-slate-100 dark:divide-slate-800">
			{needs.map((need) => <FamilyAppointmentItem key={need.id} need={need} onUpdate={onUpdate} onEdit={onEdit} submitting={submitting} />)}
			{!needs.length && <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center text-slate-400 dark:text-slate-500"><CalendarDays size={26} /><p className="text-sm font-medium text-slate-700 dark:text-slate-200">Nothing planned for this day</p><p className="text-xs">Add an appointment or important date to remember.</p></div>}
		</div>
		<Button type="button" disabled={submitting} variant="outline" className="mt-3 min-h-11 w-full touch-manipulation border-dashed border-teal-200 bg-teal-50/50 text-teal-700 hover:border-teal-300 hover:bg-teal-50 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:border-teal-700 dark:hover:bg-teal-950/70" onClick={onAdd}><Plus size={16} /> Add an appointment</Button>
	</>;
}
