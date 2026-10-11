import { Search } from "lucide-react";
import { PasswordTile } from "@/features/passwords/components/password-tile";
import type { PasswordEntry } from "@/features/passwords/types";

export function PasswordList({ entries, view, onSelect, onCopyPassword, onDelete, onToggleFavorite, favoritePending }: {
	entries: PasswordEntry[];
	view: "grid" | "list";
	onSelect: (entry: PasswordEntry) => void;
	onCopyPassword: (entry: PasswordEntry) => Promise<void>;
	onDelete: (entry: PasswordEntry) => void;
	onToggleFavorite: (entry: PasswordEntry) => Promise<void>;
	favoritePending: boolean;
}) {
	if (!entries.length) return <div data-page-palette-preserve className="py-12 text-center"><Search size={24} className="mx-auto mb-3 text-slate-300" /><p className="text-sm font-medium text-slate-700">No passwords found</p><p className="mt-1 text-xs text-slate-400">Try another search or category.</p></div>;
	return <div data-page-palette-preserve className={view === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2"}>{entries.map((entry) => <PasswordTile key={entry.id} entry={entry} layout={view} onClick={() => onSelect(entry)} onCopyPassword={onCopyPassword} onDelete={onDelete} onToggleFavorite={onToggleFavorite} favoritePending={favoritePending} />)}</div>;
}
