import { connection } from "next/server";
import { DashboardNavigationReady } from "@/components/layout/dashboard-navigation-progress";
import { getGroceryItems, type GroceryRecord } from "@/features/grocery/actions/grocery-actions";
import { GroceryPlanner } from "@/features/grocery/components/grocery-planner";

export const instant = false;

async function GroceryContent() {
	await connection();
	let initialItems: GroceryRecord[] = [];
	let initialSyncDates: Record<string, boolean> = {};
	let initialError = "";
	try {
		const [items, syncDates] = await Promise.all([
			getGroceryItems(),
			import("@/features/grocery/actions/grocery-actions").then((m) => m.getGroceryBudgetSyncDates()),
		]);
		initialItems = items;
		initialSyncDates = syncDates;
	} catch (error) {
		initialError = error instanceof Error ? `Could not load groceries: ${error.message}` : "Could not load groceries from the database.";
	}
	return (
		<>
			<DashboardNavigationReady href="/grocery" />
			<GroceryPlanner initialItems={initialItems} initialSyncDates={initialSyncDates} initialError={initialError} />
		</>
	);
}

export default function GroceryPage() {
	return <GroceryContent />;
}
