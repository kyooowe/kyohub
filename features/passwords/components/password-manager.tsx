"use client";

import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Globe, Key, KeyRound, Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PasswordDialog } from "@/features/passwords/components/password-dialog";
import { PasswordList } from "@/features/passwords/components/password-list";
import { PasswordSearch } from "@/features/passwords/components/password-search";
import { createPasswordEntry, deletePasswordEntry, getPasswordEntries, updatePasswordEntry } from "@/features/passwords/actions/password-actions";
import { getStrength } from "@/features/passwords/lib/password-utils";
import type { PasswordEntry } from "@/features/passwords/types";

export function PasswordManager() {
	const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All");
	const [dialogEntry, setDialogEntry] = useState<PasswordEntry | "new" | null>(null);
	const [revealed, setRevealed] = useState<string[]>([]);
	const [ready, setReady] = useState(false);
	const [storageError, setStorageError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<PasswordEntry | null>(null);

	useEffect(() => {
		let active = true;
		async function loadPasswords() {
			try {
				const entries = await getPasswordEntries();
				if (active) setPasswords(entries);
			} catch (error) {
				if (active) setStorageError(error instanceof Error ? `Could not load passwords: ${error.message}` : "Could not load passwords from the database.");
			} finally {
				if (active) setReady(true);
			}
		}
		void loadPasswords();
		return () => { active = false; };
	}, []);

	const visibleEntries = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return passwords.filter((entry) => (filter === "All" || entry.category === filter)
			&& (!needle || [entry.website, entry.url, entry.username, entry.category].some((value) => value.toLowerCase().includes(needle))));
	}, [passwords, filter, query]);

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

	const strongCount = passwords.filter((entry) => getStrength(entry.password).score >= 4).length;

	return <>
		{storageError && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{storageError}</div>}
		{!ready && <LoadingIndicator />}
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div><p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-violet-600"><span className="grid size-6 place-items-center rounded-md bg-violet-100 text-violet-600"><KeyRound size={14} /></span> YOUR DIGITAL LIFE</p><h1 className="bg-linear-to-r from-slate-900 via-violet-950 to-violet-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">Password manager</h1><p className="mt-1 text-sm text-slate-500">All your logins, neatly in one place.</p></div>
			<Button type="button" className="min-h-11 border-0 bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl hover:shadow-violet-400/40" onClick={() => setDialogEntry("new")}><Plus size={17} /> Add password</Button>
		</div>
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-sky-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-sky-50 hover:shadow-xl hover:shadow-sky-200/70">
				<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-sky-100/70 blur-2xl transition-all duration-300 group-hover:bg-sky-200/80" />
				<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-blue-200 transition-transform duration-200 group-hover:scale-105"><Key size={20} /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-500">Saved logins</p><p className="text-2xl font-bold tracking-tight text-slate-800">{passwords.length}</p></div><span className="ml-auto flex h-8 items-end gap-1 opacity-70">{[12, 20, 15, 25, 18, 30].map((height, index) => <i key={index} className="w-1.5 rounded-t-full bg-sky-200" style={{ height }} />)}</span></CardContent>
			</Card>
			<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-emerald-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-emerald-50 hover:shadow-xl hover:shadow-emerald-200/70">
				<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-emerald-100/60 blur-2xl transition-all duration-300 group-hover:bg-emerald-200/70" />
				<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-200 transition-transform duration-200 group-hover:scale-105"><ShieldCheck size={20} /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-500">Strong passwords</p><p className="text-2xl font-bold tracking-tight text-slate-800">{strongCount}<span className="ml-1 text-xs font-normal text-slate-400">of {passwords.length}</span></p></div><div className="ml-auto flex flex-col items-end gap-1"><div className="h-1.5 w-12 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-linear-to-r from-emerald-400 to-teal-500" style={{ width: `${passwords.length ? Math.min(100, strongCount / passwords.length * 100) : 0}%` }} /></div><span className="text-[9px] font-medium uppercase tracking-wider text-emerald-500">Secure</span></div></CardContent>
			</Card>
			<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-amber-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-amber-50 hover:shadow-xl hover:shadow-amber-200/70">
				<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-amber-100/60 blur-2xl transition-all duration-300 group-hover:bg-amber-200/70" />
				<CardContent className="relative flex flex-row items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200 transition-transform duration-200 group-hover:scale-105"><Globe size={20} /></span><div className="min-w-0"><p className="text-xs font-medium text-slate-500">Categories</p><p className="text-2xl font-bold tracking-tight text-slate-800">{new Set(passwords.map((entry) => entry.category)).size}</p></div><span className="ml-auto flex items-center gap-1.5"><i className="size-2 rounded-full bg-violet-400" /><i className="size-2 rounded-full bg-emerald-400" /><i className="size-2 rounded-full bg-amber-400" /><i className="size-2 rounded-full bg-fuchsia-400" /></span></CardContent>
			</Card>
		</div>
		<Card className="overflow-hidden border-0 bg-transparent shadow-none ring-0">
			<div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#34226f] via-[#5637ad] to-[#8055d9] px-5 py-5 text-white shadow-lg shadow-violet-300/30">
				<div className="pointer-events-none absolute -right-8 -top-14 size-44 rounded-full border-24 border-white/5" /><div className="pointer-events-none absolute right-20 -top-20 size-40 rounded-full bg-fuchsia-300/10 blur-2xl" />
				<div className="relative flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3.5"><div className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-fuchsia-100 shadow-inner shadow-white/10"><Key size={21} /></div><div className="min-w-0"><h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">Your passwords</h2><p className="mt-1 text-xs text-violet-100/75">{passwords.length} saved login{passwords.length === 1 ? "" : "s"} · all in one place</p></div></div><div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90 sm:flex"><span className="size-1.5 rounded-full bg-emerald-300" />Shared workspace</div></div>
			</div>
			<CardContent className="p-4 md:p-5">
				<PasswordSearch query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} />
				<PasswordList entries={visibleEntries} revealed={revealed} onToggleReveal={(id) => setRevealed((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onEdit={setDialogEntry} onDelete={setDeleteTarget} />
				<div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-violet-100 pt-4 text-xs text-slate-400"><span>Showing {visibleEntries.length} of {passwords.length} passwords</span><span>Saved to the shared database</span></div>
			</CardContent>
		</Card>
		<p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-700" /><span><strong>Shared family workspace:</strong> Anyone who can access this app can read these passwords. They are not encrypted in the database.</span></p>
		<PasswordDialog entry={dialogEntry} onOpenChange={(open) => { if (!open && !submitting) setDialogEntry(null); }} onSubmit={submitEntry} submitting={submitting} />
		<Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open && !submitting) setDeleteTarget(null); }}>
			<DialogContent className="max-w-md overflow-hidden border-0 bg-white p-0 shadow-2xl shadow-slate-950/20 sm:rounded-2xl">
				<div className="border-b border-red-100 bg-linear-to-br from-red-50 via-rose-50 to-white px-6 pb-5 pt-6">
					<div className="flex items-start justify-between gap-4">
						<div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-100 text-red-600 shadow-sm shadow-red-200">
							<AlertTriangle size={23} strokeWidth={2.2} />
						</div>
						<DialogClose disabled={submitting} aria-label="Close delete dialog" className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-200">×</DialogClose>
					</div>
					<DialogTitle className="mt-5 text-xl font-semibold tracking-tight text-slate-950">Delete this password?</DialogTitle>
					<DialogDescription className="mt-2 text-sm leading-relaxed text-slate-600">This action permanently removes the saved login. You will not be able to recover it later.</DialogDescription>
				</div>
				<div className="px-6 py-5">
					<div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
						<div className="grid size-9 place-items-center rounded-lg bg-white text-red-500 shadow-sm"><Trash2 size={17} /></div>
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold text-slate-900">{deleteTarget?.website ?? "Saved login"}</p>
							<p className="text-xs text-slate-500">Saved password entry</p>
						</div>
					</div>
					<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<DialogClose disabled={submitting} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Keep password</DialogClose>
						<Button type="button" disabled={submitting} className="min-h-10 bg-red-600 px-4 text-white shadow-sm shadow-red-200 transition-all hover:bg-red-700 hover:shadow-md" onClick={() => void deleteEntry()}>{submitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} {submitting ? "Deleting…" : "Delete password"}</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	</>;
}
