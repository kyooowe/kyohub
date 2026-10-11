"use client";

import { useState } from "react";
import {
	BriefcaseBusiness,
	Check,
	Copy,
	ExternalLink,
	Gamepad2,
	Globe,
	Landmark,
	ShieldAlert,
	ShieldCheck,
	Star,
	Trash2,
} from "lucide-react";
import { PasswordAvatar } from "@/features/passwords/components/password-avatar";
import { getStrength } from "@/features/passwords/lib/password-utils";
import type { Category, PasswordEntry } from "@/features/passwords/types";

export const passwordCategoryStyles: Record<Category, { bannerStyle: string }> = {
	"Social media": {
		bannerStyle: "from-violet-700 via-purple-600 to-indigo-600",
	},
	Banking: {
		bannerStyle: "from-violet-700 via-purple-600 to-indigo-600",
	},
	Games: {
		bannerStyle: "from-violet-700 via-purple-600 to-indigo-600",
	},
	Work: {
		bannerStyle: "from-violet-700 via-purple-600 to-indigo-600",
	},
	Other: {
		bannerStyle: "from-violet-700 via-purple-600 to-indigo-600",
	},
};

const categoryIcons = {
	"Social media": Globe,
	Banking: Landmark,
	Games: Gamepad2,
	Work: BriefcaseBusiness,
	Other: Globe,
};

type PasswordTileProps = {
	entry: PasswordEntry;
	layout: "grid" | "list";
	onClick: () => void;
	onCopyPassword: (entry: PasswordEntry) => Promise<void>;
	onDelete: (entry: PasswordEntry) => void;
	onToggleFavorite: (entry: PasswordEntry) => Promise<void>;
	favoritePending: boolean;
};

export function PasswordTile({ entry, layout, onClick, onCopyPassword, onDelete, onToggleFavorite, favoritePending }: PasswordTileProps) {
	const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
	const CategoryIcon = categoryIcons[entry.category];
	const isSecure = getStrength(entry.password).score >= 4;
	const SecurityIcon = isSecure ? ShieldCheck : ShieldAlert;
	const websiteUrl = entry.url ? (/^https?:\/\//i.test(entry.url) ? entry.url : `https://${entry.url}`) : null;

	async function handleCopyPassword() {
		setCopyStatus("copying");
		try {
			await onCopyPassword(entry);
			setCopyStatus("copied");
		} catch {
			setCopyStatus("failed");
		}
	}

	if (layout === "list") {
		return (
			<article className="group relative flex min-h-[62px] min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm shadow-slate-900/5 transition-colors hover:border-violet-200 hover:bg-violet-50/30 focus-within:ring-2 focus-within:ring-violet-500/30 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900/70 sm:gap-4 sm:px-4">
				<button
					type="button"
					onClick={onClick}
					aria-label={`View ${entry.website} password details`}
					className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
				>
					<PasswordAvatar category={entry.category} website={entry.website} url={entry.url} className="size-full" />
				</button>
				<button
					type="button"
					onClick={onClick}
					aria-label={`View ${entry.website} password details`}
					className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
				>
					<span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.website}</span>
					<span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{entry.username || entry.url}</span>
				</button>
				<div className="flex shrink-0 items-center gap-1">
					{websiteUrl && (
						<a
							href={websiteUrl}
							target="_blank"
							rel="noreferrer"
							aria-label={`Open ${entry.website} website in a new tab`}
							title="Open website"
							className="grid size-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
						>
							<ExternalLink size={16} />
						</a>
					)}
					<button
						type="button"
						onClick={() => void onToggleFavorite(entry)}
						disabled={favoritePending}
						aria-label={entry.favorite ? `Remove ${entry.website} from favorites` : `Add ${entry.website} to favorites`}
						aria-pressed={entry.favorite}
						title={entry.favorite ? "Remove from favorites" : "Add to favorites"}
						className={`grid size-9 place-items-center rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:focus-visible:ring-violet-300 ${entry.favorite ? "bg-amber-100/80 text-amber-600 hover:bg-amber-100 dark:bg-amber-300/15 dark:text-amber-300 dark:hover:bg-amber-300/25" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}
					>
						<Star size={16} fill={entry.favorite ? "currentColor" : "none"} />
					</button>
					<button
						type="button"
						onClick={() => void handleCopyPassword()}
						disabled={copyStatus === "copying"}
						aria-label={copyStatus === "copied" ? "Password copied" : copyStatus === "failed" ? "Password copy failed" : copyStatus === "copying" ? "Copying password" : "Copy password"}
						title={copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy password"}
						className={`grid size-9 place-items-center rounded-full transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${copyStatus === "copied" ? "text-emerald-600 dark:text-emerald-300" : copyStatus === "failed" ? "text-rose-600 dark:text-rose-300" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}
					>
						{copyStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}
					</button>
					<button
						type="button"
						onClick={() => onDelete(entry)}
						aria-label={`Delete ${entry.website} password`}
						title="Delete password"
						className="grid size-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
					>
						<Trash2 size={16} />
					</button>
				</div>
				<span className="sr-only" aria-live="polite">
					{copyStatus === "copied" ? "Password copied to clipboard." : copyStatus === "failed" ? "Password could not be copied." : ""}
				</span>
			</article>
		);
	}

	return (
		<article className="group relative flex min-h-[390px] w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10 focus-within:ring-2 focus-within:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30 dark:hover:shadow-black/50">
			<div className="relative flex h-[160px] w-full shrink-0 items-start justify-end overflow-visible bg-linear-to-b from-sky-200 via-orange-100 to-amber-100 px-4 pt-4 dark:from-slate-950 dark:via-slate-900 dark:to-stone-900">
				<span aria-hidden="true" className="pointer-events-none absolute -bottom-7 left-1/2 h-20 w-3/4 -translate-x-1/2 rounded-full bg-amber-400/30 blur-2xl dark:bg-amber-500/20" />
				<svg aria-hidden="true" viewBox="0 0 420 160" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 size-full overflow-hidden">
					<path d="M0 132h420" fill="none" stroke="#d6a15e" strokeOpacity=".55" strokeWidth="1" />
					<path d="m0 144 57-19 26 7 31-22 23 15 31-21 22 17 28-19 30 23 25-14 29 18 37-26 29 19 22-16 30 12v42H0z" fill="#a6bdc7" className="dark:fill-[#111820]" />
					<path d="m0 151 65-18 35 8 44-13 30 12 48-14 34 16 35-12 37 13 43-18 49 13v22H0z" fill="#dbeafe" className="dark:fill-[#080b10]" />
				</svg>
				<div className="relative z-10 inline-flex items-center gap-0.5 rounded-full border border-white/60 bg-white/45 p-1 shadow-sm shadow-slate-900/5 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/35 dark:shadow-black/20">
					{websiteUrl && (
						<a
							href={websiteUrl}
							target="_blank"
							rel="noreferrer"
							aria-label={`Open ${entry.website} website in a new tab`}
							className="grid size-8 place-items-center rounded-full text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-violet-300"
						>
							<ExternalLink size={15} />
						</a>
					)}
					<button
						type="button"
						onClick={() => void onToggleFavorite(entry)}
						disabled={favoritePending}
						aria-label={entry.favorite ? `Remove ${entry.website} from favorites` : `Add ${entry.website} to favorites`}
						aria-pressed={entry.favorite}
						title={entry.favorite ? "Remove from favorites" : "Add to favorites"}
						className={`grid size-8 place-items-center rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:focus-visible:ring-violet-300 ${entry.favorite ? "bg-amber-100/80 text-amber-600 hover:bg-amber-100 dark:bg-amber-300/15 dark:text-amber-300 dark:hover:bg-amber-300/25" : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
					>
						<Star size={15} fill={entry.favorite ? "currentColor" : "none"} />
					</button>
				</div>
				<button
					type="button"
					onClick={onClick}
					aria-label={`View ${entry.website} password details`}
					className="absolute left-1/2 top-[124px] z-20 grid size-[72px] -translate-x-1/2 place-items-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-transform duration-200 group-hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
				>
					<PasswordAvatar category={entry.category} website={entry.website} url={entry.url} className="size-full" />
				</button>
			</div>
			<button
				type="button"
				onClick={onClick}
				aria-label={`View ${entry.website} password details`}
				className="relative isolate flex w-full flex-1 flex-col items-center bg-[linear-gradient(180deg,_#dbeafe_0%,_#eff6ff_28%,_#ffffff_62%)] px-4 pb-4 pt-[48px] text-center focus-visible:outline-none dark:bg-[linear-gradient(180deg,_#080b10_0%,_#0b101b_38%,_#020617_78%)]"
			>
				<span className="relative z-10 max-w-full truncate text-xl font-bold tracking-tight text-slate-950 dark:text-slate-100">{entry.website}</span>
				<span className="relative z-10 mt-1 max-w-full truncate text-sm font-medium text-slate-500 dark:text-slate-400">{entry.username}</span>
				<span className="relative z-10 mt-3 flex items-center justify-center gap-2">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
						<CategoryIcon size={12} />
						{entry.category}
					</span>
					<span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${isSecure ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"}`}>
						<SecurityIcon size={12} />
						{isSecure ? "Secure" : "Review"}
					</span>
				</span>
			</button>
			<div className="mx-3 mb-3 flex min-h-[60px] items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
				<span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
					<Globe size={17} />
				</span>
				<span className="min-w-0 flex-1 text-left">
					<span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Website</span>
					<span className="block truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{entry.url}</span>
				</span>
				<span aria-hidden="true" className="mx-0.5 h-8 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />
				<div className="flex shrink-0 items-center gap-1.5">
					<button
						type="button"
						onClick={() => void handleCopyPassword()}
						disabled={copyStatus === "copying"}
						aria-label={copyStatus === "copied" ? "Password copied" : copyStatus === "failed" ? "Password copy failed" : copyStatus === "copying" ? "Copying password" : "Copy password"}
						title={copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy password"}
						className={`grid size-9 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 ${copyStatus === "copied" ? "text-emerald-600 dark:text-emerald-300" : copyStatus === "failed" ? "text-rose-600 dark:text-rose-300" : "text-slate-500 dark:text-slate-300"}`}
					>
						{copyStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}
					</button>
					<button
						type="button"
						onClick={() => onDelete(entry)}
						aria-label={`Delete ${entry.website} password`}
						title="Delete password"
						className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
					>
						<Trash2 size={16} />
					</button>
				</div>
				<span className="sr-only" aria-live="polite">
					{copyStatus === "copied" ? "Password copied to clipboard." : copyStatus === "failed" ? "Password could not be copied." : ""}
				</span>
			</div>
		</article>
	);
}
