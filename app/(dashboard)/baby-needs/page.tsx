import { Suspense } from "react";
import { connection } from "next/server";
import { getFamilyAppointments, type FamilyAppointmentRecord } from "@/features/family-calendar/actions/family-calendar-actions";
import { FamilyCalendar } from "@/features/family-calendar/components/family-calendar";

async function FamilyCalendarContent() {
	await connection();
	let initialEntries: FamilyAppointmentRecord[] = [];
	let initialError = "";
	try {
		initialEntries = await getFamilyAppointments();
	} catch (error) {
		initialError = error instanceof Error ? `Could not load family calendar: ${error.message}` : "Could not load family calendar from the database.";
	}
	return <FamilyCalendar initialEntries={initialEntries} initialError={initialError} />;
}

export default function FamilyCalendarPage() {
	return (
		<Suspense fallback={null}>
			<FamilyCalendarContent />
		</Suspense>
	);
}
