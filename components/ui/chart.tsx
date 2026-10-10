"use client";

import type { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "cn";

export function ChartContainer({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div
			data-slot="chart"
			className={cn(
				"w-full aspect-video min-h-[240px] text-xs [&_.recharts-cartesian-axis-tick_text]:fill-slate-400 [&_.recharts-cartesian-grid_line]:stroke-slate-200 [&_.recharts-tooltip-cursor]:stroke-slate-200 dark:[&_.recharts-cartesian-axis-tick_text]:fill-slate-500 dark:[&_.recharts-cartesian-grid_line]:stroke-slate-700 dark:[&_.recharts-tooltip-cursor]:stroke-slate-700 [&_.recharts-surface]:outline-none",
				className,
			)}
		>
			<ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
		</div>
	);
}
