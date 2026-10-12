import { Cake, CalendarHeart, Loader2, PartyPopper, Pencil, Syringe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FamilyAppointment } from "@/features/family-calendar/family-calendar-types";

const eventStyles = {
	"Vaccination": { Icon: Syringe, color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
	"Important date": { Icon: CalendarHeart, color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
	"Holiday": { Icon: PartyPopper, color: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300" },
	"Birthday": { Icon: Cake, color: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300" },
} as const;

export function FamilyAppointmentItem({ need, onUpdate, onEdit, submitting = false }: { need: FamilyAppointment; onUpdate: (id: string, update: (item: FamilyAppointment) => FamilyAppointment | null) => void; onEdit: (need: FamilyAppointment) => void; submitting?: boolean }) {
	const { Icon, color } = eventStyles[need.type];
	return <div className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-100 bg-white px-2.5 py-1.5 shadow-[0_6px_18px_-18px_rgba(15,23,42,0.35)] transition-all hover:border-teal-200 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-teal-900">
		<span data-page-palette-preserve className={`grid size-8 shrink-0 place-items-center rounded-lg ${color}`}><Icon size={16} aria-hidden="true" /></span>
		<div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">{need.title}</p><p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{need.type}{need.notes ? ` · ${need.notes}` : ""}</p></div>
		<Button type="button" disabled={submitting} variant="ghost" size="icon-xs" className="rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Edit ${need.title}`} onClick={() => onEdit(need)}><Pencil size={13} /></Button>
		<Button type="button" disabled={submitting} variant="ghost" size="icon-xs" className="rounded-full bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-rose-950" aria-label={`Remove ${need.title}`} onClick={() => onUpdate(need.id, () => null)}>{submitting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}</Button>
	</div>;
}
