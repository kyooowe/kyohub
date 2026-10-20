"use client";

import { useMemo, useState, type FormEvent, type CSSProperties } from "react";
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
	Droplets,
	Plus,
	Trash2,
	Pencil,
	Sparkles,
	Search,
	Clock,
	Activity,
	Baby,
	AlertCircle,
	Check,
	CheckCircle,
	Loader2,
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
import type { BabyMilkLog, MilkStatus, MilkType } from "../types";
import {
	getMilkStats,
	getMilkComparisonData,
	isSameDay,
} from "../lib/baby-tracker-utils";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";

interface MilkTrackerProps {
	logs: BabyMilkLog[];
	onCreateRecord: (data: {
		preparedOz: number;
		status: MilkStatus;
		leftoverOz?: number;
		milkType?: MilkType;
		loggedAt?: string;
		notes?: string;
	}) => Promise<void>;
	onUpdateRecord: (
		id: string,
		data: {
			preparedOz?: number;
			status?: MilkStatus;
			leftoverOz?: number;
			milkType?: MilkType;
			loggedAt?: string;
			notes?: string;
		},
	) => Promise<void>;
	onDeleteRecord: (id: string) => Promise<void>;
	paletteAccent?: string;
	dialogPalette?: PagePalette;
}

const MILK_TYPES: Array<{ id: MilkType; label: string; color: string }> = [
	{ id: "formula", label: "Formula", color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
	{ id: "breast_milk", label: "Breast Milk", color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" },
	{ id: "cow_milk", label: "Cow's Milk", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
	{ id: "other", label: "Other", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" },
];

const PRESET_AMOUNTS = [2, 3, 4, 5, 6, 8];

export function MilkTracker({
	logs,
	onCreateRecord,
	onUpdateRecord,
	onDeleteRecord,
	paletteAccent = "#F43F5E",
	dialogPalette,
}: MilkTrackerProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [recordToDelete, setRecordToDelete] = useState<BabyMilkLog | null>(null);
	const [editingRecord, setEditingRecord] = useState<BabyMilkLog | null>(null);
	const [submitting, setSubmitting] = useState(false);

	// Filtering & chart states
	const [activeFilter, setActiveFilter] = useState<"all" | "today" | "ongoing" | "completed" | "leftover">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [chartDaysRange, setChartDaysRange] = useState<7 | 14>(7);
	const [chartMetric, setChartMetric] = useState<"both" | "drank" | "leftover">("both");
	const [showTargetLine, setShowTargetLine] = useState(true);

	// Alert hook (in-page alert, NO toasts)
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(4000);

	// Modal form states
	const [formLoggedAt, setFormLoggedAt] = useState("");
	const [formPreparedOz, setFormPreparedOz] = useState<string>("4.0");
	const [formStatus, setFormStatus] = useState<MilkStatus>("completed");
	const [formLeftoverOz, setFormLeftoverOz] = useState<string>("0");
	const [formMilkType, setFormMilkType] = useState<MilkType>("formula");
	const [formNotes, setFormNotes] = useState("");

	// Quick log station states
	const [quickPreparedOz, setQuickPreparedOz] = useState<number>(4);
	const [quickStatus, setQuickStatus] = useState<MilkStatus>("completed");
	const [quickLeftoverOz, setQuickLeftoverOz] = useState<string>("0");
	const [quickMilkType, setQuickMilkType] = useState<MilkType>("formula");

	// Stats
	const stats = useMemo(() => getMilkStats(logs), [logs]);

	// Comparison chart data
	const comparisonData = useMemo(() => {
		return getMilkComparisonData(logs, chartDaysRange);
	}, [logs, chartDaysRange]);

	// Filtered history list
	const today = useMemo(() => new Date(), []);
	const displayedLogs = useMemo(() => {
		return logs.filter((log) => {
			if (activeFilter === "today") {
				const logged = new Date(log.loggedAt);
				if (!isSameDay(logged, today)) return false;
			}
			if (activeFilter === "ongoing" && log.status !== "ongoing") return false;
			if (activeFilter === "completed" && log.status !== "completed") return false;
			if (activeFilter === "leftover" && log.status !== "leftover") return false;

			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const matchesNotes = log.notes?.toLowerCase().includes(q);
				const matchesType = log.milkType.toLowerCase().includes(q);
				const matchesStatus = log.status.toLowerCase().includes(q);
				if (!matchesNotes && !matchesType && !matchesStatus) return false;
			}
			return true;
		});
	}, [logs, activeFilter, searchQuery, today]);

	/* -------------------------------------------------------------------------- */
	/*                               Action Handlers                              */
	/* -------------------------------------------------------------------------- */

	// Quick log from care station
	async function handleQuickLog() {
		if (submitting) return;

		const prepared = quickPreparedOz;
		if (prepared <= 0) {
			showAlert("VALIDATION ERROR", "Prepared milk amount must be greater than 0.");
			return;
		}

		let leftover = 0;
		if (quickStatus === "leftover") {
			leftover = parseFloat(quickLeftoverOz) || 0;
			if (leftover > prepared) {
				showAlert("VALIDATION ERROR", "Leftover milk cannot be more than prepared milk.");
				return;
			}
		}

		const drank = Math.max(0, Math.round((prepared - leftover) * 10) / 10);

		setSubmitting(true);
		try {
			await onCreateRecord({
				preparedOz: prepared,
				status: quickStatus,
				leftoverOz: leftover,
				milkType: quickMilkType,
				loggedAt: new Date().toISOString(),
			});

			showAlert(
				"MILK FEED LOGGED",
				quickStatus === "ongoing"
					? `Logged ${prepared} oz ${quickMilkType.replace("_", " ")} — bottle is currently ongoing 🍼`
					: quickStatus === "completed"
					? `Logged ${prepared} oz ${quickMilkType.replace("_", " ")} — baby drank it all! 🍼`
					: `Logged ${prepared} oz (${drank} oz drank, ${leftover} oz leftover) ✨`,
			);
		} catch (err) {
			showAlert("ERROR", err instanceof Error ? err.message : "Failed to log milk feed");
		} finally {
			setSubmitting(false);
		}
	}

	function openCreateModal() {
		const now = new Date();
		const pad = (n: number) => n.toString().padStart(2, "0");
		const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

		setEditingRecord(null);
		setFormLoggedAt(localIso);
		setFormPreparedOz("4.0");
		setFormStatus("completed");
		setFormLeftoverOz("0");
		setFormMilkType("formula");
		setFormNotes("");
		setDialogOpen(true);
	}

	function openEditModal(record: BabyMilkLog) {
		const d = new Date(record.loggedAt);
		const pad = (n: number) => n.toString().padStart(2, "0");
		const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

		setEditingRecord(record);
		setFormLoggedAt(localIso);
		setFormPreparedOz(record.preparedOz.toString());
		setFormStatus(record.status);
		setFormLeftoverOz(record.leftoverOz.toString());
		setFormMilkType(record.milkType);
		setFormNotes(record.notes || "");
		setDialogOpen(true);
	}

	async function handleSaveModalRecord(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;

		const prepared = parseFloat(formPreparedOz);
		if (isNaN(prepared) || prepared <= 0) {
			showAlert("VALIDATION ERROR", "Prepared milk amount (oz) must be greater than 0.");
			return;
		}

		let leftover = 0;
		if (formStatus === "leftover") {
			leftover = parseFloat(formLeftoverOz) || 0;
			if (leftover > prepared) {
				showAlert("VALIDATION ERROR", "Leftover milk cannot be more than prepared milk.");
				return;
			}
		}

		const drank = formStatus === "ongoing" ? 0 : Math.max(0, Math.round((prepared - leftover) * 10) / 10);

		setSubmitting(true);
		try {
			if (editingRecord) {
				await onUpdateRecord(editingRecord.id, {
					preparedOz: prepared,
					status: formStatus,
					leftoverOz: leftover,
					milkType: formMilkType,
					loggedAt: formLoggedAt ? new Date(formLoggedAt).toISOString() : undefined,
					notes: formNotes.trim(),
				});
				showAlert("RECORD UPDATED", "Milk feeding record updated successfully!");
			} else {
				await onCreateRecord({
					preparedOz: prepared,
					status: formStatus,
					leftoverOz: leftover,
					milkType: formMilkType,
					loggedAt: formLoggedAt ? new Date(formLoggedAt).toISOString() : undefined,
					notes: formNotes.trim(),
				});
				showAlert(
					"MILK RECORD SAVED",
					formStatus === "ongoing"
						? `Recorded ${prepared} oz feeding as ongoing (bottle not completed yet) 🍼`
						: `Recorded ${prepared} oz feeding (${drank} oz drank) successfully! 🍼`,
				);
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
			showAlert("RECORD DELETED", "Milk feeding log removed successfully.");
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
			{/* In-page notification banner (NO toast alert) */}
			<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />

			{/* ==================================================================== */}
			{/* QUICK ACTION CARE STATION: Prepared Milk (oz) & Feeding Tag          */}
			{/* ==================================================================== */}
			<div className="relative overflow-hidden rounded-3xl border border-rose-200/80 bg-linear-to-r from-rose-50/80 via-white to-amber-50/60 p-4 sm:p-5 shadow-xs dark:border-rose-900/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:bg-rose-950 dark:text-rose-300">
							<Droplets size={12} />
							<span>QUICK FEEDING STATION</span>
						</div>
						<h2 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
							Log Prepared Milk &amp; Feeding Status
						</h2>
						<p className="text-xs text-slate-600 dark:text-slate-400">
							Select prepared bottle ounces, tag whether baby drank it all or left milk, and tap log.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						{/* Detailed Log Modal CTA */}
						<Button
							type="button"
							onClick={openCreateModal}
							className="h-10 rounded-2xl bg-rose-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
						>
							<Plus size={15} className="mr-1" /> Detailed Log
						</Button>
					</div>
				</div>

				{/* Quick Controls Section */}
				<div className="mt-4 flex flex-col gap-4 border-t border-rose-200/60 pt-4 xl:flex-row xl:items-end xl:justify-between dark:border-slate-800">
					{/* Controls: Volume, Status Tag, Milk Type */}
					<div className="flex flex-wrap items-end gap-3 sm:gap-4">
						{/* 1. Prepared Milk Amount (oz) */}
						<div className="min-w-fit">
							<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
								Prepared Milk (oz)
							</label>
							<div className="flex flex-wrap items-center gap-1.5">
								{PRESET_AMOUNTS.map((amt) => (
									<button
										key={amt}
										type="button"
										onClick={() => setQuickPreparedOz(amt)}
										className={`h-9 shrink-0 rounded-xl px-3 text-xs font-bold transition-all ${
											quickPreparedOz === amt
												? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-600/20"
												: "bg-white text-slate-700 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
										}`}
									>
										{amt} oz
									</button>
								))}
							</div>
						</div>

						{/* 2. Tag on Prepared Milk (Ongoing vs Completed vs Leftover) */}
						<div className="min-w-[240px]">
							<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
								Status Tag
							</label>
							<div className="inline-flex h-9 w-full rounded-xl bg-white p-1 border border-slate-200 shadow-2xs dark:bg-slate-800 dark:border-slate-700">
								<button
									type="button"
									onClick={() => setQuickStatus("ongoing")}
									className={`flex-1 rounded-lg text-xs font-bold transition-all ${
										quickStatus === "ongoing"
											? "bg-sky-600 text-white shadow-xs"
											: "text-slate-600 hover:text-slate-900 dark:text-slate-400"
									}`}
								>
									On going
								</button>
								<button
									type="button"
									onClick={() => setQuickStatus("completed")}
									className={`flex-1 rounded-lg text-xs font-bold transition-all ${
										quickStatus === "completed"
											? "bg-emerald-600 text-white shadow-xs"
											: "text-slate-600 hover:text-slate-900 dark:text-slate-400"
									}`}
								>
									Completed
								</button>
								<button
									type="button"
									onClick={() => setQuickStatus("leftover")}
									className={`flex-1 rounded-lg text-xs font-bold transition-all ${
										quickStatus === "leftover"
											? "bg-amber-500 text-slate-950 shadow-xs"
											: "text-slate-600 hover:text-slate-900 dark:text-slate-400"
									}`}
								>
									Left Over
								</button>
							</div>
						</div>

						{/* 3. Leftover oz (if Left Over selected) or Milk Type */}
						{quickStatus === "leftover" ? (
							<div className="min-w-[160px]">
								<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
									Left Over (oz)
								</label>
								<div className="flex items-center gap-2">
									<Input
										type="number"
										step="0.5"
										min="0.1"
										max={quickPreparedOz}
										value={quickLeftoverOz}
										onChange={(e) => setQuickLeftoverOz(e.target.value)}
										className="h-9 w-20 rounded-xl text-xs font-bold"
									/>
									<span className="text-xs text-slate-500 font-semibold shrink-0">
										Drank: {Math.max(0, quickPreparedOz - (parseFloat(quickLeftoverOz) || 0))} oz
									</span>
								</div>
							</div>
						) : (
							<div className="min-w-[140px]">
								<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
									Milk Type
								</label>
								<select
									value={quickMilkType}
									onChange={(e) => setQuickMilkType(e.target.value as MilkType)}
									className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
								>
									<option value="formula">Formula</option>
									<option value="breast_milk">Breast Milk</option>
									<option value="cow_milk">Cow&apos;s Milk</option>
									<option value="other">Other</option>
								</select>
							</div>
						)}
					</div>

					{/* 4. Quick Log Button */}
					<div className="shrink-0 w-full xl:w-auto">
						<button
							type="button"
							onClick={handleQuickLog}
							disabled={submitting}
							className="h-10 w-full xl:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 px-6 font-bold text-white shadow-sm shadow-rose-500/20 transition-all hover:scale-102 hover:shadow-rose-500/30 active:scale-98 disabled:opacity-50"
						>
							<Plus size={16} />
							<span className="text-xs tracking-wide">
								Log {quickPreparedOz} oz ({quickStatus === "completed" ? "Completed" : `${quickLeftoverOz || 0} oz left`})
							</span>
						</button>
					</div>
				</div>
			</div>

			{/* ==================================================================== */}
			{/* METRIC COUNTERS GRID: Drank Today & Estimated Milk Per Day           */}
			{/* ==================================================================== */}
			<div data-page-palette-preserve className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
				{/* Card 1: How many oz baby drank today (Sky) */}
				<Card className="metric-summary-card metric-summary-card--sky relative gap-0 overflow-hidden rounded-3xl border border-blue-200 bg-[#f5f8ff] py-0 shadow-sm shadow-blue-950/5 ring-0 transition-shadow hover:shadow-md dark:border-blue-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-2.5 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-2xs">
								<Droplets size={16} strokeWidth={2} />
							</span>
							<p title="Drank Today" className="truncate text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Drank Today
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-6.5 items-center justify-center gap-1 rounded-full bg-blue-100/90 px-2 text-[9px] font-bold tracking-wider text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
								<Droplets size={10} /> INTAKE
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.todayDrankOz}
								<span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">oz</span>
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Across {stats.todayCount} {stats.todayCount === 1 ? "bottle feed" : "bottle feeds"} today
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

				{/* Card 2: Leftover Milk Today (Amber) */}
				<Card className="metric-summary-card metric-summary-card--amber relative gap-0 overflow-hidden rounded-3xl border border-amber-200 bg-[#fffaf0] py-0 shadow-sm shadow-amber-950/5 ring-0 transition-shadow hover:shadow-md dark:border-amber-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-2.5 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-2xs">
								<Clock size={16} strokeWidth={2} />
							</span>
							<p title="Leftover Milk" className="truncate text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Leftover Milk
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-6.5 items-center justify-center gap-1 rounded-full bg-amber-100/90 px-2 text-[9px] font-bold tracking-wider text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
								<Clock size={10} /> LEFTOVERS
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.todayLeftoverOz}
								<span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">oz</span>
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								{stats.consumptionRate}% finished today
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setActiveFilter("leftover")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-amber-500/10 px-3 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Card 3: Prepared Milk Today (Violet) */}
				<Card className="metric-summary-card metric-summary-card--violet relative gap-0 overflow-hidden rounded-3xl border border-violet-200 bg-[#f8f6ff] py-0 shadow-sm shadow-violet-950/5 ring-0 transition-shadow hover:shadow-md dark:border-violet-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-2.5 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-violet-500 text-white shadow-2xs">
								<Baby size={16} strokeWidth={2} />
							</span>
							<p title="Prepared Milk" className="truncate text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Prepared Milk
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-6.5 items-center justify-center gap-1 rounded-full bg-emerald-100/80 px-2 text-[9px] font-semibold tracking-wider text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
								<Check size={10} /> {stats.todayCount} {stats.todayCount === 1 ? "BOTTLE" : "BOTTLES"}
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.todayPreparedOz}
								<span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">oz</span>
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Total volume mixed / poured today
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setActiveFilter("completed")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-violet-500/10 px-3 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Card 4: Estimated Drinked and Leftover Milk Per Day (Teal) */}
				<Card className="metric-summary-card metric-summary-card--teal relative gap-0 overflow-hidden rounded-3xl border border-teal-200 bg-[#eafbf6] py-0 shadow-sm shadow-teal-950/5 ring-0 transition-shadow hover:shadow-md dark:border-teal-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-2.5 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl bg-teal-600 text-white shadow-2xs">
								<Activity size={16} strokeWidth={2} />
							</span>
							<p title="Estimated / Day" className="truncate text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Estimated / Day
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-6.5 items-center justify-center gap-1 rounded-full bg-teal-100/90 px-2 text-[9px] font-bold tracking-wider text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
								<Sparkles size={10} /> DAILY EST.
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.estimatedDrankOzPerDay}
								<span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">oz/day</span>
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Est. leftover: {stats.estimatedLeftoverOzPerDay} oz/day
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={openCreateModal}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-teal-500/10 px-3 text-[11px] font-medium text-teal-700 transition-colors hover:bg-teal-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-300"
							>
								<ArrowRight size={12} /> Log feed
							</button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* ==================================================================== */}
			{/* GRAPHS: Drinked Milk vs Left Over Milk Daily Comparison              */}
			{/* Styled similar to Monthly Growth Curves Graph UI                     */}
			{/* ==================================================================== */}
			<div className="space-y-3">
				<FeatureSectionHeader
					theme="rose"
					icon={TrendingUp}
					title="Daily Milk Intake & Leftover Comparison"
					description="Compare drinked milk (oz) and leftover milk (oz) per day against daily estimated averages"
					appearance="soft"
				>
					<div className="password-library-badge hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium sm:flex">
						<span className="grid size-6 place-items-center rounded-full bg-white/75 text-current shadow-sm dark:bg-white/10">
							<Droplets size={13} />
						</span>
						Intake vs Leftover Curves
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
										{ id: "drank", label: "Drank Milk", icon: Baby },
										{ id: "leftover", label: "Leftover Milk", icon: Clock },
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

						{/* Right side controls: Estimate Line toggle & 7/14 Days Range toggle */}
						<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto xl:justify-end">
							{/* Estimate Benchmark Curve Toggle */}
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
								<span>{showTargetLine ? "Est. Curve On" : "Show Est. Line"}</span>
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
							<span className="grid size-7 shrink-0 place-items-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
								<Sparkles size={14} />
							</span>
							<div>
								<p className="text-xs font-bold text-slate-900 dark:text-slate-100">
									Daily Intake Assessment
								</p>
								<p className="text-[11px] text-slate-500 dark:text-slate-400">
									Est. Drank: {stats.estimatedDrankOzPerDay} oz/day · Est. Leftover: {stats.estimatedLeftoverOzPerDay} oz/day
								</p>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							{/* Drank badge */}
							<div className="flex items-center gap-1.5 rounded-xl border border-blue-200/80 bg-white px-2.5 py-1 text-xs shadow-2xs dark:border-blue-900/60 dark:bg-slate-900">
								<Baby size={13} className="text-blue-600 dark:text-blue-400" />
								<span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
									Today Drank: <strong className="text-slate-900 dark:text-white">{stats.todayDrankOz} oz</strong>
								</span>
							</div>

							{/* Consumption Rate badge */}
							<div className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-white px-2.5 py-1 text-xs shadow-2xs dark:border-emerald-900/60 dark:bg-slate-900">
								<Check size={13} className="text-emerald-500" />
								<span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
									Efficiency: <strong className="text-emerald-700 dark:text-emerald-400">{stats.consumptionRate}% finished</strong>
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
									tick={{ fontSize: 11, fill: "#64748b" }}
									axisLine={{ stroke: "#cbd5e1" }}
									unit=" oz"
								/>
								<Tooltip
									content={({ active, payload }) => {
										if (!active || !payload || !payload.length) return null;
										const data = payload[0].payload;
										const rate = data.preparedOz > 0 ? Math.round((data.drankOz / data.preparedOz) * 100) : 0;
										return (
											<div className="space-y-2 rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
												<p className="text-xs font-bold text-slate-900 dark:text-slate-100">
													{data.displayDate}
												</p>
												<div className="space-y-1">
													<div className="flex items-center justify-between gap-4">
														<span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
															<Baby size={12} /> Drank Milk:
														</span>
														<strong className="text-xs text-slate-900 dark:text-slate-100">
															{data.drankOz} oz
														</strong>
													</div>

													<div className="flex items-center justify-between gap-4 pt-1">
														<span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
															<Clock size={12} /> Leftover Milk:
														</span>
														<strong className="text-xs text-slate-900 dark:text-slate-100">
															{data.leftoverOz} oz
														</strong>
													</div>

													<div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
														<span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
															Total Prepared:
														</span>
														<span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
															{data.preparedOz} oz ({rate}%)
														</span>
													</div>
													<p className="text-[10px] text-slate-400 dark:text-slate-500">
														{data.feedCount} {data.feedCount === 1 ? "bottle feed" : "bottle feeds"} logged
													</p>
												</div>
											</div>
										);
									}}
								/>

								{/* Drank Milk Line */}
								{(chartMetric === "both" || chartMetric === "drank") && (
									<Line
										type="monotone"
										dataKey="drankOz"
										name="Drank Milk (oz)"
										stroke="#3B82F6"
										strokeWidth={3}
										dot={{ r: 4, fill: "#3B82F6" }}
										activeDot={{ r: 6 }}
										connectNulls
									/>
								)}

								{/* Leftover Milk Line */}
								{(chartMetric === "both" || chartMetric === "leftover") && (
									<Line
										type="monotone"
										dataKey="leftoverOz"
										name="Leftover Milk (oz)"
										stroke="#F59E0B"
										strokeWidth={2.5}
										dot={{ r: 4, fill: "#F59E0B" }}
										activeDot={{ r: 6 }}
										connectNulls
									/>
								)}

								{/* Daily Estimate Benchmark Line (Dashed) */}
								{showTargetLine && (
									<Line
										type="monotone"
										dataKey="estimatedDrankOz"
										name="Est. Avg Intake"
										stroke="#F43F5E"
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
							<Sparkles size={13} className="text-rose-500" />
							<span>Curves show daily intake vs leftover trends</span>
						</div>
						<div className="flex items-center gap-1">
							<span>Average efficiency: {stats.consumptionRate}%</span>
						</div>
					</div>
				</CardContent>
			</div>

			{/* ==================================================================== */}
			{/* MILK FEEDING TIMELINE                                                */}
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
								placeholder="Search milk notes, type..."
								aria-label="Search milk logs"
								className="h-9 sm:h-10 rounded-xl border-white/80 bg-white/80 pl-9 pr-3 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
							/>
						</label>

						{/* Filter Pills */}
						<div className="password-filter-mode-group order-3 flex w-full basis-full shrink-0 items-center gap-1 overflow-x-auto scrollbar-none rounded-xl border p-1 shadow-xs sm:order-2 sm:w-auto sm:basis-auto">
							{(
								[
									{ id: "all", label: "All", icon: Grid2X2 },
									{ id: "today", label: `Today (${stats.todayCount})`, icon: Clock },
									{ id: "ongoing", label: "On going", icon: Clock },
									{ id: "completed", label: "Completed", icon: Check },
									{ id: "leftover", label: "With Leftovers", icon: AlertCircle },
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

						{/* Action Button: Log Feed */}
						<div className="order-2 sm:order-3 ml-auto flex items-center gap-2">
							<Button
								type="button"
								onClick={openCreateModal}
								style={{ "--action-accent": paletteAccent } as CSSProperties}
								className="palette-action-button h-9 sm:h-10 gap-1.5 rounded-xl border px-3.5 text-xs font-bold shadow-xs transition-all active:scale-95"
							>
								<Plus size={15} />
								<span>Log Bottle</span>
							</Button>
						</div>
					</div>
				</div>

				{/* Timeline Heading */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
							Milk Feeding Timeline
						</h3>
						<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
							{displayedLogs.length}
						</span>
					</div>
				</div>

				{displayedLogs.length === 0 ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
						<span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300">
							<Droplets size={22} />
						</span>
						<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
							{activeFilter === "today" ? "No bottle feeds logged today yet" : "No milk feeding records found"}
						</p>
						<p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
							Use the quick milk station at the top or &ldquo;Log Bottle&rdquo; to record baby&apos;s feedings.
						</p>
					</div>
				) : (
					<div className="space-y-2.5">
						{displayedLogs.map((log) => {
							const logged = new Date(log.loggedAt);

							return (
								<article
									key={log.id}
									data-page-palette-preserve
									className="budget-bill-card group relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5 overflow-hidden rounded-2xl border p-3 transition-all hover:-translate-y-0.5 sm:rounded-3xl sm:p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-4"
								>
									{/* Left Squircle Icon */}
									{log.status === "completed" ? (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-blue-100/70 text-blue-600 shadow-xs sm:size-11 dark:from-blue-950/60 dark:to-blue-900/40 dark:text-blue-400">
											<Droplets size={19} className="sm:size-[21px]" />
										</span>
									) : log.status === "ongoing" ? (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-sky-50 to-sky-100/70 text-sky-600 shadow-xs sm:size-11 dark:from-sky-950/60 dark:to-sky-900/40 dark:text-sky-400">
											<Clock size={19} className="sm:size-[21px]" />
										</span>
									) : (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-amber-50 to-amber-100/70 text-amber-600 shadow-xs sm:size-11 dark:from-amber-950/60 dark:to-amber-900/40 dark:text-amber-400">
											<AlertCircle size={19} className="sm:size-[21px]" />
										</span>
									)}

									{/* Title and Subtitle Metadata */}
									<div className="min-w-0">
										<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
											<p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
												Bottle Feed ({log.preparedOz} oz)
											</p>
											{log.status === "completed" ? (
												<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
													<Check size={11} strokeWidth={2.5} />
													Completed
												</span>
											) : log.status === "ongoing" ? (
												<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 animate-pulse dark:bg-sky-950/70 dark:text-sky-300">
													<span className="size-1.5 rounded-full bg-sky-500 animate-ping" />
													On going
												</span>
											) : (
												<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
													<AlertCircle size={11} />
													Left Over: {log.leftoverOz} oz
												</span>
											)}
											<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-300">
												{log.milkType.replace("_", " ")}
											</span>
										</div>

										<div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
											<span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
												<Clock size={12} className="text-slate-400" />
												{logged.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
											</span>
											<span aria-hidden="true">·</span>
											<span className="inline-flex items-center gap-1">
												<Calendar size={12} className="text-slate-400" />
												{logged.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
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
										{/* Details Pills */}
										<div className="flex flex-wrap items-center gap-1.5">
											{log.status === "ongoing" ? (
												<span className="inline-flex items-center gap-1 rounded-xl border border-sky-200/90 bg-sky-50/80 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300">
													<Clock size={11} />
													In progress ({log.preparedOz} oz)
												</span>
											) : (
												<>
													<span className="inline-flex items-center rounded-xl border border-slate-200/90 bg-white/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-emerald-300">
														{log.drankOz} oz drank
													</span>
													{log.leftoverOz > 0 && (
														<span className="inline-flex items-center rounded-xl border border-amber-200/90 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
															{log.leftoverOz} oz left
														</span>
													)}
												</>
											)}
										</div>

										{/* Action Pill Group */}
										<div className="budget-bill-actions flex shrink-0 items-center gap-1 rounded-2xl border p-0.5">
											{log.status === "ongoing" && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													disabled={submitting}
													className="h-7.5 rounded-xl border border-emerald-300 bg-emerald-50 px-2 text-[11px] font-bold text-emerald-700 shadow-2xs hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
													title="Mark bottle as completed"
													onClick={async () => {
														if (submitting) return;
														setSubmitting(true);
														try {
															await onUpdateRecord(log.id, {
																status: "completed",
																leftoverOz: 0,
															});
															showAlert("BOTTLE COMPLETED", `Marked ${log.preparedOz} oz bottle as completed! 🍼`);
														} catch (err) {
															showAlert("ERROR", err instanceof Error ? err.message : "Failed to mark bottle completed");
														} finally {
															setSubmitting(false);
														}
													}}
												>
													<Check size={12} strokeWidth={2.5} />
													<span>Done</span>
												</Button>
											)}
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												disabled={submitting}
												className="budget-bill-action size-7.5 rounded-xl text-slate-400 transition-colors sm:size-8 hover:text-slate-700 dark:hover:text-slate-200"
												aria-label="Edit milk record"
												title="Edit milk record"
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
												aria-label="Delete milk record"
												title="Delete milk record"
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
			{/* DIALOG: Log / Edit Milk Feed                                         */}
			{/* ==================================================================== */}
			{/* ==================================================================== */}
			{/* DIALOG: Log / Edit Milk Feed                                         */}
			{/* ==================================================================== */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel flex max-h-[90dvh] max-w-lg flex-col overflow-hidden p-0 shadow-2xl sm:rounded-3xl"
				>
					<PaletteDialogHeader
						eyebrow="MILK TRACKER"
						title={editingRecord ? "Edit Milk Feed" : "Log Milk Feed"}
						description={
							editingRecord
								? "Update prepared milk volume, feeding tag, or leftover ounces."
								: "Record bottle ounces prepared and tag completed or leftover milk."
						}
						icon={<Droplets size={22} className="text-rose-600 dark:text-rose-400" />}
						closeLabel="Close"
						closeDisabled={submitting}
					/>

					<form onSubmit={handleSaveModalRecord} className="flex min-h-0 flex-1 flex-col overflow-hidden">
						<div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-5 text-sm sm:p-6">
							{/* Date & Time */}
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Feeding Time</span>
								<Input
									type="datetime-local"
									value={formLoggedAt}
									onChange={(e) => setFormLoggedAt(e.target.value)}
									required
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>

							{/* Prepared Milk (oz) */}
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<span className="text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">Prepared Milk (oz)</span>
									<div className="flex gap-1">
										{PRESET_AMOUNTS.map((amt) => (
											<button
												key={amt}
												type="button"
												onClick={() => setFormPreparedOz(amt.toFixed(1))}
												className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
											>
												{amt}
											</button>
										))}
									</div>
								</div>
								<Input
									type="number"
									step="0.5"
									min="0.5"
									max="20"
									value={formPreparedOz}
									onChange={(e) => setFormPreparedOz(e.target.value)}
									required
									placeholder="e.g. 5.0"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</div>

							{/* Tag on Prepared Milk: Ongoing vs Completed vs Left Over */}
							<div>
								<span className="block text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm mb-1.5">
									Feeding Tag / Result
								</span>
								<div className="grid grid-cols-3 gap-1.5 sm:gap-2">
									<button
										type="button"
										onClick={() => {
											setFormStatus("ongoing");
											setFormLeftoverOz("0");
										}}
										style={formStatus === "ongoing" ? ({ "--action-accent": paletteAccent } as CSSProperties) : undefined}
										className={`flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border p-2 sm:p-3 text-center transition-all ${
											formStatus === "ongoing"
												? "palette-action-button border shadow-xs"
												: "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
										}`}
									>
										<span className="flex items-center gap-1 font-bold text-xs">
											<Clock size={13} /> On going
										</span>
										<span className="text-[10px] opacity-80 mt-0.5 leading-tight">Bottle not yet completed</span>
									</button>

									<button
										type="button"
										onClick={() => {
											setFormStatus("completed");
											setFormLeftoverOz("0");
										}}
										style={formStatus === "completed" ? ({ "--action-accent": paletteAccent } as CSSProperties) : undefined}
										className={`flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border p-2 sm:p-3 text-center transition-all ${
											formStatus === "completed"
												? "palette-action-button border shadow-xs"
												: "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
										}`}
									>
										<span className="flex items-center gap-1 font-bold text-xs">
											<Check size={13} /> Completed
										</span>
										<span className="text-[10px] opacity-80 mt-0.5 leading-tight">Finished entire bottle</span>
									</button>

									<button
										type="button"
										onClick={() => {
											setFormStatus("leftover");
											if (parseFloat(formLeftoverOz) === 0) setFormLeftoverOz("1.0");
										}}
										style={formStatus === "leftover" ? ({ "--action-accent": paletteAccent } as CSSProperties) : undefined}
										className={`flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border p-2 sm:p-3 text-center transition-all ${
											formStatus === "leftover"
												? "palette-action-button border shadow-xs"
												: "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
										}`}
									>
										<span className="flex items-center gap-1 font-bold text-xs">
											<AlertCircle size={13} /> Left Over
										</span>
										<span className="text-[10px] opacity-80 mt-0.5 leading-tight">Some milk left</span>
									</button>
								</div>

								{formStatus === "ongoing" && (
									<div className="mt-2 rounded-xl border border-sky-200/80 bg-sky-50/70 p-2.5 text-xs text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
										<p className="flex items-center gap-1.5 font-semibold text-[11px] sm:text-xs">
											<Clock size={13} className="shrink-0 text-sky-600 dark:text-sky-400" />
											<span>Bottle is ongoing (not yet completed). You can update it once baby finishes drinking.</span>
										</p>
									</div>
								)}
							</div>

							{/* Leftover Ounces (when tag is leftover) */}
							{formStatus === "leftover" && (
								<div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2 dark:border-amber-900/60 dark:bg-amber-950/40">
									<div className="flex items-center justify-between">
										<label className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
											Left Over Milk (oz)
										</label>
										<span className="text-xs font-bold text-amber-800 dark:text-amber-300">
											Drank: {Math.max(0, (parseFloat(formPreparedOz) || 0) - (parseFloat(formLeftoverOz) || 0)).toFixed(1)} oz
										</span>
									</div>
									<Input
										type="number"
										step="0.5"
										min="0.1"
										max={parseFloat(formPreparedOz) || 20}
										value={formLeftoverOz}
										onChange={(e) => setFormLeftoverOz(e.target.value)}
										required
										placeholder="e.g. 1.5"
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
									<p className="text-[10px] text-amber-700 dark:text-amber-400">
										Enter the remaining ounces left in the bottle. Drank volume is calculated automatically.
									</p>
								</div>
							)}

							{/* Milk Type */}
							<div>
								<span className="block text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm mb-1.5">
									Milk Type
								</span>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
									{MILK_TYPES.map((t) => (
										<button
											key={t.id}
											type="button"
											onClick={() => setFormMilkType(t.id)}
											style={formMilkType === t.id ? ({ "--action-accent": paletteAccent } as CSSProperties) : undefined}
											className={`rounded-xl py-2 px-1 text-center text-xs font-bold transition-all border ${
												formMilkType === t.id
													? "palette-action-button border shadow-xs"
													: "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
											}`}
										>
											{t.label}
										</button>
									))}
								</div>
							</div>

							{/* Notes */}
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Notes (Optional)</span>
								<Input
									type="text"
									placeholder="e.g. Fed comfortably, burped well"
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
						title="Delete Milk Feed?"
						description="This milk log entry will be permanently removed from your history."
						icon={<Trash2 size={20} className="text-rose-600" />}
						closeLabel="Cancel"
						closeDisabled={submitting}
					/>

					<div className="p-5 sm:p-6 space-y-3">
						<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
							Are you sure you want to delete this milk feeding record?
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
