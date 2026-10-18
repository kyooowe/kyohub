import { connection } from "next/server";
import { DashboardNavigationReady } from "@/components/layout/dashboard-navigation-progress";
import { getFamilyAppointments, type FamilyAppointmentRecord } from "@/features/family-calendar/actions/family-calendar-actions";
import { FamilyCalendar } from "@/features/family-calendar/components/family-calendar";

export const instant = false;

async function FamilyCalendarContent() {
	await connection();
	let initialEntries: FamilyAppointmentRecord[] = [];
	let initialError = "";
	try {
		initialEntries = await getFamilyAppointments();
	} catch (error) {
		initialError = error instanceof Error ? `Could not load family calendar: ${error.message}` : "Could not load family calendar from the database.";
	}
	return (
		<>
			<DashboardNavigationReady href="/family-calendar" />
			<FamilyCalendar initialEntries={initialEntries} initialError={initialError} />
		</>
	);
}

export default function FamilyCalendarPage() {
	return <FamilyCalendarContent />;
}
