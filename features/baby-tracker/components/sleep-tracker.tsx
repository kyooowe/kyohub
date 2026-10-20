"use client";

import { useMemo, useState, useEffect, type FormEvent, type CSSProperties } from "react";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";
import {
	Moon,
	Sun,
	Sunrise,
	Sunset,
	Clock,
	Plus,
	Trash2,
	Pencil,
	Sparkles,
	CheckCircle2,
	CheckCircle,
	Check,
	Loader2,
	Search,
	Play,
	Bed,
	Activity,
	ArrowRight,
	Grid2X2,
	Calendar,
	TrendingUp,
	Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
} from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import type { PagePalette } from "@/components/settings/page-palettes";
import type { BabySleepLog, SleepType, SleepStatus } from "../types";
import {
	formatDurationMinutes,
	formatRelativeTime,
	getSleepStats,
	getSleepComparisonData,
	isSameDay,
	detectSleepPeriod,
} from "../lib/baby-tracker-utils";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";

interface SleepTrackerProps {
	logs: BabySleepLog[];
	babyMonthAge?: number;
	onStartSleep: (data?: { sleepType?: SleepType; notes?: string }) => Promise<void>;
	onWakeUp: (data?: { id?: string; notes?: string }) => Promise<void>;
	onCreateRecord: (data: {
		startTime: string;
		endTime?: string | null;
		sleepType?: SleepType;
		notes?: string;
	}) => Promise<void>;
	onUpdateRecord: (
		id: string,
		data: {
			startTime?: string;
			endTime?: string | null;
			sleepType?: SleepType;
			notes?: string;
			status?: SleepStatus;
		},
	) => Promise<void>;
	onDeleteRecord: (id: string) => Promise<void>;
	paletteAccent?: string;
	dialogPalette?: PagePalette;
}

export function SleepTracker({
	logs,
	babyMonthAge = 0,
	onStartSleep,
	onWakeUp,
	onCreateRecord,
	onUpdateRecord,
	onDeleteRecord,
	paletteAccent = "#6366F1",
	dialogPalette,
}: SleepTrackerProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [recordToDelete, setRecordToDelete] = useState<BabySleepLog | null>(null);
	const [editingRecord, setEditingRecord] = useState<BabySleepLog | null>(null);
	const [submitting, setSubmitting] = useState(false);

	// Filtering & chart states
	const [activeFilter, setActiveFilter] = useState<"all" | "today" | "night" | "nap">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [chartDaysRange, setChartDaysRange] = useState<7 | 14>(7);
	const [chartMetric, setChartMetric] = useState<"both" | "sleep" | "awake">("both");
	const [showTargetLine, setShowTargetLine] = useState(true);


	// Alert hook (in-page alert, NO toasts)
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(4000);

	// Manual modal form states
	const [formStartTime, setFormStartTime] = useState("");
	const [formEndTime, setFormEndTime] = useState("");
	const [formNotes, setFormNotes] = useState("");
	const [formIsStillSleeping, setFormIsStillSleeping] = useState(false);

	// Auto-detected sleep session period based on start time
	const detectedPeriod = useMemo(
		() => detectSleepPeriod(formStartTime ? new Date(formStartTime) : new Date()),
		[formStartTime],
	);

	// Stats
	const stats = useMemo(() => getSleepStats(logs, babyMonthAge), [logs, babyMonthAge]);
	const activeSession = stats.activeSession;

	// Live ticking stopwatch when baby is sleeping
	const [nowTime, setNowTime] = useState(() => Date.now());

	useEffect(() => {
		if (!activeSession) return;
		const interval = setInterval(() => {
			setNowTime(Date.now());
		}, 1000);
		return () => clearInterval(interval);
	}, [activeSession]);

	const liveElapsedSeconds = useMemo(() => {
		if (!activeSession) return 0;
		const start = new Date(activeSession.startTime).getTime();
		return Math.max(0, Math.floor((nowTime - start) / 1000));
	}, [activeSession, nowTime]);

	const formattedLiveStopwatch = useMemo(() => {
		const hrs = Math.floor(liveElapsedSeconds / 3600);
		const mins = Math.floor((liveElapsedSeconds % 3600) / 60);
		const secs = liveElapsedSeconds % 60;
		if (hrs > 0) {
			return `${hrs}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
		}
		return `${mins}m ${secs.toString().padStart(2, "0")}s`;
	}, [liveElapsedSeconds]);

	// Comparison chart data
	const comparisonData = useMemo(() => {
		return getSleepComparisonData(logs, chartDaysRange, babyMonthAge);
	}, [logs, chartDaysRange, babyMonthAge]);

	// Filtered history list
	const today = useMemo(() => new Date(), []);
	const displayedLogs = useMemo(() => {
		return logs.filter((log) => {
			if (activeFilter === "today") {
				const start = new Date(log.startTime);
				if (!isSameDay(start, today)) return false;
			}
			const period = detectSleepPeriod(log.startTime);
			if (activeFilter === "night" && !period.isNight) return false;
			if (activeFilter === "nap" && period.isNight) return false;

			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const matchesNotes = log.notes?.toLowerCase().includes(q);
				const matchesType =
					log.sleepType.toLowerCase().includes(q) ||
					period.label.toLowerCase().includes(q) ||
					period.period.toLowerCase().includes(q);
				if (!matchesNotes && !matchesType) return false;
			}
			return true;
		});
	}, [logs, activeFilter, searchQuery, today]);

	/* -------------------------------------------------------------------------- */
	/*                               Action Handlers                              */
	/* -------------------------------------------------------------------------- */

	// One-tap: Put baby to sleep
	async function handlePutToSleep() {
		if (submitting) return;
		setSubmitting(true);
		try {
			await onStartSleep();
			showAlert(
				"BABY IS ASLEEP",
				"Sleep mode started! Counting sleep until baby wakes up 🌙✨",
			);
		} catch (err) {
			showAlert("ERROR", err instanceof Error ? err.message : "Failed to put baby to sleep mode");
		} finally {
			setSubmitting(false);
		}
	}

	// One-tap: Baby woke up!
	async function handleWakeUp() {
		if (submitting || !activeSession) return;
		setSubmitting(true);
		try {
			const start = new Date(activeSession.startTime).getTime();
			const now = Date.now();
			const totalMins = Math.max(1, Math.round((now - start) / 60000));
			const formattedDuration = formatDurationMinutes(totalMins);

			await onWakeUp({ id: activeSession.id });
			showAlert(
				"BABY WOKE UP",
				`Sweet dreams! Baby slept for ${formattedDuration} ☀️`,
			);
		} catch (err) {
			showAlert("ERROR", err instanceof Error ? err.message : "Failed to record wake up mode");
		} finally {
			setSubmitting(false);
		}
	}

	function openCreateModal() {
		const now = new Date();
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

		// Format to YYYY-MM-DDTHH:mm for datetime-local input
		const toLocalIso = (d: Date) => {
			const pad = (n: number) => n.toString().padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
		};

		setEditingRecord(null);
		setFormStartTime(toLocalIso(oneHourAgo));
		setFormEndTime(toLocalIso(now));
		setFormNotes("");
		setFormIsStillSleeping(false);
		setDialogOpen(true);
	}

	function openEditModal(record: BabySleepLog) {
		const toLocalIso = (dString: string) => {
			const d = new Date(dString);
			const pad = (n: number) => n.toString().padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
		};

		setEditingRecord(record);
		setFormStartTime(toLocalIso(record.startTime));
		setFormEndTime(record.endTime ? toLocalIso(record.endTime) : "");
		setFormNotes(record.notes || "");
		setFormIsStillSleeping(record.status === "sleeping" || !record.endTime);
		setDialogOpen(true);
	}

	async function handleSaveManualRecord(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;

		if (!formStartTime) {
			showAlert("VALIDATION ERROR", "Start time is required.");
			return;
		}

		if (!formIsStillSleeping && formEndTime) {
			const startMs = new Date(formStartTime).getTime();
			const endMs = new Date(formEndTime).getTime();
			if (endMs <= startMs) {
				showAlert("VALIDATION ERROR", "Wake up time must be after sleep start time.");
				return;
			}
		}

		setSubmitting(true);
		const autoSleepType = detectSleepPeriod(formStartTime).period;
		try {
			if (editingRecord) {
				await onUpdateRecord(editingRecord.id, {
					startTime: new Date(formStartTime).toISOString(),
					endTime: formIsStillSleeping ? null : formEndTime ? new Date(formEndTime).toISOString() : null,
					sleepType: autoSleepType,
					notes: formNotes.trim(),
					status: formIsStillSleeping ? "sleeping" : "completed",
				});
				showAlert("RECORD UPDATED", "Sleep record updated successfully!");
			} else {
				await onCreateRecord({
					startTime: new Date(formStartTime).toISOString(),
					endTime: formIsStillSleeping ? null : formEndTime ? new Date(formEndTime).toISOString() : null,
					sleepType: autoSleepType,
					notes: formNotes.trim(),
				});
				showAlert("RECORD SAVED", "Sleep session recorded successfully! 🌙");
			}
			setDialogOpen(false);
			setEditingRecord(null);
		} catch (err) {
			showAlert("ERROR", err instanceof Error ? err.message : "Failed to save record");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleConfirmDelete() {
		if (!recordToDelete || submitting) return;
		setSubmitting(true);
		try {
			await onDeleteRecord(recordToDelete.id);
			showAlert("RECORD DELETED", "Sleep session log removed successfully.");
			setDeleteDialogOpen(false);
			setRecordToDelete(null);
		} catch (err) {
			showAlert("ERROR", err instanceof Error ? err.message : "Failed to delete record");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6">
			{/* Alert notification banner */}
			<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />

			{/* ==================================================================== */}
			{/* HERO: One-Tap Sleep Mode Action Station                              */}
			{/* ==================================================================== */}
			<div className="relative isolate overflow-hidden rounded-3xl border border-indigo-200/80 bg-linear-to-br from-indigo-950 via-slate-900 to-slate-950 p-4 sm:p-6 text-white shadow-md ring-1 ring-white/10 dark:border-indigo-900/60">
				{/* Decorative soft glowing night stars */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-indigo-500/15 blur-3xl"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -left-10 -bottom-10 size-48 rounded-full bg-purple-500/15 blur-3xl"
				/>

				{activeSession ? (
					/* SLEEPING MODE ACTIVE */
					<div className="relative flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
						<div className="flex flex-col sm:flex-row items-center gap-4">
							{/* Pulsing moon badge */}
							<div className="relative">
								<span className="absolute -inset-1 animate-ping rounded-2xl bg-indigo-400/30 opacity-75" />
								<div className="relative grid size-16 place-items-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg ring-1 ring-white/20">
									<Moon size={32} className="animate-pulse" />
								</div>
							</div>

							<div>
								<div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-sm border border-indigo-400/30">
									<span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
									<span>BABY IS SLEEPING PEACEFULLY</span>
								</div>

								<div className="mt-2">
									<p className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
										{formattedLiveStopwatch}
									</p>
									<p className="mt-1 text-xs text-indigo-200/80">
										Fell asleep at{" "}
										{new Date(activeSession.startTime).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}{" "}
										({formatRelativeTime(activeSession.startTime)})
										{activeSession.notes && ` · "${activeSession.notes}"`}
									</p>
								</div>
							</div>
						</div>

						{/* Wake Up One-Tap Button */}
						<div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-2.5">
							<button
								type="button"
								onClick={handleWakeUp}
								disabled={submitting}
								className="group relative flex w-full sm:w-auto h-12 items-center justify-center gap-2.5 rounded-2xl bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 px-6 font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-102 hover:shadow-amber-500/30 active:scale-98 disabled:opacity-50"
							>
								<Sun size={20} className="transition-transform group-hover:rotate-45" />
								<span className="text-sm uppercase tracking-wide">Baby Woke Up!</span>
							</button>

							<button
								type="button"
								onClick={() => openEditModal(activeSession)}
								className="text-xs text-indigo-300 hover:text-white underline underline-offset-4 py-1"
							>
								Edit start time
							</button>
						</div>
					</div>
				) : (
					/* AWAKE MODE: ONE-TAP TO SLEEP */
					<div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="space-y-1">
							<div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200">
								<Bed size={13} />
								<span>ONE-TAP SLEEP STATION</span>
							</div>
							<h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
								Put Baby to Sleep Mode
							</h2>
							<p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
								Tap once when putting your baby down. Antigravity Baby Tracker will automatically count every hour and minute asleep until you tap wake up.
							</p>
						</div>

						{/* Quick Tap Button */}
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
							{/* One-Tap Click Button */}
							<button
								type="button"
								onClick={handlePutToSleep}
								disabled={submitting}
								className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-linear-to-r from-pink-500 via-rose-500 to-purple-600 px-6 font-bold text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-102 hover:shadow-pink-500/40 active:scale-98 disabled:opacity-50"
							>
								<Play size={18} fill="currentColor" />
								<span className="text-sm tracking-wide">Put Baby to Sleep</span>
							</button>

							{/* Manual Past Sleep CTA */}
							<button
								type="button"
								onClick={openCreateModal}
								className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
								title="Log past sleep session"
							>
								<Plus size={15} />
								<span className="hidden sm:inline">Add Past Sleep</span>
							</button>
						</div>
					</div>
				)}
			</div>

			{/* ==================================================================== */}
			{/* METRIC COUNTERS GRID: Count Sleep & Estimated Hours Per Day          */}
			{/* ==================================================================== */}
			<div data-page-palette-preserve className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
				{/* Card 1: Today's Total Sleep (Sky) */}
				<Card className="metric-summary-card metric-summary-card--sky relative gap-0 overflow-hidden rounded-3xl border border-blue-200 bg-[#f5f8ff] py-0 shadow-sm shadow-blue-950/5 ring-0 transition-shadow hover:shadow-md dark:border-blue-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-2.5 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-2xs">
								<Moon size={16} strokeWidth={2} />
							</span>
							<p title="Total Sleep" className="truncate text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Total Sleep
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-6.5 items-center justify-center gap-1 rounded-full bg-blue-100/90 px-2 text-[9px] font-bold tracking-wider text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
								<Moon size={10} /> {stats.todaySessionCount} {stats.todaySessionCount === 1 ? "SESSION" : "SESSIONS"}
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.todaySleepFormatted}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Goal: {stats.benchmark.minHours}–{stats.benchmark.maxHours} hrs/day
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setActiveFilter("today")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-blue-500/10 px-3 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Card 2: Awake Hours Today (Amber) */}
				<Card className="metric-summary-card metric-summary-card--amber relative gap-0 overflow-hidden rounded-3xl border border-amber-200 bg-[#fffaf0] py-0 shadow-sm shadow-amber-950/5 ring-0 transition-shadow hover:shadow-md dark:border-amber-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-2.5 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-2xs">
								<Sun size={16} strokeWidth={2} />
							</span>
							<p title="Awake Time" className="truncate text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Awake Time
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-6.5 items-center justify-center gap-1 rounded-full bg-amber-100/90 px-2 text-[9px] font-bold tracking-wider text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
								<Sun size={10} /> AWAKE
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.todayAwakeFormatted}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Daytime nursery hours
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setActiveFilter("all")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-amber-500/10 px-3 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Card 3: Estimated Hours Sleep Per Day (Violet) */}
				<Card className="metric-summary-card metric-summary-card--violet relative gap-0 overflow-hidden rounded-3xl border border-violet-200 bg-[#f8f6ff] py-0 shadow-sm shadow-violet-950/5 ring-0 transition-shadow hover:shadow-md dark:border-violet-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-2.5 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-violet-500 text-white shadow-2xs">
								<Activity size={16} strokeWidth={2} />
							</span>
							<p title="Estimated Sleep" className="truncate text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Estimated Sleep
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-6.5 items-center justify-center gap-1 rounded-full bg-emerald-100/80 px-2 text-[9px] font-semibold tracking-wider text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
								<CheckCircle2 size={10} /> {stats.estimatedSleepHoursPerDay >= stats.benchmark.minHours ? "TARGET" : "EST."}
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.estimatedSleepHoursFormatted}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								{stats.benchmark.label}
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setActiveFilter("all")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-violet-500/10 px-3 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Card 4: Last Sleep Status (Teal) */}
				<Card className="metric-summary-card metric-summary-card--teal relative gap-0 overflow-hidden rounded-3xl border border-teal-200 bg-[#eafbf6] py-0 shadow-sm shadow-teal-950/5 ring-0 transition-shadow hover:shadow-md dark:border-teal-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-2.5 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-teal-600 text-white shadow-2xs">
								<Clock size={16} strokeWidth={2} />
							</span>
							<p title="Last Sleep" className="truncate text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Last Sleep
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-6.5 items-center justify-center gap-1 rounded-full bg-teal-100/90 px-2 text-[9px] font-bold tracking-wider text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
								<Clock size={10} /> RECENT
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.lastSession?.durationMinutes
									? formatDurationMinutes(stats.lastSession.durationMinutes)
									: activeSession
									? "Asleep now"
									: "—"}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								{stats.lastSession
									? `${formatRelativeTime(stats.lastSession.startTime)}`
									: "Timeline history"}
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={openCreateModal}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-teal-500/10 px-3 text-[11px] font-medium text-teal-700 transition-colors hover:bg-teal-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-300"
							>
								<ArrowRight size={12} /> Log sleep
							</button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* ==================================================================== */}
			{/* GRAPHS: Daily Sleep vs Wakeup Hours Comparison                       */}
			{/* Styled similar to Monthly Growth Curves Graph UI                     */}
			{/* ==================================================================== */}
			<div className="space-y-3">
				<FeatureSectionHeader
					theme="violet"
					icon={TrendingUp}
					title="Daily Sleep & Wakeup Comparison"
					description="Compare hours slept vs hours awake every day against age target recommendations"
					appearance="soft"
				>
					<div className="password-library-badge hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium sm:flex">
						<span className="grid size-6 place-items-center rounded-full bg-white/75 text-current shadow-sm dark:bg-white/10">
							<Moon size={13} />
						</span>
						Sleep vs Target Curve
					</div>
				</FeatureSectionHeader>

				{/* Graph Toolbar with Segmented Metric Selector & Range Toggles */}
				<div
					style={{ "--password-accent": paletteAccent } as CSSProperties}
					className="password-library-header relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border p-2.5 shadow-md sm:p-3"
				>
					<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-10 size-28 rounded-full" />
					<div className="relative z-10 flex w-full min-w-0 flex-col gap-2.5 sm:gap-3 xl:flex-row xl:items-center xl:justify-between">
						{/* Left controls: Segmented Metric selector */}
						<div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center xl:w-auto">
							<div className="password-filter-mode-group flex w-full shrink-0 items-center gap-1 rounded-xl border p-1 shadow-xs sm:w-auto">
								{(
									[
										{ id: "both", label: "Both", icon: Activity },
										{ id: "sleep", label: "Sleep Hours", icon: Moon },
										{ id: "awake", label: "Awake Time", icon: Sun },
									] as const
								).map((option) => {
									const active = chartMetric === option.id;
									const Icon = option.icon;
									return (
										<button
											key={option.id}
											type="button"
											onClick={() => setChartMetric(option.id)}
											className={`password-filter-mode-option flex-1 sm:flex-initial inline-flex h-8 sm:h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
												active
													? "password-filter-mode-option--active"
													: "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
											}`}
										>
											<Icon size={14} className="shrink-0" />
											<span>{option.label}</span>
										</button>
									);
								})}
							</div>
						</div>

						{/* Right side controls: Target Line toggle & 7/14 Days Range toggle */}
						<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto xl:justify-end">
							{/* Target Curve Toggle */}
							<button
								type="button"
								onClick={() => setShowTargetLine((prev) => !prev)}
								className={`password-row-count-control flex-1 sm:flex-initial inline-flex h-9 sm:h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold shadow-xs transition-colors ${
									showTargetLine
										? "password-filter-mode-option--active"
										: "text-slate-600 hover:text-slate-900 dark:text-slate-300"
								}`}
							>
								<Info size={14} className="shrink-0" />
								<span>{showTargetLine ? "Target Curve On" : "Show Target"}</span>
							</button>

							{/* Range Toggle: 7 Days vs 14 Days */}
							<div className="password-filter-mode-group flex shrink-0 items-center gap-1 rounded-xl border p-1 shadow-xs">
								<button
									type="button"
									onClick={() => setChartDaysRange(7)}
									className={`password-filter-mode-option inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition-all ${
										chartDaysRange === 7
											? "password-filter-mode-option--active"
											: "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300"
									}`}
								>
									7 Days
								</button>
								<button
									type="button"
									onClick={() => setChartDaysRange(14)}
									className={`password-filter-mode-option inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition-all ${
										chartDaysRange === 14
											? "password-filter-mode-option--active"
											: "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300"
									}`}
								>
									14 Days
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Growth Curves Styled Chart Card */}
				<CardContent className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
					{/* Status Assessment Banner at top of chart */}
					<div className="mb-4 flex flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/40">
						<div className="flex items-center gap-2">
							<span className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
								<Sparkles size={14} />
							</span>
							<div>
								<p className="text-xs font-bold text-slate-900 dark:text-slate-100">
									Sleep Recommendation ({stats.benchmark.label})
								</p>
								<p className="text-[11px] text-slate-500 dark:text-slate-400">
									Target: {stats.benchmark.minHours}–{stats.benchmark.maxHours} hrs/day · Recommended: {stats.benchmark.recommendedHours} hrs
								</p>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							{/* Avg Sleep badge */}
							<div className="flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-white px-2.5 py-1 text-xs shadow-2xs dark:border-indigo-900/60 dark:bg-slate-900">
								<Moon size={13} className="text-indigo-600 dark:text-indigo-400" />
								<span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
									Daily Sleep Avg: <strong className="text-slate-900 dark:text-white">{stats.estimatedSleepHoursPerDay} hrs</strong>
								</span>
							</div>

							{/* Target Status badge */}
							<div className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-white px-2.5 py-1 text-xs shadow-2xs dark:border-emerald-900/60 dark:bg-slate-900">
								<CheckCircle2 size={13} className="text-emerald-500" />
								<span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
									Target: <strong className="text-emerald-700 dark:text-emerald-400">{stats.estimatedSleepHoursPerDay >= stats.benchmark.minHours ? "On Track" : "Building Rhythm"}</strong>
								</span>
							</div>
						</div>
					</div>

					<div className="h-72 sm:h-80 w-full min-w-0 max-w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
								<XAxis
									dataKey="displayDate"
									tick={{ fontSize: 11, fill: "#64748b" }}
									axisLine={{ stroke: "#cbd5e1" }}
								/>
								<YAxis
									domain={[0, 24]}
									ticks={[0, 4, 8, 12, 16, 20, 24]}
									tick={{ fontSize: 11, fill: "#64748b" }}
									axisLine={{ stroke: "#cbd5e1" }}
									unit="h"
								/>
								<Tooltip
									content={({ active, payload }) => {
										if (!active || !payload || !payload.length) return null;
										const data = payload[0].payload;
										return (
											<div className="space-y-2 rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
												<p className="text-xs font-bold text-slate-900 dark:text-slate-100">
													{data.displayDate}
												</p>
												<div className="space-y-1">
													<div className="flex items-center justify-between gap-4">
														<span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
															<Moon size={12} /> Sleep Time:
														</span>
														<strong className="text-xs text-slate-900 dark:text-slate-100">
															{data.sleepHours} hrs
														</strong>
													</div>
													<p className="text-[11px] text-slate-500 dark:text-slate-400 pl-4">
														Night: {data.nightHours}h · Naps: {data.napHours}h
													</p>

													<div className="flex items-center justify-between gap-4 pt-1">
														<span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
															<Sun size={12} /> Awake Time:
														</span>
														<strong className="text-xs text-slate-900 dark:text-slate-100">
															{data.wakeHours} hrs
														</strong>
													</div>

													<div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
														<span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
															Age Target:
														</span>
														<span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
															{data.targetHours}h/day
														</span>
													</div>
													<p className="text-[10px] text-slate-400 dark:text-slate-500">
														{data.sessionCount} {data.sessionCount === 1 ? "sleep session" : "sleep sessions"} logged
													</p>
												</div>
											</div>
										);
									}}
								/>

								{/* Sleep Hours Line */}
								{(chartMetric === "both" || chartMetric === "sleep") && (
									<Line
										type="monotone"
										dataKey="sleepHours"
										name="Sleep Time (hrs)"
										stroke="#6366F1"
										strokeWidth={3}
										dot={{ r: 4, fill: "#6366F1" }}
										activeDot={{ r: 6 }}
										connectNulls
									/>
								)}

								{/* Awake Time Line */}
								{(chartMetric === "both" || chartMetric === "awake") && (
									<Line
										type="monotone"
										dataKey="wakeHours"
										name="Awake Time (hrs)"
										stroke="#F59E0B"
										strokeWidth={2.5}
										dot={{ r: 4, fill: "#F59E0B" }}
										activeDot={{ r: 6 }}
										connectNulls
									/>
								)}

								{/* Target Recommendation Line (Dashed) */}
								{showTargetLine && (
									<Line
										type="monotone"
										dataKey="targetHours"
										name="Target Sleep"
										stroke="#10B981"
										strokeWidth={2}
										strokeDasharray="4 4"
										dot={false}
									/>
								)}
							</LineChart>
						</ResponsiveContainer>
					</div>

					<div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
						<div className="flex items-center gap-1.5">
							<Sparkles size={13} className="text-indigo-500" />
							<span>Curves show daily sleep rhythm vs awake time</span>
						</div>
						<div className="flex items-center gap-1">
							<span>Recommended for {stats.benchmark.label}</span>
						</div>
					</div>
				</CardContent>
			</div>

			{/* ==================================================================== */}
			{/* SLEEP SESSION TIMELINE                                               */}
			{/* Styled exactly identical to Diaper & Stool Timeline                  */}
			{/* ==================================================================== */}
			<div className="space-y-3">
				{/* Search & Filter Toolbar */}
				<div
					style={{ "--password-accent": paletteAccent } as CSSProperties}
					className="password-library-header relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border p-2.5 shadow-md sm:p-3"
				>
					<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-10 size-28 rounded-full" />
					<div className="relative z-10 flex w-full min-w-0 flex-wrap items-center gap-2.5 sm:gap-3">
						{/* Search Input */}
						<label className="relative order-1 block min-w-0 flex-1 sm:w-60 sm:flex-initial">
							<Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search sleep notes, type..."
								aria-label="Search sleep logs"
								className="h-9 sm:h-10 rounded-xl border-white/80 bg-white/80 pl-9 pr-3 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
							/>
						</label>

						{/* Filter Pills */}
						<div className="password-filter-mode-group order-3 flex w-full basis-full shrink-0 items-center gap-1 overflow-x-auto scrollbar-none rounded-xl border p-1 shadow-xs sm:order-2 sm:w-auto sm:basis-auto">
							{(
								[
									{ id: "all", label: "All", icon: Grid2X2 },
									{ id: "today", label: `Today (${stats.todaySessionCount})`, icon: Clock },
									{ id: "night", label: "Night", icon: Moon },
									{ id: "nap", label: "Naps", icon: Sun },
								] as const
							).map((option) => {
								const active = activeFilter === option.id;
								const Icon = option.icon;
								return (
									<button
										key={option.id}
										type="button"
										onClick={() => setActiveFilter(option.id)}
										className={`password-filter-mode-option inline-flex h-8 sm:h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
											active
												? "password-filter-mode-option--active"
												: "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
										}`}
									>
										<Icon size={13} className="shrink-0" />
										<span>{option.label}</span>
									</button>
								);
							})}
						</div>

						{/* Action Button: Log Sleep */}
						<div className="order-2 sm:order-3 ml-auto flex items-center gap-2">
							<Button
								type="button"
								onClick={openCreateModal}
								style={{ "--action-accent": paletteAccent } as CSSProperties}
								className="palette-action-button h-9 sm:h-10 gap-1.5 rounded-xl border px-3.5 text-xs font-bold shadow-xs transition-all active:scale-95"
							>
								<Plus size={15} />
								<span>Log Sleep</span>
							</Button>
						</div>
					</div>
				</div>

				{/* Timeline Heading */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
							Sleep Session Timeline
						</h3>
						<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
							{displayedLogs.length}
						</span>
					</div>
				</div>

				{displayedLogs.length === 0 ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
						<span className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300">
							<Moon size={22} />
						</span>
						<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
							{activeFilter === "today" ? "No sleep sessions recorded today" : "No sleep records found"}
						</p>
						<p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
							Tap &ldquo;Put Baby to Sleep&rdquo; at the top or &ldquo;Log Sleep&rdquo; to record baby&apos;s sleep timeline.
						</p>
					</div>
				) : (
					<div className="space-y-2.5">
						{displayedLogs.map((log) => {
							const startDate = new Date(log.startTime);
							const endDate = log.endTime ? new Date(log.endTime) : null;
							const isSleeping = log.status === "sleeping" || !log.endTime;
							const duration = log.durationMinutes
								? formatDurationMinutes(log.durationMinutes)
								: isSleeping
								? formattedLiveStopwatch
								: "—";
							const detected = detectSleepPeriod(log.startTime);

							return (
								<article
									key={log.id}
									data-page-palette-preserve
									className="budget-bill-card group relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5 overflow-hidden rounded-2xl border p-3 transition-all hover:-translate-y-0.5 sm:rounded-3xl sm:p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-4"
								>
									{/* Left Squircle Icon */}
									{detected.period === "night" ? (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-indigo-50 to-indigo-100/70 text-indigo-600 shadow-xs sm:size-11 dark:from-indigo-950/60 dark:to-indigo-900/40 dark:text-indigo-400">
											<Moon size={19} className="sm:size-[21px]" />
										</span>
									) : detected.period === "evening" ? (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-purple-50 to-purple-100/70 text-purple-600 shadow-xs sm:size-11 dark:from-purple-950/60 dark:to-purple-900/40 dark:text-purple-400">
											<Sunset size={19} className="sm:size-[21px]" />
										</span>
									) : detected.period === "afternoon" ? (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-orange-50 to-orange-100/70 text-orange-600 shadow-xs sm:size-11 dark:from-orange-950/60 dark:to-orange-900/40 dark:text-orange-400">
											<Sun size={19} className="sm:size-[21px]" />
										</span>
									) : (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-amber-50 to-amber-100/70 text-amber-600 shadow-xs sm:size-11 dark:from-amber-950/60 dark:to-amber-900/40 dark:text-amber-400">
											<Sunrise size={19} className="sm:size-[21px]" />
										</span>
									)}

									{/* Title and Subtitle Metadata */}
									<div className="min-w-0">
										<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
											<p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
												{detected.label}
											</p>
											{isSleeping ? (
												<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 animate-pulse dark:bg-emerald-950/60 dark:text-emerald-300">
													<span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
													Asleep Now
												</span>
											) : (
												<span
													className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
														detected.period === "night"
															? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
															: detected.period === "evening"
															? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
															: detected.period === "afternoon"
															? "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
															: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
													}`}
												>
													{detected.periodLabel}
												</span>
											)}
										</div>

										<div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
											<span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
												<Clock size={12} className="text-slate-400" />
												{startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
												{endDate ? ` → ${endDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : " · Ongoing"}
											</span>
											<span aria-hidden="true">·</span>
											<span className="inline-flex items-center gap-1">
												<Calendar size={12} className="text-slate-400" />
												{startDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
											</span>
											{log.notes ? (
												<>
													<span aria-hidden="true">·</span>
													<span className="max-w-[200px] truncate italic sm:max-w-xs md:max-w-sm">
														&ldquo;{log.notes}&rdquo;
													</span>
												</>
											) : null}
										</div>
									</div>

									{/* Right Side: Divider, Attribute Pills, and Action Pill */}
									<div className="col-span-full flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100/80 pt-2.5 dark:border-slate-800/80 md:col-auto md:border-t-0 md:border-l md:border-slate-200 md:pl-4 md:pt-0 dark:md:border-slate-800">
										{/* Duration Pill */}
										<div className="flex flex-wrap items-center gap-1.5">
											<span className="inline-flex items-center rounded-xl border border-slate-200/90 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
												{duration}
											</span>
											{isSleeping && (
												<Button
													type="button"
													size="sm"
													onClick={handleWakeUp}
													disabled={submitting}
													className="h-7 rounded-xl bg-amber-500 px-2.5 text-[11px] font-bold text-slate-950 hover:bg-amber-600"
												>
													<Sun size={12} className="mr-1" /> Wake Up
												</Button>
											)}
										</div>

										{/* Action Pill Group */}
										<div className="budget-bill-actions flex shrink-0 items-center gap-0.5 rounded-2xl border p-0.5">
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												disabled={submitting}
												className="budget-bill-action size-7.5 rounded-xl text-slate-400 transition-colors sm:size-8 hover:text-slate-700 dark:hover:text-slate-200"
												aria-label="Edit sleep log"
												title="Edit sleep log"
												onClick={() => openEditModal(log)}
											>
												<Pencil size={14} className="sm:size-[15px]" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												disabled={submitting}
												className="budget-bill-action budget-bill-action--delete size-7.5 rounded-xl text-slate-400 transition-colors sm:size-8 hover:text-rose-600 dark:hover:text-rose-400"
												aria-label="Delete sleep log"
												title="Delete sleep log"
												onClick={() => {
													setRecordToDelete(log);
													setDeleteDialogOpen(true);
												}}
											>
												<Trash2 size={14} className="sm:size-[15px]" />
											</Button>
										</div>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</div>

			{/* ==================================================================== */}
			{/* DIALOG: Add / Edit Sleep Record                                      */}
			{/* ==================================================================== */}
			{/* ==================================================================== */}
			{/* DIALOG: Add / Edit Sleep Record                                      */}
			{/* ==================================================================== */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel flex max-h-[90dvh] max-w-lg flex-col overflow-hidden p-0 shadow-2xl sm:rounded-3xl"
				>
					<PaletteDialogHeader
						eyebrow="SLEEP TRACKER"
						title={editingRecord ? "Edit Sleep Record" : "Add Sleep Session"}
						description={
							editingRecord
								? "Adjust bedtime, wake up time, or session notes."
								: "Record a completed or ongoing sleep session for your baby."
						}
						icon={<Moon size={22} className="text-violet-600 dark:text-violet-400" />}
						closeLabel="Close"
						closeDisabled={submitting}
					/>

					<form onSubmit={handleSaveManualRecord} className="flex min-h-0 flex-1 flex-col overflow-hidden">
						<div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-5 text-sm sm:p-6">
							{/* Start Time with Auto-Detected Period */}
							<div className="space-y-1.5">
								<label htmlFor="sleep-start-time" className="block text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									Sleep Start Time (Fell Asleep)
								</label>
								<Input
									id="sleep-start-time"
									type="datetime-local"
									value={formStartTime}
									onChange={(e) => setFormStartTime(e.target.value)}
									required
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
								<div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs dark:border-slate-800/80 dark:bg-slate-900/60">
									<span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
										{detectedPeriod.period === "night" ? (
											<Moon size={14} className="text-indigo-600 dark:text-indigo-400" />
										) : detectedPeriod.period === "evening" ? (
											<Sunset size={14} className="text-purple-600 dark:text-purple-400" />
										) : detectedPeriod.period === "afternoon" ? (
											<Sun size={14} className="text-orange-600 dark:text-orange-400" />
										) : (
											<Sunrise size={14} className="text-amber-600 dark:text-amber-400" />
										)}
										<span>
											Auto-detected: <strong className="font-semibold text-slate-900 dark:text-slate-100">{detectedPeriod.label}</strong>
										</span>
									</span>
									<span className="text-[11px] text-slate-500 dark:text-slate-400">
										{detectedPeriod.timeRange}
									</span>
								</div>
							</div>

							{/* Still Sleeping Checkbox */}
							<label
								htmlFor="still-sleeping"
								className="inline-flex cursor-pointer items-center gap-2.5 select-none"
							>
								<div
									className={`grid size-5 place-items-center rounded-md border transition-all ${
										formIsStillSleeping
											? "border-transparent text-white shadow-2xs"
											: "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
									}`}
									style={formIsStillSleeping ? { backgroundColor: paletteAccent || "var(--page-accent-base, #e11d48)" } : undefined}
								>
									<input
										id="still-sleeping"
										type="checkbox"
										checked={formIsStillSleeping}
										onChange={(e) => setFormIsStillSleeping(e.target.checked)}
										className="sr-only"
									/>
									{formIsStillSleeping && <Check size={13} strokeWidth={3} className="text-white" />}
								</div>
								<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 sm:text-sm">
									Baby is currently still sleeping (ongoing session)
								</span>
							</label>

							{/* End Time (if not still sleeping) */}
							{!formIsStillSleeping && (
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Wake Up Time</span>
									<Input
										type="datetime-local"
										value={formEndTime}
										onChange={(e) => setFormEndTime(e.target.value)}
										required={!formIsStillSleeping}
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>
							)}

							{/* Calculated duration preview */}
							{!formIsStillSleeping && formStartTime && formEndTime && (
								<div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/70 p-3 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-200 flex items-center justify-between">
									<span className="font-semibold">Calculated Sleep Duration:</span>
									<span className="font-bold text-sm">
										{(() => {
											const diff = new Date(formEndTime).getTime() - new Date(formStartTime).getTime();
											if (diff <= 0) return "Invalid times";
											return formatDurationMinutes(Math.round(diff / 60000));
										})()}
									</span>
								</div>
							)}

							{/* Notes */}
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Notes / Observations (Optional)</span>
								<Input
									type="text"
									placeholder="e.g. Woke up once for pacifier, calm sleep"
									value={formNotes}
									onChange={(e) => setFormNotes(e.target.value)}
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>
						</div>

						{/* Card Footer */}
						<div className="palette-dialog-footer shrink-0 flex flex-wrap justify-end gap-2 p-3.5 sm:p-4 sm:px-6">
							<Button
								data-page-palette-secondary
								type="button"
								disabled={submitting}
								variant="outline"
								className="palette-dialog-footer-button flex-1 sm:flex-initial border font-medium transition-colors duration-150"
								onClick={() => setDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="ghost"
								disabled={submitting}
								style={{ "--action-accent": paletteAccent } as CSSProperties}
								className="palette-action-button palette-dialog-footer-button flex-1 sm:flex-initial border font-medium transition-colors duration-150"
							>
								{submitting ? (
									<>
										<Loader2 size={16} className="animate-spin shrink-0" />
										<span>Saving...</span>
									</>
								) : (
									<>
										<CheckCircle size={16} className="shrink-0" />
										<span>{editingRecord ? "Save Changes" : "Save Record"}</span>
									</>
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* ==================================================================== */}
			{/* DELETE CONFIRMATION DIALOG                                           */}
			{/* ==================================================================== */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel max-w-sm p-0 overflow-hidden rounded-3xl border shadow-2xl"
				>
					<PaletteDialogHeader
						tone="danger"
						eyebrow="DELETE RECORD"
						title="Delete Sleep Session?"
						description="This sleep entry will be permanently removed from your baby's history."
						icon={<Trash2 size={20} className="text-rose-600" />}
						closeLabel="Cancel"
						closeDisabled={submitting}
					/>

					<div className="p-5 sm:p-6 space-y-3">
						<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
							Are you sure you want to delete this sleep log? This action cannot be undone.
						</p>
					</div>

					<div className="palette-dialog-footer shrink-0 flex flex-wrap justify-end gap-2 p-3.5 sm:p-4 sm:px-6">
						<Button
							data-page-palette-secondary
							type="button"
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
							disabled={submitting}
							className="palette-dialog-footer-button flex-1 sm:flex-initial border font-medium transition-colors duration-150"
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleConfirmDelete}
							disabled={submitting}
							className="palette-dialog-footer-button flex-1 sm:flex-initial bg-rose-600 text-sm font-medium text-white shadow-sm transition-all hover:bg-rose-700"
						>
							{submitting ? (
								<>
									<Loader2 size={16} className="animate-spin shrink-0" />
									<span>Deleting...</span>
								</>
							) : (
								<>
									<Trash2 size={15} className="shrink-0" />
									<span>Delete Log</span>
								</>
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
