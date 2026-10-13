import type { FormEvent } from "react";
import { Loader2, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/components/settings/settings-context";
import { dateLabel } from "@/features/grocery/lib/grocery-utils";
import type { GroceryItem } from "@/features/grocery/types";

export function GroceryDialog({ open, entry, selectedDate, onOpenChange, onSubmit, submitting = false }: { open: boolean; entry: GroceryItem | null; selectedDate: Date; onOpenChange: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitting?: boolean }) {
	const { settings } = useAppSettings();
	const pagePalette = settings.pagePalettes["/grocery"];
	const dialogPalette = pagePalette === "default" ? "blue" : pagePalette;

	return <Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent pagePalette={dialogPalette} data-page-palette-surface className="palette-dialog-panel max-w-sm overflow-hidden border-blue-200 bg-white p-0 shadow-2xl shadow-blue-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:rounded-2xl">
			<PaletteDialogHeader eyebrow="GROCERY PLANNER" title={entry ? "Edit grocery item" : "Add to your list"} description={dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric" })} icon={<ShoppingCart size={18} />} closeLabel="Close dialog" />
			<form key={entry?.id ?? "new"} onSubmit={onSubmit} className="space-y-5 px-6 py-5">
				<label className="block space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">Grocery item<Input data-page-palette-control required name="item" defaultValue={entry?.name ?? ""} placeholder="e.g. Fresh strawberries" className="h-10 border-blue-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" /></label>
				<div className="flex flex-wrap justify-end gap-2 border-t border-blue-100 pt-4 dark:border-slate-700"><Button data-page-palette-secondary type="button" disabled={submitting} variant="outline" className="palette-dialog-footer-button border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" variant="ghost" disabled={submitting} className="palette-action-button palette-dialog-footer-button border font-medium transition-colors duration-150">{submitting && <Loader2 size={16} className="animate-spin" />}{entry ? "Save changes" : <><Plus size={16} />Add item</>}</Button></div>
			</form>
		</DialogContent>
	</Dialog>;
}
