import { Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BabyNeed } from "@/features/baby-needs/types";

export function BabyNeedItem({ need, onUpdate, onEdit }: { need: BabyNeed; onUpdate: (id: string, update: (item: BabyNeed) => BabyNeed | null) => void; onEdit: (need: BabyNeed) => void }) {
	return <div className="flex min-h-14 items-center gap-3 border-b border-slate-100 py-2">
		<button type="button" aria-label={need.done ? `Mark ${need.title} incomplete` : `Mark ${need.title} complete`} onClick={() => onUpdate(need.id, (item) => ({ ...item, done: !item.done }))} className={`grid size-5 shrink-0 place-items-center rounded border ${need.done ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300 hover:border-teal-500"}`}>{need.done && <Check size={13} />}</button>
		<div className="min-w-0 flex-1"><p className={`truncate text-sm font-medium ${need.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{need.title}</p><p className="text-xs text-slate-500">{need.type}{need.notes ? ` · ${need.notes}` : ""}</p></div>
		<Button type="button" variant="ghost" size="icon-xs" aria-label={`Edit ${need.title}`} onClick={() => onEdit(need)}><Pencil size={14} /></Button>
		<Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${need.title}`} onClick={() => onUpdate(need.id, () => null)}><Trash2 size={14} /></Button>
	</div>;
}
