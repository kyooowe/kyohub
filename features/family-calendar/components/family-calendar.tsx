"use client";

import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { FamilyAppointmentDialog } from "@/features/family-calendar/components/family-appointment-dialog";
import { FamilyAppointmentsList } from "@/features/family-calendar/components/family-appointments-list";
import { FamilyCalendarSummary } from "@/features/family-calendar/components/family-calendar-summary";
import { UpcomingFamilyAppointment } from "@/features/family-calendar/components/upcoming-family-appointments";
import { FamilyReminderSettings } from "@/features/family-calendar/components/family-reminder-settings";
import { createFamilyAppointment, deleteFamilyAppointment, getFamilyAppointments, updateFamilyAppointment, type FamilyAppointmentRecord } from "@/features/family-calendar/actions/family-calendar-actions";
import { dateLabel, getDateKey } from "@/features/grocery/lib/grocery-utils";
import { getUpcomingImportantDate, getUpcomingVaccine } from "@/features/family-calendar/lib/family-calendar-utils";
import type { FamilyAppointment } from "@/features/family-calendar/family-calendar-types";

function groupByDate(entries: FamilyAppointmentRecord[]) {
	return entries.reduce<Record<string, FamilyAppointment[]>>((grouped, { dateKey, ...need }) => {
		(grouped[dateKey] ??= []).push(need);
		return grouped;
	}, {});
}

export function FamilyCalendar() {
	const [needs, setNeeds] = useState<Record<string, FamilyAppointment[]>>({});
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const [dialogEntry, setDialogEntry] = useState<FamilyAppointment | "new" | null>(null);
	const [ready, setReady] = useState(false);
	const [storageError, setStorageError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		let active = true;
		async function loadNeeds() {
			try {
				const entries = await getFamilyAppointments();
				if (active) setNeeds(groupByDate(entries));
			} catch (error) {
				if (active) setStorageError(error instanceof Error ? `Could not load family calendar: ${error.message}` : "Could not load family calendar from the database.");
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
	const upcomingImportantDate = getUpcomingImportantDate(needs, todayKey);
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
		const entry: FamilyAppointment = { id, title, type, notes: String(data.get("notes")).trim(), done: source?.done ?? false };
		try {
			if (source) await updateFamilyAppointment(id, entry);
			else await createFamilyAppointment({ ...entry, dateKey });
			setNeeds(groupByDate(await getFamilyAppointments()));
			setStorageError("");
			setDialogEntry(null);
		} catch (error) {
			setStorageError(error instanceof Error ? `Could not save appointment: ${error.message}` : "Could not save appointment.");
		} finally {
			setSubmitting(false);
		}
	}

	async function updateNeed(id: string, update: (item: FamilyAppointment) => FamilyAppointment | null) {
		if (submitting) return;
		const item = dayNeeds.find((entry) => entry.id === id);
		if (!item) return;
		const updated = update(item);
		setSubmitting(true);
		try {
			if (updated) await updateFamilyAppointment(id, updated);
			else await deleteFamilyAppointment(id);
			setNeeds(groupByDate(await getFamilyAppointments()));
			setStorageError("");
		} catch (error) {
			setStorageError(error instanceof Error ? `Could not update appointment: ${error.message}` : "Could not update appointment.");
		} finally {
			setSubmitting(false);
		}
	}

	return <>
		{storageError && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">{storageError}</div>}
		{!ready && <LoadingIndicator />}
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div><p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-teal-700 dark:text-teal-300"><span className="grid size-6 place-items-center rounded-md bg-teal-100 dark:bg-teal-950"><CalendarDays size={15} /></span> FAMILY CALENDAR</p><h1 className="bg-linear-to-r from-slate-900 via-teal-950 to-cyan-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-slate-100 dark:via-teal-200 dark:to-cyan-300 md:text-3xl">Family Calendar</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Keep family appointments, vaccinations, and important dates in one place.</p></div>
			<Button type="button" disabled={submitting} className="min-h-11 border-0 bg-linear-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-400/40 dark:shadow-teal-950/70 dark:hover:shadow-teal-950/80" onClick={() => setDialogEntry("new")}><Plus size={17} /> Add appointment</Button>
		</div>
		<FamilyReminderSettings />
		<div className="flex flex-col gap-3">
			{upcoming && (
				<UpcomingFamilyAppointment need={upcoming} kind="vaccine" />
			)}
			{upcomingImportantDate && (
				<UpcomingFamilyAppointment need={upcomingImportantDate} kind="important" />
			)}
		</div>
		<div className="grid items-start gap-5 lg:grid-cols-2">
			<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
				<FeatureSectionHeader theme="teal" icon={CalendarDays} title="Family calendar" description="Appointments and important dates.">
					<div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
						<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} strokeWidth={2.5} /></Button>
						<span className="min-w-28 text-center text-sm font-bold text-white">{dateLabel(month, { month: "long", year: "numeric" })}</span>
						<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} strokeWidth={2.5} /></Button>
					</div>
				</FeatureSectionHeader>
				<CardContent className="rounded-2xl border border-teal-100 bg-white p-4 shadow-lg shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-5"><div className="grid grid-cols-7 gap-1 text-center">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="grid h-8 place-items-center text-xs font-semibold text-slate-400 dark:text-slate-500" >{day}</span>)}{calendar.map((date, index) => {
					if (!date) return <span key={index} />;
					const key = getDateKey(date);
					const selected = key === dateKey;
					const today = key === todayKey;
					const dayNeedsForDate = needs[key] ?? [];
					const hasVaccine = dayNeedsForDate.some((need) => need.type === "Vaccination" && !need.done);
					const hasImportantDate = dayNeedsForDate.some((need) => need.type === "Important date" && !need.done);
					const hasCompletedNeed = dayNeedsForDate.some((need) => need.done);
					const markers = [
						hasVaccine ? "upcoming vaccine" : "",
						hasImportantDate ? "important date" : "",
						hasCompletedNeed ? "completed vaccine or important date" : "",
					].filter(Boolean).join(" and ");
					const dayStyle = selected && today
						? "bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-300 ring-2 ring-inset ring-emerald-300 dark:shadow-emerald-950/70"
						: selected
							? "bg-linear-to-br from-teal-700 via-teal-700 to-cyan-700 font-semibold text-white shadow-lg shadow-teal-300 hover:from-teal-800 hover:to-cyan-800 dark:shadow-teal-950/70"
							: today
									? "bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-inset ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800"
								: hasVaccine
										? "bg-amber-50 font-semibold text-amber-900 ring-1 ring-inset ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800"
									: hasImportantDate
											? "bg-red-50 font-semibold text-red-900 ring-1 ring-inset ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-800"
										: hasCompletedNeed
												? "bg-blue-50 font-semibold text-blue-900 ring-1 ring-inset ring-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-800"
												: "text-slate-700 dark:text-slate-200";
					return <button type="button" key={key} onClick={() => setSelectedDate(date)} aria-label={`${dateLabel(date, { dateStyle: "full" })}${markers ? `, ${markers}` : ""}`} className={`relative grid aspect-square place-items-center rounded-xl text-sm transition-all hover:bg-teal-100 dark:hover:bg-slate-800 ${dayStyle}`}>
						{date.getDate()}
						{(hasVaccine || hasImportantDate || hasCompletedNeed) && <span className="absolute bottom-1.5 flex gap-0.5">{hasVaccine && <i className={`size-1 rounded-full ${selected ? "bg-amber-200" : "bg-amber-500"}`} />}{hasImportantDate && <i className={`size-1 rounded-full ${selected ? "bg-red-200" : "bg-red-500"}`} />}{hasCompletedNeed && <i className={`size-1 rounded-full ${selected ? "bg-blue-200" : "bg-blue-500"}`} />}</span>}
					</button>;
				})}</div><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100 dark:ring-emerald-950" /> Today</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-amber-500" /> Vaccine</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-red-500" /> Important date</span><span className="flex items-center gap-2" title="Completed vaccine or important date"><i className="size-2 rounded-full bg-blue-600" /> Completed</span></div></CardContent>
			</Card>
			<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
				<FeatureSectionHeader theme="teal" icon={CalendarDays} title={dateKey === todayKey ? "Today’s appointments" : "Family appointments"} description={dateLabel(selectedDate, { month: "long", day: "numeric", year: "numeric" })} mobileRow>
					<div className="flex shrink-0 items-center gap-2">
						<span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10"><span className="text-[9px] font-semibold uppercase">{dateLabel(selectedDate, { month: "short" })}</span><strong className="text-lg leading-5">{selectedDate.getDate()}</strong></span>
						<Button type="button" disabled={submitting} variant="outline" size="icon-sm" className="size-9 shrink-0 touch-manipulation rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setDialogEntry("new")} aria-label="Add an appointment"><Plus size={16} strokeWidth={2.5} /></Button>
					</div>
				</FeatureSectionHeader>
				<CardContent className="rounded-2xl border border-teal-100 bg-white p-4 shadow-lg shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-5"><FamilyCalendarSummary needs={dayNeeds} /><FamilyAppointmentsList needs={dayNeeds} onUpdate={updateNeed} onEdit={setDialogEntry} onAdd={() => setDialogEntry("new")} submitting={submitting} /></CardContent>
			</Card>
		</div>
		<p className="flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 p-3 text-xs text-teal-950/70 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-200"><Bell size={16} className="shrink-0 text-teal-700 dark:text-teal-300" /><span><strong>Family calendar:</strong> Keep appointments, vaccinations, and important dates organized in one place.</span></p>
		<FamilyAppointmentDialog entry={dialogEntry} selectedDate={selectedDate} onOpenChange={(open) => { if (!open && !submitting) setDialogEntry(null); }} onSubmit={submitNeed} submitting={submitting} />
	</>;
}
