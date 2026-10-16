import { connection } from "next/server";
import { DashboardNavigationReady } from "@/components/layout/dashboard-navigation-progress";
import { getBudgetData } from "@/features/budget/actions/budget-actions";
import { BudgetPlanner } from "@/features/budget/components/budget-planner";
import type { BudgetBill, MonthlyBudget } from "@/features/budget/types";

export const instant = false;

async function BudgetContent({ openGrocery }: { openGrocery?: string }) {
	await connection();
	let initialData: { budgets: MonthlyBudget[]; bills: BudgetBill[] } = { budgets: [], bills: [] };
	let initialError = "";
	try {
		initialData = await getBudgetData();
	} catch (error) {
		initialError = error instanceof Error ? error.message : "Could not load budget data.";
	}
	return (
		<>
			<DashboardNavigationReady href="/budget" />
			<BudgetPlanner initialData={initialData} initialError={initialError} initialOpenGroceryDateKey={openGrocery} />
		</>
	);
}

export default async function BudgetPage({
	searchParams,
}: {
	searchParams?: Promise<{ openGrocery?: string; [key: string]: string | string[] | undefined }>;
}) {
	const resolvedSearchParams = searchParams ? await searchParams : undefined;
	const openGrocery = typeof resolvedSearchParams?.openGrocery === "string" ? resolvedSearchParams.openGrocery : undefined;
	return <BudgetContent openGrocery={openGrocery} />;
}
