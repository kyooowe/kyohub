import { Eye, EyeOff, ExternalLink, Globe, KeyRound, Pencil, ShieldCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PasswordAvatar } from "@/features/passwords/components/password-avatar";
import { PasswordStrength } from "@/features/passwords/components/password-strength";
import { passwordCategoryStyles } from "@/features/passwords/components/password-tile";
import type { PasswordEntry } from "@/features/passwords/types";

export function PasswordDetailsDialog({ entry, revealed, onOpenChange, onToggleReveal, onEdit, onDelete }: {
	entry: PasswordEntry | null;
	revealed: boolean;
	onOpenChange: (open: boolean) => void;
	onToggleReveal: () => void;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const theme = entry ? passwordCategoryStyles[entry.category] : null;
	const url = entry ? (/^https?:\/\//i.test(entry.url) ? entry.url : `https://${entry.url}`) : "";

	return <Dialog open={entry !== null} onOpenChange={onOpenChange}>
		<DialogContent className="max-w-md overflow-hidden rounded-[24px] border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900">
			{entry && theme && <>
				<header className={`relative isolate overflow-hidden bg-linear-to-r ${theme.bannerStyle} px-5 py-5 sm:px-6`}>
					<div aria-hidden="true" className="absolute -right-8 -top-12 size-40 rounded-full border-[24px] border-white/10" />
					<div aria-hidden="true" className="absolute -bottom-16 right-24 size-32 rounded-full bg-white/10 blur-2xl" />
					<div className="relative flex items-center justify-between gap-4">
						<div className="flex min-w-0 items-center gap-3.5">
							<span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/50 bg-white/90 p-1 shadow-lg shadow-slate-950/10">
								<PasswordAvatar category={entry.category} className="size-full rounded-xl" />
							</span>
							<div className="min-w-0">
								<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">Saved login</p>
								<DialogTitle className="mt-0.5 truncate text-xl font-bold tracking-tight text-white">{entry.website}</DialogTitle>
								<DialogDescription className="mt-1 text-xs font-medium text-white/80">{entry.category}</DialogDescription>
							</div>
						</div>
						<DialogClose aria-label="Close details" className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70">
							<X size={17} />
						</DialogClose>
					</div>
				</header>
				<div className="space-y-5 px-5 py-5 sm:px-6">
					<a href={url} target="_blank" rel="noreferrer" className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 transition-colors hover:border-violet-200 hover:bg-violet-50/60 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-violet-800 dark:hover:bg-violet-950/20">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-violet-600 shadow-sm dark:bg-slate-800 dark:text-violet-300">
							<Globe size={18} />
						</span>
						<span className="min-w-0 flex-1">
							<span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Website</span>
							<span className="mt-0.5 block truncate text-sm font-semibold text-slate-800 group-hover:text-violet-700 dark:text-slate-100 dark:group-hover:text-violet-300">{entry.url}</span>
						</span>
						<ExternalLink size={15} className="shrink-0 text-slate-400 transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-300" />
					</a>
					<div className="space-y-1.5">
						<p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Username or email</p>
						<div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-sm shadow-slate-950/[0.02] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
							<span className="min-w-0 truncate">{entry.username}</span>
						</div>
					</div>
					<div className="space-y-1.5">
						<div className="flex items-center justify-between gap-3">
							<p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password</p>
							<span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500"><KeyRound size={12} /> Private</span>
						</div>
						<div className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm shadow-slate-950/[0.02] dark:border-slate-700 dark:bg-slate-950">
							<p className="min-w-0 truncate font-mono text-sm tracking-wide text-slate-800 dark:text-slate-200">{revealed ? entry.password : "••••••••••"}</p>
							<Button type="button" variant="ghost" size="icon-sm" aria-label={revealed ? "Hide password" : "Reveal password"} onClick={onToggleReveal} className="shrink-0 rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-400 dark:hover:bg-violet-950/40 dark:hover:text-violet-300">{revealed ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
						</div>
					</div>
					<div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 dark:border-slate-700 dark:bg-slate-950/60">
						<ShieldCheck size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
						<span className="shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300">Strength</span>
						<PasswordStrength password={entry.password} />
					</div>
				</div>
				<footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:justify-between sm:px-6">
					<Button type="button" variant="outline" className="border-rose-200 bg-white text-rose-600 shadow-sm hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40" onClick={onDelete}><Trash2 size={15} />Delete</Button>
					<Button type="button" className="bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20 hover:from-violet-700 hover:to-indigo-700" onClick={onEdit}><Pencil size={15} />Edit password</Button>
				</footer>
			</>}
		</DialogContent>
	</Dialog>;
}
