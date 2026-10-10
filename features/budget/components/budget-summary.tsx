import { useState } from "react";
import { AlertTriangle, Check, DollarSign, Receipt, Wallet, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { monthLabel, money, type BillOccurrence } from "@/features/budget/lib/budget-utils";
import type { BudgetBill } from "@/features/budget/types";

function overdueDueDate({ bill, monthKey }: BillOccurrence) {
	const [year, month] = monthKey.split("-").map(Number);
	const daysInMonth = new Date(year, month, 0).getDate();
	const dueDay = Math.min(bill.dueDay ?? daysInMonth, daysInMonth);
	return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, dueDay));
}

export function BudgetSummary({ selectedMonth, budgetCents, billCount, scheduledBillTotalCents, paidBillCount, unpaidBillCount, billWindowLabel, overdueBills, remainingCents, submitting, error, onCompleteOverdue }: {
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
			<DialogContent className="max-w-lg overflow-hidden border-amber-200 bg-white p-0 shadow-2xl shadow-amber-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:rounded-2xl">
				<div className="flex items-start justify-between border-b border-amber-200 bg-linear-to-r from-amber-50 to-orange-50/70 px-6 py-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
					<div className="flex items-start gap-3.5">
						<div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"><AlertTriangle size={19} /></div>
						<div><DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Overdue bills</DialogTitle><DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-300">{overdueBills.length} unpaid bill{overdueBills.length === 1 ? "" : "s"} past the due date</DialogDescription></div>
					</div>
					<DialogClose aria-label="Close dialog" className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/80 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:hover:bg-slate-700 dark:hover:text-amber-200"><X size={17} /></DialogClose>
				</div>
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
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
		<Card className="group relative gap-0 overflow-hidden border-0 bg-linear-to-br from-white via-white to-sky-100/80 py-0 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-sky-50 hover:shadow-xl hover:shadow-sky-200/70 dark:border dark:border-blue-700/80 dark:from-blue-950 dark:via-[#111c54] dark:to-blue-900 dark:shadow-black/35 dark:hover:to-blue-800 dark:hover:shadow-black/45">
			<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-sky-100/70 blur-2xl transition-all duration-300 group-hover:bg-sky-200/80 dark:bg-blue-400/15 dark:group-hover:bg-blue-300/20" />
			<CardContent className="relative flex min-h-[7.5rem] flex-row items-center gap-4 p-5">
				<span className="grid size-14 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-blue-200 transition-transform duration-200 group-hover:scale-105 dark:shadow-blue-950/60"><Wallet size={20} /></span>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly budget</p>
					<p className="text-2xl font-bold leading-tight tracking-tight text-slate-800 dark:text-slate-100">{money.format(budgetCents / 100)}</p>
					<p className="text-xs text-slate-400 dark:text-slate-500">{monthLabel(selectedMonth)}</p>
				</div>
				<div aria-hidden="true" className="flex h-12 shrink-0 items-end gap-1.5 pr-1">
					{["35%", "55%", "72%", "100%", "62%"].map((height) => (
						<span key={height} className="w-2 rounded-full bg-linear-to-t from-blue-600 to-sky-400 opacity-80" style={{ height }} />
					))}
				</div>
			</CardContent>
		</Card>
		<Card className="group relative gap-0 overflow-hidden border-0 bg-linear-to-br from-white via-white to-rose-100/80 py-0 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-rose-50 hover:shadow-xl hover:shadow-rose-200/70 dark:border dark:border-rose-700/80 dark:from-rose-950 dark:via-[#45182c] dark:to-rose-900 dark:shadow-black/35 dark:hover:to-rose-800 dark:hover:shadow-black/45">
			<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-rose-100/60 blur-2xl transition-all duration-300 group-hover:bg-rose-200/70 dark:bg-rose-400/15 dark:group-hover:bg-rose-300/20" />
			<CardContent className="relative flex min-h-[7.5rem] flex-row items-center gap-4 p-5">
				<span className="grid size-14 shrink-0 place-items-center rounded-xl bg-linear-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200 transition-transform duration-200 group-hover:scale-105 dark:shadow-rose-950/60"><Receipt size={20} /></span>
				<div className="min-w-0 flex-1 pr-10">
					<p className="text-xs font-medium text-slate-500 dark:text-slate-400">Scheduled bills</p>
					<p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{money.format(scheduledBillTotalCents / 100)}</p>
					<p className="text-xs text-slate-500 dark:text-slate-400">{paidBillCount} paid · {unpaidBillCount} unpaid</p>
					<p className="text-xs text-slate-400 dark:text-slate-500">{billWindowLabel}</p>
				</div>
				<div className="ml-auto flex flex-col items-end gap-1">
					<div className="h-1.5 w-12 overflow-hidden rounded-full bg-rose-100 dark:bg-rose-950"><div className="h-full rounded-full bg-linear-to-r from-rose-400 to-orange-500" style={{ width: `${billCount ? paidBillCount / billCount * 100 : 0}%` }} /></div>
					<span className="text-[9px] font-medium uppercase tracking-wider text-rose-600 dark:text-rose-300">Paid</span>
				</div>
				<span className="absolute right-4 top-4 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 ring-1 ring-rose-200 dark:bg-fuchsia-300/10 dark:text-fuchsia-200 dark:ring-fuchsia-300/20">{unpaidBillCount} unpaid</span>
			</CardContent>
		</Card>
		<Card className="group relative gap-0 overflow-hidden border-0 bg-linear-to-br from-white via-white to-amber-100/80 py-0 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-amber-50 hover:shadow-xl hover:shadow-amber-200/70 dark:border dark:border-emerald-700/80 dark:from-emerald-950 dark:via-[#0b3b3b] dark:to-emerald-900 dark:shadow-black/35 dark:hover:to-emerald-800 dark:hover:shadow-black/45 sm:order-2 xl:order-3">
			<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-amber-100/60 blur-2xl transition-all duration-300 group-hover:bg-amber-200/70 dark:bg-emerald-400/15 dark:group-hover:bg-emerald-300/20" />
			<CardContent className="relative flex min-h-[7.5rem] flex-row items-center gap-4 p-5">
				<span className="grid size-14 shrink-0 place-items-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200 transition-transform duration-200 group-hover:scale-105 dark:from-emerald-500 dark:to-green-500 dark:shadow-emerald-950/60"><DollarSign size={20} /></span>
				<div className="min-w-0 flex-1">
					<p className="text-xs font-medium text-slate-500 dark:text-slate-400">Remaining</p>
					<p className={`text-2xl font-bold leading-tight tracking-tight ${remainingCents < 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-800 dark:text-slate-100"}`}>{money.format(remainingCents / 100)}</p>
					<p className="text-xs text-slate-400 dark:text-slate-500">Budget less scheduled bills</p>
				</div>
				<div
					aria-label={remainingPercent === null ? "No budget set" : `${remainingPercent}% of budget remaining`}
					className="grid size-14 shrink-0 place-items-center rounded-full p-[5px] [--remaining-gauge-track:#d1fae5] dark:[--remaining-gauge-track:#0f172a] sm:size-16"
					role="img"
					style={remainingGaugeStyle}
				>
					<div className="grid size-full place-items-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-800 dark:bg-[#0b3b3b] dark:text-emerald-100">{remainingPercent === null ? "--" : `${remainingPercent}%`}</div>
				</div>
			</CardContent>
		</Card>
		</div>
	</div>;
}
