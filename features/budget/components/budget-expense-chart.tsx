import { useMemo, useState } from "react";
import { BarChart3, Check, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { billsForMonth, monthLabel, money, type ExpensePoint } from "@/features/budget/lib/budget-utils";
import type { BudgetBill } from "@/features/budget/types";
import { FeatureSectionHeader } from "@/components/feature-section-header";

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
		<FeatureSectionHeader
			theme="rose"
			icon={BarChart3}
			title="Expense comparison"
			description={`${compareByDueDay ? `Bills due on the ${dueDayLabel}` : "Scheduled bills"} compared across the last six months.`}
		>
			<div className="flex w-full flex-col gap-2 rounded-2xl border-2 border-white/75 bg-rose-950/15 p-2 text-white shadow-lg shadow-rose-950/25 ring-1 ring-inset ring-white/20 backdrop-blur-md sm:w-auto sm:flex-row sm:items-center sm:gap-3">
				<label className="group flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-within:bg-white/10">
					<input type="checkbox" checked={compareByDueDay} onChange={(event) => setCompareByDueDay(event.target.checked)} className="peer sr-only" />
					<span className="grid size-4 shrink-0 place-items-center rounded border border-white/70 bg-white/5 text-transparent transition peer-checked:border-white peer-checked:bg-white peer-checked:text-rose-700 peer-focus-visible:ring-2 peer-focus-visible:ring-white peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-rose-800"><Check size={12} strokeWidth={3} /></span>
					<span className="flex items-center gap-1.5"><SlidersHorizontal size={14} className="text-white/90" aria-hidden="true" />Compare month due date</span>
				</label>
				{compareByDueDay && <fieldset className="flex flex-wrap items-center gap-1.5 border-t border-white/40 pt-2 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
					<legend className="sr-only">Due day to compare</legend>
					<span className="mr-1 text-xs font-medium text-rose-50/80">Due:</span>
					{dueDayOptions.map((option) => <label key={option.value} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors focus-within:ring-2 focus-within:ring-white/70 ${dueDay === option.value ? "border-white/65 bg-white/15 text-white shadow-inner shadow-white/5" : "border-transparent text-rose-50/80 hover:bg-white/10 hover:text-white"}`}>
						<input type="radio" name="budget-expense-due-day" value={option.value} checked={dueDay === option.value} onChange={(event) => {
							if (isDueDay(event.target.value)) setDueDay(event.target.value);
						}} className="peer sr-only" />
						<span className={`grid size-3.5 place-items-center rounded-full border transition-colors ${dueDay === option.value ? "border-white bg-white" : "border-white/60 bg-transparent"}`}><span className={`size-1.5 rounded-full ${dueDay === option.value ? "bg-rose-700" : "bg-transparent"}`} /></span>
						{option.label}
					</label>)}
				</fieldset>}
			</div>
		</FeatureSectionHeader>
		<CardContent className="space-y-4 rounded-2xl border border-rose-100 bg-white p-4 shadow-lg shadow-slate-300/30 sm:p-5">
			<ChartContainer className="min-h-[260px]">
				<LineChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
					<CartesianGrid vertical={false} />
					<XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(key: string) => monthLabel(key, { month: "short" })} />
					<YAxis tickLine={false} axisLine={false} tickMargin={8} width={72} tickFormatter={(value: number) => money.format(value / 100)} />
					<Tooltip
						cursor={{ stroke: "#e2e8f0", strokeDasharray: "4 4" }}
						labelFormatter={(key) => monthLabel(String(key))}
						formatter={(value, name) => [money.format(Number(value) / 100), name === "Budget" ? "Budget" : expenseLabel]}
						contentStyle={{ borderRadius: "0.75rem", borderColor: "#e2e8f0", boxShadow: "0 8px 24px rgb(15 23 42 / 0.1)" }}
					/>
					<Line type="monotone" dataKey="budget" name="Budget" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }} activeDot={{ r: 5 }} />
					<Line type="monotone" dataKey="expenses" name={expenseLabel} stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }} activeDot={{ r: 5 }} />
				</LineChart>
			</ChartContainer>
			<div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 shadow-sm">
				<span className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 shadow-sm">
					<i className="size-2.5 rounded-full bg-sky-600 ring-4 ring-sky-100" /> Budget
				</span>
				<span className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 shadow-sm">
					<i className="size-2.5 rounded-full bg-rose-600 ring-4 ring-rose-100" /> {expenseLabel}
				</span>
			</div>
		</CardContent>
	</Card>;
}
