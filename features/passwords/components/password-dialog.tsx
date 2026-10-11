import type { FormEvent } from "react";
import { KeyRound, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { PasswordEntry } from "@/features/passwords/types";
import { PasswordForm } from "@/features/passwords/components/password-form";

export function PasswordDialog({ entry, onOpenChange, onSubmit, submitting = false }: { entry: PasswordEntry | "new" | null; onOpenChange: (open: boolean) => void; onSubmit: (entry: PasswordEntry) => void; submitting?: boolean }) {
	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const source = entry && entry !== "new" ? entry : null;
		const cryptoApi = globalThis.crypto;
		const id = source?.id ?? (typeof cryptoApi?.randomUUID === "function" ? cryptoApi.randomUUID() : `${Date.now()}-${Math.random()}`);
		onSubmit({ id, website: String(data.get("website")).trim(), url: String(data.get("url")).trim(), category: String(data.get("category")) as PasswordEntry["category"], username: String(data.get("username")).trim(), password: String(data.get("password")), favorite: source?.favorite ?? false });
	}
	return <Dialog open={entry !== null} onOpenChange={onOpenChange}><DialogContent className="max-w-sm overflow-hidden border-violet-200 bg-white p-0 shadow-2xl shadow-violet-950/10 dark:border-violet-900 dark:bg-slate-900 sm:rounded-2xl"><div className="dialog-palette-header flex items-start justify-between border-b border-violet-100 bg-linear-to-r from-violet-50 to-fuchsia-50/60 px-6 py-5 dark:border-violet-900 dark:from-violet-950 dark:to-violet-900"><div className="flex items-start gap-3.5"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-violet-600 to-fuchsia-600 text-white shadow-sm shadow-violet-200"><KeyRound size={18} /></div><div><DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">{entry === "new" ? "Add a password" : "Edit password"}</DialogTitle><DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-300">Keep your login details together.</DialogDescription></div></div><DialogClose aria-label="Close dialog" className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/80 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:hover:bg-slate-700 dark:hover:text-violet-200"><X size={17} /></DialogClose></div>{entry && <div className="px-6 py-5"><PasswordForm key={entry === "new" ? "new" : entry.id} entry={entry} onSubmit={submit} submitting={submitting} /></div>}</DialogContent></Dialog>;
}
