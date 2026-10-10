export type BillFrequency = "recurring" | "one-time";

export type MonthlyBudget = {
	id: string;
	monthKey: string;
	amountCents: number;
};

export type BudgetBill = {
	id: string;
	title: string;
	amountCents: number;
	frequency: BillFrequency;
	monthKey: string | null;
	dueDay: number | null;
	paidMonthKeys: string[];
	createdAt: string;
};
