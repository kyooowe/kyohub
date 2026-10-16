import type { FormEvent, Ref } from "react";
import { CalendarDays, Loader2, Pencil, Plus, ReceiptText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/components/settings/settings-context";
import { activeCutoffDayForDate, centsFromInput, cutoffDateRanges, cutoffDays, cutoffShortLabels, formatAmountInput, formatAmountInputChange, money, monthLabel } from "@/features/budget/lib/budget-utils";
import { budgetCategories, budgetCategoryLabels, isBudgetCategory, type BillFrequency, type BudgetCategory, type CutoffDay } from "@/features/budget/types";

function ActionCard({ icon: Icon, title, description, buttonLabel, onClick }: {
	icon: typeof CalendarDays;
	title: string;
	description: string;
	buttonLabel: string;
	onClick: () => void;
}) {
	return <button data-budget-outline="surface" type="button" onClick={onClick} className="planner-action-card group relative flex min-h-24 sm:min-h-28 w-full items-center justify-between gap-3 overflow-hidden rounded-3xl border p-3.5 text-left transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-accent-base)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 sm:gap-4 sm:p-5">
		<span className="relative z-10 flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
			<span className="planner-action-icon grid size-11 sm:size-12 shrink-0 place-items-center rounded-2xl text-white transition-transform group-hover:scale-105"><Icon size={21} /></span>
			<span className="min-w-0 flex-1">
				<span className="planner-action-title block text-sm sm:text-base font-bold tracking-tight leading-snug text-slate-900 dark:text-slate-100">{title}</span>
				<span className="planner-action-description mt-0.5 block text-xs leading-normal text-slate-600 dark:text-slate-300">{description}</span>
			</span>
		</span>
		<span className="planner-action-button relative z-10 inline-flex min-h-9 sm:min-h-10 shrink-0 items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all group-hover:-translate-y-0.5 sm:text-sm">
			<span className="planner-action-button-icon grid size-5 sm:size-6 place-items-center rounded-full"><Plus size={13} strokeWidth={2.5} /></span>
			<span className="whitespace-nowrap">{buttonLabel}</span>
		</span>
	</button>;
}

export function BudgetForms({
	budgetMode,
	selectedMonth,
	budgetInput,
	onBudgetInputChange,
	onSubmitBudget,
	cutoffInputs,
	onCutoffInputChange,
	onSubmitCutoffBudget,
	billTitle,
	onBillTitleChange,
	billCategory,
	onBillCategoryChange,
	billAmount,
	onBillAmountChange,
	billDueDay,
	onBillDueDayChange,
	billFrequency,
	onBillFrequencyChange,
	editingBill,
	submitting,
	error,
	billFormRef,
	onSubmitBill,
	onCancelBill,
	budgetDialogOpen,
	onBudgetDialogOpenChange,
	billDialogOpen,
	onBillDialogOpenChange,
}: {
	budgetMode: "monthly" | "cutoff";
	selectedMonth: string;
	budgetInput: string;
	onBudgetInputChange: (value: string) => void;
	onSubmitBudget: (event: FormEvent<HTMLFormElement>) => void;
	cutoffInputs: Record<CutoffDay, string>;
	onCutoffInputChange: (day: CutoffDay, value: string) => void;
	onSubmitCutoffBudget: (event: FormEvent<HTMLFormElement>) => void;
	billTitle: string;
	onBillTitleChange: (value: string) => void;
	billCategory: BudgetCategory;
	onBillCategoryChange: (value: BudgetCategory) => void;
	billAmount: string;
	onBillAmountChange: (value: string) => void;
	billDueDay: string;
	onBillDueDayChange: (value: string) => void;
	billFrequency: BillFrequency;
	onBillFrequencyChange: (value: BillFrequency) => void;
	editingBill: boolean;
	submitting: boolean;
	error: string;
	billFormRef: Ref<HTMLFormElement>;
	onSubmitBill: (event: FormEvent<HTMLFormElement>) => void;
	onCancelBill: () => void;
	budgetDialogOpen: boolean;
	onBudgetDialogOpenChange: (open: boolean) => void;
	billDialogOpen: boolean;
	onBillDialogOpenChange: (open: boolean) => void;
}) {
	const { settings } = useAppSettings();
	const configuredPalette = settings.pagePalettes["/budget"];
	const dialogPalette = configuredPalette === "default" ? "rose" : configuredPalette;
	const totalCutoffCents = cutoffDays.reduce((sum, day) => sum + (centsFromInput(cutoffInputs[day] ?? "") ?? 0), 0);

	return <>
		<div className="grid gap-4 lg:grid-cols-2">
			<ActionCard
				icon={CalendarDays}
				title={budgetMode === "cutoff" ? "Set cutoff budgets" : "Set monthly budget"}
				description={budgetMode === "cutoff" ? "Set individual budgets for cutoffs (5, 15, 20, 30)." : "Save a separate budget for each month."}
				buttonLabel={budgetMode === "cutoff" ? "Set cutoffs" : "Add budget"}
				onClick={() => onBudgetDialogOpenChange(true)}
			/>
			<ActionCard icon={ReceiptText} title="Add a bill" description="Choose the due day and billing schedule." buttonLabel="Add bill" onClick={() => { onCancelBill(); onBillDialogOpenChange(true); }} />
		</div>
		<Dialog open={budgetDialogOpen} onOpenChange={onBudgetDialogOpenChange}>
			<DialogContent
				pagePalette={dialogPalette}
				data-page-palette-surface
				className="palette-dialog-panel flex max-h-[min(90dvh,680px)] w-[calc(100%-1.5rem)] max-w-md flex-col overflow-hidden rounded-2xl border-rose-200 bg-white p-0 shadow-2xl shadow-rose-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:w-full sm:rounded-3xl"
			>
				<div className="shrink-0">
					<PaletteDialogHeader
						eyebrow="BUDGET PLANNER"
						title={budgetMode === "cutoff" ? "Set budget per cutoff" : "Set monthly budget"}
						description={budgetMode === "cutoff" ? `Set cutoff budgets for ${monthLabel(selectedMonth)}.` : `Save a budget for ${monthLabel(selectedMonth)}.`}
						icon={<CalendarDays size={18} />}
						closeLabel="Close dialog"
						closeDisabled={submitting}
					/>
				</div>
				{budgetMode === "cutoff" ? (
					<form onSubmit={onSubmitCutoffBudget} className="flex flex-1 flex-col overflow-hidden">
						<div className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
							{error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">{error}</p>}
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Enter budget amounts for each cutoff period (5th, 15th, 20th, and 30th).
							</p>
							<div className="space-y-2.5">
								{cutoffDays.map((day) => (
									<div key={day} className="rounded-xl border border-rose-100 bg-rose-50/40 p-2.5 dark:border-slate-800 dark:bg-slate-950/40">
										<div className="mb-1.5 flex items-center justify-between">
											<span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
												<span className="grid size-5 place-items-center rounded-md bg-rose-500/10 text-[10px] font-bold text-rose-700 dark:text-rose-300">
													{day}
												</span>
												{cutoffShortLabels[day]}
											</span>
											<span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
												{cutoffDateRanges[day]}
											</span>
										</div>
										<Input
											inputMode="decimal"
											type="text"
											value={cutoffInputs[day] ?? ""}
											onChange={(event) => {
												const input = event.currentTarget;
												const formatted = formatAmountInputChange(input.value, input.selectionStart ?? input.value.length);
												onCutoffInputChange(day, formatted.value);
												requestAnimationFrame(() => {
													input.setSelectionRange(formatted.cursor, formatted.cursor);
												});
											}}
											onBlur={(event) => onCutoffInputChange(day, formatAmountInput(event.target.value))}
											placeholder="0.00"
											className="h-9 border-rose-200 bg-white text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
										/>
									</div>
								))}
							</div>
							<div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-950">
								<span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Total monthly budget</span>
								<span className="text-sm font-bold text-rose-900 dark:text-rose-200">
									{money.format(totalCutoffCents / 100)}
								</span>
							</div>
						</div>
						<div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/40 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 sm:py-3.5">
							<Button
								data-page-palette-secondary
								type="button"
								disabled={submitting}
								variant="outline"
								onClick={() => onBudgetDialogOpenChange(false)}
								className="palette-dialog-footer-button border border-slate-200 bg-white font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={submitting}
								className="palette-action-button palette-dialog-footer-button border font-medium text-white shadow-md hover:opacity-95 disabled:opacity-50"
							>
								{submitting && <Loader2 size={14} className="animate-spin" />}Save cutoffs
							</Button>
						</div>
					</form>
				) : (
					<form onSubmit={onSubmitBudget} className="flex flex-1 flex-col overflow-hidden">
						<div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
							{error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">{error}</p>}
							<label className="block space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
								Amount
								<Input required inputMode="decimal" type="text" value={budgetInput} onChange={(event) => {
									const input = event.currentTarget;
									const formatted = formatAmountInputChange(input.value, input.selectionStart ?? input.value.length);
									onBudgetInputChange(formatted.value);
									requestAnimationFrame(() => {
										input.setSelectionRange(formatted.cursor, formatted.cursor);
									});
								}} onBlur={(event) => onBudgetInputChange(formatAmountInput(event.target.value))} placeholder="e.g. 2,500.00" className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
							</label>
						</div>
						<div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/40 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 sm:py-3.5">
							<Button
								data-page-palette-secondary
								type="button"
								disabled={submitting}
								variant="outline"
								onClick={() => onBudgetDialogOpenChange(false)}
								className="palette-dialog-footer-button border border-slate-200 bg-white font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={submitting}
								className="palette-action-button palette-dialog-footer-button border font-medium text-white shadow-md hover:opacity-95 disabled:opacity-50"
							>
								{submitting && <Loader2 size={14} className="animate-spin" />}Save budget
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
		<Dialog open={billDialogOpen} onOpenChange={onBillDialogOpenChange}>
			<DialogContent
				pagePalette={dialogPalette}
				data-page-palette-surface
				className="palette-dialog-panel flex max-h-[min(90dvh,680px)] w-[calc(100%-1.5rem)] max-w-lg flex-col overflow-hidden rounded-2xl border-rose-200 bg-white p-0 shadow-2xl shadow-rose-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:w-full sm:rounded-3xl"
			>
				<div className="shrink-0">
					<PaletteDialogHeader
						eyebrow="BILL SCHEDULE"
						title={editingBill ? "Update bill" : "Add a bill"}
						description="Choose the due day and billing schedule."
						icon={<ReceiptText size={18} />}
						closeLabel="Close dialog"
						closeDisabled={submitting}
					/>
				</div>
				<form ref={billFormRef} onSubmit={onSubmitBill} className="flex flex-1 flex-col overflow-hidden">
					<div className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
						{error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">{error}</p>}
						<div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
							<label className="space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								Bill name
								<Input required value={billTitle} onChange={(event) => onBillTitleChange(event.target.value)} placeholder={billCategory === "daily-expense" ? "e.g. Lunch with team, Coffee" : "e.g. Rent"} className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
							</label>
							<label className="space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								Category
								<select
									required
									disabled={editingBill && billCategory === "daily-expense"}
									value={billCategory}
									onChange={(event) => {
										const val = event.target.value;
										if (isBudgetCategory(val)) {
											onBillCategoryChange(val);
											if (val === "daily-expense") {
												const activeCutoffDay = activeCutoffDayForDate(new Date());
												onBillDueDayChange(String(activeCutoffDay));
												onBillFrequencyChange("one-time");
											}
										}
									}}
									className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
								>
									{budgetCategories.filter((category) => category !== "grocery").map((category) => <option key={category} value={category}>{budgetCategoryLabels[category]}</option>)}
								</select>
							</label>
							<label className="space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
								Amount
								<Input required inputMode="decimal" type="text" value={billAmount} onChange={(event) => {
									const input = event.currentTarget;
									const formatted = formatAmountInputChange(input.value, input.selectionStart ?? input.value.length);
									onBillAmountChange(formatted.value);
									requestAnimationFrame(() => {
										input.setSelectionRange(formatted.cursor, formatted.cursor);
									});
								}} onBlur={(event) => onBillAmountChange(formatAmountInput(event.target.value))} placeholder="e.g. 900.00" className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
							</label>
							{billCategory === "daily-expense" ? (
								<div className="space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									<span>Cutoff date</span>
									<div className="flex h-10 w-full items-center justify-between rounded-md border border-violet-200 bg-violet-50/70 px-3 text-xs font-semibold text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200">
										<span>{(billDueDay || activeCutoffDayForDate(new Date()))}th Cutoff ({cutoffDateRanges[(Number(billDueDay) || activeCutoffDayForDate(new Date())) as CutoffDay] ?? ""})</span>
										<span className="rounded bg-violet-200/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-900 dark:bg-violet-900 dark:text-violet-100">AUTOMATIC</span>
									</div>
								</div>
							) : (
								<label className="space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
									Due day
									<select required value={billDueDay} onChange={(event) => onBillDueDayChange(event.target.value)} className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
										<option value="">Choose a due day</option>
										<option value="5">5th day of the month</option>
										<option value="15">15th day of the month</option>
										<option value="20">20th day of the month</option>
										<option value="30">30th day of the month</option>
									</select>
								</label>
							)}
							{billCategory === "daily-expense" ? (
								<div className="space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:col-span-2 sm:text-sm">
									<span>Billing schedule</span>
									<div className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
										<span>Current cutoff expense · Auto-marked as paid</span>
										<span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">PAID</span>
									</div>
								</div>
							) : (
								<label className="space-y-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 sm:col-span-2 sm:text-sm">
									Billing schedule
									<select value={billFrequency} onChange={(event) => onBillFrequencyChange(event.target.value as BillFrequency)} className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
										<option value="recurring">Recurring Monthly</option>
										<option value="one-time">This month only</option>
									</select>
								</label>
							)}
							{billCategory === "daily-expense" && (
								<div className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/70 p-2.5 text-xs text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">
									<ShoppingBag size={15} className="shrink-0 text-violet-600 dark:text-violet-400" />
									<span>Auto-marked as paid and automatically deducts from your current <strong>{(billDueDay || activeCutoffDayForDate(new Date()))}th cutoff</strong> budget.</span>
								</div>
							)}
						</div>
					</div>
					<div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/40 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6 sm:py-3.5">
						<Button
							data-page-palette-secondary
							type="button"
							disabled={submitting}
							variant="outline"
							onClick={() => {
								onCancelBill();
								onBillDialogOpenChange(false);
							}}
							className="palette-dialog-footer-button border border-slate-200 bg-white font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={submitting}
							className="palette-action-button palette-dialog-footer-button border font-medium text-white shadow-md transition-colors hover:opacity-95 disabled:opacity-50"
						>
							{submitting ? (
								<>
									<Loader2 size={14} className="animate-spin" />
									{editingBill ? "Saving changes…" : "Adding bill…"}
								</>
							) : (
								<>
									{editingBill ? <Pencil size={14} /> : <Plus size={14} />}
									{editingBill ? "Save changes" : "Add bill"}
								</>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	</>;
}
