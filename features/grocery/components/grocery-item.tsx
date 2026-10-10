"use client";

import { Check, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroceryItem as GroceryItemType } from "@/features/grocery/types";

export function GroceryItem({ item, onUpdate, onEdit, submitting = false }: { item: GroceryItemType; onUpdate: (id: string, update: (item: GroceryItemType) => GroceryItemType | null) => void; onEdit: (item: GroceryItemType) => void; submitting?: boolean }) {
	return <div className="flex min-h-11 items-center gap-3">
		<button type="button" disabled={submitting} aria-label={item.done ? `Mark ${item.name} incomplete` : `Mark ${item.name} complete`} onClick={() => onUpdate(item.id, (current) => ({ ...current, done: !current.done }))} className={`grid size-4 place-items-center rounded border transition-colors ${item.done ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white hover:border-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-400"}`}>{submitting ? <Loader2 size={12} className="animate-spin" /> : item.done && <Check size={12} />}</button>
		<span className={`flex-1 text-sm ${item.done ? "text-muted-foreground line-through" : "text-slate-800 dark:text-slate-200"}`}>{item.name}</span>
		<Button type="button" disabled={submitting} variant="ghost" size="icon-xs" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}><Pencil size={14} /></Button>
		<Button type="button" disabled={submitting} variant="ghost" size="icon-xs" onClick={() => onUpdate(item.id, () => null)} aria-label={`Remove ${item.name}`}>{submitting ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}</Button>
	</div>;
}
