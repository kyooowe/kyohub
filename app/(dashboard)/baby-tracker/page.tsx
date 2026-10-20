import { connection } from "next/server";
import { DashboardNavigationReady } from "@/components/layout/dashboard-navigation-progress";
import { getBabyTrackerData } from "@/features/baby-tracker/actions/baby-tracker-actions";
import { BabyTracker } from "@/features/baby-tracker/components/baby-tracker";
import type { BabyTrackerData } from "@/features/baby-tracker/types";

export const instant = false;

const emptyData: BabyTrackerData = {
	profile: null,
	stoolLogs: [],
	vaccines: [],
	medicines: [],
	growthRecords: [],
	medicalNotes: [],
	sleepLogs: [],
	milkLogs: [],
};

async function BabyTrackerContent() {
	await connection();
	let initialData: BabyTrackerData = emptyData;
	let initialError = "";

	try {
		initialData = await getBabyTrackerData();
	} catch (error) {
		initialError =
			error instanceof Error
				? `Could not load baby tracker: ${error.message}`
				: "Could not load baby tracker from the database.";
	}

	return (
		<>
			<DashboardNavigationReady href="/baby-tracker" />
			<BabyTracker initialData={initialData} initialError={initialError} />
		</>
	);
}

export default function BabyTrackerPage() {
	return <BabyTrackerContent />;
}
