"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { createBudgetBill, deleteBudgetBill, getBudgetData, saveMonthlyBudget, setBudgetBillPaid, updateBudgetBill } from "@/features/budget/actions/budget-actions";
import { BudgetBillList } from "@/features/budget/components/budget-bill-list";
import { BudgetExpenseChart } from "@/features/budget/components/budget-expense-chart";
import { BudgetForms } from "@/features/budget/components/budget-forms";
import { BudgetHeader } from "@/features/budget/components/budget-header";
import { BudgetSummary } from "@/features/budget/components/budget-summary";
import { billOccurrencesForMonth, billOccurrencesInWindow, billsForMonth, billWindowLabel, centsFromInput, formatAmountInput, isBillOccurrenceOverdue, monthKey, type ExpensePoint } from "@/features/budget/lib/budget-utils";
import type { BudgetBill, BillFrequency, MonthlyBudget } from "@/features/budget/types";

export function BudgetPlanner() {
	const currentKey = monthKey(new Date());
	const billWindowStart = new Date();
	billWindowStart.setHours(0, 0, 0, 0);
	billWindowStart.setDate(billWindowStart.getDate() - 4);
	const billWindowEnd = new Date(billWindowStart);
	billWindowEnd.setDate(billWindowEnd.getDate() + 9);
	const [selectedMonth, setSelectedMonth] = useState(currentKey);
	const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
	const [bills, setBills] = useState<BudgetBill[]>([]);
	const [budgetInput, setBudgetInput] = useState("");
	const [billTitle, setBillTitle] = useState("");
	const [billAmount, setBillAmount] = useState("");
	const [billDueDay, setBillDueDay] = useState("");
	const [billFrequency, setBillFrequency] = useState<BillFrequency>("recurring");
	const [editingBillId, setEditingBillId] = useState<string | null>(null);
	const billFormRef = useRef<HTMLFormElement>(null);
	const [ready, setReady] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const budget = budgets.find((item) => item.monthKey === selectedMonth);
	const monthBills = billsForMonth(bills, selectedMonth);
	const monthBillOccurrences = billOccurrencesForMonth(bills, selectedMonth);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const billOccurrences = billOccurrencesInWindow(bills, billWindowStart, billWindowEnd);
	const paidBillCount = billOccurrences.filter(({ bill, monthKey: occurrenceMonth }) => bill.paidMonthKeys.includes(occurrenceMonth)).length;
	const unpaidBillCount = billOccurrences.length - paidBillCount;
	const overdueMonthBills = monthBillOccurrences.filter(({ bill, monthKey: occurrenceMonth }) =>
		!bill.paidMonthKeys.includes(occurrenceMonth) && isBillOccurrenceOverdue(bill, occurrenceMonth, today),
	);
	const overdueMonthTotal = overdueMonthBills.reduce((total, { bill }) => total + bill.amountCents, 0);
	const expenses = monthBills.reduce((total, bill) => total + bill.amountCents, 0);
	const remaining = (budget?.amountCents ?? 0) - expenses;

	const chart = useMemo<ExpensePoint[]>(() => {
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
			setBudgetInput(selectedBudget ? formatAmountInput((selectedBudget.amountCents / 100).toFixed(2)) : "");
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
				setBudgetInput(selectedBudget ? formatAmountInput((selectedBudget.amountCents / 100).toFixed(2)) : "");
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
		setBudgetInput(selectedBudget ? formatAmountInput((selectedBudget.amountCents / 100).toFixed(2)) : "");
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

	function resetBillForm() {
		setEditingBillId(null);
		setBillTitle("");
		setBillAmount("");
		setBillDueDay("");
		setBillFrequency("recurring");
		setError("");
	}

	function editBill(bill: BudgetBill) {
		setEditingBillId(bill.id);
		setBillTitle(bill.title);
		setBillAmount(formatAmountInput((bill.amountCents / 100).toFixed(2)));
		setBillDueDay(bill.dueDay?.toString() ?? "");
		setBillFrequency(bill.frequency);
		setError("");
		billFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
	}

	async function submitBill(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const amount = centsFromInput(billAmount);
		if (amount === null || !billTitle.trim()) {
			setError("Enter a bill name and a valid amount.");
			return;
		}
		const title = billTitle.trim();
		const duplicate = bills.some((bill) =>
			bill.id !== editingBillId && bill.title.trim().toLowerCase() === title.toLowerCase(),
		);
		if (duplicate) {
			toast.error("A bill with this name already exists.");
			return;
		}
		const billBeingEdited = bills.find((bill) => bill.id === editingBillId);
		setSubmitting(true);
		try {
			const billData = {
				title,
				amountCents: amount,
				frequency: billFrequency,
				monthKey: billFrequency === "one-time"
					? billBeingEdited?.frequency === "one-time" ? billBeingEdited.monthKey : selectedMonth
					: null,
				dueDay: Number(billDueDay),
			};
			if (editingBillId) {
				await updateBudgetBill(editingBillId, billData);
			} else {
				await createBudgetBill(billData);
			}
			resetBillForm();
			await load();
			setError("");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : `Could not ${editingBillId ? "update" : "add"} bill.`);
		} finally {
			setSubmitting(false);
		}
	}

	async function removeBill(id: string) {
		setSubmitting(true);
		try {
			await deleteBudgetBill(id);
			if (editingBillId === id) resetBillForm();
			await load();
			setError("");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not delete bill.");
		} finally {
			setSubmitting(false);
		}
	}

	async function updateBillPayment(bill: BudgetBill, paymentMonth: string, paid: boolean) {
		if (submitting) return;
		setSubmitting(true);
		try {
			await setBudgetBillPaid(bill.id, paymentMonth, paid);
			setBills((current) => current.map((item) => item.id !== bill.id ? item : {
				...item,
				paidMonthKeys: paid
					? Array.from(new Set([...item.paidMonthKeys, paymentMonth]))
					: item.paidMonthKeys.filter((month) => month !== paymentMonth),
			}));
			setError("");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not update bill payment status.");
		} finally {
			setSubmitting(false);
		}
	}

	return <>
		{error && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}
		{!ready && <LoadingIndicator />}
		<BudgetHeader selectedMonth={selectedMonth} onSelectMonth={selectMonth} />
		<BudgetSummary
			selectedMonth={selectedMonth}
			budgetCents={budget?.amountCents ?? 0}
			billCount={billOccurrences.length}
			paidBillCount={paidBillCount}
			unpaidBillCount={unpaidBillCount}
			billWindowLabel={billWindowLabel(billWindowStart, billWindowEnd)}
			overdueBillCount={overdueMonthBills.length}
			overdueTotalCents={overdueMonthTotal}
			remainingCents={remaining}
		/>
		<BudgetForms
			budgetInput={budgetInput}
			onBudgetInputChange={setBudgetInput}
			onSubmitBudget={submitBudget}
			billTitle={billTitle}
			onBillTitleChange={setBillTitle}
			billAmount={billAmount}
			onBillAmountChange={setBillAmount}
			billDueDay={billDueDay}
			onBillDueDayChange={setBillDueDay}
			billFrequency={billFrequency}
			onBillFrequencyChange={setBillFrequency}
			editingBill={Boolean(editingBillId)}
			submitting={submitting}
			billFormRef={billFormRef}
			onSubmitBill={submitBill}
			onCancelBill={resetBillForm}
		/>
		<BudgetBillList
			selectedMonth={selectedMonth}
			occurrences={monthBillOccurrences}
			today={today}
			submitting={submitting}
			onEdit={editBill}
			onPaymentChange={(bill, paymentMonth, paid) => void updateBillPayment(bill, paymentMonth, paid)}
			onDelete={(id) => void removeBill(id)}
		/>
		<BudgetExpenseChart data={chart} bills={bills} />
	</>;
}
