import { CalendarDays, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shiftMonth } from "@/features/budget/lib/budget-utils";

export function BudgetHeader({ selectedMonth, onSelectMonth }: { selectedMonth: string; onSelectMonth: (month: string) => void }) {
	return <div className="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-rose-700 dark:text-rose-300"><span className="grid size-6 place-items-center rounded-md bg-rose-100 dark:bg-rose-950"><Wallet size={14} /></span> PLAN YOUR MONTH</p>
			<h1 className="bg-linear-to-r from-slate-900 via-rose-950 to-orange-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-slate-100 dark:via-rose-200 dark:to-orange-300 md:text-3xl">Budget planner</h1>
			<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Know what is left after the bills are covered.</p>
		</div>
		<div data-budget-outline="surface" className="flex items-center gap-1 rounded-2xl border border-rose-100 bg-white p-1.5 shadow-md shadow-rose-100/60 ring-1 ring-white dark:border-slate-800 dark:bg-slate-900 dark:shadow-rose-950/40 dark:ring-rose-950/40">
			<Button type="button" variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => onSelectMonth(shiftMonth(selectedMonth, -1))} className="rounded-xl text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-300"><ChevronLeft size={18} /></Button>
			<label className="flex min-w-0 items-center gap-2 rounded-xl px-2"><CalendarDays size={17} className="shrink-0 text-rose-600 dark:text-rose-300" /><span className="sr-only">Selected month</span><Input type="month" value={selectedMonth} onChange={(event) => onSelectMonth(event.target.value)} className="h-9 w-36 cursor-pointer border-0 bg-transparent px-0 text-sm font-semibold text-slate-800 shadow-none focus-visible:ring-0 dark:text-slate-100" /></label>
			<Button type="button" variant="ghost" size="icon-sm" aria-label="Next month" onClick={() => onSelectMonth(shiftMonth(selectedMonth, 1))} className="rounded-xl text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-300"><ChevronRight size={18} /></Button>
		</div>
	</div>;
}
