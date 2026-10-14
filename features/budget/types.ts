export const cutoffDays = [5, 15, 20, 30] as const;
export type CutoffDay = (typeof cutoffDays)[number];
export function isCutoffDay(value: unknown): value is CutoffDay {
	return typeof value === "number" && cutoffDays.some((day) => day === value);
}

export type BillFrequency = "recurring" | "one-time";
export const budgetCategories = ["utility", "housing", "loan", "foods"] as const;
export type BudgetCategory = (typeof budgetCategories)[number];
export const budgetCategoryLabels: Record<BudgetCategory, string> = {
	utility: "Utility",
	housing: "Housing",
	loan: "Loan",
	foods: "Foods",
};
export function isBudgetCategory(value: unknown): value is BudgetCategory {
	return typeof value === "string" && budgetCategories.some((category) => category === value);
}

export type MonthlyBudget = {
	id: string;
	monthKey: string;
	amountCents: number;
};

export type BudgetBill = {
	id: string;
	title: string;
	category: BudgetCategory;
	amountCents: number;
	frequency: BillFrequency;
	monthKey: string | null;
	dueDay: number | null;
	paidMonthKeys: string[];
	createdAt: string;
};
