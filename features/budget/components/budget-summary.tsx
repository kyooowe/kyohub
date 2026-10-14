import { useState } from "react";
import { AlertTriangle, Check, DollarSign, Receipt, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { monthLabel, money, type BillOccurrence } from "@/features/budget/lib/budget-utils";
import type { BudgetBill } from "@/features/budget/types";
import type { BudgetMode } from "@/components/settings/settings-model";

function overdueDueDate({ bill, monthKey }: BillOccurrence) {
	const [year, month] = monthKey.split("-").map(Number);
	const daysInMonth = new Date(year, month, 0).getDate();
	const dueDay = Math.min(bill.dueDay ?? daysInMonth, daysInMonth);
	return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, dueDay));
}

export type CutoffBillStat = {
	totalCents: number;
	paidCents: number;
	billCount: number;
	paidCount: number;
};

export function BudgetSummary({
	selectedMonth,
	budgetCents,
	billCount,
	scheduledBillTotalCents,
	paidBillCount,
	unpaidBillCount,
	billWindowLabel,
	overdueBills,
	remainingCents,
	submitting,
	error,
	onCompleteOverdue,
	budgetMode = "monthly",
}: {
	selectedMonth: string;
	budgetCents: number;
	billCount: number;
	scheduledBillTotalCents: number;
	paidBillCount: number;
	unpaidBillCount: number;
	billWindowLabel: string;
	overdueBills: BillOccurrence[];
	remainingCents: number;
	submitting: boolean;
	error: string;
	onCompleteOverdue: (bill: BudgetBill, monthKey: string) => Promise<boolean>;
	budgetMode?: BudgetMode;
}) {
	const [overdueDialogOpen, setOverdueDialogOpen] = useState(false);
	const remainingPercent = budgetCents > 0
		? Math.max(0, Math.min(100, Math.round(remainingCents / budgetCents * 100)))
		: null;
	const remainingGaugeStyle = {
		background: `conic-gradient(#10b981 ${remainingPercent ?? 0}%, var(--remaining-gauge-track) 0)`,
	};
	const overdueTotalCents = overdueBills.reduce((total, { bill }) => total + bill.amountCents, 0);

	async function completeOverdueBill(bill: BudgetBill, monthKey: string) {
		const completed = await onCompleteOverdue(bill, monthKey);
		if (completed && overdueBills.length === 1) setOverdueDialogOpen(false);
	}

	return <div className="space-y-4">
		{overdueBills.length > 0 && <button type="button" onClick={() => setOverdueDialogOpen(true)} className="group flex w-full items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left shadow-sm shadow-amber-900/5 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-950">
			<span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"><AlertTriangle size={18} /></span>
			<span className="min-w-0 flex-1">
				<span className="block text-sm font-semibold text-amber-950 dark:text-amber-100">You have {overdueBills.length} overdue bill{overdueBills.length === 1 ? "" : "s"}</span>
				<span className="block text-xs text-amber-800/80 dark:text-amber-200/80">Select to see overdue details · {money.format(overdueTotalCents / 100)}</span>
			</span>
			<span className="shrink-0 text-xs font-semibold text-amber-900 group-hover:underline dark:text-amber-200">View bills</span>
		</button>}
		<Dialog open={overdueDialogOpen} onOpenChange={setOverdueDialogOpen}>
			<DialogContent className="palette-dialog-panel max-w-lg overflow-hidden border-amber-200 bg-white p-0 shadow-2xl shadow-amber-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:rounded-2xl">
				<PaletteDialogHeader tone="warning" eyebrow="BUDGET PLANNER" title="Overdue bills" description={`${overdueBills.length} unpaid bill${overdueBills.length === 1 ? "" : "s"} past the due date`} icon={<AlertTriangle size={19} />} closeLabel="Close dialog" />
				<div className="max-h-[60vh] space-y-2 overflow-y-auto px-6 py-5">
					{error && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100">{error}</p>}
					{overdueBills.map(({ bill, monthKey }) => <div key={`${bill.id}-${monthKey}`} className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{bill.title}</p>
							<p className="text-xs text-amber-800 dark:text-amber-200">Due {overdueDueDate({ bill, monthKey })}</p>
						</div>
						<div className="flex shrink-0 items-center gap-3">
							<p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{money.format(bill.amountCents / 100)}</p>
							<Button type="button" size="sm" disabled={submitting} aria-label={`Mark ${bill.title} paid for ${monthLabel(monthKey)}`} onClick={() => void completeOverdueBill(bill, monthKey)} className="group/complete h-9 rounded-full border border-emerald-500/30 bg-linear-to-r from-emerald-600 to-teal-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/10 transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-900/15 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-60 dark:border-emerald-400/20 dark:from-emerald-700 dark:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-teal-600 dark:focus-visible:ring-offset-slate-900"><span className="grid size-5 place-items-center rounded-full bg-white/15 transition-transform group-hover/complete:scale-110"><Check size={13} strokeWidth={3} /></span>Complete</Button>
						</div>
					</div>)}
				</div>
				<div className="flex items-center justify-between gap-4 border-t border-amber-100 px-6 py-4 dark:border-slate-700">
					<span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total overdue</span>
					<span className="text-base font-bold text-amber-900 dark:text-amber-200">{money.format(overdueTotalCents / 100)}</span>
				</div>
			</DialogContent>
		</Dialog>
		<div data-page-palette-preserve className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			<Card data-budget-outline="sky" className="metric-summary-card metric-summary-card--sky relative gap-0 overflow-hidden rounded-3xl border border-sky-100 bg-[#eaf6ff] py-0 shadow-sm shadow-sky-950/5 ring-0 transition-shadow hover:shadow-md dark:border-[#273349] dark:bg-[#151b2b]">
				<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_6rem] grid-rows-[2.5rem_1fr] gap-x-3 gap-y-2 p-3.5">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white"><Wallet size={19} /></span>
						<p className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">{budgetMode === "cutoff" ? "Total Cut Off budget" : "Monthly budget"}</p>
					</div>
					<span className="inline-flex h-7 w-24 items-center justify-center self-center rounded-full bg-white/70 px-2 text-[10px] font-semibold text-sky-900 dark:bg-slate-800 dark:text-sky-200">{monthLabel(selectedMonth)}</span>
					<div className="self-end">
						<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">{money.format(budgetCents / 100)}</p>
						<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{budgetMode === "cutoff" ? "Combined 4 cutoffs" : "Monthly limit"}</p>
					</div>
					<div aria-hidden="true" className="flex h-7 items-end justify-end gap-1 self-end">
						{["35%", "55%", "72%", "100%", "62%"].map((height) => (
							<span key={height} className="w-1.5 rounded-full bg-sky-600/75" style={{ height }} />
						))}
					</div>
				</CardContent>
			</Card>
			<Card data-budget-outline="rose" className="metric-summary-card metric-summary-card--rose relative gap-0 overflow-hidden rounded-3xl border border-rose-100 bg-[#fff0f3] py-0 shadow-sm shadow-rose-950/5 ring-0 transition-shadow hover:shadow-md dark:border-[#273349] dark:bg-[#151b2b]">
				<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_6rem] grid-rows-[2.5rem_1fr] gap-x-3 gap-y-2 p-3.5">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-600 text-white"><Receipt size={19} /></span>
						<p className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Scheduled bills</p>
					</div>
					<span className="inline-flex h-7 w-24 items-center justify-center self-center rounded-full bg-white/70 px-2 text-[10px] font-semibold text-rose-900 dark:bg-slate-800 dark:text-rose-200">{unpaidBillCount} unpaid</span>
					<div className="self-end">
						<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">{money.format(scheduledBillTotalCents / 100)}</p>
						<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{paidBillCount} paid · {unpaidBillCount} unpaid</p>
						<p className="text-[10px] text-slate-400 dark:text-slate-500">{billWindowLabel}</p>
					</div>
					<div className="grid w-24 grid-rows-[1.75rem_1.75rem] justify-items-stretch gap-1.5 self-end">
						<div className="flex h-7 items-center">
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-rose-200 dark:bg-slate-700"><div className="h-full rounded-full bg-rose-500" style={{ width: `${billCount ? paidBillCount / billCount * 100 : 0}%` }} /></div>
						</div>
						<span className="inline-flex h-7 w-full items-center justify-center rounded-full bg-rose-500/10 text-[11px] font-medium text-rose-800 dark:text-rose-300">Paid</span>
					</div>
				</CardContent>
			</Card>
			<Card data-budget-outline="emerald" className="metric-summary-card metric-summary-card--emerald relative gap-0 overflow-hidden rounded-3xl border border-emerald-100 bg-[#eafbf3] py-0 shadow-sm shadow-emerald-950/5 ring-0 transition-shadow hover:shadow-md dark:border-[#273349] dark:bg-[#151b2b] sm:order-2 xl:order-3">
				<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_6rem] grid-rows-[2.5rem_1fr] gap-x-3 gap-y-2 p-3.5">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white"><DollarSign size={19} /></span>
						<p className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Remaining</p>
					</div>
					<span className="inline-flex h-7 w-24 items-center justify-center self-center rounded-full bg-white/70 px-2 text-[10px] font-semibold text-emerald-900 dark:bg-slate-800 dark:text-emerald-200">Budget balance</span>
					<div className="self-end">
						<p className={`text-3xl font-bold leading-none tracking-tight ${remainingCents < 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-white"}`}>{money.format(remainingCents / 100)}</p>
						<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Budget less scheduled bills</p>
					</div>
					<div
						aria-label={remainingPercent === null ? "No budget set" : `${remainingPercent}% of budget remaining`}
						className="grid size-14 shrink-0 place-items-center self-end justify-self-end rounded-full p-[5px] [--remaining-gauge-track:#bbf7d0] dark:[--remaining-gauge-track:#263445]"
						role="img"
						style={remainingGaugeStyle}
					>
						<div className="grid size-full place-items-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-800 dark:bg-[#151b2b] dark:text-emerald-200">{remainingPercent === null ? "--" : `${remainingPercent}%`}</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>;
}
