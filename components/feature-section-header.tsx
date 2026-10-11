"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPagePaletteStyles, type NamedPagePalette } from "@/components/settings/page-palettes";
import { navigationItems, useAppSettings, type NavigationHref } from "@/components/settings/settings-context";

export function FeatureSectionHeader({ icon: Icon, title, description, children, theme, mobileRow = false }: {
	icon: LucideIcon;
	title: string;
	description: string;
	children?: ReactNode;
	theme: Extract<NamedPagePalette, "violet" | "blue" | "teal" | "rose">;
	mobileRow?: boolean;
}) {
	const pathname = usePathname();
	const { settings } = useAppSettings();
	const page = navigationItems.find(({ href }) => pathname.startsWith(href))?.href as NavigationHref | undefined;
	const palette = page ? settings.pagePalettes[page] : undefined;
	const colors = palette && palette !== "default"
		? getPagePaletteStyles(palette).featureHeader
		: getPagePaletteStyles(theme).featureHeader;

	return <div className={`relative isolate overflow-hidden rounded-2xl bg-linear-to-r ${colors.gradient} px-4 py-4 text-white shadow-lg ${colors.shadow} ${colors.darkShadow} sm:px-5 sm:py-5`}>
		<div className="pointer-events-none absolute -right-8 -top-14 size-40 rounded-full border-20 border-white/5" />
		<div className={`pointer-events-none absolute right-20 -top-16 size-36 rounded-full ${colors.glow} blur-2xl`} />
		<div className={`relative flex ${mobileRow ? "flex-row items-center justify-between gap-2" : "flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"}`}>
			<div className={`flex min-w-0 items-center ${mobileRow ? "gap-2.5" : "gap-3.5"}`}>
				<span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 sm:size-11"><Icon size={20} /></span>
				<div className="min-w-0">
					<h2 className={`text-base font-semibold tracking-tight text-white sm:text-lg ${mobileRow ? "truncate" : ""}`}>{title}</h2>
					<p className={`mt-1 text-xs ${colors.description} ${mobileRow ? "truncate" : ""}`}>{description}</p>
				</div>
			</div>
			{children && <div className={`relative ${mobileRow ? "w-auto shrink-0" : "w-full sm:w-auto"}`}>{children}</div>}
		</div>
	</div>;
}
