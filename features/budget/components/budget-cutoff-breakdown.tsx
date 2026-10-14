"use client";

import { useState, type CSSProperties } from "react";
import { CalendarClock, CalendarDays, ChevronDown, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSettings } from "@/components/settings/settings-context";
import { getPagePaletteStyles } from "@/components/settings/page-palettes";
import { cutoffDateRanges, cutoffDays, cutoffShortLabels, money, monthLabel } from "@/features/budget/lib/budget-utils";
import type { CutoffDay } from "@/features/budget/types";
import type { CutoffBillStat } from "@/features/budget/components/budget-summary";

export function BudgetCutoffBreakdown({
	selectedMonth,
	cutoffBudgets,
	cutoffBills,
	activeCutoff,
}: {
	selectedMonth: string;
	cutoffBudgets: Record<CutoffDay, number>;
	cutoffBills: Record<CutoffDay, CutoffBillStat>;
	activeCutoff: CutoffDay | null;
}) {
	const [isOpen, setIsOpen] = useState(true);
	const { settings } = useAppSettings();

	const configuredPalette = settings.pagePalettes["/budget"];
	const theme = configuredPalette && configuredPalette !== "default" ? configuredPalette : "rose";
	const paletteStyles = getPagePaletteStyles(theme);
	const headerStyle = { "--password-accent": paletteStyles.accent } as CSSProperties;

	return (
		<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
			{/* Accordion Header styled identically to Bills for October FeatureSectionHeader */}
			<div
				style={headerStyle}
				onClick={() => setIsOpen((prev) => !prev)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						setIsOpen((prev) => !prev);
					}
				}}
				role="button"
				tabIndex={0}
				aria-expanded={isOpen}
				className="password-library-header relative isolate flex min-h-[96px] cursor-pointer select-none items-center overflow-hidden rounded-3xl border px-4 py-4 text-slate-900 shadow-lg transition-all hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:px-5 sm:py-4"
			>
				{/* Circle vector orbits */}
				<span
					aria-hidden="true"
					className="password-library-orbit pointer-events-none absolute -right-5 -top-14 size-36 rounded-full"
				/>
				<span
					aria-hidden="true"
					className="password-library-orbit pointer-events-none absolute right-20 -top-20 size-48 rounded-full opacity-60"
				/>

				<div className="relative z-10 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 items-center gap-3.5">
						<span
							className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br ${paletteStyles.iconGradient} text-white shadow-md shadow-slate-900/10 ring-1 ring-inset ring-white/40`}
						>
							<CalendarClock size={20} />
						</span>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h2 className="text-base font-semibold tracking-normal text-slate-900 dark:text-white sm:text-lg">
									Cutoff Breakdown
								</h2>
								<span
									style={{
										backgroundColor: "color-mix(in oklab, var(--page-accent-base) 14%, transparent)",
										color: "var(--page-accent-base)",
									}}
									className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
								>
									4 periods (5, 15, 20, 30)
								</span>
							</div>
							<p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
								Budgets and scheduled bills for {monthLabel(selectedMonth)}
							</p>
						</div>
					</div>

					<div className="relative z-10 flex w-full items-center justify-end gap-2.5 sm:w-auto">
						<div
							className="grid size-9 shrink-0 place-items-center rounded-full border border-slate-200/80 bg-white/70 text-slate-600 shadow-sm transition-transform duration-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
							style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
							aria-hidden="true"
						>
							<ChevronDown size={17} />
						</div>
					</div>
				</div>
			</div>

			{/* Accordion Content: Full-width spacious row cards matching Bills of October */}
			{isOpen && (
				<CardContent className="mb-2 p-0 pt-2 sm:mx-4 sm:mb-2">
					<div className="space-y-2.5">
						{cutoffDays.map((day) => {
							const cutoffBudget = cutoffBudgets[day] ?? 0;
							const billsStat = cutoffBills[day] ?? { totalCents: 0, paidCents: 0, billCount: 0, paidCount: 0 };
							const cutoffRemaining = cutoffBudget - billsStat.totalCents;
							const isCurrent = activeCutoff === day;
							const spentPercent = cutoffBudget > 0
								? Math.round((billsStat.totalCents / cutoffBudget) * 100)
								: null;

							return (
								<article
									key={day}
									data-page-palette-preserve
									className={`budget-bill-card group relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5 overflow-hidden rounded-3xl border px-3.5 py-3 transition-all hover:-translate-y-0.5 sm:px-4 sm:py-3.5 md:grid-cols-[auto_minmax(0,1fr)_auto] ${
										isCurrent ? "ring-2 ring-[var(--page-accent-base)]/50" : ""
									}`}
								>
									{/* Circle vector orbit inside each card */}
									<span
										aria-hidden="true"
										className="password-library-orbit pointer-events-none absolute -right-4 -top-8 size-28 rounded-full opacity-35"
									/>

									{/* Logo / Icon matching active page palette */}
									<span
										className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br ${paletteStyles.iconGradient} text-white shadow-md shadow-slate-900/10 ring-1 ring-inset ring-white/30`}
									>
										<CalendarDays size={22} />
									</span>

									{/* Middle Info */}
									<div className="min-w-0">
										<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
											<p className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
												{cutoffShortLabels[day]}
											</p>
											<span
												style={{
													backgroundColor: "color-mix(in oklab, var(--page-accent-base) 14%, transparent)",
													color: "var(--page-accent-base)",
												}}
												className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
											>
												{cutoffDateRanges[day]}
											</span>
											{isCurrent && (
												<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-500/30">
													<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
													Active period
												</span>
											)}
										</div>

										<div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
											<span className="inline-flex items-center gap-1">
												<Receipt size={12} className="shrink-0" />
												{billsStat.billCount} scheduled bill{billsStat.billCount === 1 ? "" : "s"} ({billsStat.paidCount} paid)
											</span>
											<span aria-hidden="true">·</span>
											<span>
												Bills: <strong className="font-semibold text-slate-700 dark:text-slate-200">{money.format(billsStat.totalCents / 100)}</strong>
											</span>
											{cutoffBudget > 0 && (
												<>
													<span aria-hidden="true">·</span>
													<span className="font-medium text-slate-600 dark:text-slate-300">
														{spentPercent}% spent
													</span>
												</>
											)}
										</div>

										{/* Progress bar slot: consistent across all cards */}
										<div className="mt-2 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
											<div
												className={`h-full rounded-full transition-all duration-300 ${
													spentPercent !== null && spentPercent > 100
														? "bg-rose-500"
														: spentPercent !== null && spentPercent > 80
															? "bg-amber-500"
															: cutoffBudget > 0
																? "bg-emerald-500"
																: "bg-transparent"
												}`}
												style={{ width: cutoffBudget > 0 ? `${Math.min(100, spentPercent ?? 0)}%` : "0%" }}
											/>
										</div>
									</div>

									{/* Right Section: Budget & Status Badge */}
									<div className="col-span-full flex min-w-0 items-center justify-between gap-3 border-t border-slate-100/80 pt-2.5 dark:border-slate-800/80 md:col-auto md:border-t-0 md:border-l md:border-slate-200 md:pl-4 md:pt-0 dark:md:border-slate-700">
										<div className="text-left md:text-right">
											<p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Budget</p>
											<span className="whitespace-nowrap text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
												{money.format(cutoffBudget / 100)}
											</span>
										</div>
										<span
											className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap sm:px-3 ${
												cutoffRemaining < 0
													? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
													: cutoffRemaining === 0 && cutoffBudget === 0
														? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
														: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
											}`}
										>
											<CalendarDays size={12} className="shrink-0" />
											{cutoffRemaining < 0
												? `${money.format(Math.abs(cutoffRemaining) / 100)} over`
												: `${money.format(cutoffRemaining / 100)} left`}
										</span>
									</div>
								</article>
							);
						})}
					</div>
				</CardContent>
			)}
		</Card>
	);
}
