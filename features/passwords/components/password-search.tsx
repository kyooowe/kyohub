import {
	BriefcaseBusiness,
	ChevronDown,
	Gamepad2,
	Grid2X2,
	Landmark,
	Search,
	SlidersHorizontal,
	UsersRound,
	type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { categories } from "@/features/passwords/lib/password-utils";
import type { Category } from "@/features/passwords/types";

const filterCategories = categories.filter((category) => category !== "Other");
const categoryIcons: Partial<Record<Category, LucideIcon>> = {
	"Social media": UsersRound,
	Banking: Landmark,
	Games: Gamepad2,
	Work: BriefcaseBusiness,
};

export function PasswordSearch({ query, onQueryChange, filter, onFilterChange }: { query: string; onQueryChange: (value: string) => void; filter: string; onFilterChange: (value: string) => void }) {
	const customFilterExpanded = filter !== "All";
	const selectedCategory = filterCategories.find((category) => category === filter) ?? "";

	return <div className="mb-3 w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-violet-100 bg-white p-3 shadow-sm shadow-violet-950/5 dark:border-slate-700 dark:bg-slate-900">
		<div className="flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:items-center">
			<label className="relative block w-full shrink-0 xl:w-[min(100%,19rem)]">
				<Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
				<Input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Search passwords..."
					aria-label="Search passwords"
					className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-violet-300 focus-visible:ring-2 focus-visible:ring-violet-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
				/>
			</label>

			<div className="flex w-full min-w-0 flex-wrap items-center gap-3 xl:w-auto">
				<fieldset className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
					<legend className="sr-only">Filter mode</legend>
					{(["All", "Custom"] as const).map((option) => {
						const active = option === "All" ? !customFilterExpanded : customFilterExpanded;
						const ModeIcon = option === "All" ? Grid2X2 : SlidersHorizontal;
						return <label key={option} className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors focus-within:ring-2 focus-within:ring-violet-400 ${active ? "bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/25" : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"}`}>
							<input
								type="radio"
								name="password-filter-mode"
								value={option}
								checked={active}
								onChange={() => onFilterChange(option === "All" ? "All" : filter === "All" ? "Custom" : filter)}
								className="sr-only"
							/>
							<ModeIcon size={15} />
							{option}
							{option === "Custom" && <ChevronDown size={13} className={`transition-transform ${customFilterExpanded ? "rotate-180" : ""}`} />}
						</label>;
					})}
				</fieldset>

				{customFilterExpanded && <>
					<span aria-hidden="true" className="hidden h-8 w-px shrink-0 bg-slate-200 dark:bg-slate-700 xl:block" />
					<fieldset className="flex w-full min-w-0 basis-full flex-col items-start gap-2 xl:w-auto xl:basis-auto xl:flex-row xl:items-center">
						<legend className="sr-only">Choose a password category</legend>
						<span aria-hidden="true" className="text-xs font-medium text-slate-500 dark:text-slate-400">Category:</span>
						<div className="flex w-full min-w-0 flex-wrap items-center gap-2 xl:w-auto">
							{filterCategories.map((category) => {
								const CategoryIcon = categoryIcons[category];
								const active = selectedCategory === category;
								return <label key={category} className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors focus-within:ring-2 focus-within:ring-violet-400 ${active ? "border-violet-200 bg-violet-50 text-violet-800 shadow-sm dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-200" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-violet-200 hover:bg-violet-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-800 dark:hover:bg-violet-950/40"}`}>
									<input
										type="radio"
										name="password-category-filter"
										value={category}
										checked={active}
										onChange={() => onFilterChange(category)}
										className="sr-only"
									/>
									{CategoryIcon && <CategoryIcon size={15} className={active ? "text-violet-600 dark:text-violet-300" : "text-slate-400 dark:text-slate-400"} />}
									{category}
								</label>;
							})}
						</div>
					</fieldset>
				</>}
			</div>
		</div>
	</div>;
}
