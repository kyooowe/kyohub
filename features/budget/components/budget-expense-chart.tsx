import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, ChevronDown, ChevronUp, Grid2X2, SlidersHorizontal } from "lucide-react";
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
		<FeatureSectionHeader theme="rose" icon={BarChart3} title="Expense comparison" description={`${compareByDueDay ? `Bills due on the ${dueDayLabel}` : "Scheduled bills"} compared across the last nine months.`}>
			<div className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-white/20 bg-linear-to-r from-rose-600 to-orange-600 p-2 text-white shadow-sm shadow-rose-950/10 sm:w-auto">
				<fieldset className="flex shrink-0 items-center gap-1 rounded-xl bg-white/10 p-1">
					<legend className="sr-only">Date filter mode</legend>
					{(["All", "Custom"] as const).map((option) => {
						const custom = option === "Custom";
						const active = custom ? compareByDueDay : !compareByDueDay;
						const ModeIcon = custom ? SlidersHorizontal : Grid2X2;
						const ChevronIcon = compareByDueDay ? ChevronUp : ChevronDown;
						return <label key={option} className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors focus-within:ring-2 focus-within:ring-white/60 ${active ? "bg-white/20 text-white shadow-sm ring-1 ring-inset ring-white/25" : "text-white/85 hover:bg-white/10 hover:text-white"}`}>
							<input type="radio" name="budget-date-filter-mode" checked={active} onChange={() => setCompareByDueDay(custom)} className="sr-only" />
							<ModeIcon size={15} />
							{option}
							{custom && <ChevronIcon size={13} className="transition-transform" />}
						</label>;
					})}
				</fieldset>
				{compareByDueDay && <>
					<span aria-hidden="true" className="h-8 w-px shrink-0 bg-white/30" />
					<fieldset className="flex flex-wrap items-center gap-2">
						<legend className="sr-only">Due day to compare</legend>
						<span aria-hidden="true" className="mr-0.5 flex items-center gap-1.5 text-xs font-medium text-white/90"><CalendarDays size={14} />Due date:</span>
						{dueDayOptions.map((option) => <label key={option.value} className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-within:ring-2 focus-within:ring-white/60 ${dueDay === option.value ? "border-white/35 bg-white/20 text-white shadow-sm" : "border-white/15 bg-white/5 text-white/85 hover:border-white/25 hover:bg-white/10 hover:text-white"}`}>
						<input type="radio" name="budget-expense-due-day" value={option.value} checked={dueDay === option.value} onChange={(event) => {
							if (isDueDay(event.target.value)) setDueDay(event.target.value);
						}} className="peer sr-only" />
						{option.label}
					</label>)}
					</fieldset>
				</>}
			</div>
		</FeatureSectionHeader>
		<CardContent className="mx-3 mb-1 rounded-2xl border border-rose-100 bg-white p-4 shadow-lg shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:mx-4 sm:mb-1 sm:p-5">
			<div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/50">
				<div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
					<span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-sky-500" /> Budget</span>
					<span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-rose-500" /> {expenseLabel}</span>
				</div>
				<ChartContainer className="aspect-auto h-96 min-h-0">
					<BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={3} barCategoryGap="28%">
						<CartesianGrid vertical={false} />
						<XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={6} tickFormatter={(key: string) => monthLabel(key, { month: "short" })} />
						<YAxis tickLine={false} axisLine={false} tickMargin={4} width={44} tickFormatter={(value: number) => `₱${new Intl.NumberFormat("en", { notation: "compact" }).format(value / 100)}`} />
						<Tooltip
							cursor={{ fill: "rgb(148 163 184 / 0.12)" }}
							labelFormatter={(key) => monthLabel(String(key))}
							formatter={(value, name) => [money.format(Number(value) / 100), name === "Budget" ? "Budget" : expenseLabel]}
							contentStyle={{ borderRadius: "0.75rem", borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--card-foreground)", boxShadow: "0 8px 24px rgb(0 0 0 / 0.35)" }}
						/>
						<Bar dataKey="budget" name="Budget" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={22} />
						<Bar dataKey="expenses" name={expenseLabel} fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={22} />
					</BarChart>
				</ChartContainer>
			</div>
		</CardContent>
	</Card>;
}
