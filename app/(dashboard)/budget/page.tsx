import { connection } from "next/server";
import { getBudgetData } from "@/features/budget/actions/budget-actions";
import { BudgetPlanner } from "@/features/budget/components/budget-planner";
import type { BudgetBill, MonthlyBudget } from "@/features/budget/types";

async function BudgetContent() {
	await connection();
	let initialData: { budgets: MonthlyBudget[]; bills: BudgetBill[] } = { budgets: [], bills: [] };
	let initialError = "";
	try {
		initialData = await getBudgetData();
	} catch (error) {
		initialError = error instanceof Error ? error.message : "Could not load budget data.";
	}
	return <BudgetPlanner initialData={initialData} initialError={initialError} />;
}

export default function BudgetPage() {
	return <BudgetContent />;
}
