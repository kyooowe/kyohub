"use client";

import { useMemo, useState, useRef, useEffect, type FormEvent, type CSSProperties } from "react";
import {
	Camera,
	UploadCloud,
	ZoomIn,
	ZoomOut,
	RotateCw,
	Download,
	Calendar,
	User,
	FileText,
	Trash2,
	Edit3,
	Plus,
	Search,
	CheckCircle2,
	AlertCircle,
	Loader2,
	X,
	Eye,
	FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import type { PagePalette } from "@/components/settings/page-palettes";
import type { BabyMedicalNote } from "../types";
import { getLocalDateString } from "../lib/baby-tracker-utils";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";
import { toast } from "sonner";
import {
	compressImageToMax500KB,
	formatBytes,
	TARGET_MAX_BYTES,
	type CompressionResult,
} from "../lib/image-compressor";

interface MedicalNotesProps {
	notes: BabyMedicalNote[];
	onCreateNote?: (data: Parameters<typeof import("../actions/baby-tracker-actions").createMedicalNote>[0]) => Promise<void>;
	onUpdateNote: (id: string, data: Parameters<typeof import("../actions/baby-tracker-actions").updateMedicalNote>[1]) => Promise<void>;
	onDeleteNote: (id: string) => Promise<void>;
	onRefresh?: () => Promise<void>;
	defaultDoctor?: string;
	paletteAccent?: string;
	dialogPalette?: PagePalette;
}

export function MedicalNotes({
	notes,
	onUpdateNote,
	onDeleteNote,
	onRefresh,
	defaultDoctor = "",
	paletteAccent = "#B66F57",
	dialogPalette,
}: MedicalNotesProps) {
	// Modals & Viewers
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<BabyMedicalNote | null>(null);
	const [viewingNote, setViewingNote] = useState<BabyMedicalNote | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [noteToDelete, setNoteToDelete] = useState<BabyMedicalNote | null>(null);

	// Lightbox viewer zoom & rotation state
	const [lightboxZoom, setLightboxZoom] = useState(1);
	const [lightboxRotation, setLightboxRotation] = useState(0);

	// Upload & Compression State
	const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);
	const [isCompressing, setIsCompressing] = useState(false);
	const [compressionError, setCompressionError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Search & Alert
	const [searchQuery, setSearchQuery] = useState("");
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(3500);

	// Hidden file inputs for Camera vs Gallery
	const cameraInputRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const todayStr = getLocalDateString();

	// Clean up object URLs on unmount or when compressedResult changes
	useEffect(() => {
		return () => {
			if (compressedResult?.previewUrl) {
				URL.revokeObjectURL(compressedResult.previewUrl);
			}
		};
	}, [compressedResult]);

	// Filter notes by search query
	const filteredNotes = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return notes;
		return notes.filter((n) => {
			return (
				n.title.toLowerCase().includes(q) ||
				n.noteDate.includes(q) ||
				n.doctorName.toLowerCase().includes(q) ||
				(n.notes && n.notes.toLowerCase().includes(q))
			);
		});
	}, [notes, searchQuery]);

	// Reset upload dialog state
	function resetUploadState() {
		if (compressedResult?.previewUrl) {
			URL.revokeObjectURL(compressedResult.previewUrl);
		}
		setCompressedResult(null);
		setIsCompressing(false);
		setCompressionError(null);
		if (cameraInputRef.current) cameraInputRef.current.value = "";
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	function handleOpenUpload() {
		resetUploadState();
		setUploadDialogOpen(true);
	}

	// Handle file selection from camera, gallery, or drag-and-drop
	async function handleProcessFile(file: File) {
		if (!file.type.startsWith("image/")) {
			setCompressionError("Please select a valid image file (JPEG, PNG, WebP).");
			return;
		}

		setIsCompressing(true);
		setCompressionError(null);

		try {
			const result = await compressImageToMax500KB(file, TARGET_MAX_BYTES);
			setCompressedResult(result);
		} catch (err) {
			console.error("Compression error:", err);
			setCompressionError(err instanceof Error ? err.message : "Failed to compress image.");
		} finally {
			setIsCompressing(false);
		}
	}

	// Handle clipboard paste of images
	useEffect(() => {
		if (!uploadDialogOpen) return;

		function handlePaste(e: ClipboardEvent) {
			const items = e.clipboardData?.items;
			if (!items) return;

			for (let i = 0; i < items.length; i++) {
				if (items[i].type.startsWith("image/")) {
					const file = items[i].getAsFile();
					if (file) {
						handleProcessFile(file);
						break;
					}
				}
			}
		}

		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, [uploadDialogOpen]);

	// Upload handler (Vercel Private Blob)
	async function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSubmitting) return;

		if (!compressedResult?.file) {
			toast.error("Please take a photo or select an image first.");
			return;
		}

		setIsSubmitting(true);
		const form = new FormData(event.currentTarget);
		const noteDate = String(form.get("noteDate") || "").trim();
		const title = String(form.get("title") || "").trim();
		const doctorName = String(form.get("doctorName") || "").trim();
		const notesText = String(form.get("notes") || "").trim();

		try {
			const uploadFormData = new FormData();
			uploadFormData.append("file", compressedResult.file);
			uploadFormData.append("noteDate", noteDate);
			uploadFormData.append("title", title);
			uploadFormData.append("doctorName", doctorName);
			uploadFormData.append("notes", notesText);

			const response = await fetch("/api/baby-tracker/medical-notes/upload", {
				method: "POST",
				body: uploadFormData,
			});

			const json = await response.json();

			if (!response.ok || !json.success) {
				throw new Error(json.error || "Failed to upload note.");
			}

			showAlert("NOTE SAVED", "Paper note uploaded and archived securely! 📋");
			setUploadDialogOpen(false);
			resetUploadState();
			if (onRefresh) await onRefresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed.");
		} finally {
			setIsSubmitting(false);
		}
	}

	// Edit metadata handler
	async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!editingNote || isSubmitting) return;

		setIsSubmitting(true);
		const form = new FormData(event.currentTarget);
		const noteDate = String(form.get("noteDate") || "").trim();
		const title = String(form.get("title") || "").trim();
		const doctorName = String(form.get("doctorName") || "").trim();
		const notesText = String(form.get("notes") || "").trim();

		try {
			await onUpdateNote(editingNote.id, {
				noteDate,
				title,
				doctorName,
				notes: notesText,
			});
			showAlert("NOTE UPDATED", "Note details updated successfully.");
			setEditingNote(null);
			if (onRefresh) await onRefresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to update note.");
		} finally {
			setIsSubmitting(false);
		}
	}

	// Delete note prompts & handlers
	function handlePromptDelete(note: BabyMedicalNote) {
		setNoteToDelete(note);
		setDeleteDialogOpen(true);
	}

	async function handleConfirmDelete() {
		if (!noteToDelete || isSubmitting) return;

		setIsSubmitting(true);
		try {
			await onDeleteNote(noteToDelete.id);
			showAlert("NOTE DELETED", "Paper note deleted successfully.");
			if (viewingNote?.id === noteToDelete.id) setViewingNote(null);
			setDeleteDialogOpen(false);
			setNoteToDelete(null);
			if (onRefresh) await onRefresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to delete note.");
		} finally {
			setIsSubmitting(false);
		}
	}

	// Helper to get image proxy URL for private blob
	function getImageSrc(note: BabyMedicalNote): string {
		if (note.imagePathname) {
			return `/api/baby-tracker/medical-notes/image?pathname=${encodeURIComponent(note.imagePathname)}`;
		}
		return note.imageUrl || "";
	}

	// Helper to get download URL
	function getDownloadSrc(note: BabyMedicalNote): string {
		if (note.imagePathname) {
			return `/api/baby-tracker/medical-notes/image?pathname=${encodeURIComponent(note.imagePathname)}&download=1`;
		}
		return note.imageUrl || "";
	}

	return (
		<div className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6">
			{/* Alert notification */}
			<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />

			{/* Search and Action Bar */}
			<div
				style={{ "--password-accent": paletteAccent } as CSSProperties}
				className="password-library-header relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border p-2.5 shadow-md sm:p-3"
			>
				<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-10 size-28 rounded-full" />
				<div className="relative z-10 flex w-full min-w-0 flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
					{/* Search input */}
					<label className="relative block w-full min-w-0 sm:w-72">
						<Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
						<Input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by date, title, doctor..."
							aria-label="Search paper notes"
							className="h-10 w-full rounded-xl border-white/80 bg-white/75 pl-9 pr-3 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
						/>
					</label>

					{/* Action CTA */}
					<div className="flex w-full items-center gap-2 sm:w-auto">
						<Button
							type="button"
							onClick={handleOpenUpload}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button h-10 w-full sm:w-auto gap-2 rounded-xl border px-4 text-xs font-bold shadow-xs transition-all active:scale-95"
						>
							<Camera size={16} />
							<span>Snap / Upload Note</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Notes Gallery Grid */}
			{filteredNotes.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 px-6 py-10 sm:py-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
					<div className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300">
						<Camera size={22} />
					</div>
					<div className="mt-3.5 space-y-1.5 max-w-md">
						<p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
							No paper notes captured yet
						</p>
						<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
							When your pediatrician gives handwritten advice, prescriptions, or clinic notes on paper, snap a photo to keep it safely archived.
						</p>
					</div>
					<div className="mt-5">
						<Button
							type="button"
							onClick={handleOpenUpload}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button h-9 sm:h-10 gap-1.5 rounded-xl border px-5 text-xs font-bold shadow-xs transition-all active:scale-95"
						>
							<Plus size={15} /> Upload First Note
						</Button>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredNotes.map((note) => {
						const imageSrc = getImageSrc(note);
						const formattedSize = note.imageSize ? formatBytes(note.imageSize) : "< 500 KB";

						return (
							<div
								key={note.id}
								className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
							>
								{/* Image Thumbnail with Click-to-Zoom */}
								<div
									onClick={() => {
										setViewingNote(note);
										setLightboxZoom(1);
										setLightboxRotation(0);
									}}
									className="relative aspect-4/3 w-full cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-950"
									role="button"
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											setViewingNote(note);
											setLightboxZoom(1);
											setLightboxRotation(0);
										}
									}}
								>
									{imageSrc ? (
										<img
											src={imageSrc}
											alt={note.title || "Pediatric paper note"}
											className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
											loading="lazy"
										/>
									) : (
										<div className="flex size-full flex-col items-center justify-center gap-1.5 text-slate-400">
											<FileText size={32} />
											<span className="text-xs">No image attached</span>
										</div>
									)}

									{/* Hover Zoom Badge */}
									<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
										<span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md">
											<Eye size={13} /> View Full Note
										</span>
									</div>

									{/* Badges on top of image */}
									<div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
										<span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 shadow-xs backdrop-blur-sm dark:bg-slate-900/95 dark:text-slate-100">
											<Calendar size={11} className="text-rose-500" />
											{note.noteDate}
										</span>
										<span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-sm">
											{formattedSize}
										</span>
									</div>
								</div>

								{/* Card Content & Metadata */}
								<div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
									<div>
										<h4 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-slate-100">
											{note.title || "Pediatrician Paper Note"}
										</h4>

										{note.doctorName && (
											<div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
												<User size={12} className="text-slate-400 shrink-0" />
												<span className="truncate">{note.doctorName}</span>
											</div>
										)}

										{note.notes && (
											<p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
												{note.notes}
											</p>
										)}
									</div>

									{/* Actions footer */}
									<div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
										<a
											href={getDownloadSrc(note)}
											download
											className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
											title="Download image"
										>
											<Download size={13} /> Download
										</a>

										<div className="flex items-center gap-1">
											<button
												type="button"
												onClick={() => setEditingNote(note)}
												className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
												title="Edit note info"
											>
												<Edit3 size={13} />
											</button>
											<button
												type="button"
												onClick={() => handlePromptDelete(note)}
												disabled={isSubmitting}
												className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
												title="Delete note"
											>
												<Trash2 size={13} />
											</button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* ========================================================================= */}
			{/* Upload Paper Note Dialog                                                 */}
			{/* ========================================================================= */}
			<Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel flex max-h-[min(92dvh,760px)] w-[calc(100%-1.5rem)] max-w-lg flex-col overflow-hidden p-0 shadow-2xl sm:w-full sm:rounded-3xl"
				>
					<div className="shrink-0">
						<PaletteDialogHeader
							eyebrow="PEDIATRICIAN PAPER NOTES"
							title="Upload Paper Note"
							description="Capture or upload photo of prescription. Auto-compressed to under 500 KB."
							icon={<Camera size={18} />}
							closeLabel="Close dialog"
						/>
					</div>

					<form onSubmit={handleUploadSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
						<div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4 sm:p-6 text-sm">
							{/* Hidden File Inputs */}
							<input
								ref={cameraInputRef}
								type="file"
								accept="image/*"
								capture="environment"
								className="hidden"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleProcessFile(file);
								}}
							/>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleProcessFile(file);
								}}
							/>

							{/* Photo Picker / Dropzone */}
							<div>
								<span className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
									Paper Note Photo <span className="text-rose-500">*</span>
								</span>

								{!compressedResult ? (
									<div
										onDragOver={(e) => e.preventDefault()}
										onDrop={(e) => {
											e.preventDefault();
											const file = e.dataTransfer.files?.[0];
											if (file) handleProcessFile(file);
										}}
										className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-6 text-center transition-all hover:border-rose-300 dark:border-rose-900/50 dark:bg-rose-950/20"
									>
										{isCompressing ? (
											<div className="flex flex-col items-center gap-2 py-4 text-rose-600 dark:text-rose-400">
												<Loader2 size={28} className="animate-spin" />
												<p className="text-xs font-bold">Compressing photo to &le; 500 KB...</p>
												<span className="text-[11px] text-slate-500">Preserving crisp text legibility</span>
											</div>
										) : (
											<>
												<div className="grid size-12 place-items-center rounded-2xl bg-white text-rose-600 shadow-xs dark:bg-slate-900 dark:text-rose-400">
													<UploadCloud size={24} />
												</div>
												<p className="mt-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
													Snap with camera or upload photo
												</p>
												<p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mt-0.5">
													Supports camera snap, gallery upload, or paste (Ctrl+V)
												</p>

												<div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
													<Button
														type="button"
														onClick={() => cameraInputRef.current?.click()}
														variant="outline"
														className="h-9 gap-1.5 rounded-xl border-rose-300 bg-white text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300"
													>
														<Camera size={15} /> Take Photo
													</Button>
													<Button
														type="button"
														onClick={() => fileInputRef.current?.click()}
														variant="outline"
														className="h-9 gap-1.5 rounded-xl border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
													>
														<UploadCloud size={15} /> Browse Gallery
													</Button>
												</div>
											</>
										)}
									</div>
								) : (
									<div className="space-y-2.5">
										{/* Preview Card */}
										<div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800">
											<img
												src={compressedResult.previewUrl}
												alt="Note preview"
												className="size-full object-contain"
											/>
											<button
												type="button"
												onClick={resetUploadState}
												className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-md backdrop-blur-sm hover:bg-slate-900"
												title="Remove and retake photo"
											>
												<X size={16} />
											</button>
										</div>

										{/* Compression Stats Banner */}
										<div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
											<div className="flex items-center gap-2">
												<FileCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
												<div>
													<span className="font-bold">
														Compressed to {formatBytes(compressedResult.compressedBytes)}
													</span>
													<span className="ml-1 text-[11px] text-emerald-700 dark:text-emerald-300">
														(was {formatBytes(compressedResult.originalBytes)}, -{compressedResult.savedPercentage}%)
													</span>
												</div>
											</div>
											<span className="inline-flex items-center gap-1 rounded-md bg-emerald-200/60 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
												&le; 500 KB limit OK
											</span>
										</div>

										<div className="flex justify-end">
											<button
												type="button"
												onClick={() => fileInputRef.current?.click()}
												className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
											>
												Choose a different photo
											</button>
										</div>
									</div>
								)}

								{compressionError && (
									<p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
										<AlertCircle size={13} /> {compressionError}
									</p>
								)}
							</div>

							{/* Form Fields: Date & Doctor */}
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
									<span>Visit Date <span className="text-rose-500">*</span></span>
									<Input
										type="date"
										name="noteDate"
										defaultValue={todayStr}
										required
										className="h-10 rounded-xl border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									/>
								</label>

								<label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
									<span>Pediatrician Name (Optional)</span>
									<Input
										name="doctorName"
										defaultValue={defaultDoctor}
										placeholder="e.g. Dr. Emily Watson"
										className="h-10 rounded-xl border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									/>
								</label>
							</div>

							{/* Title */}
							<label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
								<span>Title / Topic (Optional)</span>
								<Input
									name="title"
									placeholder="e.g. 6-Month Well Child Checkup, Fever Prescription"
									className="h-10 rounded-xl border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
								/>
							</label>

							{/* Notes */}
							<label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
								<span>Key Takeaway / Notes (Optional)</span>
								<textarea
									name="notes"
									rows={2}
									placeholder="Any reminder or doctor instruction you want quick access to..."
									className="w-full rounded-xl border border-rose-200 bg-white p-3 text-xs sm:text-sm text-slate-900 shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-400"
								/>
							</label>
						</div>

						{/* Footer */}
						<div className="palette-dialog-footer shrink-0 flex flex-wrap justify-end gap-2 p-3.5 sm:p-4 sm:px-6">
							<Button
								data-page-palette-secondary
								type="button"
								disabled={isSubmitting}
								variant="outline"
								className="palette-dialog-footer-button flex-1 sm:flex-initial border font-medium"
								onClick={() => setUploadDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="ghost"
								disabled={isSubmitting || !compressedResult}
								style={{ "--action-accent": paletteAccent } as CSSProperties}
								className="palette-action-button palette-dialog-footer-button flex-1 sm:flex-initial border font-medium"
							>
								{isSubmitting ? (
									<>
										<Loader2 size={16} className="animate-spin shrink-0" />
										<span>Uploading...</span>
									</>
								) : (
									<>
										<CheckCircle2 size={16} className="shrink-0" />
										<span>Save Note</span>
									</>
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* ========================================================================= */}
			{/* Edit Note Metadata Dialog                                                */}
			{/* ========================================================================= */}
			<Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel flex max-h-[min(90dvh,600px)] w-[calc(100%-1.5rem)] max-w-md flex-col overflow-hidden p-0 shadow-2xl sm:w-full sm:rounded-3xl"
				>
					<div className="shrink-0">
						<PaletteDialogHeader
							eyebrow="EDIT NOTE DETAILS"
							title="Edit Note Info"
							description="Update the date, title, or doctor instructions for this note."
							icon={<Edit3 size={18} />}
							closeLabel="Close dialog"
						/>
					</div>

					{editingNote && (
						<form onSubmit={handleEditSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
							<div className="flex-1 min-h-0 space-y-3.5 overflow-y-auto p-5 text-sm sm:p-6">
								<label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
									<span>Visit Date</span>
									<Input
										type="date"
										name="noteDate"
										defaultValue={editingNote.noteDate}
										required
										className="h-10 rounded-xl border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									/>
								</label>

								<label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
									<span>Title / Topic</span>
									<Input
										name="title"
										defaultValue={editingNote.title}
										placeholder="e.g. 6-Month Well Child Checkup"
										className="h-10 rounded-xl border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									/>
								</label>

								<label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
									<span>Pediatrician Name</span>
									<Input
										name="doctorName"
										defaultValue={editingNote.doctorName}
										placeholder="e.g. Dr. Watson"
										className="h-10 rounded-xl border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									/>
								</label>

								<label className="block space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
									<span>Key Takeaway / Notes</span>
									<textarea
										name="notes"
										rows={3}
										defaultValue={editingNote.notes}
										placeholder="Important notes, dosage, follow-up..."
										className="w-full rounded-xl border border-rose-200 bg-white p-3 text-xs sm:text-sm text-slate-900 shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									/>
								</label>
							</div>

							<div className="palette-dialog-footer shrink-0 flex flex-wrap justify-end gap-2 p-3.5 sm:p-4 sm:px-6">
								<Button
									data-page-palette-secondary
									type="button"
									disabled={isSubmitting}
									variant="outline"
									className="palette-dialog-footer-button flex-1 sm:flex-initial border font-medium"
									onClick={() => setEditingNote(null)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="ghost"
									disabled={isSubmitting}
									style={{ "--action-accent": paletteAccent } as CSSProperties}
									className="palette-action-button palette-dialog-footer-button flex-1 sm:flex-initial border font-medium"
								>
									{isSubmitting ? (
										<>
											<Loader2 size={16} className="animate-spin shrink-0" />
											<span>Saving...</span>
										</>
									) : (
										<span>Save Changes</span>
									)}
								</Button>
							</div>
						</form>
					)}
				</DialogContent>
			</Dialog>

			{/* ========================================================================= */}
			{/* Fullscreen Paper Note Lightbox (Zoom & Inspect)                           */}
			{/* ========================================================================= */}
			<Dialog open={!!viewingNote} onOpenChange={(open) => !open && setViewingNote(null)}>
				<DialogContent
					className="flex h-[94dvh] w-[95vw] max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-950/95 p-0 text-white shadow-2xl backdrop-blur-md"
				>
					{viewingNote && (
						<div className="flex size-full flex-col overflow-hidden">
							{/* Lightbox Header */}
							<div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3 sm:px-6">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
										<span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300">
											<Calendar size={11} />
											{viewingNote.noteDate}
										</span>
										{viewingNote.doctorName && (
											<span className="inline-flex items-center gap-1 text-xs text-slate-300 font-medium">
												<User size={11} className="text-slate-400" />
												<span className="truncate">{viewingNote.doctorName}</span>
											</span>
										)}
									</div>
									<h3 className="mt-1 text-sm sm:text-base font-bold text-white leading-snug break-words">
										{viewingNote.title || "Pediatrician Paper Note"}
									</h3>
								</div>

								{/* Top Actions: Download, Delete, Close */}
								<div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
									<a
										href={getDownloadSrc(viewingNote)}
										download
										className="inline-flex size-8 items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
										title="Download note image"
									>
										<Download size={15} />
									</a>
									<button
										type="button"
										onClick={() => handlePromptDelete(viewingNote)}
										className="inline-flex size-8 items-center justify-center rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-950 hover:text-rose-300 transition-colors"
										title="Delete note"
									>
										<Trash2 size={15} />
									</button>
									<button
										type="button"
										onClick={() => setViewingNote(null)}
										className="inline-flex size-8 items-center justify-center rounded-xl bg-rose-600/90 text-white hover:bg-rose-600 transition-colors"
										title="Close viewer"
									>
										<X size={16} />
									</button>
								</div>
							</div>

							{/* Zoomable Image Canvas with Floating Bottom Toolbar */}
							<div className="relative flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8 bg-black/40">
								<img
									src={getImageSrc(viewingNote)}
									alt={viewingNote.title || "Pediatric paper note"}
									style={{
										transform: `scale(${lightboxZoom}) rotate(${lightboxRotation}deg)`,
										transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
										maxHeight: "75vh",
										maxWidth: "85vw",
									}}
									className="rounded-lg object-contain shadow-2xl"
								/>

								{/* Floating Zoom & Rotate Toolbar */}
								<div className="pointer-events-none absolute bottom-4 inset-x-0 flex justify-center z-20">
									<div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 shadow-2xl backdrop-blur-md">
										<button
											type="button"
											onClick={() => setLightboxZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
											className="inline-flex size-7 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
											title="Zoom out"
										>
											<ZoomOut size={14} />
										</button>
										<button
											type="button"
											onClick={() => setLightboxZoom(1)}
											className="text-[11px] font-mono font-bold text-slate-300 hover:text-white px-1.5 transition-colors"
											title="Reset zoom to 100%"
										>
											{Math.round(lightboxZoom * 100)}%
										</button>
										<button
											type="button"
											onClick={() => setLightboxZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
											className="inline-flex size-7 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
											title="Zoom in"
										>
											<ZoomIn size={14} />
										</button>

										<span className="h-3.5 w-px bg-slate-700 mx-0.5" />

										<button
											type="button"
											onClick={() => setLightboxRotation((r) => (r + 90) % 360)}
											className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
											title="Rotate 90 degrees"
										>
											<RotateCw size={13} />
											<span className="text-[11px] font-medium hidden sm:inline">Rotate</span>
										</button>
									</div>
								</div>
							</div>

							{/* Note footer / instructions */}
							{viewingNote.notes && (
								<div className="shrink-0 border-t border-slate-800 bg-slate-900/80 p-3.5 sm:px-6">
									<p className="text-xs text-slate-400">
										<span className="font-bold text-slate-200">Notes: </span>
										{viewingNote.notes}
									</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
			{/* ========================================================================= */}
			{/* Delete Confirmation Dialog                                               */}
			{/* ========================================================================= */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel max-w-sm p-0 overflow-hidden rounded-3xl border shadow-2xl"
				>
					<PaletteDialogHeader
						tone="danger"
						eyebrow="DELETE PAPER NOTE"
						title="Delete Paper Note?"
						description="This note and its image will be permanently removed."
						icon={<Trash2 size={20} className="text-rose-600" />}
						closeLabel="Cancel"
						closeDisabled={isSubmitting}
					/>

					<div className="p-5 sm:p-6 space-y-3.5">
						{noteToDelete && (
							<div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-3 dark:border-rose-950/60 dark:bg-rose-950/20">
								{noteToDelete.imagePathname || noteToDelete.imageUrl ? (
									<div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
										<img
											src={getImageSrc(noteToDelete)}
											alt={noteToDelete.title || "Note preview"}
											className="size-full object-cover"
										/>
									</div>
								) : (
									<div className="grid size-12 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
										<FileText size={20} />
									</div>
								)}
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
										<Calendar size={11} />
										<span>{noteToDelete.noteDate}</span>
									</div>
									<p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
										{noteToDelete.title || "Pediatrician Paper Note"}
									</p>
									{noteToDelete.doctorName && (
										<p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
											{noteToDelete.doctorName}
										</p>
									)}
								</div>
							</div>
						)}
						<p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
							Are you sure you want to delete this paper note? The compressed image and all stored details will be permanently removed.
						</p>
					</div>

					<div className="palette-dialog-footer shrink-0 flex flex-wrap justify-end gap-2 p-3.5 sm:p-4 sm:px-6">
						<Button
							data-page-palette-secondary
							type="button"
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setNoteToDelete(null);
							}}
							disabled={isSubmitting}
							className="palette-dialog-footer-button flex-1 sm:flex-initial border font-medium"
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleConfirmDelete}
							disabled={isSubmitting}
							className="palette-dialog-footer-button flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-700 text-white font-bold border-0 shadow-xs transition-all active:scale-95"
						>
							{isSubmitting ? (
								<>
									<Loader2 size={16} className="animate-spin shrink-0" />
									<span>Deleting...</span>
								</>
							) : (
								<>
									<Trash2 size={15} className="shrink-0" />
									<span>Delete Note</span>
								</>
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
