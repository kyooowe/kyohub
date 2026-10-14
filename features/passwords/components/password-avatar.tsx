import { categoryMeta } from "@/features/passwords/lib/password-utils";
import type { Category } from "@/features/passwords/types";

export function PasswordAvatar({
	category,
	className = "",
	variant = "full",
}: {
	category: Category;
	className?: string;
	website?: string;
	url?: string;
	variant?: "full" | "icon-only";
}) {
	const meta = categoryMeta[category] ?? categoryMeta.Other;
	const Icon = meta.icon;

	if (variant === "icon-only") {
		return <Icon className={`${className} ${meta.iconColor}`} strokeWidth={2.2} />;
	}

	return (
		<span
			className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white/70 p-1 shadow-md shadow-slate-900/10 backdrop-blur-md ring-1 ring-black/5 dark:border-white/10 dark:bg-slate-900/70 dark:ring-white/10 ${className}`}
		>
			<span
				className={`relative flex size-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${meta.gradient} ${meta.shadow} text-white shadow-sm ring-1 ring-inset ring-white/35`}
			>
				{/* Glass sheen highlight */}
				<span
					aria-hidden="true"
					className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent opacity-80"
				/>
				<Icon className="relative z-10 size-[54%] text-white drop-shadow-sm transition-transform duration-200 group-hover:scale-110" strokeWidth={2.2} />
			</span>
		</span>
	);
}
