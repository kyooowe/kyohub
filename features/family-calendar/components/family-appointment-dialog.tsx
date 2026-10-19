import type { FormEvent } from "react";
import { CalendarDays, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/components/settings/settings-context";
import { dateLabel } from "@/features/grocery/lib/grocery-utils";
import { familyAppointmentTypes, type FamilyAppointment } from "@/features/family-calendar/family-calendar-types";

export function FamilyAppointmentDialog({ entry, selectedDate, onOpenChange, onSubmit, submitting = false }: { entry: FamilyAppointment | "new" | null; selectedDate: Date; onOpenChange: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitting?: boolean }) {
	const { settings } = useAppSettings();
	const pagePalette = settings.pagePalettes["/family-calendar"];
	const dialogPalette = pagePalette === "default" ? "teal" : pagePalette;

	return <Dialog open={entry !== null} onOpenChange={onOpenChange}><DialogContent pagePalette={dialogPalette} data-page-palette-surface className="palette-dialog-panel max-w-sm overflow-hidden border-teal-200 bg-white p-0 shadow-2xl shadow-teal-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:rounded-2xl">
		<PaletteDialogHeader eyebrow="FAMILY CALENDAR" title={entry === "new" ? "Add an appointment" : "Edit appointment"} description={dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric" })} icon={<CalendarDays size={18} />} closeLabel="Close dialog" />
		{entry && <form key={entry === "new" ? "new" : entry.id} onSubmit={onSubmit} className="space-y-4 px-6 py-5">
			<label className="block text-sm font-medium text-slate-900 dark:text-slate-100">What do you need to remember?<Input data-page-palette-control required name="title" placeholder="e.g. First dose of vaccine" defaultValue={entry === "new" ? "" : entry.title} className="mt-2 border-teal-200 bg-white text-slate-900 focus-visible:border-teal-400 focus-visible:ring-teal-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" /></label>
			<label className="block text-sm font-medium text-slate-900 dark:text-slate-100">Event type<select data-page-palette-control name="type" defaultValue={entry === "new" ? "Vaccination" : entry.type} className="mt-2 h-9 w-full rounded-md border border-teal-200 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-teal-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">{familyAppointmentTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
			<label className="block text-sm font-medium text-slate-900 dark:text-slate-100">Notes <span className="font-normal text-slate-400">(optional)</span><Input data-page-palette-control name="notes" placeholder="e.g. Clinic, dose, or a little reminder" defaultValue={entry === "new" ? "" : entry.notes} className="mt-2 border-teal-200 bg-white text-slate-900 focus-visible:border-teal-400 focus-visible:ring-teal-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" /></label>
			<div className="palette-dialog-footer -mx-6 -mb-5 mt-5 flex flex-wrap justify-end gap-2 p-4 sm:px-6"><Button data-page-palette-secondary type="button" disabled={submitting} variant="outline" className="palette-dialog-footer-button border font-medium transition-colors duration-150" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" variant="ghost" disabled={submitting} className="palette-action-button palette-dialog-footer-button border font-medium transition-colors duration-150">{submitting ? <><Loader2 size={16} className="animate-spin shrink-0" /><span>Saving...</span></> : <>{entry === "new" && <Plus size={16} className="shrink-0" />}<span>{entry === "new" ? "Add reminder" : "Save changes"}</span></>}</Button></div>
		</form>}
	</DialogContent></Dialog>;
}
