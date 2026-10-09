"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, DollarSign, Loader2, Plus, Receipt, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { createBudgetBill, deleteBudgetBill, getBudgetData, saveMonthlyBudget } from "@/features/budget/actions/budget-actions";
import type { BudgetBill, MonthlyBudget } from "@/features/budget/types";

const money = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

function monthKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(key: string, offset: number) {
	const [year, month] = key.split("-").map(Number);
	return monthKey(new Date(year, month - 1 + offset, 1));
}

function monthLabel(key: string, options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }) {
	return new Intl.DateTimeFormat("en-US", options).format(new Date(`${key}-01T00:00:00`));
}

function centsFromInput(value: string) {
	const amount = Number(value);
	return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

function billsForMonth(bills: BudgetBill[], key: string) {
	return bills.filter((bill) => bill.frequency === "recurring" || bill.monthKey === key);
}

export function BudgetPlanner() {
	const currentKey = monthKey(new Date());
	const [selectedMonth, setSelectedMonth] = useState(currentKey);
	const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
	const [bills, setBills] = useState<BudgetBill[]>([]);
	const [budgetInput, setBudgetInput] = useState("");
	const [billTitle, setBillTitle] = useState("");
	const [billAmount, setBillAmount] = useState("");
	const [billFrequency, setBillFrequency] = useState<"recurring" | "one-time">("recurring");
	const [billMonth, setBillMonth] = useState(currentKey);
	const [billDueDay, setBillDueDay] = useState("");
	const [ready, setReady] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const budget = budgets.find((item) => item.monthKey === selectedMonth);
	const monthBills = billsForMonth(bills, selectedMonth);
	const expenses = monthBills.reduce((total, bill) => total + bill.amountCents, 0);
	const remaining = (budget?.amountCents ?? 0) - expenses;

	const chart = useMemo(() => {
		const selected = new Date(`${selectedMonth}-01T00:00:00`);
		return Array.from({ length: 6 }, (_, index) => {
			const date = new Date(selected.getFullYear(), selected.getMonth() - 5 + index, 1);
			const key = monthKey(date);
			const monthBudget = budgets.find((item) => item.monthKey === key)?.amountCents ?? 0;
			const monthExpenses = billsForMonth(bills, key).reduce((total, bill) => total + bill.amountCents, 0);
			return { key, budget: monthBudget, expenses: monthExpenses };
		});
	}, [bills, budgets, selectedMonth]);

	async function load() {
		try {
			const data = await getBudgetData();
			setBudgets(data.budgets);
			setBills(data.bills);
			const selectedBudget = data.budgets.find((item) => item.monthKey === selectedMonth);
			setBudgetInput(selectedBudget ? (selectedBudget.amountCents / 100).toFixed(2) : "");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not load budget data.");
		} finally {
			setReady(true);
		}
	}

	useEffect(() => {
		let active = true;
		getBudgetData()
			.then((data) => {
				if (!active) return;
				setBudgets(data.budgets);
				setBills(data.bills);
				const selectedBudget = data.budgets.find((item) => item.monthKey === selectedMonth);
				setBudgetInput(selectedBudget ? (selectedBudget.amountCents / 100).toFixed(2) : "");
			})
			.catch((cause: unknown) => {
				if (active) setError(cause instanceof Error ? cause.message : "Could not load budget data.");
			})
			.finally(() => {
				if (active) setReady(true);
			});
		return () => { active = false; };
	}, [selectedMonth]);

	function selectMonth(value: string) {
		setSelectedMonth(value);
		const selectedBudget = budgets.find((item) => item.monthKey === value);
		setBudgetInput(selectedBudget ? (selectedBudget.amountCents / 100).toFixed(2) : "");
	}

	async function submitBudget(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const amount = centsFromInput(budgetInput);
		if (amount === null) {
			setError("Enter a valid monthly budget.");
			return;
		}
		setSubmitting(true);
		try {
			await saveMonthlyBudget(selectedMonth, amount);
			await load();
			setError("");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not save monthly budget.");
		} finally {
			setSubmitting(false);
		}
	}

	async function submitBill(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const amount = centsFromInput(billAmount);
		if (amount === null || !billTitle.trim()) {
			setError("Enter a bill name and a valid amount.");
			return;
		}
		setSubmitting(true);
		try {
			await createBudgetBill({
				title: billTitle,
				amountCents: amount,
				frequency: billFrequency,
				monthKey: billFrequency === "one-time" ? billMonth : null,
				dueDay: billDueDay ? Number(billDueDay) : null,
			});
			setBillTitle("");
			setBillAmount("");
			setBillDueDay("");
			await load();
			setError("");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not add bill.");
		} finally {
			setSubmitting(false);
		}
	}

	async function removeBill(id: string) {
		setSubmitting(true);
		try {
			await deleteBudgetBill(id);
			await load();
			setError("");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not delete bill.");
		} finally {
			setSubmitting(false);
		}
	}

	return <>
		{error && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}
		{!ready && <LoadingIndicator />}
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div><p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-rose-700"><span className="grid size-6 place-items-center rounded-md bg-rose-100"><Wallet size={14} /></span> PLAN YOUR MONTH</p><h1 className="bg-linear-to-r from-slate-900 via-rose-950 to-orange-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">Budget planner</h1><p className="mt-1 text-sm text-slate-500">Know what is left after the bills are covered.</p></div>
			<div className="flex items-center gap-1 rounded-2xl border border-rose-100 bg-white p-1.5 shadow-md shadow-rose-100/60 ring-1 ring-white">
				<Button type="button" variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => selectMonth(shiftMonth(selectedMonth, -1))} className="rounded-xl text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"><ChevronLeft size={18} /></Button>
				<label className="flex min-w-0 items-center gap-2 rounded-xl px-2"><CalendarDays size={17} className="shrink-0 text-rose-600" /><span className="sr-only">Selected month</span><Input type="month" value={selectedMonth} onChange={(event) => selectMonth(event.target.value)} className="h-9 w-36 cursor-pointer border-0 bg-transparent px-0 text-sm font-semibold text-slate-800 shadow-none focus-visible:ring-0" /></label>
				<Button type="button" variant="ghost" size="icon-sm" aria-label="Next month" onClick={() => selectMonth(shiftMonth(selectedMonth, 1))} className="rounded-xl text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"><ChevronRight size={18} /></Button>
			</div>
		</div>
		<div className="grid gap-4 sm:grid-cols-3">
			<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-sky-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-sky-50 hover:shadow-xl hover:shadow-sky-200/70">
				<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-sky-100/70 blur-2xl transition-all duration-300 group-hover:bg-sky-200/80" />
				<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-blue-200 transition-transform duration-200 group-hover:scale-105"><Wallet size={20} /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-500">Monthly budget</p><p className="text-2xl font-bold tracking-tight text-slate-800">{money.format((budget?.amountCents ?? 0) / 100)}</p><p className="text-xs text-slate-400">{monthLabel(selectedMonth)}</p></div><span className="ml-auto flex h-8 items-end gap-1 opacity-70">{[12, 20, 15, 25, 18, 30].map((height, index) => <i key={index} className="w-1.5 rounded-t-full bg-sky-200" style={{ height }} />)}</span></CardContent>
			</Card>
			<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-rose-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-rose-50 hover:shadow-xl hover:shadow-rose-200/70">
				<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-rose-100/60 blur-2xl transition-all duration-300 group-hover:bg-rose-200/70" />
				<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200 transition-transform duration-200 group-hover:scale-105"><Receipt size={20} /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-500">Scheduled bills</p><p className="text-2xl font-bold tracking-tight text-slate-800">{money.format(expenses / 100)}</p><p className="text-xs text-slate-400">{monthBills.length} bill{monthBills.length === 1 ? "" : "s"}</p></div><div className="ml-auto flex flex-col items-end gap-1"><div className="h-1.5 w-12 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-linear-to-r from-rose-400 to-orange-500" style={{ width: `${budget?.amountCents ? Math.min(100, expenses / budget.amountCents * 100) : 0}%` }} /></div><span className="text-[9px] font-medium uppercase tracking-wider text-rose-500">Bills</span></div></CardContent>
			</Card>
			<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-amber-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-amber-50 hover:shadow-xl hover:shadow-amber-200/70">
				<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-amber-100/60 blur-2xl transition-all duration-300 group-hover:bg-amber-200/70" />
				<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200 transition-transform duration-200 group-hover:scale-105"><DollarSign size={20} /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-500">Remaining</p><p className={`text-2xl font-bold tracking-tight ${remaining < 0 ? "text-rose-700" : "text-slate-800"}`}>{money.format(remaining / 100)}</p><p className="text-xs text-slate-400">Budget less scheduled bills</p></div><span className="ml-auto flex items-center gap-1.5"><i className="size-2 rounded-full bg-rose-400" /><i className="size-2 rounded-full bg-sky-400" /><i className="size-2 rounded-full bg-amber-400" /><i className="size-2 rounded-full bg-orange-400" /></span></CardContent>
			</Card>
		</div>
		<div className="grid items-start gap-5 lg:grid-cols-2">
			<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0"><CardHeader className="gap-4 border-b border-rose-900/10 bg-linear-to-r from-rose-800 via-rose-700 to-orange-700 p-5 text-white"><CardTitle className="text-white">Set monthly budget</CardTitle><p className="mt-1 text-xs text-rose-100/85">Save a separate budget for each month.</p></CardHeader><CardContent className="p-5 pt-0"><form onSubmit={submitBudget} className="flex flex-wrap items-end gap-3"><label className="min-w-48 flex-1 space-y-2 text-sm font-medium text-slate-900">Amount<Input required min="0" step="0.01" type="number" value={budgetInput} onChange={(event) => setBudgetInput(event.target.value)} placeholder="e.g. 2500.00" className="h-10 border-rose-200 text-slate-900" /></label><Button type="submit" disabled={submitting} className="h-10 bg-rose-700 text-white hover:bg-rose-800">{submitting && <Loader2 size={16} className="animate-spin" />} Save budget</Button></form></CardContent></Card>
			<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0"><CardHeader className="gap-4 border-b border-rose-900/10 bg-linear-to-r from-rose-800 via-rose-700 to-orange-700 p-5 text-white"><CardTitle className="text-white">Add a bill</CardTitle><p className="mt-1 text-xs text-rose-100/85">Recurring bills apply to every month.</p></CardHeader><CardContent className="p-5 pt-0"><form onSubmit={submitBill} className="grid gap-3 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium text-slate-900">Bill name<Input required value={billTitle} onChange={(event) => setBillTitle(event.target.value)} placeholder="e.g. Rent" className="h-10 border-rose-200 text-slate-900" /></label><label className="space-y-2 text-sm font-medium text-slate-900">Amount<Input required min="0" step="0.01" type="number" value={billAmount} onChange={(event) => setBillAmount(event.target.value)} placeholder="e.g. 900.00" className="h-10 border-rose-200 text-slate-900" /></label><label className="space-y-2 text-sm font-medium text-slate-900">Bill type<select value={billFrequency} onChange={(event) => setBillFrequency(event.target.value as "recurring" | "one-time")} className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900"><option value="recurring">Recurring monthly</option><option value="one-time">One-time</option></select></label><label className="space-y-2 text-sm font-medium text-slate-900">Due day (optional)<Input min="1" max="31" type="number" value={billDueDay} onChange={(event) => setBillDueDay(event.target.value)} placeholder="e.g. 15" className="h-10 border-rose-200 text-slate-900" /></label>{billFrequency === "one-time" && <label className="space-y-2 text-sm font-medium text-slate-900 sm:col-span-2">Month<Input required type="month" value={billMonth} onChange={(event) => setBillMonth(event.target.value)} className="h-10 border-rose-200 text-slate-900" /></label>}<Button type="submit" disabled={submitting} className="h-10 bg-rose-700 text-white hover:bg-rose-800 sm:col-span-2"><Plus size={16} /> Add bill</Button></form></CardContent></Card>
		</div>
		<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0"><CardHeader className="gap-4 border-b border-rose-900/10 bg-linear-to-r from-rose-800 via-rose-700 to-orange-700 p-5 text-white"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl border border-white/20 bg-white/10 text-white"><BarChart3 size={19} /></span><div><CardTitle className="text-white">Expense comparison</CardTitle><p className="mt-1 text-xs text-rose-100/85">Scheduled bills compared across the last six months.</p></div></div></CardHeader><CardContent className="space-y-4 p-5 pt-0"><ChartContainer className="min-h-[260px]"><LineChart data={chart} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(key: string) => monthLabel(key, { month: "short" })} /><YAxis tickLine={false} axisLine={false} tickMargin={8} width={72} tickFormatter={(value: number) => money.format(value / 100)} /><Tooltip cursor={{ stroke: "#e2e8f0", strokeDasharray: "4 4" }} labelFormatter={(key) => monthLabel(String(key))} formatter={(value, name) => [money.format(Number(value) / 100), name === "budget" ? "Budget" : "Expenses"]} contentStyle={{ borderRadius: "0.75rem", borderColor: "#e2e8f0", boxShadow: "0 8px 24px rgb(15 23 42 / 0.1)" }} /><Line type="monotone" dataKey="budget" name="Budget" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }} activeDot={{ r: 5 }} /><Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }} activeDot={{ r: 5 }} /></LineChart></ChartContainer><div className="flex gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-sky-500" /> Budget</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-rose-500" /> Expenses</span></div></CardContent></Card>
		<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0"><CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-rose-900/10 bg-linear-to-r from-rose-800 via-rose-700 to-orange-700 p-5 text-white"><div><CardTitle className="text-white">Bills for {monthLabel(selectedMonth)}</CardTitle><p className="mt-1 text-xs text-rose-100/85">Recurring and one-time bills included in the total.</p></div><span className="grid size-10 place-items-center rounded-xl border border-white/20 bg-white/10 text-white"><Receipt size={19} /></span></CardHeader><CardContent className="p-5 pt-0">{monthBills.length ? <div className="divide-y divide-slate-100">{monthBills.map((bill) => <div key={bill.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="grid size-9 place-items-center rounded-lg bg-rose-50 text-rose-700"><DollarSign size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{bill.title}</p><p className="text-xs text-slate-500">{bill.frequency === "recurring" ? "Recurring monthly" : `One-time · ${bill.monthKey}`} {bill.dueDay ? `· due day ${bill.dueDay}` : ""}</p></div><span className="text-sm font-semibold text-slate-800">{money.format(bill.amountCents / 100)}</span><Button type="button" disabled={submitting} variant="ghost" size="icon-sm" className="text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${bill.title}`} onClick={() => void removeBill(bill.id)}><Trash2 size={16} /></Button></div>)}</div> : <div className="py-8 text-center text-sm text-slate-500">No bills scheduled for this month.</div>}</CardContent></Card>
	</>;
}
