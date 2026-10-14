import {
	BriefcaseBusiness,
	Gamepad2,
	KeyRound,
	Landmark,
	Share2,
	Wrench,
	type LucideIcon,
} from "lucide-react";
import type { Category } from "../types";

export const categories: Category[] = ["Social media", "Banking", "Games", "Work", "Utility"];
export const allCategories: Category[] = [...categories, "Other"];

export type CategoryMeta = {
	icon: LucideIcon;
	label: string;
	gradient: string;
	shadow: string;
	badge: string;
	iconColor: string;
};

export const categoryMeta: Record<Category, CategoryMeta> = {
	"Social media": {
		icon: Share2,
		label: "Social media",
		gradient: "from-sky-500 via-blue-600 to-indigo-600",
		shadow: "shadow-blue-500/30",
		badge: "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/80",
		iconColor: "text-sky-600 dark:text-sky-400",
	},
	Banking: {
		icon: Landmark,
		label: "Banking",
		gradient: "from-emerald-500 via-teal-600 to-teal-700",
		shadow: "shadow-emerald-500/30",
		badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80",
		iconColor: "text-emerald-600 dark:text-emerald-400",
	},
	Games: {
		icon: Gamepad2,
		label: "Games",
		gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
		shadow: "shadow-purple-500/30",
		badge: "bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/80",
		iconColor: "text-violet-600 dark:text-violet-400",
	},
	Work: {
		icon: BriefcaseBusiness,
		label: "Work",
		gradient: "from-amber-500 via-orange-500 to-rose-600",
		shadow: "shadow-amber-500/30",
		badge: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80",
		iconColor: "text-amber-600 dark:text-amber-400",
	},
	Utility: {
		icon: Wrench,
		label: "Utility",
		gradient: "from-indigo-500 via-violet-600 to-purple-700",
		shadow: "shadow-indigo-500/30",
		badge: "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/80",
		iconColor: "text-indigo-600 dark:text-indigo-400",
	},
	Other: {
		icon: KeyRound,
		label: "Other",
		gradient: "from-slate-600 via-slate-700 to-zinc-800",
		shadow: "shadow-slate-500/30",
		badge: "bg-slate-50 text-slate-700 border-slate-200/80 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800/80",
		iconColor: "text-slate-600 dark:text-slate-400",
	},
};

export function getStrength(password: string) {
	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;
	return {
		score,
		label: score < 3 ? "Weak" : score < 4 ? "Fair" : "Strong",
		color: score < 3 ? "bg-red-400" : score < 4 ? "bg-amber-400" : "bg-emerald-500",
		textColor: score < 3 ? "text-red-500" : score < 4 ? "text-amber-600" : "text-emerald-600",
	};
}
