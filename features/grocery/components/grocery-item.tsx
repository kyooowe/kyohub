"use client";

import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroceryItem as GroceryItemType } from "@/features/grocery/types";

export function GroceryItem({ item, onUpdate, onEdit }: { item: GroceryItemType; onUpdate: (id: string, update: (item: GroceryItemType) => GroceryItemType | null) => void; onEdit: (item: GroceryItemType) => void }) {
	return <div className="flex min-h-11 items-center gap-3">
		<button type="button" aria-label={item.done ? `Mark ${item.name} incomplete` : `Mark ${item.name} complete`} onClick={() => onUpdate(item.id, (current) => ({ ...current, done: !current.done }))} className={`grid size-4 place-items-center rounded border transition-colors ${item.done ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white hover:border-blue-400"}`}>{item.done && <Check size={12} />}</button>
		<span className={`flex-1 text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>{item.name}</span>
		<Button type="button" variant="ghost" size="icon-xs" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}><Pencil size={14} /></Button>
		<Button type="button" variant="ghost" size="icon-xs" onClick={() => onUpdate(item.id, () => null)} aria-label={`Remove ${item.name}`}><X size={15} /></Button>
	</div>;
}
