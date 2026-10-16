"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, ExternalLink, Loader2, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageCallout } from "@/components/page-callout";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { useAppSettings } from "@/components/settings/settings-context";
import { getPagePaletteStyles } from "@/components/settings/page-palettes";
import { GroceryDialog } from "@/features/grocery/components/grocery-dialog";
import { GroceryList } from "@/features/grocery/components/grocery-list";
import { GrocerySummary } from "@/features/grocery/components/grocery-summary";
import { createGroceryItem, deleteGroceryItem, getGroceryItems, setGroceryAutoAddToBudget, updateGroceryItem, type GroceryRecord } from "@/features/grocery/actions/grocery-actions";
import { dateLabel, getDateKey } from "@/features/grocery/lib/grocery-utils";
import { centsFromInput } from "@/features/budget/lib/budget-utils";
import type { GroceryItem } from "@/features/grocery/types";
import { toast } from "sonner";

function groupByDate(items: GroceryRecord[]) {
	return items.reduce<Record<string, GroceryItem[]>>((grouped, { dateKey, ...item }) => {
		(grouped[dateKey] ??= []).push(item);
		return grouped;
	}, {});
}

export function GroceryPlanner({ initialItems, initialSyncDates = {}, initialError }: { initialItems: GroceryRecord[]; initialSyncDates?: Record<string, boolean>; initialError: string }) {
	const { settings } = useAppSettings();
	const [groceries, setGroceries] = useState<Record<string, GroceryItem[]>>(() => groupByDate(initialItems));
	const [autoAddDates, setAutoAddDates] = useState<Record<string, boolean>>(() => initialSyncDates);
	const [togglingAutoAdd, setTogglingAutoAdd] = useState(false);
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const [dialogEntry, setDialogEntry] = useState<GroceryItem | "new" | null>(null);
	const [storageError, setStorageError] = useState(initialError);
	const [submitting, setSubmitting] = useState(false);
	const [completionBlockedIds, setCompletionBlockedIds] = useState<Set<string>>(() => new Set());
	const pagePaletteName = settings.pagePalettes["/grocery"];
	const pagePalette = getPagePaletteStyles(pagePaletteName === "default" ? "blue" : pagePaletteName);

	const refreshGroceries = useCallback(async () => {
		try {
			const items = await getGroceryItems();
			setGroceries(groupByDate(items));
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		let cancelled = false;
		Promise.resolve().then(async () => {
			if (cancelled) return;
			try {
				const items = await getGroceryItems();
				if (!cancelled) {
					setGroceries(groupByDate(items));
				}
			} catch {
				// ignore
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
	if (initialItems !== prevInitialItems) {
		setPrevInitialItems(initialItems);
		setGroceries(groupByDate(initialItems));
	}

	useEffect(() => {
		function onFocus() {
			void refreshGroceries();
		}
		window.addEventListener("focus", onFocus);
		return () => {
			window.removeEventListener("focus", onFocus);
		};
	}, [refreshGroceries]);

	const selectedKey = getDateKey(selectedDate);
	const dayItems = groceries[selectedKey] ?? [];
	const doneCount = dayItems.filter((item) => item.done).length;
	const calendar = useMemo(() => {
		const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
		const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
		return Array.from({ length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 }, (_, index) => {
			const day = index - firstWeekday + 1;
			return day > 0 && day <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), day) : null;
		});
	}, [month]);

	async function handleToggleAutoAdd() {
		if (togglingAutoAdd) return;
		const nextVal = !autoAddDates[selectedKey];
		setTogglingAutoAdd(true);
		setAutoAddDates((prev) => ({ ...prev, [selectedKey]: nextVal }));
		if (!nextVal) {
			setGroceries((prev) => {
				const current = prev[selectedKey];
				if (!current) return prev;
				return {
					...prev,
					[selectedKey]: current.map((i) => ({ ...i, paid: false })),
				};
			});
		}
		try {
			await setGroceryAutoAddToBudget(selectedKey, nextVal);
			const dateStr = dateLabel(selectedDate, { month: "short", day: "numeric" });
			if (nextVal) {
				toast.success(`"Grocery on ${dateStr}" added to Budget Planner`);
			} else {
				toast.info(`"Grocery on ${dateStr}" removed from Budget Planner`);
			}
		} catch (error) {
			setAutoAddDates((prev) => ({ ...prev, [selectedKey]: !nextVal }));
			toast.error(error instanceof Error ? error.message : "Failed to update budget sync.");
		} finally {
			setTogglingAutoAdd(false);
		}
	}

	async function submitGrocery(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("item") ?? "").trim();
		const priceRaw = String(formData.get("price") ?? "").trim();
		const priceCents = centsFromInput(priceRaw) ?? 0;
		if (!name) return;
		const editing = dialogEntry && dialogEntry !== "new" ? dialogEntry : null;
		try {
			if (editing) {
				await updateGroceryItem(editing.id, { name, priceCents });
			} else {
				const cryptoApi = globalThis.crypto;
				const id = typeof cryptoApi?.randomUUID === "function" ? cryptoApi.randomUUID() : `${Date.now()}-${Math.random()}`;
				await createGroceryItem({ id, dateKey: selectedKey, name, done: false, priceCents });
			}
			setGroceries(groupByDate(await getGroceryItems()));
			setStorageError("");
			setDialogEntry(null);
		} catch (error) {
			const action = editing ? "edit" : "add";
			setStorageError(error instanceof Error ? `Could not ${action} grocery: ${error.message}` : `Could not ${action} grocery.`);
		} finally {
			setSubmitting(false);
		}
	}

	async function updateItem(id: string, update: (item: GroceryItem) => GroceryItem | null) {
		const item = dayItems.find((entry) => entry.id === id);
		const isAutoAddChecked = Boolean(autoAddDates[selectedKey]);
		if (!item || submitting || completionBlockedIds.has(id) || (isAutoAddChecked && item.paid)) return;
		const updated = update(item);
		const changingCompletion = Boolean(updated && updated.done !== item.done);
		if (changingCompletion) setCompletionBlockedIds((ids) => new Set(ids).add(id));
		else setSubmitting(true);
		try {
			if (updated) await updateGroceryItem(id, { name: updated.name, done: updated.done });
			else await deleteGroceryItem(id);
			setGroceries(groupByDate(await getGroceryItems()));
			setStorageError("");
			if (changingCompletion) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		} catch (error) {
			setStorageError(error instanceof Error ? `Could not update grocery: ${error.message}` : "Could not update grocery.");
		} finally {
			if (changingCompletion) setCompletionBlockedIds((ids) => {
				const nextIds = new Set(ids);
				nextIds.delete(id);
				return nextIds;
			});
			else setSubmitting(false);
		}
	}

	return (
		<>
			{storageError && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">{storageError}</div>}
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p style={{ color: pagePalette.accent }} className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest"><span className={`grid size-6 place-items-center rounded-md bg-linear-to-br ${pagePalette.iconGradient} text-white`}><CalendarDays size={14} /></span> PLAN YOUR WEEK</p>
					<h1 className={`bg-linear-to-r ${pagePalette.pageHeading} bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl`}>Grocery planner</h1>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">A little list-making goes a long way.</p>
				</div>
				<Button type="button" variant="ghost" disabled={submitting} className="palette-action-button min-h-11 gap-2.5 rounded-lg border px-4 text-sm font-medium transition-colors duration-150" style={{ "--action-accent": pagePalette.accent } as CSSProperties} onClick={() => setDialogEntry("new")}><Plus size={18} /> Add grocery</Button>
			</div>
			<div className="grid items-start gap-5 lg:grid-cols-2">
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader theme="blue" icon={CalendarDays} title="Your calendar" description="Select a day to see its grocery list." appearance="soft" className="min-h-[104px]">
						<div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
							<Button type="button" variant="outline" size="icon-sm" className="feature-section-header-control rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} strokeWidth={2.5} /></Button>
							<span className="feature-section-header-month min-w-28 text-center text-sm font-bold text-white">{dateLabel(month, { month: "long", year: "numeric" })}</span>
							<Button type="button" variant="outline" size="icon-sm" className="feature-section-header-control rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} strokeWidth={2.5} /></Button>
						</div>
					</FeatureSectionHeader>
					<CardContent data-page-palette-surface style={{ "--page-accent-base": pagePalette.accent } as CSSProperties} className="planner-day-panel rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_40px_-28px_rgba(37,99,235,0.5)] ring-1 ring-white/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 dark:ring-slate-800 sm:p-5">
						<div className="grid grid-cols-7 gap-2 text-center">
							{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="grid h-9 place-items-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{day}</span>)}
							{calendar.map((date, index) => {
								if (!date) return <span key={index} className="aspect-square" />;
								const key = getDateKey(date);
								const selected = key === selectedKey;
								const today = key === getDateKey(new Date());
								const hasItems = (groceries[key]?.length ?? 0) > 0;
								const calendarTone = selected && today
									? "today-selected"
									: selected
										? "selected"
										: today
											? "today"
											: hasItems
												? "items"
												: "default";
								return <button data-page-palette-day data-calendar-tone={calendarTone} type="button" key={key} onClick={() => setSelectedDate(date)} aria-pressed={selected} aria-current={today ? "date" : undefined} aria-label={`${dateLabel(date, { dateStyle: "full" })}${hasItems ? ", has grocery items" : ""}`} className="planner-calendar-day relative grid aspect-square place-items-center rounded-2xl border text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900">
									{date.getDate()}{hasItems && <i data-page-palette-preserve aria-hidden="true" className={`absolute bottom-1.5 size-1.5 rounded-full ${selected ? "bg-white" : "bg-indigo-500"}`} />}
								</button>;
							})}
						</div>
						<div data-page-palette-preserve className="planner-calendar-legend mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-950/50"><div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white px-2.5 py-1 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="size-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100 dark:ring-emerald-950" />Today</span><span className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white px-2.5 py-1 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="size-2 rounded-full bg-indigo-600" />Has groceries</span></div></div>
					</CardContent>
				</Card>
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader theme="blue" icon={ShoppingCart} title={selectedKey === getDateKey(new Date()) ? "Today’s list" : dateLabel(selectedDate, { weekday: "long" })} description={dateLabel(selectedDate, { month: "long", day: "numeric", year: "numeric" })} mobileRow appearance="soft" className="min-h-[104px]">
						<div className="flex shrink-0 items-center gap-2">
							<span className="feature-section-header-date flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10"><span className="text-[9px] font-semibold uppercase">{dateLabel(selectedDate, { month: "short" })}</span><strong className="text-lg leading-5">{selectedDate.getDate()}</strong></span>
							<Button type="button" variant="outline" size="icon-sm" className="feature-section-header-control size-9 shrink-0 touch-manipulation rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setDialogEntry("new")} aria-label="Add an item"><Plus size={16} strokeWidth={2.5} /></Button>
						</div>
					</FeatureSectionHeader>
					<CardContent data-page-palette={pagePaletteName === "default" ? "blue" : pagePaletteName} style={{ "--page-accent-base": pagePalette.accent } as CSSProperties} data-page-palette-surface data-page-palette-card className="planner-day-panel rounded-3xl border border-blue-100 bg-white p-4 shadow-lg shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-5">
						<GrocerySummary items={dayItems} doneCount={doneCount} />
						{(() => {
							const isAutoAddChecked = Boolean(autoAddDates[selectedKey]);
							const dayNum = selectedDate.getDate();
							const cutoffDay = dayNum <= 5 ? 5 : dayNum <= 15 ? 15 : dayNum <= 20 ? 20 : 30;
							return (
								<div className={`mb-2 rounded-2xl border p-3.5 transition-all duration-200 shadow-xs ${
									isAutoAddChecked
										? "border-blue-200/90 bg-linear-to-br from-blue-50/90 via-indigo-50/50 to-blue-50/80 dark:border-blue-800/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/30"
										: "border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40"
								}`}>
									<div className="flex items-center justify-between gap-3">
										<button
											type="button"
											onClick={handleToggleAutoAdd}
											disabled={togglingAutoAdd}
											className="min-w-0 flex-1 text-left cursor-pointer select-none"
										>
											<p className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
												<span>Auto add Items in Budget Planner?</span>
											</p>
											<p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
												If checked, this grocery list will display in Budget Planner under the {cutoffDay}th cutoff as &ldquo;Grocery on {dateLabel(selectedDate, { month: "short", day: "numeric" })}&rdquo;.
											</p>
										</button>

										<button
											id="auto-add-budget-toggle"
											type="button"
											role="checkbox"
											aria-checked={isAutoAddChecked}
											aria-label="Auto add Items in Budget Planner?"
											disabled={togglingAutoAdd}
											onClick={handleToggleAutoAdd}
											className={`grid size-6 shrink-0 place-items-center rounded-md border-2 transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
												isAutoAddChecked
													? "border-blue-600 bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-95"
													: "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-400"
											}`}
										>
											{togglingAutoAdd ? (
												<Loader2 size={13} className="animate-spin text-blue-600 dark:text-blue-400" />
											) : (
												isAutoAddChecked && <Check size={14} strokeWidth={3} className="text-white" />
											)}
										</button>
									</div>

									{isAutoAddChecked && (
										<div className="mt-3 flex flex-col gap-2.5 border-t border-blue-100/80 pt-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/40">
											<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
												<span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-950" />
												Synced to {cutoffDay}th Cutoff
											</span>

											<Link
												href={`/budget?openGrocery=${selectedKey}`}
												className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-98 w-full sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
											>
												<span>Open in Budget Planner</span>
												<ExternalLink size={12} strokeWidth={2.5} />
											</Link>
										</div>
									)}
								</div>
							);
						})()}
						{(() => {
							const isAutoAddChecked = Boolean(autoAddDates[selectedKey]);
							const paidItems = dayItems.filter((item) => item.paid);
							const hasPaid = paidItems.length > 0;
							const allPaid = dayItems.length > 0 && paidItems.length === dayItems.length;

							if (!isAutoAddChecked || !hasPaid) return null;

							return (
								<div
									role="note"
									className="page-callout relative isolate mb-2.5 flex items-center gap-3 overflow-hidden rounded-2xl border border-emerald-200/90 bg-white/80 px-3.5 py-2.5 shadow-xs backdrop-blur-xs dark:border-emerald-900/60 dark:bg-slate-900/80"
								>
									<span
										aria-hidden="true"
										className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-400 text-white shadow-xs"
									>
										<Check size={16} strokeWidth={2.5} />
									</span>
									<div className="relative min-w-0 flex-1">
										<p className="text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">
											{allPaid
												? "All items are mark as paid in budget planner"
												: `${paidItems.length} ${paidItems.length === 1 ? "item is" : "items are"} mark as paid in budget planner`}
										</p>
										<p className="mt-0.5 text-[11px] leading-tight text-slate-500 dark:text-slate-400">
											{allPaid
												? "Items are locked as completed while settled in Budget Planner."
												: "Paid items are locked as completed while settled in Budget Planner."}
										</p>
									</div>
									<span
										aria-hidden="true"
										className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-r-full bg-emerald-500"
									/>
									<span
										aria-hidden="true"
										className="pointer-events-none absolute -right-4 -top-8 size-24 rounded-full border border-white/70 bg-white/10 dark:border-white/5 dark:bg-white/[0.02]"
									/>
								</div>
							);
						})()}
						<GroceryList
							items={dayItems}
							onUpdate={updateItem}
							onEdit={setDialogEntry}
							onAdd={() => setDialogEntry("new")}
							submitting={submitting}
							completionBlockedIds={completionBlockedIds}
							isAutoAddChecked={Boolean(autoAddDates[selectedKey])}
						/>
					</CardContent>
				</Card>
			</div>
			<PageCallout icon={ShoppingCart} title="Grocery planner" description="Keep shopping lists organized by day and track what you still need." fallbackPalette="blue" />
			<GroceryDialog
				open={dialogEntry !== null}
				entry={dialogEntry && dialogEntry !== "new" ? dialogEntry : null}
				selectedDate={selectedDate}
				onOpenChange={(open) => { if (!open && !submitting) setDialogEntry(null); }}
				onSubmit={submitGrocery}
				submitting={submitting}
			/>
		</>
	);
}
