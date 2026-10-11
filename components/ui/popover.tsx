"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "cn";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverClose = PopoverPrimitive.Close;

type PopoverContentProps = PopoverPrimitive.Positioner.Props & {
	className?: string;
	children: React.ReactNode;
};

function PopoverContent({ className, children, side = "bottom", sideOffset = 6, align = "center", ...props }: PopoverContentProps) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Positioner side={side} sideOffset={sideOffset} align={align} className="z-[60]" {...props}>
				<PopoverPrimitive.Popup className={cn("min-w-40 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-xl shadow-slate-950/15 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100", className)}>
					{children}
				</PopoverPrimitive.Popup>
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverClose, PopoverContent, PopoverTrigger };
