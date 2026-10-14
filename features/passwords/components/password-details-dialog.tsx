import { Eye, EyeOff, ExternalLink, Globe, KeyRound, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { useAppSettings } from "@/components/settings/settings-context";
import { PasswordAvatar } from "@/features/passwords/components/password-avatar";
import { PasswordStrength } from "@/features/passwords/components/password-strength";
import type { PasswordEntry } from "@/features/passwords/types";

export function PasswordDetailsDialog({ entry, revealed, onOpenChange, onToggleReveal, onEdit, onDelete }: {
	entry: PasswordEntry | null;
	revealed: boolean;
	onOpenChange: (open: boolean) => void;
	onToggleReveal: () => void;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const { settings } = useAppSettings();
	const configuredPalette = settings.pagePalettes["/passwords"];
	const dialogPalette = configuredPalette === "default" ? "violet" : configuredPalette;
	const url = entry ? (/^https?:\/\//i.test(entry.url) ? entry.url : `https://${entry.url}`) : "";

	return <Dialog open={entry !== null} onOpenChange={onOpenChange}>
		<DialogContent pagePalette={dialogPalette} data-page-palette-surface className="palette-dialog-panel max-w-md overflow-hidden rounded-[24px] border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900">
			{entry && <>
				<PaletteDialogHeader eyebrow="SAVED LOGIN" title={entry.website} description={entry.category} icon={<PasswordAvatar category={entry.category} website={entry.website} url={entry.url} className="size-11" />} closeLabel="Close details" />
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
					<div className="space-y-2">
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
					<div className="flex min-w-0 items-center gap-2.5 px-3 py-2.5">
						<span className="grid size-8 shrink-0 place-items-center rounded-lg text-violet-700 dark:text-violet-300">
							<ShieldCheck size={16} />
						</span>
						<span className="shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300">Strength</span>
						<PasswordStrength password={entry.password} />
					</div>
				</div>
				</div>
				<footer className="flex flex-row flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50/70 px-3 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
					<Button type="button" variant="outline" className="palette-dialog-footer-button border-rose-200 bg-white text-rose-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 hover:shadow-md active:translate-y-0 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40" onClick={onDelete}><Trash2 size={16} />Delete</Button>
					<Button type="button" variant="ghost" className="palette-action-button palette-dialog-footer-button border font-medium transition-colors duration-150" onClick={onEdit}><Pencil size={16} />Edit password</Button>
				</footer>
			</>}
		</DialogContent>
	</Dialog>;
}
