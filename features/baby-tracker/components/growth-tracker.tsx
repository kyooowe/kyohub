"use client";

import { useMemo, useState, useEffect, type FormEvent, type CSSProperties } from "react";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from "recharts";
import {
	Plus,
	TrendingUp,
	Scale,
	Ruler,
	Sparkles,
	Trash2,
	Edit3,
	Pencil,
	Info,
	Loader2,
	Activity,
	Calendar,
	CheckCircle2,
	ArrowRight,
	ArrowUpRight,
	ArrowDownRight,
	Search,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import type { PagePalette } from "@/components/settings/page-palettes";
import type { BabyGrowthRecord } from "../types";
import {
	whoGrowthBenchmarks,
	getWeightAssessment,
	getHeightAssessment,
	type GrowthAssessment,
} from "../lib/baby-tracker-utils";
import { BabyTrackerAlert, useBabyTrackerAlert } from "./baby-tracker-alert";
import { toast } from "sonner";

function GrowthStatusBadge({
	assessment,
	className = "",
}: {
	assessment: GrowthAssessment | null;
	className?: string;
}) {
	if (!assessment) return null;
	const { status, label } = assessment;

	if (status === "normal") {
		return (
			<span
				className={`inline-flex items-center gap-1 rounded-full border border-emerald-200/90 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 shadow-2xs dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 ${className}`}
			>
				<CheckCircle2 size={11} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
				{label}
			</span>
		);
	}

	if (status === "above_normal") {
		return (
			<span
				className={`inline-flex items-center gap-1 rounded-full border border-sky-200/90 bg-sky-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-sky-700 shadow-2xs dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-300 ${className}`}
			>
				<ArrowUpRight size={11} className="shrink-0 text-sky-600 dark:text-sky-400" />
				{label}
			</span>
		);
	}

	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 shadow-2xs dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-300 ${className}`}
		>
			<ArrowDownRight size={11} className="shrink-0 text-amber-600 dark:text-amber-400" />
			{label}
		</span>
	);
}

function CustomGrowthLegend(props: {
	payload?: Array<{
		value: string;
		color: string;
		dataKey: string;
	}>;
}) {
	const { payload } = props;
	if (!payload || payload.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-3 text-xs">
			{payload.map((entry) => {
				const isWho = String(entry.dataKey).startsWith("who");
				return (
					<div key={entry.value} className="inline-flex items-center gap-1.5">
						{isWho ? (
							<span
								className="inline-block h-0 w-4 border-t-2 border-dashed"
								style={{ borderColor: entry.color }}
								aria-hidden="true"
							/>
						) : (
							<span
								className="inline-block size-2.5 rounded-full"
								style={{ backgroundColor: entry.color }}
								aria-hidden="true"
							/>
						)}
						<span className="font-semibold text-slate-700 dark:text-slate-200">
							{entry.value}
						</span>
					</div>
				);
			})}
		</div>
	);
}

export function GrowthTracker({
	records,
	onCreateRecord,
	onUpdateRecord,
	onDeleteRecord,
	paletteAccent = "#B66F57",
	dialogPalette,
}: {
	records: BabyGrowthRecord[];
	onCreateRecord: (data: Parameters<typeof import("../actions/baby-tracker-actions").createGrowthRecord>[0]) => Promise<void>;
	onUpdateRecord: (id: string, data: Parameters<typeof import("../actions/baby-tracker-actions").updateGrowthRecord>[1]) => Promise<void>;
	onDeleteRecord: (id: string) => Promise<void>;
	paletteAccent?: string;
	dialogPalette?: PagePalette;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<BabyGrowthRecord | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [chartMetric, setChartMetric] = useState<"both" | "weight" | "height">("both");
	const [showWhoBenchmark, setShowWhoBenchmark] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const { alert, showAlert, clearAlert } = useBabyTrackerAlert(3000);

	// Sorted records by monthAge
	const sortedRecords = useMemo(() => {
		return [...records].sort((a, b) => a.monthAge - b.monthAge);
	}, [records]);

	// Filtered records by search query
	const filteredRecords = useMemo(() => {
		if (!searchQuery.trim()) return sortedRecords;
		const q = searchQuery.toLowerCase().trim();
		return sortedRecords.filter((r) => {
			const monthStr = `${r.monthAge} months`;
			const weightStr = `${r.weightKg} kg`;
			const heightStr = `${r.heightCm} cm`;
			const notesStr = (r.notes || "").toLowerCase();
			const dateStr = (r.recordedDate || "").toLowerCase();
			return (
				monthStr.includes(q) ||
				weightStr.includes(q) ||
				heightStr.includes(q) ||
				notesStr.includes(q) ||
				dateStr.includes(q) ||
				(r.monthAge === 0 && "birth".includes(q))
			);
		});
	}, [sortedRecords, searchQuery]);

	// Latest records and growth delta
	const latest = sortedRecords[sortedRecords.length - 1];
	const previous = sortedRecords.length > 1 ? sortedRecords[sortedRecords.length - 2] : null;

	const latestWeightAssessment = latest ? getWeightAssessment(latest.weightKg, latest.monthAge) : null;
	const latestHeightAssessment = latest ? getHeightAssessment(latest.heightCm, latest.monthAge) : null;

	const weightDelta = latest && previous ? (latest.weightKg - previous.weightKg).toFixed(2) : null;
	const heightDelta = latest && previous ? (latest.heightCm - previous.heightCm).toFixed(1) : null;

	// Prepare data for recharts
	const chartData = useMemo(() => {
		if (sortedRecords.length === 0) return [];

		const maxMonth = Math.max(
			...sortedRecords.map((r) => r.monthAge),
			showWhoBenchmark ? 6 : 0,
		);

		const dataMap = new Map<number, {
			monthLabel: string;
			monthAge: number;
			weightKg?: number;
			heightCm?: number;
			whoWeightKg?: number;
			whoHeightCm?: number;
			recordedDate?: string;
		}>();

		for (const r of sortedRecords) {
			const who = whoGrowthBenchmarks.find((w) => w.month === r.monthAge);
			dataMap.set(r.monthAge, {
				monthLabel: r.monthAge === 0 ? "Birth" : `${r.monthAge}m`,
				monthAge: r.monthAge,
				weightKg: r.weightKg,
				heightCm: r.heightCm,
				whoWeightKg: who?.weightKg,
				whoHeightCm: who?.heightCm,
				recordedDate: r.recordedDate,
			});
		}

		if (showWhoBenchmark) {
			for (const bench of whoGrowthBenchmarks) {
				if (bench.month <= maxMonth && !dataMap.has(bench.month)) {
					dataMap.set(bench.month, {
						monthLabel: bench.month === 0 ? "Birth" : `${bench.month}m`,
						monthAge: bench.month,
						whoWeightKg: bench.weightKg,
						whoHeightCm: bench.heightCm,
					});
				}
			}
		}

		return Array.from(dataMap.values()).sort((a, b) => a.monthAge - b.monthAge);
	}, [sortedRecords, showWhoBenchmark]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;
		setSubmitting(true);

		const form = new FormData(event.currentTarget);
		const monthAge = Number(form.get("monthAge"));
		const recordedDate = String(form.get("recordedDate") || "").trim();
		const weightKg = Number(form.get("weightKg"));
		const heightCm = Number(form.get("heightCm"));
		const headCircumferenceCm = form.get("headCircumferenceCm") ? Number(form.get("headCircumferenceCm")) : null;
		const notes = String(form.get("notes") || "").trim();

		try {
			if (editingRecord) {
				await onUpdateRecord(editingRecord.id, {
					monthAge,
					recordedDate,
					weightKg,
					heightCm,
					headCircumferenceCm,
					notes,
				});
				showAlert(
					"GROWTH RECORD UPDATED",
					`Growth measurement for ${monthAge === 0 ? "birth" : `${monthAge} months`} updated successfully!`
				);
			} else {
				await onCreateRecord({
					monthAge,
					recordedDate,
					weightKg,
					heightCm,
					headCircumferenceCm,
					notes,
				});
				showAlert(
					"NEW MEASUREMENT SAVED",
					`Growth measurement (${weightKg} kg, ${heightCm} cm) saved successfully! 🌱`
				);
			}
			setDialogOpen(false);
			setEditingRecord(null);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save record");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		if (submitting) return;
		setSubmitting(true);
		try {
			await onDeleteRecord(id);
			showAlert("RECORD DELETED", "Growth record removed successfully.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to delete record");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6">
			{/* Top Metric Cards */}
			<div data-page-palette-preserve className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
				{/* Latest Weight Card (Rose) */}
				<Card className="metric-summary-card metric-summary-card--rose relative gap-0 overflow-hidden rounded-3xl border border-rose-200 bg-[#fff0f3] py-0 shadow-sm shadow-rose-950/5 ring-0 transition-shadow hover:shadow-md dark:border-rose-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500 text-white shadow-2xs">
								<Scale size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Latest Weight
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							{latestWeightAssessment ? (
								<GrowthStatusBadge assessment={latestWeightAssessment} />
							) : (
								<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-rose-100/90 px-2.5 text-[9px] font-bold tracking-wider text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
									<TrendingUp size={10} /> ON TRACK
								</span>
							)}
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{latest ? latest.weightKg : "—"}
								<span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">kg</span>
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								{latestWeightAssessment
									? `${latestWeightAssessment.diffFormatted}`
									: weightDelta
										? Number(weightDelta) >= 0
											? `+${weightDelta} kg gain`
											: `${weightDelta} kg change`
										: latest
											? `At ${latest.monthAge} months`
											: "No measurements yet"}
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => {
									setEditingRecord(null);
									setDialogOpen(true);
								}}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-rose-500/10 px-3 text-[11px] font-medium text-rose-700 transition-colors hover:bg-rose-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:text-rose-300"
							>
								<ArrowRight size={12} /> Add log
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Latest Height / Length Card (Teal) */}
				<Card className="metric-summary-card metric-summary-card--teal relative gap-0 overflow-hidden rounded-3xl border border-teal-200 bg-[#eafbf6] py-0 shadow-sm shadow-teal-950/5 ring-0 transition-shadow hover:shadow-md dark:border-teal-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-600 text-white shadow-2xs">
								<Ruler size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Latest Length
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							{latestHeightAssessment ? (
								<GrowthStatusBadge assessment={latestHeightAssessment} />
							) : (
								<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-teal-100/90 px-2.5 text-[9px] font-bold tracking-wider text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
									<Ruler size={10} /> GROWING
								</span>
							)}
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{latest ? latest.heightCm : "—"}
								<span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">cm</span>
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								{latestHeightAssessment
									? `${latestHeightAssessment.diffFormatted}`
									: heightDelta
										? `+${heightDelta} cm growth`
										: latest
											? `At ${latest.monthAge} months`
											: "Length progression"}
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => setChartMetric("height")}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-teal-500/10 px-3 text-[11px] font-medium text-teal-700 transition-colors hover:bg-teal-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Head Circumference Card (Violet) */}
				<Card className="metric-summary-card metric-summary-card--violet relative gap-0 overflow-hidden rounded-3xl border border-violet-200 bg-[#f8f6ff] py-0 shadow-sm shadow-violet-950/5 ring-0 transition-shadow hover:shadow-md dark:border-violet-900/70 dark:bg-[#151b2b]">
					<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[1fr_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2.5 p-3.5">
						<div className="flex min-w-0 items-center gap-2">
							<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500 text-white shadow-2xs">
								<Activity size={18} strokeWidth={2} />
							</span>
							<p className="whitespace-nowrap text-xs sm:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
								Head Circumference
							</p>
						</div>
						<div className="flex shrink-0 items-center justify-end">
							<span className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-emerald-100/80 px-2.5 text-[9px] font-semibold tracking-wider text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
								<CheckCircle2 size={10} /> CHECKUP
							</span>
						</div>
						<div className="self-end">
							<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
								{latest?.headCircumferenceCm ? latest.headCircumferenceCm : "—"}
								{latest?.headCircumferenceCm && (
									<span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">cm</span>
								)}
							</p>
							<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
								{latest?.headCircumferenceCm
									? `~${(latest.headCircumferenceCm / 2.54).toFixed(1)} inches`
									: "Cranial checkup marker"}
							</p>
						</div>
						<div className="flex shrink-0 self-end">
							<button
								type="button"
								onClick={() => {
									setEditingRecord(null);
									setDialogOpen(true);
								}}
								className="inline-flex h-7 items-center justify-center gap-1 rounded-full bg-violet-500/10 px-3 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300"
							>
								<ArrowRight size={12} /> View all
							</button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Interactive Growth Chart Section */}
			<div className="space-y-3">
				{/* Success Alert at top of Monthly Growth Curves */}
				<BabyTrackerAlert alert={alert} onDismiss={clearAlert} />

				<FeatureSectionHeader
					theme="rose"
					icon={TrendingUp}
					title="Monthly Growth Curves"
					description="Month-by-month trajectory compared with WHO 50th percentile averages"
					appearance="soft"
				>
					<div className="password-library-badge hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium sm:flex">
						<span className="grid size-6 place-items-center rounded-full bg-white/75 text-current shadow-sm dark:bg-white/10">
							<TrendingUp size={13} />
						</span>
						WHO Percentile Curves
					</div>
				</FeatureSectionHeader>

				{/* Growth Chart & Records Toolbar */}
				<div
					style={{ "--password-accent": paletteAccent } as CSSProperties}
					className="password-library-header relative w-full min-w-0 max-w-full overflow-hidden rounded-3xl border p-2.5 shadow-md sm:p-3"
				>
					<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-10 size-28 rounded-full" />
					<div className="relative z-10 flex w-full min-w-0 flex-col gap-2.5 sm:gap-3 xl:flex-row xl:items-center xl:justify-between">
						{/* Left controls: Search + Segmented Metric selector */}
						<div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center xl:w-auto">
							{/* Search input */}
							<label className="relative block w-full min-w-0 sm:w-56 sm:flex-initial xl:w-64">
								<Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
								<Input
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search measurements..."
									aria-label="Search measurements"
									className="h-10 w-full rounded-xl border-white/80 bg-white/75 pl-9 pr-3 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100"
								/>
							</label>

							{/* Segmented Metric Selector Pills */}
							<div className="password-filter-mode-group flex w-full shrink-0 items-center gap-1 rounded-xl border p-1 shadow-xs sm:w-auto">
								{(
									[
										{ id: "both", label: "Both", icon: Activity },
										{ id: "weight", label: "Weight", icon: Scale },
										{ id: "height", label: "Height", icon: Ruler },
									] as const
								).map((option) => {
									const active = chartMetric === option.id;
									const Icon = option.icon;
									return (
										<button
											key={option.id}
											type="button"
											onClick={() => setChartMetric(option.id)}
											className={`password-filter-mode-option flex-1 sm:flex-initial inline-flex h-8 sm:h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${active
													? "password-filter-mode-option--active"
													: "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
												}`}
										>
											<Icon size={14} className="shrink-0" />
											<span>{option.label}</span>
										</button>
									);
								})}
							</div>
						</div>

						{/* Right side controls: WHO toggle & Add Measurement button */}
						<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto xl:justify-end">
							{/* WHO Benchmark Toggle */}
							<button
								type="button"
								onClick={() => setShowWhoBenchmark((prev) => !prev)}
								className={`password-row-count-control flex-1 sm:flex-initial inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold shadow-xs transition-colors ${showWhoBenchmark
										? "password-filter-mode-option--active"
										: "text-slate-600 hover:text-slate-900 dark:text-slate-300"
									}`}
							>
								<Info size={14} className="shrink-0" />
								<span>{showWhoBenchmark ? "WHO Curve On" : "Show WHO Curve"}</span>
							</button>

							{/* Add Measurement CTA */}
							<Button
								type="button"
								onClick={() => {
									setEditingRecord(null);
									setDialogOpen(true);
								}}
								style={{ "--action-accent": paletteAccent } as CSSProperties}
								className="palette-action-button flex-1 sm:flex-initial h-10 gap-1.5 rounded-xl border px-3.5 text-xs font-bold shadow-xs transition-all active:scale-95"
							>
								<Plus size={15} /> Add Measurement
							</Button>
						</div>
					</div>
				</div>

				{chartData.length === 0 ? (
					<div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
						<span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300">
							<TrendingUp size={22} />
						</span>
						<p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
							No growth measurements added yet
						</p>
						<p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
							Tap &quot;Add Measurement&quot; above to log your baby&apos;s birth and monthly growth progression.
						</p>
					</div>
				) : (
					<CardContent className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
						{/* Current Growth Status Assessment Banner */}
						{latest && (
							<div className="mb-4 flex flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/40">
								<div className="flex items-center gap-2">
									<span className="grid size-7 shrink-0 place-items-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
										<Sparkles size={14} />
									</span>
									<div>
										<p className="text-xs font-bold text-slate-900 dark:text-slate-100">
											Growth Status ({latest.monthAge === 0 ? "At Birth" : `${latest.monthAge} Months Old`})
										</p>
										<p className="text-[11px] text-slate-500 dark:text-slate-400">
											Evaluated against WHO 50th percentile infant growth standards
										</p>
									</div>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									{/* Weight status badge */}
									<div className="flex items-center gap-1.5 rounded-xl border border-rose-200/80 bg-white px-2.5 py-1 text-xs shadow-2xs dark:border-rose-900/60 dark:bg-slate-900">
										<Scale size={13} className="text-rose-500" />
										<span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
											Weight: <strong className="text-slate-900 dark:text-white">{latest.weightKg} kg</strong>
										</span>
										<GrowthStatusBadge assessment={latestWeightAssessment} />
									</div>

									{/* Height status badge */}
									<div className="flex items-center gap-1.5 rounded-xl border border-teal-200/80 bg-white px-2.5 py-1 text-xs shadow-2xs dark:border-teal-900/60 dark:bg-slate-900">
										<Ruler size={13} className="text-teal-500" />
										<span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
											Length: <strong className="text-slate-900 dark:text-white">{latest.heightCm} cm</strong>
										</span>
										<GrowthStatusBadge assessment={latestHeightAssessment} />
									</div>
								</div>
							</div>
						)}

						<div className="h-72 sm:h-80 w-full min-w-0 max-w-full">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
									<XAxis
										dataKey="monthLabel"
										tick={{ fontSize: 11, fill: "#64748b" }}
										axisLine={{ stroke: "#cbd5e1" }}
									/>

									{/* Left Y-Axis for Weight */}
									{(chartMetric === "both" || chartMetric === "weight") && (
										<YAxis
											yAxisId="weight"
											domain={[2, "auto"]}
											tick={{ fontSize: 11, fill: "#E11D48" }}
											axisLine={{ stroke: "#E11D48" }}
											unit=" kg"
										/>
									)}

									{/* Right Y-Axis for Height */}
									{(chartMetric === "both" || chartMetric === "height") && (
										<YAxis
											yAxisId="height"
											orientation={chartMetric === "both" ? "right" : "left"}
											domain={[45, "auto"]}
											tick={{ fontSize: 11, fill: "#0D9488" }}
											axisLine={{ stroke: "#0D9488" }}
											unit=" cm"
										/>
									)}

									<Tooltip
										content={({ active, payload }) => {
											if (active && payload && payload.length) {
												const data = payload[0].payload;
												const weightAssessment =
													data.weightKg !== undefined && data.monthAge !== undefined
														? getWeightAssessment(data.weightKg, data.monthAge)
														: null;
												const heightAssessment =
													data.heightCm !== undefined && data.monthAge !== undefined
														? getHeightAssessment(data.heightCm, data.monthAge)
														: null;

												return (
													<div className="space-y-2 rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
														<p className="text-xs font-bold text-slate-900 dark:text-slate-100">
															Age: {data.monthLabel} {data.recordedDate ? `(${data.recordedDate})` : ""}
														</p>

														{data.weightKg !== undefined && (
															<div className="space-y-0.5">
																<div className="flex items-center justify-between gap-3">
																	<span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
																		Baby Weight: {data.weightKg} kg
																	</span>
																	<GrowthStatusBadge assessment={weightAssessment} />
																</div>
																<p className="text-[11px] text-slate-500 dark:text-slate-400">
																	~{(data.weightKg * 2.20462).toFixed(1)} lbs
																	{data.whoWeightKg && ` · WHO Avg: ${data.whoWeightKg} kg`}
																</p>
															</div>
														)}

														{data.heightCm !== undefined && (
															<div className="space-y-0.5">
																<div className="flex items-center justify-between gap-3">
																	<span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
																		Baby Length: {data.heightCm} cm
																	</span>
																	<GrowthStatusBadge assessment={heightAssessment} />
																</div>
																<p className="text-[11px] text-slate-500 dark:text-slate-400">
																	~{(data.heightCm / 2.54).toFixed(1)} in
																	{data.whoHeightCm && ` · WHO Avg: ${data.whoHeightCm} cm`}
																</p>
															</div>
														)}
													</div>
												);
											}
											return null;
										}}
									/>
									<Legend content={<CustomGrowthLegend />} />

									{/* Baby Weight Line */}
									{(chartMetric === "both" || chartMetric === "weight") && (
										<Line
											yAxisId="weight"
											type="monotone"
											dataKey="weightKg"
											name="Baby Weight (kg)"
											stroke="#E11D48"
											strokeWidth={3}
											dot={{ r: 4, fill: "#E11D48" }}
											activeDot={{ r: 6 }}
											connectNulls
										/>
									)}

									{/* WHO Weight Benchmark Line (Dashed) */}
									{showWhoBenchmark && (chartMetric === "both" || chartMetric === "weight") && (
										<Line
											yAxisId="weight"
											type="monotone"
											dataKey="whoWeightKg"
											name="WHO Avg Weight"
											stroke="#F43F5E"
											strokeWidth={2}
											strokeDasharray="4 4"
											dot={false}
										/>
									)}

									{/* Baby Height Line */}
									{(chartMetric === "both" || chartMetric === "height") && (
										<Line
											yAxisId="height"
											type="monotone"
											dataKey="heightCm"
											name="Baby Length (cm)"
											stroke="#0D9488"
											strokeWidth={3}
											dot={{ r: 4, fill: "#0D9488" }}
											activeDot={{ r: 6 }}
											connectNulls
										/>
									)}

									{/* WHO Height Benchmark Line (Dashed) */}
									{showWhoBenchmark && (chartMetric === "both" || chartMetric === "height") && (
										<Line
											yAxisId="height"
											type="monotone"
											dataKey="whoHeightCm"
											name="WHO Avg Length"
											stroke="#14B8A6"
											strokeWidth={2}
											strokeDasharray="4 4"
											dot={false}
										/>
									)}
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				)}
			</div>

			{/* Month-by-Month Log Item Rows (Styled similar to budget bill row) */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
						Measurement Records ({filteredRecords.length})
					</h3>
				</div>

				{filteredRecords.length === 0 ? (
					<div className="flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
						<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
							{searchQuery ? "No measurements matching your search." : "No growth records yet."}
						</p>
					</div>
				) : (
					<div className="space-y-2.5">
						{filteredRecords.map((r) => {
							const weightAssessment = getWeightAssessment(r.weightKg, r.monthAge);
							const heightAssessment = getHeightAssessment(r.heightCm, r.monthAge);

							return (
								<article
									key={r.id}
									data-page-palette-preserve
									className="budget-bill-card group relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5 overflow-hidden rounded-2xl border p-3 transition-all hover:-translate-y-0.5 sm:rounded-3xl sm:p-4 md:grid-cols-[auto_minmax(0,1fr)_480px] md:gap-x-4"
								>
									{/* Left Squircle Icon */}
									<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-rose-50 to-rose-100/70 text-rose-600 shadow-xs sm:size-11 dark:from-rose-950/60 dark:to-rose-900/40 dark:text-rose-400">
										<TrendingUp size={19} className="sm:size-[21px]" />
									</span>

									{/* Title and Subtitle Metadata */}
									<div className="min-w-0">
										<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
											<p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
												{r.monthAge === 0 ? "At Birth (0m)" : `${r.monthAge} months`}
											</p>
											<span className="inline-flex shrink-0 items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
												{r.monthAge === 0 ? "Birth Record" : "Checkup"}
											</span>
										</div>

										<div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
											<span className="inline-flex items-center gap-1">
												<Calendar size={12} />
												{r.recordedDate}
											</span>
											{r.headCircumferenceCm ? (
												<>
													<span aria-hidden="true">·</span>
													<span className="inline-flex items-center gap-1">
														<Ruler size={12} />
														Head {r.headCircumferenceCm} cm
													</span>
												</>
											) : null}
											{r.notes ? (
												<>
													<span aria-hidden="true">·</span>
													<span className="max-w-[200px] truncate italic sm:max-w-xs md:max-w-md">
														&ldquo;{r.notes}&rdquo;
													</span>
												</>
											) : null}
										</div>
									</div>

									{/* Right Side: Divider, Metrics, and Action Pill */}
									<div className="col-span-full flex min-w-0 items-center justify-between gap-3 border-t border-slate-100/80 pt-2.5 dark:border-slate-800/80 md:col-auto md:border-t-0 md:border-l md:border-slate-200 md:pl-4 md:pt-0 dark:md:border-slate-800">
										{/* Weight & Height Measurements */}
										<div className="flex items-center gap-3.5 sm:gap-6">
											<div className="flex items-center gap-1.5 w-[140px] sm:w-[165px] shrink-0">
												<span className="whitespace-nowrap text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
													{r.weightKg} kg
												</span>
												<GrowthStatusBadge assessment={weightAssessment} />
											</div>

											<div className="flex items-center gap-1.5 w-[140px] sm:w-[165px] shrink-0">
												<span className="whitespace-nowrap text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-slate-100">
													{r.heightCm} cm
												</span>
												<GrowthStatusBadge assessment={heightAssessment} />
											</div>
										</div>

										{/* Actions Pill Group (Edit & Delete) */}
										<div className="budget-bill-actions flex shrink-0 items-center gap-0.5 rounded-2xl border p-0.5">
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												disabled={submitting}
												className="budget-bill-action budget-bill-action--edit size-7.5 rounded-xl text-slate-500 transition-colors sm:size-8 dark:text-slate-400"
												aria-label={`Edit ${r.monthAge === 0 ? "birth" : `${r.monthAge} months`} record`}
												title="Edit measurement"
												onClick={() => {
													setEditingRecord(r);
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
												aria-label={`Delete ${r.monthAge === 0 ? "birth" : `${r.monthAge} months`} record`}
												title="Delete measurement"
												onClick={() => handleDelete(r.id)}
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
			</div>

			{/* Add/Edit Growth Record Modal */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent
					pagePalette={dialogPalette}
					data-page-palette-surface
					className="palette-dialog-panel max-h-[92vh] max-w-md overflow-hidden p-0 shadow-2xl sm:rounded-3xl"
				>
					<PaletteDialogHeader
						eyebrow="GROWTH TRACKER"
						title={editingRecord ? "Edit Measurement" : "Add Growth Record"}
						description="Track height and weight progression for each month."
						icon={<TrendingUp size={18} />}
						closeLabel="Close dialog"
					/>
					<form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-85px)] flex-col overflow-y-auto">
						<div className="space-y-3.5 p-5 sm:p-6 text-sm">
							<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Month / Age</span>
									<select
										name="monthAge"
										defaultValue={editingRecord?.monthAge ?? (sortedRecords.length ? sortedRecords[sortedRecords.length - 1].monthAge + 1 : 0)}
										className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
									>
										<option value="0">At Birth (0m)</option>
										{Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
											<option key={m} value={m}>
												{m} month{m > 1 ? "s" : ""}
											</option>
										))}
									</select>
								</label>

								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Measurement Date</span>
									<Input
										type="date"
										name="recordedDate"
										defaultValue={editingRecord?.recordedDate ?? new Date().toISOString().split("T")[0]}
										required
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>

								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Weight (kg)</span>
									<Input
										type="number"
										step="0.01"
										name="weightKg"
										placeholder="e.g. 5.85"
										defaultValue={editingRecord?.weightKg ?? ""}
										required
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>

								<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Length / Height (cm)</span>
									<Input
										type="number"
										step="0.1"
										name="heightCm"
										placeholder="e.g. 59.5"
										defaultValue={editingRecord?.heightCm ?? ""}
										required
										className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
									/>
								</label>
							</div>

							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Head Circumference (cm, Optional)</span>
								<Input
									type="number"
									step="0.1"
									name="headCircumferenceCm"
									placeholder="e.g. 38.5"
									defaultValue={editingRecord?.headCircumferenceCm ?? ""}
									className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</label>

							<label className="block space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								<span>Checkup Milestones &amp; Notes</span>
								<textarea
									name="notes"
									rows={2}
									placeholder="e.g. 4-month well-child visit, baby rolls over..."
									defaultValue={editingRecord?.notes ?? ""}
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
										{editingRecord ? null : <Plus size={16} className="shrink-0" />}
										<span>{editingRecord ? "Save changes" : "Add measurement"}</span>
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
