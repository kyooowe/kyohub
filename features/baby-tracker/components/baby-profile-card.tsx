"use client";

import { useState, type FormEvent, type CSSProperties } from "react";
import {
	Baby,
	Calendar,
	Heart,
	Phone,
	Plus,
	Stethoscope,
	Sparkles,
	AlertCircle,
	Edit3,
	Loader2,
	Ruler,
	Scale,
	PartyPopper,
	ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import { BLOOD_TYPES, type BabyProfile, type BabyGender } from "../types";
import type { PagePalette } from "@/components/settings/page-palettes";
import { calculateBabyAge } from "../lib/baby-tracker-utils";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";
import { toast } from "sonner";

export function BabyProfileCard({
	profile,
	onSave,
	paletteAccent = "#B66F57",
	dialogPalette,
}: {
	profile: BabyProfile | null;
	onSave: (data: Parameters<typeof import("../actions/baby-tracker-actions").saveBabyProfile>[0]) => Promise<void>;
	paletteAccent?: string;
	dialogPalette?: PagePalette;
}) {
	const [open, setOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(3000);

	const ageInfo = profile?.birthDate ? calculateBabyAge(profile.birthDate) : null;

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);

		const form = new FormData(event.currentTarget);
		const name = String(form.get("name") || "").trim();
		const birthDate = String(form.get("birthDate") || "").trim();
		const gender = (form.get("gender") as BabyGender) || "unspecified";
		const bloodType = String(form.get("bloodType") || "").trim();
		const birthWeight = String(form.get("birthWeight") || "").replace(/[^0-9.]/g, "").trim();
		const birthHeight = String(form.get("birthHeight") || "").replace(/[^0-9.]/g, "").trim();
		const pediatrician = String(form.get("pediatrician") || "").trim();
		const pediatricianPhone = String(form.get("pediatricianPhone") || "").trim();
		const allergies = String(form.get("allergies") || "").trim();
		const notes = String(form.get("notes") || "").trim();

		try {
			await onSave({
				name,
				birthDate,
				gender,
				bloodType,
				birthWeight,
				birthHeight,
				pediatrician,
				pediatricianPhone,
				allergies,
				notes,
			});
			showAlert(
				profile ? "PROFILE UPDATED" : "PROFILE CREATED",
				profile ? "Baby profile updated successfully! 🎉" : "Baby profile created! Welcome to the family! 👶"
			);
			setOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save profile");
		} finally {
			setSubmitting(false);
		}
	}

	const genderBadgeStyles = {
		boy: "bg-sky-50 text-sky-700 border-sky-200/90 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800",
		girl: "bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800",
		other: "bg-purple-50 text-purple-700 border-purple-200/90 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800",
		unspecified: "bg-slate-100 text-slate-700 border-slate-200/90 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
	};

	const dialogNode = (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				pagePalette={dialogPalette}
				data-page-palette-surface
				className="palette-dialog-panel flex max-h-[min(90dvh,720px)] w-[calc(100%-1.5rem)] max-w-xl flex-col overflow-hidden p-0 shadow-2xl sm:w-full sm:rounded-3xl"
			>
				<div className="shrink-0">
					<PaletteDialogHeader
						eyebrow="FAMILY NURSERY"
						title={profile ? "Edit Baby Information" : "Create Baby Profile"}
						description="Keep vital baby information handy for pediatrician visits, growth tracking, and daily care."
						icon={<Baby size={18} />}
						closeLabel="Close dialog"
					/>
				</div>
				<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
					<div className="flex-1 min-h-0 space-y-3.5 overflow-y-auto p-5 text-sm sm:p-6">
						<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Baby&apos;s Full Name</span>
								<Input
									name="name"
									required
									defaultValue={profile?.name ?? ""}
									placeholder="e.g. Leo James"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Date of Birth</span>
								<Input
									type="date"
									name="birthDate"
									required
									defaultValue={profile?.birthDate ? profile.birthDate.split("T")[0] : ""}
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>
						</div>

						<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Gender</span>
								<select
									name="gender"
									defaultValue={profile?.gender ?? "unspecified"}
									aria-label="Gender"
									className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
								>
									<option value="unspecified">Select Gender</option>
									<option value="boy">Boy 👦</option>
									<option value="girl">Girl 👧</option>
									<option value="other">Other / Prefer not to say</option>
								</select>
							</label>
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Blood Type</span>
								<select
									name="bloodType"
									defaultValue={profile?.bloodType ?? ""}
									aria-label="Blood Type"
									className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
								>
									<option value="">Select Blood Type (Optional)</option>
									{BLOOD_TYPES.map((bt) => (
										<option key={bt} value={bt}>
											{bt}
										</option>
									))}
									<option value="unknown">Unknown / Not Tested</option>
									{profile?.bloodType &&
										!BLOOD_TYPES.includes(profile.bloodType as (typeof BLOOD_TYPES)[number]) &&
										profile.bloodType !== "unknown" && (
											<option value={profile.bloodType}>
												{profile.bloodType} (Current)
											</option>
										)}
								</select>
							</label>
						</div>

						<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Birth Weight (kg)</span>
								<Input
									type="number"
									step="0.01"
									min="0"
									name="birthWeight"
									defaultValue={profile?.birthWeight ? profile.birthWeight.replace(/[^0-9.]/g, "") : ""}
									placeholder="e.g. 3.4"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Birth Length / Height (cm)</span>
								<Input
									type="number"
									step="0.1"
									min="0"
									name="birthHeight"
									defaultValue={profile?.birthHeight ? profile.birthHeight.replace(/[^0-9.]/g, "") : ""}
									placeholder="e.g. 50"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>
						</div>

						<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Pediatrician Name</span>
								<Input
									name="pediatrician"
									defaultValue={profile?.pediatrician ?? ""}
									placeholder="Dr. Sarah Johnson, MD"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Pediatrician Phone</span>
								<Input
									type="tel"
									name="pediatricianPhone"
									defaultValue={profile?.pediatricianPhone ?? ""}
									placeholder="+1 (555) 019-2834"
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>
						</div>

						<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
							<span>Known Allergies / Sensitivities</span>
							<Input
								name="allergies"
								defaultValue={profile?.allergies ?? ""}
								placeholder="e.g. Cow milk protein, Egg, Peanut (or None)"
								className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
							/>
						</label>

						<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
							<span>Notes & Special Instructions</span>
							<textarea
								name="notes"
								defaultValue={profile?.notes ?? ""}
								rows={2}
								placeholder="Birth hospital, delivery notes, calming tips, milestones..."
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
							onClick={() => setOpen(false)}
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
									{profile ? null : <Plus size={16} className="shrink-0" />}
									<span>{profile ? "Save changes" : "Create profile"}</span>
								</>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);

	// When profile is not yet set up: warm, friendly invitation banner
	if (!profile) {
		return (
			<div className="space-y-4">
				<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />
				<div
					style={{ "--password-accent": paletteAccent } as CSSProperties}
					className="password-library-header relative isolate flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-3xl border p-4.5 shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5"
				>
					<span
						aria-hidden="true"
						className="password-library-orbit pointer-events-none absolute -right-6 -top-12 size-36 rounded-full"
					/>
					<div className="relative z-10 flex min-w-0 flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4.5">
						{/* Keepsake Avatar with Baby Icon & Sparkle badge */}
						<div className="relative grid size-13 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-rose-400 via-rose-500 to-amber-400 text-white shadow-md shadow-rose-500/20 ring-4 ring-rose-100/80 sm:size-15 sm:rounded-3xl dark:ring-rose-950/60">
							<Baby size={28} className="text-white drop-shadow-xs" />
							<span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-white text-rose-500 shadow-xs dark:bg-slate-900">
								<Sparkles size={11} className="fill-rose-500" />
							</span>
						</div>

						{/* Text & Quick Feature Highlights */}
						<div className="min-w-0 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-rose-700 uppercase sm:text-[11px] dark:bg-rose-500/20 dark:text-rose-300">
									<Heart size={10} className="fill-rose-500 text-rose-500" /> Welcome to Baby Care
								</span>
							</div>
							<h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
								Set Up Your Baby&apos;s Profile
							</h2>
							<p className="max-w-xl text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
								Add your baby&apos;s birth date, pediatrician contacts, and blood type to personalize growth charts and vaccine timelines.
							</p>

							{/* Feature Highlight Pills */}
							<div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
								<span className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-2 py-0.5 shadow-2xs dark:bg-slate-900/60">
									🍼 Daily Age Milestones
								</span>
								<span className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-2 py-0.5 shadow-2xs dark:bg-slate-900/60">
									💉 Immunization Tracking
								</span>
								<span className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-2 py-0.5 shadow-2xs dark:bg-slate-900/60">
									📈 WHO Growth Curves
								</span>
							</div>
						</div>
					</div>

					{/* Primary Call to Action */}
					<div className="relative z-10 flex shrink-0 sm:self-center">
						<Button
							type="button"
							onClick={() => setOpen(true)}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button h-10 w-full sm:w-auto gap-2 rounded-2xl border px-4.5 text-xs font-bold shadow-xs transition-all active:scale-95 sm:text-sm"
						>
							<Plus size={16} />
							Set Up Profile
							<ArrowRight size={14} className="opacity-70" />
						</Button>
					</div>
				</div>
				{dialogNode}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />
			<div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-br from-white via-rose-50/30 to-amber-50/20 p-4 shadow-sm backdrop-blur-md transition-all sm:p-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-rose-950/20">
				{/* Decorative nursery background glow */}
				<div
					className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full opacity-25 blur-3xl"
					style={{ backgroundColor: paletteAccent || "#B66F57" }}
				/>

				{/* Main Layout */}
				<div className="flex flex-col gap-4 sm:gap-5">
					{/* Top Row: Avatar + Name + Badges + Edit Button */}
					<div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
						<div className="flex min-w-0 flex-1 items-start gap-3.5 sm:items-center sm:gap-4">
							{/* Avatar */}
							<div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-rose-400 via-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/25 sm:size-16">
								<Baby size={30} className="text-white drop-shadow-xs" />
								{profile.gender && profile.gender !== "unspecified" && (
									<span
										className={`absolute -bottom-1 -right-1 flex size-5.5 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold shadow-xs dark:border-slate-900 ${profile.gender === "boy"
												? "bg-sky-500 text-white"
												: "bg-pink-500 text-white"
											}`}
										title={profile.gender}
									>
										{profile.gender === "boy" ? "👦" : "👧"}
									</span>
								)}
							</div>

							{/* Identity & Age Headline */}
							<div className="min-w-0 flex-1">
								<div className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
									<h2 className="truncate text-lg font-bold tracking-tight leading-tight text-slate-900 dark:text-white sm:text-2xl sm:leading-normal">
										{profile.name}
									</h2>
									<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
										{profile.bloodType && (
											<span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50/80 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300">
												<Heart size={10} className="fill-red-500 text-red-500" />
												{profile.bloodType === "unknown" ? "Blood: Unknown" : profile.bloodType}
											</span>
										)}
										<span
											className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${genderBadgeStyles[profile.gender || "unspecified"]
												}`}
										>
											{profile.gender}
										</span>
									</div>
								</div>

								{/* Age Highlight with Celebration Badge */}
								{ageInfo && (
									<div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
										<span className="inline-flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
											<PartyPopper size={14} className="text-rose-500" />
											{ageInfo.formatted}
										</span>
										<span className="text-slate-300 dark:text-slate-700">•</span>
										<span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
											<Calendar size={13} className="text-slate-400" />
											Born {new Date(profile.birthDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Edit Button: Circular pencil in top-right on mobile, full button on desktop */}
						<div className="shrink-0 self-start sm:self-center">
							{/* Mobile: Top-right circular pencil button */}
							<button
								type="button"
								onClick={() => setOpen(true)}
								aria-label="Edit Profile"
								title="Edit Profile"
								className="inline-flex size-7.5 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-slate-600 shadow-2xs transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 active:scale-90 sm:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
							>
								<Edit3 size={13} />
							</button>

							{/* Desktop: Full button */}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setOpen(true)}
								className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border-slate-200 bg-white/80 px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
							>
								<Edit3 size={13} />
								<span>Edit Profile</span>
							</Button>
						</div>
					</div>

					{/* Bottom Row: Quick Vitals Pill Cards (Responsive Grid) */}
					<div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4 sm:gap-3">
						{/* Birth Weight */}
						<div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 p-2.5 shadow-2xs backdrop-blur-xs sm:p-3 dark:border-slate-800/80 dark:bg-slate-900/60">
							<span className="grid size-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
								<Scale size={15} />
							</span>
							<div className="min-w-0">
								<p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
									Birth Weight
								</p>
								<p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 sm:text-sm">
									{profile.birthWeight
										? `${profile.birthWeight.replace(/[^0-9.]/g, "")} kg`
										: "Not set"}
								</p>
							</div>
						</div>

						{/* Birth Length */}
						<div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 p-2.5 shadow-2xs backdrop-blur-xs sm:p-3 dark:border-slate-800/80 dark:bg-slate-900/60">
							<span className="grid size-8 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300">
								<Ruler size={15} />
							</span>
							<div className="min-w-0">
								<p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
									Birth Length
								</p>
								<p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 sm:text-sm">
									{profile.birthHeight
										? `${profile.birthHeight.replace(/[^0-9.]/g, "")} cm`
										: "Not set"}
								</p>
							</div>
						</div>

						{/* Pediatrician with quick call */}
						<div className="col-span-2 sm:col-span-2 flex items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white/70 p-2.5 shadow-2xs backdrop-blur-xs sm:p-3 dark:border-slate-800/80 dark:bg-slate-900/60">
							<div className="flex min-w-0 items-center gap-2">
								<span className="grid size-8 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
									<Stethoscope size={15} />
								</span>
								<div className="min-w-0">
									<p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
										Pediatrician
									</p>
									<p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 sm:text-sm">
										{profile.pediatrician || "Not assigned"}
									</p>
								</div>
							</div>
							{profile.pediatricianPhone && (
								<a
									href={`tel:${profile.pediatricianPhone}`}
									className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 shadow-2xs transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/70 dark:text-rose-300 dark:hover:bg-rose-900"
									title={`Call ${profile.pediatrician}`}
								>
									<Phone size={12} />
									<span className="hidden xs:inline">Call</span>
								</a>
							)}
						</div>
					</div>

					{/* Allergy Alert Pill (if present) */}
					{profile.allergies && (
						<div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-1.5 text-xs text-amber-900 dark:border-amber-900/80 dark:bg-amber-950/60 dark:text-amber-200">
							<AlertCircle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
							<span className="truncate">
								Known Sensitivities: <strong className="font-semibold">{profile.allergies}</strong>
							</span>
						</div>
					)}
				</div>

				{dialogNode}
			</div>
		</div>
	);
}
