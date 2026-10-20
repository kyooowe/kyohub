"use client";

import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react";
import {
	Baby,
	Droplets,
	Pill,
	Stethoscope,
	Syringe,
	TrendingUp,
	Sparkles,
	Moon,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { useAppSettings } from "@/components/settings/settings-context";
import { getPagePaletteStyles } from "@/components/settings/page-palettes";
import type {
	BabyTrackerData,
	SleepType,
	SleepStatus,
	MilkStatus,
	MilkType,
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
import { SleepTracker } from "./sleep-tracker";
import { MilkTracker } from "./milk-tracker";
import {
	createGrowthRecord,
	createMedicalNote,
	createMedicine,
	createStoolLog,
	createVaccine,
	createSleepLog,
	updateSleepLog,
	deleteSleepLog,
	startBabySleep,
	wakeUpBaby,
	createMilkLog,
	updateMilkLog,
	deleteMilkLog,
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
import {
	getDiaperStats,
	getSleepStats,
	getMilkStats,
	calculateBabyAge,
} from "../lib/baby-tracker-utils";

type ActiveTab = "sleep" | "milk" | "stool" | "growth" | "vaccines" | "medicines" | "medical-notes";

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
	const [activeTab, setActiveTab] = useState<ActiveTab>("sleep");

	const pagePaletteName = settings.pagePalettes["/baby-tracker"] || "rose";
	const dialogPalette = pagePaletteName === "default" ? "rose" : pagePaletteName;
	const pagePalette = getPagePaletteStyles(dialogPalette);

	// Tabs bar interactive navigation (hold-and-drag desktop & mobile, chevron controls, wheel panning)
	const tabsContainerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const isDraggingRef = useRef(false);
	const startXRef = useRef(0);
	const scrollLeftRef = useRef(0);
	const hasDraggedRef = useRef(false);

	const updateScrollButtons = useCallback(() => {
		const el = tabsContainerRef.current;
		if (!el) return;
		const canLeft = el.scrollLeft > 6;
		const canRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 6;
		setCanScrollLeft(canLeft);
		setCanScrollRight(canRight);
	}, []);

	// Keep tabs scroll indicators updated on resize & mount
	useEffect(() => {
		updateScrollButtons();
		const handleResize = () => updateScrollButtons();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [updateScrollButtons]);

	// Auto-scroll active tab into view smoothly
	useEffect(() => {
		const container = tabsContainerRef.current;
		if (!container) return;
		const activeEl = container.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`);
		if (activeEl) {
			activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
			const timer = setTimeout(updateScrollButtons, 320);
			return () => clearTimeout(timer);
		}
	}, [activeTab, updateScrollButtons]);

	// Global mouseup release so dragging never gets stuck if mouse leaves window
	useEffect(() => {
		const handleGlobalMouseUp = () => {
			if (isDraggingRef.current) {
				isDraggingRef.current = false;
				setIsDragging(false);
				setTimeout(() => {
					hasDraggedRef.current = false;
				}, 60);
			}
		};
		window.addEventListener("mouseup", handleGlobalMouseUp);
		return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
	}, []);

	// Mouse wheel horizontal panning
	useEffect(() => {
		const container = tabsContainerRef.current;
		if (!container) return;

		const onWheel = (e: WheelEvent) => {
			if (container.scrollWidth > container.clientWidth) {
				if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
					e.preventDefault();
					container.scrollLeft += e.deltaY;
					updateScrollButtons();
				}
			}
		};

		container.addEventListener("wheel", onWheel, { passive: false });
		return () => container.removeEventListener("wheel", onWheel);
	}, [updateScrollButtons]);

	const scrollByDirection = (direction: "left" | "right") => {
		const container = tabsContainerRef.current;
		if (!container) return;
		const scrollAmount = Math.max(container.clientWidth * 0.65, 240);
		container.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
		setTimeout(updateScrollButtons, 320);
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		const container = tabsContainerRef.current;
		if (!container) return;
		isDraggingRef.current = true;
		hasDraggedRef.current = false;
		startXRef.current = e.pageX - container.offsetLeft;
		scrollLeftRef.current = container.scrollLeft;
		setIsDragging(true);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isDraggingRef.current) return;
		const container = tabsContainerRef.current;
		if (!container) return;
		const x = e.pageX - container.offsetLeft;
		const walk = x - startXRef.current;
		if (Math.abs(walk) > 4) {
			hasDraggedRef.current = true;
		}
		container.scrollLeft = scrollLeftRef.current - walk;
		updateScrollButtons();
	};

	const handleMouseUpOrLeave = () => {
		if (isDraggingRef.current) {
			isDraggingRef.current = false;
			setIsDragging(false);
			setTimeout(() => {
				hasDraggedRef.current = false;
			}, 60);
		}
	};

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

	/* --------------------------- Sleep Tracker Handlers --------------------------- */
	async function handleStartSleep(payload?: { sleepType?: SleepType; notes?: string }) {
		await startBabySleep(payload);
		await refreshData();
	}

	async function handleWakeUp(payload?: { id?: string; notes?: string }) {
		await wakeUpBaby(payload);
		await refreshData();
	}

	async function handleCreateSleep(payload: {
		startTime: string;
		endTime?: string | null;
		sleepType?: SleepType;
		notes?: string;
	}) {
		await createSleepLog(payload);
		await refreshData();
	}

	async function handleUpdateSleep(
		id: string,
		payload: {
			startTime?: string;
			endTime?: string | null;
			sleepType?: SleepType;
			notes?: string;
			status?: SleepStatus;
		},
	) {
		await updateSleepLog(id, payload);
		await refreshData();
	}

	async function handleDeleteSleep(id: string) {
		await deleteSleepLog(id);
		await refreshData();
	}

	/* --------------------------- Milk Tracker Handlers ---------------------------- */
	async function handleCreateMilk(payload: {
		preparedOz: number;
		status: MilkStatus;
		leftoverOz?: number;
		milkType?: MilkType;
		loggedAt?: string;
		notes?: string;
	}) {
		await createMilkLog(payload);
		await refreshData();
	}

	async function handleUpdateMilk(
		id: string,
		payload: {
			preparedOz?: number;
			status?: MilkStatus;
			leftoverOz?: number;
			milkType?: MilkType;
			loggedAt?: string;
			notes?: string;
		},
	) {
		await updateMilkLog(id, payload);
		await refreshData();
	}

	async function handleDeleteMilk(id: string) {
		await deleteMilkLog(id);
		await refreshData();
	}

	// Overview helpers
	const ageInfo = data.profile?.birthDate ? calculateBabyAge(data.profile.birthDate) : null;
	const diaperStats = getDiaperStats(data.stoolLogs);
	const sleepStats = getSleepStats(data.sleepLogs, ageInfo?.totalMonths ?? 0);
	const milkStats = getMilkStats(data.milkLogs);
	const latestGrowth = data.growthRecords.length > 0 ? data.growthRecords[data.growthRecords.length - 1] : null;
	const activeMedicines = data.medicines.filter((m) => m.status === "active");
	const todayStr = new Date().toISOString().split("T")[0];
	const upcomingVaccines = data.vaccines.filter((v) => v.status === "upcoming" && v.vaccineDate >= todayStr);
	const overdueVaccines = data.vaccines.filter((v) => v.status === "overdue" || (v.status === "upcoming" && v.vaccineDate < todayStr));

	const tabs: Array<{
		id: ActiveTab;
		label: string;
		icon: React.ComponentType<{ size?: number; className?: string }>;
		badge?: number | string;
		badgeColor?: string;
	}> = [
		{
			id: "sleep",
			label: "Sleep Tracker",
			icon: Moon,
			badge: sleepStats.activeSession
				? "Sleeping 🌙"
				: sleepStats.todaySleepMinutes > 0
				? sleepStats.todaySleepFormatted
				: undefined,
			badgeColor: sleepStats.activeSession
				? "bg-indigo-600 text-white animate-pulse"
				: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
		},
		{
			id: "milk",
			label: "Milk Tracker",
			icon: Droplets,
			badge: milkStats.todayDrankOz > 0 ? `${milkStats.todayDrankOz} oz` : undefined,
			badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
		},
		{
			id: "stool",
			label: "Diaper & Stool",
			icon: Baby,
			badge: diaperStats.todayTotal > 0 ? `${diaperStats.todayTotal} today` : undefined,
			badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
		},
		{
			id: "growth",
			label: "Growth Curves",
			icon: TrendingUp,
			badge: latestGrowth ? `${latestGrowth.weightKg}kg` : undefined,
			badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
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

			{/* Navigation Tabs Bar (Desktop hold-and-drag, smooth scroll chevrons, gradient masks) */}
			<div className="relative group/tabs w-full min-w-0 max-w-full">
				{/* Left Scroll Chevron & Gradient Fade Mask */}
				{canScrollLeft && (
					<>
						<div
							aria-hidden="true"
							className="pointer-events-none absolute left-0 inset-y-0 z-10 w-12 sm:w-16 rounded-l-2xl sm:rounded-l-3xl bg-linear-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80"
						/>
						<button
							type="button"
							onClick={() => scrollByDirection("left")}
							aria-label="Scroll tabs left"
							className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex size-7 sm:size-8 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-slate-950 active:scale-95 dark:border-slate-700/80 dark:bg-slate-800/95 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
						>
							<ChevronLeft size={16} />
						</button>
					</>
				)}

				{/* Right Scroll Chevron & Gradient Fade Mask */}
				{canScrollRight && (
					<>
						<div
							aria-hidden="true"
							className="pointer-events-none absolute right-0 inset-y-0 z-10 w-12 sm:w-16 rounded-r-2xl sm:rounded-r-3xl bg-linear-to-l from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80"
						/>
						<button
							type="button"
							onClick={() => scrollByDirection("right")}
							aria-label="Scroll tabs right"
							className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex size-7 sm:size-8 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-slate-950 active:scale-95 dark:border-slate-700/80 dark:bg-slate-800/95 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
						>
							<ChevronRight size={16} />
						</button>
					</>
				)}

				<div
					ref={tabsContainerRef}
					onScroll={updateScrollButtons}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUpOrLeave}
					onMouseLeave={handleMouseUpOrLeave}
					className={`w-full min-w-0 max-w-full overflow-x-auto scrollbar-none rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-1.5 shadow-2xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 transition-colors ${
						isDragging ? "cursor-grabbing select-none" : "cursor-grab"
					}`}
				>
					<div className="flex w-max min-w-full gap-1 sm:gap-1.5 px-0.5">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									data-tab-id={tab.id}
									type="button"
									onClick={(e) => {
										if (hasDraggedRef.current) {
											e.preventDefault();
											return;
										}
										setActiveTab(tab.id);
									}}
									style={isActive ? ({ "--action-accent": pagePalette.accent } as CSSProperties) : undefined}
									className={`flex shrink-0 select-none items-center gap-2 rounded-xl sm:rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
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
			</div>

			{/* Tab Contents */}
			{activeTab === "sleep" && (
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader
						theme="violet"
						icon={Moon}
						title="Daily Sleep & Nap Time Tracker"
						description="Count daily sleep, one-tap live sleep mode stopwatch, and sleep vs wake-up trends"
						appearance="soft"
						className="min-h-[96px]"
					>
						<span className="password-library-badge inline-flex min-h-9 w-fit items-center rounded-full px-3.5 py-1 text-xs font-bold">
							{sleepStats.activeSession
								? "🌙 Baby is currently sleeping"
								: `${sleepStats.todaySessionCount} sleep${sleepStats.todaySessionCount === 1 ? "" : "s"} today · ${sleepStats.todaySleepFormatted}`}
						</span>
					</FeatureSectionHeader>
					<CardContent className="p-0">
						<SleepTracker
							logs={data.sleepLogs}
							babyMonthAge={ageInfo?.totalMonths ?? 0}
							onStartSleep={handleStartSleep}
							onWakeUp={handleWakeUp}
							onCreateRecord={handleCreateSleep}
							onUpdateRecord={handleUpdateSleep}
							onDeleteRecord={handleDeleteSleep}
							paletteAccent={pagePalette.accent}
							dialogPalette={dialogPalette}
						/>
					</CardContent>
				</Card>
			)}

			{activeTab === "milk" && (
				<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
					<FeatureSectionHeader
						theme="rose"
						icon={Droplets}
						title="Prepared Milk & Intake Tracker"
						description="Track bottle ounces prepared, completed vs leftover tags, and daily milk comparisons"
						appearance="soft"
						className="min-h-[96px]"
					>
						<span className="password-library-badge inline-flex min-h-9 w-fit items-center rounded-full px-3.5 py-1 text-xs font-bold">
							{milkStats.todayDrankOz > 0
								? `🍼 ${milkStats.todayDrankOz} oz drank today (${milkStats.todayCount} ${milkStats.todayCount === 1 ? "feed" : "feeds"})`
								: "No feeds logged yet today"}
						</span>
					</FeatureSectionHeader>
					<CardContent className="p-0">
						<MilkTracker
							logs={data.milkLogs}
							onCreateRecord={handleCreateMilk}
							onUpdateRecord={handleUpdateMilk}
							onDeleteRecord={handleDeleteMilk}
							paletteAccent={pagePalette.accent}
							dialogPalette={dialogPalette}
						/>
					</CardContent>
				</Card>
			)}

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
