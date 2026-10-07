import { Eye, EyeOff, Globe, Landmark, Gamepad2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordStrength } from "@/features/passwords/components/password-strength";
import type { PasswordEntry } from "@/features/passwords/types";

export function PasswordCard({ entry, revealed, onToggleReveal, onEdit, onDelete }: { entry: PasswordEntry; revealed: boolean; onToggleReveal: () => void; onEdit: () => void; onDelete: () => void }) {
	const Icon = entry.category === "Banking" ? Landmark : entry.category === "Games" ? Gamepad2 : Globe;
	return 	<Card className="group overflow-hidden border-0 bg-linear-to-br from-white via-white to-slate-50 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-slate-100 hover:shadow-xl hover:shadow-slate-400/40">
		<CardContent className="space-y-4 p-4">
			<div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-blue-600 transition-colors group-hover:bg-blue-50"><Icon size={19} /></div><div className="min-w-0 flex-1 pt-0.5"><p className="truncate text-sm font-semibold text-slate-900">{entry.website}</p><a href={`https://${entry.url}`} target="_blank" rel="noreferrer" className="block truncate text-xs text-slate-400 transition-colors hover:text-blue-600">{entry.url}</a></div><div className="flex shrink-0 items-center"><Button type="button" variant="ghost" size="icon-sm" className="text-slate-400 opacity-60 transition-colors hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100" aria-label={`Edit ${entry.website}`} onClick={onEdit}><Pencil size={16} /></Button><Button type="button" variant="ghost" size="icon-sm" className="text-slate-400 opacity-60 transition-colors hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" aria-label={`Delete ${entry.website}`} onClick={onDelete}><Trash2 size={16} /></Button></div></div>
			<div className="flex items-center justify-between gap-2"><span className={`w-fit rounded-md px-2 py-1 text-[10px] font-semibold ${entry.category === "Banking" ? "bg-emerald-50 text-emerald-700" : entry.category === "Games" ? "bg-fuchsia-50 text-fuchsia-700" : entry.category === "Work" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>{entry.category}</span><span className="truncate text-xs text-slate-500">{entry.username}</span></div>
			<div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"><span className="truncate font-mono text-xs text-slate-600">{revealed ? entry.password : "••••••••••••"}</span><Button type="button" variant="ghost" size="icon-xs" onClick={onToggleReveal} aria-label={revealed ? "Hide password" : "Reveal password"}>{revealed ? <EyeOff size={15} /> : <Eye size={15} />}</Button></div>
			<PasswordStrength password={entry.password} />
		</CardContent>
	</Card>;
}
