import { isPagePalette, type NamedPagePalette, type PagePalette } from "@/components/settings/page-palettes";

export const navigationItems = [
	{ href: "/passwords", label: "Password manager" },
	{ href: "/grocery", label: "Grocery planner" },
	{ href: "/baby-needs", label: "Family Calendar" },
	{ href: "/budget", label: "Budget planner" },
] as const;

export type NavigationHref = (typeof navigationItems)[number]["href"];

export type BudgetMode = "monthly" | "cutoff";

export type AppSettings = {
	desktopNavigation: "sidebar" | "floating";
	navigationOrder: NavigationHref[];
	pagePalettes: Record<NavigationHref, PagePalette>;
	passwordView: "grid" | "list";
	budgetMode: BudgetMode;
};

export const defaultSettingsPagePalettes = {
	"/passwords": "teal",
	"/grocery": "yellow",
	"/baby-needs": "blue",
	"/budget": "orange",
} satisfies Record<NavigationHref, NamedPagePalette>;

export const defaultSettings: AppSettings = {
	desktopNavigation: "floating",
	navigationOrder: navigationItems.map(({ href }) => href),
	pagePalettes: { ...defaultSettingsPagePalettes },
	passwordView: "grid",
	budgetMode: "monthly",
};

export function normalizeAppSettings(value: unknown): AppSettings {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return defaultSettings;
	const saved = value as Partial<AppSettings>;
	const allowedHrefs = navigationItems.map(({ href }) => href);
	const savedOrder = Array.isArray(saved.navigationOrder)
		? saved.navigationOrder.filter((href): href is NavigationHref => allowedHrefs.includes(href as NavigationHref))
		: [];
	const order = [...new Set(savedOrder)];
	const savedPalettes = typeof saved.pagePalettes === "object" && saved.pagePalettes !== null
		? saved.pagePalettes as Partial<Record<NavigationHref, unknown>>
		: {};

	return {
		desktopNavigation: saved.desktopNavigation === "sidebar" ? "sidebar" : "floating",
		navigationOrder: [...order, ...allowedHrefs.filter((href) => !order.includes(href))],
		pagePalettes: {
			"/passwords": isPagePalette(savedPalettes["/passwords"]) ? savedPalettes["/passwords"] : defaultSettings.pagePalettes["/passwords"],
			"/grocery": isPagePalette(savedPalettes["/grocery"]) ? savedPalettes["/grocery"] : defaultSettings.pagePalettes["/grocery"],
			"/baby-needs": isPagePalette(savedPalettes["/baby-needs"]) ? savedPalettes["/baby-needs"] : defaultSettings.pagePalettes["/baby-needs"],
			"/budget": isPagePalette(savedPalettes["/budget"]) ? savedPalettes["/budget"] : defaultSettings.pagePalettes["/budget"],
		},
		passwordView: saved.passwordView === "list" ? "list" : "grid",
		budgetMode: saved.budgetMode === "cutoff" ? "cutoff" : "monthly",
	};
}

export function parseAppSettings(value: unknown): AppSettings {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error("Invalid settings.");
	}

	const candidate = value as Record<string, unknown>;
	const allowedHrefs = navigationItems.map(({ href }) => href);
	if (candidate.desktopNavigation !== "sidebar" && candidate.desktopNavigation !== "floating") {
		throw new Error("Invalid desktop navigation setting.");
	}
	if (
		!Array.isArray(candidate.navigationOrder)
		|| candidate.navigationOrder.length !== allowedHrefs.length
		|| !candidate.navigationOrder.every((href) => allowedHrefs.includes(href as NavigationHref))
		|| new Set(candidate.navigationOrder).size !== allowedHrefs.length
	) {
		throw new Error("Invalid navigation order.");
	}
	if (candidate.passwordView !== "grid" && candidate.passwordView !== "list") {
		throw new Error("Invalid password view setting.");
	}
	if (candidate.budgetMode !== undefined && candidate.budgetMode !== "monthly" && candidate.budgetMode !== "cutoff") {
		throw new Error("Invalid budget mode setting.");
	}

	const palettes = candidate.pagePalettes;
	if (typeof palettes !== "object" || palettes === null || Array.isArray(palettes)) {
		throw new Error("Invalid page palette settings.");
	}
	const pagePalettes = palettes as Record<string, unknown>;
	for (const href of allowedHrefs) {
		if (!isPagePalette(pagePalettes[href])) throw new Error(`Invalid page palette for ${href}.`);
	}

	return {
		desktopNavigation: candidate.desktopNavigation,
		navigationOrder: candidate.navigationOrder as NavigationHref[],
		pagePalettes: {
			"/passwords": pagePalettes["/passwords"],
			"/grocery": pagePalettes["/grocery"],
			"/baby-needs": pagePalettes["/baby-needs"],
			"/budget": pagePalettes["/budget"],
		} as AppSettings["pagePalettes"],
		passwordView: candidate.passwordView,
		budgetMode: candidate.budgetMode === "cutoff" ? "cutoff" : "monthly",
	};
}
