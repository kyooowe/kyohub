import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/features/passwords/lib/password-utils";

export function PasswordSearch({ query, onQueryChange, filter, onFilterChange }: { query: string; onQueryChange: (value: string) => void; filter: string; onFilterChange: (value: string) => void }) {
	return <div className="mb-4">
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<label className="relative block w-full max-w-sm"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search passwords..." aria-label="Search passwords" className="h-9 border-slate-200 bg-white pl-9 text-sm text-slate-900 shadow-sm shadow-slate-200/40 placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/10" /></label>
			<div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5">{["All", ...categories].map((category) => {
				const active = filter === category;
				return <Button key={category} type="button" size="sm" variant="outline" className={active ? "h-8 border-violet-200 bg-white px-3 text-xs font-semibold text-violet-700 shadow-sm shadow-violet-200/70 hover:bg-white hover:text-violet-800" : "h-8 border-transparent bg-white/75 px-3 text-xs font-medium text-slate-600 shadow-none hover:border-slate-200 hover:bg-white hover:text-violet-700"} onClick={() => onFilterChange(category)}>{category}</Button>;
			})}</div>
		</div>
	</div>;
}
