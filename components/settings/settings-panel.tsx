"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Bell, CalendarDays, ChartNoAxesColumn, Check, ChevronDown, ChevronRight, KeyRound, LaptopMinimal, LayoutGrid, List, Moon, Palette, Settings2, ShoppingCart, Sun, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { setDarkMode, useDarkModePreference } from "@/components/theme-toggle";
import { FamilyReminderSettings } from "@/features/family-calendar/components/family-reminder-settings";
import { navigationItems, useAppSettings, type NavigationHref } from "@/components/settings/settings-context";
import { getPagePaletteStyles, pagePaletteOptions } from "@/components/settings/page-palettes";

const navigationVisuals: Record<NavigationHref, { icon: LucideIcon; color: string }> = {
	"/passwords": { icon: KeyRound, color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
	"/grocery": { icon: ShoppingCart, color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
	"/baby-needs": { icon: CalendarDays, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
	"/budget": { icon: ChartNoAxesColumn, color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
};

const defaultPaletteSwatches: Record<NavigationHref, string> = {
	"/passwords": "from-violet-600 to-fuchsia-500",
	"/grocery": "from-blue-500 to-cyan-400",
	"/baby-needs": "from-emerald-500 to-teal-400",
	"/budget": "from-orange-500 to-rose-500",
};

function SectionHeading({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
	return <div className="flex items-center gap-3">
		<span className="grid size-8 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Icon size={16} /></span>
		<div className="min-w-0">
			<h3 className="text-sm font-semibold text-violet-950 dark:text-violet-200">{title}</h3>
			<p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
		</div>
	</div>;
}

function SettingsSection({ value, icon, title, description, children }: {
	value: string;
	icon: LucideIcon;
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return <AccordionItem value={value} className="border-b-0">
		<AccordionHeader>
			<AccordionTrigger className="px-2">
				<SectionHeading icon={icon} title={title} description={description} />
				<ChevronDown size={17} className="shrink-0 text-slate-400 transition-transform duration-200 group-data-panel-open:rotate-180 dark:text-slate-500" />
			</AccordionTrigger>
		</AccordionHeader>
		<AccordionPanel><div className="space-y-3">{children}</div></AccordionPanel>
	</AccordionItem>;
}

export function SettingsPanel({ trigger }: { trigger: "sidebar" | "header" | "floating" }) {
	const [open, setOpen] = useState(false);
	const [draggingHref, setDraggingHref] = useState<NavigationHref | null>(null);
	const { settings, updateSettings, saveError } = useAppSettings();
	const isDarkMode = useDarkModePreference();
	const navigationListRef = useRef<HTMLDivElement>(null);
	const navigationItemRefs = useRef<Partial<Record<NavigationHref, HTMLDivElement>>>({});
	const activePointer = useRef<{ href: NavigationHref; pointerId: number } | null>(null);
	const previousItemPositions = useRef<Map<NavigationHref, number> | null>(null);

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
			size={trigger === "sidebar" ? "default" : "icon"}
			className={trigger === "sidebar"
				? "hidden min-h-11 w-full justify-start gap-3 rounded-md bg-transparent px-3 text-violet-100/65 transition-colors hover:bg-white/5 hover:text-white md:flex"
				: trigger === "header"
					? "text-violet-700 md:hidden dark:text-violet-200"
					: "relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-violet-200"}
			aria-label={trigger === "sidebar" ? undefined : "Open settings"}
			onClick={() => setOpen(true)}
		>
			<Settings2 size={18} />{trigger === "sidebar" && "Settings"}
		</Button>
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent pagePalette={null} className="flex max-h-[min(90dvh,52rem)] max-w-2xl flex-col overflow-hidden rounded-2xl border-violet-200 bg-[#f8f6ff] p-0 dark:border-slate-700 dark:bg-slate-950">
				<div className="shrink-0 border-b border-violet-100 bg-white/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Settings2 size={18} /></span>
							<div>
								<DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Settings</DialogTitle>
								<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">Personalize how Kyohub looks and works.</DialogDescription>
							</div>
						</div>
						<DialogClose render={<Button type="button" variant="ghost" size="icon" aria-label="Close settings" className="shrink-0 text-slate-500 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-violet-200" />}>
							<X size={18} />
						</DialogClose>
					</div>
				</div>
				<div className="settings-dialog-scroll min-h-0 flex-1 space-y-6 overflow-y-auto bg-[#f7f7ff] p-5 sm:p-6 dark:bg-slate-950">
					{saveError && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">{saveError}</p>}

					<Accordion multiple className="space-y-2">
					<SettingsSection value="appearance" icon={Sun} title="Appearance" description="Choose how Kyohub looks and feels.">
						<div className="mx-2 grid gap-2 sm:mx-4 sm:grid-cols-2">
							<button type="button" aria-pressed={isDarkMode} onClick={() => setDarkMode(true)} className={`flex min-w-0 items-center gap-2 rounded-xl border p-2 text-left transition-all ${isDarkMode ? "border-violet-400 bg-violet-50 shadow-sm shadow-violet-200/60 ring-1 ring-violet-300 dark:border-violet-500 dark:bg-violet-950/40 dark:ring-violet-700" : "border-slate-100 bg-white hover:border-violet-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}>
								<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-linear-to-br from-slate-950 to-indigo-950 text-amber-200 shadow-inner shadow-black/30"><Moon size={17} /></span>
								<span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">Dark mode</span><span className="mt-0.5 block text-[10px] leading-3.5 text-slate-500 dark:text-slate-400">Reduce eye strain at night.</span></span>
								<span className={`grid size-4 shrink-0 place-items-center rounded-full border ${isDarkMode ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>{isDarkMode && <Check size={11} strokeWidth={3} />}</span>
							</button>
							<button type="button" aria-pressed={!isDarkMode} onClick={() => setDarkMode(false)} className={`flex min-w-0 items-center gap-2 rounded-xl border p-2 text-left transition-all ${!isDarkMode ? "border-violet-400 bg-violet-50 shadow-sm shadow-violet-200/60 ring-1 ring-violet-300 dark:border-violet-500 dark:bg-violet-950/40 dark:ring-violet-700" : "border-slate-100 bg-white hover:border-violet-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}>
								<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-linear-to-br from-sky-50 to-blue-100 text-blue-700 shadow-inner shadow-blue-200/60 dark:from-slate-800 dark:to-slate-700 dark:text-sky-300"><Sun size={17} /></span>
								<span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">Light mode</span><span className="mt-0.5 block text-[10px] leading-3.5 text-slate-500 dark:text-slate-400">Keep things bright and clean.</span></span>
								<span className={`grid size-4 shrink-0 place-items-center rounded-full border ${!isDarkMode ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>{!isDarkMode && <Check size={11} strokeWidth={3} />}</span>
							</button>
						</div>
						<button type="button" role="switch" aria-checked={settings.desktopNavigation === "floating"} onClick={() => updateSettings((current) => ({ ...current, desktopNavigation: current.desktopNavigation === "floating" ? "sidebar" : "floating" }))} className="mx-2 hidden w-[calc(100%-1rem)] items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/70 p-2 text-left transition-colors hover:bg-violet-100/70 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 md:flex sm:mx-4 sm:w-[calc(100%-2rem)]">
							<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><LaptopMinimal size={15} /></span>
							<span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">Floating navigation on desktop</span><span className="block text-[10px] text-slate-500 dark:text-slate-400">Mobile navigation always stays floating.</span></span>
							<span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${settings.desktopNavigation === "floating" ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-700"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${settings.desktopNavigation === "floating" ? "translate-x-4" : "translate-x-0.5"}`} /></span>
						</button>
					</SettingsSection>

					<SettingsSection value="navigation" icon={List} title="Navigation order" description="Hold and drag an item to reorder. Focus an item and use the arrow keys to move it.">
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
									className={`flex touch-none cursor-grab items-center justify-between gap-3 rounded-xl border px-3 py-2 outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-violet-400 active:cursor-grabbing ${draggingHref === href
										? "scale-[1.01] border-violet-300 bg-violet-50 shadow-md shadow-violet-950/10 dark:border-violet-600 dark:bg-violet-950/40 dark:shadow-black/20"
										: "border-slate-100 bg-white hover:border-violet-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}
								>
									<span className="flex min-w-0 items-center gap-2.5"><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${color}`}><Icon size={16} /></span><span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{item.label}</span></span>
									<ChevronRight aria-hidden="true" size={16} className="shrink-0 rotate-90 text-slate-300 dark:text-slate-600" />
								</div>;
							})}
						</div>
					</SettingsSection>

					<SettingsSection value="colors" icon={Palette} title="Page colors" description="Choose the accent color for each page’s section headers.">
						<div className="mx-2 grid gap-3 sm:mx-4 sm:grid-cols-2">
							{navigationItems.map(({ href, label }) => {
								const { icon: Icon } = navigationVisuals[href];
								const palette = settings.pagePalettes[href];
								const swatch = palette === "default" ? defaultPaletteSwatches[href] : getPagePaletteStyles(palette).iconGradient;
								const paletteChoices = [
									{ value: "default" as const, label: "Original", swatch: `bg-linear-to-br ${defaultPaletteSwatches[href]}` },
									...pagePaletteOptions,
								];
								return <Popover key={href}>
									<PopoverTrigger
										type="button"
										aria-label={`Choose ${label} page color`}
										title={`Choose ${label} page color`}
										className="flex min-h-12 w-full items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-800 shadow-sm shadow-slate-950/[0.03] transition-all hover:border-violet-200 hover:shadow-md focus-visible:border-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700 dark:focus-visible:border-violet-600 dark:focus-visible:ring-violet-900">
										<span className={`grid size-8 shrink-0 place-items-center rounded-full bg-linear-to-br ${swatch} text-white shadow-sm`}><Icon size={15} /></span>
										<span className="min-w-0 flex-1 truncate">{label}</span>
										<span className={`grid size-5 shrink-0 place-items-center rounded-full ${palette !== "default" ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200" : "text-slate-400 dark:text-slate-500"}`}>{palette !== "default" ? <Check size={12} /> : <ChevronRight size={16} />}</span>
									</PopoverTrigger>
									<PopoverContent align="start" className="w-52">
										<p className="mb-3 text-xs font-semibold text-slate-700 dark:text-slate-200">Choose a color</p>
										<div className="grid grid-cols-4 justify-items-center gap-2">
											{paletteChoices.map((option) => <PopoverClose
												key={option.value}
												type="button"
												aria-label={`${option.label} palette${option.value === "default" ? ` for ${label}` : ""}`}
												aria-pressed={palette === option.value}
												title={`${option.label} palette`}
												onClick={() => updateSettings((current) => ({
													...current,
													pagePalettes: { ...current.pagePalettes, [href]: option.value },
												}))}
												className="grid size-10 place-items-center rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
											>
												<span className={`grid size-9 place-items-center rounded-full ${option.swatch} shadow-sm`}>
													{palette === option.value && <Check size={15} className={option.value === "default" ? "text-white" : "text-slate-700"} />}
												</span>
											</PopoverClose>)}
										</div>
									</PopoverContent>
								</Popover>;
							})}
						</div>
					</SettingsSection>

					<SettingsSection value="passwords" icon={KeyRound} title="Password manager" description="Choose your default password layout.">
						<fieldset className="mx-2 grid gap-2 sm:mx-4 sm:grid-cols-2">
							{(["grid", "list"] as const).map((view) => {
								const selected = settings.passwordView === view;
								const Icon = view === "grid" ? LayoutGrid : List;
								return <label key={view} className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-xl border p-2 text-left transition-all focus-within:ring-2 focus-within:ring-violet-400 ${selected ? "border-violet-400 bg-violet-50 shadow-sm shadow-violet-200/60 ring-1 ring-violet-300 dark:border-violet-500 dark:bg-violet-950/40 dark:ring-violet-700" : "border-slate-100 bg-white hover:border-violet-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"}`}>
									<input type="radio" name="default-password-view" value={view} checked={selected} onChange={() => updateSettings((current) => ({ ...current, passwordView: view }))} className="sr-only" />
									<span className={`grid size-10 shrink-0 place-items-center rounded-lg ${selected ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}><Icon size={17} /></span>
									<span className="min-w-0 flex-1">
										<span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">{view === "grid" ? "Card view" : "List view"}</span>
										<span className="mt-0.5 block text-[10px] leading-3.5 text-slate-500 dark:text-slate-400">{view === "grid" ? "Display passwords as cards." : "Display passwords in compact rows."}</span>
									</span>
									<span className={`grid size-4 shrink-0 place-items-center rounded-full border ${selected ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>{selected && <Check size={11} strokeWidth={3} />}</span>
								</label>;
							})}
						</fieldset>
					</SettingsSection>

					<SettingsSection value="family" icon={Bell} title="Family reminders" description="Manage daily reminders on this device.">
						<div className="mx-2 sm:mx-4"><FamilyReminderSettings /></div>
					</SettingsSection>
					</Accordion>
				</div>
			</DialogContent>
		</Dialog>
	</>;
}
