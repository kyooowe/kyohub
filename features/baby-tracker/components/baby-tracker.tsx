"use client";

import { useState, type CSSProperties } from "react";
import {
	Baby,
	Droplets,
	Pill,
	Stethoscope,
	Syringe,
	TrendingUp,
	HeartHandshake,
	Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { useAppSettings } from "@/components/settings/settings-context";
import { getPagePaletteStyles } from "@/components/settings/page-palettes";
import type {
	BabyTrackerData,
	DiaperType,
	MedicineStatus,
	VaccineStatus,
} from "../types";
import { BabyProfileCard } from "./baby-profile-card";
import { StoolCounter } from "./stool-counter";
import { GrowthTracker } from "./growth-tracker";
import { VaccineTracker } from "./vaccine-tracker";
import { MedicineTracker } from "./medicine-tracker";
import { MedicalNotes } from "./medical-notes";
import {
	createGrowthRecord,
	createMedicalNote,
	createMedicine,
	createStoolLog,
	createVaccine,
	deleteGrowthRecord,
	deleteMedicalNote,
	deleteMedicine,
	deleteStoolLog,
	deleteVaccine,
	getBabyTrackerData,
	quickLogDiaper,
	saveBabyProfile,
	seedStandardVaccines,
	toggleMedicineStatus,
	toggleVaccineStatus,
	updateGrowthRecord,
	updateMedicalNote,
	updateMedicine,
	updateVaccine,
} from "../actions/baby-tracker-actions";
import { getDiaperStats, calculateBabyAge } from "../lib/baby-tracker-utils";

type ActiveTab = "stool" | "growth" | "vaccines" | "medicines" | "medical-notes";

export function BabyTracker({
	initialData,
	initialError,
}: {
	initialData: BabyTrackerData;
	initialError: string;
}) {
	const { settings } = useAppSettings();
	const [data, setData] = useState<BabyTrackerData>(initialData);
	const [error, setError] = useState(initialError);
	const [activeTab, setActiveTab] = useState<ActiveTab>("stool");

	const pagePaletteName = settings.pagePalettes["/baby-tracker"] || "rose";
	const dialogPalette = pagePaletteName === "default" ? "rose" : pagePaletteName;
	const pagePalette = getPagePaletteStyles(dialogPalette);

	async function refreshData() {
		try {
			const updated = await getBabyTrackerData();
			setData(updated);
			setError("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to refresh baby tracker");
		}
	}

	// Wrapper handlers that refresh state
	async function handleSaveProfile(
		payload: Parameters<typeof saveBabyProfile>[0],
	) {
		await saveBabyProfile(payload);
		await refreshData();
	}

	async function handleCreateStool(
		payload: Parameters<typeof createStoolLog>[0],
	) {
		await createStoolLog(payload);
		await refreshData();
	}

	async function handleQuickStool(type: DiaperType) {
		await quickLogDiaper(type);
		await refreshData();
	}

	async function handleDeleteStool(id: string) {
		await deleteStoolLog(id);
		await refreshData();
	}

	async function handleCreateVaccine(
		payload: Parameters<typeof createVaccine>[0],
	) {
		await createVaccine(payload);
		await refreshData();
	}

	async function handleUpdateVaccine(
		id: string,
		payload: Parameters<typeof updateVaccine>[1],
	) {
		await updateVaccine(id, payload);
		await refreshData();
	}

	async function handleToggleVaccine(id: string, status: VaccineStatus) {
		await toggleVaccineStatus(id, status);
		await refreshData();
	}

	async function handleDeleteVaccine(id: string) {
		await deleteVaccine(id);
		await refreshData();
	}

	async function handleSeedVaccines() {
		await seedStandardVaccines();
		await refreshData();
	}

	async function handleCreateMedicine(
		payload: Parameters<typeof createMedicine>[0],
	) {
		await createMedicine(payload);
		await refreshData();
	}

	async function handleUpdateMedicine(
		id: string,
		payload: Parameters<typeof updateMedicine>[1],
	) {
		await updateMedicine(id, payload);
		await refreshData();
	}

	async function handleToggleMedicine(id: string, status: MedicineStatus) {
		await toggleMedicineStatus(id, status);
		await refreshData();
	}

	async function handleDeleteMedicine(id: string) {
		await deleteMedicine(id);
		await refreshData();
	}

	async function handleCreateGrowth(
		payload: Parameters<typeof createGrowthRecord>[0],
	) {
		await createGrowthRecord(payload);
		await refreshData();
	}

	async function handleUpdateGrowth(
		id: string,
		payload: Parameters<typeof updateGrowthRecord>[1],
	) {
		await updateGrowthRecord(id, payload);
		await refreshData();
	}

	async function handleDeleteGrowth(id: string) {
		await deleteGrowthRecord(id);
		await refreshData();
	}

	async function handleCreateMedicalNote(
		payload: Parameters<typeof createMedicalNote>[0],
	) {
		await createMedicalNote(payload);
		await refreshData();
	}

	async function handleUpdateMedicalNote(
		id: string,
		payload: Parameters<typeof updateMedicalNote>[1],
	) {
		await updateMedicalNote(id, payload);
		await refreshData();
	}

	async function handleDeleteMedicalNote(id: string) {
		await deleteMedicalNote(id);
		await refreshData();
	}

	// Overview helpers
	const diaperStats = getDiaperStats(data.stoolLogs);
	const latestGrowth = data.growthRecords.length > 0 ? data.growthRecords[data.growthRecords.length - 1] : null;
	const activeMedicines = data.medicines.filter((m) => m.status === "active");
	const todayStr = new Date().toISOString().split("T")[0];
	const upcomingVaccines = data.vaccines.filter((v) => v.status === "upcoming" && v.vaccineDate >= todayStr);
	const overdueVaccines = data.vaccines.filter((v) => v.status === "overdue" || (v.status === "upcoming" && v.vaccineDate < todayStr));
	const ageInfo = data.profile?.birthDate ? calculateBabyAge(data.profile.birthDate) : null;

	const tabs: Array<{
		id: ActiveTab;
		label: string;
		icon: React.ComponentType<{ size?: number; className?: string }>;
		badge?: number | string;
		badgeColor?: string;
	}> = [
		{
			id: "stool",
			label: "Diaper & Stool",
			icon: Droplets,
			badge: diaperStats.todayTotal > 0 ? `${diaperStats.todayTotal} today` : undefined,
			badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
		},
		{
			id: "growth",
			label: "Growth Curves",
			icon: TrendingUp,
			badge: latestGrowth ? `${latestGrowth.weightKg}kg` : undefined,
			badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
		},
		{
			id: "vaccines",
			label: "Immunizations",
			icon: Syringe,
			badge: overdueVaccines.length > 0 ? `${overdueVaccines.length} due` : upcomingVaccines.length > 0 ? `${upcomingVaccines.length} up` : undefined,
			badgeColor: overdueVaccines.length > 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
		},
		{
			id: "medicines",
			label: "Medicines",
			icon: Pill,
			badge: activeMedicines.length > 0 ? `${activeMedicines.length} active` : undefined,
			badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
		},
		{
			id: "medical-notes",
			label: "Pediatric Notes",
			icon: Stethoscope,
			badge: data.medicalNotes.length > 0 ? data.medicalNotes.length : undefined,
			badgeColor: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
		},
	];

	return (
		<div className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6">
			{/* Modern Family Page Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p
						style={{ color: pagePalette.accent }}
						className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
					>
						<span
							className={`grid size-6 place-items-center rounded-lg bg-linear-to-br ${pagePalette.iconGradient} text-white shadow-2xs`}
						>
							<Baby size={14} />
						</span>
						DAILY NURSERY &amp; FAMILY CARE
					</p>
					<h1
						className={`bg-linear-to-r ${pagePalette.pageHeading} bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl`}
					>
						Baby Tracker
					</h1>
					<p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
						Track diaper changes, monthly growth milestones, vaccinations, daily medications, and pediatrician visits.
					</p>
				</div>

				{/* Quick Family Snapshot Badge */}
				{data.profile && (
					<div className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-rose-200/80 bg-rose-50/70 px-3.5 py-1.5 text-xs text-rose-900 shadow-2xs dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-200">
						<Sparkles size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
						<span className="font-bold">{data.profile.name}</span>
						{ageInfo && <span className="text-rose-700/80 dark:text-rose-300">({ageInfo.formatted})</span>}
					</div>
				)}
			</div>

			{error && (
				<div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200 sm:text-sm">
					{error}
				</div>
			)}

			{/* Baby Profile Card (Hero Keepsake) */}
			<BabyProfileCard
				profile={data.profile}
				onSave={handleSaveProfile}
				paletteAccent={pagePalette.accent}
				dialogPalette={dialogPalette}
			/>

			{/* Navigation Tabs Bar (Scrollable on mobile, touch-friendly) */}
			<div className="w-full min-w-0 max-w-full overflow-x-auto scrollbar-none rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-1.5 shadow-2xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
				<div className="flex w-max min-w-full gap-1 sm:gap-1.5">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								style={isActive ? ({ "--action-accent": pagePalette.accent } as CSSProperties) : undefined}
								className={`flex shrink-0 items-center gap-2 rounded-xl sm:rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
									isActive
										? "palette-action-button border shadow-xs"
										: "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
								}`}
							>
								<Icon size={15} />
								<span>{tab.label}</span>
								{tab.badge !== undefined && (
									<span
										className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
											isActive
												? "bg-black/10 text-slate-800 dark:bg-white/15 dark:text-slate-100"
												: tab.badgeColor || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
										}`}
									>
										{tab.badge}
									</span>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Tab Contents */}
			{activeTab === "stool" && (
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader
						theme="rose"
						icon={Droplets}
						title="Daily Diaper & Stool Tracker"
						description="Quick-log diaper changes and record stool consistency & color"
						appearance="soft"
						className="min-h-[96px]"
					>
						<span className="password-library-badge inline-flex min-h-9 w-fit items-center rounded-full px-3.5 py-1 text-xs font-bold">
							{diaperStats.todayTotal} diaper{diaperStats.todayTotal === 1 ? "" : "s"} today · {diaperStats.todayStools} stool, {diaperStats.todayWets} wet
						</span>
					</FeatureSectionHeader>
					<CardContent className="p-0">
						<StoolCounter
							logs={data.stoolLogs}
							onCreateLog={handleCreateStool}
							onQuickLog={handleQuickStool}
							onDeleteLog={handleDeleteStool}
							paletteAccent={pagePalette.accent}
							dialogPalette={dialogPalette}
						/>
					</CardContent>
				</Card>
			)}

			{activeTab === "growth" && (
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader
						theme="rose"
						icon={TrendingUp}
						title="Growth Progression Tracker"
						description="Track height and weight progression percentiles for each month"
						appearance="soft"
						className="min-h-[96px]"
					>
						<span className="password-library-badge inline-flex min-h-9 w-fit items-center rounded-full px-3.5 py-1 text-xs font-bold">
							{data.growthRecords.length} record{data.growthRecords.length === 1 ? "" : "s"} · {latestGrowth ? `${latestGrowth.weightKg} kg · ${latestGrowth.heightCm} cm` : "No records"}
						</span>
					</FeatureSectionHeader>
					<CardContent className="p-0">
						<GrowthTracker
							records={data.growthRecords}
							onCreateRecord={handleCreateGrowth}
							onUpdateRecord={handleUpdateGrowth}
							onDeleteRecord={handleDeleteGrowth}
							paletteAccent={pagePalette.accent}
							dialogPalette={dialogPalette}
						/>
					</CardContent>
				</Card>
			)}

			{activeTab === "vaccines" && (
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader
						theme="rose"
						icon={Syringe}
						title="Vaccine & Immunization Schedule"
						description="Track childhood vaccinations, upcoming dates, and completed doses"
						appearance="soft"
						className="min-h-[96px]"
					>
						<span className="password-library-badge inline-flex min-h-9 w-fit items-center rounded-full px-3.5 py-1 text-xs font-bold">
							{data.vaccines.length} vaccine{data.vaccines.length === 1 ? "" : "s"} · {upcomingVaccines[0] ? `Next: ${upcomingVaccines[0].vaccineName}` : "All up to date"}
						</span>
					</FeatureSectionHeader>
					<CardContent className="p-0">
						<VaccineTracker
							vaccines={data.vaccines}
							onCreateVaccine={handleCreateVaccine}
							onUpdateVaccine={handleUpdateVaccine}
							onToggleStatus={handleToggleVaccine}
							onDeleteVaccine={handleDeleteVaccine}
							onSeedStandardSchedule={handleSeedVaccines}
							paletteAccent={pagePalette.accent}
							dialogPalette={dialogPalette}
						/>
					</CardContent>
				</Card>
			)}

			{activeTab === "medicines" && (
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader
						theme="rose"
						icon={Pill}
						title="Medicine & Dosage Tracker"
						description="Active medications, prescribed dosages, and course duration"
						appearance="soft"
						className="min-h-[96px]"
					>
						<span className="password-library-badge inline-flex min-h-9 w-fit items-center rounded-full px-3.5 py-1 text-xs font-bold">
							{activeMedicines.length} active prescription{activeMedicines.length === 1 ? "" : "s"}
						</span>
					</FeatureSectionHeader>
					<CardContent className="p-0">
						<MedicineTracker
							medicines={data.medicines}
							onCreateMedicine={handleCreateMedicine}
							onUpdateMedicine={handleUpdateMedicine}
							onToggleStatus={handleToggleMedicine}
							onDeleteMedicine={handleDeleteMedicine}
							paletteAccent={pagePalette.accent}
							dialogPalette={dialogPalette}
						/>
					</CardContent>
				</Card>
			)}

			{activeTab === "medical-notes" && (
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader
						theme="rose"
						icon={Stethoscope}
						title="Pediatrician Notes & Symptoms"
						description="Log doctor visit notes, advice, and symptom observations"
						appearance="soft"
						className="min-h-[96px]"
					>
						<span className="password-library-badge inline-flex min-h-9 w-fit items-center rounded-full px-3.5 py-1 text-xs font-bold">
							{data.medicalNotes.length} medical note{data.medicalNotes.length === 1 ? "" : "s"}
						</span>
					</FeatureSectionHeader>
					<CardContent className="p-0">
						<MedicalNotes
							notes={data.medicalNotes}
							onCreateNote={handleCreateMedicalNote}
							onUpdateNote={handleUpdateMedicalNote}
							onDeleteNote={handleDeleteMedicalNote}
							paletteAccent={pagePalette.accent}
							dialogPalette={dialogPalette}
						/>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
