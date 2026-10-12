import type { GroceryItem } from "@/features/grocery/types";
import { Check } from "lucide-react";

export function GrocerySummary({ items, doneCount }: { items: GroceryItem[]; doneCount: number }) {
	const percentage = items.length ? Math.round(doneCount / items.length * 100) : 0;
	return <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
		<span className="grid size-7 place-items-center rounded-full bg-amber-500 text-white shadow-sm shadow-amber-500/25"><Check size={16} strokeWidth={3} /></span>
		<span><strong className="font-semibold text-slate-900 dark:text-white">{doneCount}</strong> of {items.length} completed</span>
		<span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">{percentage}%</span>
		<div className="col-span-3 h-1.5 overflow-hidden rounded-full bg-amber-100 dark:bg-slate-800"><i className="block h-full rounded-full bg-linear-to-r from-amber-500 to-yellow-400 transition-all" style={{ width: `${percentage}%` }} /></div>
	</div>;
}
