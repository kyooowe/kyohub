import { Check, Circle, DollarSign, Pencil, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { monthLabel, money, isBillOccurrenceOverdue, type BillOccurrence } from "@/features/budget/lib/budget-utils";
import type { BudgetBill } from "@/features/budget/types";
import { FeatureSectionHeader } from "@/components/feature-section-header";

export function BudgetBillList({ selectedMonth, occurrences, today, submitting, onEdit, onPaymentChange, onDelete }: {
	selectedMonth: string;
	occurrences: BillOccurrence[];
	today: Date;
	submitting: boolean;
	onEdit: (bill: BudgetBill) => void;
	onPaymentChange: (bill: BudgetBill, month: string, paid: boolean) => void;
	onDelete: (id: string) => void;
}) {
	const sortedOccurrences = [...occurrences].sort((first, second) => {
		const firstIsOverdue = !first.bill.paidMonthKeys.includes(first.monthKey) && isBillOccurrenceOverdue(first.bill, first.monthKey, today);
		const secondIsOverdue = !second.bill.paidMonthKeys.includes(second.monthKey) && isBillOccurrenceOverdue(second.bill, second.monthKey, today);
		return Number(secondIsOverdue) - Number(firstIsOverdue);
	});

	return <Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
		<FeatureSectionHeader theme="rose" icon={Receipt} title={`Bills for ${monthLabel(selectedMonth)}`} description="Monthly bills included in the total." />
		<CardContent className="rounded-2xl border border-rose-100 bg-white p-3 shadow-lg shadow-slate-300/30 sm:p-5">
			{occurrences.length ? <div className="space-y-2 sm:space-y-0 sm:divide-y sm:divide-slate-100">{sortedOccurrences.map(({ bill, monthKey: occurrenceMonth }) => {
				const isPaid = bill.paidMonthKeys.includes(occurrenceMonth);
				const isOverdue = !isPaid && isBillOccurrenceOverdue(bill, occurrenceMonth, today);
				const occurrenceLabel = occurrenceMonth === selectedMonth ? "" : ` · from ${monthLabel(occurrenceMonth)}`;
				return <div key={`${bill.id}-${occurrenceMonth}`} className={`grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-xl border px-3 py-3 shadow-sm sm:grid-cols-[2.25rem_minmax(0,1fr)_auto_auto] sm:rounded-lg sm:border-0 sm:shadow-none ${isOverdue ? "border-amber-200 bg-amber-50 sm:ring-1 sm:ring-amber-200" : "border-slate-200/80 bg-white sm:bg-transparent"}`}>
					<span className="grid size-9 place-items-center rounded-lg bg-rose-50 text-rose-700"><DollarSign size={16} /></span>
					<div className="min-w-0 sm:flex-1">
						<p className={`truncate text-sm font-semibold ${isPaid ? "text-slate-400 line-through" : "text-slate-900"}`}>{bill.title}</p>
						<p className="text-xs text-slate-500">{bill.frequency === "recurring" ? "Recurring monthly" : "This month only"}{occurrenceLabel} {bill.dueDay ? `· due day ${bill.dueDay}` : ""} · {isOverdue ? "Overdue · unpaid" : isPaid ? "Paid" : "Unpaid"}</p>
					</div>
					<span className="whitespace-nowrap text-right text-sm font-semibold text-slate-800">{money.format(bill.amountCents / 100)}</span>
					<div className="col-span-3 flex items-center justify-end gap-1 border-t border-slate-200/70 pt-2 sm:col-span-1 sm:ml-auto sm:border-0 sm:pt-0">
						<Button type="button" disabled={submitting} variant="ghost" size="icon-sm" aria-label={`Edit ${bill.title}`} onClick={() => onEdit(bill)}><Pencil size={15} /></Button>
						<Button type="button" disabled={submitting} variant="ghost" size="icon-sm" aria-label={isPaid ? `Mark ${bill.title} unpaid for ${monthLabel(occurrenceMonth)}` : `Mark ${bill.title} paid for ${monthLabel(occurrenceMonth)}`} onClick={() => onPaymentChange(bill, occurrenceMonth, !isPaid)}>{isPaid ? <Check size={16} className="text-emerald-600" /> : <Circle size={16} className="text-slate-400" />}</Button>
						<Button type="button" disabled={submitting} variant="ghost" size="icon-sm" className="text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${bill.title}`} onClick={() => onDelete(bill.id)}><Trash2 size={16} /></Button>
					</div>
				</div>;
			})}</div> : <div className="py-8 text-center text-sm text-slate-500">No bills scheduled for this month.</div>}
		</CardContent>
	</Card>;
}
