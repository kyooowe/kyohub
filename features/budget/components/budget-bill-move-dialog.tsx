"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CalendarSync, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { useAppSettings } from "@/components/settings/settings-context";
import { cutoffDateRanges, cutoffDays, cutoffShortLabels, money, monthLabel } from "@/features/budget/lib/budget-utils";
import type { BillFrequency, BudgetBill, CutoffDay } from "@/features/budget/types";

const weekDayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isCutoffPast(cutoffDay: CutoffDay, targetYear: number, targetMonthIndex: number): boolean {
	const today = new Date();
	const todayYear = today.getFullYear();
	const todayMonth = today.getMonth();
	const todayDate = today.getDate();

	if (targetYear < todayYear) return true;
	if (targetYear > todayYear) return false;
	if (targetMonthIndex < todayMonth) return true;
	if (targetMonthIndex > todayMonth) return false;
	return cutoffDay < todayDate;
}

function BudgetBillMoveDialogContent({
	bill,
	occurrenceMonth,
	onOpenChange,
	onMoveConfirm,
	submitting,
}: {
	bill: BudgetBill;
	occurrenceMonth: string;
	onOpenChange: (open: boolean) => void;
	onMoveConfirm: (bill: BudgetBill, targetMonthKey: string, targetDueDay: CutoffDay, frequency: BillFrequency) => Promise<void>;
	submitting: boolean;
}) {
	const { settings } = useAppSettings();
	const configuredPalette = settings.pagePalettes["/budget"];
	const dialogPalette = configuredPalette === "default" ? "rose" : configuredPalette;

	const today = useMemo(() => new Date(), []);
	const currentYear = today.getFullYear();
	const currentMonthIndex = today.getMonth();

	const [year, setYear] = useState<number>(() => {
		const [y, m] = (occurrenceMonth || "").split("-").map(Number);
		if (y && m && (y > currentYear || (y === currentYear && m >= currentMonthIndex + 1))) {
			return y;
		}
		return currentYear;
	});
	const [monthIndex, setMonthIndex] = useState<number>(() => {
		const [y, m] = (occurrenceMonth || "").split("-").map(Number);
		if (y && m && (y > currentYear || (y === currentYear && m >= currentMonthIndex + 1))) {
			return m - 1;
		}
		return currentMonthIndex;
	});
	const [selectedDueDay, setSelectedDueDay] = useState<CutoffDay>(() => {
		const due = bill.dueDay;
		const initYear = (() => {
			const [y, m] = (occurrenceMonth || "").split("-").map(Number);
			if (y && m && (y > currentYear || (y === currentYear && m >= currentMonthIndex + 1))) return y;
			return currentYear;
		})();
		const initMonth = (() => {
			const [y, m] = (occurrenceMonth || "").split("-").map(Number);
			if (y && m && (y > currentYear || (y === currentYear && m >= currentMonthIndex + 1))) return m - 1;
			return currentMonthIndex;
		})();

		if ((due === 5 || due === 15 || due === 20 || due === 30) && !isCutoffPast(due, initYear, initMonth)) {
			return due;
		}
		const firstFuture = cutoffDays.find((d) => !isCutoffPast(d, initYear, initMonth));
		return firstFuture ?? 15;
	});
	const [selectedFrequency, setSelectedFrequency] = useState<BillFrequency>(() => bill.frequency);

	const targetMonthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

	const canGoPrevMonth = !(year < currentYear || (year === currentYear && monthIndex <= currentMonthIndex));

	const { firstDayIndex, daysInMonth } = useMemo(() => {
		const firstDay = new Date(year, monthIndex, 1).getDay();
		const days = new Date(year, monthIndex + 1, 0).getDate();
		return { firstDayIndex: firstDay, daysInMonth: days };
	}, [year, monthIndex]);

	function handlePrevMonth() {
		if (!canGoPrevMonth || submitting) return;
		const newYear = monthIndex === 0 ? year - 1 : year;
		const newMonth = monthIndex === 0 ? 11 : monthIndex - 1;
		setYear(newYear);
		setMonthIndex(newMonth);

		if (isCutoffPast(selectedDueDay, newYear, newMonth)) {
			const nextValid = cutoffDays.find((d) => !isCutoffPast(d, newYear, newMonth));
			if (nextValid) {
				setSelectedDueDay(nextValid);
			}
		}
	}

	function handleNextMonth() {
		if (submitting) return;
		if (monthIndex === 11) {
			setYear((y) => y + 1);
			setMonthIndex(0);
		} else {
			setMonthIndex((m) => m + 1);
		}
	}

	const isCutoffSelectedPast = isCutoffPast(selectedDueDay, year, monthIndex);

	async function handleConfirm() {
		if (isCutoffSelectedPast) return;
		await onMoveConfirm(bill, targetMonthKey, selectedDueDay, selectedFrequency);
	}

	const isCutoff = (day: number): day is CutoffDay => day === 5 || day === 15 || day === 20 || day === 30;

	return (
		<DialogContent
			pagePalette={dialogPalette}
			data-page-palette-surface
			className="palette-dialog-panel flex max-h-[min(90dvh,720px)] w-[calc(100%-1.5rem)] max-w-md flex-col overflow-hidden rounded-2xl border-rose-200 bg-white p-0 shadow-2xl shadow-rose-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:w-full sm:rounded-3xl"
		>
			<div className="shrink-0">
				<PaletteDialogHeader
					eyebrow="BUDGET PLANNER"
					title="Move bill schedule"
					description={`Reschedule "${bill.title}" to another month or cutoff date.`}
					icon={<CalendarSync size={19} />}
					closeLabel="Close dialog"
					closeDisabled={submitting}
				/>
			</div>

			<div className="flex-1 space-y-3.5 overflow-y-auto px-4 py-3 sm:space-y-4 sm:px-6 sm:py-4">
				{/* Bill preview bar */}
				<div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/50">
					<div className="min-w-0 pr-2">
						<p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{bill.title}</p>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Current: {monthLabel(occurrenceMonth)} · Due day {bill.dueDay ?? 30}
						</p>
					</div>
					<span className="shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">
						{money.format(bill.amountCents / 100)}
					</span>
				</div>

				{/* Calendar month navigation */}
				<div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-3 py-1.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={handlePrevMonth}
						disabled={submitting || !canGoPrevMonth}
						aria-label="Previous month"
						className={`size-8 rounded-xl text-slate-600 dark:text-slate-300 ${
							canGoPrevMonth
								? "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
								: "opacity-30 cursor-not-allowed"
						}`}
					>
						<ChevronLeft size={16} />
					</Button>
					<span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
						{monthLabel(targetMonthKey)}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={handleNextMonth}
						disabled={submitting}
						aria-label="Next month"
						className="size-8 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
					>
						<ChevronRight size={16} />
					</Button>
				</div>

				{/* Calendar grid: available days are 5, 15, 20, 30 only, past dates disabled */}
				<div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/30">
					<div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500">
						{weekDayLabels.map((w) => (
							<div key={w} className="py-0.5">
								{w}
							</div>
						))}
					</div>

					<div className="grid grid-cols-7 gap-1">
						{/* Empty cells for offset */}
						{Array.from({ length: firstDayIndex }).map((_, i) => (
							<div key={`empty-${i}`} className="h-7 sm:h-8" />
						))}

						{/* Days of month */}
						{Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
							const isCutoffDay = isCutoff(day);
							const isPast = isCutoffDay && isCutoffPast(day, year, monthIndex);
							const selectable = isCutoffDay && !isPast;
							const isSelected = selectable && selectedDueDay === day;

							if (!isCutoffDay) {
								return (
									<div
										key={day}
										aria-hidden="true"
										className="grid h-7 sm:h-8 place-items-center rounded-xl text-[11px] sm:text-xs text-slate-300/70 select-none dark:text-slate-700/70"
									>
										{day}
									</div>
								);
							}

							if (isPast) {
								return (
									<div
										key={day}
										aria-disabled="true"
										title={`Cutoff day ${day} has already passed`}
										className="grid h-7 sm:h-8 place-items-center rounded-xl text-[11px] sm:text-xs font-semibold text-slate-300 line-through select-none dark:text-slate-600 cursor-not-allowed"
									>
										{day}
									</div>
								);
							}

							return (
								<button
									key={day}
									type="button"
									onClick={() => setSelectedDueDay(day)}
									disabled={submitting}
									aria-label={`Select cutoff day ${day}`}
									className={`grid h-7 sm:h-8 place-items-center rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
										isSelected
											? "bg-[var(--page-accent-base,#B66F57)] text-white shadow-md ring-2 ring-offset-1 ring-[var(--page-accent-base,#B66F57)] scale-105"
											: "border border-rose-300/70 bg-rose-50 text-rose-800 hover:bg-rose-100 hover:scale-105 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
									}`}
								>
									{day}
								</button>
							);
						})}
					</div>

					{/* Quick cutoff chips */}
					<div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-200/80 pt-2 dark:border-slate-800">
						<span className="text-[10px] font-medium text-slate-400">Available cutoffs:</span>
						<div className="flex flex-wrap items-center gap-1">
							{cutoffDays.map((d) => {
								const isPast = isCutoffPast(d, year, monthIndex);
								const isSelected = selectedDueDay === d;

								if (isPast) {
									return (
										<span
											key={d}
											title={`Cutoff day ${d} has passed`}
											className="rounded-full border border-slate-200/60 bg-slate-100/60 px-2 py-0.5 text-[10px] font-medium text-slate-400 line-through select-none cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-600"
										>
											{d}th
										</span>
									);
								}

								return (
									<button
										key={d}
										type="button"
										onClick={() => setSelectedDueDay(d)}
										disabled={submitting}
										className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
											isSelected
												? "bg-[var(--page-accent-base,#B66F57)] text-white shadow-xs"
												: "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
										}`}
									>
										{d}th
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* Target summary banner */}
				<div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/70 p-2.5 dark:border-rose-900/50 dark:bg-rose-950/30 sm:gap-3 sm:p-3">
					<span className="grid size-8 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300 sm:size-9">
						<CalendarDays size={17} />
					</span>
					<div className="min-w-0 flex-1">
						<p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 sm:text-xs">New scheduled date:</p>
						<p className="text-xs font-bold text-rose-950 dark:text-rose-100 sm:text-sm">
							{monthLabel(targetMonthKey, { month: "short", year: "numeric" })} {selectedDueDay} · {cutoffShortLabels[selectedDueDay]}{" "}
							<span className="text-[10px] font-normal text-rose-700/80 dark:text-rose-300/80 sm:text-xs">
								({cutoffDateRanges[selectedDueDay]})
							</span>
						</p>
					</div>
				</div>

				{/* Frequency selection if currently recurring */}
				{bill.frequency === "recurring" && (
					<div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/40 sm:p-3">
						<span className="font-semibold text-slate-700 dark:text-slate-300">Billing type:</span>
						<div className="grid grid-cols-2 gap-2 pt-0.5">
							<button
								type="button"
								onClick={() => setSelectedFrequency("one-time")}
								className={`flex flex-col rounded-xl border p-2 text-left transition-all cursor-pointer ${
									selectedFrequency === "one-time"
										? "border-[var(--page-accent-base,#B66F57)] bg-white shadow-xs font-semibold ring-1 ring-[var(--page-accent-base,#B66F57)] dark:bg-slate-800"
										: "border-slate-200 bg-transparent text-slate-500 hover:bg-white dark:border-slate-700 dark:text-slate-400"
								}`}
							>
								<span className="font-bold text-slate-900 dark:text-slate-100">One-time</span>
								<span className="text-[10px] text-slate-400">For {monthLabel(targetMonthKey, { month: "short" })} only</span>
							</button>
							<button
								type="button"
								onClick={() => setSelectedFrequency("recurring")}
								className={`flex flex-col rounded-xl border p-2 text-left transition-all cursor-pointer ${
									selectedFrequency === "recurring"
										? "border-[var(--page-accent-base,#B66F57)] bg-white shadow-xs font-semibold ring-1 ring-[var(--page-accent-base,#B66F57)] dark:bg-slate-800"
										: "border-slate-200 bg-transparent text-slate-500 hover:bg-white dark:border-slate-700 dark:text-slate-400"
								}`}
							>
								<span className="font-bold text-slate-900 dark:text-slate-100">Recurring</span>
								<span className="text-[10px] text-slate-400">Day {selectedDueDay} every month</span>
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Footer buttons */}
			<div className="palette-dialog-footer shrink-0 flex items-center justify-end gap-2 p-4 sm:px-6">
				<Button
					data-page-palette-secondary
					type="button"
					variant="outline"
					onClick={() => onOpenChange(false)}
					disabled={submitting}
					className="palette-dialog-footer-button border font-medium transition-colors duration-150"
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={handleConfirm}
					disabled={submitting || isCutoffSelectedPast}
					className="palette-action-button palette-dialog-footer-button border font-medium transition-colors duration-150"
				>
					{submitting ? (
						<>
							<Loader2 size={14} className="animate-spin" />
							Moving...
						</>
					) : (
						"Move bill"
					)}
				</Button>
			</div>
		</DialogContent>
	);
}

export function BudgetBillMoveDialog({
	open,
	onOpenChange,
	bill,
	occurrenceMonth,
	onMoveConfirm,
	submitting,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bill: BudgetBill | null;
	occurrenceMonth: string;
	onMoveConfirm: (bill: BudgetBill, targetMonthKey: string, targetDueDay: CutoffDay, frequency: BillFrequency) => Promise<void>;
	submitting: boolean;
}) {
	if (!bill) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{open && (
				<BudgetBillMoveDialogContent
					key={`${bill.id}-${occurrenceMonth}`}
					bill={bill}
					occurrenceMonth={occurrenceMonth}
					onOpenChange={onOpenChange}
					onMoveConfirm={onMoveConfirm}
					submitting={submitting}
				/>
			)}
		</Dialog>
	);
}
