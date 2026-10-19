"use client";

import { useMemo, useState, type FormEvent, type CSSProperties } from "react";
import {
	Syringe,
	CheckCircle2,
	Clock,
	AlertTriangle,
	Plus,
	Trash2,
	Pencil,
	ShieldCheck,
	Shield,
	Loader2,
	Calendar,
	ArrowRight,
	Search,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import type { PagePalette } from "@/components/settings/page-palettes";
import type { BabyVaccine, VaccineStatus } from "../types";
import { standardChildhoodVaccines } from "../types";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";
import { toast } from "sonner";

type GroupedVaccine = {
	vaccineName: string;
	doses: BabyVaccine[];
	totalDoses: number;
	completedDoses: number;
	isAllCompleted: boolean;
	hasOverdue: boolean;
	hasUpcoming: boolean;
	nextDose: BabyVaccine | null;
	administeredBy: string;
	notes: string;
};

export function VaccineTracker({
	vaccines,
	onCreateVaccine,
	onUpdateVaccine,
	onToggleStatus,
	onDeleteVaccine,
	onSeedStandardSchedule,
	paletteAccent = "#B66F57",
	dialogPalette,
}: {
	vaccines: BabyVaccine[];
	onCreateVaccine: (data: Parameters<typeof import("../actions/baby-tracker-actions").createVaccine>[0]) => Promise<void>;
	onUpdateVaccine: (id: string, data: Parameters<typeof import("../actions/baby-tracker-actions").updateVaccine>[1]) => Promise<void>;
	onToggleStatus: (id: string, status: VaccineStatus) => Promise<void>;
	onDeleteVaccine: (id: string) => Promise<void>;
	onSeedStandardSchedule: () => Promise<void>;
	paletteAccent?: string;
	dialogPalette?: PagePalette;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingVaccine, setEditingVaccine] = useState<BabyVaccine | null>(null);
	const [formVaccineName, setFormVaccineName] = useState("");
	const [formDose, setFormDose] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "overdue">("all");
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(3000);

	const todayStr = new Date().toISOString().split("T")[0];

	// Compute status breakdown
	const stats = useMemo(() => {
		let completed = 0;
		let upcoming = 0;
		let overdue = 0;

		for (const v of vaccines) {
			if (v.status === "completed") {
				completed++;
			} else if (v.status === "overdue" || (v.status === "upcoming" && v.vaccineDate < todayStr)) {
				overdue++;
			} else if (v.status === "upcoming") {
				upcoming++;
			}
		}

		const total = vaccines.length;
		const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

		return { total, completed, upcoming, overdue, completionRate };
	}, [vaccines, todayStr]);

	// Group vaccines with the same name into 1 item
	const groupedVaccines = useMemo(() => {
		const map = new Map<string, BabyVaccine[]>();

		for (const v of vaccines) {
			const key = v.vaccineName.trim().toLowerCase();
			const existing = map.get(key) || [];
			existing.push(v);
			map.set(key, existing);
		}

		const groups: GroupedVaccine[] = [];

		for (const doses of map.values()) {
			// Sort doses chronologically
			doses.sort((a, b) => a.vaccineDate.localeCompare(b.vaccineDate));

			const totalDoses = doses.length;
			let completedDoses = 0;
			let hasOverdue = false;
			let hasUpcoming = false;
			let nextDose: BabyVaccine | null = null;
			let administeredBy = "";
			let notes = "";

			for (const d of doses) {
				const isCompleted = d.status === "completed";
				const isOverdue = !isCompleted && (d.status === "overdue" || d.vaccineDate < todayStr);
				if (isCompleted) {
					completedDoses++;
				} else if (isOverdue) {
					hasOverdue = true;
					if (!nextDose) nextDose = d;
				} else if (d.status === "upcoming") {
					hasUpcoming = true;
					if (!nextDose) nextDose = d;
				}
				if (!administeredBy && d.administeredBy) administeredBy = d.administeredBy;
				if (!notes && d.notes) notes = d.notes;
			}

			if (!nextDose && doses.length > 0) {
				nextDose = doses[doses.length - 1];
			}

			groups.push({
				vaccineName: doses[0].vaccineName,
				doses,
				totalDoses,
				completedDoses,
				isAllCompleted: completedDoses === totalDoses && totalDoses > 0,
				hasOverdue,
				hasUpcoming,
				nextDose,
				administeredBy,
				notes,
			});
		}

		// Sort groups: overdue first, then upcoming, then completed
		groups.sort((a, b) => {
			if (a.hasOverdue && !b.hasOverdue) return -1;
			if (!a.hasOverdue && b.hasOverdue) return 1;
			if (a.hasUpcoming && !b.hasUpcoming) return -1;
			if (!a.hasUpcoming && b.hasUpcoming) return 1;
			return (a.nextDose?.vaccineDate || "").localeCompare(b.nextDose?.vaccineDate || "");
		});

		return groups;
	}, [vaccines, todayStr]);

	const tabCounts = useMemo(() => {
		let completed = 0;
		let upcoming = 0;
		let overdue = 0;
		for (const g of groupedVaccines) {
			if (g.isAllCompleted) completed++;
			if (g.hasUpcoming) upcoming++;
			if (g.hasOverdue) overdue++;
		}
		return { total: groupedVaccines.length, completed, upcoming, overdue };
	}, [groupedVaccines]);

	// List of unique past & standard vaccine names for autocomplete
	const pastVaccineOptions = useMemo(() => {
		const names = new Set<string>();
		// 1. Existing user's tracked vaccines
		for (const v of vaccines) {
			if (v.vaccineName?.trim()) names.add(v.vaccineName.trim());
		}
		// 2. Standard childhood schedule vaccines
		for (const s of standardChildhoodVaccines) {
			if (s.vaccineName?.trim()) names.add(s.vaccineName.trim());
		}
		return Array.from(names);
	}, [vaccines]);

	function handleVaccineNameChange(name: string) {
		setFormVaccineName(name);
		if (!editingVaccine) {
			const existingDoses = vaccines.filter(
				(v) => v.vaccineName.trim().toLowerCase() === name.trim().toLowerCase()
			);
			if (existingDoses.length > 0) {
				setFormDose(`Dose ${existingDoses.length + 1}`);
			}
		}
	}

	const filteredGroups = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		return groupedVaccines.filter((g) => {
			if (filter === "completed" && !g.isAllCompleted) return false;
			if (filter === "upcoming" && !g.hasUpcoming) return false;
			if (filter === "overdue" && !g.hasOverdue) return false;

			if (query) {
				const matchName = g.vaccineName.toLowerCase().includes(query);
				const matchDoctor = g.administeredBy?.toLowerCase().includes(query);
				const matchNotes = g.notes?.toLowerCase().includes(query);
				const matchDoses = g.doses.some(
					(d) =>
						d.dose.toLowerCase().includes(query) ||
						d.vaccineDate.includes(query) ||
						d.administeredBy?.toLowerCase().includes(query) ||
						d.notes?.toLowerCase().includes(query)
				);
				return matchName || matchDoctor || matchNotes || matchDoses;
			}

			return true;
		});
	}, [groupedVaccines, filter, searchQuery]);

	async function handleStatusToggle(vaccine: BabyVaccine) {
		if (submitting) return;
		setSubmitting(true);
		const nextStatus: VaccineStatus = vaccine.status === "completed" ? "upcoming" : "completed";
		try {
			await onToggleStatus(vaccine.id, nextStatus);
			showAlert(
				"VACCINE UPDATED",
				nextStatus === "completed"
					? `Marked ${vaccine.vaccineName} as completed! 💉`
					: `Marked ${vaccine.vaccineName} as upcoming`
			);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to update status");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);

		const form = new FormData(event.currentTarget);
		const vaccineName = formVaccineName.trim() || String(form.get("vaccineName") || "").trim();
		const vaccineDate = String(form.get("vaccineDate") || "").trim();
		const dose = formDose.trim() || String(form.get("dose") || "").trim();
		const status = (form.get("status") as VaccineStatus) || "upcoming";
		const administeredBy = String(form.get("administeredBy") || "").trim();
		const notes = String(form.get("notes") || "").trim();

		try {
			if (editingVaccine) {
				await onUpdateVaccine(editingVaccine.id, {
					vaccineName,
					vaccineDate,
					dose,
					status,
					administeredBy,
					notes,
				});
				showAlert("VACCINE UPDATED", `${vaccineName} updated successfully!`);
			} else {
				await onCreateVaccine({
					vaccineName,
					vaccineDate,
					dose,
					status,
					administeredBy,
					notes,
				});
				showAlert("VACCINE SCHEDULED", `${vaccineName} scheduled successfully!`);
			}
			setDialogOpen(false);
			setEditingVaccine(null);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save vaccine");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (submitting) return;
		setSubmitting(true);
		try {
			await onDeleteVaccine(id);
			showAlert("VACCINE DELETED", "Vaccine record deleted successfully.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete vaccine");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDeleteGroup(group: GroupedVaccine) {
		if (submitting) return;
		setSubmitting(true);
		try {
			for (const d of group.doses) {
				await onDeleteVaccine(d.id);
			}
			showAlert("VACCINE DELETED", `${group.vaccineName} removed from schedule.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete vaccine");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleSeedStandard() {
		if (submitting) return;
		setSubmitting(true);
		try {
			await onSeedStandardSchedule();
			showAlert("SCHEDULE POPULATED", "Standard childhood vaccines added to schedule! 🛡️");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to populate schedule");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6">
			{/* Alert notification */}
			<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />

			{/* Top Metric Cards */}
			<div data-page-palette-preserve className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
				{/* Total Vaccines (Sky) */}
				<Card className="metric-summary-card metric-summary-card--sky relative gap-0 overflow-hidden rounded-3xl border border-blue-200 bg-[#f5f8ff] py-0 shadow-sm shadow-blue-950/5 ring-0 transition-shadow hover:shadow-md dark:border-blue-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-2xs">
								<Syringe size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Total Vaccines
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-blue-100/90 px-2.5 text-[9px] font-bold tracking-wider text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
								<Shield size={10} /> SCHEDULE
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.total}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Tracked in schedule
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setFilter("all")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-blue-500/10 px-3 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Completed (Emerald) */}
				<Card className="metric-summary-card metric-summary-card--emerald relative gap-0 overflow-hidden rounded-3xl border border-emerald-200 bg-[#eafbf3] py-0 shadow-sm shadow-emerald-950/5 ring-0 transition-shadow hover:shadow-md dark:border-[#273349] dark:bg-[#151b2b]">
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
								{stats.completed}
								<span className="ml-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
									of {stats.total}
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
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-emerald-500/10 px-3 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-300"
							>
								<ArrowRight size={12} /> View details
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Upcoming Doses (Violet) */}
				<Card className="metric-summary-card metric-summary-card--violet relative gap-0 overflow-hidden rounded-3xl border border-violet-200 bg-[#f8f6ff] py-0 shadow-sm shadow-violet-950/5 ring-0 transition-shadow hover:shadow-md dark:border-violet-900/70 dark:bg-[#151b2b]">
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
								{stats.upcoming}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Scheduled doses
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setFilter("upcoming")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-violet-500/10 px-3 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Needs Attention (Amber) */}
				<Card className="metric-summary-card metric-summary-card--amber relative gap-0 overflow-hidden rounded-3xl border border-amber-200 bg-[#fffaf0] py-0 shadow-sm shadow-amber-950/5 ring-0 transition-shadow hover:shadow-md dark:border-amber-900/70 dark:bg-[#151b2b]">
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
								<Clock size={10} /> {stats.overdue > 0 ? "DUE NOW" : "ON TRACK"}
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.overdue}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								{stats.overdue > 0 ? "Past recommended date" : "All current doses up to date"}
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setFilter("overdue")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-amber-500/10 px-3 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300"
							>
								<ArrowRight size={12} /> Review
							</button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Immunization Protection Progress Banner */}
			{stats.total > 0 && (
				<div className="rounded-2xl border border-rose-200/80 bg-linear-to-r from-rose-50/80 via-white to-amber-50/60 p-3.5 shadow-2xs sm:p-4 dark:border-rose-900/60 dark:from-slate-900 dark:to-slate-950">
					<div className="flex items-center justify-between gap-2 text-xs">
						<span className="inline-flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
							<ShieldCheck size={15} className="text-rose-600 dark:text-rose-400" />
							Childhood Immunization Progress
						</span>
						<span className="font-bold text-slate-700 dark:text-slate-300">
							{stats.completed} of {stats.total} completed ({stats.completionRate}%)
						</span>
					</div>
					<div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
						<div
							className="h-full rounded-full bg-linear-to-r from-rose-500 to-emerald-500 transition-all duration-500"
							style={{ width: `${stats.completionRate}%` }}
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
						{/* Search Input (On the left, matching height of filter pills: h-10 sm:h-11) */}
						<label className="relative block w-full min-w-0 sm:w-56 sm:flex-initial xl:w-72">
							<Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search vaccines, doses, notes..."
								aria-label="Search vaccines"
								className="h-10 sm:h-11 w-full rounded-xl border-white/80 bg-white/75 pl-9.5 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
									{ key: "all", label: `All (${tabCounts.total})` },
									{ key: "upcoming", label: `Upcoming (${tabCounts.upcoming})` },
									{ key: "completed", label: `Completed (${tabCounts.completed})` },
									{ key: "overdue", label: `Overdue (${tabCounts.overdue})` },
								] as const
							).map((tab) => (
								<button
									key={tab.key}
									type="button"
									onClick={() => setFilter(tab.key)}
									className={`password-filter-mode-option shrink-0 inline-flex h-8 sm:h-9 items-center rounded-lg border px-2.5 text-xs font-semibold transition-all ${filter === tab.key
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
						{vaccines.length === 0 && (
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={handleSeedStandard}
								disabled={submitting}
								className="h-10 sm:h-11 flex-1 sm:flex-initial gap-1.5 rounded-xl border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
							>
								<ShieldCheck size={14} />
								Load Standard Schedule
							</Button>
						)}
						<Button
							type="button"
							onClick={() => {
								setEditingVaccine(null);
								setFormVaccineName("");
								setFormDose("Dose 1");
								setDialogOpen(true);
							}}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button h-10 sm:h-11 flex-1 sm:flex-initial gap-1.5 rounded-xl border px-3.5 text-xs font-bold shadow-xs transition-all active:scale-95"
						>
							<Plus size={14} /> Add Vaccine
						</Button>
					</div>
				</div>
			</div>

			{/* Vaccine Records List (Horizontal Row Cards grouped by vaccine name) */}
			<div className="space-y-2.5">
				{filteredGroups.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
						<span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300">
							<Syringe size={22} />
						</span>
						<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
							{searchQuery ? "No vaccines matching your search" : "No vaccines found in this view"}
						</p>
						<p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
							{searchQuery
								? `No results found for "${searchQuery}". Try a different keyword or clear search.`
								: vaccines.length === 0
								? "Click 'Load Standard Schedule' to import standard childhood immunizations or add custom vaccines."
								: "Try selecting another filter above."}
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
					filteredGroups.map((group) => {
						return (
							<article
								key={group.vaccineName}
								data-page-palette-preserve
								className="budget-bill-card group relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5 overflow-hidden rounded-2xl border p-3 transition-all hover:-translate-y-0.5 sm:rounded-3xl sm:p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-4"
							>
								{/* Left Squircle Icon */}
								{group.isAllCompleted ? (
									<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-emerald-50 to-emerald-100/70 text-emerald-600 shadow-xs sm:size-11 dark:from-emerald-950/60 dark:to-emerald-900/40 dark:text-emerald-400">
										<ShieldCheck size={19} className="sm:size-[21px]" />
									</span>
								) : group.hasOverdue ? (
									<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-amber-50 to-amber-100/70 text-amber-600 shadow-xs sm:size-11 dark:from-amber-950/60 dark:to-amber-900/40 dark:text-amber-400">
										<AlertTriangle size={19} className="sm:size-[21px]" />
									</span>
								) : (
									<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-rose-50 to-rose-100/70 text-rose-600 shadow-xs sm:size-11 dark:from-rose-950/60 dark:to-rose-900/40 dark:text-rose-400">
										<Syringe size={19} className="sm:size-[21px]" />
									</span>
								)}

								{/* Title and Subtitle Metadata */}
								<div className="min-w-0">
									<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
										<p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
											{group.vaccineName}
										</p>
										{group.isAllCompleted ? (
											<span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
												Completed ({group.completedDoses}/{group.totalDoses})
											</span>
										) : group.hasOverdue ? (
											<span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
												Needs Attention
											</span>
										) : (
											<span className="inline-flex shrink-0 items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
												{group.completedDoses} of {group.totalDoses} Doses
											</span>
										)}
									</div>

									<div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
										{group.nextDose ? (
											<span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
												<Calendar size={12} className="text-slate-400" />
												{group.isAllCompleted ? "Last:" : "Next:"} {group.nextDose.dose ? `${group.nextDose.dose} · ` : ""}{group.nextDose.vaccineDate}
											</span>
										) : null}
										{group.administeredBy ? (
											<>
												<span aria-hidden="true">·</span>
												<span className="truncate max-w-[180px]" title={group.administeredBy}>
													By {group.administeredBy}
												</span>
											</>
										) : null}
										{group.notes ? (
											<>
												<span aria-hidden="true">·</span>
												<span className="max-w-[200px] truncate italic sm:max-w-xs md:max-w-sm">
													&ldquo;{group.notes}&rdquo;
												</span>
											</>
										) : null}
									</div>
								</div>

								{/* Right Side: Divider, Doses, and Action Pill */}
								<div className="col-span-full flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100/80 pt-2.5 dark:border-slate-800/80 md:col-auto md:border-t-0 md:border-l md:border-slate-200 md:pl-4 md:pt-0 dark:md:border-slate-800">
									{/* Doses List with quick check toggle */}
									<div className="flex flex-wrap items-center gap-1.5">
										{group.doses.map((doseItem) => {
											const isCompleted = doseItem.status === "completed";
											const isOverdue = !isCompleted && (doseItem.status === "overdue" || doseItem.vaccineDate < todayStr);

											return (
												<div
													key={doseItem.id}
													className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition-all ${
														isCompleted
															? "border-emerald-200/90 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
															: isOverdue
															? "border-amber-200/90 bg-amber-50/70 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
															: "border-slate-200 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
													}`}
												>
													<button
														type="button"
														onClick={() => handleStatusToggle(doseItem)}
														disabled={submitting}
														className={`grid size-4 place-items-center rounded-md border transition-all ${
															isCompleted
																? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
																: "border-slate-300 bg-white hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-800"
														}`}
														title={isCompleted ? `${doseItem.dose || "Dose"}: Completed (tap to toggle)` : `${doseItem.dose || "Dose"}: Upcoming (tap to complete)`}
														aria-label={isCompleted ? `Mark ${doseItem.dose || "Dose"} as upcoming` : `Mark ${doseItem.dose || "Dose"} as completed`}
													>
														{isCompleted && <CheckCircle2 size={11} strokeWidth={2.5} />}
													</button>

													<button
														type="button"
														onClick={() => {
															setEditingVaccine(doseItem);
															setFormVaccineName(doseItem.vaccineName);
															setFormDose(doseItem.dose || "Dose 1");
															setDialogOpen(true);
														}}
														className="font-semibold hover:underline text-left cursor-pointer"
														title="Click to edit dose"
													>
														{doseItem.dose || "Dose"}
													</button>

													<span
														className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
															isCompleted
																? "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
																: isOverdue
																? "bg-amber-100/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
																: "bg-sky-100/80 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300"
														}`}
													>
														{isCompleted ? "Done" : isOverdue ? "Overdue" : doseItem.vaccineDate}
													</span>
												</div>
											);
										})}
									</div>

									{/* Actions Pill Group (Add Dose, Edit, Delete) */}
									<div className="budget-bill-actions flex shrink-0 items-center gap-0.5 rounded-2xl border p-0.5">
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											disabled={submitting}
											className="budget-bill-action size-7.5 rounded-xl text-slate-500 transition-colors hover:text-slate-900 sm:size-8 dark:text-slate-400 dark:hover:text-white"
											aria-label={`Add next dose for ${group.vaccineName}`}
											title="Add next dose"
											onClick={() => {
												setFormVaccineName(group.vaccineName);
												setFormDose(`Dose ${group.totalDoses + 1}`);
												setEditingVaccine(null);
												setDialogOpen(true);
											}}
										>
											<Plus size={14} className="sm:size-[15px]" />
										</Button>

										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											disabled={submitting}
											className="budget-bill-action budget-bill-action--edit size-7.5 rounded-xl text-slate-500 transition-colors sm:size-8 dark:text-slate-400"
											aria-label={`Edit ${group.vaccineName}`}
											title="Edit vaccine details"
											onClick={() => {
												const target = group.nextDose ?? group.doses[0];
												if (target) {
													setEditingVaccine(target);
													setFormVaccineName(target.vaccineName);
													setFormDose(target.dose || "Dose 1");
												}
												setDialogOpen(true);
											}}
										>
											<Pencil size={14} className="sm:size-[15px]" />
										</Button>

										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											disabled={submitting}
											className="budget-bill-action budget-bill-action--delete size-7.5 rounded-xl text-slate-400 transition-colors sm:size-8 dark:text-slate-400"
											aria-label={`Delete ${group.vaccineName}`}
											title="Delete all doses for this vaccine"
											onClick={() => handleDeleteGroup(group)}
										>
											<Trash2 size={14} className="sm:size-[15px]" />
										</Button>
									</div>
								</div>
							</article>
						);
					})
				)}
			</div>

			{/* Add/Edit Vaccine Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel max-h-[92vh] max-w-md overflow-hidden p-0 shadow-2xl sm:rounded-3xl"
				>
					<PaletteDialogHeader
						eyebrow="IMMUNIZATION TRACKER"
						title={editingVaccine ? "Edit Vaccine Record" : "Schedule Vaccine"}
						description="Track immunization schedule, status, and administration dates."
						icon={<Syringe size={18} />}
						closeLabel="Close dialog"
					/>
					<form
						key={editingVaccine ? editingVaccine.id : `${formVaccineName}-${formDose}-${dialogOpen}`}
						onSubmit={handleSubmit}
						className="flex max-h-[calc(92vh-85px)] flex-col overflow-y-auto"
					>
						<div className="space-y-4 p-5 sm:p-6 text-sm">
							<div className="space-y-1.5">
								<label className="block text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									Vaccine Name
								</label>
								<Input
									name="vaccineName"
									required
									list="past-vaccine-options"
									value={formVaccineName}
									onChange={(e) => handleVaccineNameChange(e.target.value)}
									placeholder="e.g. DTaP-HepB-IPV (Hexavalent)"
									autoComplete="off"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
								<datalist id="past-vaccine-options">
									{pastVaccineOptions.map((name) => (
										<option key={name} value={name} />
									))}
								</datalist>

								{/* Quick suggestions from past / standard vaccines */}
								{pastVaccineOptions.length > 0 && !editingVaccine && (
									<div className="space-y-1 pt-1">
										<span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
											Quick select past / recommended:
										</span>
										<div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
											{pastVaccineOptions.slice(0, 8).map((name) => {
												const active = formVaccineName.trim().toLowerCase() === name.toLowerCase();
												return (
													<button
														key={name}
														type="button"
														onClick={() => handleVaccineNameChange(name)}
														className={`rounded-lg border px-2 py-0.5 text-[11px] transition-all cursor-pointer ${
															active
																? "border-rose-400 bg-rose-50 font-bold text-rose-700 shadow-2xs dark:border-rose-700 dark:bg-rose-950/70 dark:text-rose-300"
																: "border-slate-200 bg-white/80 font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
														}`}
													>
														{name}
													</button>
												);
											})}
										</div>
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Scheduled Date</span>
									<Input
										type="date"
										name="vaccineDate"
										required
										defaultValue={editingVaccine?.vaccineDate ?? new Date().toISOString().split("T")[0]}
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>

								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<span className="text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">Dose</span>
										{formVaccineName && !editingVaccine && (
											<span className="text-[10px] text-slate-500 dark:text-slate-400">
												{(() => {
													const count = vaccines.filter(
														(v) => v.vaccineName.trim().toLowerCase() === formVaccineName.trim().toLowerCase()
													).length;
													return count > 0 ? `${count} past dose${count > 1 ? "s" : ""} on record` : "New vaccine";
												})()}
											</span>
										)}
									</div>
									<Input
										name="dose"
										list="dose-options"
										value={formDose}
										onChange={(e) => setFormDose(e.target.value)}
										placeholder="e.g. Dose 1, Booster"
										autoComplete="off"
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
									<datalist id="dose-options">
										<option value="Birth dose" />
										<option value="Dose 1" />
										<option value="Dose 2" />
										<option value="Dose 3" />
										<option value="Dose 4" />
										<option value="Booster 1" />
										<option value="Booster 2" />
									</datalist>
									<div className="flex flex-wrap gap-1 pt-0.5">
										{["Dose 1", "Dose 2", "Dose 3", "Booster 1", "Booster 2"].map((d) => (
											<button
												key={d}
												type="button"
												onClick={() => setFormDose(d)}
												className={`rounded-md border px-2 py-0.5 text-[10px] transition-all cursor-pointer ${
													formDose.toLowerCase() === d.toLowerCase()
														? "border-rose-400 bg-rose-50 font-bold text-rose-700 dark:border-rose-700 dark:bg-rose-950/70 dark:text-rose-300"
														: "border-slate-200 bg-white/80 font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
												}`}
											>
												{d}
											</button>
										))}
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Status</span>
									<select
										name="status"
										defaultValue={editingVaccine?.status ?? "upcoming"}
										className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									>
										<option value="upcoming">Upcoming</option>
										<option value="completed">Completed</option>
										<option value="overdue">Overdue</option>
										<option value="skipped">Skipped / Delayed</option>
									</select>
								</label>

								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Administered By</span>
									<Input
										name="administeredBy"
										placeholder="e.g. Dr. Johnson / City Clinic"
										defaultValue={editingVaccine?.administeredBy ?? ""}
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>
							</div>

							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Pediatrician Notes / Side Effects</span>
								<textarea
									name="notes"
									rows={2}
									placeholder="e.g. Mild low-grade fever after dose, given baby paracetamol..."
									defaultValue={editingVaccine?.notes ?? ""}
									className="w-full rounded-md border border-rose-200 bg-white p-3 text-sm text-slate-900 shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>
						</div>

						<div className="palette-dialog-footer sticky bottom-0 flex flex-wrap items-center justify-between gap-2 p-4 sm:px-6">
							<div>
								{editingVaccine && (
									<Button
										type="button"
										variant="ghost"
										disabled={submitting}
										className="h-9 gap-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50"
										onClick={async () => {
											await handleDelete(editingVaccine.id);
											setDialogOpen(false);
											setEditingVaccine(null);
										}}
									>
										<Trash2 size={14} /> Delete this dose
									</Button>
								)}
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Button
									data-page-palette-secondary
									type="button"
									disabled={submitting}
									variant="outline"
									className="palette-dialog-footer-button border font-medium transition-colors duration-150"
									onClick={() => setDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="ghost"
									disabled={submitting}
									style={{ "--action-accent": paletteAccent } as CSSProperties}
									className="palette-action-button palette-dialog-footer-button border font-medium transition-colors duration-150"
								>
									{submitting ? (
										<>
											<Loader2 size={16} className="animate-spin shrink-0" />
											<span>Saving...</span>
										</>
									) : (
										<>
											{editingVaccine ? null : <Plus size={16} className="shrink-0" />}
											<span>{editingVaccine ? "Save changes" : "Schedule vaccine"}</span>
										</>
									)}
								</Button>
							</div>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
