import type { GroceryItem } from "@/features/grocery/types";

export function GrocerySummary({ items, doneCount }: { items: GroceryItem[]; doneCount: number }) {
	const percentage = items.length ? Math.round(doneCount / items.length * 100) : 0;
	return <div className="mb-4 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-xs text-slate-500"><span>{doneCount} of {items.length} completed</span><span>{percentage}%</span><div className="col-span-2 h-1 overflow-hidden rounded-full bg-blue-100"><i className="block h-full rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-violet-500 transition-all" style={{ width: `${percentage}%` }} /></div></div>;
}
