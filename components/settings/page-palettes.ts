const pagePaletteStyles = {
	violet: {
		label: "Violet",
		swatch: "bg-[#d4bfd0]",
		iconGradient: "from-violet-600 to-fuchsia-500",
		passwordHeading: "from-violet-900 via-violet-800 to-fuchsia-700 dark:from-slate-100 dark:via-violet-200 dark:to-fuchsia-300",
		featureHeader: {
			gradient: "from-violet-800 via-violet-700 to-fuchsia-700",
			shadow: "shadow-violet-300/30",
			darkShadow: "dark:shadow-violet-950/60",
			description: "text-violet-100/85",
			glow: "bg-fuchsia-200/15",
		},
	},
	blue: {
		label: "Blue",
		swatch: "bg-[#b9d6eb]",
		iconGradient: "from-blue-500 to-cyan-400",
		passwordHeading: "from-slate-900 via-blue-950 to-blue-700 dark:from-slate-100 dark:via-blue-200 dark:to-blue-400",
		featureHeader: {
			gradient: "from-blue-800 via-indigo-800 to-violet-800",
			shadow: "shadow-blue-300/30",
			darkShadow: "dark:shadow-blue-950/60",
			description: "text-blue-100/85",
			glow: "bg-violet-200/15",
		},
	},
	teal: {
		label: "Teal",
		swatch: "bg-[#b2d8d3]",
		iconGradient: "from-emerald-500 to-teal-400",
		passwordHeading: "from-slate-900 via-teal-950 to-teal-700 dark:from-slate-100 dark:via-teal-200 dark:to-teal-400",
		featureHeader: {
			gradient: "from-teal-800 via-teal-700 to-cyan-700",
			shadow: "shadow-teal-300/30",
			darkShadow: "dark:shadow-teal-950/60",
			description: "text-teal-100/85",
			glow: "bg-cyan-200/15",
		},
	},
	rose: {
		label: "Rose",
		swatch: "bg-[#e3c1ad]",
		iconGradient: "from-orange-500 to-rose-400",
		passwordHeading: "from-slate-900 via-rose-950 to-rose-700 dark:from-slate-100 dark:via-rose-200 dark:to-rose-400",
		featureHeader: {
			gradient: "from-rose-800 via-rose-700 to-orange-700",
			shadow: "shadow-rose-300/30",
			darkShadow: "dark:shadow-rose-950/60",
			description: "text-rose-100/85",
			glow: "bg-orange-200/15",
		},
	},
	yellow: {
		label: "Yellow",
		swatch: "bg-[#efe3a0]",
		iconGradient: "from-yellow-500 to-amber-400",
		passwordHeading: "from-slate-900 via-amber-950 to-yellow-700 dark:from-slate-100 dark:via-yellow-200 dark:to-amber-400",
		featureHeader: {
			gradient: "from-amber-800 via-yellow-700 to-orange-700",
			shadow: "shadow-yellow-300/30",
			darkShadow: "dark:shadow-yellow-950/60",
			description: "text-yellow-100/90",
			glow: "bg-amber-200/20",
		},
	},
	orange: {
		label: "Orange",
		swatch: "bg-[#edc19e]",
		iconGradient: "from-orange-500 to-amber-400",
		passwordHeading: "from-slate-900 via-orange-950 to-orange-700 dark:from-slate-100 dark:via-orange-200 dark:to-amber-400",
		featureHeader: {
			gradient: "from-orange-800 via-orange-700 to-amber-700",
			shadow: "shadow-orange-300/30",
			darkShadow: "dark:shadow-orange-950/60",
			description: "text-orange-100/90",
			glow: "bg-amber-200/20",
		},
	},
	gray: {
		label: "Grey",
		swatch: "bg-[#cbd0d8]",
		iconGradient: "from-slate-500 to-gray-400",
		passwordHeading: "from-slate-900 via-gray-800 to-slate-600 dark:from-slate-100 dark:via-gray-200 dark:to-slate-400",
		featureHeader: {
			gradient: "from-slate-800 via-slate-700 to-gray-700",
			shadow: "shadow-slate-300/30",
			darkShadow: "dark:shadow-slate-950/60",
			description: "text-slate-100/85",
			glow: "bg-gray-200/15",
		},
	},
} as const;

export type NamedPagePalette = keyof typeof pagePaletteStyles;
export type PagePalette = "default" | NamedPagePalette;

export const pagePaletteOptions: { value: NamedPagePalette; label: string; swatch: string }[] = [
	{ value: "violet", label: pagePaletteStyles.violet.label, swatch: pagePaletteStyles.violet.swatch },
	{ value: "blue", label: pagePaletteStyles.blue.label, swatch: pagePaletteStyles.blue.swatch },
	{ value: "teal", label: pagePaletteStyles.teal.label, swatch: pagePaletteStyles.teal.swatch },
	{ value: "rose", label: pagePaletteStyles.rose.label, swatch: pagePaletteStyles.rose.swatch },
	{ value: "yellow", label: pagePaletteStyles.yellow.label, swatch: pagePaletteStyles.yellow.swatch },
	{ value: "orange", label: pagePaletteStyles.orange.label, swatch: pagePaletteStyles.orange.swatch },
	{ value: "gray", label: pagePaletteStyles.gray.label, swatch: pagePaletteStyles.gray.swatch },
];

export function isPagePalette(value: unknown): value is PagePalette {
	return value === "default" || (typeof value === "string" && Object.prototype.hasOwnProperty.call(pagePaletteStyles, value));
}

export function getPagePaletteStyles(palette: NamedPagePalette) {
	return pagePaletteStyles[palette];
}
