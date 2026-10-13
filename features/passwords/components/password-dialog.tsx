import type { FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaletteDialogHeader } from "@/components/ui/palette-dialog-header";
import { useAppSettings } from "@/components/settings/settings-context";
import type { PasswordEntry } from "@/features/passwords/types";
import { PasswordForm } from "@/features/passwords/components/password-form";

export function PasswordDialog({ entry, onOpenChange, onSubmit, submitting = false }: { entry: PasswordEntry | "new" | null; onOpenChange: (open: boolean) => void; onSubmit: (entry: PasswordEntry) => void; submitting?: boolean }) {
	const { settings } = useAppSettings();
	const pagePalette = settings.pagePalettes["/passwords"];
	const dialogPalette = pagePalette === "default" ? "violet" : pagePalette;

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const source = entry && entry !== "new" ? entry : null;
		const cryptoApi = globalThis.crypto;
		const id = source?.id ?? (typeof cryptoApi?.randomUUID === "function" ? cryptoApi.randomUUID() : `${Date.now()}-${Math.random()}`);
		onSubmit({ id, website: String(data.get("website")).trim(), url: String(data.get("url")).trim(), category: String(data.get("category")) as PasswordEntry["category"], username: String(data.get("username")).trim(), password: String(data.get("password")), favorite: source?.favorite ?? false });
	}
	return (
		<Dialog open={entry !== null} onOpenChange={onOpenChange}>
			<DialogContent pagePalette={dialogPalette} data-page-palette-surface className="palette-dialog-panel password-dialog-panel max-w-sm overflow-hidden border bg-white p-0 shadow-2xl sm:rounded-3xl">
				<PaletteDialogHeader eyebrow="PASSWORD VAULT" title={entry === "new" ? "Add a password" : "Edit password"} description="Keep your login details together." icon={<KeyRound size={18} strokeWidth={2} />} closeLabel="Close dialog" />
				{entry && <div className="px-6 py-5"><PasswordForm key={entry === "new" ? "new" : entry.id} entry={entry} onSubmit={submit} submitting={submitting} /></div>}
			</DialogContent>
		</Dialog>
	);
}
