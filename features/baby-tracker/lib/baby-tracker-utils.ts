import type { BabyStoolLog, StoolColor, StoolConsistency } from "../types";

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
