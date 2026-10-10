import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

const themes = {
	rose: {
		gradient: "from-rose-800 via-rose-700 to-orange-700",
		shadow: "shadow-rose-300/30",
		darkShadow: "dark:shadow-rose-950/60",
		description: "text-rose-100/85",
		glow: "bg-orange-200/15",
	},
	blue: {
		gradient: "from-blue-800 via-indigo-800 to-violet-800",
		shadow: "shadow-blue-300/30",
		darkShadow: "dark:shadow-blue-950/60",
		description: "text-blue-100/85",
		glow: "bg-violet-200/15",
	},
	teal: {
		gradient: "from-teal-800 via-teal-700 to-cyan-700",
		shadow: "shadow-teal-300/30",
		darkShadow: "dark:shadow-teal-950/60",
		description: "text-teal-100/85",
		glow: "bg-cyan-200/15",
	},
} as const;

export function FeatureSectionHeader({ icon: Icon, title, description, children, theme, mobileRow = false }: {
	icon: LucideIcon;
	title: string;
	description: string;
	children?: ReactNode;
	theme: keyof typeof themes;
	mobileRow?: boolean;
}) {
	const colors = themes[theme];

	return <div className={`relative isolate overflow-hidden rounded-2xl bg-linear-to-r ${colors.gradient} px-4 py-4 text-white shadow-lg ${colors.shadow} ${colors.darkShadow} sm:px-5 sm:py-5`}>
		<div className="pointer-events-none absolute -right-8 -top-14 size-40 rounded-full border-20 border-white/5" />
		<div className={`pointer-events-none absolute right-20 -top-16 size-36 rounded-full ${colors.glow} blur-2xl`} />
		<div className={`relative flex ${mobileRow ? "flex-row items-center justify-between gap-2" : "flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"}`}>
			<div className={`flex min-w-0 items-center ${mobileRow ? "gap-2.5" : "gap-3.5"}`}>
				<span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 sm:size-11"><Icon size={20} /></span>
				<div className="min-w-0">
					<h2 className={`text-base font-semibold tracking-tight text-white sm:text-lg ${mobileRow ? "truncate" : ""}`}>{title}</h2>
					<p className={`mt-1 text-xs ${colors.description} ${mobileRow ? "truncate" : ""}`}>{description}</p>
				</div>
			</div>
			{children && <div className={`relative ${mobileRow ? "w-auto shrink-0" : "w-full sm:w-auto"}`}>{children}</div>}
		</div>
	</div>;
}
