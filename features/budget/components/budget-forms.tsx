import type { FormEvent, Ref } from "react";
import { Loader2, Pencil, Plus, Receipt, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FeatureSectionHeader } from "@/components/feature-section-header";
import { formatAmountInput, formatAmountInputChange } from "@/features/budget/lib/budget-utils";
import type { BillFrequency } from "@/features/budget/types";

export function BudgetForms({ budgetInput, onBudgetInputChange, onSubmitBudget, billTitle, onBillTitleChange, billAmount, onBillAmountChange, billDueDay, onBillDueDayChange, billFrequency, onBillFrequencyChange, editingBill, submitting, billFormRef, onSubmitBill, onCancelBill }: {
	budgetInput: string;
	onBudgetInputChange: (value: string) => void;
	onSubmitBudget: (event: FormEvent<HTMLFormElement>) => void;
	billTitle: string;
	onBillTitleChange: (value: string) => void;
	billAmount: string;
	onBillAmountChange: (value: string) => void;
	billDueDay: string;
	onBillDueDayChange: (value: string) => void;
	billFrequency: BillFrequency;
	onBillFrequencyChange: (value: BillFrequency) => void;
	editingBill: boolean;
	submitting: boolean;
	billFormRef: Ref<HTMLFormElement>;
	onSubmitBill: (event: FormEvent<HTMLFormElement>) => void;
	onCancelBill: () => void;
}) {
	return <div className="grid items-start gap-5 lg:grid-cols-2">
		<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
			<FeatureSectionHeader theme="rose" icon={Wallet} title="Set monthly budget" description="Save a separate budget for each month." />
			<CardContent className="rounded-2xl border border-rose-100 bg-white p-4 shadow-lg shadow-slate-300/30 sm:p-5">
				<form onSubmit={onSubmitBudget} className="flex flex-wrap items-end gap-3">
					<label className="min-w-48 flex-1 space-y-2 text-sm font-medium text-slate-900">
						Amount
						<Input required inputMode="decimal" type="text" value={budgetInput} onChange={(event) => {
							const input = event.currentTarget;
							const formatted = formatAmountInputChange(input.value, input.selectionStart ?? input.value.length);
							onBudgetInputChange(formatted.value);
							requestAnimationFrame(() => {
								input.setSelectionRange(formatted.cursor, formatted.cursor);
							});
						}} onBlur={(event) => onBudgetInputChange(formatAmountInput(event.target.value))} placeholder="e.g. 2,500.00" className="h-10 border-rose-200 text-slate-900" />
					</label>
					<Button type="submit" disabled={submitting} className="h-10 bg-rose-700 text-white hover:bg-rose-800">{submitting && <Loader2 size={16} className="animate-spin" />}Save budget</Button>
				</form>
			</CardContent>
		</Card>
		<Card className="gap-3 overflow-visible border-0 bg-transparent py-0 shadow-none ring-0">
			<FeatureSectionHeader theme="rose" icon={Receipt} title={editingBill ? "Update bill" : "Add a bill"} description="Choose the due day and billing schedule." />
			<CardContent className="rounded-2xl border border-rose-100 bg-white p-4 shadow-lg shadow-slate-300/30 sm:p-5">
				<form ref={billFormRef} onSubmit={onSubmitBill} className="grid gap-3 sm:grid-cols-2">
					<label className="space-y-2 text-sm font-medium text-slate-900">
						Bill name
						<Input required value={billTitle} onChange={(event) => onBillTitleChange(event.target.value)} placeholder="e.g. Rent" className="h-10 border-rose-200 text-slate-900" />
					</label>
					<label className="space-y-2 text-sm font-medium text-slate-900">
						Amount
						<Input required inputMode="decimal" type="text" value={billAmount} onChange={(event) => {
							const input = event.currentTarget;
							const formatted = formatAmountInputChange(input.value, input.selectionStart ?? input.value.length);
							onBillAmountChange(formatted.value);
							requestAnimationFrame(() => {
								input.setSelectionRange(formatted.cursor, formatted.cursor);
							});
						}} onBlur={(event) => onBillAmountChange(formatAmountInput(event.target.value))} placeholder="e.g. 900.00" className="h-10 border-rose-200 text-slate-900" />
					</label>
					<label className="space-y-2 text-sm font-medium text-slate-900">
						Due day
						<select required value={billDueDay} onChange={(event) => onBillDueDayChange(event.target.value)} className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900">
							<option value="">Choose a due day</option>
							<option value="5">5th day of the month</option>
							<option value="15">15th day of the month</option>
							<option value="20">20th day of the month</option>
							<option value="30">30th day of the month</option>
						</select>
					</label>
					<label className="space-y-2 text-sm font-medium text-slate-900">
						Billing schedule
						<select value={billFrequency} onChange={(event) => onBillFrequencyChange(event.target.value as BillFrequency)} className="h-10 w-full rounded-md border border-rose-200 bg-white px-3 text-sm text-slate-900">
							<option value="recurring">Recurring Monthly</option>
							<option value="one-time">This month only</option>
						</select>
					</label>
					<div className="flex gap-2 sm:col-span-2">
						{editingBill && <Button type="button" variant="outline" disabled={submitting} onClick={onCancelBill} className="h-10 border-rose-200 text-rose-800 hover:bg-rose-50">Cancel</Button>}
						<Button type="submit" disabled={submitting} className="h-10 flex-1 bg-rose-700 text-white hover:bg-rose-800">
							{submitting ? <Loader2 size={16} className="animate-spin" /> : editingBill ? <Pencil size={16} /> : <Plus size={16} />}
							{submitting ? editingBill ? "Saving changes…" : "Adding bill…" : editingBill ? "Save changes" : "Add bill"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>;
}
