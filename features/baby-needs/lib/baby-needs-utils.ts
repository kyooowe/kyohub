import type { BabyNeed } from "../types";

function getUpcomingNeed(needs: Record<string, BabyNeed[]>, todayKey: string, type: BabyNeed["type"]) {
	return Object.entries(needs)
		.flatMap(([key, items]) => items
			.filter((item) => item.type === type && !item.done && key >= todayKey)
			.map((item) => ({ ...item, dateKey: key })))
		.sort((first, second) => first.dateKey.localeCompare(second.dateKey))[0];
}

export function getUpcomingVaccine(needs: Record<string, BabyNeed[]>, todayKey: string) {
	return getUpcomingNeed(needs, todayKey, "Vaccination");
}

export function getUpcomingImportantDate(needs: Record<string, BabyNeed[]>, todayKey: string) {
	return getUpcomingNeed(needs, todayKey, "Important date");
}
