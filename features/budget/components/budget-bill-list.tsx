import { Banknote, CalendarDays, CalendarSync, Check, ChevronDown, ChevronLeft, ChevronRight, Circle, House, ListFilter, Loader2, Pencil, Receipt, Trash2, Utensils, Zap, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { BudgetBillMoveDialog } from "@/features/budget/components/budget-bill-move-dialog";
import { monthLabel, money, isBillOccurrenceOverdue, type BillOccurrence } from "@/features/budget/lib/budget-utils";
import { budgetCategories, budgetCategoryLabels, type BillFrequency, type BudgetBill, type BudgetCategory, type CutoffDay } from "@/features/budget/types";

const dueDayOptions = [5, 15, 20, 30] as const;
const rowsPerPageOptions = [5, 15, 20, 30] as const;

const categoryStyles: Record<BudgetCategory, { icon: LucideIcon; iconBox: string; badge: string }> = {
	utility: {
		icon: Zap,
		iconBox: "from-rose-100 to-red-50 text-rose-700 shadow-rose-200/50 dark:from-rose-950/70 dark:to-red-950/50 dark:text-rose-200 dark:shadow-black/20",
		badge: "bg-rose-500/10 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
	},
	housing: {
		icon: House,
		iconBox: "from-amber-100 to-orange-50 text-amber-800 shadow-amber-200/50 dark:from-amber-950/70 dark:to-orange-950/50 dark:text-amber-200 dark:shadow-black/20",
		badge: "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200",
	},
	loan: {
		icon: Banknote,
		iconBox: "from-sky-100 to-blue-50 text-sky-700 shadow-sky-200/50 dark:from-sky-950/70 dark:to-blue-950/50 dark:text-sky-200 dark:shadow-black/20",
		badge: "bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200",
	},
	foods: {
		icon: Utensils,
		iconBox: "from-emerald-100 to-teal-50 text-emerald-700 shadow-emerald-200/50 dark:from-emerald-950/70 dark:to-teal-950/50 dark:text-emerald-200 dark:shadow-black/20",
		badge: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
	},
};

export function BudgetBillList({ selectedMonth, occurrences, hiddenOverdueCount = 0, today, submitting, pendingPaymentKeys = [], deletingBillId = null, onEdit, onMoveBill, onPaymentChange, onDelete }: {
	selectedMonth: string;
	occurrences: BillOccurrence[];
	hiddenOverdueCount?: number;
	today: Date;
	submitting: boolean;
	pendingPaymentKeys?: string[];
	deletingBillId?: string | null;
	onEdit: (bill: BudgetBill) => void;
	onMoveBill: (bill: BudgetBill, targetMonthKey: string, targetDueDay: CutoffDay, frequency: BillFrequency) => Promise<boolean>;
	onPaymentChange: (bill: BudgetBill, month: string, paid: boolean) => void;
	onDelete: (id: string) => void;
}) {
	const [movingOccurrence, setMovingOccurrence] = useState<BillOccurrence | null>(null);
	const [dueDayFilter, setDueDayFilter] = useState<number | null>(null);
	const [categoryFilter, setCategoryFilter] = useState<BudgetCategory | null>(null);
	const [rowsPerPage, setRowsPerPage] = useState<number>(rowsPerPageOptions[0]);
	const [currentPage, setCurrentPage] = useState(1);
	const sortedOccurrences = [...occurrences].sort((first, second) => {
		const firstIsOverdue = !first.bill.paidMonthKeys.includes(first.monthKey) && isBillOccurrenceOverdue(first.bill, first.monthKey, today);
		const secondIsOverdue = !second.bill.paidMonthKeys.includes(second.monthKey) && isBillOccurrenceOverdue(second.bill, second.monthKey, today);
		return Number(secondIsOverdue) - Number(firstIsOverdue);
	});
	const filteredOccurrences = sortedOccurrences.filter(({ bill }) =>
		(dueDayFilter === null || bill.dueDay === dueDayFilter)
		&& (categoryFilter === null || bill.category === categoryFilter),
	);
	const pageCount = Math.max(1, Math.ceil(filteredOccurrences.length / rowsPerPage));
	const activePage = Math.min(currentPage, pageCount);
	const firstVisibleIndex = (activePage - 1) * rowsPerPage;
	const pageOccurrences = filteredOccurrences.slice(firstVisibleIndex, firstVisibleIndex + rowsPerPage);
	const visibleTotalCents = filteredOccurrences.reduce((total, { bill }) => total + bill.amountCents, 0);
	const rangeStart = filteredOccurrences.length > 0 ? firstVisibleIndex + 1 : 0;
	const rangeEnd = Math.min(firstVisibleIndex + rowsPerPage, filteredOccurrences.length);

	return <Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
		<FeatureSectionHeader theme="rose" icon={Receipt} title={`Bills for ${monthLabel(selectedMonth)}`} description={hiddenOverdueCount > 0 ? "Overdue bills are available in the alert above." : "Monthly bills included in the total."} appearance="soft" className="min-h-[96px]">
			{filteredOccurrences.length > 0 && <span className="password-library-badge inline-flex min-h-10 w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold">{filteredOccurrences.length} bill{filteredOccurrences.length === 1 ? "" : "s"} · {money.format(visibleTotalCents / 100)}</span>}
		</FeatureSectionHeader>
		<CardContent className="mb-2 p-0 sm:mx-4 sm:mb-2">
			<section aria-label={`Bills for ${monthLabel(selectedMonth)}`} className="space-y-2">
				<div data-page-palette-surface className="planner-filter-panel budget-filter-toolbar flex flex-col gap-3 rounded-3xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
					<div className="budget-filter-controls flex min-w-0 flex-wrap items-center gap-2">
						<span aria-hidden="true" className="budget-filter-toolbar-icon planner-filter-icon grid size-9 place-items-center rounded-xl"><ListFilter size={16} /></span>
						<label className="budget-filter-field">
							<span className="budget-filter-label">Due day</span>
							<span className="relative">
								<select aria-label="Filter by due day" value={dueDayFilter ?? ""} onChange={(event) => {
									setDueDayFilter(event.target.value ? Number(event.target.value) : null);
									setCurrentPage(1);
								}} className="budget-filter-value min-w-20 appearance-none pr-5">
									<option value="">All days</option>
									{dueDayOptions.map((day) => <option key={day} value={day}>{day}</option>)}
								</select>
								<ChevronDown aria-hidden="true" size={12} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-500" />
							</span>
						</label>
						<label className="budget-filter-field">
							<span className="budget-filter-label">Type</span>
							<span className="relative">
								<select aria-label="Filter by type" value={categoryFilter ?? ""} onChange={(event) => {
									const value = event.target.value;
									setCategoryFilter(budgetCategories.find((category) => category === value) ?? null);
									setCurrentPage(1);
								}} className="budget-filter-value min-w-24 appearance-none pr-5">
									<option value="">All types</option>
									{budgetCategories.map((category) => <option key={category} value={category}>{budgetCategoryLabels[category]}</option>)}
								</select>
								<ChevronDown aria-hidden="true" size={12} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-500" />
							</span>
						</label>
						<label className="budget-filter-field">
							<span className="budget-filter-label">Rows</span>
							<span className="relative">
								<select aria-label="Rows per page" value={rowsPerPage} onChange={(event) => {
									setRowsPerPage(Number(event.target.value));
									setCurrentPage(1);
								}} className="budget-filter-value min-w-8 appearance-none pr-5">
									{rowsPerPageOptions.map((rows) => <option key={rows} value={rows}>{rows}</option>)}
								</select>
								<ChevronDown aria-hidden="true" size={12} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-500" />
							</span>
						</label>
					</div>
					{occurrences.length > 0 && <p role="status" className="budget-filter-status shrink-0 text-xs">
						<span className="text-slate-500 dark:text-slate-400">Showing</span> <span className="font-semibold text-slate-800 dark:text-slate-100">{rangeStart}–{rangeEnd}</span> <span className="text-slate-500 dark:text-slate-400">of {filteredOccurrences.length} bills</span>
					</p>}
				</div>
				{filteredOccurrences.length ? <div className="space-y-2">{pageOccurrences.map(({ bill, monthKey: occurrenceMonth }) => {
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
				const occurrenceKey = `${bill.id}-${occurrenceMonth}`;
				const isPaymentPending = pendingPaymentKeys.includes(occurrenceKey);
				const isDeleting = deletingBillId === bill.id;
				const isItemBusy = isPaymentPending || isDeleting;
				return <article key={occurrenceKey} data-page-palette-preserve className="budget-bill-card group relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 overflow-hidden rounded-2xl border p-3 transition-all hover:-translate-y-0.5 sm:rounded-3xl sm:p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-4">
					<span className={`grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br shadow-md sm:size-12 ${categoryStyle.iconBox}`}>
						<CategoryIcon size={20} className="sm:size-[22px]" />
					</span>
					<div className="min-w-0">
						<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
							<p className={`truncate text-sm font-bold tracking-tight sm:text-base ${isPaid ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>{bill.title}</p>
							<span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 ${categoryStyle.badge}`}>{budgetCategoryLabels[bill.category]}</span>
						</div>
						<div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
							<span className="inline-flex items-center gap-1"><CalendarDays size={12} />{bill.frequency === "recurring" ? "Recurring monthly" : "This month only"}{occurrenceLabel}</span>
							{bill.dueDay !== null && <><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><CalendarDays size={12} />Due day {bill.dueDay}</span></>}
							<span aria-hidden="true" className={`size-1.5 rounded-full ${isOverdue ? "bg-rose-500" : isPaid ? "bg-emerald-500" : "bg-slate-400"}`} />
							<span>{statusLabel}</span>
						</div>
					</div>
					<div className="col-span-full flex min-w-0 items-center justify-between gap-2 border-t border-slate-100/80 pt-2.5 dark:border-slate-800/80 md:col-auto md:border-t-0 md:border-l md:border-slate-200 md:pl-4 md:pt-0 dark:md:border-slate-700">
						<div className="flex min-w-0 items-center gap-2">
							<span className="whitespace-nowrap text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{money.format(bill.amountCents / 100)}</span>
							<span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 ${isPaid ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : isOverdue ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"}`}>
								<CalendarDays size={11} className="sm:size-3" />
								{dueLabel}
							</span>
						</div>
						<div className="budget-bill-actions flex shrink-0 items-center gap-0.5 rounded-2xl border p-0.5">
							<Button type="button" disabled={isItemBusy} variant="ghost" size="icon-sm" className="budget-bill-action budget-bill-action--edit size-7.5 sm:size-8 rounded-xl text-slate-500 transition-colors dark:text-slate-400" aria-label={`Edit ${bill.title}`} title="Edit bill" onClick={() => onEdit(bill)}><Pencil size={14} className="sm:size-[15px]" /></Button>
							<Button type="button" disabled={isItemBusy} variant="ghost" size="icon-sm" className="budget-bill-action budget-bill-action--move size-7.5 sm:size-8 rounded-xl text-slate-500 transition-colors dark:text-slate-400" aria-label={`Move ${bill.title}`} title="Move bill schedule" onClick={() => setMovingOccurrence({ bill, monthKey: occurrenceMonth })}><CalendarSync size={14} className="sm:size-[15px]" /></Button>
							<Button type="button" disabled={isItemBusy} variant="ghost" size="icon-sm" className="budget-bill-action budget-bill-action--payment size-7.5 sm:size-8 rounded-xl text-slate-500 transition-colors dark:text-slate-400" aria-label={isPaid ? `Mark ${bill.title} unpaid for ${monthLabel(occurrenceMonth)}` : `Mark ${bill.title} paid for ${monthLabel(occurrenceMonth)}`} title={isPaid ? "Mark unpaid" : "Mark paid"} onClick={() => onPaymentChange(bill, occurrenceMonth, !isPaid)}>{isPaymentPending ? <Loader2 size={15} className="animate-spin text-slate-500 sm:size-4" /> : isPaid ? <Check size={15} className="text-emerald-600 sm:size-4" /> : <Circle size={15} className="text-slate-400 sm:size-4" />}</Button>
							<Button type="button" disabled={isItemBusy} variant="ghost" size="icon-sm" className="budget-bill-action budget-bill-action--delete size-7.5 sm:size-8 rounded-xl text-slate-400 transition-colors dark:text-slate-400" aria-label={`Delete ${bill.title}`} title="Delete bill" onClick={() => onDelete(bill.id)}>{isDeleting ? <Loader2 size={14} className="animate-spin text-rose-500 sm:size-[15px]" /> : <Trash2 size={14} className="sm:size-[15px]" />}</Button>
						</div>
					</div>
				</article>;
				})}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-400">
					{occurrences.length === 0
						? hiddenOverdueCount > 0 ? "Overdue bills are available in the alert above." : "No bills scheduled for this month."
						: dueDayFilter !== null && categoryFilter !== null
							? `No ${budgetCategoryLabels[categoryFilter].toLowerCase()} bills due on day ${dueDayFilter}.`
							: dueDayFilter !== null
								? `No bills due on day ${dueDayFilter}.`
								: categoryFilter !== null
									? `No ${budgetCategoryLabels[categoryFilter].toLowerCase()} bills scheduled for this month.`
									: "No bills match these filters."}
				</div>}
				{filteredOccurrences.length > 0 && pageCount > 1 && <nav aria-label="Bills pagination" className="shared-pagination flex justify-center pt-3">
					<div className="shared-pagination-controls inline-flex items-center gap-1.5 rounded-2xl border p-1.5">
						<Button type="button" variant="ghost" size="icon" className="shared-pagination-button size-9 rounded-xl" aria-label="Previous page" title="Previous page" disabled={activePage === 1} onClick={() => setCurrentPage(activePage - 1)}><ChevronLeft size={16} /></Button>
						<p aria-live="polite" className="shared-pagination-page flex min-w-28 items-center justify-center gap-1.5 px-2 text-xs">
							<span className="font-medium">Page</span>
							<span className="shared-pagination-current grid size-7 place-items-center rounded-lg font-bold">{activePage}</span>
							<span className="font-medium">of {pageCount}</span>
						</p>
						<Button type="button" variant="ghost" size="icon" className="shared-pagination-button size-9 rounded-xl" aria-label="Next page" title="Next page" disabled={activePage === pageCount} onClick={() => setCurrentPage(activePage + 1)}><ChevronRight size={16} /></Button>
					</div>
				</nav>}
			</section>
		</CardContent>
		<BudgetBillMoveDialog
			open={Boolean(movingOccurrence)}
			onOpenChange={(open) => {
				if (!open) setMovingOccurrence(null);
			}}
			bill={movingOccurrence?.bill ?? null}
			occurrenceMonth={movingOccurrence?.monthKey ?? selectedMonth}
			submitting={submitting}
			onMoveConfirm={async (bill, targetMonthKey, targetDueDay, frequency) => {
				const success = await onMoveBill(bill, targetMonthKey, targetDueDay, frequency);
				if (success) setMovingOccurrence(null);
			}}
		/>
	</Card>;
}
