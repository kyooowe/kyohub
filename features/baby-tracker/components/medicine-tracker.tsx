"use client";

import { useMemo, useState, type FormEvent, type CSSProperties } from "react";
import { Pill, Check, Clock, Plus, Trash2, Edit3, Calendar, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import type { PagePalette } from "@/components/settings/page-palettes";
import type { BabyMedicine, MedicineStatus } from "../types";
import { getLocalDateString } from "../lib/baby-tracker-utils";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";
import { toast } from "sonner";

export function MedicineTracker({
	medicines,
	onCreateMedicine,
	onUpdateMedicine,
	onToggleStatus,
	onDeleteMedicine,
	paletteAccent = "#B66F57",
	dialogPalette,
}: {
	medicines: BabyMedicine[];
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
	const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(3000);

	const activeCount = medicines.filter((m) => m.status === "active").length;

	const filteredMedicines = useMemo(() => {
		if (filter === "active") return medicines.filter((m) => m.status === "active");
		if (filter === "completed") return medicines.filter((m) => m.status === "completed" || m.status === "paused");
		return medicines;
	}, [medicines, filter]);

	async function handleStatusToggle(med: BabyMedicine) {
		if (submitting) return;
		setSubmitting(true);
		const nextStatus: MedicineStatus = med.status === "active" ? "completed" : "active";
		try {
			await onToggleStatus(med.id, nextStatus);
			showAlert(
				"MEDICINE STATUS",
				nextStatus === "active" ? `Activated ${med.name}` : `Completed ${med.name} course! 💊`
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
		const name = String(form.get("name") || "").trim();
		const dosage = String(form.get("dosage") || "").trim();
		const instructions = String(form.get("instructions") || "").trim();
		const startDate = String(form.get("startDate") || "").trim();
		const endDate = String(form.get("endDate") || "").trim();
		const frequency = String(form.get("frequency") || "").trim();
		const status = (form.get("status") as MedicineStatus) || "active";
		const notes = String(form.get("notes") || "").trim();

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
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save medicine");
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
			toast.error(error instanceof Error ? error.message : "Failed to delete medicine");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6">
			{/* Alert notification */}
			<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />

			{/* Controls, Filters & Add Buttons */}
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
								{ key: "all", label: `All (${medicines.length})` },
								{ key: "active", label: `Active (${activeCount})` },
								{ key: "completed", label: `Completed (${medicines.length - activeCount})` },
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
						<Button
							type="button"
							onClick={() => {
								setEditingMedicine(null);
								setDialogOpen(true);
							}}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button h-9 flex-1 sm:flex-initial gap-1.5 rounded-xl border px-3.5 text-xs font-bold shadow-xs transition-all active:scale-95"
						>
							<Plus size={14} /> Add Medicine
						</Button>
					</div>
				</div>
			</div>

			{/* Medicine List (Responsive Grid: 1 col on mobile, 2 col on sm/tablet, 3 col on lg) */}
			{filteredMedicines.length === 0 ? (
				<div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
					<span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300">
						<Pill size={22} />
					</span>
					<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
						No medications in this view
					</p>
					<p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
						Log antibiotics, fever syrups, vitamin D drops, or supplements with dosage instructions.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
					{filteredMedicines.map((med) => {
						const isActive = med.status === "active";
						const isPaused = med.status === "paused";

						return (
							<div
								key={med.id}
								className={`flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-xs ${
									isActive
										? "border-rose-200/80 bg-linear-to-br from-rose-50/40 via-white to-white dark:border-rose-950/70 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900"
										: "border-slate-200/80 bg-white opacity-85 hover:opacity-100 dark:border-slate-800 dark:bg-slate-900"
								}`}
							>
								<div>
									{/* Top Header */}
									<div className="flex items-start justify-between gap-2">
										<div className="flex items-start gap-2.5 min-w-0">
											<span
												className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl text-white shadow-2xs ${
													isActive ? "bg-rose-500" : "bg-slate-400"
												}`}
											>
												<Pill size={17} />
											</span>
											<div className="min-w-0">
												<h4 className="truncate font-bold text-slate-900 dark:text-slate-100 text-sm">
													{med.name}
												</h4>
												<span className="inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
													{med.dosage}
												</span>
											</div>
										</div>

										{/* Quick actions */}
										<div className="flex items-center gap-0.5">
											<button
												type="button"
												onClick={() => {
													setEditingMedicine(med);
													setDialogOpen(true);
												}}
												className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
												title="Edit medicine"
											>
												<Edit3 size={13} />
											</button>
											<button
												type="button"
												onClick={() => handleDelete(med.id)}
												disabled={submitting}
												className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
												title="Delete medicine"
											>
												<Trash2 size={13} />
											</button>
										</div>
									</div>

									{/* Instructions block */}
									<div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-xs dark:border-slate-800/80 dark:bg-slate-800/50">
										<p className="font-medium text-slate-800 dark:text-slate-200">
											{med.instructions || "No special instructions"}
										</p>
										{med.frequency && (
											<p className="mt-1 font-semibold text-rose-700 dark:text-rose-300">
												Schedule: {med.frequency}
											</p>
										)}
									</div>

									{med.notes && (
										<p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
											&ldquo;{med.notes}&rdquo;
										</p>
									)}
								</div>

								{/* Bottom footer with dates and status button */}
								<div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
									<div className="flex items-center gap-1 text-[11px]">
										<Calendar size={12} className="text-slate-400" />
										<span>{med.startDate}</span>
										{med.endDate ? <span>→ {med.endDate}</span> : <span>(Ongoing)</span>}
									</div>

									<button
										type="button"
										onClick={() => handleStatusToggle(med)}
										disabled={submitting}
										className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
											isActive
												? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300"
												: isPaused
												? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/70 dark:text-amber-300"
												: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
										}`}
									>
										{isActive ? (
											<>
												<Check size={12} /> Active
											</>
										) : (
											<>
												<Clock size={12} /> {med.status}
											</>
										)}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Add/Edit Medicine Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel flex max-h-[min(90dvh,720px)] w-[calc(100%-1.5rem)] max-w-md flex-col overflow-hidden p-0 shadow-2xl sm:w-full sm:rounded-3xl"
				>
					<div className="shrink-0">
						<PaletteDialogHeader
							eyebrow="MEDICINE TRACKER"
							title={editingMedicine ? "Edit Medication" : "Add Medicine"}
							description="Track dosage, frequency instructions, and prescription dates."
							icon={<Pill size={18} />}
							closeLabel="Close dialog"
						/>
					</div>
					<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
						<div className="flex-1 min-h-0 space-y-3.5 overflow-y-auto p-5 text-sm sm:p-6">
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Medicine Name</span>
								<Input
									name="name"
									defaultValue={editingMedicine?.name ?? ""}
									placeholder="e.g. Paracetamol / Calpol, Vitamin D3 Drops"
									required
									autoFocus
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>

							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Dosage</span>
									<Input
										name="dosage"
										defaultValue={editingMedicine?.dosage ?? ""}
										placeholder="e.g. 2.5 ml, 1 drop, 5 mg"
										required
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>

								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Frequency</span>
									<Input
										name="frequency"
										defaultValue={editingMedicine?.frequency ?? ""}
										placeholder="e.g. Every 6h, Once daily"
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>
							</div>

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
								<span>Instructions / Administration Timing</span>
								<Input
									name="instructions"
									defaultValue={editingMedicine?.instructions ?? ""}
									placeholder="e.g. After feeding, with plenty of water, shake well"
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
								<span>Doctor Notes / Purpose</span>
								<textarea
									name="notes"
									rows={2}
									placeholder="e.g. Prescribed for 38C fever by Dr. Johnson..."
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
