"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
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
	const [groceries, setGroceries] = useState<Record<string, GroceryItem[]>>(() => groupByDate(initialItems));
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const [dialogEntry, setDialogEntry] = useState<GroceryItem | "new" | null>(null);
	const [storageError, setStorageError] = useState(initialError);
	const [submitting, setSubmitting] = useState(false);
	const [completionBlockedIds, setCompletionBlockedIds] = useState<Set<string>>(() => new Set());

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
					<p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-700 dark:text-blue-300"><span className="grid size-6 place-items-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><CalendarDays size={14} /></span> PLAN YOUR WEEK</p>
					<h1 className="bg-linear-to-r from-slate-900 via-blue-950 to-indigo-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-slate-100 dark:via-blue-200 dark:to-indigo-300 md:text-3xl">Grocery planner</h1>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">A little list-making goes a long way.</p>
				</div>
				<Button type="button" disabled={submitting} className="min-h-11 border-0 bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-400/40 dark:shadow-blue-950/70 dark:hover:shadow-blue-950/80" onClick={() => setDialogEntry("new")}><Plus size={17} /> Add grocery</Button>
			</div>
			<div className="grid items-start gap-5 lg:grid-cols-2">
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader theme="blue" icon={CalendarDays} title="Your calendar" description="Select a day to see its grocery list." className="min-h-[104px]">
						<div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
							<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} strokeWidth={2.5} /></Button>
							<span className="min-w-28 text-center text-sm font-bold text-white">{dateLabel(month, { month: "long", year: "numeric" })}</span>
							<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} strokeWidth={2.5} /></Button>
						</div>
					</FeatureSectionHeader>
					<CardContent className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_40px_-28px_rgba(37,99,235,0.5)] ring-1 ring-white/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 dark:ring-slate-800 sm:p-5">
						<div className="grid grid-cols-7 gap-2 text-center">
							{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="grid h-9 place-items-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{day}</span>)}
							{calendar.map((date, index) => {
								if (!date) return <span key={index} className="aspect-square" />;
								const key = getDateKey(date);
								const selected = key === selectedKey;
								const today = key === getDateKey(new Date());
								const hasItems = (groceries[key]?.length ?? 0) > 0;
								const dayStyle = selected && today
									? "bg-linear-to-br from-emerald-500 to-teal-600 font-semibold text-white shadow-lg shadow-emerald-500/25 ring-2 ring-inset ring-white/80 dark:shadow-emerald-950/70"
									: selected
										? "bg-linear-to-br from-blue-600 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-500 dark:shadow-blue-950/70"
										: today
										? "bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-inset ring-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:ring-emerald-800"
											: hasItems
												? "bg-indigo-50 text-indigo-950 ring-1 ring-inset ring-indigo-200/80 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-200 dark:ring-indigo-800"
												: "bg-slate-50/70 text-slate-700 hover:bg-white hover:text-blue-800 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800";
											return <button type="button" key={key} data-page-palette-preserve={hasItems || today ? true : undefined} onClick={() => setSelectedDate(date)} aria-pressed={selected} aria-current={today ? "date" : undefined} aria-label={`${dateLabel(date, { dateStyle: "full" })}${hasItems ? ", has grocery items" : ""}`} className={`relative grid aspect-square place-items-center rounded-2xl text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${dayStyle}`}>
									{date.getDate()}{hasItems && <i aria-hidden="true" className={`absolute bottom-1.5 size-1.5 rounded-full ${selected ? "bg-white" : "bg-indigo-500"}`} />}
								</button>;
							})}
						</div>
						<div data-page-palette-preserve className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50"><div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="size-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100 dark:ring-emerald-950" /> Today</span><span className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="size-2 rounded-full bg-indigo-600" /> Has groceries</span></div></div>
					</CardContent>
				</Card>
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader theme="blue" icon={ShoppingCart} title={selectedKey === getDateKey(new Date()) ? "Today’s list" : dateLabel(selectedDate, { weekday: "long" })} description={dateLabel(selectedDate, { month: "long", day: "numeric", year: "numeric" })} mobileRow className="min-h-[104px]">
						<div className="flex shrink-0 items-center gap-2">
							<span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10"><span className="text-[9px] font-semibold uppercase">{dateLabel(selectedDate, { month: "short" })}</span><strong className="text-lg leading-5">{selectedDate.getDate()}</strong></span>
							<Button type="button" variant="outline" size="icon-sm" className="size-9 shrink-0 touch-manipulation rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setDialogEntry("new")} aria-label="Add an item"><Plus size={16} strokeWidth={2.5} /></Button>
						</div>
					</FeatureSectionHeader>
					<CardContent className="rounded-2xl border border-blue-100 bg-white p-4 shadow-lg shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-5">
						<GrocerySummary items={dayItems} doneCount={doneCount} />
						<GroceryList items={dayItems} onUpdate={updateItem} onEdit={setDialogEntry} onAdd={() => setDialogEntry("new")} submitting={submitting} completionBlockedIds={completionBlockedIds} />
					</CardContent>
				</Card>
			</div>
			<p className="flex items-center gap-2 rounded-lg border border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50/50 p-3 text-xs text-blue-950/70 dark:border-blue-900 dark:from-blue-950/50 dark:to-indigo-950/40 dark:text-blue-200"><ShoppingCart size={16} className="shrink-0 text-blue-600 dark:text-blue-300" /><span><strong>Grocery planner:</strong> Keep shopping lists organized by day and track what you still need.</span></p>
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
