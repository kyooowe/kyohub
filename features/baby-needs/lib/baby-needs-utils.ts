import type { BabyNeed } from "../types";

export function getUpcomingVaccine(needs: Record<string, BabyNeed[]>, todayKey: string) {
	return Object.entries(needs)
		.flatMap(([key, items]) => items
			.filter((item) => item.type === "Vaccination" && !item.done && key >= todayKey)
			.map((item) => ({ ...item, dateKey: key })))
		.sort((first, second) => first.dateKey.localeCompare(second.dateKey))[0];
}
