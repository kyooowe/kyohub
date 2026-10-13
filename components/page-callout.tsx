"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPagePaletteStyles, type NamedPagePalette } from "@/components/settings/page-palettes";
import { navigationItems, useAppSettings } from "@/components/settings/settings-context";

export function PageCallout({ icon: Icon, title, description, fallbackPalette, tone = "info" }: {
	icon: LucideIcon;
	title: string;
	description: string;
	fallbackPalette: NamedPagePalette;
	tone?: "info" | "warning";
}) {
	const pathname = usePathname();
	const { settings } = useAppSettings();
	const page = navigationItems.find(({ href }) => pathname.startsWith(href))?.href;
	const configuredPalette = page ? settings.pagePalettes[page] : "default";
	const paletteName = configuredPalette === "default" ? fallbackPalette : configuredPalette;
	const palette = getPagePaletteStyles(paletteName);
	const warning = tone === "warning";

	return (
		<div
			data-page-palette={paletteName}
			data-page-palette-card
			data-page-palette-callout
			role="note"
			style={{ "--page-accent-base": palette.accent } as CSSProperties}
			className={`page-callout relative isolate flex items-center gap-3 overflow-hidden rounded-3xl border px-4 py-4 sm:px-5 ${warning ? "page-callout--warning" : ""}`}
		>
			<span aria-hidden="true" className={`relative grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br ${palette.iconGradient} text-white shadow-sm`}>
				<Icon size={16} />
			</span>
			<div className="relative min-w-0">
				<p className="text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">{title}</p>
				<p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{description}</p>
			</div>
			<span
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-4 left-0 w-1 rounded-r-full"
				style={{ backgroundColor: palette.accent }}
			/>
			<span aria-hidden="true" className="pointer-events-none absolute -right-5 -top-10 size-28 rounded-full border border-white/70 bg-white/10 dark:border-white/5 dark:bg-white/[0.02]" />
		</div>
	);
}
