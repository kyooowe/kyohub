import { CheckCircle, ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroceryItem } from "@/features/grocery/components/grocery-item";
import type { GroceryItem as GroceryItemType } from "@/features/grocery/types";

export function GroceryList({
	items,
	onUpdate,
	onEdit,
	onAdd,
	submitting = false,
	completionBlockedIds = new Set<string>(),
	isAutoAddChecked = false,
}: {
	items: GroceryItemType[];
	onUpdate: (id: string, update: (item: GroceryItemType) => GroceryItemType | null) => void;
	onEdit: (item: GroceryItemType) => void;
	onAdd: () => void;
	submitting?: boolean;
	completionBlockedIds?: Set<string>;
	isAutoAddChecked?: boolean;
}) {
	return <>
		<div className="min-h-32 space-y-1.5">
			{items.map((item) => (
				<GroceryItem
					key={item.id}
					item={item}
					onUpdate={onUpdate}
					onEdit={onEdit}
					submitting={submitting}
					completionBlocked={completionBlockedIds.has(item.id)}
					isAutoAddChecked={isAutoAddChecked}
				/>
			))}
			{items.length === 0 && <div className="planner-empty-state relative isolate flex min-h-44 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-4 py-5 text-center">
				<svg aria-hidden="true" viewBox="0 0 100 100" className="planner-empty-bubbles pointer-events-none absolute right-4 top-1/2 z-0 size-28 -translate-y-1/2 sm:right-8 sm:size-32">
					<circle cx="22" cy="24" r="15" fill="currentColor" fillOpacity=".12" stroke="white" strokeOpacity=".7" strokeWidth="1.5" />
					<circle cx="22" cy="24" r="12" fill="none" stroke="currentColor" strokeOpacity=".28" strokeWidth=".75" />
					<path d="M12 23a11 11 0 0 1 16-9" fill="none" stroke="white" strokeLinecap="round" strokeOpacity=".9" strokeWidth="2" />
					<circle cx="69" cy="30" r="21" fill="currentColor" fillOpacity=".1" stroke="white" strokeOpacity=".68" strokeWidth="1.5" />
					<circle cx="69" cy="30" r="17" fill="none" stroke="currentColor" strokeOpacity=".24" strokeWidth=".8" />
					<path d="M54 28a16 16 0 0 1 24-14" fill="none" stroke="white" strokeLinecap="round" strokeOpacity=".9" strokeWidth="2.2" />
					<circle cx="35" cy="66" r="28" fill="currentColor" fillOpacity=".11" stroke="white" strokeOpacity=".7" strokeWidth="1.6" />
					<circle cx="35" cy="66" r="23" fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth=".8" />
					<path d="M14 63a22 22 0 0 1 34-17" fill="none" stroke="white" strokeLinecap="round" strokeOpacity=".9" strokeWidth="2.5" />
					<circle cx="84" cy="61" r="11" fill="currentColor" fillOpacity=".13" stroke="white" strokeOpacity=".68" strokeWidth="1.4" />
					<path d="M77 59a8 8 0 0 1 12-5" fill="none" stroke="white" strokeLinecap="round" strokeOpacity=".9" strokeWidth="1.7" />
				</svg>
				<span className="planner-empty-icon relative z-10 grid size-12 place-items-center rounded-2xl text-white">
					<ShoppingCart size={21} strokeWidth={2} />
				</span>
				<p className="relative z-10 text-sm font-semibold text-foreground">Your list is clear</p>
				<p className="relative z-10 max-w-xs text-xs leading-5 text-muted-foreground">Add groceries for this day to get started.</p>
			</div>}
		</div>
		<Button data-page-palette-secondary type="button" disabled={submitting} variant="outline" className="planner-add-action-button mt-3 min-h-11 w-full rounded-xl text-xs font-semibold" onClick={onAdd}><Plus size={15} /> Add an item</Button>
		{items.length > 0 && items.every((item) => item.done) && <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-amber-50/70 px-3 py-2 text-center dark:bg-amber-950/30"><span className="grid size-7 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"><CheckCircle size={16} /></span><div><p className="text-xs font-semibold text-slate-900 dark:text-white">Everything on your list is done!</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Great job! Keep it up!</p></div></div>}
	</>;
}
