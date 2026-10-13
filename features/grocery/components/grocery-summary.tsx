import type { GroceryItem } from "@/features/grocery/types";
import { Check } from "lucide-react";

export function GrocerySummary({ items, doneCount }: { items: GroceryItem[]; doneCount: number }) {
	const percentage = items.length ? Math.round(doneCount / items.length * 100) : 0;
	return <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
		<span data-page-palette-summary-icon className="grid size-7 place-items-center rounded-full"><Check size={16} strokeWidth={3} /></span>
		<span><strong className="font-semibold text-slate-900 dark:text-white">{doneCount}</strong> of {items.length} completed</span>
		<span data-page-palette-summary-badge className="rounded-full px-2.5 py-1 font-semibold">{percentage}%</span>
		<div data-page-palette-summary-track className="col-span-3 h-1.5 overflow-hidden rounded-full"><i data-page-palette-summary-fill className="block h-full rounded-full transition-all" style={{ width: `${percentage}%` }} /></div>
	</div>;
}
