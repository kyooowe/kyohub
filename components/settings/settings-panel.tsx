"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { usePathname } from "next/navigation";
import { Baby, Bell, CalendarDays, ChartNoAxesColumn, Check, ChevronDown, ChevronRight, Cloud, CloudSun, Handshake, Heart, House, KeyRound, LaptopMinimal, Layers, LayoutGrid, List, Moon, Mountain, Palette, ReceiptText, RotateCcw, Settings2, ShoppingCart, Sparkles, Sprout, Sun, Sunrise, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { setDarkMode, useDarkModePreference } from "@/components/theme-toggle";
import { FamilyReminderSettings } from "@/features/family-calendar/components/family-reminder-settings";
import { defaultSettings, defaultSettingsPagePalettes, getActivePagePalette } from "@/components/settings/settings-model";
import { navigationItems, useAppSettings, type NavigationHref } from "@/components/settings/settings-context";
import { getPagePaletteStyles, pagePaletteOptions, type NamedPagePalette } from "@/components/settings/page-palettes";

const navigationVisuals: Record<NavigationHref, { icon: LucideIcon; color: string }> = {
	"/passwords": { icon: KeyRound, color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
	"/grocery": { icon: ShoppingCart, color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
	"/family-calendar": { icon: CalendarDays, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
	"/budget": { icon: ChartNoAxesColumn, color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
	"/baby-tracker": { icon: Baby, color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
};

const paletteOptionDetails: Partial<Record<NamedPagePalette, { icon: LucideIcon; description: string; tone: string; iconColor: string }>> = {
	kyohub: { icon: Sprout, description: "Official KyoHub teal and midnight navy tones.", tone: "KyoHub teal", iconColor: "text-[#17756D]" },
	violet: { icon: Heart, description: "Gentle, cool tones for a calm workspace.", tone: "Soft purple", iconColor: "text-[#654878]" },
	blue: { icon: CloudSun, description: "Bright, calm blues for a clear view.", tone: "A softer blue", iconColor: "text-[#426f8a]" },
	teal: { icon: Sprout, description: "Natural, peaceful greens.", tone: "Muted botanical", iconColor: "text-[#466044]" },
	rose: { icon: Handshake, description: "Warm, personal earthy tones.", tone: "An earthy red", iconColor: "text-[#995c49]" },
	yellow: { icon: Sun, description: "Cheerful, soft sunshine.", tone: "Creamy yellow", iconColor: "text-[#80631c]" },
	orange: { icon: Sunrise, description: "Friendly, warm color.", tone: "A soft peach", iconColor: "text-[#8d5735]" },
	gray: { icon: House, description: "Minimal, neutral tones.", tone: "A warm gray", iconColor: "text-[#55534d]" },
	mint: { icon: Sprout, description: "Fresh, gentle green tones.", tone: "Fresh mint", iconColor: "text-[#285d42]" },
	coral: { icon: Sun, description: "Bright, lively warm tones.", tone: "Warm coral", iconColor: "text-[#963f38]" },
	berry: { icon: Heart, description: "Rich, playful pink tones.", tone: "Soft berry", iconColor: "text-[#78324f]" },
	ocean: { icon: CloudSun, description: "Cool, refreshing blue-green tones.", tone: "Sea glass", iconColor: "text-[#205653]" },
	honeyGold: { icon: Sun, description: "Warm, golden tones with a soft glow.", tone: "Honey gold", iconColor: "text-[#71501c]" },
	berryRose: { icon: Heart, description: "Soft rosy tones with a rich berry accent.", tone: "Berry rose", iconColor: "text-[#642b40]" },
	mistyBlue: { icon: CloudSun, description: "Soft blue tones for a calm, airy feel.", tone: "Misty blue", iconColor: "text-[#29466b]" },
	warmSand: { icon: House, description: "Warm neutral tones inspired by natural sand.", tone: "Warm sand", iconColor: "text-[#59402d]" },
	dustyLavender: { icon: Heart, description: "Muted lavender tones with a gentle warmth.", tone: "Dusty lavender", iconColor: "text-[#49365f]" },
	oliveCream: { icon: Sprout, description: "Soft olive greens with a creamy finish.", tone: "Olive cream", iconColor: "text-[#3f4927]" },
	buttercream: { icon: Sun, description: "Soft buttery yellow tones.", tone: "Buttercream pastel", iconColor: "text-[#74551f]" },
	powderLilac: { icon: Heart, description: "Light lavender tones with a powdery finish.", tone: "Powder lilac pastel", iconColor: "text-[#4d3a70]" },
	mintCloud: { icon: Sprout, description: "Light, airy mint-green tones.", tone: "Mint cloud pastel", iconColor: "text-[#285743]" },
	pinkCloud: { icon: Heart, description: "Soft pink tones with a gentle warmth.", tone: "Pink cloud pastel", iconColor: "text-[#713047]" },
	babyBlue: { icon: CloudSun, description: "Light, airy blue tones.", tone: "Baby blue pastel", iconColor: "text-[#2f5278]" },
	apricotCream: { icon: Sunrise, description: "Soft peachy tones with a creamy finish.", tone: "Apricot cream pastel", iconColor: "text-[#77452c]" },
	pastelHorizon: { icon: Mountain, description: "Dreamy periwinkle, ethereal lavender, and blush pink tones.", tone: "Pastel horizon", iconColor: "text-[#7967A8]" },
	pastelAurora: { icon: Sparkles, description: "Celestial periwinkle, mystic lilac, and aurora rose.", tone: "Pastel aurora", iconColor: "text-[#655896]" },
	pastelDawn: { icon: Sunrise, description: "Warm peach dawn, petal rose, and misty lavender.", tone: "Pastel dawn", iconColor: "text-[#9B536E]" },
	pastelMist: { icon: Cloud, description: "Powdery periwinkle and soft morning mountain mist.", tone: "Pastel mist", iconColor: "text-[#5F568C]" },
	blushPeriwinkle: { icon: Layers, description: "Translucent rose quartz, mauve, and soft periwinkle.", tone: "Blush periwinkle", iconColor: "text-[#964264]" },
};

function SectionHeading({
	icon: Icon,
	title,
	description,
	accentColor,
}: {
	icon: LucideIcon;
	title: string;
	description: string;
	accentColor: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<span
				className="grid size-8 shrink-0 place-items-center rounded-xl transition-colors"
				style={{
					backgroundColor: `color-mix(in oklab, ${accentColor} 16%, transparent)`,
					color: accentColor,
				}}
			>
				<Icon size={16} />
			</span>
			<div className="min-w-0">
				<h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
				<p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
			</div>
		</div>
	);
}

function SettingsSection({
	value,
	icon,
	title,
	description,
	accentColor,
	children,
}: {
	value: string;
	icon: LucideIcon;
	title: string;
	description: string;
	accentColor: string;
	children: React.ReactNode;
}) {
	return (
		<AccordionItem value={value} className="border-b-0">
			<AccordionHeader>
				<AccordionTrigger className="px-2">
					<SectionHeading icon={icon} title={title} description={description} accentColor={accentColor} />
					<ChevronDown size={17} className="shrink-0 text-slate-400 transition-transform duration-200 group-data-panel-open:rotate-180 dark:text-slate-500" />
				</AccordionTrigger>
			</AccordionHeader>
			<AccordionPanel><div className="space-y-3">{children}</div></AccordionPanel>
		</AccordionItem>
	);
}

export function SettingsPanel({ trigger, compact = false }: { trigger: "sidebar" | "header" | "floating"; compact?: boolean }) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [confirmRestore, setConfirmRestore] = useState(false);
	const [restoreNotice, setRestoreNotice] = useState(false);
	const [draggingHref, setDraggingHref] = useState<NavigationHref | null>(null);
	const { settings, updateSettings, saveError } = useAppSettings();
	const activePalette = getActivePagePalette(pathname, settings);
	const paletteStyles = getPagePaletteStyles(activePalette);
	const paletteAccent = paletteStyles.accent;
	const isDarkMode = useDarkModePreference();
	const navigationListRef = useRef<HTMLDivElement>(null);
	const navigationItemRefs = useRef<Partial<Record<NavigationHref, HTMLDivElement>>>({});
	const activePointer = useRef<{ href: NavigationHref; pointerId: number } | null>(null);
	const previousItemPositions = useRef<Map<NavigationHref, number> | null>(null);
	const restoreNoticeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => () => {
		if (restoreNoticeTimeout.current) clearTimeout(restoreNoticeTimeout.current);
	}, []);
	useLayoutEffect(() => {
		const previous = previousItemPositions.current;
		if (!previous) return;
		previousItemPositions.current = null;

		for (const [href, element] of Object.entries(navigationItemRefs.current) as [NavigationHref, HTMLDivElement][]) {
			if (href === draggingHref) {
				element.style.transition = "none";
				element.style.translate = "";
				requestAnimationFrame(() => {
					element.style.transition = "";
				});
				continue;
			}
			const oldTop = previous.get(href);
			if (oldTop === undefined) continue;
			const offset = oldTop - element.getBoundingClientRect().top;
			if (!offset) continue;
			element.style.transition = "none";
			element.style.translate = `0 ${offset}px`;
			requestAnimationFrame(() => {
				element.style.transition = "translate 180ms cubic-bezier(0.2, 0, 0, 1)";
				element.style.translate = "";
			});
		}
	}, [draggingHref, settings.navigationOrder]);

	function moveNavigationItem(href: NavigationHref, direction: -1 | 1) {
		updateSettings((current) => {
			const from = current.navigationOrder.indexOf(href);
			const to = from + direction;
			if (from < 0 || to < 0 || to >= current.navigationOrder.length) return current;
			const navigationOrder = [...current.navigationOrder];
			navigationOrder.splice(from, 1);
			navigationOrder.splice(to, 0, href);
			return { ...current, navigationOrder };
		});
	}

	function moveNavigationItemTo(href: NavigationHref, target: NavigationHref) {
		updateSettings((current) => {
			const from = current.navigationOrder.indexOf(href);
			const to = current.navigationOrder.indexOf(target);
			if (from < 0 || to < 0 || from === to) return current;
			previousItemPositions.current = new Map(
				current.navigationOrder.flatMap((itemHref) => {
					const element = navigationItemRefs.current[itemHref];
					return element ? [[itemHref, element.getBoundingClientRect().top] as const] : [];
				}),
			);
			const navigationOrder = [...current.navigationOrder];
			navigationOrder.splice(from, 1);
			navigationOrder.splice(to, 0, href);
			return { ...current, navigationOrder };
		});
	}

	function handleNavigationDrag(event: ReactPointerEvent<HTMLDivElement>) {
		const active = activePointer.current;
		const bounds = navigationListRef.current?.getBoundingClientRect();
		if (!active || active.pointerId !== event.pointerId || !bounds) return;
		if (event.clientY < bounds.top || event.clientY > bounds.bottom) return;

		const target = settings.navigationOrder.reduce<{
			href: NavigationHref | null;
			distance: number;
		}>((closest, href) => {
			const element = navigationItemRefs.current[href];
			if (!element) return closest;
			const center = bounds.top + element.offsetTop + element.offsetHeight / 2;
			const distance = Math.abs(event.clientY - center);
			return distance < closest.distance ? { href, distance } : closest;
		}, { href: null, distance: Number.POSITIVE_INFINITY }).href;

		if (target) moveNavigationItemTo(active.href, target);
	}

	function finishNavigationDrag(pointerId: number) {
		if (activePointer.current?.pointerId !== pointerId) return;
		activePointer.current = null;
		setDraggingHref(null);
	}

	function handleNavigationKeyDown(event: ReactKeyboardEvent<HTMLDivElement>, href: NavigationHref) {
		if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
		event.preventDefault();
		moveNavigationItem(href, event.key === "ArrowUp" ? -1 : 1);
	}

	return <>
		<Button
			type="button"
			variant="ghost"
			size={trigger === "sidebar" ? "default" : compact ? "icon-sm" : "icon"}
			className={trigger === "sidebar"
				? "hidden min-h-11 w-full justify-start gap-3 rounded-md bg-transparent px-3 text-slate-200/80 transition-colors hover:bg-white/5 hover:text-white md:flex"
				: trigger === "header"
					? "size-9 justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
					: compact
					? "floating-navigation-action relative z-10 grid size-9 shrink-0 place-items-center justify-self-center rounded-full transition-colors"
					: "floating-navigation-action relative z-10 grid size-11 shrink-0 place-items-center rounded-full transition-colors"}
			style={trigger === "header" ? { color: paletteAccent } : undefined}
			aria-label={trigger === "sidebar" ? undefined : "Open settings"}
			onClick={() => setOpen(true)}
		>
			<Settings2 size={18} />{trigger === "sidebar" && "Settings"}
		</Button>
		<Dialog open={open} onOpenChange={(nextOpen) => {
			setOpen(nextOpen);
			if (!nextOpen) {
				setConfirmRestore(false);
				setRestoreNotice(false);
				if (restoreNoticeTimeout.current) {
					clearTimeout(restoreNoticeTimeout.current);
					restoreNoticeTimeout.current = null;
				}
			}
		}}>
			<DialogContent
				pagePalette={activePalette}
				data-page-palette-surface
				className="palette-dialog-panel flex max-h-[min(90dvh,52rem)] max-w-2xl flex-col overflow-hidden rounded-2xl border bg-white p-0 dark:border-slate-800 dark:bg-slate-950"
				style={{
					borderColor: `color-mix(in oklab, ${paletteAccent} 35%, transparent)`,
					"--page-accent-base": paletteAccent,
					"--action-accent": paletteAccent,
				} as CSSProperties}
			>
				<div className="shrink-0">
					<PaletteDialogHeader eyebrow="KYOHUB PREFERENCES" title="Settings" description="Personalize how Kyohub looks and works." icon={<Settings2 size={18} />} closeLabel="Close settings" />
				</div>
				<div
					className="settings-dialog-scroll min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6 dark:bg-slate-950"
					style={{
						backgroundColor: `color-mix(in oklab, ${paletteAccent} 3.5%, white)`,
					}}
				>
					{saveError && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">{saveError}</p>}

					<Accordion multiple className="space-y-2">
					<SettingsSection value="appearance" icon={Sun} title="Appearance" description="Choose how Kyohub looks and feels." accentColor={paletteAccent}>
						<div className="mx-2 grid gap-2 sm:mx-4 sm:grid-cols-2">
							<button
								type="button"
								aria-pressed={isDarkMode}
								onClick={() => setDarkMode(true)}
								className={`flex min-w-0 items-center gap-2 rounded-xl border p-2 text-left transition-all ${isDarkMode ? "shadow-sm ring-1" : "border-slate-100 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}
								style={isDarkMode ? {
									borderColor: `color-mix(in oklab, ${paletteAccent} 55%, transparent)`,
									backgroundColor: `color-mix(in oklab, ${paletteAccent} 10%, transparent)`,
									boxShadow: `0 1px 3px color-mix(in oklab, ${paletteAccent} 25%, transparent)`,
									outlineColor: paletteAccent,
								} : undefined}
							>
								<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-linear-to-br from-slate-950 to-indigo-950 text-amber-200 shadow-inner shadow-black/30"><Moon size={17} /></span>
								<span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">Dark mode</span><span className="mt-0.5 block text-[10px] leading-3.5 text-slate-500 dark:text-slate-400">Reduce eye strain at night.</span></span>
								<span
									className={`grid size-4 shrink-0 place-items-center rounded-full border ${isDarkMode ? "text-white" : "border-slate-300 dark:border-slate-600"}`}
									style={isDarkMode ? { backgroundColor: paletteAccent, borderColor: paletteAccent } : undefined}
								>{isDarkMode && <Check size={11} strokeWidth={3} />}</span>
							</button>
							<button
								type="button"
								aria-pressed={!isDarkMode}
								onClick={() => setDarkMode(false)}
								className={`flex min-w-0 items-center gap-2 rounded-xl border p-2 text-left transition-all ${!isDarkMode ? "shadow-sm ring-1" : "border-slate-100 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}
								style={!isDarkMode ? {
									borderColor: `color-mix(in oklab, ${paletteAccent} 55%, transparent)`,
									backgroundColor: `color-mix(in oklab, ${paletteAccent} 10%, transparent)`,
									boxShadow: `0 1px 3px color-mix(in oklab, ${paletteAccent} 25%, transparent)`,
									outlineColor: paletteAccent,
								} : undefined}
							>
								<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-linear-to-br from-sky-50 to-blue-100 text-blue-700 shadow-inner shadow-blue-200/60 dark:from-slate-800 dark:to-slate-700 dark:text-sky-300"><Sun size={17} /></span>
								<span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">Light mode</span><span className="mt-0.5 block text-[10px] leading-3.5 text-slate-500 dark:text-slate-400">Keep things bright and clean.</span></span>
								<span
									className={`grid size-4 shrink-0 place-items-center rounded-full border ${!isDarkMode ? "text-white" : "border-slate-300 dark:border-slate-600"}`}
									style={!isDarkMode ? { backgroundColor: paletteAccent, borderColor: paletteAccent } : undefined}
								>{!isDarkMode && <Check size={11} strokeWidth={3} />}</span>
							</button>
						</div>
						<button
							type="button"
							role="switch"
							aria-checked={settings.desktopNavigation === "floating"}
							onClick={() => updateSettings((current) => ({ ...current, desktopNavigation: current.desktopNavigation === "floating" ? "sidebar" : "floating" }))}
							className="mx-2 hidden w-[calc(100%-1rem)] items-center gap-2 rounded-xl border p-2 text-left transition-colors md:flex sm:mx-4 sm:w-[calc(100%-2rem)]"
							style={{
								borderColor: `color-mix(in oklab, ${paletteAccent} 24%, transparent)`,
								backgroundColor: `color-mix(in oklab, ${paletteAccent} 7%, transparent)`,
							}}
						>
							<span
								className="grid size-8 shrink-0 place-items-center rounded-lg"
								style={{
									backgroundColor: `color-mix(in oklab, ${paletteAccent} 16%, transparent)`,
									color: paletteAccent,
								}}
							>
								<LaptopMinimal size={15} />
							</span>
							<span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">Floating navigation on desktop</span><span className="block text-[10px] text-slate-500 dark:text-slate-400">Mobile navigation always stays floating.</span></span>
							<span
								className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
								style={{
									backgroundColor: settings.desktopNavigation === "floating" ? paletteAccent : undefined,
								}}
							>
								<span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${settings.desktopNavigation === "floating" ? "translate-x-4" : "translate-x-0.5"}`} />
							</span>
						</button>
					</SettingsSection>

					<SettingsSection value="navigation" icon={List} title="Navigation order" description="Hold and drag an item to reorder. Focus an item and use the arrow keys to move it." accentColor={paletteAccent}>
						<div ref={navigationListRef} role="list" className="relative mx-2 space-y-2 sm:mx-4">
							{settings.navigationOrder.map((href) => {
								const item = navigationItems.find((entry) => entry.href === href);
								if (!item) return null;
								const { icon: Icon, color } = navigationVisuals[href];
								return <div
									key={href}
									role="listitem"
									tabIndex={0}
									aria-roledescription="sortable item"
									ref={(element) => {
										if (element) navigationItemRefs.current[href] = element;
										else delete navigationItemRefs.current[href];
									}}
									onPointerDown={(event) => {
										if (event.button !== 0) return;
										event.preventDefault();
										activePointer.current = { href, pointerId: event.pointerId };
										event.currentTarget.setPointerCapture(event.pointerId);
										setDraggingHref(href);
									}}
									onPointerMove={handleNavigationDrag}
									onPointerUp={(event) => finishNavigationDrag(event.pointerId)}
									onPointerCancel={(event) => finishNavigationDrag(event.pointerId)}
									onKeyDown={(event) => handleNavigationKeyDown(event, href)}
									className={`flex touch-none cursor-grab items-center justify-between gap-3 rounded-xl border px-3 py-2 outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out active:cursor-grabbing ${draggingHref === href
										? "scale-[1.01] shadow-md dark:shadow-black/20"
										: "border-slate-100 bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"}`}
									style={draggingHref === href ? {
										borderColor: `color-mix(in oklab, ${paletteAccent} 55%, transparent)`,
										backgroundColor: `color-mix(in oklab, ${paletteAccent} 10%, transparent)`,
									} : undefined}
								>
									<span className="flex min-w-0 items-center gap-2.5"><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${color}`}><Icon size={16} /></span><span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{item.label}</span></span>
									<ChevronRight aria-hidden="true" size={16} className="shrink-0 rotate-90 text-slate-300 dark:text-slate-600" />
								</div>;
							})}
						</div>
					</SettingsSection>

					<SettingsSection value="colors" icon={Palette} title="Page colors" description="Choose the accent color for each page’s section headers." accentColor={paletteAccent}>
						<div className="mx-2 grid gap-3 sm:mx-4 sm:grid-cols-2">
							{navigationItems.map(({ href, label }) => {
								const { icon: Icon } = navigationVisuals[href];
								const palette = settings.pagePalettes[href];
								const originalPalette = defaultSettingsPagePalettes[href];
								const originalPaletteStyles = getPagePaletteStyles(originalPalette);
								const swatch = palette === "default" ? originalPaletteStyles.iconGradient : getPagePaletteStyles(palette).iconGradient;
								const paletteChoices = [
									{ value: "default" as const, label: "Original", swatch: `bg-linear-to-br ${originalPaletteStyles.iconGradient}` },
									...pagePaletteOptions,
								];
								return <Popover key={href}>
									<PopoverTrigger
										type="button"
										aria-label={`Choose ${label} page color`}
										title={`Choose ${label} page color`}
										className="flex min-h-12 w-full items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-800 shadow-sm shadow-slate-950/[0.03] transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700"
										style={{ outlineColor: paletteAccent }}
									>
										<span className={`grid size-8 shrink-0 place-items-center rounded-full bg-linear-to-br ${swatch} text-white shadow-sm`}><Icon size={15} /></span>
										<span className="min-w-0 flex-1 truncate">{label}</span>
										<span
											className={`grid size-5 shrink-0 place-items-center rounded-full ${palette !== "default" ? "" : "text-slate-400 dark:text-slate-500"}`}
											style={palette !== "default" ? {
												backgroundColor: `color-mix(in oklab, ${paletteAccent} 18%, transparent)`,
												color: paletteAccent,
											} : undefined}
										>
											{palette !== "default" ? <Check size={12} /> : <ChevronRight size={16} />}
										</span>
									</PopoverTrigger>
									<PopoverContent align="start" className="max-h-[min(var(--available-height),50dvh,28rem)] max-w-[var(--available-width)] w-72 overscroll-contain overflow-y-auto p-2">
										<p className="px-2 pb-2 pt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">Choose a color</p>
										<div className="space-y-1">
											{paletteChoices.map((option) => {
												const details = option.value === "default"
													? { icon: Icon, description: "Keep this page’s original accent colors.", tone: "Original colors", iconColor: paletteOptionDetails[originalPalette]?.iconColor ?? "text-slate-700" }
													: (paletteOptionDetails[option.value] ?? { icon: Sun, description: `${option.label} theme tones.`, tone: option.label, iconColor: "text-slate-700" });
												const OptionIcon = details.icon;
												const gradient = option.value === "default" ? originalPaletteStyles.iconGradient : getPagePaletteStyles(option.value).iconGradient;
												return <PopoverClose
													key={option.value}
													type="button"
													aria-label={`${option.label} palette${option.value === "default" ? ` for ${label}` : ""}`}
													aria-pressed={palette === option.value}
													title={`${option.label} palette`}
													className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 ${palette === option.value ? "shadow-sm" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/80"}`}
													style={palette === option.value ? {
														borderColor: `color-mix(in oklab, ${paletteAccent} 50%, transparent)`,
														backgroundColor: `color-mix(in oklab, ${paletteAccent} 12%, transparent)`,
													} : undefined}
													onClick={() => updateSettings((current) => ({
														...current,
														pagePalettes: { ...current.pagePalettes, [href]: option.value },
													}))}
												>
													<span className={`grid size-11 shrink-0 place-items-center rounded-xl ${option.swatch} ${details.iconColor}`}>
														<OptionIcon size={19} strokeWidth={1.8} />
													</span>
													<span className="min-w-0 flex-1">
														<span className="flex items-center justify-between gap-2">
															<span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{option.label}</span>
															<span
																className={`grid size-5 shrink-0 place-items-center rounded-full ${palette === option.value ? "" : "text-transparent"}`}
																style={palette === option.value ? {
																	backgroundColor: `color-mix(in oklab, ${paletteAccent} 20%, transparent)`,
																	color: paletteAccent,
																} : undefined}
															>
																{palette === option.value && <Check size={12} strokeWidth={2.5} />}
															</span>
														</span>
														<span className="mt-0.5 block truncate text-[10px] leading-4 text-slate-500 dark:text-slate-400">{details.description}</span>
														<span className="mt-1.5 flex items-center gap-2">
															<span className={`h-1.5 flex-1 rounded-full bg-linear-to-r ${gradient}`} />
															<span className="shrink-0 text-[9px] font-medium text-slate-400 dark:text-slate-500">{details.tone}</span>
														</span>
													</span>
												</PopoverClose>;
											})}
										</div>
									</PopoverContent>
								</Popover>;
							})}
						</div>
					</SettingsSection>

					<SettingsSection value="passwords" icon={KeyRound} title="Password manager" description="Choose your default password layout." accentColor={paletteAccent}>
						<fieldset className="mx-2 grid gap-2 sm:mx-4 sm:grid-cols-2">
							{(["grid", "list"] as const).map((view) => {
								const selected = settings.passwordView === view;
								const Icon = view === "grid" ? LayoutGrid : List;
								return <label
									key={view}
									className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-xl border p-2 text-left transition-all ${selected ? "shadow-sm ring-1" : "border-slate-100 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}
									style={selected ? {
										borderColor: `color-mix(in oklab, ${paletteAccent} 55%, transparent)`,
										backgroundColor: `color-mix(in oklab, ${paletteAccent} 10%, transparent)`,
										boxShadow: `0 1px 3px color-mix(in oklab, ${paletteAccent} 25%, transparent)`,
									} : undefined}
								>
									<input type="radio" name="default-password-view" value={view} checked={selected} onChange={() => updateSettings((current) => ({ ...current, passwordView: view }))} className="sr-only" />
									<span
										className="grid size-10 shrink-0 place-items-center rounded-lg"
										style={selected ? {
											backgroundColor: `color-mix(in oklab, ${paletteAccent} 16%, transparent)`,
											color: paletteAccent,
										} : { backgroundColor: "rgb(241 245 249)", color: "rgb(71 85 105)" }}
									>
										<Icon size={17} />
									</span>
									<span className="min-w-0 flex-1">
										<span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">{view === "grid" ? "Card view" : "List view"}</span>
										<span className="mt-0.5 block text-[10px] leading-3.5 text-slate-500 dark:text-slate-400">{view === "grid" ? "Display passwords as cards." : "Display passwords in compact rows."}</span>
									</span>
									<span
										className={`grid size-4 shrink-0 place-items-center rounded-full border ${selected ? "text-white" : "border-slate-300 dark:border-slate-600"}`}
										style={selected ? { backgroundColor: paletteAccent, borderColor: paletteAccent } : undefined}
									>{selected && <Check size={11} strokeWidth={3} />}</span>
								</label>;
							})}
						</fieldset>
					</SettingsSection>

					<SettingsSection value="budget" icon={ChartNoAxesColumn} title="Budget Planner" description="Choose how you set and track your budget." accentColor={paletteAccent}>
						<fieldset className="mx-2 grid gap-2 sm:mx-4 sm:grid-cols-2">
							{([
								{ mode: "cutoff" as const, title: "Set budget per cutoff", description: "Set individual budgets for each cutoff (5, 15, 20, 30)." },
								{ mode: "monthly" as const, title: "Set budget monthly", description: "Set one total budget for the whole month." },
							]).map(({ mode, title, description }) => {
								const selected = (settings.budgetMode ?? "monthly") === mode;
								const Icon = mode === "monthly" ? CalendarDays : ReceiptText;
								return <label
									key={mode}
									className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-xl border p-2 text-left transition-all ${selected ? "shadow-sm ring-1" : "border-slate-100 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}
									style={selected ? {
										borderColor: `color-mix(in oklab, ${paletteAccent} 55%, transparent)`,
										backgroundColor: `color-mix(in oklab, ${paletteAccent} 10%, transparent)`,
										boxShadow: `0 1px 3px color-mix(in oklab, ${paletteAccent} 25%, transparent)`,
									} : undefined}
								>
									<input type="radio" name="default-budget-mode" value={mode} checked={selected} onChange={() => updateSettings((current) => ({ ...current, budgetMode: mode }))} className="sr-only" />
									<span
										className="grid size-10 shrink-0 place-items-center rounded-lg"
										style={selected ? {
											backgroundColor: `color-mix(in oklab, ${paletteAccent} 16%, transparent)`,
											color: paletteAccent,
										} : { backgroundColor: "rgb(241 245 249)", color: "rgb(71 85 105)" }}
									>
										<Icon size={17} />
									</span>
									<span className="min-w-0 flex-1">
										<span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">{title}</span>
										<span className="mt-0.5 block text-[10px] leading-3.5 text-slate-500 dark:text-slate-400">{description}</span>
									</span>
									<span
										className={`grid size-4 shrink-0 place-items-center rounded-full border ${selected ? "text-white" : "border-slate-300 dark:border-slate-600"}`}
										style={selected ? { backgroundColor: paletteAccent, borderColor: paletteAccent } : undefined}
									>{selected && <Check size={11} strokeWidth={3} />}</span>
								</label>;
							})}
						</fieldset>
					</SettingsSection>

					<SettingsSection value="family" icon={Bell} title="Family reminders" description="Manage daily reminders on this device." accentColor={paletteAccent}>
						<div className="mx-2 sm:mx-4"><FamilyReminderSettings /></div>
					</SettingsSection>
					</Accordion>
				</div>
				<footer
					className="flex flex-wrap items-center justify-between gap-3 border-t bg-white/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90 sm:px-6"
					style={{
						borderColor: `color-mix(in oklab, ${paletteAccent} 20%, transparent)`,
					}}
				>
					<p className="max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">Restore the default page colors, navigation layout, order, password view, and budget mode.</p>
					{restoreNotice && <div role="status" aria-live="polite" className="relative isolate flex w-full basis-full items-center gap-3 overflow-hidden rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50 via-white to-green-50/70 px-4 py-3 shadow-md shadow-slate-900/5 ring-1 ring-inset ring-white/70 dark:border-emerald-900/80 dark:from-emerald-950/70 dark:via-slate-900 dark:to-green-950/30 dark:shadow-black/20 dark:ring-white/5">
						<span aria-hidden="true" className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-emerald-400" />
						<span aria-hidden="true" className="pointer-events-none absolute -right-5 -top-10 size-28 rounded-full border border-white/70 bg-white/10 dark:border-white/5 dark:bg-white/[0.02]" />
						<span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-100 to-green-100 text-emerald-800 shadow-sm ring-1 ring-inset ring-white/80 dark:from-emerald-950 dark:to-green-950 dark:text-emerald-200 dark:ring-white/5"><Check size={18} /></span>
						<span className="relative min-w-0 flex-1">
							<span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">All reset!</span>
							<span className="mt-0.5 block text-xs font-semibold leading-4 text-slate-900 dark:text-slate-100">Everything is back to its default settings.</span>
						</span>
					</div>}
					<Button
						type="button"
						autoFocus={confirmRestore}
						variant="outline"
						className="palette-dialog-footer-button shadow-sm transition-colors hover:opacity-90"
						style={{
							borderColor: `color-mix(in oklab, ${paletteAccent} 35%, transparent)`,
							color: paletteAccent,
							backgroundColor: confirmRestore ? `color-mix(in oklab, ${paletteAccent} 15%, transparent)` : undefined,
						}}
						onClick={() => {
							if (!confirmRestore) {
								setConfirmRestore(true);
								return;
							}
							updateSettings(() => defaultSettings);
							setConfirmRestore(false);
							setRestoreNotice(true);
							if (restoreNoticeTimeout.current) clearTimeout(restoreNoticeTimeout.current);
							restoreNoticeTimeout.current = setTimeout(() => {
								setRestoreNotice(false);
								restoreNoticeTimeout.current = null;
							}, 2000);
						}}
					>
						{confirmRestore ? <><Check size={15} />Confirm</> : <><RotateCcw size={15} />Restore defaults</>}
					</Button>
				</footer>
			</DialogContent>
		</Dialog>
	</>;
}
