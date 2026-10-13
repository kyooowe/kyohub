"use client";

import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPagePaletteStyles, type NamedPagePalette } from "@/components/settings/page-palettes";
import { navigationItems, useAppSettings, type NavigationHref } from "@/components/settings/settings-context";

export function FeatureSectionHeader({ icon: Icon, title, description, children, theme, mobileRow = false, usePagePalette = true, appearance = "standard", className = "" }: {
	icon: LucideIcon;
	title: string;
	description: string;
	children?: ReactNode;
	theme: Extract<NamedPagePalette, "violet" | "blue" | "teal" | "rose">;
	mobileRow?: boolean;
	usePagePalette?: boolean;
	appearance?: "standard" | "soft";
	className?: string;
}) {
	const pathname = usePathname();
	const { settings } = useAppSettings();
	const page = navigationItems.find(({ href }) => pathname.startsWith(href))?.href as NavigationHref | undefined;
	const palette = page ? settings.pagePalettes[page] : undefined;
	const paletteStyles = getPagePaletteStyles(usePagePalette && palette && palette !== "default" ? palette : theme);
	const colors = paletteStyles.featureHeader;
	const soft = appearance === "soft";
	const headerStyle = soft ? { "--password-accent": paletteStyles.accent } as CSSProperties : undefined;
	const headerClassName = soft
		? "password-library-header relative isolate flex items-center overflow-hidden rounded-3xl border px-4 py-4 text-slate-900 shadow-lg sm:px-5 sm:py-4"
		: `relative isolate flex items-center overflow-hidden rounded-2xl bg-linear-to-r ${colors.gradient} px-4 py-4 text-white shadow-lg ${colors.shadow} ${colors.darkShadow} sm:px-5 sm:py-5`;

	return <div style={headerStyle} className={`${headerClassName} ${className}`}>
		{soft
			? <span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-14 size-36 rounded-full" />
			: <>
				<div className="pointer-events-none absolute -right-8 -top-14 size-40 rounded-full border-20 border-white/5" />
				<div className={`pointer-events-none absolute right-20 -top-16 size-36 rounded-full ${colors.glow} blur-2xl`} />
			</>}
		<div className={`relative z-10 flex w-full ${mobileRow ? "flex-row items-center justify-between gap-2" : "flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"}`}>
			<div className={`flex min-w-0 items-center ${mobileRow ? "gap-2.5" : "gap-3.5"}`}>
				<span className={soft
					? `grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br ${paletteStyles.iconGradient} text-white shadow-md shadow-slate-900/10 ring-1 ring-inset ring-white/40`
					: "grid size-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 sm:size-11"}><Icon size={20} /></span>
				<div className="min-w-0">
					<h2 className={`text-base font-semibold ${soft ? "tracking-normal text-slate-900 dark:text-white sm:text-lg" : "tracking-tight text-white sm:text-lg"} ${mobileRow ? "truncate" : ""}`}>{title}</h2>
					<p className={`mt-1 text-xs ${soft ? "text-slate-600 dark:text-slate-300" : colors.description} ${mobileRow ? "truncate" : ""}`}>{description}</p>
				</div>
			</div>
			{children && <div className={`relative z-10 ${mobileRow ? "w-auto shrink-0" : "w-full sm:w-auto"}`}>{children}</div>}
		</div>
	</div>;
}
