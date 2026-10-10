import { CircleAlert, DollarSign, Receipt, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { monthLabel, money } from "@/features/budget/lib/budget-utils";

export function BudgetSummary({ selectedMonth, budgetCents, billCount, paidBillCount, unpaidBillCount, billWindowLabel, overdueBillCount, overdueTotalCents, remainingCents }: {
	selectedMonth: string;
	budgetCents: number;
	billCount: number;
	paidBillCount: number;
	unpaidBillCount: number;
	billWindowLabel: string;
	overdueBillCount: number;
	overdueTotalCents: number;
	remainingCents: number;
}) {
	return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-sky-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-sky-50 hover:shadow-xl hover:shadow-sky-200/70">
			<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-sky-100/70 blur-2xl transition-all duration-300 group-hover:bg-sky-200/80" />
			<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-blue-200 transition-transform duration-200 group-hover:scale-105"><Wallet size={20} /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-500">Monthly budget</p><p className="text-xl font-bold leading-tight tracking-tight text-slate-800">{money.format(budgetCents / 100)}</p><p className="text-xs text-slate-400">{monthLabel(selectedMonth)}</p></div></CardContent>
		</Card>
		<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-rose-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-rose-50 hover:shadow-xl hover:shadow-rose-200/70">
			<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-rose-100/60 blur-2xl transition-all duration-300 group-hover:bg-rose-200/70" />
			<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200 transition-transform duration-200 group-hover:scale-105"><Receipt size={20} /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-500">Scheduled bills</p><p className="text-2xl font-bold tracking-tight text-slate-800">{billCount} bill{billCount === 1 ? "" : "s"}</p><p className="text-xs text-slate-500">{paidBillCount} paid · {unpaidBillCount} unpaid</p><p className="text-xs text-slate-400">{billWindowLabel}</p></div><div className="ml-auto flex flex-col items-end gap-1"><div className="h-1.5 w-12 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-linear-to-r from-rose-400 to-orange-500" style={{ width: `${billCount ? paidBillCount / billCount * 100 : 0}%` }} /></div><span className="text-[9px] font-medium uppercase tracking-wider text-rose-500">Paid</span></div></CardContent>
		</Card>
		<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-orange-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-orange-50 hover:shadow-xl hover:shadow-orange-200/70">
			<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-100/70 blur-2xl transition-all duration-300 group-hover:bg-orange-200/80" />
			<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-200 transition-transform duration-200 group-hover:scale-105"><CircleAlert size={20} /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-500">Overdue bills</p><p className="text-2xl font-bold tracking-tight text-slate-800">{money.format(overdueTotalCents / 100)}</p><p className="text-xs text-slate-500">{overdueBillCount} overdue bill{overdueBillCount === 1 ? "" : "s"}</p><p className="text-xs text-slate-400">{monthLabel(selectedMonth)}</p></div></CardContent>
		</Card>
		<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-amber-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-amber-50 hover:shadow-xl hover:shadow-amber-200/70">
			<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-amber-100/60 blur-2xl transition-all duration-300 group-hover:bg-amber-200/70" />
			<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200 transition-transform duration-200 group-hover:scale-105"><DollarSign size={20} /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-500">Remaining</p><p className={`text-xl font-bold leading-tight tracking-tight ${remainingCents < 0 ? "text-rose-700" : "text-slate-800"}`}>{money.format(remainingCents / 100)}</p><p className="text-xs text-slate-400">Budget less scheduled bills</p></div></CardContent>
		</Card>
	</div>;
}
