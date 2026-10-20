import type { BabyStoolLog, StoolColor, StoolConsistency, BabySleepLog, BabyMilkLog } from "../types";

export function calculateBabyAge(birthDateString: string): {
	formatted: string;
	totalDays: number;
	totalMonths: number;
	weeksAndDays: string;
} {
	if (!birthDateString) {
		return { formatted: "Unknown", totalDays: 0, totalMonths: 0, weeksAndDays: "" };
	}

	const [year, month, day] = birthDateString.split("-").map(Number);
	const birth = new Date(year, month - 1, day);
	const today = new Date();

	// Clear time components
	birth.setHours(0, 0, 0, 0);
	today.setHours(0, 0, 0, 0);

	const diffTime = today.getTime() - birth.getTime();
	const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

	if (totalDays === 0) {
		return { formatted: "Born Today", totalDays: 0, totalMonths: 0, weeksAndDays: "Day 1" };
	}

	const weeks = Math.floor(totalDays / 7);
	const remDays = totalDays % 7;
	const weeksAndDays = weeks > 0 ? `${weeks}w ${remDays}d` : `${totalDays} days`;

	let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
	let days = today.getDate() - birth.getDate();
	if (days < 0) {
		months--;
		const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
		days += prevMonthLastDay;
	}

	let formatted = "";
	if (months <= 0) {
		formatted = totalDays < 7 ? `${totalDays} days old` : `${weeks} weeks old`;
	} else if (months < 24) {
		formatted = days > 0 ? `${months} mo ${days} d old` : `${months} months old`;
	} else {
		const years = Math.floor(months / 12);
		const remMonths = months % 12;
		formatted = remMonths > 0 ? `${years}y ${remMonths}m old` : `${years} years old`;
	}

	return { formatted, totalDays, totalMonths: months, weeksAndDays };
}

export function formatRelativeTime(dateInput: string | Date): string {
	const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
	const now = new Date();
	const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffSec < 60) return "Just now";
	if (diffSec < 3600) {
		const mins = Math.floor(diffSec / 60);
		return `${mins}m ago`;
	}
	if (diffSec < 86400) {
		const hours = Math.floor(diffSec / 3600);
		return `${hours}h ago`;
	}
	const days = Math.floor(diffSec / 86400);
	if (days === 1) return "Yesterday";
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export function getDiaperStats(logs: BabyStoolLog[]) {
	const today = new Date();
	const todayLogs = logs.filter((log) => isSameDay(new Date(log.loggedAt), today));

	let stoolCount = 0;
	let wetCount = 0;
	let bothCount = 0;

	for (const log of todayLogs) {
		if (log.type === "stool") stoolCount++;
		else if (log.type === "wet") wetCount++;
		else if (log.type === "both") {
			stoolCount++;
			wetCount++;
			bothCount++;
		}
	}

	const lastLog = logs.length > 0 ? logs[0] : null;

	return {
		todayTotal: todayLogs.length,
		todayStools: stoolCount,
		todayWets: wetCount,
		todayBoth: bothCount,
		lastChanged: lastLog ? formatRelativeTime(lastLog.loggedAt) : "No logs yet",
		lastLogType: lastLog?.type,
		lastLogTime: lastLog ? new Date(lastLog.loggedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null,
	};
}

export const stoolColorMetadata: Record<StoolColor, { label: string; swatch: string; advice: string }> = {
	yellow: {
		label: "Mustard Yellow",
		swatch: "bg-[#E6C229]",
		advice: "Normal & healthy for breastfed babies.",
	},
	mustard: {
		label: "Golden Yellow",
		swatch: "bg-[#D4A017]",
		advice: "Normal healthy baby stool.",
	},
	brown: {
		label: "Tan / Brown",
		swatch: "bg-[#8D5B4C]",
		advice: "Typical for formula-fed babies or starting solids.",
	},
	green: {
		label: "Greenish",
		swatch: "bg-[#5D7052]",
		advice: "Usually normal; may be caused by iron supplements or rapid digestion.",
	},
	black: {
		label: "Dark / Black",
		swatch: "bg-[#2B2B2B]",
		advice: "Normal meconium in first 3 days. If baby is older, consult pediatrician.",
	},
	clay: {
		label: "Pale / Clay",
		swatch: "bg-[#D9D2C9]",
		advice: "Uncommon; contact your pediatrician if persistent.",
	},
	other: {
		label: "Other Color",
		swatch: "bg-[#9E9E9E]",
		advice: "Monitor baby's diet and comfort level.",
	},
};

export const stoolConsistencyMetadata: Record<StoolConsistency, { label: string; description: string }> = {
	soft: { label: "Soft / Creamy", description: "Smooth and spreadable, ideal baby texture." },
	seedy: { label: "Seedy", description: "Common mustard-seed look in breastfed newborns." },
	normal: { label: "Formed / Normal", description: "Soft peanut-butter consistency typical with solids." },
	watery: { label: "Watery / Loose", description: "Runny or soaked into diaper; monitor hydration." },
	hard: { label: "Hard / Pellets", description: "Dry small pebbles; may indicate mild constipation." },
};

// WHO 50th Percentile reference curves (approximate averages for boys & girls combined)
export const whoGrowthBenchmarks: Array<{ month: number; weightKg: number; heightCm: number }> = [
	{ month: 0, weightKg: 3.3, heightCm: 49.5 },
	{ month: 1, weightKg: 4.4, heightCm: 54.0 },
	{ month: 2, weightKg: 5.4, heightCm: 57.5 },
	{ month: 3, weightKg: 6.2, heightCm: 60.5 },
	{ month: 4, weightKg: 6.8, heightCm: 63.0 },
	{ month: 5, weightKg: 7.3, heightCm: 65.0 },
	{ month: 6, weightKg: 7.7, heightCm: 67.0 },
	{ month: 7, weightKg: 8.1, heightCm: 68.5 },
	{ month: 8, weightKg: 8.4, heightCm: 70.0 },
	{ month: 9, weightKg: 8.7, heightCm: 71.5 },
	{ month: 10, weightKg: 9.0, heightCm: 73.0 },
	{ month: 11, weightKg: 9.3, heightCm: 74.5 },
	{ month: 12, weightKg: 9.6, heightCm: 75.8 },
	{ month: 15, weightKg: 10.3, heightCm: 79.5 },
	{ month: 18, weightKg: 11.0, heightCm: 82.5 },
	{ month: 24, weightKg: 12.2, heightCm: 87.5 },
];

export function getWhoBenchmarkForMonth(month: number): { weightKg: number; heightCm: number } | null {
	if (month < 0) return null;
	const exact = whoGrowthBenchmarks.find((b) => b.month === month);
	if (exact) return { weightKg: exact.weightKg, heightCm: exact.heightCm };

	const lower = [...whoGrowthBenchmarks].reverse().find((b) => b.month <= month);
	const upper = whoGrowthBenchmarks.find((b) => b.month >= month);
	if (!lower && upper) return { weightKg: upper.weightKg, heightCm: upper.heightCm };
	if (lower && !upper) return { weightKg: lower.weightKg, heightCm: lower.heightCm };
	if (lower && upper && lower.month !== upper.month) {
		const ratio = (month - lower.month) / (upper.month - lower.month);
		return {
			weightKg: Number((lower.weightKg + ratio * (upper.weightKg - lower.weightKg)).toFixed(2)),
			heightCm: Number((lower.heightCm + ratio * (upper.heightCm - lower.heightCm)).toFixed(1)),
		};
	}
	return null;
}

export type GrowthStatusType = "normal" | "above_normal" | "below_normal";

export interface GrowthAssessment {
	status: GrowthStatusType;
	label: string; // "Normal", "Above Normal", "Below Normal"
	diffPercent: number;
	diffFormatted: string;
	whoAverage: number;
}

export function getWeightAssessment(weightKg: number, monthAge: number): GrowthAssessment | null {
	const bench = getWhoBenchmarkForMonth(monthAge);
	if (!bench || !weightKg) return null;
	const whoAvg = bench.weightKg;
	const diff = weightKg - whoAvg;
	const diffPercent = Math.round((diff / whoAvg) * 100);
	const diffFormatted = diff >= 0 ? `+${diff.toFixed(2)} kg vs WHO avg` : `${diff.toFixed(2)} kg vs WHO avg`;

	let status: GrowthStatusType = "normal";
	let label = "Normal";
	// Standard pediatric margin: ±15% corresponds to ~15th to 85th percentile
	if (diffPercent > 15) {
		status = "above_normal";
		label = "Above Normal";
	} else if (diffPercent < -15) {
		status = "below_normal";
		label = "Below Normal";
	}

	return { status, label, diffPercent, diffFormatted, whoAverage: whoAvg };
}

export function getHeightAssessment(heightCm: number, monthAge: number): GrowthAssessment | null {
	const bench = getWhoBenchmarkForMonth(monthAge);
	if (!bench || !heightCm) return null;
	const whoAvg = bench.heightCm;
	const diff = heightCm - whoAvg;
	const diffPercent = Math.round((diff / whoAvg) * 100);
	const diffFormatted = diff >= 0 ? `+${diff.toFixed(1)} cm vs WHO avg` : `${diff.toFixed(1)} cm vs WHO avg`;

	let status: GrowthStatusType = "normal";
	let label = "Normal";
	// Height margin: ±6% corresponds to standard normal range for infant length
	if (diffPercent > 6) {
		status = "above_normal";
		label = "Above Normal";
	} else if (diffPercent < -6) {
		status = "below_normal";
		label = "Below Normal";
	}

	return { status, label, diffPercent, diffFormatted, whoAverage: whoAvg };
}

/* -------------------------------------------------------------------------- */
/*                                Sleep Utils                                 */
/* -------------------------------------------------------------------------- */

export function formatDurationMinutes(totalMinutes: number): string {
	if (!totalMinutes || totalMinutes <= 0) return "0m";
	const hours = Math.floor(totalMinutes / 60);
	const mins = Math.round(totalMinutes % 60);
	if (hours === 0) return `${mins}m`;
	if (mins === 0) return `${hours}h`;
	return `${hours}h ${mins}m`;
}

export function formatDurationHours(totalMinutes: number): string {
	const hours = (totalMinutes / 60).toFixed(1);
	return `${hours} hrs`;
}

export function getSleepAgeBenchmark(monthAge: number): {
	minHours: number;
	maxHours: number;
	recommendedHours: number;
	label: string;
} {
	if (monthAge < 3) {
		return { minHours: 14, maxHours: 17, recommendedHours: 15.5, label: "0-3 mos: 14-17 hrs/day" };
	}
	if (monthAge < 12) {
		return { minHours: 12, maxHours: 16, recommendedHours: 14, label: "4-11 mos: 12-16 hrs/day" };
	}
	if (monthAge < 24) {
		return { minHours: 11, maxHours: 14, recommendedHours: 12.5, label: "1-2 yrs: 11-14 hrs/day" };
	}
	return { minHours: 10, maxHours: 13, recommendedHours: 11.5, label: "2+ yrs: 10-13 hrs/day" };
}

export function getSleepStats(logs: BabySleepLog[], babyMonthAge = 0) {
	const today = new Date();
	const activeSession = logs.find((l) => l.status === "sleeping" || !l.endTime) || null;

	const todayLogs = logs.filter((l) => {
		const start = new Date(l.startTime);
		return isSameDay(start, today);
	});

	let todaySleepMinutes = 0;
	let todayNapMinutes = 0;
	let todayNightMinutes = 0;
	let todayCompletedCount = 0;

	for (const log of todayLogs) {
		let mins = log.durationMinutes || 0;
		if (log.status === "sleeping" && !log.endTime) {
			mins = Math.max(0, Math.round((today.getTime() - new Date(log.startTime).getTime()) / 60000));
		} else {
			todayCompletedCount++;
		}
		todaySleepMinutes += mins;
		if (log.sleepType === "nap") {
			todayNapMinutes += mins;
		} else {
			todayNightMinutes += mins;
		}
	}

	// Calculate awake hours today based on elapsed time from midnight
	const nowMidnight = new Date(today);
	nowMidnight.setHours(0, 0, 0, 0);
	const elapsedTodayMinutes = Math.min(1440, Math.max(0, Math.round((today.getTime() - nowMidnight.getTime()) / 60000)));
	const todayAwakeMinutes = Math.max(0, elapsedTodayMinutes - todaySleepMinutes);

	// Daily average / estimated sleep per day over distinct recorded days
	const dayGroups: Record<string, number> = {};
	for (const log of logs) {
		if (log.status === "completed" && log.durationMinutes) {
			const d = new Date(log.startTime).toISOString().split("T")[0];
			dayGroups[d] = (dayGroups[d] || 0) + log.durationMinutes;
		}
	}
	const distinctDays = Object.keys(dayGroups);
	const totalMinsAcrossDays = distinctDays.reduce((acc, k) => acc + dayGroups[k], 0);
	const avgMinutesPerDay = distinctDays.length > 0 ? Math.round(totalMinsAcrossDays / distinctDays.length) : todaySleepMinutes;
	const estimatedSleepHoursPerDay = avgMinutesPerDay / 60;

	const benchmark = getSleepAgeBenchmark(babyMonthAge);

	return {
		activeSession,
		todaySessionCount: todayLogs.length,
		todayCompletedCount,
		todaySleepMinutes,
		todaySleepFormatted: formatDurationMinutes(todaySleepMinutes),
		todayAwakeMinutes,
		todayAwakeFormatted: formatDurationMinutes(todayAwakeMinutes),
		todayNapMinutes,
		todayNightMinutes,
		avgMinutesPerDay,
		estimatedSleepHoursPerDay: Number(estimatedSleepHoursPerDay.toFixed(1)),
		estimatedSleepHoursFormatted: `${estimatedSleepHoursPerDay.toFixed(1)} hrs`,
		benchmark,
		lastSession: logs.length > 0 ? logs[0] : null,
	};
}

export function getSleepComparisonData(logs: BabySleepLog[], daysCount = 7, babyMonthAge = 0) {
	const result = [];
	const today = new Date();
	const benchmark = getSleepAgeBenchmark(babyMonthAge);

	const nowMidnight = new Date(today);
	nowMidnight.setHours(0, 0, 0, 0);
	const elapsedTodayMinutes = Math.min(1440, Math.max(0, Math.round((today.getTime() - nowMidnight.getTime()) / 60000)));

	for (let i = daysCount - 1; i >= 0; i--) {
		const targetDate = new Date(today);
		targetDate.setDate(targetDate.getDate() - i);
		const dateKey = targetDate.toISOString().split("T")[0];
		const displayDate = targetDate.toLocaleDateString(undefined, { weekday: "short", month: "numeric", day: "numeric" });

		const dayLogs = logs.filter((l) => {
			const s = new Date(l.startTime);
			return isSameDay(s, targetDate);
		});

		let totalMinutes = 0;
		let napMinutes = 0;
		let nightMinutes = 0;

		for (const l of dayLogs) {
			let m = l.durationMinutes || 0;
			if (l.status === "sleeping" && !l.endTime) {
				m = Math.max(0, Math.round((Date.now() - new Date(l.startTime).getTime()) / 60000));
			}
			totalMinutes += m;
			if (l.sleepType === "nap") napMinutes += m;
			else nightMinutes += m;
		}

		const hasLogs = dayLogs.length > 0;
		const sleepHours = Number((totalMinutes / 60).toFixed(1));
		let wakeHours = 0;
		if (hasLogs) {
			if (isSameDay(targetDate, today)) {
				wakeHours = Number(Math.max(0, (elapsedTodayMinutes - totalMinutes) / 60).toFixed(1));
			} else {
				wakeHours = Number(Math.max(0, 24 - sleepHours).toFixed(1));
			}
		}

		const napHours = Number((napMinutes / 60).toFixed(1));
		const nightHours = Number((nightMinutes / 60).toFixed(1));

		result.push({
			dateKey,
			displayDate,
			sleepHours,
			wakeHours,
			napHours,
			nightHours,
			targetHours: benchmark.recommendedHours,
			minTargetHours: benchmark.minHours,
			maxTargetHours: benchmark.maxHours,
			sessionCount: dayLogs.length,
		});
	}

	return result;
}

/* -------------------------------------------------------------------------- */
/*                                 Milk Utils                                 */
/* -------------------------------------------------------------------------- */

export function getMilkStats(logs: BabyMilkLog[]) {
	const today = new Date();
	const todayLogs = logs.filter((l) => isSameDay(new Date(l.loggedAt), today));

	let todayPreparedOz = 0;
	let todayDrankOz = 0;
	let todayLeftoverOz = 0;

	for (const log of todayLogs) {
		todayPreparedOz += log.preparedOz;
		todayDrankOz += log.drankOz;
		todayLeftoverOz += log.leftoverOz;
	}

	const dayGroups: Record<string, { drank: number; leftover: number; prepared: number }> = {};
	for (const log of logs) {
		const d = new Date(log.loggedAt).toISOString().split("T")[0];
		if (!dayGroups[d]) dayGroups[d] = { drank: 0, leftover: 0, prepared: 0 };
		dayGroups[d].drank += log.drankOz;
		dayGroups[d].leftover += log.leftoverOz;
		dayGroups[d].prepared += log.preparedOz;
	}

	const distinctDays = Object.keys(dayGroups);
	const countDays = distinctDays.length > 0 ? distinctDays.length : 1;
	const totalDrankAcrossDays = distinctDays.reduce((acc, k) => acc + dayGroups[k].drank, 0);
	const totalLeftoverAcrossDays = distinctDays.reduce((acc, k) => acc + dayGroups[k].leftover, 0);
	const totalPreparedAcrossDays = distinctDays.reduce((acc, k) => acc + dayGroups[k].prepared, 0);

	const estimatedDrankOzPerDay = Number((totalDrankAcrossDays / countDays).toFixed(1));
	const estimatedLeftoverOzPerDay = Number((totalLeftoverAcrossDays / countDays).toFixed(1));
	const estimatedPreparedOzPerDay = Number((totalPreparedAcrossDays / countDays).toFixed(1));
	const consumptionRate = totalPreparedAcrossDays > 0
		? Math.round((totalDrankAcrossDays / totalPreparedAcrossDays) * 100)
		: 100;

	return {
		todayCount: todayLogs.length,
		todayPreparedOz: Number(todayPreparedOz.toFixed(1)),
		todayDrankOz: Number(todayDrankOz.toFixed(1)),
		todayLeftoverOz: Number(todayLeftoverOz.toFixed(1)),
		estimatedDrankOzPerDay,
		estimatedLeftoverOzPerDay,
		estimatedPreparedOzPerDay,
		consumptionRate,
		lastFeed: logs.length > 0 ? logs[0] : null,
	};
}

export function getMilkComparisonData(logs: BabyMilkLog[], daysCount = 7) {
	const result = [];
	const today = new Date();
	const stats = getMilkStats(logs);

	for (let i = daysCount - 1; i >= 0; i--) {
		const targetDate = new Date(today);
		targetDate.setDate(targetDate.getDate() - i);
		const dateKey = targetDate.toISOString().split("T")[0];
		const displayDate = targetDate.toLocaleDateString(undefined, { weekday: "short", month: "numeric", day: "numeric" });

		const dayLogs = logs.filter((l) => isSameDay(new Date(l.loggedAt), targetDate));

		let preparedOz = 0;
		let drankOz = 0;
		let leftoverOz = 0;

		for (const l of dayLogs) {
			preparedOz += l.preparedOz;
			drankOz += l.drankOz;
			leftoverOz += l.leftoverOz;
		}

		result.push({
			dateKey,
			displayDate,
			drankOz: Number(drankOz.toFixed(1)),
			leftoverOz: Number(leftoverOz.toFixed(1)),
			preparedOz: Number(preparedOz.toFixed(1)),
			estimatedDrankOz: stats.estimatedDrankOzPerDay,
			feedCount: dayLogs.length,
		});
	}

	return result;
}
