"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, CheckCircle2, Circle, ExternalLink, Loader2, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/components/settings/settings-context";
import { getPagePaletteStyles } from "@/components/settings/page-palettes";
import { createGroceryItem, getGroceryDayDetails, setGroceryDayAllPaid, updateGroceryItem } from "@/features/grocery/actions/grocery-actions";
import { centsFromInput, formatAmountInput, formatAmountInputChange, money } from "@/features/budget/lib/budget-utils";

type GroceryItemDetail = {
	id: string;
	name: string;
	done: boolean;
	priceCents: number;
	paid: boolean;
};

type DayDetails = {
	dateKey: string;
	formattedDate: string;
	shortTitle: string;
	items: GroceryItemDetail[];
	totalCents: number;
	isAllPaid: boolean;
	autoAddToBudget: boolean;
};

function GroceryItemPriceInput({
	initialPriceCents,
	paletteAccent,
	disabled,
	onSave,
}: {
	initialPriceCents: number;
	paletteAccent: string;
	disabled?: boolean;
	onSave: (cents: number) => void;
}) {
	const [value, setValue] = useState(() => (initialPriceCents > 0 ? formatAmountInput(String(initialPriceCents / 100)) : ""));

	const [prevCents, setPrevCents] = useState(initialPriceCents);
	if (prevCents !== initialPriceCents) {
		setPrevCents(initialPriceCents);
		setValue(initialPriceCents > 0 ? formatAmountInput(String(initialPriceCents / 100)) : "");
	}

	return (
		<Input
			type="text"
			inputMode="decimal"
			disabled={disabled}
			value={value}
			placeholder="0.00"
			onChange={(event) => {
				const input = event.currentTarget;
				const formatted = formatAmountInputChange(input.value, input.selectionStart ?? input.value.length);
				setValue(formatted.value);
				requestAnimationFrame(() => {
					input.setSelectionRange(formatted.cursor, formatted.cursor);
				});
			}}
			onBlur={(event) => {
				const formatted = formatAmountInput(event.target.value);
				setValue(formatted);
				const cents = centsFromInput(formatted) ?? 0;
				if (cents !== initialPriceCents) {
					onSave(cents);
				}
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					e.currentTarget.blur();
				}
			}}
			className="h-8 w-24 rounded-lg border-slate-200 bg-slate-50/70 text-right text-xs font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
			style={{ "--tw-ring-color": paletteAccent } as React.CSSProperties}
		/>
	);
}

export function BudgetGroceryDialog({
	open,
	dateKey,
	onOpenChange,
	onUpdated,
}: {
	open: boolean;
	dateKey: string | null;
	onOpenChange: (open: boolean) => void;
	onUpdated?: () => Promise<void>;
}) {
	const [details, setDetails] = useState<DayDetails | null>(null);
	const [loading, setLoading] = useState(false);
	const [savingItemId, setSavingItemId] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	// Add item state
	const [newItemName, setNewItemName] = useState("");
	const [newItemPrice, setNewItemPrice] = useState("");
	const [addingItem, setAddingItem] = useState(false);

	useEffect(() => {
		if (!open || !dateKey) return;
		let cancelled = false;
		Promise.resolve().then(() => {
			if (!cancelled) setLoading(true);
		});
		getGroceryDayDetails(dateKey)
			.then((data) => {
				if (!cancelled) {
					setDetails(data);
					setLoading(false);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setLoading(false);
					toast.error(err instanceof Error ? err.message : "Could not load grocery items.");
				}
			});

		return () => {
			cancelled = true;
		};
	}, [open, dateKey]);

	async function refreshData() {
		if (!dateKey) return;
		try {
			const data = await getGroceryDayDetails(dateKey);
			setDetails(data);
			await onUpdated?.();
		} catch {
			// silent fallback
		}
	}

	function handleToggleItemPaid(item: GroceryItemDetail) {
		if (!dateKey || savingItemId || (!item.paid && (!item.priceCents || item.priceCents <= 0))) {
			return;
		}
		const nextPaid = !item.paid;
		setSavingItemId(item.id);

		// Optimistic update
		setDetails((prev) => {
			if (!prev) return prev;
			const nextItems = prev.items.map((i) => (i.id === item.id ? { ...i, paid: nextPaid, done: nextPaid } : i));
			const payable = nextItems.filter((i) => i.priceCents > 0);
			const isAllPaid = payable.length > 0 && payable.every((i) => i.paid);
			return { ...prev, items: nextItems, isAllPaid };
		});

		startTransition(async () => {
			try {
				await updateGroceryItem(item.id, { paid: nextPaid, done: nextPaid });
				await onUpdated?.();
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Failed to update item.");
				await refreshData();
			} finally {
				setSavingItemId(null);
			}
		});
	}

	function handlePriceSave(item: GroceryItemDetail, newPriceCents: number) {
		if (newPriceCents === item.priceCents) return;

		setSavingItemId(item.id);
		const willUnpay = newPriceCents <= 0 && item.paid;

		// Optimistic update
		setDetails((prev) => {
			if (!prev) return prev;
			const nextItems = prev.items.map((i) => {
				if (i.id !== item.id) return i;
				return {
					...i,
					priceCents: newPriceCents,
					paid: willUnpay ? false : i.paid,
					done: willUnpay ? false : i.done,
				};
			});
			const totalCents = nextItems.reduce((sum, i) => sum + i.priceCents, 0);
			const payable = nextItems.filter((i) => i.priceCents > 0);
			const isAllPaid = payable.length > 0 && payable.every((i) => i.paid);
			return { ...prev, items: nextItems, totalCents, isAllPaid };
		});

		startTransition(async () => {
			try {
				await updateGroceryItem(item.id, {
					priceCents: newPriceCents,
					...(willUnpay ? { paid: false, done: false } : {}),
				});
				await onUpdated?.();
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Failed to update price.");
				await refreshData();
			} finally {
				setSavingItemId(null);
			}
		});
	}

	function handleToggleAllPaid() {
		if (!dateKey || !details) return;
		const payableCount = details.items.filter((i) => i.priceCents > 0).length;
		if (payableCount === 0) return;
		const nextAllPaid = !details.isAllPaid;

		// Optimistic update
		setDetails((prev) => {
			if (!prev) return prev;
			const nextItems = prev.items.map((i) => {
				if (i.priceCents <= 0) return { ...i, paid: false };
				return { ...i, paid: nextAllPaid, done: nextAllPaid ? true : i.done };
			});
			return { ...prev, items: nextItems, isAllPaid: nextAllPaid };
		});

		startTransition(async () => {
			try {
				await setGroceryDayAllPaid(dateKey, nextAllPaid);
				await onUpdated?.();
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Failed to update items.");
				await refreshData();
			}
		});
	}

	async function handleAddItem(event: React.FormEvent) {
		event.preventDefault();
		if (!dateKey || !newItemName.trim() || addingItem) return;
		setAddingItem(true);
		const cryptoApi = globalThis.crypto;
		const id = typeof cryptoApi?.randomUUID === "function" ? cryptoApi.randomUUID() : `${Date.now()}-${Math.random()}`;
		const priceCents = centsFromInput(newItemPrice) ?? 0;

		try {
			await createGroceryItem({
				id,
				dateKey,
				name: newItemName.trim(),
				done: false,
				priceCents,
			});
			setNewItemName("");
			setNewItemPrice("");
			await refreshData();
			toast.success(`Added "${newItemName.trim()}"`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to add grocery item.");
		} finally {
			setAddingItem(false);
		}
	}

	const { settings } = useAppSettings();
	const configuredPalette = settings.pagePalettes["/budget"];
	const dialogPalette = configuredPalette === "default" ? "rose" : (configuredPalette || "rose");
	const paletteStyles = getPagePaletteStyles(dialogPalette);

	const title = details?.shortTitle ?? "Grocery Items";
	const formattedDate = details?.formattedDate ?? "";
	const totalCents = details?.totalCents ?? 0;
	const isAllPaid = Boolean(details?.isAllPaid);
	const items = details?.items ?? [];
	const paidCount = items.filter((i) => i.paid).length;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				pagePalette={dialogPalette}
				data-page-palette-surface
				className="palette-dialog-panel max-w-lg overflow-hidden border bg-white p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl"
			>
				<PaletteDialogHeader
					eyebrow="GROCERY BUDGET DETAILS"
					title={title}
					description={`${formattedDate} · ${items.length} item${items.length === 1 ? "" : "s"} in grocery list`}
					icon={<ShoppingCart size={20} />}
					closeLabel="Close dialog"
				/>

				<div className="space-y-4 px-5 py-4 sm:px-6">
					{/* Summary bar */}
					<div
						className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-xs transition-colors"
						style={{
							backgroundColor: `color-mix(in srgb, ${paletteStyles.accent} 7%, var(--surface-bg, #ffffff))`,
							borderColor: `color-mix(in srgb, ${paletteStyles.accent} 22%, transparent)`,
						}}
					>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Grocery Expense</p>
							<p className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
								{money.format(totalCents / 100)}
							</p>
							<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
								{paidCount} of {items.length} item{items.length === 1 ? "" : "s"} marked as paid
							</p>
						</div>

						<div className="flex flex-col items-end gap-2">
							<span
								className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
									isAllPaid
										? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
										: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
								}`}
							>
								{isAllPaid ? (
									<>
										<CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
										Paid
									</>
								) : (
									<>
										<Circle size={13} className="text-rose-500" />
										Unpaid
									</>
								)}
							</span>

							{items.length > 0 && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isPending}
									onClick={handleToggleAllPaid}
									className="h-8 rounded-xl border bg-white text-xs font-semibold shadow-2xs transition-colors hover:opacity-90 dark:bg-slate-800"
									style={{
										borderColor: `color-mix(in srgb, ${paletteStyles.accent} 35%, transparent)`,
										color: paletteStyles.accent,
									}}
								>
									{isAllPaid ? "Mark all unpaid" : "Mark all as paid"}
								</Button>
							)}
						</div>
					</div>

					{/* Items list */}
					<div className="space-y-2">
						<div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
							<span>Grocery items ({items.length})</span>
							<span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Mark paid & add price</span>
						</div>

						{loading ? (
							<div className="flex min-h-36 items-center justify-center">
								<Loader2 size={24} className="animate-spin" style={{ color: paletteStyles.accent }} />
							</div>
						) : items.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
								No groceries listed for this day. You can add one below.
							</div>
						) : (
							<div className="max-h-64 space-y-2 overflow-y-auto pr-1">
								{items.map((item) => {
									const isBusy = savingItemId === item.id;
									const hasNoPrice = !item.priceCents || item.priceCents <= 0;
									const isCheckDisabled = isBusy || hasNoPrice;
									return (
										<div
											key={item.id}
											className={`flex items-center justify-between gap-2.5 rounded-2xl border p-2.5 transition-all ${
												item.paid
													? "border-emerald-100 bg-emerald-50/30 dark:border-emerald-950/50 dark:bg-emerald-950/10"
													: "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950"
											}`}
										>
											<div className="flex min-w-0 items-center gap-2.5 flex-1">
												<button
													type="button"
													disabled={isCheckDisabled}
													onClick={() => handleToggleItemPaid(item)}
													className={`grid size-7 shrink-0 place-items-center rounded-lg border transition-all ${
														hasNoPrice
															? "cursor-not-allowed opacity-40 border-slate-200 bg-slate-100 text-transparent dark:border-slate-800 dark:bg-slate-900"
															: item.paid
																? "border-emerald-500 bg-emerald-500 text-white shadow-xs"
																: "border-slate-300 bg-slate-50 text-transparent hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"
													}`}
													title={
														hasNoPrice
															? "Add a price to enable"
															: item.paid
																? "Mark unpaid"
																: "Mark paid"
													}
													aria-label={
														hasNoPrice
															? `${item.name} has no price`
															: item.paid
																? `Mark ${item.name} unpaid`
																: `Mark ${item.name} paid`
													}
												>
													{isBusy ? (
														<Loader2 size={13} className="animate-spin text-slate-600" />
													) : (
														<Check size={14} strokeWidth={3} className={item.paid ? "text-white" : "text-transparent"} />
													)}
												</button>

												<div className="min-w-0 flex-1">
													<p
														className={`truncate text-xs font-medium ${
															item.paid
																? "text-slate-400 line-through dark:text-slate-500"
																: "text-slate-900 dark:text-slate-100"
														}`}
													>
														{item.name}
													</p>
													<div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
														<span
															className={`inline-flex items-center rounded-sm px-1 py-0.2 ${
																item.done
																	? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
																	: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
															}`}
														>
															{item.done ? "Checked in list" : "Unchecked in list"}
														</span>
														{item.paid ? (
															<span className="font-semibold text-emerald-600 dark:text-emerald-400">· Paid</span>
														) : hasNoPrice ? (
															<span className="font-medium text-amber-600 dark:text-amber-400">· Set price to pay</span>
														) : null}
													</div>
												</div>
											</div>

											{/* Price input */}
											<div className="flex shrink-0 items-center gap-1">
												<span className="text-xs font-semibold text-slate-500 dark:text-slate-400">₱</span>
												<GroceryItemPriceInput
													initialPriceCents={item.priceCents}
													paletteAccent={paletteStyles.accent}
													disabled={isBusy}
													onSave={(cents) => handlePriceSave(item, cents)}
												/>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Quick Add item form */}
					<form onSubmit={handleAddItem} className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
						<p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
							<Plus size={13} /> Add an item to this grocery list
						</p>
						<div className="flex items-center gap-2">
							<Input
								required
								value={newItemName}
								onChange={(e) => setNewItemName(e.target.value)}
								placeholder="Item name (e.g. Milk)"
								className="h-8.5 flex-1 rounded-lg border-slate-200 bg-white text-xs dark:border-slate-700 dark:bg-slate-900"
							/>
							<div className="flex items-center gap-1">
								<span className="text-xs font-semibold text-slate-500">₱</span>
								<Input
									type="text"
									inputMode="decimal"
									value={newItemPrice}
									onChange={(event) => {
										const input = event.currentTarget;
										const formatted = formatAmountInputChange(input.value, input.selectionStart ?? input.value.length);
										setNewItemPrice(formatted.value);
										requestAnimationFrame(() => {
											input.setSelectionRange(formatted.cursor, formatted.cursor);
										});
									}}
									onBlur={(event) => setNewItemPrice(formatAmountInput(event.target.value))}
									placeholder="0.00"
									className="h-8.5 w-24 rounded-lg border-slate-200 bg-white text-right text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
								/>
							</div>
							<Button
								type="submit"
								size="sm"
								disabled={addingItem || !newItemName.trim()}
								className="palette-action-button h-8.5 rounded-lg border px-3 text-xs font-semibold transition-all hover:opacity-95 active:scale-95 disabled:opacity-50"
							>
								{addingItem ? <Loader2 size={13} className="animate-spin" /> : "Add"}
							</Button>
						</div>
					</form>

					{/* Footer link to grocery planner */}
					<div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
						<Link
							href="/grocery"
							onClick={() => onOpenChange(false)}
							className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
							style={{ color: paletteStyles.accent }}
						>
							<ExternalLink size={13} /> Open Grocery Planner
						</Link>

						<Button
							data-page-palette-secondary
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onOpenChange(false)}
							className="rounded-xl border text-xs font-medium transition-colors"
						>
							Done
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
