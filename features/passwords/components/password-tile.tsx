"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
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
	type LucideIcon,
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

const categoryIcons: Partial<Record<Category, LucideIcon>> = {
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
	paletteAccent: string;
};

export function PasswordTile({ entry, layout, onClick, onCopyPassword, onDelete, onToggleFavorite, favoritePending, paletteAccent }: PasswordTileProps) {
	const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
	const CategoryIcon = categoryIcons[entry.category];
	const isSecure = getStrength(entry.password).score >= 4;
	const SecurityIcon = isSecure ? ShieldCheck : ShieldAlert;
	const websiteUrl = entry.url ? (/^https?:\/\//i.test(entry.url) ? entry.url : `https://${entry.url}`) : null;
	const paletteStyle = { "--password-accent": paletteAccent } as CSSProperties;

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
			<article style={paletteStyle} className="password-entry-card password-entry-card--list group relative flex min-h-[72px] min-w-0 items-center gap-3 overflow-hidden rounded-3xl border px-3 py-3 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/30 sm:gap-4 sm:px-4">
				<button
					type="button"
					onClick={onClick}
					aria-label={`View ${entry.website} password details`}
					className="relative z-10 grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
				>
					<PasswordAvatar category={entry.category} website={entry.website} url={entry.url} className="size-full" />
				</button>
				<button
					type="button"
					onClick={onClick}
					aria-label={`View ${entry.website} password details`}
					className="relative z-10 min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
				>
					<span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.website}</span>
					<span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{entry.username || entry.url}</span>
				</button>
				<div className="relative z-10 flex shrink-0 items-center gap-1">
					{websiteUrl && (
						<a
							href={websiteUrl}
							target="_blank"
							rel="noreferrer"
							aria-label={`Open ${entry.website} website in a new tab`}
							title="Open website"
							className="password-tile-control password-tile-control--quiet grid size-10 place-items-center rounded-full"
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
						className={`password-tile-control password-tile-control--quiet grid size-10 place-items-center rounded-full disabled:cursor-wait disabled:opacity-60 ${entry.favorite ? "password-tile-control--favorite-active" : ""}`}
					>
						<Star size={16} fill={entry.favorite ? "currentColor" : "none"} />
					</button>
					<button
						type="button"
						onClick={() => void handleCopyPassword()}
						disabled={copyStatus === "copying"}
						aria-label={copyStatus === "copied" ? "Password copied" : copyStatus === "failed" ? "Password copy failed" : copyStatus === "copying" ? "Copying password" : "Copy password"}
						title={copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy password"}
						data-state={copyStatus}
						className="password-tile-control password-tile-control--quiet grid size-10 place-items-center rounded-full disabled:opacity-60"
					>
						{copyStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}
					</button>
					<button
						type="button"
						onClick={() => onDelete(entry)}
						aria-label={`Delete ${entry.website} password`}
						title="Delete password"
						className="password-tile-control password-tile-control--quiet password-tile-control--delete grid size-10 place-items-center rounded-full"
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
		<article style={paletteStyle} className="password-entry-card group relative flex min-h-[304px] w-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10 focus-within:ring-2 focus-within:ring-blue-500 dark:shadow-black/30 dark:hover:shadow-black/50">
			<div className="password-tile-banner relative flex h-24 w-full shrink-0 items-center justify-between overflow-hidden px-4">
				<span aria-hidden="true" className="pointer-events-none absolute -right-4 -top-7 size-24 rounded-full border-[12px] border-white/25" />
				<button
					type="button"
					onClick={onClick}
					aria-label={`View ${entry.website} password details`}
					className="relative z-10 grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border-[3px] border-white bg-white p-0 shadow-md shadow-slate-900/10 transition-transform duration-200 group-hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
				>
					<PasswordAvatar category={entry.category} website={entry.website} url={entry.url} className="size-full" />
				</button>
				<div className="relative z-10 inline-flex items-center gap-0.5 rounded-full border border-white/80 bg-white/75 p-1 shadow-sm shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/40 dark:shadow-black/20">
					{websiteUrl && (
						<a
							href={websiteUrl}
							target="_blank"
							rel="noreferrer"
							aria-label={`Open ${entry.website} website in a new tab`}
							className="password-tile-control password-tile-control--quiet grid size-9 place-items-center rounded-full"
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
						className={`password-tile-control password-tile-control--quiet grid size-9 place-items-center rounded-full disabled:cursor-wait disabled:opacity-60 ${entry.favorite ? "password-tile-control--favorite-active" : ""}`}
					>
						<Star size={15} fill={entry.favorite ? "currentColor" : "none"} />
					</button>
				</div>
			</div>
			<div className="password-tile-body relative flex flex-1 flex-col overflow-hidden px-4 pb-3 pt-3">
				<svg aria-hidden="true" viewBox="0 0 100 100" className="password-tile-body-art pointer-events-none absolute right-[3.25rem] top-5 z-0 size-20">
					<circle cx="22" cy="24" r="15" fill="currentColor" fillOpacity=".12" stroke="white" strokeOpacity=".7" strokeWidth="1.5" />
					<circle cx="22" cy="24" r="12" fill="none" stroke="currentColor" strokeOpacity=".28" strokeWidth=".75" />
					<path d="M12 23a11 11 0 0 1 16-9" fill="none" stroke="white" strokeLinecap="round" strokeOpacity=".9" strokeWidth="2" />
					<circle cx="69" cy="30" r="21" fill="currentColor" fillOpacity=".1" stroke="white" strokeOpacity=".68" strokeWidth="1.5" />
					<circle cx="69" cy="30" r="17" fill="none" stroke="currentColor" strokeOpacity=".24" strokeWidth=".8" />
					<path d="M54 28a16 16 0 0 1 24-14" fill="none" stroke="white" strokeLinecap="round" strokeOpacity=".9" strokeWidth="2.2" />
					<circle cx="35" cy="66" r="28" fill="currentColor" fillOpacity=".11" stroke="white" strokeOpacity=".7" strokeWidth="1.6" />
					<circle cx="35" cy="66" r="23" fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth=".8" />
					<path d="M14 63a22 22 0 0 1 34-17" fill="none" stroke="white" strokeLinecap="round" strokeOpacity=".9" strokeWidth="2.5" />
					<circle cx="84" cy="61" r="11" fill="currentColor" fillOpacity=".13" stroke="white" strokeOpacity=".68" strokeWidth="1.4" />
					<path d="M77 59a8 8 0 0 1 12-5" fill="none" stroke="white" strokeLinecap="round" strokeOpacity=".9" strokeWidth="1.7" />
				</svg>
				<button
					type="button"
					onClick={onClick}
					aria-label={`View ${entry.website} password details`}
					className="relative z-10 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
				>
					<span className="block truncate text-lg font-bold tracking-tight text-slate-950 dark:text-slate-100">{entry.website}</span>
					<span className="mt-0.5 block truncate text-sm font-medium text-slate-500 dark:text-slate-400">{entry.username || "View account details"}</span>
				</button>
				<div className="relative z-10 mt-3 flex flex-wrap items-center gap-1.5">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
						{CategoryIcon && <CategoryIcon size={12} />}
						{entry.category}
					</span>
					<span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${isSecure ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"}`}>
						<SecurityIcon size={12} />
						{isSecure ? "Secure" : "Review"}
					</span>
				</div>
				<div className="password-tile-footer mt-auto flex min-h-16 items-center gap-2.5 rounded-2xl border px-2.5 py-2.5">
					<span className="password-tile-site-icon grid size-10 shrink-0 place-items-center rounded-xl border shadow-sm">
						<Globe size={17} />
					</span>
					<span className="min-w-0 flex-1 text-left">
						<span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Website</span>
						<span className="mt-0.5 block truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">{entry.url || "No website added"}</span>
					</span>
					<span aria-hidden="true" className="password-tile-footer-divider mx-0.5 h-8 w-px shrink-0" />
					<div className="flex shrink-0 items-center gap-1.5">
						<button
							type="button"
							onClick={() => void handleCopyPassword()}
							disabled={copyStatus === "copying"}
							aria-label={copyStatus === "copied" ? "Password copied" : copyStatus === "failed" ? "Password copy failed" : copyStatus === "copying" ? "Copying password" : "Copy password"}
							title={copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy password"}
							data-state={copyStatus}
							className="password-tile-control password-tile-control--outlined grid size-9 place-items-center rounded-xl disabled:opacity-60"
						>
							{copyStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}
						</button>
						<button
							type="button"
							onClick={() => onDelete(entry)}
							aria-label={`Delete ${entry.website} password`}
							title="Delete password"
							className="password-tile-control password-tile-control--outlined password-tile-control--delete grid size-9 place-items-center rounded-xl"
						>
							<Trash2 size={16} />
						</button>
					</div>
				</div>
				<span className="sr-only" aria-live="polite">
					{copyStatus === "copied" ? "Password copied to clipboard." : copyStatus === "failed" ? "Password could not be copied." : ""}
				</span>
			</div>
		</article>
	);
}
