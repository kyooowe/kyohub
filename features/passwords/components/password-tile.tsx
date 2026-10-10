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
	Trash2,
} from "lucide-react";
import { PasswordAvatar } from "@/features/passwords/components/password-avatar";
import { getStrength } from "@/features/passwords/lib/password-utils";
import type { Category, PasswordEntry } from "@/features/passwords/types";

export const passwordCategoryStyles: Record<Category, { avatarStyle: string; bannerStyle: string }> = {
	"Social media": {
		avatarStyle: "text-blue-700 dark:text-blue-300",
		bannerStyle: "from-violet-700 via-purple-600 to-indigo-600",
	},
	Banking: {
		avatarStyle: "text-emerald-700 dark:text-emerald-300",
		bannerStyle: "from-violet-700 via-purple-600 to-indigo-600",
	},
	Games: {
		avatarStyle: "text-fuchsia-700 dark:text-fuchsia-300",
		bannerStyle: "from-violet-700 via-purple-600 to-indigo-600",
	},
	Work: {
		avatarStyle: "text-amber-700 dark:text-amber-300",
		bannerStyle: "from-violet-700 via-purple-600 to-indigo-600",
	},
	Other: {
		avatarStyle: "text-violet-700 dark:text-violet-300",
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
	onClick: () => void;
	onCopyPassword: (entry: PasswordEntry) => Promise<void>;
	onDelete: (entry: PasswordEntry) => void;
};

const categoryVectorPositions: Record<Category, { left: string; right: string }> = {
	"Social media": { left: "left-3 top-10", right: "right-3 bottom-2" },
	Banking: { left: "left-2 bottom-1", right: "right-5 top-8" },
	Games: { left: "left-4 bottom-3", right: "right-2 top-12" },
	Work: { left: "left-1 top-14", right: "right-6 bottom-1" },
	Other: { left: "left-5 top-8", right: "right-2 bottom-5" },
};

function PasswordCategoryVector({ category, mirrored = false }: { category: Category; mirrored?: boolean }) {
	const position = categoryVectorPositions[category][mirrored ? "left" : "right"];

	if (category === "Games") {
		return (
			<span aria-hidden="true" className={`pointer-events-none absolute z-0 flex h-24 w-16 items-center justify-center text-violet-500/15 dark:text-violet-300/15 ${position}`}>
				<Gamepad2 size={42} strokeWidth={1.35} className={mirrored ? "-rotate-12" : "rotate-12"} />
			</span>
		);
	}

	return (
		<svg aria-hidden="true" viewBox="0 0 120 180" preserveAspectRatio="xMidYMid meet" className={`pointer-events-none absolute z-0 h-24 w-16 text-violet-500/15 dark:text-violet-300/15 ${position}`}>
			<g transform={mirrored ? "translate(120 0) scale(-1 1)" : undefined} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
				{category === "Social media" && <>
					<rect x="20" y="25" width="36" height="36" rx="10" />
					<circle cx="38" cy="43" r="8" />
					<circle cx="48" cy="33" r="1.5" fill="currentColor" stroke="none" />
					<path d="M70 70h27a9 9 0 0 1 9 9v8a9 9 0 0 1-9 9H84l-9 7v-7h-5a9 9 0 0 1-9-9v-8a9 9 0 0 1 9-9z" />
					<circle cx="78" cy="83" r="1.5" fill="currentColor" stroke="none" />
					<circle cx="86" cy="83" r="1.5" fill="currentColor" stroke="none" />
					<circle cx="94" cy="83" r="1.5" fill="currentColor" stroke="none" />
					<rect x="25" y="113" width="30" height="25" rx="7" />
					<path d="m37 120 9 5-9 5z" fill="currentColor" stroke="none" />
				</>}
				{category === "Banking" && <>
					<rect x="15" y="26" width="48" height="34" rx="7" />
					<path d="M16 36h46m-37 9h10v8H25zm18 4h11" />
					<circle cx="88" cy="47" r="20" />
					<circle cx="88" cy="47" r="14" />
					<path d="M94 40c-2-3-10-4-12 0-3 5 11 5 9 11-2 5-10 4-13 1m7-17v22" />
					<path d="m15 115 32-17 32 17m-56 4h48m-42 3v20m16-20v20m16-20v20m-46 4h52" />
				</>}
				{category === "Work" && <>
					<path d="M18 87V35h43v52M14 87h51" />
					<path d="M27 45h7m12 0h7m-26 12h7m12 0h7m-26 12h7m12 0h7" />
					<rect x="67" y="77" width="39" height="34" rx="6" />
					<path d="M78 77v-8h17v8m-28 12h39m-23 0v6h7v-6" />
					<rect x="20" y="113" width="35" height="31" rx="5" />
					<path d="M27 122h20m-20 7h11m3 7 4 4 8-9" />
				</>}
				{category === "Other" && <>
					<circle cx="60" cy="70" r="31" />
					<circle cx="60" cy="70" r="18" strokeDasharray="2 6" />
					<path d="M22 130c18-20 58-20 76 0" />
				</>}
			</g>
		</svg>
	);
}

export function PasswordTile({ entry, onClick, onCopyPassword, onDelete }: PasswordTileProps) {
	const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");
	const theme = passwordCategoryStyles[entry.category];
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

	return (
		<article className="group relative flex min-h-[380px] w-full flex-col overflow-hidden rounded-[26px] border border-blue-100 bg-white shadow-lg shadow-blue-200/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-300/50 focus-within:ring-2 focus-within:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30 dark:hover:shadow-black/50">
			<div className={`relative flex h-[144px] w-full shrink-0 items-start justify-between overflow-visible bg-linear-to-r px-4 pt-4 ${theme.bannerStyle}`}>
				<svg aria-hidden="true" viewBox="0 0 420 144" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 size-full overflow-hidden">
					<circle cx="303" cy="116" r="54" fill="none" stroke="white" strokeDasharray="3 8" strokeOpacity=".2" strokeWidth="1.5" />
					<path d="M205 151c24-31 45-48 71-51 23-3 38 8 57 3" fill="none" stroke="white" strokeLinecap="round" strokeOpacity=".18" strokeWidth="1.5" />
					<path d="m97 75 4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="white" fillOpacity=".5" />
					<circle cx="281" cy="37" r="2" fill="white" fillOpacity=".65" />
					<circle cx="315" cy="67" r="1.5" fill="white" fillOpacity=".5" />
				</svg>
				<span className="relative z-10 flex items-center gap-1.5">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-blue-950/15 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
						<CategoryIcon size={14} />
						{entry.category}
					</span>
					<span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold shadow-sm ${isSecure ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
						<SecurityIcon size={12} />
						{isSecure ? "Secure" : "Review"}
					</span>
				</span>
				{websiteUrl && (
					<a
						href={websiteUrl}
						target="_blank"
						rel="noreferrer"
						aria-label={`Open ${entry.website} website in a new tab`}
						className="relative z-10 grid size-8 place-items-center rounded-lg border border-white/25 bg-white/15 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
					>
						<ExternalLink size={15} />
					</a>
				)}
				<button
					type="button"
					onClick={onClick}
					aria-label={`View ${entry.website} password details`}
					className={`absolute left-1/2 top-[60px] z-20 grid size-[144px] -translate-x-1/2 place-items-center overflow-hidden rounded-full border-[5px] border-white bg-white p-0 shadow-xl shadow-blue-950/25 ring-2 ring-white/70 transition-transform duration-200 group-hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 dark:border-slate-900 dark:bg-slate-900 dark:ring-slate-700 ${theme.avatarStyle}`}
				>
					<PasswordAvatar category={entry.category} className="size-[134px]" />
				</button>
			</div>
			<button
				type="button"
				onClick={onClick}
				aria-label={`View ${entry.website} password details`}
				className="relative isolate flex w-full flex-1 flex-col items-center bg-white px-4 pb-3 pt-[64px] text-center focus-visible:outline-none dark:bg-slate-950"
			>
				<PasswordCategoryVector category={entry.category} mirrored />
				<PasswordCategoryVector category={entry.category} />
				<span className="relative z-10 max-w-full truncate text-xl font-bold tracking-tight text-slate-950 dark:text-slate-100">{entry.website}</span>
				<span className="relative z-10 mt-1 max-w-full truncate text-base font-medium text-slate-500 dark:text-slate-400">{entry.username}</span>
			</button>
			<div className="mx-3 mb-3 flex min-h-[62px] items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-2.5 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950">
				<span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
					<Globe size={17} />
				</span>
				<span className="min-w-0 flex-1 text-left">
					<span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Website</span>
					<span className="block truncate text-[11px] font-semibold text-slate-900 dark:text-slate-100">{entry.url}</span>
				</span>
				<span aria-hidden="true" className="mx-0.5 h-8 w-px shrink-0 bg-blue-200 dark:bg-slate-700" />
				<div className="flex shrink-0 items-center gap-1.5">
					<button
						type="button"
						onClick={() => void handleCopyPassword()}
						disabled={copyStatus === "copying"}
						aria-label={copyStatus === "copied" ? "Password copied" : copyStatus === "failed" ? "Password copy failed" : copyStatus === "copying" ? "Copying password" : "Copy password"}
						title={copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy password"}
						className={`grid size-9 place-items-center rounded-full bg-slate-100 shadow-sm transition-colors hover:bg-blue-100 disabled:opacity-60 dark:bg-slate-800 dark:hover:bg-slate-700 ${copyStatus === "copied" ? "text-emerald-600 dark:text-emerald-300" : copyStatus === "failed" ? "text-rose-600 dark:text-rose-300" : "text-slate-500 dark:text-slate-300"}`}
					>
						{copyStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}
					</button>
					<button
						type="button"
						onClick={() => onDelete(entry)}
						aria-label={`Delete ${entry.website} password`}
						title="Delete password"
						className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
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
