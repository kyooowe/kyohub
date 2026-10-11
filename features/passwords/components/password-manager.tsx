"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Globe, Key, KeyRound, Loader2, MoreVertical, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PasswordDialog } from "@/features/passwords/components/password-dialog";
import { PasswordDetailsDialog } from "@/features/passwords/components/password-details-dialog";
import { PasswordList } from "@/features/passwords/components/password-list";
import { PasswordSearch } from "@/features/passwords/components/password-search";
import { createPasswordEntry, deletePasswordEntry, getPasswordEntries, setPasswordFavorite, updatePasswordEntry } from "@/features/passwords/actions/password-actions";
import { getStrength } from "@/features/passwords/lib/password-utils";
import type { PasswordEntry } from "@/features/passwords/types";
import { useAppSettings } from "@/components/settings/settings-context";
import { getPagePaletteStyles } from "@/components/settings/page-palettes";

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
	const view = settings.passwordView;
	const [dialogEntry, setDialogEntry] = useState<PasswordEntry | "new" | null>(null);
	const [detailsEntry, setDetailsEntry] = useState<PasswordEntry | null>(null);
	const [revealed, setRevealed] = useState<string[]>([]);
	const [storageError, setStorageError] = useState(initialError);
	const [submitting, setSubmitting] = useState(false);
	const [favoritePending, setFavoritePending] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<PasswordEntry | null>(null);

	const visibleEntries = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return passwords.filter((entry) => matchesPasswordFilter(entry, filter)
			&& (!needle || [entry.website, entry.url, entry.username, entry.category].some((value) => value.toLowerCase().includes(needle))));
	}, [passwords, filter, query]);

	function showPasswordList(nextFilter = "All") {
		setQuery("");
		setFilter(nextFilter);
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
	const passwordHeadingColors = passwordHeadingPalette === "default"
		? "from-slate-900 via-violet-950 to-violet-700 dark:from-slate-100 dark:via-violet-200 dark:to-violet-400"
		: getPagePaletteStyles(passwordHeadingPalette).passwordHeading;
	const passwordHeaderColors = passwordHeadingPalette === "default"
		? "from-violet-800 via-violet-700 to-fuchsia-700"
		: getPagePaletteStyles(passwordHeadingPalette).featureHeader.gradient;

	return <div className="space-y-4">
		{storageError && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{storageError}</div>}
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div><p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-violet-600 dark:text-violet-300"><span className="grid size-6 place-items-center rounded-md bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300"><KeyRound size={14} /></span> YOUR DIGITAL LIFE</p><h1 className={`bg-linear-to-r ${passwordHeadingColors} bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl`}>Password manager</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">All your logins, neatly in one place.</p></div>
			<Button type="button" className="min-h-11 border-0 bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl hover:shadow-violet-400/40 dark:shadow-violet-950/70 dark:hover:shadow-violet-950/80" onClick={() => setDialogEntry("new")}><Plus size={17} /> Add password</Button>
		</div>
		<div data-page-palette-preserve className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<Card className="metric-summary-card metric-summary-card--sky relative gap-0 overflow-hidden rounded-2xl border border-blue-100 bg-[#f5f8ff] py-0 shadow-sm shadow-blue-950/5 ring-0 transition-shadow hover:shadow-md dark:border-[#273349] dark:bg-[#151b2b]">
				<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_6rem] grid-rows-[2.5rem_1fr] gap-x-3 gap-y-2 p-3.5">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-500 text-white"><Key size={19} strokeWidth={1.8} /></span>
						<p className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Saved logins</p>
					</div>
					<div className="flex h-10 w-24 items-center justify-end"><MoreVertical aria-hidden="true" size={17} className="text-blue-400/70" /></div>
					<div className="self-end">
						<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">{passwords.length}</p>
						<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Accounts saved</p>
					</div>
					<div className="grid w-24 grid-rows-[1.75rem_1.75rem] justify-items-stretch gap-1.5 self-end">
						<div aria-hidden="true" className="flex h-7 items-end justify-end gap-1">
							{[14, 20, 24, 32].map((height, index) => <i key={index} className="w-1.5 rounded-full bg-blue-500/60" style={{ height }} />)}
						</div>
						<button type="button" onClick={() => showPasswordList()} className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-full bg-blue-500/10 px-2 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300">
							<ArrowRight size={12} /> View all
						</button>
					</div>
				</CardContent>
			</Card>
			<Card className="metric-summary-card metric-summary-card--violet relative gap-0 overflow-hidden rounded-2xl border border-violet-100 bg-[#f8f6ff] py-0 shadow-sm shadow-violet-950/5 ring-0 transition-shadow hover:shadow-md dark:border-[#273349] dark:bg-[#151b2b]">
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
			<Card className="metric-summary-card metric-summary-card--amber relative gap-0 overflow-hidden rounded-2xl border border-amber-100 bg-[#fffaf0] py-0 shadow-sm shadow-amber-950/5 ring-0 transition-shadow hover:shadow-md dark:border-[#273349] dark:bg-[#151b2b]">
				<CardContent className="relative z-10 grid min-h-[9.5rem] grid-cols-[minmax(0,1fr)_6rem] grid-rows-[2.5rem_1fr] gap-x-3 gap-y-2 p-3.5">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white"><Globe size={19} strokeWidth={1.8} /></span>
						<p className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">Categories</p>
					</div>
					<div className="flex h-10 w-24 items-center justify-end"><MoreVertical aria-hidden="true" size={17} className="text-amber-500/70" /></div>
					<div className="self-end">
						<p className="text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">{new Set(passwords.filter((entry) => entry.category !== "Other").map((entry) => entry.category)).size}</p>
						<p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Categories used</p>
					</div>
					<div className="grid w-24 grid-rows-[1.75rem_1.75rem] justify-items-stretch gap-1.5 self-end">
						<span aria-hidden="true" className="flex h-7 items-center justify-end gap-1">
							<i className="size-2.5 rounded-full bg-amber-400" /><i className="size-2.5 rounded-full bg-violet-500" /><i className="size-2.5 rounded-full bg-emerald-500" /><i className="size-2.5 rounded-full bg-blue-500" />
						</span>
						<button type="button" onClick={() => showPasswordList("Custom")} className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-full bg-amber-500/10 px-2 text-[11px] font-medium text-amber-800 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300">
							<ArrowRight size={12} /> View all
						</button>
					</div>
				</CardContent>
			</Card>
		</div>
		<Card id="password-list" className="gap-0 scroll-mt-6 overflow-hidden border-0 bg-transparent shadow-none ring-0">
		<div className={`relative overflow-hidden rounded-2xl bg-linear-to-r ${passwordHeaderColors} px-5 py-5 text-white shadow-lg shadow-violet-300/30 dark:shadow-violet-950/70`}>
			<div className="pointer-events-none absolute -right-8 -top-14 size-40 rounded-full border-20 border-white/5" />
			<div className="pointer-events-none absolute right-20 -top-16 size-36 rounded-full bg-violet-200/15 blur-2xl" />
			<div className="relative flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3.5"><div className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-fuchsia-100 shadow-inner shadow-white/10"><Key size={21} /></div><div className="min-w-0"><h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">Your passwords</h2><p className="mt-1 text-xs text-violet-100/75">{passwords.length} saved login{passwords.length === 1 ? "" : "s"} · all in one place</p></div></div><div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90 sm:flex"><span className="size-1.5 rounded-full bg-emerald-300" />Shared workspace</div></div>
			</div>
			<CardContent className="p-4 md:p-5">
				<PasswordSearch query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} />
				<PasswordList entries={visibleEntries} view={view} onSelect={setDetailsEntry} onCopyPassword={copyPassword} onDelete={setDeleteTarget} onToggleFavorite={toggleFavorite} favoritePending={favoritePending} />
				<div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-violet-100 pt-4 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-300"><span>Showing {visibleEntries.length} of {passwords.length} passwords</span><span>Saved to the shared database</span></div>
			</CardContent>
		</Card>
		<p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-100"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" /><span><strong>Shared family workspace:</strong> Anyone who can access this app can read these passwords. They are not encrypted in the database.</span></p>
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
			<DialogContent className="max-w-md overflow-hidden border-0 bg-white p-0 shadow-2xl shadow-slate-950/20 dark:bg-slate-900 sm:rounded-2xl">
				<div className="border-b border-red-100 bg-linear-to-br from-red-50 via-rose-50 to-white px-6 pb-5 pt-6 dark:border-red-950 dark:from-red-950 dark:via-slate-900 dark:to-slate-900">
					<div className="flex items-start justify-between gap-4">
						<div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-100 text-red-600 shadow-sm shadow-red-200 dark:bg-red-950 dark:text-red-300">
							<AlertTriangle size={23} strokeWidth={2.2} />
						</div>
						<DialogClose disabled={submitting} aria-label="Close delete dialog" className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-200">×</DialogClose>
					</div>
					<DialogTitle className="mt-5 text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Delete this password?</DialogTitle>
					<DialogDescription className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">This action permanently removes the saved login. You will not be able to recover it later.</DialogDescription>
				</div>
				<div className="px-6 py-5">
					<div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
						<div className="grid size-9 place-items-center rounded-lg bg-white text-red-500 shadow-sm dark:bg-slate-700"><Trash2 size={17} /></div>
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{deleteTarget?.website ?? "Saved login"}</p>
							<p className="text-xs text-slate-500 dark:text-slate-300">Saved password entry</p>
						</div>
					</div>
					<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<DialogClose disabled={submitting} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Keep password</DialogClose>
						<Button type="button" disabled={submitting} className="min-h-10 bg-red-600 px-4 text-white shadow-sm shadow-red-200 transition-all hover:bg-red-700 hover:shadow-md" onClick={() => void deleteEntry()}>{submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} {submitting ? "Deleting…" : "Delete password"}</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	</div>;
}
