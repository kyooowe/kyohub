"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageCallout } from "@/components/page-callout";
import { useAppSettings } from "@/components/settings/settings-context";
import { createBudgetBill, deleteBudgetBill, getBudgetData, moveBudgetBill, saveCutoffBudgets, saveMonthlyBudget, setBudgetBillPaid, updateBudgetBill } from "@/features/budget/actions/budget-actions";
import { BudgetBillList } from "@/features/budget/components/budget-bill-list";
import { BudgetExpenseChart } from "@/features/budget/components/budget-expense-chart";
import { BudgetCutoffBreakdown } from "@/features/budget/components/budget-cutoff-breakdown";
import { BudgetForms } from "@/features/budget/components/budget-forms";
import { BudgetHeader } from "@/features/budget/components/budget-header";
import { BudgetSummary } from "@/features/budget/components/budget-summary";
import { activeCutoffDayForDate, billOccurrencesForMonth, billOccurrencesInWindow, billWindowForDate, billsForMonth, billWindowLabel, centsFromInput, formatAmountInput, getCutoffBudgetsForMonth, monthKey, monthLabel, overdueBillOccurrences, type ExpensePoint } from "@/features/budget/lib/budget-utils";
import type { BudgetBill, BillFrequency, BudgetCategory, CutoffDay, MonthlyBudget } from "@/features/budget/types";

export function BudgetPlanner({ initialData, initialError }: { initialData: { budgets: MonthlyBudget[]; bills: BudgetBill[] }; initialError: string }) {
	const { settings } = useAppSettings();
	const budgetMode = settings.budgetMode ?? "monthly";

	const currentKey = monthKey(new Date());
	const [selectedMonth, setSelectedMonth] = useState(currentKey);
	const [budgets, setBudgets] = useState<MonthlyBudget[]>(initialData.budgets);
	const [bills, setBills] = useState<BudgetBill[]>(initialData.bills);
	const [budgetInput, setBudgetInput] = useState(() => {
		const selectedBudget = initialData.budgets.find((item) => item.monthKey === currentKey);
		return selectedBudget ? formatAmountInput((selectedBudget.amountCents / 100).toFixed(2)) : "";
	});

	const initialCutoffs = getCutoffBudgetsForMonth(initialData.budgets, currentKey);
	const [cutoffInputs, setCutoffInputs] = useState<Record<CutoffDay, string>>(() => ({
		5: initialCutoffs[5] ? formatAmountInput((initialCutoffs[5] / 100).toFixed(2)) : "",
		15: initialCutoffs[15] ? formatAmountInput((initialCutoffs[15] / 100).toFixed(2)) : "",
		20: initialCutoffs[20] ? formatAmountInput((initialCutoffs[20] / 100).toFixed(2)) : "",
		30: initialCutoffs[30] ? formatAmountInput((initialCutoffs[30] / 100).toFixed(2)) : "",
	}));

	const [billTitle, setBillTitle] = useState("");
	const [billCategory, setBillCategory] = useState<BudgetCategory>("utility");
	const [billAmount, setBillAmount] = useState("");
	const [billDueDay, setBillDueDay] = useState("");
	const [billFrequency, setBillFrequency] = useState<BillFrequency>("recurring");
	const [editingBillId, setEditingBillId] = useState<string | null>(null);
	const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
	const [billDialogOpen, setBillDialogOpen] = useState(false);
	const billFormRef = useRef<HTMLFormElement>(null);
	const [submitting, setSubmitting] = useState(false);
	const [pendingPaymentKeys, setPendingPaymentKeys] = useState<string[]>([]);
	const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
	const [error, setError] = useState(initialError);

	const budget = budgets.find((item) => item.monthKey === selectedMonth);
	const monthBills = billsForMonth(bills, selectedMonth);
	const monthBillOccurrences = billOccurrencesForMonth(bills, selectedMonth);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const isCurrentMonth = selectedMonth === currentKey;
	const selectedDate = useMemo(() => {
		const [year, month] = selectedMonth.split("-").map(Number);
		if (isCurrentMonth) return new Date();
		const day = Math.min(new Date().getDate(), 28);
		return new Date(year, month - 1, day);
	}, [selectedMonth, isCurrentMonth]);

	const currentCutoffDay: CutoffDay = activeCutoffDayForDate(selectedDate);
	const { start: billWindowStart, end: billWindowEnd } = useMemo(
		() => billWindowForDate(selectedDate),
		[selectedDate],
	);

	const billOccurrences = billOccurrencesInWindow(bills, billWindowStart, billWindowEnd);
	const paidBillCount = billOccurrences.filter(({ bill, monthKey: occurrenceMonth }) => bill.paidMonthKeys.includes(occurrenceMonth)).length;
	const unpaidBillCount = billOccurrences.length - paidBillCount;
	const overdueBills = overdueBillOccurrences(bills, today);
	const expenses = monthBills.reduce((total, bill) => total + bill.amountCents, 0);
	const remaining = (budget?.amountCents ?? 0) - expenses;

	const cutoffBudgets = getCutoffBudgetsForMonth(budgets, selectedMonth);

	const cutoffBills: Record<CutoffDay, { totalCents: number; paidCents: number; billCount: number; paidCount: number }> = {
		5: { totalCents: 0, paidCents: 0, billCount: 0, paidCount: 0 },
		15: { totalCents: 0, paidCents: 0, billCount: 0, paidCount: 0 },
		20: { totalCents: 0, paidCents: 0, billCount: 0, paidCount: 0 },
		30: { totalCents: 0, paidCents: 0, billCount: 0, paidCount: 0 },
	};
	for (const { bill, monthKey: occurrenceMonth } of monthBillOccurrences) {
		const day = bill.dueDay ?? 30;
		const cutoff: CutoffDay = day <= 5 ? 5 : day <= 15 ? 15 : day <= 20 ? 20 : 30;
		const isPaid = bill.paidMonthKeys.includes(occurrenceMonth);
		cutoffBills[cutoff].totalCents += bill.amountCents;
		cutoffBills[cutoff].billCount += 1;
		if (isPaid) {
			cutoffBills[cutoff].paidCents += bill.amountCents;
			cutoffBills[cutoff].paidCount += 1;
		}
	}

	const activeCutoff: CutoffDay | null = isCurrentMonth ? currentCutoffDay : null;
	const currentCutoffBudget = cutoffBudgets[currentCutoffDay] ?? 0;
	const currentCutoffBills = cutoffBills[currentCutoffDay]?.totalCents ?? 0;
	const currentCutoffRemaining = currentCutoffBudget - currentCutoffBills;

	const summaryBudgetCents = budgetMode === "cutoff" ? currentCutoffBudget : (budget?.amountCents ?? 0);
	const summaryRemainingCents = budgetMode === "cutoff" ? currentCutoffRemaining : remaining;

	const chart = useMemo<ExpensePoint[]>(() => {
		const selected = new Date(`${selectedMonth}-01T00:00:00`);
		return Array.from({ length: 9 }, (_, index) => {
			const date = new Date(selected.getFullYear(), selected.getMonth() - 8 + index, 1);
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
			const currentCutoffs = getCutoffBudgetsForMonth(data.budgets, selectedMonth);
			setCutoffInputs({
				5: currentCutoffs[5] ? formatAmountInput((currentCutoffs[5] / 100).toFixed(2)) : "",
				15: currentCutoffs[15] ? formatAmountInput((currentCutoffs[15] / 100).toFixed(2)) : "",
				20: currentCutoffs[20] ? formatAmountInput((currentCutoffs[20] / 100).toFixed(2)) : "",
				30: currentCutoffs[30] ? formatAmountInput((currentCutoffs[30] / 100).toFixed(2)) : "",
			});
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not load budget data.");
		}
	}

	function selectMonth(value: string) {
		setSelectedMonth(value);
		const selectedBudget = budgets.find((item) => item.monthKey === value);
		setBudgetInput(selectedBudget ? formatAmountInput((selectedBudget.amountCents / 100).toFixed(2)) : "");
		const currentCutoffs = getCutoffBudgetsForMonth(budgets, value);
		setCutoffInputs({
			5: currentCutoffs[5] ? formatAmountInput((currentCutoffs[5] / 100).toFixed(2)) : "",
			15: currentCutoffs[15] ? formatAmountInput((currentCutoffs[15] / 100).toFixed(2)) : "",
			20: currentCutoffs[20] ? formatAmountInput((currentCutoffs[20] / 100).toFixed(2)) : "",
			30: currentCutoffs[30] ? formatAmountInput((currentCutoffs[30] / 100).toFixed(2)) : "",
		});
	}

	function handleCutoffInputChange(day: CutoffDay, value: string) {
		setCutoffInputs((prev) => ({ ...prev, [day]: value }));
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
			setBudgetDialogOpen(false);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not save monthly budget.");
		} finally {
			setSubmitting(false);
		}
	}

	async function submitCutoffBudget(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const parsed: Record<CutoffDay, number> = {
			5: centsFromInput(cutoffInputs[5]) ?? 0,
			15: centsFromInput(cutoffInputs[15]) ?? 0,
			20: centsFromInput(cutoffInputs[20]) ?? 0,
			30: centsFromInput(cutoffInputs[30]) ?? 0,
		};
		setSubmitting(true);
		try {
			await saveCutoffBudgets(selectedMonth, parsed);
			await load();
			setError("");
			setBudgetDialogOpen(false);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not save cutoff budgets.");
		} finally {
			setSubmitting(false);
		}
	}

	function resetBillForm() {
		setEditingBillId(null);
		setBillTitle("");
		setBillCategory("utility");
		setBillAmount("");
		setBillDueDay("");
		setBillFrequency("recurring");
		setError("");
	}

	function editBill(bill: BudgetBill) {
		setEditingBillId(bill.id);
		setBillTitle(bill.title);
		setBillCategory(bill.category);
		setBillAmount(formatAmountInput((bill.amountCents / 100).toFixed(2)));
		setBillDueDay(bill.dueDay?.toString() ?? "");
		setBillFrequency(bill.frequency);
		setError("");
		setBillDialogOpen(true);
	}

	async function submitBill(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const amount = centsFromInput(billAmount);
		if (amount === null || !billTitle.trim()) {
			setError("Enter a bill name and a valid amount.");
			return;
		}
		const title = billTitle.trim();
		const isDaily = billCategory === "daily-expense";
		const currentActiveCutoff = activeCutoffDayForDate(new Date());
		const duplicate = !isDaily && bills.some((bill) =>
			bill.id !== editingBillId && bill.category !== "daily-expense" && bill.title.trim().toLowerCase() === title.toLowerCase(),
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
				category: billCategory,
				amountCents: amount,
				frequency: isDaily ? "one-time" : billFrequency,
				monthKey: (isDaily || billFrequency === "one-time")
					? billBeingEdited?.frequency === "one-time" ? billBeingEdited.monthKey : selectedMonth
					: null,
				dueDay: isDaily
					? (billBeingEdited?.dueDay ?? currentActiveCutoff)
					: Number(billDueDay),
				paidMonthKeys: isDaily ? [selectedMonth] : undefined,
			};
			if (editingBillId) {
				await updateBudgetBill(editingBillId, billData);
			} else {
				await createBudgetBill(billData);
			}
			setBillDialogOpen(false);
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
		setDeletingBillId(id);
		try {
			await deleteBudgetBill(id);
			if (editingBillId === id) resetBillForm();
			await load();
			setError("");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not delete bill.");
		} finally {
			setDeletingBillId(null);
		}
	}

	async function updateBillPayment(bill: BudgetBill, paymentMonth: string, paid: boolean): Promise<boolean> {
		if (bill.category === "daily-expense") {
			toast.info("Daily expenses are automatically marked as paid.");
			return false;
		}
		const key = `${bill.id}-${paymentMonth}`;
		if (pendingPaymentKeys.includes(key)) return false;

		setPendingPaymentKeys((current) => [...current, key]);
		const previousBills = bills;
		setBills((current) =>
			current.map((item) =>
				item.id !== bill.id
					? item
					: {
							...item,
							paidMonthKeys: paid
								? Array.from(new Set([...item.paidMonthKeys, paymentMonth]))
								: item.paidMonthKeys.filter((month) => month !== paymentMonth),
						},
			),
		);

		try {
			await setBudgetBillPaid(bill.id, paymentMonth, paid);
			setError("");
			return true;
		} catch (cause) {
			setBills(previousBills);
			setError(cause instanceof Error ? cause.message : "Could not update bill payment status.");
			return false;
		} finally {
			setPendingPaymentKeys((current) => current.filter((k) => k !== key));
		}
	}

	async function moveBill(bill: BudgetBill, targetMonthKey: string, targetDueDay: CutoffDay, frequency: BillFrequency): Promise<boolean> {
		if (submitting) return false;
		setSubmitting(true);
		try {
			await moveBudgetBill(bill.id, targetMonthKey, targetDueDay, frequency);
			await load();
			toast.success(`Moved "${bill.title}" to ${monthLabel(targetMonthKey)} (day ${targetDueDay})`);
			setError("");
			return true;
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not move bill.");
			return false;
		} finally {
			setSubmitting(false);
		}
	}

	return <>
		{error && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">{error}</div>}
		<BudgetHeader selectedMonth={selectedMonth} onSelectMonth={selectMonth} />
		<BudgetSummary
			selectedMonth={selectedMonth}
			budgetCents={summaryBudgetCents}
			billCount={billOccurrences.length}
			scheduledBillTotalCents={billOccurrences.reduce((total, { bill }) => total + bill.amountCents, 0)}
			paidBillCount={paidBillCount}
			unpaidBillCount={unpaidBillCount}
			billWindowLabel={billWindowLabel(billWindowStart, billWindowEnd)}
			overdueBills={overdueBills}
			remainingCents={summaryRemainingCents}
			submitting={submitting}
			error={error}
			onCompleteOverdue={(bill, paymentMonth) => updateBillPayment(bill, paymentMonth, true)}
			budgetMode={budgetMode}
			currentCutoffDay={currentCutoffDay}
		/>
		<BudgetForms
			budgetMode={budgetMode}
			selectedMonth={selectedMonth}
			budgetInput={budgetInput}
			onBudgetInputChange={setBudgetInput}
			onSubmitBudget={submitBudget}
			cutoffInputs={cutoffInputs}
			onCutoffInputChange={handleCutoffInputChange}
			onSubmitCutoffBudget={submitCutoffBudget}
			billTitle={billTitle}
			onBillTitleChange={setBillTitle}
			billCategory={billCategory}
			onBillCategoryChange={setBillCategory}
			billAmount={billAmount}
			onBillAmountChange={setBillAmount}
			billDueDay={billDueDay}
			onBillDueDayChange={setBillDueDay}
			billFrequency={billFrequency}
			onBillFrequencyChange={setBillFrequency}
			editingBill={Boolean(editingBillId)}
			submitting={submitting}
			error={error}
			billFormRef={billFormRef}
			onSubmitBill={submitBill}
			onCancelBill={resetBillForm}
			budgetDialogOpen={budgetDialogOpen}
			onBudgetDialogOpenChange={setBudgetDialogOpen}
			billDialogOpen={billDialogOpen}
			onBillDialogOpenChange={(open) => {
				setBillDialogOpen(open);
				if (!open && editingBillId) resetBillForm();
			}}
		/>
		<div className="space-y-4">
			{budgetMode === "cutoff" && (
				<BudgetCutoffBreakdown
					selectedMonth={selectedMonth}
					cutoffBudgets={cutoffBudgets}
					cutoffBills={cutoffBills}
					activeCutoff={activeCutoff}
				/>
			)}
			<BudgetBillList
				selectedMonth={selectedMonth}
				occurrences={monthBillOccurrences}
				hiddenOverdueCount={0}
				today={today}
				submitting={submitting}
				pendingPaymentKeys={pendingPaymentKeys}
				deletingBillId={deletingBillId}
				onEdit={editBill}
				onMoveBill={moveBill}
				onPaymentChange={(bill, paymentMonth, paid) => void updateBillPayment(bill, paymentMonth, paid)}
				onDelete={(id) => void removeBill(id)}
			/>
			<BudgetExpenseChart data={chart} bills={bills} />
		</div>
		<PageCallout
			icon={Wallet}
			title={budgetMode === "cutoff" ? "Cutoff budget overview" : "Monthly budget overview"}
			description={
				budgetMode === "cutoff"
					? "Plan your cutoff spending for the 5th, 15th, 20th, and 30th, keep bills on track, and balance each period."
					: "Plan your spending, keep bills on track, and see how much is left."
			}
			fallbackPalette="rose"
		/>
	</>;
}
