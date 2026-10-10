import type { BudgetBill } from "@/features/budget/types";

export const money = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

const amountInputFormat = new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export type BillOccurrence = { bill: BudgetBill; monthKey: string };

export type ExpensePoint = { key: string; budget: number; expenses: number };

export function monthKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(key: string, offset: number) {
	const [year, month] = key.split("-").map(Number);
	return monthKey(new Date(year, month - 1 + offset, 1));
}

export function monthLabel(key: string, options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }) {
	return new Intl.DateTimeFormat("en-US", options).format(new Date(`${key}-01T00:00:00`));
}

export function centsFromInput(value: string) {
	const amount = Number(value.replaceAll(",", ""));
	return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

export function formatAmountInput(value: string) {
	if (!value.trim()) return "";
	const amount = Number(value.replaceAll(",", ""));
	return Number.isFinite(amount) && amount >= 0 ? amountInputFormat.format(amount) : value;
}

function formatAmountInputWhileTyping(value: string) {
	const normalized = value.replaceAll(",", "").replace(/[^\d.]/g, "");
	const decimalIndex = normalized.indexOf(".");
	const integerPart = decimalIndex === -1 ? normalized : normalized.slice(0, decimalIndex);
	const fractionalPart = decimalIndex === -1 ? "" : normalized.slice(decimalIndex + 1).replaceAll(".", "").slice(0, 2);
	const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return decimalIndex === -1 ? groupedInteger : `${groupedInteger}.${fractionalPart}`;
}

function formattedCaretPosition(value: string, characterCount: number) {
	if (characterCount === 0) return 0;
	let seen = 0;
	for (let index = 0; index < value.length; index += 1) {
		if (value[index] !== ",") seen += 1;
		if (seen === characterCount) return index + 1;
	}
	return value.length;
}

export function formatAmountInputChange(value: string, cursor: number) {
	const charactersBeforeCursor = formatAmountInputWhileTyping(value.slice(0, cursor)).replaceAll(",", "").length;
	const formattedValue = formatAmountInputWhileTyping(value);
	return {
		value: formattedValue,
		cursor: formattedCaretPosition(formattedValue, charactersBeforeCursor),
	};
}

export function billsForMonth(bills: BudgetBill[], key: string) {
	return bills.filter((bill) => bill.frequency === "recurring" || bill.monthKey === key);
}

export function billOccurrencesForMonth(bills: BudgetBill[], key: string): BillOccurrence[] {
	const selected = new Date(`${key}-01T00:00:00`);
	const occurrences: BillOccurrence[] = [];
	for (const bill of bills) {
		const firstMonth = bill.frequency === "recurring"
			? monthKey(new Date(bill.createdAt))
			: bill.monthKey;
		if (!firstMonth) continue;
		const cursor = new Date(`${firstMonth}-01T00:00:00`);
		while (cursor <= selected) {
			const occurrenceMonth = monthKey(cursor);
			if (occurrenceMonth === key || !bill.paidMonthKeys.includes(occurrenceMonth)) {
				occurrences.push({ bill, monthKey: occurrenceMonth });
			}
			if (bill.frequency === "one-time") break;
			cursor.setMonth(cursor.getMonth() + 1);
		}
	}
	return occurrences;
}

export function isBillOccurrenceOverdue(bill: BudgetBill, occurrenceMonth: string, today: Date) {
	const [year, month] = occurrenceMonth.split("-").map(Number);
	const daysInMonth = new Date(year, month, 0).getDate();
	const dueDay = Math.min(bill.dueDay ?? daysInMonth, daysInMonth);
	const dueDate = new Date(year, month - 1, dueDay);
	dueDate.setHours(0, 0, 0, 0);
	return dueDate < today;
}

export function billOccurrencesInWindow(bills: BudgetBill[], start: Date, end: Date): BillOccurrence[] {
	const occurrences: BillOccurrence[] = [];
	const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
	const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);

	while (cursor <= lastMonth) {
		const key = monthKey(cursor);
		const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
		for (const bill of bills) {
			if (bill.dueDay === null || (bill.frequency === "one-time" && bill.monthKey !== key)) continue;
			const dueDate = new Date(cursor.getFullYear(), cursor.getMonth(), Math.min(bill.dueDay, daysInMonth));
			if (dueDate >= start && dueDate <= end) occurrences.push({ bill, monthKey: key });
		}
		cursor.setMonth(cursor.getMonth() + 1);
	}
	return occurrences;
}

export function billWindowLabel(start: Date, end: Date) {
	const format = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
	return `${format.format(start)}–${format.format(end)}`;
}
