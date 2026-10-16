"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, Grid2X2, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import {
	billOccurrencesForMonth,
	cutoffDateRanges,
	cutoffShortLabels,
	getCutoffBudgetsForMonth,
	monthLabel,
	monthKey,
	money,
	type ExpensePoint,
} from "@/features/budget/lib/budget-utils";
import type { BudgetBill, CutoffDay, MonthlyBudget } from "@/features/budget/types";
import type { BudgetMode } from "@/components/settings/settings-model";

const dueDayOptions = [
	{ value: 5, label: "5th" },
	{ value: 15, label: "15th" },
	{ value: 20, label: "20th" },
	{ value: 30, label: "30th" },
] as const;

export function BudgetExpenseChart({
	data,
	bills,
	budgets,
	selectedMonth,
	budgetMode = "monthly",
	currentCutoffDay = 15,
}: {
	data?: ExpensePoint[];
	bills: BudgetBill[];
	budgets?: MonthlyBudget[];
	selectedMonth?: string;
	budgetMode?: BudgetMode;
	currentCutoffDay?: CutoffDay;
}) {
	// Mode is "cutoff" if budgetMode === "cutoff", otherwise "all" (monthly)
	const [viewMode, setViewMode] = useState<"cutoff" | "all">(
		budgetMode === "cutoff" ? "cutoff" : "all",
	);
	const [prevBudgetMode, setPrevBudgetMode] = useState(budgetMode);
	if (prevBudgetMode !== budgetMode) {
		setPrevBudgetMode(budgetMode);
		setViewMode(budgetMode === "cutoff" ? "cutoff" : "all");
	}

	const [selectedCutoff, setSelectedCutoff] = useState<CutoffDay>(currentCutoffDay);
	const [prevCurrentCutoffDay, setPrevCurrentCutoffDay] = useState(currentCutoffDay);
	if (prevCurrentCutoffDay !== currentCutoffDay) {
		setPrevCurrentCutoffDay(currentCutoffDay);
		setSelectedCutoff(currentCutoffDay);
	}

	const cutoffLabel = cutoffShortLabels[selectedCutoff] ?? `${selectedCutoff}th cutoff`;
	const cutoffRange = cutoffDateRanges[selectedCutoff];

	const chartData = useMemo<ExpensePoint[]>(() => {
		// If budgets and selectedMonth are not provided, fallback to incoming data
		if (!budgets || !selectedMonth) {
			if (data) {
				return data.map((d) => ({
					...d,
					remaining: d.remaining ?? d.budget - d.expenses,
				}));
			}
			return [];
		}

		const selected = new Date(`${selectedMonth}-01T00:00:00`);
		return Array.from({ length: 9 }, (_, index) => {
			const date = new Date(selected.getFullYear(), selected.getMonth() - 8 + index, 1);
			const key = monthKey(date);

			if (viewMode === "cutoff") {
				const cutoffBudgets = getCutoffBudgetsForMonth(budgets, key);
				const budget = cutoffBudgets[selectedCutoff] ?? 0;
				const occurrences = billOccurrencesForMonth(bills, key);
				const expenses = occurrences
					.filter(({ bill }) => {
						const day = bill.dueDay ?? 30;
						const cutoff: CutoffDay = day <= 5 ? 5 : day <= 15 ? 15 : day <= 20 ? 20 : 30;
						return cutoff === selectedCutoff;
					})
					.reduce((total, { bill }) => total + bill.amountCents, 0);
				const remaining = budget - expenses;

				return { key, budget, expenses, remaining };
			}

			// "all" = Monthly total
			const monthBudget = budgets.find((item) => item.monthKey === key)?.amountCents ?? 0;
			const occurrences = billOccurrencesForMonth(bills, key);
			const monthExpenses = occurrences.reduce((total, { bill }) => total + bill.amountCents, 0);
			const remaining = monthBudget - monthExpenses;
			return { key, budget: monthBudget, expenses: monthExpenses, remaining };
		});
	}, [budgets, selectedMonth, viewMode, selectedCutoff, bills, data]);

	const expenseLabel = viewMode === "cutoff"
		? `${cutoffLabel} expenses`
		: "Expenses";

	const budgetLabel = viewMode === "cutoff"
		? `${cutoffLabel} budget`
		: "Budget";

	const remainingLabel = viewMode === "cutoff"
		? `${cutoffLabel} remaining`
		: "Remaining";

	const description = viewMode === "cutoff"
		? `${cutoffLabel} (${cutoffRange}) budgets, scheduled bills, and remaining balance compared across the last nine months.`
		: "Budgets, scheduled bills, and remaining balance compared across the last nine months.";

	return (
		<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
			<FeatureSectionHeader
				theme="rose"
				icon={BarChart3}
				title="Expense comparison"
				description={description}
				appearance="soft"
				className="min-h-[104px]"
			>
				<div className="budget-chart-header-controls flex w-full flex-col gap-2 rounded-2xl border p-2 shadow-xs sm:w-[290px]">
					<fieldset className="budget-chart-mode-group grid grid-cols-2 items-center gap-1 rounded-xl border p-1 w-full">
						<legend className="sr-only">Date filter mode</legend>
						{budgetMode === "cutoff" ? (
							<>
								<label className={`budget-chart-mode-option inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${viewMode === "cutoff" ? "is-active" : ""}`}>
									<input
										type="radio"
										name="budget-date-filter-mode"
										checked={viewMode === "cutoff"}
										onChange={() => setViewMode("cutoff")}
										className="sr-only"
									/>
									<SlidersHorizontal size={13} />
									Cutoff
								</label>
								<label className={`budget-chart-mode-option inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${viewMode === "all" ? "is-active" : ""}`}>
									<input
										type="radio"
										name="budget-date-filter-mode"
										checked={viewMode === "all"}
										onChange={() => setViewMode("all")}
										className="sr-only"
									/>
									<Grid2X2 size={13} />
									Monthly
								</label>
							</>
						) : (
							<>
								<label className={`budget-chart-mode-option inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${viewMode === "all" ? "is-active" : ""}`}>
									<input
										type="radio"
										name="budget-date-filter-mode"
										checked={viewMode === "all"}
										onChange={() => setViewMode("all")}
										className="sr-only"
									/>
									<Grid2X2 size={13} />
									All
								</label>
								<label className={`budget-chart-mode-option inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${viewMode === "cutoff" ? "is-active" : ""}`}>
									<input
										type="radio"
										name="budget-date-filter-mode"
										checked={viewMode === "cutoff"}
										onChange={() => setViewMode("cutoff")}
										className="sr-only"
									/>
									<SlidersHorizontal size={13} />
									Cutoff
								</label>
							</>
						)}
					</fieldset>

					{viewMode === "cutoff" && (
						<>
							<span aria-hidden="true" className="budget-chart-control-divider block h-px w-full" />
							<fieldset className="flex items-center justify-between gap-1.5 px-0.5">
								<legend className="sr-only">Cutoff period to compare</legend>
								<span aria-hidden="true" className="budget-chart-due-label flex items-center gap-1 text-[11px] font-medium shrink-0">
									<CalendarDays size={12} />Cutoff
								</span>
								<div className="flex items-center gap-1">
									{dueDayOptions.map((option) => (
										<label
											key={option.value}
											className={`budget-chart-due-option inline-flex h-7.5 cursor-pointer items-center justify-center rounded-full border px-2.5 text-[11px] font-semibold transition-colors ${selectedCutoff === option.value ? "is-active" : ""}`}
										>
											<input
												type="radio"
												name="budget-expense-due-day"
												value={option.value}
												checked={selectedCutoff === option.value}
												onChange={() => setSelectedCutoff(option.value)}
												className="peer sr-only"
											/>
											{option.label}
										</label>
									))}
								</div>
							</fieldset>
						</>
					)}
				</div>
			</FeatureSectionHeader>

			<CardContent data-page-palette-surface className="planner-day-panel budget-chart-panel mb-1 rounded-3xl border p-3 shadow-lg sm:mx-4 sm:mb-1 sm:p-4">
				<div className="budget-chart-surface rounded-2xl border p-3 sm:p-4">
					<div data-page-palette-preserve className="budget-chart-legend mb-3 flex flex-wrap items-center gap-2 text-xs font-medium">
						<span className="budget-chart-legend-item inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1">
							<i className="budget-chart-legend-budget size-2 rounded-full" /> {budgetLabel}
						</span>
						<span className="budget-chart-legend-item inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1">
							<i className="budget-chart-legend-expenses size-2 rounded-full" /> {expenseLabel}
						</span>
						<span className="budget-chart-legend-item inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1">
							<i className="budget-chart-legend-remaining size-2 rounded-full" /> {remainingLabel}
						</span>
					</div>
					<ChartContainer className="aspect-auto h-[20rem] min-h-0 sm:h-[22rem]">
						<BarChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }} barGap={3} barCategoryGap="16%">
							<CartesianGrid vertical={false} stroke="var(--budget-chart-grid)" strokeDasharray="4 5" />
							<XAxis
								dataKey="key"
								tickLine={false}
								axisLine={false}
								tickMargin={10}
								tick={{ fill: "var(--budget-chart-axis)", fontSize: 11 }}
								tickFormatter={(key: string) => monthLabel(key, { month: "short" })}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={6}
								width={52}
								tick={{ fill: "var(--budget-chart-axis)", fontSize: 11 }}
								tickFormatter={(value: number) => {
									const prefix = value < 0 ? "-" : "";
									return `${prefix}₱${new Intl.NumberFormat("en", { notation: "compact" }).format(Math.abs(value) / 100)}`;
								}}
							/>
							<Tooltip
								cursor={{ fill: "var(--budget-chart-cursor)" }}
								labelFormatter={(key) => viewMode === "cutoff" ? `${monthLabel(String(key))} (${cutoffLabel})` : monthLabel(String(key))}
								formatter={(value, name) => {
									const val = Number(value);
									const label = name === "Budget" || name === budgetLabel
										? "Budget"
										: name === "Expenses" || name === expenseLabel
											? "Expenses"
											: "Remaining balance";
									return [money.format(val / 100), label];
								}}
								contentStyle={{
									borderRadius: "1rem",
									borderColor: "var(--budget-chart-tooltip-border)",
									backgroundColor: "var(--budget-chart-tooltip-bg)",
									color: "var(--card-foreground)",
									boxShadow: "0 12px 28px rgb(15 23 42 / 0.18)",
								}}
							/>
							<Bar dataKey="budget" name={budgetLabel} fill="var(--page-accent-base)" radius={[6, 6, 0, 0]} maxBarSize={18} />
							<Bar dataKey="expenses" name={expenseLabel} fill="var(--budget-chart-expenses)" radius={[6, 6, 0, 0]} maxBarSize={18} />
							<Bar dataKey="remaining" name={remainingLabel} fill="var(--budget-chart-remaining)" radius={[6, 6, 0, 0]} maxBarSize={18} />
						</BarChart>
					</ChartContainer>
				</div>
			</CardContent>
		</Card>
	);
}
