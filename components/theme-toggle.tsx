"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function themeSnapshot() {
	return document.documentElement.classList.contains("dark");
}

function subscribeToTheme(onChange: () => void) {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
	return () => observer.disconnect();
}

export function useDarkModePreference() {
	return useSyncExternalStore(subscribeToTheme, themeSnapshot, () => false);
}

export function setDarkMode(isDark: boolean) {
	document.documentElement.classList.toggle("dark", isDark);
	document.documentElement.style.colorScheme = isDark ? "dark" : "light";
	localStorage.setItem("kyohub-theme", isDark ? "dark" : "light");
}

export function ThemeToggle() {
	function toggleTheme() {
		setDarkMode(!document.documentElement.classList.contains("dark"));
	}

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label="Toggle color theme"
			title="Toggle color theme"
			className="group relative grid size-8 place-items-center overflow-hidden rounded-xl border border-violet-100 bg-linear-to-br from-white to-violet-50 text-violet-700 shadow-sm shadow-violet-950/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:text-amber-300 dark:shadow-black/20 dark:hover:border-slate-600 dark:hover:from-slate-700 dark:hover:to-slate-800 dark:focus-visible:ring-offset-slate-950"
		>
			<Moon size={17} aria-hidden="true" className="absolute transition-all duration-300 dark:rotate-90 dark:scale-0" />
			<Sun size={17} aria-hidden="true" className="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
		</button>
	);
}
