import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, ChevronDown, Grid2X2, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { billsForMonth, monthLabel, money, type ExpensePoint } from "@/features/budget/lib/budget-utils";
import type { BudgetBill } from "@/features/budget/types";

const dueDayOptions = [
	{ value: "5", label: "5th" },
	{ value: "15", label: "15th" },
	{ value: "20", label: "20th" },
	{ value: "30", label: "30th" },
] as const;

type DueDay = typeof dueDayOptions[number]["value"];

function isDueDay(value: string): value is DueDay {
	return dueDayOptions.some((option) => option.value === value);
}

export function BudgetExpenseChart({ data, bills }: { data: ExpensePoint[]; bills: BudgetBill[] }) {
	const [compareByDueDay, setCompareByDueDay] = useState(false);
	const [dueDay, setDueDay] = useState<DueDay>("5");
	const chartData = useMemo(() => {
		if (!compareByDueDay) return data;
		return data.map((point) => ({
			...point,
			expenses: billsForMonth(bills, point.key)
				.filter((bill) => String(bill.dueDay) === dueDay)
				.reduce((total, bill) => total + bill.amountCents, 0),
		}));
	}, [bills, compareByDueDay, data, dueDay]);
	const dueDayLabel = dueDayOptions.find((option) => option.value === dueDay)?.label;
	const expenseLabel = compareByDueDay ? `Expenses due day ${dueDay}` : "Expenses";

	return <Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
		<FeatureSectionHeader theme="rose" icon={BarChart3} title="Expense comparison" description={`${compareByDueDay ? `Bills due on the ${dueDayLabel}` : "Scheduled bills"} compared across the last nine months.`} appearance="soft" className="min-h-[104px]">
			<div className={`budget-chart-header-controls flex max-w-full flex-wrap items-center gap-2 rounded-2xl border p-2 ${compareByDueDay ? "w-full" : "w-fit"} sm:w-auto`}>
				<fieldset className="budget-chart-mode-group flex shrink-0 items-center gap-1 rounded-xl border p-1">
					<legend className="sr-only">Date filter mode</legend>
					{(["All", "Custom"] as const).map((option) => {
						const custom = option === "Custom";
						const active = custom ? compareByDueDay : !compareByDueDay;
						const ModeIcon = custom ? SlidersHorizontal : Grid2X2;
						return <label key={option} className={`budget-chart-mode-option inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-3 ${active ? "is-active" : ""}`}>
							<input type="radio" name="budget-date-filter-mode" checked={active} onChange={() => setCompareByDueDay(custom)} className="sr-only" />
							<ModeIcon size={14} />
							{option}
							{custom && <ChevronDown size={13} className={`transition-transform ${compareByDueDay ? "rotate-180" : ""}`} />}
						</label>;
					})}
				</fieldset>
				{compareByDueDay && <>
					<span aria-hidden="true" className="budget-chart-control-divider hidden h-7 w-px shrink-0 sm:block" />
					<fieldset className="flex flex-wrap items-center gap-1.5">
						<legend className="sr-only">Due day to compare</legend>
						<span aria-hidden="true" className="budget-chart-due-label flex items-center gap-1 text-[11px] font-medium"><CalendarDays size={13} />Due day</span>
						{dueDayOptions.map((option) => <label key={option.value} className={`budget-chart-due-option inline-flex h-8 cursor-pointer items-center rounded-full border px-2.5 text-xs font-semibold transition-colors ${dueDay === option.value ? "is-active" : ""}`}>
						<input type="radio" name="budget-expense-due-day" value={option.value} checked={dueDay === option.value} onChange={(event) => {
							if (isDueDay(event.target.value)) setDueDay(event.target.value);
						}} className="peer sr-only" />
						{option.label}
					</label>)}
					</fieldset>
				</>}
			</div>
		</FeatureSectionHeader>
		<CardContent data-page-palette-surface className="planner-day-panel budget-chart-panel mb-1 rounded-3xl border p-3 shadow-lg sm:mx-4 sm:mb-1 sm:p-4">
			<div className="budget-chart-surface rounded-2xl border p-3 sm:p-4">
				<div data-page-palette-preserve className="budget-chart-legend mb-3 flex flex-wrap items-center gap-2 text-xs font-medium">
					<span className="budget-chart-legend-item inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"><i className="budget-chart-legend-budget size-2 rounded-full" /> Budget</span>
					<span className="budget-chart-legend-item inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"><i className="budget-chart-legend-expenses size-2 rounded-full" /> {expenseLabel}</span>
				</div>
				<ChartContainer className="aspect-auto h-[20rem] min-h-0 sm:h-[22rem]">
					<BarChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }} barGap={4} barCategoryGap="24%">
						<CartesianGrid vertical={false} stroke="var(--budget-chart-grid)" strokeDasharray="4 5" />
						<XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "var(--budget-chart-axis)", fontSize: 11 }} tickFormatter={(key: string) => monthLabel(key, { month: "short" })} />
						<YAxis tickLine={false} axisLine={false} tickMargin={6} width={48} tick={{ fill: "var(--budget-chart-axis)", fontSize: 11 }} tickFormatter={(value: number) => `₱${new Intl.NumberFormat("en", { notation: "compact" }).format(value / 100)}`} />
						<Tooltip
							cursor={{ fill: "var(--budget-chart-cursor)" }}
							labelFormatter={(key) => monthLabel(String(key))}
							formatter={(value, name) => [money.format(Number(value) / 100), name === "Budget" ? "Budget" : expenseLabel]}
							contentStyle={{ borderRadius: "1rem", borderColor: "var(--budget-chart-tooltip-border)", backgroundColor: "var(--budget-chart-tooltip-bg)", color: "var(--card-foreground)", boxShadow: "0 12px 28px rgb(15 23 42 / 0.18)" }}
						/>
						<Bar dataKey="budget" name="Budget" fill="var(--page-accent-base)" radius={[7, 7, 0, 0]} maxBarSize={24} />
						<Bar dataKey="expenses" name={expenseLabel} fill="var(--budget-chart-expenses)" radius={[7, 7, 0, 0]} maxBarSize={24} />
					</BarChart>
				</ChartContainer>
			</div>
		</CardContent>
	</Card>;
}
