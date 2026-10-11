import {
	BriefcaseBusiness,
	ChevronDown,
	Gamepad2,
	Grid2X2,
	Landmark,
	Search,
	ShieldAlert,
	ShieldCheck,
	SlidersHorizontal,
	Star,
	type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { categories, socialMediaIconUrl } from "@/features/passwords/lib/password-utils";
import type { Category } from "@/features/passwords/types";

const filterCategories = categories;
const categoryIcons: Partial<Record<Category, LucideIcon>> = {
	Banking: Landmark,
	Games: Gamepad2,
	Work: BriefcaseBusiness,
};

export function PasswordSearch({ query, onQueryChange, filter, onFilterChange }: { query: string; onQueryChange: (value: string) => void; filter: string; onFilterChange: (value: string) => void }) {
	const customFilterExpanded = filter !== "All" && filter !== "Favorites";
	const selectedCategory = filterCategories.find((category) => category === filter) ?? "";

	return <div className="mb-3 w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-violet-100 bg-white p-3 shadow-sm shadow-violet-950/5 dark:border-slate-700 dark:bg-slate-900">
		<div className="flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
			<div className="w-full min-w-0 shrink-0 xl:w-auto">
				<label className="relative block w-full min-w-0 xl:w-[19rem]">
					<Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
					<Input
						value={query}
						onChange={(event) => onQueryChange(event.target.value)}
						placeholder="Search passwords..."
						aria-label="Search passwords"
						className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-violet-300 focus-visible:ring-2 focus-visible:ring-violet-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
					/>
				</label>
			</div>

			<div className="flex w-full min-w-0 flex-wrap items-center gap-3 xl:min-w-0 xl:flex-1 xl:flex-nowrap">
				<fieldset className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
					<legend className="sr-only">Filter mode</legend>
					{(["All", "Favorites", "Custom"] as const).map((option) => {
						const active = option === "Custom" ? customFilterExpanded : filter === option;
						const ModeIcon = option === "All" ? Grid2X2 : option === "Favorites" ? Star : SlidersHorizontal;
						return <label key={option} className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors focus-within:ring-2 focus-within:ring-violet-400 ${active ? "bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/25" : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"}`}>
							<input
								type="radio"
								name="password-filter-mode"
								value={option}
								checked={active}
								onChange={() => {
									if (option === "All" || option === "Favorites") onFilterChange(option);
									else if (!customFilterExpanded) onFilterChange("Custom");
								}}
								className="sr-only"
							/>
							<ModeIcon size={15} />
							{option}
							{option === "Custom" && <ChevronDown size={13} className={`transition-transform ${customFilterExpanded ? "rotate-180" : ""}`} />}
						</label>;
					})}
				</fieldset>

			</div>
			{customFilterExpanded && <div className="grid w-full min-w-0 basis-full grid-cols-1 gap-3 border-t border-violet-100 pt-3 dark:border-slate-700 md:grid-cols-[max-content_minmax(0,1fr)]">
				<fieldset className="min-w-0 rounded-xl bg-slate-50/70 p-2.5 dark:bg-slate-950/50">
					<legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Password strength</legend>
					<div className="flex flex-wrap items-center gap-1.5">
						{(["Strong", "Weak"] as const).map((strength) => {
							const active = filter === strength;
							const StrengthIcon = strength === "Strong" ? ShieldCheck : ShieldAlert;
							const activeStyle = strength === "Strong"
								? "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
								: "border-rose-200 bg-rose-50 text-rose-800 shadow-sm dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200";
							return <label key={strength} className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-within:ring-2 focus-within:ring-violet-400 ${active ? activeStyle : "border-transparent bg-white text-slate-600 hover:border-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"}`}>
								<input
									type="radio"
									name="password-strength-filter"
									value={strength}
									checked={active}
									onChange={() => onFilterChange(strength)}
									className="sr-only"
								/>
								<StrengthIcon size={14} />
								{strength}
							</label>;
						})}
					</div>
				</fieldset>
				<fieldset className="min-w-0 rounded-xl bg-slate-50/70 p-2.5 dark:bg-slate-950/50">
					<legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Category</legend>
					<div className="flex min-w-0 flex-wrap items-center gap-1.5">
						{filterCategories.map((category) => {
							const CategoryIcon = categoryIcons[category];
							const active = selectedCategory === category;
							return <label key={category} className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-within:ring-2 focus-within:ring-violet-400 ${active ? "border-violet-200 bg-violet-50 text-violet-800 shadow-sm dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-200" : "border-transparent bg-white text-slate-600 hover:border-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"}`}>
								<input
									type="radio"
									name="password-category-filter"
									value={category}
									checked={active}
									onChange={() => onFilterChange(category)}
									className="sr-only"
								/>
								{category === "Social media"
									? <Image src={socialMediaIconUrl} width={96} height={96} alt="" className="size-3.5 shrink-0 object-contain" />
									: CategoryIcon && <CategoryIcon size={14} className={active ? "text-violet-600 dark:text-violet-300" : "text-slate-400 dark:text-slate-400"} />}
								{category}
							</label>;
						})}
					</div>
				</fieldset>
			</div>}
		</div>
	</div>;
}
