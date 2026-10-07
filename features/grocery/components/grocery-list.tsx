import { CheckCircle, ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroceryItem } from "@/features/grocery/components/grocery-item";
import type { GroceryItem as GroceryItemType } from "@/features/grocery/types";

export function GroceryList({ items, onUpdate, onEdit, onAdd }: { items: GroceryItemType[]; onUpdate: (id: string, update: (item: GroceryItemType) => GroceryItemType | null) => void; onEdit: (item: GroceryItemType) => void; onAdd: () => void }) {
	return <>
		<div className="min-h-44 divide-y">
			{items.map((item) => <GroceryItem key={item.id} item={item} onUpdate={onUpdate} onEdit={onEdit} />)}
			{items.length === 0 && <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center text-muted-foreground"><ShoppingCart size={24} /><p className="text-sm font-medium text-foreground">Your list is clear</p><p className="text-xs">Add groceries for this day to get started.</p></div>}
		</div>
		<Button type="button" variant="outline" className="mt-3 min-h-11 w-full border-dashed border-blue-200 bg-blue-50/40 text-blue-700 hover:border-blue-300 hover:bg-blue-50" onClick={onAdd}><Plus size={16} /> Add an item</Button>
		{items.length > 0 && items.every((item) => item.done) && <p className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-700"><CheckCircle size={15} /> Everything on your list is done!</p>}
	</>;
}
