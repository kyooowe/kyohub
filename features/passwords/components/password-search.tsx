import {
	ChevronDown,
	Grid2X2,
	Search,
	ShieldAlert,
	ShieldCheck,
	SlidersHorizontal,
	Star,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Input } from "@/components/ui/input";
import { PasswordAvatar } from "@/features/passwords/components/password-avatar";
import { categories } from "@/features/passwords/lib/password-utils";

const filterCategories = categories;

export function PasswordSearch({ query, onQueryChange, filter, onFilterChange, rowsPerPage, onRowsPerPageChange, paletteAccent }: {
	query: string;
	onQueryChange: (value: string) => void;
	filter: string;
	onFilterChange: (value: string) => void;
	rowsPerPage: number;
	onRowsPerPageChange: (value: number) => void;
	paletteAccent: string;
}) {
	const customFilterExpanded = filter !== "All" && filter !== "Favorites";
	const selectedCategory = filterCategories.find((category) => category === filter) ?? "";

	return <div
		style={{ "--password-accent": paletteAccent } as CSSProperties}
		className="password-library-header relative mb-2 w-full min-w-0 max-w-full overflow-hidden rounded-3xl border p-3 shadow-lg sm:p-4"
	>
		<span aria-hidden="true" className="password-library-orbit pointer-events-none absolute -right-5 -top-10 size-28 rounded-full" />
		<div className="relative z-10 flex w-full min-w-0 flex-wrap items-center gap-2 sm:gap-3">
			<label className="relative order-1 block min-w-0 flex-1 lg:order-1 lg:w-64 lg:flex-initial xl:w-72">
				<Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
				<Input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Search passwords..."
					aria-label="Search passwords"
					className="h-10 rounded-xl border-white/80 bg-white/75 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-violet-300 focus-visible:ring-2 focus-visible:ring-violet-500/15 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 sm:h-11"
				/>
			</label>

			<label className="password-row-count-control order-2 inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold sm:h-11 sm:gap-2 sm:px-3 lg:order-3 lg:ml-auto">
				<span>Rows</span>
				<select
					aria-label="Rows per page"
					value={rowsPerPage}
					onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
					className="password-row-count-select cursor-pointer rounded-md bg-transparent px-1 py-1 text-xs font-semibold outline-none"
				>
					{[6, 9, 12, 18].map((rows) => <option key={rows} value={rows} className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">{rows}</option>)}
				</select>
			</label>

			<fieldset className="password-filter-mode-group order-3 flex w-full basis-full shrink-0 items-center gap-1 rounded-xl border p-1 shadow-sm sm:w-auto sm:basis-auto lg:order-2">
				<legend className="sr-only">Filter mode</legend>
				{(["All", "Favorites", "Custom"] as const).map((option) => {
					const active = option === "Custom" ? customFilterExpanded : filter === option;
					const ModeIcon = option === "All" ? Grid2X2 : option === "Favorites" ? Star : SlidersHorizontal;
					return <label
						key={option}
						className={`password-filter-mode-option flex-1 sm:flex-initial inline-flex h-8 sm:h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-colors focus-within:outline-none sm:gap-2 sm:px-3 ${active ? "password-filter-mode-option--active" : "border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-white"}`}
					>
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
						<ModeIcon size={15} className="shrink-0" />
						<span className="truncate">{option}</span>
						{option === "Custom" && <ChevronDown size={13} className={`shrink-0 transition-transform ${customFilterExpanded ? "rotate-180" : ""}`} />}
					</label>;
				})}
			</fieldset>

			{customFilterExpanded && <div className="order-4 grid w-full min-w-0 basis-full grid-cols-1 gap-3 border-t border-violet-100/60 pt-3 dark:border-slate-800 md:grid-cols-[max-content_minmax(0,1fr)]">
				<fieldset className="password-search-filter-panel min-w-0 rounded-xl border p-2.5">
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
								<StrengthIcon size={14} className="shrink-0" />
								<span>{strength}</span>
							</label>;
						})}
					</div>
				</fieldset>
				<fieldset className="password-search-filter-panel min-w-0 rounded-xl border p-2.5">
					<legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Category</legend>
					<div className="flex min-w-0 flex-wrap items-center gap-1.5">
						{filterCategories.map((category) => {
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
								<PasswordAvatar category={category} className="size-3.5 shrink-0" />
								<span>{category}</span>
							</label>;
						})}
					</div>
				</fieldset>
			</div>}
		</div>
	</div>;
}
