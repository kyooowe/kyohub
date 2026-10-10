import type { FamilyAppointment } from "../family-calendar-types";

function getUpcomingAppointment(needs: Record<string, FamilyAppointment[]>, todayKey: string, type: FamilyAppointment["type"]) {
	return Object.entries(needs)
		.flatMap(([key, items]) => items
			.filter((item) => item.type === type && !item.done && key >= todayKey)
			.map((item) => ({ ...item, dateKey: key })))
		.sort((first, second) => first.dateKey.localeCompare(second.dateKey))[0];
}

export function getUpcomingVaccine(needs: Record<string, FamilyAppointment[]>, todayKey: string) {
	return getUpcomingAppointment(needs, todayKey, "Vaccination");
}

export function getUpcomingImportantDate(needs: Record<string, FamilyAppointment[]>, todayKey: string) {
	return getUpcomingAppointment(needs, todayKey, "Important date");
}
