"use client";

import { useMemo, useState, type FormEvent, type CSSProperties } from "react";
import {
	Stethoscope,
	AlertCircle,
	Plus,
	Search,
	Trash2,
	Edit3,
	Calendar,
	Building2,
	User,
	Loader2,
	CheckCircle2,
	HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import type { PagePalette } from "@/components/settings/page-palettes";
import type { BabyMedicalNote, MedicalNoteCategory } from "../types";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";
import { toast } from "sonner";

export function MedicalNotes({
	notes,
	onCreateNote,
	onUpdateNote,
	onDeleteNote,
	paletteAccent = "#B66F57",
	dialogPalette,
}: {
	notes: BabyMedicalNote[];
	onCreateNote: (data: Parameters<typeof import("../actions/baby-tracker-actions").createMedicalNote>[0]) => Promise<void>;
	onUpdateNote: (id: string, data: Parameters<typeof import("../actions/baby-tracker-actions").updateMedicalNote>[1]) => Promise<void>;
	onDeleteNote: (id: string) => Promise<void>;
	paletteAccent?: string;
	dialogPalette?: PagePalette;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<BabyMedicalNote | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(3000);

	const todayStr = new Date().toISOString().split("T")[0];

	const categories: Array<{ key: MedicalNoteCategory | "all"; label: string }> = [
		{ key: "all", label: "All Notes" },
		{ key: "checkup", label: "Checkup" },
		{ key: "fever", label: "Fever & Cold" },
		{ key: "teething", label: "Teething" },
		{ key: "allergy", label: "Allergy / Rash" },
		{ key: "colic", label: "Colic & Tummy" },
		{ key: "general", label: "General" },
	];

	const categoryBadgeStyles: Record<MedicalNoteCategory, string> = {
		checkup: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300",
		fever: "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300",
		teething: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300",
		allergy: "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300",
		colic: "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300",
		general: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
	};

	const filteredNotes = useMemo(() => {
		return notes.filter((n) => {
			const matchesCategory = categoryFilter === "all" || n.category === categoryFilter;
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				!q ||
				n.title.toLowerCase().includes(q) ||
				n.symptoms.toLowerCase().includes(q) ||
				n.doctorAdvice.toLowerCase().includes(q) ||
				n.doctorName.toLowerCase().includes(q) ||
				n.clinicName.toLowerCase().includes(q);
			return matchesCategory && matchesSearch;
		});
	}, [notes, categoryFilter, searchQuery]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);

		const form = new FormData(event.currentTarget);
		const noteDate = String(form.get("noteDate") || "").trim();
		const title = String(form.get("title") || "").trim();
		const symptoms = String(form.get("symptoms") || "").trim();
		const doctorAdvice = String(form.get("doctorAdvice") || "").trim();
		const doctorName = String(form.get("doctorName") || "").trim();
		const clinicName = String(form.get("clinicName") || "").trim();
		const category = (form.get("category") as MedicalNoteCategory) || "general";

		try {
			if (editingNote) {
				await onUpdateNote(editingNote.id, {
					noteDate,
					title,
					symptoms,
					doctorAdvice,
					doctorName,
					clinicName,
					category,
				});
				showAlert("NOTE UPDATED", "Medical note updated successfully!");
			} else {
				await onCreateNote({
					noteDate,
					title,
					symptoms,
					doctorAdvice,
					doctorName,
					clinicName,
					category,
				});
				showAlert("NOTE SAVED", "Medical note saved! 🩺");
			}
			setDialogOpen(false);
			setEditingNote(null);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save note");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (submitting) return;
		setSubmitting(true);
		try {
			await onDeleteNote(id);
			showAlert("NOTE DELETED", "Medical note deleted successfully.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete note");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6">
			{/* Alert notification */}
			<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />

			{/* Search, Filter, and Action Bar */}
			<div
				style={{ "--password-accent": paletteAccent } as CSSProperties}
				className="password-library-header relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border p-2.5 shadow-md sm:p-3"
			>
				<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-10 size-28 rounded-full" />
				<div className="relative z-10 flex w-full min-w-0 flex-col gap-2.5 sm:gap-3 xl:flex-row xl:items-center xl:justify-between">
					{/* Left controls: Search + Category filter pills */}
					<div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center xl:w-auto">
						{/* Search input */}
						<label className="relative block w-full min-w-0 sm:w-60 xl:w-64">
							<Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
							<Input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search symptoms or advice..."
								aria-label="Search symptoms or advice"
								className="h-10 w-full rounded-xl border-white/80 bg-white/75 pl-9 pr-3 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
							/>
						</label>

						{/* Category Filter Pills (Scrollable on mobile) */}
						<div className="password-filter-mode-group flex w-full shrink-0 items-center gap-1 overflow-x-auto scrollbar-none rounded-xl border p-1 shadow-xs sm:w-auto">
							{categories.map((c) => {
								const isSelected = categoryFilter === c.key;
								return (
									<button
										key={c.key}
										type="button"
										onClick={() => setCategoryFilter(c.key)}
										className={`password-filter-mode-option shrink-0 inline-flex h-8 sm:h-9 items-center rounded-lg border px-2.5 text-xs font-semibold transition-all ${
											isSelected
												? "password-filter-mode-option--active"
												: "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
										}`}
									>
										{c.label}
									</button>
								);
							})}
						</div>
					</div>

					{/* Action CTA */}
					<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto xl:justify-end">
						<Button
							type="button"
							onClick={() => {
								setEditingNote(null);
								setDialogOpen(true);
							}}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button h-10 flex-1 sm:flex-initial gap-1.5 rounded-xl border px-3.5 text-xs font-bold shadow-xs transition-all active:scale-95"
						>
							<Plus size={15} /> Add Medical Note
						</Button>
					</div>
				</div>
			</div>

			{/* Notes Cards (Responsive Grid: 1 col on mobile, 2 col on lg) */}
			{filteredNotes.length === 0 ? (
				<div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
					<span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300">
						<Stethoscope size={22} />
					</span>
					<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
						No medical notes found
					</p>
					<p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
						Log pediatrician visit advice, symptoms observed, fever history, and checkup insights.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 lg:grid-cols-2 sm:gap-4">
					{filteredNotes.map((note) => (
						<div
							key={note.id}
							className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900"
						>
							<div>
								{/* Header info */}
								<div className="flex items-start justify-between gap-2">
									<div className="flex flex-wrap items-center gap-1.5">
										<span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
											<Calendar size={12} />
											{note.noteDate}
										</span>
										<span
											className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
												categoryBadgeStyles[note.category] || categoryBadgeStyles.general
											}`}
										>
											{note.category}
										</span>
									</div>

									{/* Action buttons */}
									<div className="flex items-center gap-0.5">
										<button
											type="button"
											onClick={() => {
												setEditingNote(note);
												setDialogOpen(true);
											}}
											className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
											title="Edit note"
										>
											<Edit3 size={13} />
										</button>
										<button
											type="button"
											onClick={() => handleDelete(note.id)}
											disabled={submitting}
											className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
											title="Delete note"
										>
											<Trash2 size={13} />
										</button>
									</div>
								</div>

								{note.title && (
									<h4 className="mt-2.5 text-base font-bold text-slate-900 dark:text-slate-100">
										{note.title}
									</h4>
								)}

								{/* Symptoms Section */}
								<div className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 text-xs dark:border-amber-900/60 dark:bg-amber-950/30">
									<div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
										<AlertCircle size={14} className="text-amber-600 shrink-0" />
										<span>Symptoms Observed:</span>
									</div>
									<p className="mt-1 leading-relaxed text-amber-950/90 dark:text-amber-100">
										{note.symptoms}
									</p>
								</div>

								{/* Doctor Advice Section */}
								<div className="mt-2.5 rounded-xl border border-teal-200/70 bg-teal-50/60 p-3 text-xs dark:border-teal-900/60 dark:bg-teal-950/30">
									<div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-200">
										<Stethoscope size={14} className="text-teal-600 shrink-0" />
										<span>Pediatrician Advice &amp; Care:</span>
									</div>
									<p className="mt-1 leading-relaxed text-teal-950/90 dark:text-teal-100 whitespace-pre-line">
										{note.doctorAdvice}
									</p>
								</div>
							</div>

							{/* Footer with doctor & clinic */}
							{(note.doctorName || note.clinicName) && (
								<div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
									{note.doctorName && (
										<span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
											<User size={12} className="text-slate-400" />
											{note.doctorName}
										</span>
									)}
									{note.clinicName && (
										<span className="inline-flex items-center gap-1">
											<Building2 size={12} className="text-slate-400" />
											{note.clinicName}
										</span>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Add/Edit Medical Note Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel max-h-[92vh] max-w-lg overflow-hidden p-0 shadow-2xl sm:rounded-3xl"
				>
					<PaletteDialogHeader
						eyebrow="MEDICAL NOTES"
						title={editingNote ? "Edit Medical Note" : "Record Doctor Visit / Symptoms"}
						description="Log symptoms and pediatrician advice for quick reference."
						icon={<Stethoscope size={18} />}
						closeLabel="Close dialog"
					/>
					<form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-85px)] flex-col overflow-y-auto">
						<div className="space-y-3.5 p-5 sm:p-6 text-sm">
							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Date</span>
									<Input
										type="date"
										name="noteDate"
										defaultValue={editingNote?.noteDate ?? todayStr}
										required
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>

								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Category</span>
									<select
										name="category"
										defaultValue={editingNote?.category ?? "general"}
										className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									>
										<option value="checkup">Well-Baby Checkup</option>
										<option value="fever">Fever / Cold / Flu</option>
										<option value="teething">Teething</option>
										<option value="allergy">Allergy / Rash</option>
										<option value="colic">Colic / Tummy</option>
										<option value="general">General Visit</option>
									</select>
								</label>
							</div>

							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Subject / Title (Optional)</span>
								<Input
									name="title"
									defaultValue={editingNote?.title ?? ""}
									placeholder="e.g. 6-Month Well Child Visit, High Fever After Teething"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>

							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Observed Symptoms</span>
								<textarea
									name="symptoms"
									rows={3}
									defaultValue={editingNote?.symptoms ?? ""}
									placeholder="Describe what baby was feeling (e.g. 38.3°C temperature, runny nose, irritable, swollen lower gums)..."
									className="w-full rounded-md border border-rose-200 bg-white p-3 text-sm text-slate-900 shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									required
								/>
							</label>

							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Doctor&apos;s Advice & Treatment</span>
								<textarea
									name="doctorAdvice"
									rows={3}
									defaultValue={editingNote?.doctorAdvice ?? ""}
									placeholder="Doctor instructions, recommended medicine dosage, home remedies, warning signs to watch for..."
									className="w-full rounded-md border border-rose-200 bg-white p-3 text-sm text-slate-900 shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									required
								/>
							</label>

							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Doctor / Pediatrician Name</span>
									<Input
										name="doctorName"
										defaultValue={editingNote?.doctorName ?? ""}
										placeholder="Dr. Emily Watson"
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>

								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Clinic / Hospital Name</span>
									<Input
										name="clinicName"
										defaultValue={editingNote?.clinicName ?? ""}
										placeholder="St. Jude Pediatric Center"
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>
							</div>
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
										{editingNote ? null : <Plus size={16} className="shrink-0" />}
										<span>{editingNote ? "Save changes" : "Add note"}</span>
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
