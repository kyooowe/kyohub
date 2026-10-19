"use client";

import { useMemo, useState, type FormEvent, type CSSProperties } from "react";
import {
	Syringe,
	CheckCircle2,
	Clock,
	AlertTriangle,
	Plus,
	Trash2,
	Edit3,
	ShieldCheck,
	Shield,
	Loader2,
	Calendar,
	Sparkles,
	ArrowRight,
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

	const filteredVaccines = useMemo(() => {
		return vaccines.filter((v) => {
			const isOverdue = v.status === "overdue" || (v.status === "upcoming" && v.vaccineDate < todayStr);
			if (filter === "completed") return v.status === "completed";
			if (filter === "upcoming") return v.status === "upcoming" && !isOverdue;
			if (filter === "overdue") return isOverdue;
			return true;
		});
	}, [vaccines, filter, todayStr]);

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
		const vaccineName = String(form.get("vaccineName") || "").trim();
		const vaccineDate = String(form.get("vaccineDate") || "").trim();
		const dose = String(form.get("dose") || "").trim();
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

			{/* Controls, Filters & Add Buttons (Styled like Image 2) */}
			<div
				style={{ "--password-accent": paletteAccent } as CSSProperties}
				className="password-library-header relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border p-2.5 shadow-md sm:p-3"
			>
				<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-10 size-28 rounded-full" />
				<div className="relative z-10 flex w-full min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
					{/* Filter Pills */}
					<div className="password-filter-mode-group flex w-full shrink-0 items-center gap-1 overflow-x-auto scrollbar-none rounded-xl border p-1 shadow-xs sm:w-auto">
						{(
							[
								{ key: "all", label: `All (${stats.total})` },
								{ key: "upcoming", label: `Upcoming (${stats.upcoming})` },
								{ key: "completed", label: `Completed (${stats.completed})` },
								{ key: "overdue", label: `Overdue (${stats.overdue})` },
							] as const
						).map((tab) => (
							<button
								key={tab.key}
								type="button"
								onClick={() => setFilter(tab.key)}
								className={`password-filter-mode-option shrink-0 inline-flex h-8 sm:h-9 items-center rounded-lg border px-2.5 text-xs font-semibold transition-all ${
									filter === tab.key
										? "password-filter-mode-option--active"
										: "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>

					{/* Actions */}
					<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
						{vaccines.length === 0 && (
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={handleSeedStandard}
								disabled={submitting}
								className="h-9 flex-1 sm:flex-initial gap-1.5 rounded-xl border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
							>
								<ShieldCheck size={14} />
								Load Standard Schedule
							</Button>
						)}
						<Button
							type="button"
							onClick={() => {
								setEditingVaccine(null);
								setDialogOpen(true);
							}}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button h-9 flex-1 sm:flex-initial gap-1.5 rounded-xl border px-3.5 text-xs font-bold shadow-xs transition-all active:scale-95"
						>
							<Plus size={14} /> Add Vaccine
						</Button>
					</div>
				</div>
			</div>

			{/* Vaccine Records List (Responsive Grid: 1 col on mobile, 2 col on sm/tablet, 3 col on lg) */}
			<div className="space-y-3">
				{filteredVaccines.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
						<span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300">
							<Syringe size={22} />
						</span>
						<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
							No vaccines found in this view
						</p>
						<p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
							{vaccines.length === 0
								? "Click 'Load Standard Schedule' to import standard childhood immunizations or add custom vaccines."
								: "Try selecting another filter above."}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
						{filteredVaccines.map((v) => {
							const isCompleted = v.status === "completed";
							const isOverdue = !isCompleted && (v.status === "overdue" || v.vaccineDate < todayStr);

							return (
								<div
									key={v.id}
									className={`flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-xs ${
										isCompleted
											? "border-emerald-200/80 bg-linear-to-br from-emerald-50/50 via-white to-white dark:border-emerald-950/70 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900"
											: isOverdue
											? "border-amber-200/80 bg-linear-to-br from-amber-50/50 via-white to-white dark:border-amber-950/70 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900"
											: "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
									}`}
								>
									<div>
										{/* Top Row: Name + Status Badge + Actions */}
										<div className="flex items-start justify-between gap-2">
											<div className="flex items-start gap-2.5 min-w-0">
												{/* Quick Checkmark Toggle */}
												<button
													type="button"
													onClick={() => handleStatusToggle(v)}
													disabled={submitting}
													className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl border transition-all ${
														isCompleted
															? "border-emerald-500 bg-emerald-500 text-white shadow-2xs"
															: "border-slate-300 bg-white hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-800"
													}`}
													title={isCompleted ? "Completed! Tap to mark upcoming" : "Tap to mark completed"}
													aria-label={isCompleted ? "Completed" : "Mark as completed"}
												>
													{isCompleted && <CheckCircle2 size={16} />}
												</button>

												<div className="min-w-0">
													<h4 className="truncate font-bold text-slate-900 dark:text-slate-100 text-sm">
														{v.vaccineName}
													</h4>
													<div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
														{v.dose && (
															<span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
																{v.dose}
															</span>
														)}
														<span
															className={`rounded-md px-2 py-0.5 text-[11px] font-bold capitalize ${
																isCompleted
																	? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
																	: isOverdue
																	? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
																	: "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300"
															}`}
														>
															{isCompleted ? "Completed" : isOverdue ? "Overdue" : "Upcoming"}
														</span>
													</div>
												</div>
											</div>

											{/* Edit / Delete Actions */}
											<div className="flex items-center gap-0.5">
												<button
													type="button"
													onClick={() => {
														setEditingVaccine(v);
														setDialogOpen(true);
													}}
													className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
													title="Edit vaccine"
												>
													<Edit3 size={13} />
												</button>
												<button
													type="button"
													onClick={() => handleDelete(v.id)}
													disabled={submitting}
													className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
													title="Delete vaccine"
												>
													<Trash2 size={13} />
												</button>
											</div>
										</div>

										{/* Notes excerpt if any */}
										{v.notes && (
											<p className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic">
												&ldquo;{v.notes}&rdquo;
											</p>
										)}
									</div>

									{/* Footer Meta */}
									<div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
										<span className="inline-flex items-center gap-1">
											<Calendar size={12} className="text-slate-400" />
											{v.vaccineDate}
										</span>
										{v.administeredBy && (
											<span className="truncate max-w-[130px]" title={v.administeredBy}>
												By {v.administeredBy}
											</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
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
					<form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-85px)] flex-col overflow-y-auto">
						<div className="space-y-3.5 p-5 sm:p-6 text-sm">
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Vaccine Name</span>
								<Input
									name="vaccineName"
									required
									defaultValue={editingVaccine?.vaccineName ?? ""}
									placeholder="e.g. DTaP-HepB-IPV (Hexavalent)"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>

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

								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Dose</span>
									<Input
										name="dose"
										placeholder="e.g. Dose 1, Booster"
										defaultValue={editingVaccine?.dose ?? "Dose 1"}
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>
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

						<div className="palette-dialog-footer sticky bottom-0 flex flex-wrap justify-end gap-2 p-4 sm:px-6">
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
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
