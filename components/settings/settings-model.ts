import { isPagePalette, type PagePalette } from "@/components/settings/page-palettes";

export const navigationItems = [
	{ href: "/passwords", label: "Password manager" },
	{ href: "/grocery", label: "Grocery planner" },
	{ href: "/baby-needs", label: "Family Calendar" },
	{ href: "/budget", label: "Budget planner" },
] as const;

export type NavigationHref = (typeof navigationItems)[number]["href"];

export type AppSettings = {
	desktopNavigation: "sidebar" | "floating";
	navigationOrder: NavigationHref[];
	pagePalettes: Record<NavigationHref, PagePalette>;
	passwordView: "grid" | "list";
};

export const defaultSettings: AppSettings = {
	desktopNavigation: "sidebar",
	navigationOrder: navigationItems.map(({ href }) => href),
	pagePalettes: {
		"/passwords": "default",
		"/grocery": "default",
		"/baby-needs": "default",
		"/budget": "default",
	},
	passwordView: "grid",
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
		desktopNavigation: saved.desktopNavigation === "floating" ? "floating" : "sidebar",
		navigationOrder: [...order, ...allowedHrefs.filter((href) => !order.includes(href))],
		pagePalettes: {
			"/passwords": isPagePalette(savedPalettes["/passwords"]) ? savedPalettes["/passwords"] : "default",
			"/grocery": isPagePalette(savedPalettes["/grocery"]) ? savedPalettes["/grocery"] : "default",
			"/baby-needs": isPagePalette(savedPalettes["/baby-needs"]) ? savedPalettes["/baby-needs"] : "default",
			"/budget": isPagePalette(savedPalettes["/budget"]) ? savedPalettes["/budget"] : "default",
		},
		passwordView: saved.passwordView === "list" ? "list" : "grid",
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
	};
}
