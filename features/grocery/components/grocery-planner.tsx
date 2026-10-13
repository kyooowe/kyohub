"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageCallout } from "@/components/page-callout";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { useAppSettings } from "@/components/settings/settings-context";
import { getPagePaletteStyles } from "@/components/settings/page-palettes";
import { GroceryDialog } from "@/features/grocery/components/grocery-dialog";
import { GroceryList } from "@/features/grocery/components/grocery-list";
import { GrocerySummary } from "@/features/grocery/components/grocery-summary";
import { createGroceryItem, deleteGroceryItem, getGroceryItems, updateGroceryItem, type GroceryRecord } from "@/features/grocery/actions/grocery-actions";
import { dateLabel, getDateKey } from "@/features/grocery/lib/grocery-utils";
import type { GroceryItem } from "@/features/grocery/types";

function groupByDate(items: GroceryRecord[]) {
	return items.reduce<Record<string, GroceryItem[]>>((grouped, { dateKey, ...item }) => {
		(grouped[dateKey] ??= []).push(item);
		return grouped;
	}, {});
}

export function GroceryPlanner({ initialItems, initialError }: { initialItems: GroceryRecord[]; initialError: string }) {
	const { settings } = useAppSettings();
	const [groceries, setGroceries] = useState<Record<string, GroceryItem[]>>(() => groupByDate(initialItems));
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const [dialogEntry, setDialogEntry] = useState<GroceryItem | "new" | null>(null);
	const [storageError, setStorageError] = useState(initialError);
	const [submitting, setSubmitting] = useState(false);
	const [completionBlockedIds, setCompletionBlockedIds] = useState<Set<string>>(() => new Set());
	const pagePaletteName = settings.pagePalettes["/grocery"];
	const pagePalette = getPagePaletteStyles(pagePaletteName === "default" ? "blue" : pagePaletteName);

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

	async function submitGrocery(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		const name = String(new FormData(event.currentTarget).get("item")).trim();
		if (!name) return;
		const editing = dialogEntry && dialogEntry !== "new" ? dialogEntry : null;
		try {
			if (editing) {
				await updateGroceryItem(editing.id, { name });
			} else {
				const cryptoApi = globalThis.crypto;
				const id = typeof cryptoApi?.randomUUID === "function" ? cryptoApi.randomUUID() : `${Date.now()}-${Math.random()}`;
				await createGroceryItem({ id, dateKey: selectedKey, name, done: false });
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
		if (submitting || completionBlockedIds.has(id)) return;
		const item = dayItems.find((entry) => entry.id === id);
		if (!item) return;
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
						<GroceryList items={dayItems} onUpdate={updateItem} onEdit={setDialogEntry} onAdd={() => setDialogEntry("new")} submitting={submitting} completionBlockedIds={completionBlockedIds} />
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
