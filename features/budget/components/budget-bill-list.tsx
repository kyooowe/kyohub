import { Check, Circle, Pencil, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { monthLabel, money, isBillOccurrenceOverdue, type BillOccurrence } from "@/features/budget/lib/budget-utils";
import type { BudgetBill } from "@/features/budget/types";

export function BudgetBillList({ selectedMonth, occurrences, hiddenOverdueCount = 0, today, submitting, onEdit, onPaymentChange, onDelete }: {
	selectedMonth: string;
	occurrences: BillOccurrence[];
	hiddenOverdueCount?: number;
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
		<FeatureSectionHeader theme="rose" icon={Receipt} title={`Bills for ${monthLabel(selectedMonth)}`} description={hiddenOverdueCount > 0 ? "Overdue bills are available in the alert above." : "Monthly bills included in the total."}>
			{occurrences.length > 0 && <span className="inline-flex min-h-14 w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-inner shadow-white/10">{occurrences.length} bill{occurrences.length === 1 ? "" : "s"} · {money.format(occurrences.reduce((total, { bill }) => total + bill.amountCents, 0) / 100)}</span>}
		</FeatureSectionHeader>
		<CardContent className="mx-3 mb-1 rounded-2xl border border-rose-100 bg-white p-4 shadow-lg shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:mx-4 sm:mb-1 sm:p-5">
			<section aria-label={`Bills for ${monthLabel(selectedMonth)}`} className="space-y-3">
				{occurrences.length ? <div className="space-y-2">{sortedOccurrences.map(({ bill, monthKey: occurrenceMonth }) => {
				const isPaid = bill.paidMonthKeys.includes(occurrenceMonth);
				const isOverdue = !isPaid && isBillOccurrenceOverdue(bill, occurrenceMonth, today);
				const occurrenceLabel = occurrenceMonth === selectedMonth ? "" : ` · from ${monthLabel(occurrenceMonth)}`;
				return <div key={`${bill.id}-${occurrenceMonth}`} 				className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-xl border border-l-4 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] ${isOverdue ? "border-amber-200 border-l-amber-500 bg-amber-50 dark:border-amber-900 dark:border-l-amber-500 dark:bg-amber-950/40" : isPaid ? "border-slate-200 border-l-emerald-500 bg-slate-50/70 dark:border-slate-800 dark:border-l-emerald-500 dark:bg-slate-950/50" : "border-slate-200 border-l-rose-500 bg-white dark:border-slate-800 dark:border-l-rose-500 dark:bg-slate-950/50"}`}>
									<div className="min-w-0 sm:flex-1">
						<p className={`truncate text-sm font-semibold ${isPaid ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>{bill.title}</p>
						<p className="text-xs text-slate-500 dark:text-slate-400">{bill.frequency === "recurring" ? "Recurring monthly" : "This month only"}{occurrenceLabel} {bill.dueDay ? `· due day ${bill.dueDay}` : ""} · {isOverdue ? "Overdue · unpaid" : isPaid ? "Paid" : "Unpaid"}</p>
					</div>
					<span className="whitespace-nowrap text-right text-sm font-semibold text-slate-800 dark:text-slate-100">{money.format(bill.amountCents / 100)}</span>
					<div className="col-span-2 flex items-center justify-end gap-1 border-t border-slate-200/70 pt-2 dark:border-slate-700 sm:col-span-1 sm:ml-auto sm:border-0 sm:pt-0">
						<Button type="button" disabled={submitting} variant="ghost" size="icon-sm" aria-label={`Edit ${bill.title}`} onClick={() => onEdit(bill)}><Pencil size={15} /></Button>
						<Button type="button" disabled={submitting} variant="ghost" size="icon-sm" aria-label={isPaid ? `Mark ${bill.title} unpaid for ${monthLabel(occurrenceMonth)}` : `Mark ${bill.title} paid for ${monthLabel(occurrenceMonth)}`} onClick={() => onPaymentChange(bill, occurrenceMonth, !isPaid)}>{isPaid ? <Check size={16} className="text-emerald-600" /> : <Circle size={16} className="text-slate-400" />}</Button>
						<Button type="button" disabled={submitting} variant="ghost" size="icon-sm" className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-300" aria-label={`Delete ${bill.title}`} onClick={() => onDelete(bill.id)}><Trash2 size={16} /></Button>
					</div>
				</div>;
				})}</div> : <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{hiddenOverdueCount > 0 ? "Overdue bills are available in the alert above." : "No bills scheduled for this month."}</div>}
			</section>
		</CardContent>
	</Card>;
}
