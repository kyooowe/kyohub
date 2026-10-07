"use client";

import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Baby, Bell, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BabyNeedDialog } from "@/features/baby-needs/components/baby-need-dialog";
import { BabyNeedsList } from "@/features/baby-needs/components/baby-needs-list";
import { BabySummary } from "@/features/baby-needs/components/baby-summary";
import { UpcomingNeeds } from "@/features/baby-needs/components/upcoming-needs";
import { createBabyNeed, deleteBabyNeed, getBabyNeeds, importLegacyBabyNeeds, updateBabyNeed, type BabyNeedRecord } from "@/features/baby-needs/actions/baby-needs-actions";
import { dateLabel, getDateKey } from "@/features/grocery/lib/grocery-utils";
import { getUpcomingVaccine } from "@/features/baby-needs/lib/baby-needs-utils";
import type { BabyNeed } from "@/features/baby-needs/types";

const storageKey = "kyooowe-baby-needs-v1";

function groupByDate(entries: BabyNeedRecord[]) {
	return entries.reduce<Record<string, BabyNeed[]>>((grouped, { dateKey, ...need }) => {
		(grouped[dateKey] ??= []).push(need);
		return grouped;
	}, {});
}

export function BabyNeeds() {
	const [needs, setNeeds] = useState<Record<string, BabyNeed[]>>({});
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const [dialogEntry, setDialogEntry] = useState<BabyNeed | "new" | null>(null);
	const [ready, setReady] = useState(false);
	const [storageError, setStorageError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		let active = true;
		async function loadNeeds() {
			try {
				const saved = localStorage.getItem(storageKey);
				let entries = await getBabyNeeds();
				if (saved !== null) {
					const legacy = Object.entries(JSON.parse(saved) as Record<string, BabyNeed[]>)
						.flatMap(([dateKey, items]) => items.map((item) => ({ ...item, dateKey })));
					await importLegacyBabyNeeds(legacy);
					localStorage.removeItem(storageKey);
					entries = await getBabyNeeds();
				}
				if (active) setNeeds(groupByDate(entries));
			} catch (error) {
				if (active) setStorageError(error instanceof Error ? `Could not load baby needs: ${error.message}` : "Could not load baby needs from the database.");
			} finally {
				if (active) setReady(true);
			}
		}
		void loadNeeds();
		return () => { active = false; };
	}, []);

	const dateKey = getDateKey(selectedDate);
	const dayNeeds = needs[dateKey] ?? [];
	const todayKey = getDateKey(new Date());
	const upcoming = getUpcomingVaccine(needs, todayKey);
	const calendar = useMemo(() => {
		const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
		const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
		return Array.from({ length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 }, (_, index) => {
			const day = index - firstWeekday + 1;
			return day > 0 && day <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), day) : null;
		});
	}, [month]);

	async function submitNeed(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		const data = new FormData(event.currentTarget);
		const title = String(data.get("title")).trim();
		const type = data.get("type");
		if (!title || (type !== "Vaccination" && type !== "Important date")) {
			setStorageError("Enter a title and choose a valid reminder type.");
			return;
		}
		const source = dialogEntry && dialogEntry !== "new" ? dialogEntry : null;
		const cryptoApi = globalThis.crypto;
		const id = source?.id ?? (typeof cryptoApi?.randomUUID === "function" ? cryptoApi.randomUUID() : `${Date.now()}-${Math.random()}`);
		const entry: BabyNeed = { id, title, type, notes: String(data.get("notes")).trim(), done: source?.done ?? false };
		try {
			if (source) await updateBabyNeed(id, entry);
			else await createBabyNeed({ ...entry, dateKey });
			setNeeds(groupByDate(await getBabyNeeds()));
			setStorageError("");
			setDialogEntry(null);
		} catch (error) {
			setStorageError(error instanceof Error ? `Could not save baby need: ${error.message}` : "Could not save baby need.");
		} finally {
			setSubmitting(false);
		}
	}

	async function updateNeed(id: string, update: (item: BabyNeed) => BabyNeed | null) {
		if (submitting) return;
		const item = dayNeeds.find((entry) => entry.id === id);
		if (!item) return;
		const updated = update(item);
		setSubmitting(true);
		try {
			if (updated) await updateBabyNeed(id, updated);
			else await deleteBabyNeed(id);
			setNeeds(groupByDate(await getBabyNeeds()));
			setStorageError("");
		} catch (error) {
			setStorageError(error instanceof Error ? `Could not update baby need: ${error.message}` : "Could not update baby need.");
		} finally {
			setSubmitting(false);
		}
	}

	return <>
		{storageError && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{storageError}</div>}
		{!ready && <LoadingIndicator />}
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div><p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-teal-700"><span className="grid size-6 place-items-center rounded-md bg-teal-100"><Baby size={15} /></span> BABY NEEDS</p><h1 className="bg-linear-to-r from-slate-900 via-teal-950 to-cyan-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">Kyooowe Needs</h1><p className="mt-1 text-sm text-slate-500">Keep vaccinations and important little milestones in one place.</p></div>
			<Button type="button" disabled={submitting} className="min-h-11 border-0 bg-linear-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-400/40" onClick={() => setDialogEntry("new")}><Plus size={17} /> Add baby need</Button>
		</div>
		<UpcomingNeeds need={upcoming} />
		<div className="grid items-start gap-5 lg:grid-cols-2">
			<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0">
				<CardHeader className="gap-4 border-b border-teal-900/10 bg-linear-to-r from-teal-800 via-teal-700 to-cyan-700 p-5 text-white">
					<div className="flex items-center justify-between gap-3"><div><CardTitle className="text-white">Baby calendar</CardTitle><p className="mt-1 text-xs text-teal-100/85">Vaccines and important dates at a glance.</p></div><div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} strokeWidth={2.5} /></Button><span className="min-w-28 text-center text-sm font-bold text-white">{dateLabel(month, { month: "long", year: "numeric" })}</span><Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} strokeWidth={2.5} /></Button></div></div>
				</CardHeader>
				<CardContent className="p-5 pt-0"><div className="grid grid-cols-7 gap-1 text-center">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="grid h-8 place-items-center text-xs font-semibold text-slate-400">{day}</span>)}{calendar.map((date, index) => {
					if (!date) return <span key={index} />;
					const key = getDateKey(date);
					const selected = key === dateKey;
					const today = key === todayKey;
					const dayNeedsForDate = needs[key] ?? [];
					const hasVaccine = dayNeedsForDate.some((need) => need.type === "Vaccination" && !need.done);
					const hasImportantDate = dayNeedsForDate.some((need) => need.type === "Important date" && !need.done);
					const markers = [hasVaccine ? "upcoming vaccine" : "", hasImportantDate ? "important date" : ""].filter(Boolean).join(" and ");
					return <button type="button" key={key} onClick={() => setSelectedDate(date)} aria-label={`${dateLabel(date, { dateStyle: "full" })}${markers ? `, ${markers}` : ""}`} className={`relative grid aspect-square place-items-center rounded-xl text-sm transition-all hover:bg-teal-100 ${selected ? "bg-linear-to-br from-teal-700 via-teal-700 to-cyan-700 font-semibold text-white shadow-lg shadow-teal-300 hover:from-teal-800 hover:to-cyan-800" : hasVaccine ? "bg-amber-50 font-semibold text-amber-900 ring-1 ring-inset ring-amber-200" : hasImportantDate ? "bg-rose-50 font-semibold text-rose-900 ring-1 ring-inset ring-rose-200" : today ? "bg-teal-50 font-semibold text-teal-900 ring-1 ring-inset ring-teal-300" : "text-slate-700"}`}>
						{date.getDate()}
						{(hasVaccine || hasImportantDate) && <span className="absolute bottom-1.5 flex gap-0.5">{hasVaccine && <i className={`size-1 rounded-full ${selected ? "bg-amber-200" : "bg-amber-500"}`} />}{hasImportantDate && <i className={`size-1 rounded-full ${selected ? "bg-rose-200" : "bg-rose-500"}`} />}</span>}
					</button>;
				})}</div><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-teal-600 ring-2 ring-teal-100" /> Today</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-amber-500" /> Vaccine</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-rose-500" /> Important date</span></div></CardContent>
			</Card>
			<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0">
				<CardHeader className="flex flex-row items-center gap-3 border-b border-teal-900/10 bg-linear-to-r from-teal-800 via-teal-700 to-cyan-700 p-5"><span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10"><span className="text-[9px] font-semibold uppercase">{dateLabel(selectedDate, { month: "short" })}</span><strong className="text-lg leading-5">{selectedDate.getDate()}</strong></span><div className="min-w-0 flex-1"><CardTitle className="text-white">{dateKey === todayKey ? "Today’s needs" : "Baby’s needs"}</CardTitle><p className="mt-1 text-xs text-teal-100/85">{dateLabel(selectedDate, { month: "long", day: "numeric", year: "numeric" })}</p></div><Button type="button" disabled={submitting} variant="outline" size="icon-sm" className="size-8 shrink-0 touch-manipulation rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setDialogEntry("new")} aria-label="Add a baby need"><Plus size={16} strokeWidth={2.5} /></Button></CardHeader>
				<CardContent className="p-5"><BabySummary needs={dayNeeds} /><BabyNeedsList needs={dayNeeds} onUpdate={updateNeed} onEdit={setDialogEntry} onAdd={() => setDialogEntry("new")} submitting={submitting} /></CardContent>
			</Card>
		</div>
		<p className="flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 p-3 text-xs text-teal-950/70"><Bell size={16} className="text-teal-700" /> Choose a day to manage your baby’s vaccinations and important dates.</p>
		<BabyNeedDialog entry={dialogEntry} selectedDate={selectedDate} onOpenChange={(open) => { if (!open && !submitting) setDialogEntry(null); }} onSubmit={submitNeed} submitting={submitting} />
	</>;
}
