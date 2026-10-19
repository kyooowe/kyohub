"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/components/settings/settings-context";
import { dateLabel } from "@/features/grocery/lib/grocery-utils";
import { formatAmountInput, formatAmountInputChange } from "@/features/budget/lib/budget-utils";
import type { GroceryItem } from "@/features/grocery/types";

function GroceryForm({
	entry,
	onSubmit,
	onOpenChange,
	submitting,
}: {
	entry: GroceryItem | null;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onOpenChange: (open: boolean) => void;
	submitting: boolean;
}) {
	const [price, setPrice] = useState(() =>
		entry?.priceCents ? formatAmountInput(String(entry.priceCents / 100)) : ""
	);

	return (
		<form onSubmit={onSubmit} className="space-y-5 px-6 py-5">
			<label className="block space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
				Grocery item
				<Input
					data-page-palette-control
					required
					name="item"
					defaultValue={entry?.name ?? ""}
					placeholder="e.g. Fresh strawberries"
					className="h-10 border-blue-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
				/>
			</label>
			<label className="block space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
				Price (₱) <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Optional</span>
				<Input
					data-page-palette-control
					type="text"
					inputMode="decimal"
					name="price"
					value={price}
					onChange={(event) => {
						const input = event.currentTarget;
						const formatted = formatAmountInputChange(input.value, input.selectionStart ?? input.value.length);
						setPrice(formatted.value);
						requestAnimationFrame(() => {
							input.setSelectionRange(formatted.cursor, formatted.cursor);
						});
					}}
					onBlur={(event) => setPrice(formatAmountInput(event.target.value))}
					placeholder="e.g. 900.00"
					className="h-10 border-blue-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
				/>
			</label>
			<div className="palette-dialog-footer -mx-6 -mb-5 mt-5 flex flex-wrap justify-end gap-2 p-4 sm:px-6">
				<Button
					data-page-palette-secondary
					type="button"
					disabled={submitting}
					variant="outline"
					className="palette-dialog-footer-button border font-medium transition-colors duration-150"
					onClick={() => onOpenChange(false)}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					variant="ghost"
					disabled={submitting}
					className="palette-action-button palette-dialog-footer-button border font-medium transition-colors duration-150"
				>
					{submitting ? (
						<>
							<Loader2 size={16} className="animate-spin shrink-0" />
							<span>Saving...</span>
						</>
					) : (
						<>
							{entry ? null : <Plus size={16} className="shrink-0" />}
							<span>{entry ? "Save changes" : "Add item"}</span>
						</>
					)}
				</Button>
			</div>
		</form>
	);
}

export function GroceryDialog({
	open,
	entry,
	selectedDate,
	onOpenChange,
	onSubmit,
	submitting = false,
}: {
	open: boolean;
	entry: GroceryItem | null;
	selectedDate: Date;
	onOpenChange: (open: boolean) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	submitting?: boolean;
}) {
	const { settings } = useAppSettings();
	const pagePalette = settings.pagePalettes["/grocery"];
	const dialogPalette = pagePalette === "default" ? "blue" : pagePalette;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				pagePalette={dialogPalette}
				data-page-palette-surface
				className="palette-dialog-panel max-w-sm overflow-hidden border-blue-200 bg-white p-0 shadow-2xl shadow-blue-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 sm:rounded-2xl"
			>
				<PaletteDialogHeader
					eyebrow="GROCERY PLANNER"
					title={entry ? "Edit grocery item" : "Add to your list"}
					description={dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric" })}
					icon={<ShoppingCart size={18} />}
					closeLabel="Close dialog"
				/>
				<GroceryForm
					key={entry?.id ?? "new"}
					entry={entry}
					onSubmit={onSubmit}
					onOpenChange={onOpenChange}
					submitting={submitting}
				/>
			</DialogContent>
		</Dialog>
	);
}
