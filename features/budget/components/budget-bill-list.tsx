import { Banknote, CalendarDays, Check, Circle, House, Pencil, Receipt, Trash2, Utensils, Zap, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { monthLabel, money, isBillOccurrenceOverdue, type BillOccurrence } from "@/features/budget/lib/budget-utils";
import { budgetCategoryLabels, type BudgetBill, type BudgetCategory } from "@/features/budget/types";

const categoryStyles: Record<BudgetCategory, { icon: LucideIcon; rail: string; iconBox: string; badge: string }> = {
	utility: {
		icon: Zap,
		rail: "bg-rose-500",
		iconBox: "from-rose-500 to-red-600 shadow-rose-500/20",
		badge: "bg-rose-500/10 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
	},
	housing: {
		icon: House,
		rail: "bg-amber-500",
		iconBox: "from-amber-400 to-orange-500 shadow-amber-500/20",
		badge: "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200",
	},
	loan: {
		icon: Banknote,
		rail: "bg-sky-500",
		iconBox: "from-sky-500 to-blue-600 shadow-sky-500/20",
		badge: "bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200",
	},
	foods: {
		icon: Utensils,
		rail: "bg-emerald-500",
		iconBox: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
		badge: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
	},
};

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
		<CardContent className="mx-3 mb-1 p-0 sm:mx-4 sm:mb-1">
			<section aria-label={`Bills for ${monthLabel(selectedMonth)}`} className="space-y-3">
				{occurrences.length ? <div className="space-y-2">{sortedOccurrences.map(({ bill, monthKey: occurrenceMonth }) => {
				const isPaid = bill.paidMonthKeys.includes(occurrenceMonth);
				const isOverdue = !isPaid && isBillOccurrenceOverdue(bill, occurrenceMonth, today);
				const occurrenceLabel = occurrenceMonth === selectedMonth ? "" : ` · from ${monthLabel(occurrenceMonth)}`;
				const [year, month] = occurrenceMonth.split("-").map(Number);
				const dueDay = bill.dueDay === null ? null : Math.min(bill.dueDay, new Date(year, month, 0).getDate());
				const daysUntilDue = dueDay === null ? null : Math.round(
					(Date.UTC(year, month - 1, dueDay) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000,
				);
				const dueLabel = isPaid
					? "Paid"
					: daysUntilDue === null
						? "Due date not set"
						: daysUntilDue < 0
							? `Overdue by ${Math.abs(daysUntilDue)} day${daysUntilDue === -1 ? "" : "s"}`
							: daysUntilDue === 0
								? "Due today"
								: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`;
				const CategoryIcon = categoryStyles[bill.category].icon;
				const categoryStyle = categoryStyles[bill.category];
				const statusLabel = isOverdue ? "Overdue · unpaid" : isPaid ? "Paid" : "Unpaid";
				return <article key={`${bill.id}-${occurrenceMonth}`} data-page-palette-preserve className="group relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm shadow-slate-900/5 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30 dark:hover:border-slate-700 sm:px-4 md:grid-cols-[auto_minmax(0,1fr)_auto]">
					<span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${categoryStyle.rail}`} />
					<span className={`ml-1 grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-white shadow-lg ${categoryStyle.iconBox}`}>
						<CategoryIcon size={22} />
					</span>
					<div className="min-w-0">
						<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
							<p className={`truncate text-sm font-bold tracking-tight ${isPaid ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>{bill.title}</p>
							<span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${categoryStyle.badge}`}>{budgetCategoryLabels[bill.category]}</span>
						</div>
						<div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
							<span className="inline-flex items-center gap-1"><CalendarDays size={12} />{bill.frequency === "recurring" ? "Recurring monthly" : "This month only"}{occurrenceLabel}</span>
							{bill.dueDay !== null && <><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><CalendarDays size={12} />Due day {bill.dueDay}</span></>}
							<span aria-hidden="true" className={`size-1.5 rounded-full ${isOverdue ? "bg-rose-500" : isPaid ? "bg-emerald-500" : "bg-slate-400"}`} />
							<span>{statusLabel}</span>
						</div>
					</div>
					<div className="col-start-2 flex min-w-0 flex-wrap items-center justify-between gap-2 md:col-start-3 md:row-span-2 md:flex-nowrap md:justify-self-end">
						<div className="flex min-w-0 items-center gap-2 md:border-l md:border-slate-200 md:pl-4 dark:md:border-slate-700">
							<span className="whitespace-nowrap text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{money.format(bill.amountCents / 100)}</span>
							<span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${isPaid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : isOverdue ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"}`}>
								<CalendarDays size={12} />
								{dueLabel}
							</span>
						</div>
						<div className="flex shrink-0 items-center gap-1">
							<Button type="button" disabled={submitting} variant="ghost" size="icon-sm" className="size-9 rounded-full text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300" aria-label={`Edit ${bill.title}`} title="Edit bill" onClick={() => onEdit(bill)}><Pencil size={16} /></Button>
							<Button type="button" disabled={submitting} variant="ghost" size="icon-sm" className="size-9 rounded-full text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300" aria-label={isPaid ? `Mark ${bill.title} unpaid for ${monthLabel(occurrenceMonth)}` : `Mark ${bill.title} paid for ${monthLabel(occurrenceMonth)}`} title={isPaid ? "Mark unpaid" : "Mark paid"} onClick={() => onPaymentChange(bill, occurrenceMonth, !isPaid)}>{isPaid ? <Check size={16} className="text-emerald-600" /> : <Circle size={16} className="text-slate-400" />}</Button>
							<Button type="button" disabled={submitting} variant="ghost" size="icon-sm" className="size-9 rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-300" aria-label={`Delete ${bill.title}`} title="Delete bill" onClick={() => onDelete(bill.id)}><Trash2 size={16} /></Button>
						</div>
					</div>
				</article>;
				})}</div> : <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{hiddenOverdueCount > 0 ? "Overdue bills are available in the alert above." : "No bills scheduled for this month."}</div>}
			</section>
		</CardContent>
	</Card>;
}
