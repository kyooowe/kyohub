"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { FamilyAppointmentDialog } from "@/features/family-calendar/components/family-appointment-dialog";
import { FamilyAppointmentsList } from "@/features/family-calendar/components/family-appointments-list";
import { FamilyCalendarSummary } from "@/features/family-calendar/components/family-calendar-summary";
import { UpcomingFamilyAppointment } from "@/features/family-calendar/components/upcoming-family-appointments";
import { createFamilyAppointment, deleteFamilyAppointment, getFamilyAppointments, updateFamilyAppointment, type FamilyAppointmentRecord } from "@/features/family-calendar/actions/family-calendar-actions";
import { dateLabel, getDateKey } from "@/features/grocery/lib/grocery-utils";
import { getUpcomingImportantDate, getUpcomingVaccine } from "@/features/family-calendar/lib/family-calendar-utils";
import { isFamilyAppointmentType, type FamilyAppointment } from "@/features/family-calendar/family-calendar-types";

function groupByDate(entries: FamilyAppointmentRecord[]) {
	return entries.reduce<Record<string, FamilyAppointment[]>>((grouped, { dateKey, ...need }) => {
		(grouped[dateKey] ??= []).push(need);
		return grouped;
	}, {});
}

export function FamilyCalendar({ initialEntries, initialError }: { initialEntries: FamilyAppointmentRecord[]; initialError: string }) {
	const [needs, setNeeds] = useState<Record<string, FamilyAppointment[]>>(() => groupByDate(initialEntries));
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	const [dialogEntry, setDialogEntry] = useState<FamilyAppointment | "new" | null>(null);
	const [storageError, setStorageError] = useState(initialError);
	const [submitting, setSubmitting] = useState(false);

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
		if (!title || !isFamilyAppointmentType(type)) {
			setStorageError("Enter a title and choose a valid event type.");
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
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div><p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-teal-700 dark:text-teal-300"><span className="grid size-6 place-items-center rounded-md bg-teal-100 dark:bg-teal-950"><CalendarDays size={15} /></span> FAMILY CALENDAR</p><h1 className="bg-linear-to-r from-slate-900 via-teal-950 to-cyan-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-slate-100 dark:via-teal-200 dark:to-cyan-300 md:text-3xl">Family Calendar</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Keep family appointments, birthdays, holidays, and important dates in one place.</p></div>
			<Button type="button" disabled={submitting} className="min-h-11 border-0 bg-linear-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-400/40 dark:shadow-teal-950/70 dark:hover:shadow-teal-950/80" onClick={() => setDialogEntry("new")}><Plus size={17} /> Add appointment</Button>
		</div>
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
				<FeatureSectionHeader theme="teal" icon={CalendarDays} title="Family calendar" description="Appointments, birthdays, holidays, and important dates." className="min-h-[104px]">
					<div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
						<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} strokeWidth={2.5} /></Button>
						<span className="min-w-28 text-center text-sm font-bold text-white">{dateLabel(month, { month: "long", year: "numeric" })}</span>
						<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} strokeWidth={2.5} /></Button>
					</div>
				</FeatureSectionHeader>
				<CardContent className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_40px_-28px_rgba(15,118,110,0.5)] ring-1 ring-white/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 dark:ring-slate-800 sm:p-5"><div className="grid grid-cols-7 gap-2 text-center">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="grid h-9 place-items-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{day}</span>)}{calendar.map((date, index) => {
					if (!date) return <span key={index} className="aspect-square" />;
					const key = getDateKey(date);
					const selected = key === dateKey;
					const today = key === todayKey;
					const dayNeedsForDate = needs[key] ?? [];
					const hasVaccine = dayNeedsForDate.some((need) => need.type === "Vaccination");
					const hasImportantDate = dayNeedsForDate.some((need) => need.type === "Important date");
					const hasHoliday = dayNeedsForDate.some((need) => need.type === "Holiday");
					const hasBirthday = dayNeedsForDate.some((need) => need.type === "Birthday");
					const markers = [
						hasVaccine ? "upcoming vaccine" : "",
						hasImportantDate ? "important date" : "",
						hasHoliday ? "holiday" : "",
						hasBirthday ? "birthday" : "",
					].filter(Boolean).join(" and ");
					const dayStyle = selected && hasVaccine
						? "bg-amber-500 font-semibold text-white shadow-lg shadow-amber-500/25 ring-2 ring-inset ring-white/80 dark:bg-amber-600 dark:shadow-amber-950/70"
						: selected && hasImportantDate
							? "bg-rose-500 font-semibold text-white shadow-lg shadow-rose-500/25 ring-2 ring-inset ring-white/80 dark:bg-rose-600 dark:shadow-rose-950/70"
							: selected && hasHoliday
								? "bg-teal-500 font-semibold text-white shadow-lg shadow-teal-500/25 ring-2 ring-inset ring-white/80 dark:bg-teal-600 dark:shadow-teal-950/70"
								: selected && hasBirthday
									? "bg-purple-500 font-semibold text-white shadow-lg shadow-purple-500/25 ring-2 ring-inset ring-white/80 dark:bg-purple-600 dark:shadow-purple-950/70"
					: selected && today
						? "bg-linear-to-br from-emerald-500 to-teal-600 font-semibold text-white shadow-lg shadow-emerald-500/25 ring-2 ring-inset ring-white/80 dark:shadow-emerald-950/70"
						: selected
							? "bg-linear-to-br from-teal-600 to-cyan-600 font-semibold text-white shadow-lg shadow-teal-500/25 ring-1 ring-teal-500 dark:shadow-teal-950/70"
							: today
									? "bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-inset ring-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:ring-emerald-800"
								: hasVaccine
										? "bg-amber-50 text-amber-950 ring-1 ring-inset ring-amber-200/80 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-200 dark:ring-amber-800"
									: hasImportantDate
											? "bg-rose-50 text-rose-950 ring-1 ring-inset ring-rose-200/80 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-200 dark:ring-rose-800"
										: hasHoliday
												? "bg-teal-50 text-teal-950 ring-1 ring-inset ring-teal-200/80 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-200 dark:ring-teal-800"
											: hasBirthday
													? "bg-purple-50 text-purple-950 ring-1 ring-inset ring-purple-200/80 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-200 dark:ring-purple-800"
												: "bg-slate-50/70 text-slate-700 hover:bg-white hover:text-teal-800 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800";
					return <button type="button" key={key} data-page-palette-preserve={today || hasVaccine || hasImportantDate || hasHoliday || hasBirthday ? true : undefined} onClick={() => setSelectedDate(date)} aria-pressed={selected} aria-current={today ? "date" : undefined} aria-label={`${dateLabel(date, { dateStyle: "full" })}${markers ? `, ${markers}` : ""}`} className={`relative grid aspect-square place-items-center rounded-2xl text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${dayStyle}`}>
						{date.getDate()}
						{(hasVaccine || hasImportantDate || hasHoliday || hasBirthday) && <span aria-hidden="true" className="absolute bottom-1.5 flex gap-1">{hasVaccine && <i className={`size-1.5 rounded-full ${selected ? "bg-white" : "bg-amber-500"}`} />}{hasImportantDate && <i className={`size-1.5 rounded-full ${selected ? "bg-white" : "bg-rose-500"}`} />}{hasHoliday && <i className={`size-1.5 rounded-full ${selected ? "bg-white" : "bg-teal-500"}`} />}{hasBirthday && <i className={`size-1.5 rounded-full ${selected ? "bg-white" : "bg-purple-500"}`} />}</span>}
					</button>;
				})}</div><div data-page-palette-preserve className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50"><div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="size-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100 dark:ring-emerald-950" /> Today</span><span className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="size-2 rounded-full bg-amber-500" /> Vaccine</span><span className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="size-2 rounded-full bg-rose-500" /> Important date</span><span className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="size-2 rounded-full bg-teal-500" /> Holiday</span><span className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><i className="size-2 rounded-full bg-purple-500" /> Birthday</span></div></div></CardContent>
			</Card>
			<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
				<FeatureSectionHeader theme="teal" icon={CalendarDays} title={dateKey === todayKey ? "Today’s appointments" : "Family appointments"} description={dateLabel(selectedDate, { month: "long", day: "numeric", year: "numeric" })} mobileRow className="min-h-[104px]">
					<div className="flex shrink-0 items-center gap-2">
						<span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10"><span className="text-[9px] font-semibold uppercase">{dateLabel(selectedDate, { month: "short" })}</span><strong className="text-lg leading-5">{selectedDate.getDate()}</strong></span>
						<Button type="button" disabled={submitting} variant="outline" size="icon-sm" className="size-9 shrink-0 touch-manipulation rounded-xl border border-white/25 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setDialogEntry("new")} aria-label="Add an appointment"><Plus size={16} strokeWidth={2.5} /></Button>
					</div>
				</FeatureSectionHeader>
				<CardContent className="rounded-2xl border border-teal-100 bg-white p-4 shadow-lg shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-5"><FamilyCalendarSummary needs={dayNeeds} /><FamilyAppointmentsList needs={dayNeeds} onUpdate={updateNeed} onEdit={setDialogEntry} onAdd={() => setDialogEntry("new")} submitting={submitting} /></CardContent>
			</Card>
		</div>
		<p className="flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50 p-3 text-xs text-teal-950/70 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-200"><Bell size={16} className="shrink-0 text-teal-700 dark:text-teal-300" /><span><strong>Family calendar:</strong> Keep appointments, birthdays, holidays, and important dates organized in one place.</span></p>
		<FamilyAppointmentDialog entry={dialogEntry} selectedDate={selectedDate} onOpenChange={(open) => { if (!open && !submitting) setDialogEntry(null); }} onSubmit={submitNeed} submitting={submitting} />
	</>;
}
