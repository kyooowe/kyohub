import { Search } from "lucide-react";
import { PasswordCard } from "@/features/passwords/components/password-card";
import type { PasswordEntry } from "@/features/passwords/types";

export function PasswordList({ entries, revealed, onToggleReveal, onEdit, onDelete }: { entries: PasswordEntry[]; revealed: string[]; onToggleReveal: (id: string) => void; onEdit: (entry: PasswordEntry) => void; onDelete: (entry: PasswordEntry) => void }) {
	if (!entries.length) return <div className="py-12 text-center"><Search size={24} className="mx-auto mb-3 text-slate-300" /><p className="text-sm font-medium text-slate-700">No passwords found</p><p className="mt-1 text-xs text-slate-400">Try another search or category.</p></div>;
	return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{entries.map((entry) => <PasswordCard key={entry.id} entry={entry} revealed={revealed.includes(entry.id)} onToggleReveal={() => onToggleReveal(entry.id)} onEdit={() => onEdit(entry)} onDelete={() => onDelete(entry)} />)}</div>;
}
