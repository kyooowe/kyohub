"use client";

import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroceryDialog } from "@/features/grocery/components/grocery-dialog";
import { GroceryList } from "@/features/grocery/components/grocery-list";
import { GrocerySummary } from "@/features/grocery/components/grocery-summary";
import { createGroceryItem, deleteGroceryItem, getGroceryItems, importLegacyGroceryItems, updateGroceryItem, type GroceryRecord } from "@/features/grocery/actions/grocery-actions";
import { dateLabel, getDateKey } from "@/features/grocery/lib/grocery-utils";
import type { GroceryItem } from "@/features/grocery/types";

const storageKey = "kyohub-groceries-v1";

function groupByDate(items: GroceryRecord[]) {
	return items.reduce<Record<string, GroceryItem[]>>((grouped, { dateKey, ...item }) => {
		(grouped[dateKey] ??= []).push(item);
		return grouped;
	}, {});
}

export function GroceryPlanner() {
	const [groceries, setGroceries] = useState<Record<string, GroceryItem[]>>({});
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const [dialogEntry, setDialogEntry] = useState<GroceryItem | "new" | null>(null);
	const [storageError, setStorageError] = useState("");
	const [ready, setReady] = useState(false);

	useEffect(() => {
		let active = true;
		async function loadGroceries() {
			try {
				const saved = localStorage.getItem(storageKey);
				let items = await getGroceryItems();
				if (saved !== null) {
					const legacy = Object.entries(JSON.parse(saved) as Record<string, GroceryItem[]>)
						.flatMap(([dateKey, entries]) => entries.map((item) => ({ ...item, dateKey })));
					await importLegacyGroceryItems(legacy);
					localStorage.removeItem(storageKey);
					items = await getGroceryItems();
				}
				if (active) setGroceries(groupByDate(items));
			} catch (error) {
				if (active) setStorageError(error instanceof Error ? `Could not load groceries: ${error.message}` : "Could not load groceries from the database.");
			} finally {
				if (active) setReady(true);
			}
		}
		void loadGroceries();
		return () => { active = false; };
	}, []);

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
		}
	}

	async function updateItem(id: string, update: (item: GroceryItem) => GroceryItem | null) {
		const item = dayItems.find((entry) => entry.id === id);
		if (!item) return;
		const updated = update(item);
		try {
			if (updated) await updateGroceryItem(id, { name: updated.name, done: updated.done });
			else await deleteGroceryItem(id);
			setGroceries(groupByDate(await getGroceryItems()));
			setStorageError("");
		} catch (error) {
			setStorageError(error instanceof Error ? `Could not update grocery: ${error.message}` : "Could not update grocery.");
		}
	}

	return (
		<>
			{storageError && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{storageError}</div>}
			{!ready && <LoadingIndicator />}
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-700"><span className="grid size-6 place-items-center rounded-md bg-blue-100 text-blue-700"><CalendarDays size={14} /></span> PLAN YOUR WEEK</p>
					<h1 className="bg-linear-to-r from-slate-900 via-blue-950 to-indigo-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">Grocery planner</h1>
					<p className="mt-1 text-sm text-slate-500">A little list-making goes a long way.</p>
				</div>
				<Button type="button" className="min-h-11 border-0 bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-400/40" onClick={() => setDialogEntry("new")}><Plus size={17} /> Add grocery</Button>
			</div>
			<div className="grid items-start gap-5 lg:grid-cols-2">
				<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0">
					<CardHeader className="gap-4 border-b border-blue-900/10 bg-linear-to-r from-blue-800 via-indigo-800 to-violet-800 p-5 text-white">
						<div className="flex items-center justify-between gap-3">
							<div><CardTitle className="text-white">Your calendar</CardTitle><p className="mt-1 text-xs text-blue-100/80">Select a day to see its grocery list.</p></div>
							<div className="flex items-center gap-2">
								<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} strokeWidth={2.5} /></Button>
								<span className="min-w-28 text-center text-sm font-bold text-white">{dateLabel(month, { month: "long", year: "numeric" })}</span>
								<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} strokeWidth={2.5} /></Button>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-5 pt-0">
						<div className="grid grid-cols-7 gap-1 text-center">
							{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="grid h-8 place-items-center text-xs font-semibold text-slate-400">{day}</span>)}
							{calendar.map((date, index) => {
								if (!date) return <span key={index} />;
								const key = getDateKey(date);
								const selected = key === selectedKey;
								const today = key === getDateKey(new Date());
								const hasItems = (groceries[key]?.length ?? 0) > 0;
								return <button type="button" key={key} onClick={() => setSelectedDate(date)} aria-label={`${dateLabel(date, { dateStyle: "full" })}${hasItems ? ", has grocery items" : ""}`} className={`relative grid aspect-square place-items-center rounded-xl text-sm transition-all hover:bg-blue-100 ${selected ? "bg-linear-to-br from-blue-700 via-indigo-700 to-violet-700 font-semibold text-white shadow-lg shadow-indigo-300 hover:from-blue-800 hover:via-indigo-800 hover:to-violet-800" : today ? "bg-blue-100 font-semibold text-blue-900 ring-1 ring-inset ring-blue-300" : "text-slate-700"}`}>
									{date.getDate()}{hasItems && <i className={`absolute bottom-1.5 size-1 rounded-full ${selected ? "bg-white" : "bg-indigo-500"}`} />}
								</button>;
							})}
						</div>
						<div className="mt-4 flex gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-blue-600 ring-2 ring-blue-100" /> Today</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-indigo-600" /> Has groceries</span></div>
					</CardContent>
				</Card>
				<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0">
					<CardHeader className="flex flex-row items-center gap-3 border-b border-blue-900/10 bg-linear-to-r from-blue-800 via-indigo-800 to-violet-800 p-5">
						<span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10"><span className="text-[9px] font-semibold uppercase">{dateLabel(selectedDate, { month: "short" })}</span><strong className="text-lg leading-5">{selectedDate.getDate()}</strong></span>
						<div className="min-w-0 flex-1"><CardTitle className="text-white">{selectedKey === getDateKey(new Date()) ? "Today’s list" : dateLabel(selectedDate, { weekday: "long" })}</CardTitle><p className="mt-1 text-xs text-blue-100/80">{dateLabel(selectedDate, { month: "long", day: "numeric", year: "numeric" })}</p></div>
						<Button type="button" variant="outline" size="icon-sm" className="size-8 shrink-0 touch-manipulation rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setDialogEntry("new")} aria-label="Add an item"><Plus size={16} strokeWidth={2.5} /></Button>
					</CardHeader>
					<CardContent className="p-5">
						<GrocerySummary items={dayItems} doneCount={doneCount} />
						<GroceryList items={dayItems} onUpdate={updateItem} onEdit={setDialogEntry} onAdd={() => setDialogEntry("new")} />
					</CardContent>
				</Card>
			</div>
			<p className="flex items-center gap-2 rounded-lg border border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50/50 p-3 text-xs text-blue-950/70"><CalendarDays size={16} className="text-blue-600" /> Choose a day on the calendar to create and view its own saved grocery list.</p>
			<GroceryDialog
				open={dialogEntry !== null}
				entry={dialogEntry && dialogEntry !== "new" ? dialogEntry : null}
				selectedDate={selectedDate}
				onOpenChange={(open) => { if (!open) setDialogEntry(null); }}
				onSubmit={submitGrocery}
			/>
		</>
	);
}
