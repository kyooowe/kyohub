"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { AlertTriangle, ArrowRight, ChevronLeft, ChevronRight, Globe, Key, KeyRound, Loader2, Plus, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageCallout } from "@/components/page-callout";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { PasswordDialog } from "@/features/passwords/components/password-dialog";
import { PasswordDetailsDialog } from "@/features/passwords/components/password-details-dialog";
import { PasswordList } from "@/features/passwords/components/password-list";
import { PasswordSearch } from "@/features/passwords/components/password-search";
import { createPasswordEntry, deletePasswordEntry, getPasswordEntries, setPasswordFavorite, updatePasswordEntry } from "@/features/passwords/actions/password-actions";
import { getStrength } from "@/features/passwords/lib/password-utils";
import type { PasswordEntry } from "@/features/passwords/types";
import { useAppSettings } from "@/components/settings/settings-context";
import { getPagePaletteStyles } from "@/components/settings/page-palettes";

const rowsPerPageOptions = [6, 9, 12, 18] as const;

function matchesPasswordFilter(entry: PasswordEntry, filter: string) {
	switch (filter) {
		case "All":
		case "Custom":
			return true;
		case "Favorites":
			return entry.favorite;
		case "Strong":
			return getStrength(entry.password).label === "Strong";
		case "Weak":
			return getStrength(entry.password).label === "Weak";
		default:
			return entry.category === filter;
	}
}

export function PasswordManager({ initialEntries, initialError }: { initialEntries: PasswordEntry[]; initialError: string }) {
	const { settings } = useAppSettings();
	const [passwords, setPasswords] = useState<PasswordEntry[]>(initialEntries);
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All");
	const [rowsPerPage, setRowsPerPage] = useState<number>(rowsPerPageOptions[0]);
	const [currentPage, setCurrentPage] = useState(1);
	const view = settings.passwordView;
	const [dialogEntry, setDialogEntry] = useState<PasswordEntry | "new" | null>(null);
	const [detailsEntry, setDetailsEntry] = useState<PasswordEntry | null>(null);
	const [revealed, setRevealed] = useState<string[]>([]);
	const [storageError, setStorageError] = useState(initialError);
	const [submitting, setSubmitting] = useState(false);
	const [favoritePending, setFavoritePending] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<PasswordEntry | null>(null);

	const filteredEntries = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return passwords.filter((entry) => matchesPasswordFilter(entry, filter)
			&& (!needle || [entry.website, entry.url, entry.username, entry.category].some((value) => value.toLowerCase().includes(needle))));
	}, [passwords, filter, query]);
	const pageCount = Math.max(1, Math.ceil(filteredEntries.length / rowsPerPage));
	const activePage = Math.min(currentPage, pageCount);
	const firstVisibleIndex = (activePage - 1) * rowsPerPage;
	const visibleEntries = filteredEntries.slice(firstVisibleIndex, firstVisibleIndex + rowsPerPage);

	function changeQuery(value: string) {
		setQuery(value);
		setCurrentPage(1);
	}

	function changeFilter(value: string) {
		setFilter(value);
		setCurrentPage(1);
	}

	function showPasswordList(nextFilter = "All") {
		setQuery("");
		setFilter(nextFilter);
		setCurrentPage(1);
		document.getElementById("password-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	async function submitEntry(entry: PasswordEntry) {
		setSubmitting(true);
		try {
			if (dialogEntry === "new") {
				await createPasswordEntry(entry);
			} else {
				await updatePasswordEntry(entry.id, entry);
			}
			setPasswords(await getPasswordEntries());
			setStorageError("");
			setDialogEntry(null);
		} catch (error) {
			setStorageError(error instanceof Error ? `Password change failed: ${error.message}` : "Password change failed.");
		} finally {
			setSubmitting(false);
		}
	}

	async function deleteEntry() {
		if (!deleteTarget) return;
		setSubmitting(true);
		try {
			await deletePasswordEntry(deleteTarget.id);
			setPasswords(await getPasswordEntries());
			setStorageError("");
			setDeleteTarget(null);
		} catch (error: unknown) {
			setStorageError(error instanceof Error ? `Could not delete password: ${error.message}` : "Could not delete password.");
		} finally {
			setSubmitting(false);
		}
	}

	async function copyPassword(entry: PasswordEntry) {
		try {
			await navigator.clipboard.writeText(entry.password);
			setStorageError("");
		} catch (error) {
			setStorageError(error instanceof Error ? `Could not copy password: ${error.message}` : "Could not copy password to clipboard.");
			throw error;
		}
	}

	async function toggleFavorite(entry: PasswordEntry) {
		if (favoritePending) return;
		setFavoritePending(true);
		try {
			await setPasswordFavorite(entry.id, !entry.favorite);
			setPasswords(await getPasswordEntries());
			setStorageError("");
		} catch (error) {
			setStorageError(error instanceof Error ? `Could not update favorite: ${error.message}` : "Could not update favorite.");
		} finally {
			setFavoritePending(false);
		}
	}

	const strongCount = passwords.filter((entry) => getStrength(entry.password).score >= 4).length;
	const passwordHeadingPalette = settings.pagePalettes["/passwords"];
	const passwordPalette = getPagePaletteStyles(passwordHeadingPalette === "default" ? "violet" : passwordHeadingPalette);
	const passwordHeadingColors = passwordPalette.pageHeading;
	const passwordButtonGradient = passwordPalette.iconGradient;

	return <div className="space-y-2">
		{storageError && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{storageError}</div>}
		<div
			className="mb-8 flex flex-wrap items-end justify-between gap-4"
		>
			<div className="min-w-0">
				<p
					className="password-page-kicker mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em]"
					style={{ "--password-accent": passwordPalette.accent } as CSSProperties}
				>
					<span className="password-page-kicker-icon grid size-6 place-items-center rounded-lg">
						<KeyRound size={13} />
					</span>
					FAMILY PASSWORDS
				</p>
				<h1 className={`bg-linear-to-r ${passwordHeadingColors} bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl`}>Password manager</h1>
				<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">A friendly place for the logins your family uses.</p>
			</div>
			<Button type="button" variant="ghost" className="palette-action-button min-h-11 gap-2.5 rounded-lg border px-4 text-sm font-medium transition-colors duration-150" style={{ "--action-accent": passwordPalette.accent } as CSSProperties} onClick={() => setDialogEntry("new")}>
				<Plus size={18} />
				Add password
			</Button>
		</div>
		<div data-page-palette-preserve className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<Card className="metric-summary-card metric-summary-card--sky relative gap-0 overflow-hidden rounded-3xl border border-blue-200 bg-[#f5f8ff] py-0 shadow-sm shadow-blue-950/5 ring-0 transition-shadow hover:shadow-md dark:border-blue-900/70 dark:bg-[#151b2b]">
				<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_6rem] grid-rows-[2.5rem_1fr] gap-x-3 gap-y-2 p-3.5">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-500 text-white"><Key size={19} strokeWidth={1.8} /></span>
						<p className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Saved logins</p>
					</div>
					<div aria-hidden="true" className="flex h-10 w-24 items-center justify-end">
						<span className="flex h-7 items-end justify-end gap-1">
							{[14, 20, 24, 32].map((height, index) => <i key={index} className="w-1.5 rounded-full bg-blue-500/60" style={{ height }} />)}
						</span>
					</div>
					<div className="self-end">
						<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">{passwords.length}</p>
						<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Accounts saved</p>
					</div>
					<div className="flex w-24 self-end">
						<button type="button" onClick={() => showPasswordList()} className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-full bg-blue-500/10 px-2 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300">
							<ArrowRight size={12} /> View all
						</button>
					</div>
				</CardContent>
			</Card>
			<Card className="metric-summary-card metric-summary-card--violet relative gap-0 overflow-hidden rounded-3xl border border-violet-200 bg-[#f8f6ff] py-0 shadow-sm shadow-violet-950/5 ring-0 transition-shadow hover:shadow-md dark:border-violet-900/70 dark:bg-[#151b2b]">
				<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_6rem] grid-rows-[2.5rem_1fr] gap-x-3 gap-y-2 p-3.5">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500 text-white"><ShieldCheck size={19} strokeWidth={1.8} /></span>
						<p className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Strong passwords</p>
					</div>
					<div className="flex h-10 w-24 items-center justify-center"><span className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-full bg-emerald-100/80 px-1 text-[9px] font-semibold tracking-wider text-emerald-700"><ShieldCheck size={10} /> SECURE</span></div>
					<div className="self-end">
						<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">{strongCount}<span className="ml-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">of {passwords.length}</span></p>
						<div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-violet-100 dark:bg-slate-700">
							<div className="h-full rounded-full bg-violet-500" style={{ width: `${passwords.length ? Math.min(100, strongCount / passwords.length * 100) : 0}%` }} />
						</div>
					</div>
					<button type="button" onClick={() => showPasswordList("Strong")} className="inline-flex h-7 w-24 items-center justify-center gap-1 self-end justify-self-end rounded-full bg-violet-500/10 px-2 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300">
						<ArrowRight size={12} /> View details
					</button>
				</CardContent>
			</Card>
			<Card className="metric-summary-card metric-summary-card--amber relative gap-0 overflow-hidden rounded-3xl border border-amber-200 bg-[#fffaf0] py-0 shadow-sm shadow-amber-950/5 ring-0 transition-shadow hover:shadow-md dark:border-amber-900/70 dark:bg-[#151b2b]">
				<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_6rem] grid-rows-[2.5rem_1fr] gap-x-3 gap-y-2 p-3.5">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white"><Globe size={19} strokeWidth={1.8} /></span>
						<p className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Categories</p>
					</div>
					<div aria-hidden="true" className="flex h-10 w-24 items-center justify-end">
						<span className="flex h-7 items-center justify-end gap-1">
							<i className="size-2.5 rounded-full bg-amber-400" /><i className="size-2.5 rounded-full bg-violet-500" /><i className="size-2.5 rounded-full bg-emerald-500" /><i className="size-2.5 rounded-full bg-blue-500" />
						</span>
					</div>
					<div className="self-end">
						<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">{new Set(passwords.filter((entry) => entry.category !== "Other").map((entry) => entry.category)).size}</p>
						<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Categories used</p>
					</div>
					<div className="flex w-24 self-end">
						<button type="button" onClick={() => showPasswordList("Custom")} className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-full bg-amber-500/10 px-2 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300">
							<ArrowRight size={12} /> View all
						</button>
					</div>
				</CardContent>
			</Card>
		</div>
		<Card id="password-list" className="gap-0 scroll-mt-6 overflow-hidden border-0 bg-transparent py-0 shadow-none ring-0">
			<div
				className="password-library-header relative overflow-hidden rounded-3xl border px-4 py-4 shadow-lg sm:px-5 sm:py-4"
				style={{ "--password-accent": passwordPalette.accent } as CSSProperties}
			>
				<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-14 size-36 rounded-full" />
				<div className="relative z-10 flex items-center justify-between gap-4">
					<div className="flex min-w-0 items-center gap-3">
						<span className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br ${passwordButtonGradient} text-white shadow-md shadow-slate-900/10 ring-1 ring-inset ring-white/40`}>
							<Key size={21} />
						</span>
						<div className="min-w-0">
							<h2 className="text-base font-semibold tracking-normal text-slate-900 dark:text-white sm:text-lg">Your passwords</h2>
							<p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
								<span className="font-medium text-slate-800 dark:text-slate-100">{passwords.length} saved login{passwords.length === 1 ? "" : "s"}</span>
								<span aria-hidden="true" className="mx-1.5 text-slate-400">·</span>
								Organized for your family
							</p>
						</div>
					</div>
					<div className="password-library-badge hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium sm:flex">
						<span className="grid size-6 place-items-center rounded-full bg-white/75 text-current shadow-sm dark:bg-white/10">
							<UsersRound size={13} />
						</span>
						Shared family space
					</div>
				</div>
			</div>
			<CardContent className="px-0 pb-0 pt-4 md:px-5 md:pb-0 md:pt-5">
				<PasswordSearch
					query={query}
					onQueryChange={changeQuery}
					filter={filter}
					onFilterChange={changeFilter}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={(rows) => {
						setRowsPerPage(rows);
						setCurrentPage(1);
					}}
					paletteAccent={passwordPalette.accent}
				/>
				<PasswordList entries={visibleEntries} view={view} onSelect={setDetailsEntry} onCopyPassword={copyPassword} onDelete={setDeleteTarget} onToggleFavorite={toggleFavorite} favoritePending={favoritePending} paletteAccent={passwordPalette.accent} />
				{filteredEntries.length > 0 && pageCount > 1 && <nav aria-label="Password list pagination" className="shared-pagination password-pagination flex justify-center pt-2" style={{ "--pagination-accent": passwordPalette.accent } as CSSProperties}>
					<div className="shared-pagination-controls inline-flex items-center gap-1.5 rounded-2xl border p-1.5">
						<Button type="button" variant="ghost" size="icon" className="shared-pagination-button size-9 rounded-xl" aria-label="Previous page" title="Previous page" disabled={activePage === 1} onClick={() => setCurrentPage(activePage - 1)}><ChevronLeft size={16} /></Button>
						<p aria-live="polite" className="shared-pagination-page flex min-w-28 items-center justify-center gap-1.5 px-2 text-xs">
							<span className="font-medium">Page</span>
							<span className="shared-pagination-current grid size-7 place-items-center rounded-lg font-bold">{activePage}</span>
							<span className="font-medium">of {pageCount}</span>
						</p>
						<Button type="button" variant="ghost" size="icon" className="shared-pagination-button size-9 rounded-xl" aria-label="Next page" title="Next page" disabled={activePage === pageCount} onClick={() => setCurrentPage(activePage + 1)}><ChevronRight size={16} /></Button>
					</div>
				</nav>}
			</CardContent>
		</Card>
		<div className={pageCount > 1 ? "pt-2" : undefined}>
			<PageCallout icon={ShieldCheck} title="Shared family workspace" description="Anyone who can access this app can read these passwords. They are not encrypted in the database." fallbackPalette="violet" tone="warning" />
		</div>
		<PasswordDialog entry={dialogEntry} onOpenChange={(open) => { if (!open && !submitting) setDialogEntry(null); }} onSubmit={submitEntry} submitting={submitting} />
		<PasswordDetailsDialog
			entry={detailsEntry}
			revealed={detailsEntry !== null && revealed.includes(detailsEntry.id)}
			onOpenChange={(open) => { if (!open) setDetailsEntry(null); }}
			onToggleReveal={() => {
				if (!detailsEntry) return;
				setRevealed((current) => current.includes(detailsEntry.id) ? current.filter((id) => id !== detailsEntry.id) : [...current, detailsEntry.id]);
			}}
			onEdit={() => {
				if (!detailsEntry) return;
				setDialogEntry(detailsEntry);
				setDetailsEntry(null);
			}}
			onDelete={() => {
				if (!detailsEntry) return;
				setDeleteTarget(detailsEntry);
				setDetailsEntry(null);
			}}
		/>
		<Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open && !submitting) setDeleteTarget(null); }}>
			<DialogContent pagePalette={passwordHeadingPalette === "default" ? "violet" : passwordHeadingPalette} data-page-palette-surface className="palette-dialog-panel max-w-md overflow-hidden border-0 bg-white p-0 shadow-2xl shadow-slate-950/20 dark:bg-slate-900 sm:rounded-2xl">
				<PaletteDialogHeader tone="danger" eyebrow="PASSWORD VAULT" title="Delete this password?" description="This action permanently removes the saved login. You will not be able to recover it later." icon={<AlertTriangle size={21} strokeWidth={2.2} />} closeLabel="Close delete dialog" closeDisabled={submitting} />
				<div className="px-6 py-5">
					<div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
						<div className="grid size-9 place-items-center rounded-lg bg-white text-red-500 shadow-sm dark:bg-slate-700"><Trash2 size={17} /></div>
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{deleteTarget?.website ?? "Saved login"}</p>
							<p className="text-xs text-slate-500 dark:text-slate-300">Saved password entry</p>
						</div>
					</div>
					<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<DialogClose disabled={submitting} className="palette-dialog-footer-button border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Keep password</DialogClose>
						<Button type="button" disabled={submitting} className="palette-dialog-footer-button bg-red-600 text-sm font-medium text-white shadow-sm shadow-red-200 transition-all hover:bg-red-700 hover:shadow-md" onClick={() => void deleteEntry()}>{submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} {submitting ? "Deleting…" : "Delete password"}</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	</div>;
}
