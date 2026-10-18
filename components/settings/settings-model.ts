import { isPagePalette, type NamedPagePalette, type PagePalette } from "@/components/settings/page-palettes";

export const navigationItems = [
	{ href: "/passwords", label: "Password manager" },
	{ href: "/grocery", label: "Grocery planner" },
	{ href: "/family-calendar", label: "Family Calendar" },
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
	"/family-calendar": "blue",
	"/budget": "orange",
} satisfies Record<NavigationHref, NamedPagePalette>;

export const defaultPagePalettes: Record<NavigationHref, NamedPagePalette> = {
	"/passwords": "violet",
	"/grocery": "blue",
	"/family-calendar": "teal",
	"/budget": "rose",
};

export function getActivePagePalette(pathname: string, settings: AppSettings): NamedPagePalette {
	const activeHref = pathname === "/" ? (settings.navigationOrder[0] ?? "/passwords") : pathname;
	const current = navigationItems.find((item) => activeHref.startsWith(item.href)) ?? navigationItems[0];
	const configured = settings.pagePalettes[current.href];
	return configured === "default" || !configured ? defaultPagePalettes[current.href] : configured;
}

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
		? saved.navigationOrder
				.map((href) => (href === ("/baby-needs" as NavigationHref) ? "/family-calendar" : href))
				.filter((href): href is NavigationHref => allowedHrefs.includes(href as NavigationHref))
		: [];
	const order = [...new Set(savedOrder)];
	const savedPalettes = typeof saved.pagePalettes === "object" && saved.pagePalettes !== null
		? saved.pagePalettes as Partial<Record<NavigationHref | "/baby-needs", unknown>>
		: {};
	const familyCalendarPalette = savedPalettes["/family-calendar"] ?? savedPalettes["/baby-needs"];

	return {
		desktopNavigation: saved.desktopNavigation === "sidebar" ? "sidebar" : "floating",
		navigationOrder: [...order, ...allowedHrefs.filter((href) => !order.includes(href))],
		pagePalettes: {
			"/passwords": isPagePalette(savedPalettes["/passwords"]) ? savedPalettes["/passwords"] : defaultSettings.pagePalettes["/passwords"],
			"/grocery": isPagePalette(savedPalettes["/grocery"]) ? savedPalettes["/grocery"] : defaultSettings.pagePalettes["/grocery"],
			"/family-calendar": isPagePalette(familyCalendarPalette) ? familyCalendarPalette : defaultSettings.pagePalettes["/family-calendar"],
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
	if (Array.isArray(candidate.navigationOrder)) {
		candidate.navigationOrder = candidate.navigationOrder.map((href) => href === "/baby-needs" ? "/family-calendar" : href);
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
	if ("/baby-needs" in pagePalettes && !("/family-calendar" in pagePalettes)) {
		pagePalettes["/family-calendar"] = pagePalettes["/baby-needs"];
	}
	for (const href of allowedHrefs) {
		if (!isPagePalette(pagePalettes[href])) throw new Error(`Invalid page palette for ${href}.`);
	}

	return {
		desktopNavigation: candidate.desktopNavigation,
		navigationOrder: candidate.navigationOrder as NavigationHref[],
		pagePalettes: {
			"/passwords": pagePalettes["/passwords"],
			"/grocery": pagePalettes["/grocery"],
			"/family-calendar": pagePalettes["/family-calendar"],
			"/budget": pagePalettes["/budget"],
		} as AppSettings["pagePalettes"],
		passwordView: candidate.passwordView,
		budgetMode: candidate.budgetMode === "cutoff" ? "cutoff" : "monthly",
	};
}
