import { Baby, Plus } from "lucide-react";
import { BabyNeedItem } from "@/features/baby-needs/components/baby-need-item";
import { Button } from "@/components/ui/button";
import type { BabyNeed } from "@/features/baby-needs/types";

export function BabyNeedsList({ needs, onUpdate, onEdit, onAdd }: { needs: BabyNeed[]; onUpdate: (id: string, update: (item: BabyNeed) => BabyNeed | null) => void; onEdit: (need: BabyNeed) => void; onAdd: () => void }) {
	return <>
		<p className="mb-3 text-xs text-slate-500">{needs.length} saved {needs.length === 1 ? "item" : "items"} · {needs.filter((need) => need.done).length} completed</p>
		<div className="min-h-44 divide-y">
			{needs.map((need) => <BabyNeedItem key={need.id} need={need} onUpdate={onUpdate} onEdit={onEdit} />)}
			{!needs.length && <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center text-slate-400"><Baby size={26} /><p className="text-sm font-medium text-slate-700">Nothing planned for this day</p><p className="text-xs">Add a vaccine or an important date to remember.</p></div>}
		</div>
		<Button type="button" variant="outline" className="mt-3 min-h-11 w-full touch-manipulation border-dashed border-teal-200 bg-teal-50/50 text-teal-700 hover:border-teal-300 hover:bg-teal-50" onClick={onAdd}><Plus size={16} /> Add a baby need</Button>
	</>;
}
