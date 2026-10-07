import type { Category } from "../types";

export const categories: Category[] = ["Social media", "Banking", "Games", "Work", "Other"];

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
