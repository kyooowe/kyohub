import type { FormEvent, Ref } from "react";
import { CalendarDays, Loader2, Pencil, Plus, ReceiptText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatAmountInput, formatAmountInputChange } from "@/features/budget/lib/budget-utils";
import { budgetCategories, budgetCategoryLabels, isBudgetCategory, type BillFrequency, type BudgetCategory } from "@/features/budget/types";

function ActionCard({ icon: Icon, title, description, buttonLabel, onClick }: {
	icon: typeof CalendarDays;
	title: string;
	description: string;
	buttonLabel: string;
	onClick: () => void;
}) {
	return <button type="button" onClick={onClick} className="group relative flex min-h-28 w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-rose-200 bg-linear-to-r from-rose-50 via-rose-50 to-white p-4 text-left shadow-sm shadow-rose-100/70 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:border-rose-900/70 dark:from-rose-950/50 dark:via-rose-950/70 dark:to-rose-950/50 dark:shadow-black/20 dark:hover:border-rose-700 dark:hover:shadow-rose-950/40 dark:focus-visible:ring-rose-400 dark:focus-visible:ring-offset-slate-950 sm:p-5">
		<span className="flex min-w-0 items-center gap-3.5">
			<span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-rose-600 to-rose-700 text-white shadow-md shadow-rose-300/50 transition-transform group-hover:scale-105 dark:from-rose-600 dark:to-rose-600 dark:shadow-rose-950/60"><Icon size={21} /></span>
			<span className="min-w-0">
				<span className="block truncate text-base font-semibold tracking-tight text-rose-950 dark:text-rose-50">{title}</span>
				<span className="mt-1 block text-xs text-rose-800/75 dark:text-rose-200/75">{description}</span>
			</span>
		</span>
		<span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-700 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-300/50 transition-colors group-hover:bg-rose-800 dark:bg-rose-700 dark:shadow-rose-950/60 dark:group-hover:bg-rose-600 sm:px-4 sm:text-sm"><Plus size={15} />{buttonLabel}</span>
	</button>;
}

export function BudgetForms({ budgetInput, onBudgetInputChange, onSubmitBudget, billTitle, onBillTitleChange, billCategory, onBillCategoryChange, billAmount, onBillAmountChange, billDueDay, onBillDueDayChange, billFrequency, onBillFrequencyChange, editingBill, submitting, error, billFormRef, onSubmitBill, onCancelBill, budgetDialogOpen, onBudgetDialogOpenChange, billDialogOpen, onBillDialogOpenChange }: {
	budgetInput: string;
	onBudgetInputChange: (value: string) => void;
	onSubmitBudget: (event: FormEvent<HTMLFormElement>) => void;
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
	return <>
		<div className="grid gap-4 lg:grid-cols-2">
			<ActionCard icon={CalendarDays} title="Set monthly budget" description="Save a separate budget for each month." buttonLabel="Add budget" onClick={() => onBudgetDialogOpenChange(true)} />
			<ActionCard icon={ReceiptText} title={editingBill ? "Update a bill" : "Add a bill"} description="Choose the due day and billing schedule." buttonLabel={editingBill ? "Edit bill" : "Add bill"} onClick={() => onBillDialogOpenChange(true)} />
		</div>
		<Dialog open={budgetDialogOpen} onOpenChange={onBudgetDialogOpenChange}>
			<DialogContent className="max-w-md overflow-hidden border-rose-200 bg-white p-0 shadow-2xl shadow-rose-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:rounded-2xl">
				<div className="dialog-palette-header flex items-start justify-between border-b border-rose-100 bg-linear-to-r from-rose-50 to-rose-50/60 px-6 py-5 dark:border-rose-900 dark:from-rose-950 dark:to-rose-900">
					<div className="flex items-start gap-3.5">
						<div className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-rose-600 to-rose-700 text-white shadow-sm shadow-rose-200 dark:shadow-rose-950/60"><CalendarDays size={18} /></div>
						<div><DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Set monthly budget</DialogTitle><DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-300">Save a separate budget for each month.</DialogDescription></div>
					</div>
					<DialogClose disabled={submitting} aria-label="Close dialog" className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/80 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:hover:bg-slate-700 dark:hover:text-rose-200"><X size={17} /></DialogClose>
				</div>
				<form onSubmit={onSubmitBudget} className="space-y-4 px-6 py-5">
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
					<div className="flex justify-end gap-2 border-t border-rose-100 pt-4 dark:border-slate-700">
						<Button type="button" disabled={submitting} variant="outline" onClick={() => onBudgetDialogOpenChange(false)} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Cancel</Button>
						<Button type="submit" disabled={submitting} className="h-10 rounded-xl bg-rose-700 text-white shadow-md shadow-rose-500/20 transition-all hover:-translate-y-0.5 hover:bg-rose-800 hover:shadow-lg dark:bg-rose-700 dark:hover:bg-rose-600">{submitting && <Loader2 size={16} className="animate-spin" />}Save budget</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
		<Dialog open={billDialogOpen} onOpenChange={onBillDialogOpenChange}>
			<DialogContent className="max-w-lg overflow-hidden border-rose-200 bg-white p-0 shadow-2xl shadow-rose-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:rounded-2xl">
				<div className="dialog-palette-header flex items-start justify-between border-b border-rose-100 bg-linear-to-r from-rose-50 to-rose-50/60 px-6 py-5 dark:border-rose-900 dark:from-rose-950 dark:to-rose-900">
					<div className="flex items-start gap-3.5">
						<div className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-rose-600 to-rose-700 text-white shadow-sm shadow-rose-200 dark:shadow-rose-950/60"><ReceiptText size={18} /></div>
						<div><DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">{editingBill ? "Update bill" : "Add a bill"}</DialogTitle><DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-300">Choose the due day and billing schedule.</DialogDescription></div>
					</div>
					<DialogClose disabled={submitting} aria-label="Close dialog" className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/80 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:hover:bg-slate-700 dark:hover:text-rose-200"><X size={17} /></DialogClose>
				</div>
				<form ref={billFormRef} onSubmit={onSubmitBill} className="grid gap-4 px-6 py-5 sm:grid-cols-2">
					{error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200 sm:col-span-2">{error}</p>}
					<label className="space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
						Bill name
						<Input required value={billTitle} onChange={(event) => onBillTitleChange(event.target.value)} placeholder="e.g. Rent" className="h-10 border-rose-200 text-slate-900 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500" />
					</label>
					<label className="space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
						Category
						<select required value={billCategory} onChange={(event) => {
							if (isBudgetCategory(event.target.value)) onBillCategoryChange(event.target.value);
						}} className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
							{budgetCategories.map((category) => <option key={category} value={category}>{budgetCategoryLabels[category]}</option>)}
						</select>
					</label>
					<label className="space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
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
					<label className="space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
						Due day
						<select required value={billDueDay} onChange={(event) => onBillDueDayChange(event.target.value)} className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
							<option value="">Choose a due day</option>
							<option value="5">5th day of the month</option>
							<option value="15">15th day of the month</option>
							<option value="20">20th day of the month</option>
							<option value="30">30th day of the month</option>
						</select>
					</label>
					<label className="space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
						Billing schedule
						<select value={billFrequency} onChange={(event) => onBillFrequencyChange(event.target.value as BillFrequency)} className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
							<option value="recurring">Recurring Monthly</option>
							<option value="one-time">This month only</option>
						</select>
					</label>
					<div className="flex flex-wrap justify-end gap-2 border-t border-rose-100 pt-4 dark:border-slate-700 sm:col-span-2">
						{editingBill && <Button type="button" disabled={submitting} variant="outline" onClick={() => { onCancelBill(); onBillDialogOpenChange(false); }} className="h-10 rounded-xl border-rose-200 bg-rose-50/60 px-4 text-rose-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 hover:shadow-md active:translate-y-0 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950">Cancel edit</Button>}
						<Button type="button" disabled={submitting} variant="outline" onClick={() => onBillDialogOpenChange(false)} className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Close</Button>
						<Button type="submit" disabled={submitting} className="h-10 rounded-xl border-0 bg-linear-to-r from-rose-600 via-rose-700 to-rose-600 px-4 text-white shadow-lg shadow-rose-500/25 ring-1 ring-inset ring-white/20 transition-all hover:-translate-y-0.5 hover:from-rose-700 hover:via-rose-800 hover:to-rose-700 hover:shadow-xl hover:shadow-rose-500/30 active:translate-y-0 dark:shadow-rose-950/50 dark:hover:shadow-rose-950/70">
							{submitting ? <Loader2 size={16} className="animate-spin" /> : editingBill ? <Pencil size={16} /> : <Plus size={16} />}
							{submitting ? editingBill ? "Saving changes…" : "Adding bill…" : editingBill ? "Save changes" : "Add bill"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	</>;
}
