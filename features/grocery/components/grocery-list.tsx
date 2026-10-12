import { CheckCircle, ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroceryItem } from "@/features/grocery/components/grocery-item";
import type { GroceryItem as GroceryItemType } from "@/features/grocery/types";

export function GroceryList({ items, onUpdate, onEdit, onAdd, submitting = false, completionBlockedIds = new Set<string>() }: { items: GroceryItemType[]; onUpdate: (id: string, update: (item: GroceryItemType) => GroceryItemType | null) => void; onEdit: (item: GroceryItemType) => void; onAdd: () => void; submitting?: boolean; completionBlockedIds?: Set<string> }) {
	return <>
		<div className="min-h-32 space-y-1.5">
			{items.map((item) => <GroceryItem key={item.id} item={item} onUpdate={onUpdate} onEdit={onEdit} submitting={submitting} completionBlocked={completionBlockedIds.has(item.id)} />)}
			{items.length === 0 && <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center text-muted-foreground"><ShoppingCart size={24} /><p className="text-sm font-medium text-foreground">Your list is clear</p><p className="text-xs">Add groceries for this day to get started.</p></div>}
		</div>
		<Button type="button" disabled={submitting} variant="outline" className="mt-3 min-h-10 w-full border-dashed border-blue-200 bg-blue-50/40 text-xs text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/70" onClick={onAdd}><Plus size={14} /> Add an item</Button>
		{items.length > 0 && items.every((item) => item.done) && <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 px-3 py-2 text-center dark:bg-amber-950/30"><span className="grid size-7 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"><CheckCircle size={16} /></span><div><p className="text-xs font-semibold text-slate-900 dark:text-white">Everything on your list is done!</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Great job! Keep it up!</p></div></div>}
	</>;
}
