"use client";

import { useState, useEffect, useMemo, type FormEvent, type CSSProperties } from "react";
import {
	Clock,
	Plus,
	Trash2,
	Info,
	Loader2,
	Droplets,
	Grid2X2,
	Baby,
	HelpCircle,
	CheckCircle,
	ArrowRight,
	ShieldCheck,
	Smile,
	Calendar,
	ChevronLeft,
	ChevronRight,
	X,
} from "lucide-react";
import { getPageNumbers } from "@/features/budget/lib/budget-utils";
import { Button } from "@/components/ui/button";

function BabyDiaperIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M4.5 6.5h15l-1.3 6a6.5 6.5 0 0 1-6.2 5.5 6.5 6.5 0 0 1-6.2-5.5L4.5 6.5Z" />
			<path d="M4.5 9h3.5" />
			<path d="M16 9h3.5" />
			<circle cx="12" cy="12" r="1.5" />
		</svg>
	);
}
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import type { PagePalette } from "@/components/settings/page-palettes";
import type { BabyStoolLog, DiaperType, StoolAmount, StoolColor, StoolConsistency } from "../types";
import {
	getDiaperStats,
	isSameDay,
	stoolColorMetadata,
	stoolConsistencyMetadata,
} from "../lib/baby-tracker-utils";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";
import { toast } from "sonner";

export function StoolCounter({
	logs,
	onCreateLog,
	onQuickLog,
	onDeleteLog,
	paletteAccent = "#B66F57",
	dialogPalette,
}: {
	logs: BabyStoolLog[];
	onCreateLog: (data: Parameters<typeof import("../actions/baby-tracker-actions").createStoolLog>[0]) => Promise<void>;
	onQuickLog: (type: DiaperType) => Promise<void>;
	onDeleteLog: (id: string) => Promise<void>;
	paletteAccent?: string;
	dialogPalette?: PagePalette;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [guideOpen, setGuideOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [activeFilter, setActiveFilter] = useState<"all" | "today" | "stool" | "wet" | "both">("today");
	const [dateFilter, setDateFilter] = useState<string>("");
	const [rowsPerPage, setRowsPerPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(3000);

	// Detailed modal form states
	const [diaperType, setDiaperType] = useState<DiaperType>("stool");
	const [consistency, setConsistency] = useState<StoolConsistency>("soft");
	const [selectedColor, setSelectedColor] = useState<StoolColor>("yellow");
	const [amount, setAmount] = useState<StoolAmount>("medium");

	const stats = getDiaperStats(logs);

	async function handleQuick(type: DiaperType) {
		if (submitting) return;
		setSubmitting(true);
		try {
			await onQuickLog(type);
			showAlert(
				"DIAPER LOGGED",
				type === "stool"
					? "Logged dirty / stool diaper! 💩"
					: type === "wet"
					? "Logged wet diaper! 💧"
					: "Logged combined wet & stool diaper! ✨"
			);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to log diaper");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDetailedSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);

		const form = new FormData(event.currentTarget);
		const notes = String(form.get("notes") || "").trim();

		try {
			await onCreateLog({
				type: diaperType,
				consistency,
				color: selectedColor,
				amount,
				notes,
				loggedAt: new Date().toISOString(),
			});
			showAlert("DIAPER LOGGED", "Detailed diaper change recorded successfully!");
			setDialogOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to record log");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (submitting) return;
		setSubmitting(true);
		try {
			await onDeleteLog(id);
			showAlert("DIAPER REMOVED", "Diaper log removed successfully.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete log");
		} finally {
			setSubmitting(false);
		}
	}

	const today = useMemo(() => new Date(), []);
	const displayedLogs = useMemo(() => {
		return logs.filter((log) => {
			if (dateFilter) {
				const d = new Date(log.loggedAt);
				const logDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
				if (logDateStr !== dateFilter) return false;
			} else if (activeFilter === "today") {
				if (!isSameDay(new Date(log.loggedAt), today)) return false;
			}

			if (activeFilter === "stool" && log.type !== "stool" && log.type !== "both") {
				return false;
			}
			if (activeFilter === "wet" && log.type !== "wet" && log.type !== "both") {
				return false;
			}
			if (activeFilter === "both" && log.type !== "both") {
				return false;
			}

			return true;
		});
	}, [logs, activeFilter, dateFilter, today]);

	// Pagination calculations
	const pageCount = Math.max(1, Math.ceil(displayedLogs.length / rowsPerPage));
	const activePage = Math.min(currentPage, pageCount);
	const firstVisibleIndex = (activePage - 1) * rowsPerPage;
	const paginatedLogs = displayedLogs.slice(firstVisibleIndex, firstVisibleIndex + rowsPerPage);
	const pageNumbers = getPageNumbers(activePage, pageCount);

	return (
		<div className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6">
			{/* Alert notification banner */}
			<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />

			{/* Quick Log Action Station: Big tactile buttons for parents holding a baby */}
			<div className="relative overflow-hidden rounded-3xl border border-rose-200/70 bg-linear-to-r from-rose-50/70 via-white to-amber-50/50 p-3.5 shadow-xs sm:p-4 dark:border-rose-900/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
							QUICK CARE STATION
						</p>
						<p className="text-xs text-slate-600 dark:text-slate-400">
							Tap once to instantly log a change, or open detailed log for color & consistency.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{/* Quick Wet */}
						<button
							type="button"
							onClick={() => handleQuick("wet")}
							disabled={submitting}
							className="inline-flex flex-1 sm:flex-initial h-10 items-center justify-center gap-1.5 rounded-2xl border border-sky-200 bg-sky-50 px-3.5 text-xs font-bold text-sky-800 shadow-2xs transition-all hover:bg-sky-100 active:scale-95 disabled:opacity-50 dark:border-sky-800/80 dark:bg-sky-950/70 dark:text-sky-200"
						>
							<Droplets size={15} className="text-sky-600 dark:text-sky-400" />
							<span>+ Wet</span>
						</button>

						{/* Quick Stool */}
						<button
							type="button"
							onClick={() => handleQuick("stool")}
							disabled={submitting}
							className="inline-flex flex-1 sm:flex-initial h-10 items-center justify-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 text-xs font-bold text-amber-800 shadow-2xs transition-all hover:bg-amber-100 active:scale-95 disabled:opacity-50 dark:border-amber-800/80 dark:bg-amber-950/70 dark:text-amber-200"
						>
							<BabyDiaperIcon size={15} className="text-amber-600 dark:text-amber-400" />
							<span>+ Dirty</span>
						</button>

						{/* Quick Both */}
						<button
							type="button"
							onClick={() => handleQuick("both")}
							disabled={submitting}
							className="inline-flex flex-1 sm:flex-initial h-10 items-center justify-center gap-1.5 rounded-2xl border border-purple-200 bg-purple-50 px-3.5 text-xs font-bold text-purple-800 shadow-2xs transition-all hover:bg-purple-100 active:scale-95 disabled:opacity-50 dark:border-purple-800/80 dark:bg-purple-950/70 dark:text-purple-200"
						>
							<Baby size={15} className="text-purple-600 dark:text-purple-400" />
							<span>+ Both</span>
						</button>

						{/* Detailed Log Modal CTA */}
						<button
							type="button"
							onClick={() => {
								setDialogOpen(true);
							}}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button inline-flex flex-1 sm:flex-initial h-10 items-center justify-center gap-1.5 rounded-2xl border px-3.5 text-xs font-bold transition-all active:scale-95"
						>
							<Plus size={15} />
							<span>Detailed Log</span>
						</button>

						{/* Stool Color Guide CTA */}
						<button
							type="button"
							onClick={() => setGuideOpen(true)}
							className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
							title="Baby Stool Color Guide"
							aria-label="Baby Stool Color Guide"
						>
							<HelpCircle size={17} />
						</button>
					</div>
				</div>
			</div>

			{/* Metric Counters Grid */}
			<div data-page-palette-preserve className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
				{/* Wet Diapers Card (Sky) */}
				<Card className="metric-summary-card metric-summary-card--sky relative gap-0 overflow-hidden rounded-3xl border border-blue-200 bg-[#f5f8ff] py-0 shadow-sm shadow-blue-950/5 ring-0 transition-shadow hover:shadow-md dark:border-blue-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-2xs">
								<Droplets size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Wet Diapers
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-blue-100/90 px-2.5 text-[9px] font-bold tracking-wider text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
								<Droplets size={10} /> {stats.todayWets >= 4 ? "HYDRATED" : "LOGGED"}
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.todayWets}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Goal: 4–6+ wet/day
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setActiveFilter("wet")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-blue-500/10 px-3 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Stools Today Card (Amber) */}
				<Card className="metric-summary-card metric-summary-card--amber relative gap-0 overflow-hidden rounded-3xl border border-amber-200 bg-[#fffaf0] py-0 shadow-sm shadow-amber-950/5 ring-0 transition-shadow hover:shadow-md dark:border-amber-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-2xs">
								<BabyDiaperIcon size={18} className="text-white" />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Dirty Diapers
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-amber-100/90 px-2.5 text-[9px] font-bold tracking-wider text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
								<Smile size={10} /> {stats.todayStools > 0 ? "NORMAL" : "LOG DUE"}
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.todayStools}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Bowel movements
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setActiveFilter("stool")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-amber-500/10 px-3 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Total Changes Card (Violet) */}
				<Card className="metric-summary-card metric-summary-card--violet relative gap-0 overflow-hidden rounded-3xl border border-violet-200 bg-[#f8f6ff] py-0 shadow-sm shadow-violet-950/5 ring-0 transition-shadow hover:shadow-md dark:border-violet-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500 text-white shadow-2xs">
								<Baby size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Total Changes
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-emerald-100/80 px-2.5 text-[9px] font-semibold tracking-wider text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
								<ShieldCheck size={10} /> FRESH
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.todayTotal}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								Diapers changed today
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setActiveFilter("all")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-violet-500/10 px-3 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Last Changed Card (Teal) */}
				<Card className="metric-summary-card metric-summary-card--teal relative gap-0 overflow-hidden rounded-3xl border border-teal-200 bg-[#eafbf6] py-0 shadow-sm shadow-teal-950/5 ring-0 transition-shadow hover:shadow-md dark:border-teal-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-600 text-white shadow-2xs">
								<Clock size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Last Changed
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-teal-100/90 px-2.5 text-[9px] font-bold tracking-wider text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
								<Clock size={10} /> RECENT
							</span>
						</div>
						<div className="self-end">
							<p className="text-2xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{stats.lastChanged}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								{stats.lastLogTime ? `at ${stats.lastLogTime}` : "Timeline history"}
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setGuideOpen(true)}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-teal-500/10 px-3 text-[11px] font-medium text-teal-700 transition-colors hover:bg-teal-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-300"
							>
								<ArrowRight size={12} /> Guide
							</button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filter Toolbar */}
			<div
				style={{ "--password-accent": paletteAccent } as CSSProperties}
				className="password-library-header relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border p-2.5 shadow-md sm:p-3"
			>
				<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-10 size-28 rounded-full" />
				<div className="relative z-10 flex w-full min-w-0 flex-wrap items-center gap-2.5 sm:gap-3">
					{/* Filter Pills */}
					<div className="password-filter-mode-group flex w-full basis-full shrink-0 items-center gap-1 overflow-x-auto scrollbar-none rounded-xl border p-1 shadow-xs sm:w-auto sm:basis-auto">
						{(
							[
								{ id: "all", label: "All", icon: Grid2X2 },
								{ id: "today", label: `Today (${stats.todayTotal})`, icon: Clock },
								{ id: "wet", label: "Wet", icon: Droplets },
								{ id: "stool", label: "Dirty", icon: BabyDiaperIcon },
								{ id: "both", label: "Both", icon: Baby },
							] as const
						).map((option) => {
							const active = activeFilter === option.id;
							const Icon = option.icon;
							return (
								<button
									key={option.id}
									type="button"
									onClick={() => {
										setActiveFilter(option.id);
										if (option.id === "all" || option.id === "today") {
											setDateFilter("");
										}
										setCurrentPage(1);
									}}
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

					{/* Date & Row Filter Controls */}
					<div className="ml-auto flex flex-wrap items-center gap-2">
						{/* Date Filter */}
						<label className="password-row-count-control inline-flex h-9 sm:h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold shadow-2xs transition-colors">
							<Calendar size={14} className="shrink-0 text-slate-500 dark:text-slate-400" />
							<input
								type="date"
								aria-label="Filter by date"
								value={dateFilter}
								onChange={(e) => {
									setDateFilter(e.target.value);
									if (e.target.value && activeFilter === "today") {
										setActiveFilter("all");
									}
									setCurrentPage(1);
								}}
								className="password-row-count-select cursor-pointer rounded-md bg-transparent px-1 py-0.5 text-xs font-semibold text-slate-800 outline-none dark:text-slate-100"
							/>
							{dateFilter && (
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										setDateFilter("");
										setCurrentPage(1);
									}}
									aria-label="Clear date filter"
									title="Clear date filter"
									className="inline-flex size-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
								>
									<X size={11} strokeWidth={2.5} />
								</button>
							)}
						</label>

						{/* Row Filter */}
						<label className="password-row-count-control inline-flex h-9 sm:h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold shadow-2xs transition-colors">
							<span className="text-slate-600 dark:text-slate-300">Rows</span>
							<select
								aria-label="Rows per page"
								value={rowsPerPage}
								onChange={(event) => {
									setRowsPerPage(Number(event.target.value));
									setCurrentPage(1);
								}}
								className="password-row-count-select cursor-pointer rounded-md bg-transparent px-1 py-0.5 text-xs font-semibold text-slate-800 outline-none dark:text-slate-100"
							>
								{[5, 10, 15, 20, 30].map((rows) => (
									<option key={rows} value={rows} className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
										{rows}
									</option>
								))}
							</select>
						</label>
					</div>
				</div>
			</div>

			{/* Timeline History Cards */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
							Diaper & Stool Timeline
						</h3>
						<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
							{displayedLogs.length}
						</span>
					</div>
					<div className="flex items-center gap-3">
						{displayedLogs.length > 0 && rowsPerPage < displayedLogs.length && (
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Showing {firstVisibleIndex + 1}–{Math.min(firstVisibleIndex + rowsPerPage, displayedLogs.length)} of {displayedLogs.length}
							</p>
						)}
						<button
							type="button"
							onClick={() => setGuideOpen(true)}
							className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline dark:text-rose-400"
						>
							<Info size={13} />
							<span>Stool Color Guide</span>
						</button>
					</div>
				</div>

				{displayedLogs.length === 0 ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
						<span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300">
							<Baby size={22} />
						</span>
						<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
							{dateFilter
								? `No diapers logged for ${dateFilter}`
								: activeFilter === "today"
								? "No diapers logged today yet"
								: "No diaper records found"}
						</p>
						<p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
							Use the quick care buttons at the top to log wet and dirty diapers with a single tap.
						</p>
					</div>
				) : (
					<div className="space-y-2.5">
						{paginatedLogs.map((log) => {
							const date = new Date(log.loggedAt);
							const createdDate = log.createdAt ? new Date(log.createdAt) : date;
							const timeSource = !isNaN(createdDate.getTime()) ? createdDate : date;
							const formattedTime = !isNaN(timeSource.getTime())
								? timeSource.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
								: null;
							const colorMeta = stoolColorMetadata[log.color] || stoolColorMetadata.yellow;
							const consistencyMeta = stoolConsistencyMetadata[log.consistency] || stoolConsistencyMetadata.soft;

							return (
								<article
									key={log.id}
									data-page-palette-preserve
									className="budget-bill-card group relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5 overflow-hidden rounded-2xl border p-3 transition-all hover:-translate-y-0.5 sm:rounded-3xl sm:p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-4"
								>
									{/* Left Squircle Icon */}
									{log.type === "wet" ? (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-sky-50 to-sky-100/70 text-sky-600 shadow-xs sm:size-11 dark:from-sky-950/60 dark:to-sky-900/40 dark:text-sky-400">
											<Droplets size={19} className="sm:size-[21px]" />
										</span>
									) : log.type === "stool" ? (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-amber-50 to-amber-100/70 text-amber-600 shadow-xs sm:size-11 dark:from-amber-950/60 dark:to-amber-900/40 dark:text-amber-400">
											<BabyDiaperIcon size={19} className="sm:size-[21px]" />
										</span>
									) : (
										<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-purple-50 to-purple-100/70 text-purple-600 shadow-xs sm:size-11 dark:from-purple-950/60 dark:to-purple-900/40 dark:text-purple-400">
											<Baby size={19} className="sm:size-[21px]" />
										</span>
									)}

									{/* Title and Subtitle Metadata */}
									<div className="min-w-0">
										<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
											<p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
												{log.type === "both" ? "Wet + Stool Diaper" : log.type === "stool" ? "Dirty Diaper" : "Wet Diaper"}
											</p>
											{log.type === "wet" ? (
												<span className="inline-flex shrink-0 items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
													Wet Only
												</span>
											) : log.type === "stool" ? (
												<span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
													Dirty Diaper
												</span>
											) : (
												<span className="inline-flex shrink-0 items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
													Wet + Dirty
												</span>
											)}
										</div>

										<div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
											<span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
												<Calendar size={12} className="text-slate-400" />
												{date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
											</span>
											{formattedTime && (
												<>
													<span aria-hidden="true">·</span>
													<span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
														<Clock size={12} className="text-slate-400" />
														{formattedTime}
													</span>
												</>
											)}
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
										{/* Stool details pills */}
										<div className="flex flex-wrap items-center gap-1.5">
											{(log.type === "stool" || log.type === "both") && (
												<span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
													<span className={`size-2.5 rounded-full border border-black/10 ${colorMeta.swatch}`} />
													<span>{colorMeta.label}</span>
												</span>
											)}

											{(log.type === "stool" || log.type === "both") && (
												<span className="inline-flex items-center rounded-xl border border-slate-200/90 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
													{consistencyMeta.label}
												</span>
											)}

											<span className="inline-flex items-center rounded-xl border border-slate-200/90 bg-white/80 px-2.5 py-1 text-xs font-medium capitalize text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
												{log.amount} amount
											</span>
										</div>

										{/* Action Pill Group */}
										<div className="budget-bill-actions flex shrink-0 items-center gap-0.5 rounded-2xl border p-0.5">
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												disabled={submitting}
												className="budget-bill-action budget-bill-action--delete size-7.5 rounded-xl text-slate-400 transition-colors sm:size-8 dark:text-slate-400"
												aria-label="Delete diaper log"
												title="Delete diaper log"
												onClick={() => handleDelete(log.id)}
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

				{/* Pagination Controls */}
				{displayedLogs.length > 0 && pageCount > 1 && (
					<nav aria-label="Diaper timeline pagination" className="shared-pagination w-full pt-1" style={{ "--pagination-accent": paletteAccent } as CSSProperties}>
						<div className="shared-pagination-controls flex w-full items-center justify-between rounded-2xl border p-1.5 sm:px-3 sm:py-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="shared-pagination-button inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold"
								aria-label="Previous page"
								disabled={activePage === 1}
								onClick={() => setCurrentPage(activePage - 1)}
							>
								<ChevronLeft size={16} />
								<span className="hidden sm:inline">Previous</span>
							</Button>

							<div className="flex items-center gap-1">
								{pageNumbers.map((page, idx) => {
									if (page === "...") {
										return (
											<span
												key={`ellipsis-${idx}`}
												className="grid size-8.5 place-items-center text-xs font-semibold text-slate-400 select-none dark:text-slate-500"
											>
												…
											</span>
										);
									}

									const isCurrent = page === activePage;
									return (
										<button
											key={page}
											type="button"
											onClick={() => setCurrentPage(Number(page))}
											aria-current={isCurrent ? "page" : undefined}
											aria-label={`Page ${page}`}
											className={`grid size-8.5 place-items-center rounded-xl text-xs font-semibold transition-all active:scale-95 ${
												isCurrent
													? "shared-pagination-current text-white shadow-xs"
													: "shared-pagination-button"
											}`}
										>
											{page}
										</button>
									);
								})}
							</div>

							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="shared-pagination-button inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold"
								aria-label="Next page"
								disabled={activePage === pageCount}
								onClick={() => setCurrentPage(activePage + 1)}
							>
								<span className="hidden sm:inline">Next</span>
								<ChevronRight size={16} />
							</Button>
						</div>
					</nav>
				)}
			</div>

			{/* Detailed Log Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel flex max-h-[90dvh] max-w-lg flex-col overflow-hidden p-0 shadow-2xl sm:rounded-3xl"
				>
					<PaletteDialogHeader
						eyebrow="DAILY CARE"
						title="Detailed Diaper Entry"
						description="Record diaper consistency, color, and stool characteristics for tracking digestion."
						icon={<Droplets size={18} />}
						closeLabel="Close dialog"
					/>
					<form onSubmit={handleDetailedSubmit} className="flex flex-1 min-h-0 flex-col overflow-y-auto">
						<div className="space-y-4 p-5 sm:p-6 text-sm">
							{/* Diaper Type Selection Buttons */}
							<div className="space-y-1.5">
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Diaper Type</span>
								</label>
								<div className="grid grid-cols-3 gap-2">
									{(
										[
											{ id: "wet", label: "Wet Only", icon: Droplets, color: "text-sky-600" },
											{ id: "stool", label: "Dirty Only", icon: BabyDiaperIcon, color: "text-amber-600" },
											{ id: "both", label: "Wet + Stool", icon: Baby, color: "text-purple-600" },
										] as const
									).map((t) => {
										const selected = diaperType === t.id;
										const Icon = t.icon;
										return (
											<button
												key={t.id}
												type="button"
												onClick={() => setDiaperType(t.id)}
												className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-xs font-semibold transition-all ${
													selected
														? "border-rose-400 bg-rose-50/80 text-rose-900 shadow-2xs dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
														: "border-rose-200/70 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
												}`}
											>
												<Icon size={18} className={t.color} />
												<span>{t.label}</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Stool Color Options (if stool or both) */}
							{(diaperType === "stool" || diaperType === "both") && (
								<div className="space-y-1.5">
									<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
										<span>Stool Color</span>
									</label>
									<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
										{(Object.keys(stoolColorMetadata) as StoolColor[]).map((cKey) => {
											const meta = stoolColorMetadata[cKey];
											const isSelected = selectedColor === cKey;
											return (
												<button
													key={cKey}
													type="button"
													onClick={() => setSelectedColor(cKey)}
													className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition-all ${
														isSelected
															? "border-rose-400 bg-rose-50/80 font-bold text-rose-900 shadow-2xs dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
															: "border-rose-200/70 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
													}`}
												>
													<span className={`size-3.5 shrink-0 rounded-full border border-black/10 shadow-2xs ${meta.swatch}`} />
													<span className="truncate">{meta.label}</span>
												</button>
											);
										})}
									</div>
								</div>
							)}

							{/* Stool Consistency & Amount */}
							{(diaperType === "stool" || diaperType === "both") && (
								<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
									<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
										<span>Consistency</span>
										<select
											value={consistency}
											onChange={(e) => setConsistency(e.target.value as StoolConsistency)}
											className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
										>
											<option value="soft">Soft / Creamy (Normal)</option>
											<option value="seedy">Seedy (Breastfed)</option>
											<option value="normal">Formed / Normal</option>
											<option value="watery">Watery / Loose</option>
											<option value="hard">Hard / Pellets</option>
										</select>
									</label>

									<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
										<span>Amount</span>
										<select
											value={amount}
											onChange={(e) => setAmount(e.target.value as StoolAmount)}
											className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
										>
											<option value="small">Small (Spotting / Smear)</option>
											<option value="medium">Medium (Standard)</option>
											<option value="large">Large (Full / Overflow)</option>
										</select>
									</label>
								</div>
							)}

							{/* Notes */}
							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Notes & Observations</span>
								<Input
									name="notes"
									placeholder="e.g. Diaper cream applied, fussy before change..."
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
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
										<CheckCircle size={16} className="shrink-0" />
										<span>Save Diaper Log</span>
									</>
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Educational Stool Color Guide Modal */}
			<Dialog open={guideOpen} onOpenChange={setGuideOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel flex max-h-[90dvh] max-w-xl flex-col overflow-hidden p-0 shadow-2xl sm:rounded-3xl"
				>
					<PaletteDialogHeader
						eyebrow="PEDIATRIC HEALTH REFERENCE"
						title="Baby Stool Color & Health Guide"
						description="A quick friendly guide on what baby poop colors mean and when to call your pediatrician."
						icon={<HelpCircle size={18} />}
						closeLabel="Close guide"
					/>
					<div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 pb-6 space-y-3.5 text-xs sm:text-sm">
						{(Object.keys(stoolColorMetadata) as StoolColor[]).map((cKey) => {
							const meta = stoolColorMetadata[cKey];
							const isAlert = cKey === "black" || cKey === "clay";
							return (
								<div
									key={cKey}
									className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-colors ${
										isAlert
											? "border-amber-200 bg-amber-50/60 dark:border-amber-900/70 dark:bg-amber-950/40"
											: "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/80"
									}`}
								>
									<span className={`size-6 shrink-0 rounded-full border border-black/15 shadow-xs ${meta.swatch}`} />
									<div className="min-w-0">
										<p className="font-bold text-slate-900 dark:text-white">
											{meta.label}
										</p>
										<p className="mt-0.5 text-slate-600 dark:text-slate-300">
											{meta.advice}
										</p>
									</div>
								</div>
							);
						})}

						<div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/70 dark:text-rose-200">
							<p className="font-bold">⚠️ When to contact your pediatrician immediately:</p>
							<ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-rose-800 dark:text-rose-300">
								<li>Stool containing bright red blood or dark coffee-ground specs</li>
								<li>Chalky white or pale clay-colored stool</li>
								<li>Watery stool more than 6–8 times in 24 hours (risk of dehydration)</li>
								<li>Accompanied by high fever, lethargy, or refusal to feed</li>
							</ul>
						</div>
					</div>

					<div className="palette-dialog-footer sticky bottom-0 flex justify-end gap-2 p-4 sm:px-6">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setGuideOpen(false)}
							style={{ "--action-accent": paletteAccent } as CSSProperties}
							className="palette-action-button palette-dialog-footer-button border font-medium transition-colors duration-150"
						>
							Close guide
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
