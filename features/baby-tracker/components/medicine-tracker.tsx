"use client";

import { useMemo, useState, type FormEvent, type CSSProperties } from "react";
import {
	Pill,
	Check,
	Clock,
	Plus,
	Trash2,
	Pencil,
	Calendar,
	Loader2,
	ShieldCheck,
	Shield,
	ArrowRight,
	Search,
	X,
	Sparkles,
	AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import type { PagePalette } from "@/components/settings/page-palettes";
import type { BabyMedicine, MedicineStatus, MedicineFrequency } from "../types";
import { getLocalDateString } from "../lib/baby-tracker-utils";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";

export const STANDARD_FREQUENCIES: Array<{
	value: MedicineFrequency;
	label: string;
	schedule: string;
	badge: string;
	dosesPerDay: number;
}> = [
	{ value: "once a day", label: "Once a day", schedule: "Every 24 hours", badge: "1× / day", dosesPerDay: 1 },
	{ value: "twice a day", label: "Twice a day", schedule: "Every 12 hours", badge: "2× / day", dosesPerDay: 2 },
	{ value: "thrice a day", label: "Thrice a day", schedule: "Every 8 hours", badge: "3× / day", dosesPerDay: 3 },
	{ value: "four times a day", label: "Four times a day", schedule: "Every 6 hours", badge: "4× / day", dosesPerDay: 4 },
];

export const QUICK_DOSAGE_PRESETS = ["1.25", "2.5", "5", "7.5", "10"];

export function getDosesPerDay(freq?: string): number {
	if (!freq) return 1;
	const lower = freq.trim().toLowerCase();
	if (lower.includes("four")) return 4;
	if (lower.includes("thrice") || lower.includes("three")) return 3;
	if (lower.includes("twice") || lower.includes("two")) return 2;
	if (lower.includes("once") || lower.includes("one")) return 1;
	const match = lower.match(/(\d+)\s*(?:x|times|\/day|a day)/i);
	if (match) {
		const n = parseInt(match[1], 10);
		if (!isNaN(n) && n >= 1 && n <= 6) return n;
	}
	return 1;
}

export function parseDosage(dosageStr?: string): { amount: string; unit: string } {
	if (!dosageStr) return { amount: "", unit: "ml" };
	const trimmed = dosageStr.trim();
	const match = trimmed.match(/^([0-9]+(?:\.[0-9]+)?)\s*(.*)$/i);
	if (match) {
		const amount = match[1];
		let unit = match[2]?.trim().toLowerCase() || "ml";
		if (!unit) unit = "ml";
		return { amount, unit };
	}
	return { amount: trimmed, unit: "ml" };
}

export function formatDosage(dosage?: string): string {
	if (!dosage) return "";
	const trimmed = dosage.trim();
	if (/^[0-9]+(?:\.[0-9]+)?$/.test(trimmed)) {
		return `${trimmed} ml`;
	}
	return trimmed;
}

export function formatFrequency(freq?: string): string {
	if (!freq) return "";
	const lower = freq.trim().toLowerCase();
	const found = STANDARD_FREQUENCIES.find((f) => f.value === lower);
	if (found) return found.label;
	return freq;
}

export function getFrequencySchedule(freq?: string): string {
	if (!freq) return "";
	const lower = freq.trim().toLowerCase();
	const found = STANDARD_FREQUENCIES.find((f) => f.value === lower);
	if (found) return `${found.label} (${found.schedule})`;
	return freq;
}

export function getFrequencyBadge(freq?: string): string {
	if (!freq) return "";
	const lower = freq.trim().toLowerCase();
	const found = STANDARD_FREQUENCIES.find((f) => f.value === lower);
	if (found) return found.badge;
	return freq;
}

export function MedicineTracker({
	medicines,
	todayDosesRecord = {},
	onToggleDailyDose,
	onCreateMedicine,
	onUpdateMedicine,
	onToggleStatus,
	onDeleteMedicine,
	paletteAccent = "#B66F57",
	dialogPalette,
}: {
	medicines: BabyMedicine[];
	todayDosesRecord?: Record<string, number[]>;
	onToggleDailyDose: (medicineId: string, doseNumber: number) => Promise<void>;
	onCreateMedicine: (data: Parameters<typeof import("../actions/baby-tracker-actions").createMedicine>[0]) => Promise<void>;
	onUpdateMedicine: (id: string, data: Parameters<typeof import("../actions/baby-tracker-actions").updateMedicine>[1]) => Promise<void>;
	onToggleStatus: (id: string, status: MedicineStatus) => Promise<void>;
	onDeleteMedicine: (id: string) => Promise<void>;
	paletteAccent?: string;
	dialogPalette?: PagePalette;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingMedicine, setEditingMedicine] = useState<BabyMedicine | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [filter, setFilter] = useState<"all" | "active" | "due" | "completed">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [dialogError, setDialogError] = useState<string | null>(null);
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(4000);

	// Optimistic state for today's completed doses
	const [optimisticDoses, setOptimisticDoses] = useState<Record<string, number[]>>({});

	const effectiveDosesRecord = useMemo(() => {
		return { ...todayDosesRecord, ...optimisticDoses };
	}, [todayDosesRecord, optimisticDoses]);

	// Form specific state for Dosage & Frequency
	const [formDosageAmount, setFormDosageAmount] = useState("");
	const [formDosageUnit, setFormDosageUnit] = useState("ml");
	const [formFrequency, setFormFrequency] = useState<string>("once a day");

	// Medicine items enriched with today's dose stats
	const enrichedMedicines = useMemo(() => {
		return medicines.map((med) => {
			const dosesPerDay = getDosesPerDay(med.frequency);
			const finishedDoses = (effectiveDosesRecord[med.id] || []).filter((d) => d <= dosesPerDay);
			const isDoneToday = finishedDoses.length >= dosesPerDay;
			const isPartiallyDone = finishedDoses.length > 0 && !isDoneToday;

			return {
				...med,
				dosesPerDay,
				finishedDoses,
				finishedCount: finishedDoses.length,
				isDoneToday,
				isPartiallyDone,
			};
		});
	}, [medicines, effectiveDosesRecord]);

	// Summary statistics for metric cards
	const stats = useMemo(() => {
		const totalMedicines = enrichedMedicines.length;
		const activeMedicines = enrichedMedicines.filter((m) => m.status === "active").length;
		const activeList = enrichedMedicines.filter((m) => m.status === "active");

		const totalDailyDosesScheduled = activeList.reduce((acc, m) => acc + m.dosesPerDay, 0);
		const totalDailyDosesCompleted = activeList.reduce((acc, m) => acc + m.finishedCount, 0);
		const pendingDosesToday = Math.max(0, totalDailyDosesScheduled - totalDailyDosesCompleted);
		const completionRate =
			totalDailyDosesScheduled > 0
				? Math.round((totalDailyDosesCompleted / totalDailyDosesScheduled) * 100)
				: 0;

		const completedTodayCount = enrichedMedicines.filter((m) => m.isDoneToday).length;
		const dueTodayCount = enrichedMedicines.filter((m) => m.status === "active" && !m.isDoneToday).length;

		return {
			totalMedicines,
			activeMedicines,
			totalDailyDosesScheduled,
			totalDailyDosesCompleted,
			pendingDosesToday,
			completionRate,
			completedTodayCount,
			dueTodayCount,
		};
	}, [enrichedMedicines]);

	// Filter and search
	const filteredMedicines = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return enrichedMedicines.filter((med) => {
			// Search filter
			if (query) {
				const matchName = med.name.toLowerCase().includes(query);
				const matchDosage = med.dosage.toLowerCase().includes(query);
				const matchFreq = med.frequency.toLowerCase().includes(query);
				const matchNotes = med.notes.toLowerCase().includes(query);
				const matchInstructions = med.instructions.toLowerCase().includes(query);
				if (!matchName && !matchDosage && !matchFreq && !matchNotes && !matchInstructions) {
					return false;
				}
			}

			// Tab filter
			if (filter === "active") return med.status === "active";
			if (filter === "due") return med.status === "active" && !med.isDoneToday;
			if (filter === "completed") return med.isDoneToday || med.status === "completed";
			return true;
		});
	}, [enrichedMedicines, filter, searchQuery]);

	function handleOpenAddDialog() {
		setEditingMedicine(null);
		setDialogError(null);
		setFormDosageAmount("");
		setFormDosageUnit("ml");
		setFormFrequency("once a day");
		setDialogOpen(true);
	}

	function handleOpenEditDialog(med: BabyMedicine) {
		setEditingMedicine(med);
		setDialogError(null);
		const parsed = parseDosage(med.dosage);
		setFormDosageAmount(parsed.amount);
		setFormDosageUnit(parsed.unit || "ml");
		setFormFrequency(med.frequency || "once a day");
		setDialogOpen(true);
	}

	async function handleToggleDose(medicineId: string, doseNumber: number) {
		if (submitting) return;
		const currentDoses = effectiveDosesRecord[medicineId] || [];
		const isCurrentlyDone = currentDoses.includes(doseNumber);
		const nextDoses = isCurrentlyDone
			? currentDoses.filter((d) => d !== doseNumber)
			: [...currentDoses, doseNumber].sort((a, b) => a - b);

		// Optimistic update
		setOptimisticDoses((prev) => ({
			...prev,
			[medicineId]: nextDoses,
		}));

		try {
			await onToggleDailyDose(medicineId, doseNumber);
			showAlert(
				"DOSAGE RECORDED",
				isCurrentlyDone
					? `Dose ${doseNumber} marked as pending.`
					: `Dose ${doseNumber} finished for today! 💊`
			);
		} catch (error) {
			// Rollback on failure
			setOptimisticDoses((prev) => ({
				...prev,
				[medicineId]: currentDoses,
			}));
			showAlert("ERROR", error instanceof Error ? error.message : "Failed to toggle dosage");
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);

		const form = new FormData(event.currentTarget);
		const name = String(form.get("name") || "").trim();
		const dosageAmountInput = formDosageAmount.trim() || String(form.get("dosageAmount") || "").trim();
		const dosageUnitInput = formDosageUnit.trim() || String(form.get("dosageUnit") || "ml").trim() || "ml";
		const instructions = String(form.get("instructions") || "").trim();
		const startDate = String(form.get("startDate") || "").trim();
		const endDate = String(form.get("endDate") || "").trim();
		const frequency = (formFrequency.trim() || String(form.get("frequency") || "once a day")).trim();
		const status = (form.get("status") as MedicineStatus) || "active";
		const notes = String(form.get("notes") || "").trim();

		if (!name) {
			setDialogError("Medicine name is required.");
			setSubmitting(false);
			return;
		}

		if (!dosageAmountInput) {
			setDialogError("Please specify a dosage amount (e.g. 2.5 ml).");
			setSubmitting(false);
			return;
		}

		let dosage = dosageAmountInput;
		if (/^[0-9]+(?:\.[0-9]+)?$/.test(dosageAmountInput)) {
			dosage = `${dosageAmountInput} ${dosageUnitInput}`;
		} else if (!dosageAmountInput.toLowerCase().includes(dosageUnitInput.toLowerCase())) {
			dosage = `${dosageAmountInput} ${dosageUnitInput}`;
		}

		try {
			if (editingMedicine) {
				await onUpdateMedicine(editingMedicine.id, {
					name,
					dosage,
					instructions,
					startDate,
					endDate,
					frequency,
					status,
					notes,
				});
				showAlert("MEDICINE UPDATED", `${name} updated successfully!`);
			} else {
				await onCreateMedicine({
					name,
					dosage,
					instructions,
					startDate,
					endDate,
					frequency,
					status,
					notes,
				});
				showAlert("MEDICINE ADDED", `${name} added to tracker! 💊`);
			}
			setDialogOpen(false);
			setEditingMedicine(null);
			setDialogError(null);
		} catch (error) {
			const errMsg = error instanceof Error ? error.message : "Failed to save medicine";
			setDialogError(errMsg);
			showAlert("ERROR", errMsg);
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (submitting) return;
		setSubmitting(true);
		try {
			await onDeleteMedicine(id);
			showAlert("MEDICINE REMOVED", "Medicine deleted successfully.");
		} catch (error) {
			showAlert("ERROR", error instanceof Error ? error.message : "Failed to delete medicine");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-5">
			{/* Alert notification banner (strictly replaces toast alerts) */}
			<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />

			{/* Top Metric Summary Cards Row (matching Vaccine tracker aesthetic) */}
			<div data-page-palette-preserve className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
				{/* Total Medicines (Sky) */}
				<Card data-page-palette-preserve className="metric-summary-card metric-summary-card--sky relative gap-0 overflow-hidden rounded-3xl border border-blue-200 bg-[#f5f8ff] py-0 shadow-sm shadow-blue-950/5 ring-0 transition-shadow hover:shadow-md dark:border-blue-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-2xs">
								<Pill size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Total Medicines
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-blue-100/90 px-2.5 text-[9px] font-bold tracking-wider text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
								<Shield size={10} /> SCHEDULE
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.totalMedicines}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Tracked in schedule
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setFilter("all")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-blue-500/10 px-3 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300 cursor-pointer"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Completed (Emerald) */}
				<Card data-page-palette-preserve className="metric-summary-card metric-summary-card--emerald relative gap-0 overflow-hidden rounded-3xl border border-emerald-200 bg-[#eafbf3] py-0 shadow-sm shadow-emerald-950/5 ring-0 transition-shadow hover:shadow-md dark:border-[#273349] dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-2xs">
								<ShieldCheck size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Completed
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-emerald-100/80 px-2.5 text-[9px] font-semibold tracking-wider text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
								<ShieldCheck size={10} /> PROTECTED
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.totalDailyDosesCompleted}
								<span className="ml-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
									of {stats.totalDailyDosesScheduled}
								</span>
							</p>
							<div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-emerald-100 dark:bg-slate-700">
								<div
									className="h-full rounded-full bg-emerald-500"
									style={{ width: `${stats.completionRate}%` }}
								/>
							</div>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setFilter("completed")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-emerald-500/10 px-3 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-300 cursor-pointer"
							>
								<ArrowRight size={12} /> View details
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Upcoming (Violet) */}
				<Card data-page-palette-preserve className="metric-summary-card metric-summary-card--violet relative gap-0 overflow-hidden rounded-3xl border border-violet-200 bg-[#f8f6ff] py-0 shadow-sm shadow-violet-950/5 ring-0 transition-shadow hover:shadow-md dark:border-violet-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500 text-white shadow-2xs">
								<Clock size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Upcoming
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-violet-100/90 px-2.5 text-[9px] font-bold tracking-wider text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
								<Clock size={10} /> DUE SOON
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.pendingDosesToday}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Scheduled doses
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setFilter("due")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-violet-500/10 px-3 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300 cursor-pointer"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Needs Attention (Amber) */}
				<Card data-page-palette-preserve className="metric-summary-card metric-summary-card--amber relative gap-0 overflow-hidden rounded-3xl border border-amber-200 bg-[#fffaf0] py-0 shadow-sm shadow-amber-950/5 ring-0 transition-shadow hover:shadow-md dark:border-amber-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-2xs">
								<AlertTriangle size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Needs Attention
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-amber-100/80 px-2.5 text-[9px] font-semibold tracking-wider text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
								<Clock size={10} /> {stats.pendingDosesToday > 0 ? "DUE NOW" : "ON TRACK"}
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.pendingDosesToday}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								{stats.pendingDosesToday > 0 ? "Doses awaiting completion" : "All current doses up to date"}
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setFilter("due")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-amber-500/10 px-3 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300 cursor-pointer"
							>
								<ArrowRight size={12} /> Review
							</button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Daily Dosage Progress Banner */}
			{stats.totalDailyDosesScheduled > 0 && (
				<div className="rounded-2xl border border-rose-200/80 bg-linear-to-r from-rose-50/80 via-white to-amber-50/60 p-3.5 shadow-2xs sm:p-4 dark:border-rose-900/60 dark:from-slate-900 dark:to-slate-950">
					<div className="flex items-center justify-between gap-2 text-xs">
						<span className="inline-flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
							<ShieldCheck size={15} className="text-rose-600 dark:text-rose-400" />
							Daily Dosage Progress
						</span>
						<span className="font-bold text-slate-700 dark:text-slate-300">
							{stats.totalDailyDosesCompleted} of {stats.totalDailyDosesScheduled} completed ({stats.completionRate}%)
						</span>
					</div>
					<div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
						<div
							className="h-full rounded-full transition-all duration-500"
							style={{ backgroundColor: paletteAccent, width: `${stats.completionRate}%` }}
						/>
					</div>
				</div>
			)}

			{/* Controls, Filters, Search & Add Buttons */}
			<div
				style={{ "--password-accent": paletteAccent } as CSSProperties}
				className="password-library-header relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border p-2.5 shadow-md sm:p-3"
			>
				<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-10 size-28 rounded-full" />
				<div className="relative z-10 flex w-full min-w-0 flex-col gap-2.5 sm:gap-3 xl:flex-row xl:items-center xl:justify-between">
					{/* Left controls: Search input on the left + Filter Pills */}
					<div className="flex w-full min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
						{/* Search Input */}
						<label className="relative block w-full min-w-0 sm:w-56 sm:flex-initial xl:w-72">
							<Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search medicines, doses, notes..."
								aria-label="Search medicines"
								className="h-10 sm:h-11 w-full rounded-xl border-white/80 bg-white/75 pl-9.5 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
									aria-label="Clear search"
								>
									<X size={14} />
								</button>
							)}
						</label>

						{/* Filter Pills */}
						<div className="password-filter-mode-group flex shrink-0 items-center gap-1 overflow-x-auto scrollbar-none rounded-xl border p-1 shadow-xs">
							{(
								[
									{ key: "all", label: `All (${enrichedMedicines.length})` },
									{ key: "active", label: `Active (${stats.activeMedicines})` },
									{ key: "due", label: `Due Today (${stats.dueTodayCount})` },
									{ key: "completed", label: `Completed (${stats.completedTodayCount})` },
								] as const
							).map((tab) => (
								<button
									key={tab.key}
									type="button"
									onClick={() => setFilter(tab.key)}
									className={`password-filter-mode-option shrink-0 inline-flex h-8 sm:h-9 items-center rounded-lg border px-2.5 text-xs font-semibold transition-all cursor-pointer ${
										filter === tab.key
											? "password-filter-mode-option--active"
											: "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className="flex shrink-0 items-center gap-2">
						<Button
							type="button"
							onClick={handleOpenAddDialog}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button h-10 sm:h-11 flex-1 sm:flex-initial gap-1.5 rounded-xl border px-3.5 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
						>
							<Plus size={14} /> Add Medicine
						</Button>
					</div>
				</div>
			</div>

			{/* Medicine Records List (Horizontal Row Cards matching Vaccine tracker screenshot) */}
			<div className="space-y-2.5">
				{filteredMedicines.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
						<span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300">
							<Pill size={22} />
						</span>
						<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
							{searchQuery ? "No medicines matching your search" : "No medications found in this view"}
						</p>
						<p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
							{searchQuery
								? `No results found for "${searchQuery}". Try a different keyword or clear search.`
								: "Log antibiotics, fever syrups, vitamin D drops, or supplements with daily dosage buttons."}
						</p>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="mt-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
							>
								Clear search
							</button>
						)}
					</div>
				) : (
					filteredMedicines.map((med) => {
						const totalDosesToday = med.dosesPerDay;
						const finishedCount = med.finishedCount;
						const isAllDoneToday = med.isDoneToday;

						return (
							<article
								key={med.id}
								data-page-palette-preserve
								className="budget-bill-card group relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5 overflow-hidden rounded-2xl border p-3 transition-all hover:-translate-y-0.5 sm:rounded-3xl sm:p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-4"
							>
								{/* Left Squircle Icon */}
								{isAllDoneToday ? (
									<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-emerald-50 to-emerald-100/70 text-emerald-600 shadow-xs sm:size-11 dark:from-emerald-950/60 dark:to-emerald-900/40 dark:text-emerald-400">
										<ShieldCheck size={19} className="sm:size-[21px]" />
									</span>
								) : med.status === "paused" ? (
									<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-amber-50 to-amber-100/70 text-amber-600 shadow-xs sm:size-11 dark:from-amber-950/60 dark:to-amber-900/40 dark:text-amber-400">
										<AlertTriangle size={19} className="sm:size-[21px]" />
									</span>
								) : (
									<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-rose-50 to-rose-100/70 text-rose-600 shadow-xs sm:size-11 dark:from-rose-950/60 dark:to-rose-900/40 dark:text-rose-400">
										<Pill size={19} className="sm:size-[21px]" />
									</span>
								)}

								{/* Title, Subtitle Metadata, and Mobile Action Pill */}
								<div className="flex min-w-0 items-start justify-between gap-2">
									<div className="min-w-0">
										<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
											<p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
												{med.name}
											</p>

											{/* Status badge */}
											{isAllDoneToday ? (
												<span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
													Completed ({finishedCount}/{totalDosesToday})
												</span>
											) : finishedCount > 0 ? (
												<span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
													In Progress ({finishedCount}/{totalDosesToday})
												</span>
											) : (
												<span className="inline-flex shrink-0 items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
													Due ({finishedCount}/{totalDosesToday})
												</span>
											)}

											{/* Dosage badge */}
											{med.dosage && (
												<span className="inline-flex shrink-0 items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
													{formatDosage(med.dosage)}
												</span>
											)}

											{/* Frequency badge */}
											{med.frequency && (
												<span className="inline-flex shrink-0 items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
													{formatFrequency(med.frequency)}
												</span>
											)}
										</div>

										<div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
											<span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
												<Calendar size={12} className="text-slate-400" />
												{isAllDoneToday ? (
													"Last: All doses finished today"
												) : finishedCount > 0 ? (
													<>Last: Dose {finishedCount} completed · Today: {finishedCount} of {totalDosesToday}</>
												) : (
													<>Next: Dose 1 · Today: 0 of {totalDosesToday} completed</>
												)}
											</span>
											{med.instructions ? (
												<>
													<span aria-hidden="true">·</span>
													<span className="truncate max-w-[220px]" title={med.instructions}>
														{med.instructions}
													</span>
												</>
											) : null}
											{med.notes ? (
												<>
													<span aria-hidden="true">·</span>
													<span className="max-w-[200px] truncate italic sm:max-w-xs md:max-w-sm">
														&ldquo;{med.notes}&rdquo;
													</span>
												</>
											) : null}
											{med.startDate ? (
												<>
													<span aria-hidden="true">·</span>
													<span className="text-slate-400">
														Since {med.startDate}
													</span>
												</>
											) : null}
										</div>
									</div>

									{/* Mobile Actions Pill Group (Edit, Delete) - visible only on mobile */}
									<div className="budget-bill-actions flex shrink-0 items-center gap-0.5 rounded-2xl border p-0.5 md:hidden">
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											disabled={submitting}
											className="budget-bill-action budget-bill-action--edit size-7 rounded-xl text-slate-500 transition-colors sm:size-8 dark:text-slate-400 cursor-pointer"
											aria-label={`Edit ${med.name}`}
											title="Edit medicine details"
											onClick={() => handleOpenEditDialog(med)}
										>
											<Pencil size={13} className="sm:size-[15px]" />
										</Button>

										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											disabled={submitting}
											className="budget-bill-action budget-bill-action--delete size-7 rounded-xl text-slate-400 transition-colors sm:size-8 dark:text-slate-400 cursor-pointer"
											aria-label={`Delete ${med.name}`}
											title="Delete medicine"
											onClick={() => handleDelete(med.id)}
										>
											<Trash2 size={13} className="sm:size-[15px]" />
										</Button>
									</div>
								</div>

								{/* Right Side / Bottom: Divider, Doses, and Desktop Action Pill */}
								<div className="col-span-full flex min-w-0 items-center justify-between gap-3 border-t border-slate-100/80 pt-2.5 dark:border-slate-800/80 md:col-auto md:border-t-0 md:border-l md:border-slate-200 md:pl-4 md:pt-0 dark:md:border-slate-800">
									{/* Doses List: horizontal scroll on mobile so cards always have uniform single-line height */}
									<div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
										{Array.from({ length: totalDosesToday }, (_, idx) => idx + 1).map((doseNum) => {
											const isCompleted = med.finishedDoses.includes(doseNum);

											return (
												<div
													key={doseNum}
													className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition-all ${
														isCompleted
															? "border-emerald-200/90 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
															: "border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
													}`}
												>
													<button
														type="button"
														onClick={() => handleToggleDose(med.id, doseNum)}
														disabled={submitting}
														className={`grid size-4 place-items-center rounded-md border transition-all cursor-pointer ${
															isCompleted
																? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
																: "border-slate-300 bg-white hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-800"
														}`}
														title={
															isCompleted
																? `Dose ${doseNum}: Completed today (tap to mark as pending)`
																: `Dose ${doseNum}: Due (tap to complete)`
														}
														aria-label={
															isCompleted
																? `Mark Dose ${doseNum} as pending`
																: `Mark Dose ${doseNum} as completed`
														}
													>
														{isCompleted && <Check size={11} strokeWidth={2.5} />}
													</button>

													<button
														type="button"
														onClick={() => handleToggleDose(med.id, doseNum)}
														disabled={submitting}
														className="font-semibold hover:underline text-left cursor-pointer"
														title={
															isCompleted
																? `Dose ${doseNum}: Completed today (tap to undo)`
																: `Dose ${doseNum}: Due (tap to finish)`
														}
													>
														Dose {doseNum}
													</button>

													<span
														className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
															isCompleted
																? "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
																: "bg-sky-100/80 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300"
														}`}
													>
														{isCompleted ? "Done" : "Due"}
													</span>
												</div>
											);
										})}
									</div>

									{/* Desktop Actions Pill Group (Edit, Delete) - visible only on desktop */}
									<div className="budget-bill-actions hidden shrink-0 items-center gap-0.5 rounded-2xl border p-0.5 md:flex">
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											disabled={submitting}
											className="budget-bill-action budget-bill-action--edit size-7.5 rounded-xl text-slate-500 transition-colors sm:size-8 dark:text-slate-400 cursor-pointer"
											aria-label={`Edit ${med.name}`}
											title="Edit medicine details"
											onClick={() => handleOpenEditDialog(med)}
										>
											<Pencil size={13} className="sm:size-[15px]" />
										</Button>

										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											disabled={submitting}
											className="budget-bill-action budget-bill-action--delete size-7.5 rounded-xl text-slate-400 transition-colors sm:size-8 dark:text-slate-400 cursor-pointer"
											aria-label={`Delete ${med.name}`}
											title="Delete medicine"
											onClick={() => handleDelete(med.id)}
										>
											<Trash2 size={13} className="sm:size-[15px]" />
										</Button>
									</div>
								</div>
							</article>
						);
					})
				)}
			</div>

			{/* Add/Edit Medicine Dialog */}
			<Dialog
				open={dialogOpen}
				onOpenChange={(open) => {
					setDialogOpen(open);
					if (!open) setEditingMedicine(null);
				}}
			>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel flex max-h-[min(90dvh,720px)] w-[calc(100%-1.5rem)] max-w-lg flex-col overflow-hidden p-0 shadow-2xl sm:w-full sm:rounded-3xl"
				>
					<div className="shrink-0">
						<PaletteDialogHeader
							eyebrow="MEDICINE TRACKER"
							title={editingMedicine ? "Edit Medication" : "Add Medicine"}
							description="Track ML dosage, frequency schedule, and prescription dates."
							icon={<Pill size={18} />}
							closeLabel="Close dialog"
						/>
					</div>
					<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
						<div className="flex-1 min-h-0 space-y-3.5 overflow-y-auto p-5 text-sm sm:p-6">
							{dialogError && (
								<div className="rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs font-semibold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-200">
									{dialogError}
								</div>
							)}

							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Medicine Name</span>
								<Input
									name="name"
									defaultValue={editingMedicine?.name ?? ""}
									placeholder="e.g. Paracetamol / Calpol, Vitamin D3 Drops, Amoxicillin"
									required
									autoFocus
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>

							{/* Dosage & Frequency Row */}
							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
								{/* Dosage with ML as default */}
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<label htmlFor="medicine-dosage-amount" className="text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
											Dosage
										</label>
										<span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
											Default: ML
										</span>
									</div>
									<div className="relative flex items-center">
										<Input
											id="medicine-dosage-amount"
											name="dosageAmount"
											value={formDosageAmount}
											onChange={(e) => setFormDosageAmount(e.target.value)}
											placeholder="e.g. 2.5"
											required
											className="h-10 pr-20 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
										/>
										<div className="absolute right-1.5 flex items-center">
											<select
												name="dosageUnit"
												value={formDosageUnit}
												onChange={(e) => setFormDosageUnit(e.target.value)}
												className="h-7 rounded-md border border-rose-200 bg-rose-50/90 px-2 text-xs font-bold text-rose-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-rose-300"
											>
												<option value="ml">ml</option>
												<option value="drops">drops</option>
												<option value="mg">mg</option>
												<option value="tsp">tsp</option>
												<option value="tablets">tablets</option>
											</select>
										</div>
									</div>

									{/* Quick Dosage Presets (mL) */}
									<div className="flex flex-wrap items-center gap-1 pt-0.5">
										<span className="text-[10px] font-semibold text-slate-400">Quick:</span>
										{QUICK_DOSAGE_PRESETS.map((preset) => {
											const isSelected = formDosageAmount === preset && formDosageUnit === "ml";
											return (
												<button
													key={preset}
													type="button"
													onClick={() => {
														setFormDosageAmount(preset);
														setFormDosageUnit("ml");
													}}
													className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold transition-all cursor-pointer ${
														isSelected
															? "bg-rose-500 text-white shadow-2xs"
															: "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
													}`}
												>
													{preset} ml
												</button>
											);
										})}
									</div>
								</div>

								{/* Frequency: once a day, twice a day, thrice a day, four times a day */}
								<div className="space-y-1.5">
									<label htmlFor="medicine-frequency" className="block text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
										Frequency
									</label>
									<select
										id="medicine-frequency"
										name="frequency"
										value={formFrequency}
										onChange={(e) => setFormFrequency(e.target.value)}
										className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									>
										{STANDARD_FREQUENCIES.map((f) => (
											<option key={f.value} value={f.value}>
												{f.label} ({f.schedule})
											</option>
										))}
										{!STANDARD_FREQUENCIES.some((f) => f.value === formFrequency.toLowerCase()) && formFrequency && (
											<option value={formFrequency}>{formFrequency}</option>
										)}
									</select>

									{/* Quick Frequency Pill Selector */}
									<div className="grid grid-cols-2 gap-1 pt-0.5">
										{STANDARD_FREQUENCIES.map((f) => {
											const isSelected = formFrequency.toLowerCase() === f.value;
											return (
												<button
													key={f.value}
													type="button"
													onClick={() => setFormFrequency(f.value)}
													className={`inline-flex items-center justify-center rounded-lg border px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
														isSelected
															? "border-rose-400 bg-rose-50 font-bold text-rose-700 shadow-2xs dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
															: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
													}`}
												>
													{f.label}
												</button>
											);
										})}
									</div>
								</div>
							</div>

							{/* Dates Row */}
							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Start Date</span>
									<Input
										type="date"
										name="startDate"
										defaultValue={editingMedicine?.startDate ?? getLocalDateString()}
										required
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>

								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>End Date (Optional)</span>
									<Input
										type="date"
										name="endDate"
										defaultValue={editingMedicine?.endDate ?? ""}
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>
							</div>

							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Instructions / Administration Timing (Optional)</span>
								<Input
									name="instructions"
									defaultValue={editingMedicine?.instructions ?? ""}
									placeholder="e.g. After feeding, with water, shake well before use (Optional)"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>

							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Status</span>
									<select
										name="status"
										defaultValue={editingMedicine?.status ?? "active"}
										className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									>
										<option value="active">Active</option>
										<option value="completed">Completed</option>
										<option value="paused">Paused</option>
									</select>
								</label>
							</div>

							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Doctor Notes / Purpose (Optional)</span>
								<textarea
									name="notes"
									rows={2}
									placeholder="e.g. Prescribed for 38.5C fever by pediatrician... (Optional)"
									defaultValue={editingMedicine?.notes ?? ""}
									className="w-full rounded-md border border-rose-200 bg-white p-3 text-sm text-slate-900 shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>
						</div>

						<div className="palette-dialog-footer shrink-0 flex flex-wrap justify-end gap-2 p-3.5 sm:p-4 sm:px-6">
							<Button
								data-page-palette-secondary
								type="button"
								disabled={submitting}
								variant="outline"
								className="palette-dialog-footer-button flex-1 sm:flex-initial border font-medium transition-colors duration-150 cursor-pointer"
								onClick={() => setDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="ghost"
								disabled={submitting}
								style={{ "--action-accent": paletteAccent } as CSSProperties}
								className="palette-action-button palette-dialog-footer-button flex-1 sm:flex-initial border font-medium transition-colors duration-150 cursor-pointer"
							>
								{submitting ? (
									<>
										<Loader2 size={16} className="animate-spin shrink-0" />
										<span>Saving...</span>
									</>
								) : (
									<>
										{editingMedicine ? null : <Plus size={16} className="shrink-0" />}
										<span>{editingMedicine ? "Save changes" : "Add medicine"}</span>
									</>
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
