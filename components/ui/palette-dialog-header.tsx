import type { ReactNode } from "react";
import { X } from "lucide-react";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function PaletteDialogHeader({ eyebrow, title, description, icon, closeLabel, closeDisabled = false, tone }: {
	eyebrow: string;
	title: ReactNode;
	description: ReactNode;
	icon: ReactNode;
	closeLabel: string;
	closeDisabled?: boolean;
	tone?: "danger" | "warning";
}) {
	const toneClass = tone ? `palette-dialog-header--${tone}` : "";

	return <div className={`dialog-palette-header palette-dialog-header ${toneClass} flex items-center justify-between gap-4 border-b px-6 py-5`}>
		<div className="flex min-w-0 items-center gap-3.5">
			<span aria-hidden="true" className="palette-dialog-header-icon grid size-12 shrink-0 place-items-center rounded-2xl border">
				{icon}
			</span>
			<div className="min-w-0">
				<p className="mb-0.5 text-[9px] font-bold tracking-[0.16em] text-slate-500 dark:text-slate-400">{eyebrow}</p>
				<DialogTitle className="truncate text-lg font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">{title}</DialogTitle>
				<DialogDescription className="mt-1 text-[13px] text-slate-600 dark:text-slate-300">{description}</DialogDescription>
			</div>
		</div>
		<DialogClose disabled={closeDisabled} aria-label={closeLabel} className="palette-dialog-close grid size-8 shrink-0 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-white/75 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:focus:ring-slate-600">
			<X size={17} />
		</DialogClose>
	</div>;
}
