"use client";

import { Check, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroceryItem as GroceryItemType } from "@/features/grocery/types";

export function GroceryItem({ item, onUpdate, onEdit, submitting = false, completionBlocked = false }: { item: GroceryItemType; onUpdate: (id: string, update: (item: GroceryItemType) => GroceryItemType | null) => void; onEdit: (item: GroceryItemType) => void; submitting?: boolean; completionBlocked?: boolean }) {
	return <div data-page-palette-surface className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-100 bg-white px-2.5 shadow-[0_6px_18px_-18px_rgba(15,23,42,0.35)] transition-all hover:border-amber-200 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-amber-900">
		<button data-page-palette-toggle={item.done ? "done" : "pending"} type="button" disabled={submitting || completionBlocked} aria-label={item.done ? `Mark ${item.name} incomplete` : `Mark ${item.name} complete`} onClick={() => onUpdate(item.id, (current) => ({ ...current, done: !current.done }))} className={`grid size-7 shrink-0 place-items-center rounded-lg transition-all ${item.done ? "bg-linear-to-br from-amber-500 to-yellow-400 text-white shadow-sm shadow-amber-500/25" : "border border-slate-200 bg-slate-50 text-transparent hover:border-amber-300 dark:border-slate-700 dark:bg-slate-900"}`}>{(submitting || completionBlocked) ? <Loader2 size={13} className="animate-spin text-amber-700" /> : item.done && <Check size={15} strokeWidth={3} />}</button>
		<span className={`min-w-0 flex-1 truncate text-xs font-medium ${item.done ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>{item.name}</span>
		<Button data-page-palette-icon type="button" disabled={submitting} variant="ghost" size="icon-xs" className="rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}><Pencil size={13} /></Button>
		<Button type="button" disabled={submitting} variant="ghost" size="icon-xs" className="rounded-full bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-rose-950" onClick={() => onUpdate(item.id, () => null)} aria-label={`Remove ${item.name}`}>{submitting ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}</Button>
	</div>;
}
