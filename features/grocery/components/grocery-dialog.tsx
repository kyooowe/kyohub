import type { FormEvent } from "react";
import { Loader2, Plus, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { dateLabel } from "@/features/grocery/lib/grocery-utils";
import type { GroceryItem } from "@/features/grocery/types";

export function GroceryDialog({ open, entry, selectedDate, onOpenChange, onSubmit, submitting = false }: { open: boolean; entry: GroceryItem | null; selectedDate: Date; onOpenChange: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitting?: boolean }) {
	return <Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent className="max-w-sm overflow-hidden border-blue-200 bg-white p-0 shadow-2xl shadow-blue-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:rounded-2xl">
			<div className="dialog-palette-header flex items-start justify-between border-b border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50/60 px-6 py-5 dark:border-blue-900 dark:from-blue-950 dark:to-blue-900">
				<div className="flex items-start gap-3.5"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-700 to-indigo-700 text-white shadow-sm shadow-blue-200 dark:shadow-blue-950/60"><ShoppingCart size={18} /></div><div><DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">{entry ? "Edit grocery item" : "Add to your list"}</DialogTitle><DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-300">{dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric" })}</DialogDescription></div></div>
				<DialogClose aria-label="Close dialog" className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/80 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"><X size={17} /></DialogClose>
			</div>
			<form key={entry?.id ?? "new"} onSubmit={onSubmit} className="space-y-5 px-6 py-5">
				<label className="block space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">Grocery item<Input required name="item" defaultValue={entry?.name ?? ""} placeholder="e.g. Fresh strawberries" className="h-10 border-blue-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" /></label>
				<div className="flex justify-end gap-2 border-t border-blue-100 pt-4 dark:border-slate-700"><Button type="button" disabled={submitting} variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={submitting} className="border-0 bg-linear-to-r from-blue-700 to-indigo-700 text-white shadow-sm shadow-blue-200 hover:from-blue-800 hover:to-indigo-800 dark:shadow-blue-950/60">{submitting && <Loader2 size={16} className="animate-spin" />}{entry ? "Save changes" : <><Plus size={16} />Add item</>}</Button></div>
			</form>
		</DialogContent>
	</Dialog>;
}
