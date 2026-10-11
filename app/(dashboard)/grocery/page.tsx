import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardLoading } from "@/components/layout/dashboard-loading";
import { getGroceryItems, type GroceryRecord } from "@/features/grocery/actions/grocery-actions";
import { GroceryPlanner } from "@/features/grocery/components/grocery-planner";

async function GroceryContent() {
	await connection();
	let initialItems: GroceryRecord[] = [];
	let initialError = "";
	try {
		initialItems = await getGroceryItems();
	} catch (error) {
		initialError = error instanceof Error ? `Could not load groceries: ${error.message}` : "Could not load groceries from the database.";
	}
	return <GroceryPlanner initialItems={initialItems} initialError={initialError} />;
}

export default function GroceryPage() {
	return (
		<Suspense fallback={<DashboardLoading />}>
			<GroceryContent />
		</Suspense>
	);
}
